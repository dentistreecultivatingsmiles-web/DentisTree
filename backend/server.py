from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, File, UploadFile
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
import jwt
import requests
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="DentisTree API")
api_router = APIRouter(prefix="/api")

DEFAULT_CLINIC = {
    "name": "DentisTree",
    "tagline": "Cultivating Smiles",
    "address": "LIG Flat No. JA/1A, Ground Floor, Hari Nagar, Hari Enclave, New Delhi 110064",
    "landmark": "Near Swarg Ashram Mandir",
    "phone": "+918383935992",
    "phone_display": "083839 35992",
    "whatsapp": "918383935992",
    "email": "dentistree.cultivatingsmiles@gmail.com",
    "logo": "https://dentistree.me/wp-content/uploads/sites/45/2025/03/Clinic_Logo-removebg-preview.png",
    "rating": 4.9,
    "review_count": 69,
    "hours": [
        {"day": "Monday", "time": "10:00 AM – 8:00 PM"},
        {"day": "Tuesday", "time": "10:00 AM – 8:00 PM"},
        {"day": "Wednesday", "time": "10:00 AM – 8:00 PM"},
        {"day": "Thursday", "time": "10:00 AM – 8:00 PM"},
        {"day": "Friday", "time": "10:00 AM – 8:00 PM"},
        {"day": "Saturday", "time": "10:00 AM – 8:00 PM"},
        {"day": "Sunday", "time": "Closed"},
    ],
    "map_embed": "https://maps.google.com/maps?q=DentisTree%20Dental%20Hospital%20Hari%20Nagar%20New%20Delhi&t=&z=16&ie=UTF8&iwloc=&output=embed",
    "map_link": "https://www.google.com/maps/place/DentisTree/data=!4m2!3m1!1s0x0:0xa7b94bdf689c9155",
}

SEED_SERVICES = [
    {"id": str(uuid.uuid4()), "icon": "Anchor", "title": "Dental Implant & Extraction", "description": "Permanent tooth replacement and safe removal of severely damaged or impacted teeth.", "order": 1},
    {"id": str(uuid.uuid4()), "icon": "Activity", "title": "Root Canal Treatment (RCT)", "description": "Infected pulp is removed, the tooth cleaned, disinfected and sealed — relieving pain and saving your natural tooth.", "order": 2},
    {"id": str(uuid.uuid4()), "icon": "Smile", "title": "Smile Designing", "description": "Enhances facial aesthetics through customized treatments, improving the symmetry and appearance of your smile.", "order": 3},
    {"id": str(uuid.uuid4()), "icon": "AlignCenterVertical", "title": "Invisalign & Fixed Orthodontics", "description": "Clear aligners and fixed braces to straighten teeth comfortably at every age.", "order": 4},
    {"id": str(uuid.uuid4()), "icon": "Sparkles", "title": "Scaling & Bleaching", "description": "Removes plaque, tartar and stains, ensuring a brighter, healthier, and more radiant smile.", "order": 5},
    {"id": str(uuid.uuid4()), "icon": "ShieldPlus", "title": "Crown & Bridge", "description": "Restores missing or damaged teeth with durable, natural-looking dental prosthetics for optimal function.", "order": 6},
    {"id": str(uuid.uuid4()), "icon": "Sun", "title": "Dental Fillings", "description": "Restores damaged or decayed teeth, preventing further deterioration and ensuring long-lasting dental health.", "order": 7},
    {"id": str(uuid.uuid4()), "icon": "Baby", "title": "Dentures & Full Arch Implant", "description": "Replaces missing teeth, restoring functionality, aesthetics and confidence with natural-looking prosthetics.", "order": 8},
]

SEED_DOCTORS = [
    {
        "id": str(uuid.uuid4()),
        "name": "Dr. Manmohan Bhutani",
        "role": "Lead Dental Surgeon",
        "qualification": "Restorative, Cosmetic & Implant Dentistry",
        "bio": "Dr. Manmohan Bhutani is a highly skilled and experienced dentist committed to providing exceptional dental care with a focus on precision, patient comfort and advanced treatment techniques. His expertise spans dental implants & full-mouth rehabilitation, cosmetic dentistry (smile designing, veneers, whitening), root canal treatment, and fixed orthodontics (braces & Invisalign).",
        "photo": "https://dentistree.me/wp-content/uploads/sites/45/2025/03/photo.jpg",
        "order": 1,
    },
]

