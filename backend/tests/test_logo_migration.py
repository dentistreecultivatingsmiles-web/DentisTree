"""Logo migration tests — verifies startup migration behavior for clinic.logo."""
import os
import subprocess
import time

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

NEW_LOGO = "https://customer-assets.emergentagent.com/job_tooth-reserve-16/artifacts/ox8dbhg6_1000245879.webp"
OLD_LOGO = "https://dentistree.me/wp-content/uploads/sites/45/2025/03/Clinic_Logo-removebg-preview.png"
CUSTOM_LOGO = "https://example.com/custom-logo.png"


@pytest.fixture(scope="module")
def mongo():
    c = MongoClient(MONGO_URL)
    yield c[DB_NAME]
    c.close()


def _get_logo():
    r = requests.get(f"{BASE_URL}/api/content", timeout=15)
    r.raise_for_status()
    return r.json()["clinic"]["logo"]


def _restart_backend_and_wait():
    subprocess.run(["sudo", "supervisorctl", "restart", "backend"], check=True, capture_output=True)
    # Poll /api/ for readiness
    for _ in range(30):
        try:
            r = requests.get(f"{BASE_URL}/api/", timeout=3)
            if r.status_code == 200:
                # Give startup migration a moment to complete
                time.sleep(1.5)
                return
        except Exception:
            pass
        time.sleep(0.5)
    raise RuntimeError("Backend did not come back up after restart")


def test_current_state_new_logo(mongo):
    """Baseline: GET /api/content already returns the new customer-assets logo."""
    logo = _get_logo()
    assert logo == NEW_LOGO, f"Expected new logo, got {logo}"


def test_migration_overwrites_old_logo(mongo):
    """Set DB to OLD logo, restart backend, expect NEW logo after migration."""
    result = mongo.settings.update_one({"key": "clinic"}, {"$set": {"data.logo": OLD_LOGO}})
    assert result.matched_count == 1, "settings.clinic doc must exist"
    # Sanity: DB has old value
    assert mongo.settings.find_one({"key": "clinic"})["data"]["logo"] == OLD_LOGO

    _restart_backend_and_wait()

    logo_after = _get_logo()
    assert logo_after == NEW_LOGO, f"Migration failed: {logo_after}"
    # Verify DB was actually updated
    db_logo = mongo.settings.find_one({"key": "clinic"})["data"]["logo"]
    assert db_logo == NEW_LOGO


def test_migration_preserves_custom_logo(mongo):
    """Set DB to a CUSTOM logo, restart backend, expect it to be preserved."""
    result = mongo.settings.update_one({"key": "clinic"}, {"$set": {"data.logo": CUSTOM_LOGO}})
    assert result.matched_count == 1
    assert mongo.settings.find_one({"key": "clinic"})["data"]["logo"] == CUSTOM_LOGO

    _restart_backend_and_wait()

    logo_after = _get_logo()
    assert logo_after == CUSTOM_LOGO, f"Migration overwrote a custom logo! got {logo_after}"


def test_restore_new_logo(mongo):
    """Cleanup: restore DB to the new logo URL so the app is left in a good state."""
    mongo.settings.update_one({"key": "clinic"}, {"$set": {"data.logo": NEW_LOGO}})
    _restart_backend_and_wait()
    assert _get_logo() == NEW_LOGO


def test_new_logo_url_reachable():
    """The customer-assets logo URL must actually respond 200 with an image."""
    r = requests.get(NEW_LOGO, timeout=15)
    assert r.status_code == 200, f"Logo URL returned {r.status_code}"
    ctype = r.headers.get("Content-Type", "")
    assert ctype.startswith("image/"), f"Not an image: {ctype}"
    assert len(r.content) > 100
