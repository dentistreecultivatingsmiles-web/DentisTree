from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="DentisTree API")
api_router = APIRouter(prefix="/api")

CLINIC = {
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


@api_router.get("/")
async def root():
    return {"message": "DentisTree API running"}


@api_router.get("/content")
async def get_content():
    services = await db.services.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    doctors = await db.doctors.find({}, {"_id": 0}).sort("order", 1).to_list(20)
    reviews = await db.reviews.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    gallery = await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    return {"clinic": CLINIC, "services": services, "doctors": doctors, "reviews": reviews, "gallery": gallery}


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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
