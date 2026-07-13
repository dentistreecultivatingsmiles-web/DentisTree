"""Backend API tests for DentisTree microsite."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend/.env
    from pathlib import Path
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- /api/content ----
class TestContent:
    def test_content_status_and_shape(self, client):
        r = client.get(f"{API}/content", timeout=15)
        assert r.status_code == 200
        data = r.json()
        for key in ["clinic", "services", "doctors", "reviews", "gallery"]:
            assert key in data, f"missing key {key}"

    def test_clinic_fields(self, client):
        data = client.get(f"{API}/content", timeout=15).json()
        clinic = data["clinic"]
        assert clinic["name"] == "DentisTree"
        assert clinic["whatsapp"] == "918383935992"
        assert clinic["logo"].startswith("http")
        assert isinstance(clinic["hours"], list)
        assert len(clinic["hours"]) == 7
        # each hours entry has day and time
        for h in clinic["hours"]:
            assert "day" in h and "time" in h

    def test_services_count(self, client):
        data = client.get(f"{API}/content", timeout=15).json()
        assert len(data["services"]) == 8
        # verify order and required fields
        for s in data["services"]:
            assert "id" in s and "title" in s and "description" in s and "icon" in s

    def test_doctor_is_manmohan(self, client):
        data = client.get(f"{API}/content", timeout=15).json()
        docs = data["doctors"]
        assert len(docs) == 1
        assert docs[0]["name"] == "Dr. Manmohan Bhutani"

    def test_reviews_count(self, client):
        data = client.get(f"{API}/content", timeout=15).json()
        assert len(data["reviews"]) == 6
        for r in data["reviews"]:
            assert "author" in r and "rating" in r and "text" in r

    def test_gallery_count(self, client):
        data = client.get(f"{API}/content", timeout=15).json()
        assert len(data["gallery"]) == 6
        for g in data["gallery"]:
            assert g["url"].startswith("http")

    def test_no_mongo_id_leaked(self, client):
        data = client.get(f"{API}/content", timeout=15).json()
        for coll_key in ["services", "doctors", "reviews", "gallery"]:
            for item in data[coll_key]:
                assert "_id" not in item, f"_id leaked in {coll_key}"


# ---- /api/bookings ----
class TestBookings:
    def test_create_booking_and_list_persistence(self, client):
        payload = {
            "full_name": "TEST_Playwright User",
            "phone": "9876543210",
            "dob": "1995-05-20",
        }
        r = client.post(f"{API}/bookings", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "id" in body and isinstance(body["id"], str) and len(body["id"]) > 0
        assert "created_at" in body
        assert body["full_name"] == payload["full_name"]
        assert body["phone"] == payload["phone"]
        assert body["dob"] == payload["dob"]

        # GET list — verify persisted
        lr = client.get(f"{API}/bookings", timeout=15)
        assert lr.status_code == 200
        listing = lr.json()
        assert any(b["id"] == body["id"] for b in listing), "created booking not found in list"

    def test_bookings_no_mongo_id(self, client):
        r = client.get(f"{API}/bookings", timeout=15)
        assert r.status_code == 200
        for b in r.json():
            assert "_id" not in b

    def test_missing_field_returns_422(self, client):
        # missing dob
        r = client.post(f"{API}/bookings", json={"full_name": "TEST_Missing", "phone": "9999999999"}, timeout=15)
        assert r.status_code == 422

    def test_short_name_returns_422(self, client):
        r = client.post(f"{API}/bookings", json={"full_name": "A", "phone": "9876543210", "dob": "1990-01-01"}, timeout=15)
        assert r.status_code == 422

    def test_short_phone_returns_422(self, client):
        r = client.post(f"{API}/bookings", json={"full_name": "TEST_Short Phone", "phone": "123", "dob": "1990-01-01"}, timeout=15)
        assert r.status_code == 422


# ---- Health / root ----
class TestRoot:
    def test_api_root(self, client):
        r = client.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "DentisTree" in r.json().get("message", "")
