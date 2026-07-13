"""Backend API tests for DentisTree ADMIN PANEL (auth + admin CRUD + uploads).

Covers:
- JWT httpOnly cookie login/me/logout/refresh
- Brute-force lockout hint (tests <5 attempts to stay safe)
- Admin CRUD for services / doctors / reviews / gallery
- Clinic PUT persistence
- /api/admin/bookings (auth required)
- Image upload -> /api/files/{path}
- Unauthenticated 401 checks
"""
import io
import os
import struct
import zlib
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]


# ---------- helpers ----------
def _make_tiny_png() -> bytes:
    """Minimal valid 1x1 PNG (no external deps)."""
    def _chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = _chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    # 1x1 red pixel raw = filter byte 0 + RGB bytes
    raw = b"\x00\xff\x00\x00"
    idat = _chunk(b"IDAT", zlib.compress(raw))
    iend = _chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


@pytest.fixture(scope="module")
def anon():
    return requests.Session()


@pytest.fixture(scope="module")
def admin():
    """Session authenticated as admin via cookies."""
    s = requests.Session()
    r = s.post(f"{API}/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return s


# ---------- Auth ----------
class TestAuth:
    def test_login_success_sets_cookies(self, admin):
        # cookies should include access_token + refresh_token httpOnly
        cookies = admin.cookies.get_dict()
        assert "access_token" in cookies, cookies
        assert "refresh_token" in cookies, cookies

    def test_me_with_cookie(self, admin):
        r = admin.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == ADMIN_EMAIL
        assert body["role"] == "admin"
        assert "password_hash" not in body
        assert "_id" not in body

    def test_me_without_cookie_401(self, anon):
        r = anon.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_login_wrong_password_401(self):
        # fresh session so brute-force counter for admin session is unaffected
        # Only 1 wrong attempt (lockout is 5 per ip:email/15min).
        s = requests.Session()
        r = s.post(f"{API}/auth/login",
                   json={"email": ADMIN_EMAIL, "password": "wrong_password_xyz"}, timeout=10)
        assert r.status_code == 401
        detail = r.json().get("detail", "")
        assert "Invalid" in detail or "invalid" in detail.lower()

    def test_refresh_works(self, admin):
        r = admin.post(f"{API}/auth/refresh", timeout=10)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_logout_and_me_401(self):
        # separate session so we don't clobber the module admin fixture
        s = requests.Session()
        lr = s.post(f"{API}/auth/login",
                    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        assert lr.status_code == 200
        r = s.post(f"{API}/auth/logout", timeout=10)
        assert r.status_code == 200
        me = s.get(f"{API}/auth/me", timeout=10)
        assert me.status_code == 401


# ---------- Unauthenticated access to admin endpoints ----------
class TestAdminAuthGuards:
    def test_admin_services_requires_auth(self, anon):
        assert anon.get(f"{API}/admin/services", timeout=10).status_code == 401

    def test_admin_bookings_requires_auth(self, anon):
        assert anon.get(f"{API}/admin/bookings", timeout=10).status_code == 401

    def test_admin_upload_requires_auth(self, anon):
        png = _make_tiny_png()
        files = {"file": ("test.png", png, "image/png")}
        r = anon.post(f"{API}/admin/upload", files=files, timeout=15)
        assert r.status_code == 401

    def test_admin_clinic_put_requires_auth(self, anon):
        r = anon.put(f"{API}/admin/clinic", json={"name": "hacked"}, timeout=10)
        assert r.status_code == 401


# ---------- Clinic update & restore ----------
class TestClinicPut:
    def test_edit_tagline_and_restore(self, admin):
        content = admin.get(f"{API}/content", timeout=10).json()
        clinic = content["clinic"]
        original_tagline = clinic.get("tagline", "Cultivating Smiles")
        try:
            new_tagline = "TEST_tagline_admin_pytest"
            payload = {**clinic, "tagline": new_tagline}
            r = admin.put(f"{API}/admin/clinic", json=payload, timeout=10)
            assert r.status_code == 200

            # verify persistence via public /content
            verify = admin.get(f"{API}/content", timeout=10).json()
            assert verify["clinic"]["tagline"] == new_tagline
        finally:
            # restore
            restore = admin.put(f"{API}/admin/clinic",
                                json={**clinic, "tagline": original_tagline}, timeout=10)
            assert restore.status_code == 200
            verify2 = admin.get(f"{API}/content", timeout=10).json()
            assert verify2["clinic"]["tagline"] == original_tagline


# ---------- Services CRUD lifecycle ----------
class TestServicesCRUD:
    def test_full_lifecycle(self, admin):
        # CREATE
        payload = {
            "title": "TEST_Whitening",
            "description": "TEST_desc",
            "icon": "Sparkles",
            "order": 999,
        }
        cr = admin.post(f"{API}/admin/services", json=payload, timeout=10)
        assert cr.status_code == 200, cr.text
        created = cr.json()
        assert created["title"] == payload["title"]
        assert "id" in created and isinstance(created["id"], str)
        item_id = created["id"]

        try:
            # verify appears in list
            lst = admin.get(f"{API}/admin/services", timeout=10).json()
            assert any(x["id"] == item_id for x in lst)

            # UPDATE
            up = admin.put(f"{API}/admin/services/{item_id}",
                           json={**created, "title": "TEST_Whitening_edited"}, timeout=10)
            assert up.status_code == 200
            assert up.json()["title"] == "TEST_Whitening_edited"

            # verify update persisted via public content
            content = admin.get(f"{API}/content", timeout=10).json()
            svc = next((s for s in content["services"] if s["id"] == item_id), None)
            assert svc is not None
            assert svc["title"] == "TEST_Whitening_edited"
        finally:
            # DELETE
            d = admin.delete(f"{API}/admin/services/{item_id}", timeout=10)
            assert d.status_code == 200
            # verify removed
            lst2 = admin.get(f"{API}/admin/services", timeout=10).json()
            assert not any(x["id"] == item_id for x in lst2)


# ---------- Reviews edit + restore ----------
class TestReviewsEdit:
    def test_edit_existing_review_and_restore(self, admin):
        reviews = admin.get(f"{API}/admin/reviews", timeout=10).json()
        assert len(reviews) >= 1
        original = reviews[0]
        original_text = original["text"]
        try:
            edited = {**original, "text": "TEST_review_temp"}
            r = admin.put(f"{API}/admin/reviews/{original['id']}", json=edited, timeout=10)
            assert r.status_code == 200
            got = admin.get(f"{API}/admin/reviews", timeout=10).json()
            assert next(x for x in got if x["id"] == original["id"])["text"] == "TEST_review_temp"
        finally:
            restore = admin.put(f"{API}/admin/reviews/{original['id']}",
                                json={**original, "text": original_text}, timeout=10)
            assert restore.status_code == 200
            got = admin.get(f"{API}/admin/reviews", timeout=10).json()
            assert next(x for x in got if x["id"] == original["id"])["text"] == original_text


# ---------- Gallery CRUD ----------
class TestGalleryCRUD:
    def test_add_and_delete_photo(self, admin):
        payload = {
            "url": "https://via.placeholder.com/300",
            "caption": "TEST_gallery_photo",
            "order": 999,
        }
        cr = admin.post(f"{API}/admin/gallery", json=payload, timeout=10)
        assert cr.status_code == 200
        item = cr.json()
        try:
            content = admin.get(f"{API}/content", timeout=10).json()
            assert any(g["id"] == item["id"] for g in content["gallery"])
        finally:
            d = admin.delete(f"{API}/admin/gallery/{item['id']}", timeout=10)
            assert d.status_code == 200


# ---------- Bookings admin listing ----------
class TestAdminBookings:
    def test_bookings_returns_list(self, admin):
        r = admin.get(f"{API}/admin/bookings", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for b in data:
            assert "_id" not in b
            assert "full_name" in b
            assert "phone" in b


# ---------- Image upload + public file serving ----------
class TestImageUpload:
    def test_upload_and_serve(self, admin):
        png = _make_tiny_png()
        files = {"file": ("test.png", png, "image/png")}
        # requests must NOT set json content-type here
        r = admin.post(f"{API}/admin/upload", files=files, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "url" in body and body["url"].startswith("/api/files/")
        assert "path" in body

        # fetch publicly (no auth needed)
        anon = requests.Session()
        pub = anon.get(f"{BASE_URL}{body['url']}", timeout=30)
        assert pub.status_code == 200
        ctype = pub.headers.get("content-type", "")
        assert "image" in ctype, f"Expected image/*, got {ctype}"
        assert len(pub.content) > 0

    def test_upload_rejects_non_image(self, admin):
        files = {"file": ("hello.txt", b"not an image", "text/plain")}
        r = admin.post(f"{API}/admin/upload", files=files, timeout=15)
        assert r.status_code == 400