SEED_REVIEWS = [
    {"id": str(uuid.uuid4()), "author": "Hitesh Malhotra", "rating": 5, "time_ago": "a week ago", "text": "Best dental clinic in west delhi. I was having pain in lower left 3rd molar. Dr. Manmohan removed it without even a slightest pain. Best Dentist and Best Dental Care. Must visit for any dental issues. Everything sorted and I am so relieved.", "order": 1},
    {"id": str(uuid.uuid4()), "author": "Sachin Premi", "rating": 5, "time_ago": "a week ago", "text": "Very cool, accommodative Doctor. Sensible and precise hearing. Painless, fast, transparent treatment.", "order": 2},
    {"id": str(uuid.uuid4()), "author": "Ganga Pun", "rating": 5, "time_ago": "2 weeks ago", "text": "Got extraction of my 11 year son from here. Painless experience. Educated and well informed doctor. Must visit.", "order": 3},
    {"id": str(uuid.uuid4()), "author": "Yashika Dogra", "rating": 5, "time_ago": "2 weeks ago", "text": "Best Dental clinic in Hari Nagar and painless experience...", "order": 4},
]

SEED_GALLERY = [
    {"id": str(uuid.uuid4()), "url": "https://customer-assets.emergentagent.com/job_tooth-reserve-16/artifacts/5hlx7q63_1000246532.webp", "caption": "DentisTree — our clinic in Hari Nagar", "order": 1},
    {"id": str(uuid.uuid4()), "url": "https://dentistree.me/wp-content/uploads/sites/45/2025/03/clinic-photo-interior-1-67dd558127eeb.webp", "caption": "Treatment room", "order": 2},
    {"id": str(uuid.uuid4()), "url": "https://dentistree.me/wp-content/uploads/sites/45/2025/03/clinic-photo-interior-2-67dd558114afa.webp", "caption": "Inside the clinic", "order": 3},
    {"id": str(uuid.uuid4()), "url": "https://customer-assets.emergentagent.com/job_tooth-reserve-16/artifacts/7mt4ccjh_1000247804.webp", "caption": "A Multispeciality Dental Care", "order": 4},
    {"id": str(uuid.uuid4()), "url": "https://dentistree.me/wp-content/uploads/sites/45/2025/03/clinic-photo-interior-3-67dd557e026eb.webp", "caption": "Modern dental setup", "order": 5},
    {"id": str(uuid.uuid4()), "url": "https://dentistree.me/wp-content/uploads/sites/45/2025/03/clinic-photo-interior-67dd557dddab9.webp", "caption": "Sterile, safe environment", "order": 6},
]


class BookingCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=7, max_length=20)
    dob: str


