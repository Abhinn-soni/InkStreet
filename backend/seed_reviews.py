import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Sample review templates
review_templates = [
    {"rating": 5, "comment": "Amazing quality and the print looks even better in person. The oversized fit is perfect for streetwear."},
    {"rating": 5, "comment": "Love the design! Fabric feels premium and the neon style graphics really stand out."},
    {"rating": 4, "comment": "Great t-shirt for daily wear. Fit is comfortable and the print feels durable."},
    {"rating": 5, "comment": "The anime design is fire 🔥 Got compliments from friends the first day I wore it."},
    {"rating": 4, "comment": "Good quality cotton and nice stitching. Would love more color options."},
    {"rating": 5, "comment": "Perfect streetwear vibe. Oversized fit and print quality are both excellent."},
    {"rating": 5, "comment": "Been wearing this for weeks and the print still looks brand new. Quality is top tier!"},
    {"rating": 4, "comment": "Really happy with this purchase. The material is soft and the design is exactly what I wanted."},
    {"rating": 5, "comment": "This hoodie is a statement piece! Everyone asks where I got it from."},
    {"rating": 4, "comment": "Comfortable fit and great design. Shipping was fast too!"},
    {"rating": 5, "comment": "The graphics are so vibrant and the fabric quality exceeded my expectations."},
    {"rating": 4, "comment": "Love the cyberpunk aesthetic. Fits perfectly with my style."},
    {"rating": 5, "comment": "Worth every rupee! The attention to detail on the print is incredible."},
    {"rating": 4, "comment": "Great addition to my streetwear collection. Material breathes well."},
    {"rating": 5, "comment": "The oversized fit is exactly what I wanted. Will definitely buy more!"},
]

sample_names = [
    "Arjun M", "Priya S", "Rahul K", "Sneha P", "Vikram R",
    "Ananya G", "Rohan D", "Isha T", "Kabir N", "Diya V",
    "Aarav J", "Sanya W", "Harsh B", "Meera L", "Aditya C"
]

async def seed_reviews():
    print("Seeding product reviews...")
    
    # Get all products
    products = await db.products.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(100)
    
    if not products:
        print("No products found. Please run seed_data.py first.")
        return
    
    # Check if reviews already exist
    existing_reviews = await db.reviews.count_documents({})
    if existing_reviews > 0:
        print(f"Found {existing_reviews} existing reviews. Skipping seed.")
        return
    
    reviews_created = 0
    
    for product in products:
        # Create 5-8 reviews per product
        num_reviews = random.randint(5, 8)
        
        for i in range(num_reviews):
            # Pick a random review template
            template = random.choice(review_templates)
            name = random.choice(sample_names)
            
            # Create review with random date in last 60 days
            days_ago = random.randint(1, 60)
            created_date = datetime.now(timezone.utc) - timedelta(days=days_ago)
            
            review = {
                "id": str(uuid.uuid4()),
                "product_id": product["id"],
                "user_id": f"seed_user_{i}",
                "user_name": name,
                "rating": template["rating"],
                "comment": template["comment"],
                "photos": [],
                "is_verified_buyer": True,  # Mark as verified
                "is_seed_review": True,  # Mark as seed review for admin identification
                "helpful_count": random.randint(0, 25),
                "not_helpful_count": random.randint(0, 3),
                "helpful_by": [],
                "created_at": created_date.isoformat()
            }
            
            await db.reviews.insert_one(review)
            reviews_created += 1
        
        print(f"✓ Created {num_reviews} reviews for '{product['name']}'")
    
    print(f"\n✅ Successfully seeded {reviews_created} reviews across {len(products)} products!")
    print("Note: Seed reviews are marked with 'is_seed_review: true' and can be managed from admin dashboard")

if __name__ == "__main__":
    asyncio.run(seed_reviews())