class Booking(BookingCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LoginRequest(BaseModel):
    email: str
    password: str


# ---------- Auth (JWT, httpOnly cookies) ----------
JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie("access_token", access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


LOCKOUT_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


async def check_brute_force(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if rec and rec.get("count", 0) >= LOCKOUT_ATTEMPTS:
        last = datetime.fromisoformat(rec["last_attempt"])
        if datetime.now(timezone.utc) - last < timedelta(minutes=LOCKOUT_MINUTES):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
        await db.login_attempts.delete_one({"identifier": identifier})


async def record_failed_attempt(identifier: str):
    await db.login_attempts.update_one(
        {"identifier": identifier},
        {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )


@api_router.post("/auth/login")
async def login(payload: LoginRequest, request: Request, response: Response):
    email = payload.email.strip().lower()
    identifier = f"{request.client.host}:{email}"
    await check_brute_force(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await record_failed_attempt(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    set_auth_cookies(response, create_access_token(user["id"], email), create_refresh_token(user["id"]))
    return {"id": user["id"], "email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}


@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        response.set_cookie("access_token", create_access_token(user["id"], user["email"]), httponly=True, secure=False, samesite="lax", max_age=900, path="/")
        return user
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------- Object storage (Emergent) ----------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "dentistree"
storage_key = None


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ["EMERGENT_LLM_KEY"]}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 10 MB")
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "png"
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": file.content_type}, data=data, timeout=120)
    resp.raise_for_status()
    result = resp.json()
    await db.files.insert_one({"id": str(uuid.uuid4()), "storage_path": result["path"], "original_filename": file.filename, "content_type": file.content_type, "size": result["size"], "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"url": f"/api/files/{result['path']}", "path": result["path"]}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code != 200:
        raise HTTPException(status_code=404, detail="File not found in storage")
    return Response(content=resp.content, media_type=record.get("content_type", "application/octet-stream"), headers={"Cache-Control": "public, max-age=86400"})


# ---------- Admin content management ----------
ADMIN_COLLECTIONS = {"services", "doctors", "reviews", "gallery"}


@api_router.get("/admin/bookings")
async def admin_bookings(user: dict = Depends(get_current_user)):
    return await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.put("/admin/clinic")
async def update_clinic(payload: dict, user: dict = Depends(get_current_user)):
    payload.pop("_id", None)
    await db.settings.update_one({"key": "clinic"}, {"$set": {"data": payload}}, upsert=True)
    return payload


def validate_collection(col: str):
    if col not in ADMIN_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Unknown collection")


@api_router.get("/admin/{col}")
async def admin_list(col: str, user: dict = Depends(get_current_user)):
    validate_collection(col)
    return await db[col].find({}, {"_id": 0}).sort("order", 1).to_list(100)


@api_router.post("/admin/{col}")
async def admin_create(col: str, payload: dict, user: dict = Depends(get_current_user)):
    validate_collection(col)
    payload.pop("_id", None)
    payload["id"] = str(uuid.uuid4())
    if "order" not in payload or payload["order"] in (None, ""):
        count = await db[col].count_documents({})
        payload["order"] = count + 1
    await db[col].insert_one(dict(payload))
    payload.pop("_id", None)
    return payload


@api_router.put("/admin/{col}/{item_id}")
async def admin_update(col: str, item_id: str, payload: dict, user: dict = Depends(get_current_user)):
    validate_collection(col)
    payload.pop("_id", None)
    payload["id"] = item_id
    result = await db[col].update_one({"id": item_id}, {"$set": payload})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return payload


@api_router.delete("/admin/{col}/{item_id}")
async def admin_delete(col: str, item_id: str, user: dict = Depends(get_current_user)):
    validate_collection(col)
    result = await db[col].delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Deleted"}


@api_router.get("/")
async def root():
    return {"message": "DentisTree API running"}


@api_router.get("/content")
async def get_content():
    settings = await db.settings.find_one({"key": "clinic"}, {"_id": 0})
    clinic = settings["data"] if settings else DEFAULT_CLINIC
    services = await db.services.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    doctors = await db.doctors.find({}, {"_id": 0}).sort("order", 1).to_list(20)
    reviews = await db.reviews.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    gallery = await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    return {"clinic": clinic, "services": services, "doctors": doctors, "reviews": reviews, "gallery": gallery}


@api_router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate):
    booking = Booking(**payload.model_dump())
    await db.bookings.insert_one(booking.model_dump())
    return booking


@api_router.get("/bookings", response_model=List[Booking])
async def list_bookings():
    docs = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def seed_data():
    if await db.services.count_documents({}) == 0:
        await db.services.insert_many([dict(s) for s in SEED_SERVICES])
    if await db.doctors.count_documents({}) == 0:
        await db.doctors.insert_many([dict(d) for d in SEED_DOCTORS])
    if await db.reviews.count_documents({}) == 0:
        await db.reviews.insert_many([dict(r) for r in SEED_REVIEWS])
    if await db.gallery.count_documents({}) == 0:
        await db.gallery.insert_many([dict(g) for g in SEED_GALLERY])
    if await db.settings.count_documents({"key": "clinic"}) == 0:
        await db.settings.insert_one({"key": "clinic", "data": dict(DEFAULT_CLINIC)})

    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"id": str(uuid.uuid4()), "email": admin_email, "password_hash": hash_password(admin_password), "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")

    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
