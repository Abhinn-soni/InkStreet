import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_data():
    print("Seeding InkStreet database...")
    
    # Create admin user
    admin_exists = await db.users.find_one({"email": "admin@inkstreet.com"})
    if not admin_exists:
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": "admin@inkstreet.com",
            "name": "Admin User",
            "password_hash": hash_password("admin123"),
            "phone": "+91-9876543210",
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        print("✓ Admin user created (email: admin@inkstreet.com, password: admin123)")
    
    # Create demo user
    demo_exists = await db.users.find_one({"email": "demo@inkstreet.com"})
    if not demo_exists:
        demo_user = {
            "id": str(uuid.uuid4()),
            "email": "demo@inkstreet.com",
            "name": "Demo User",
            "password_hash": hash_password("demo123"),
            "phone": "+91-9876543211",
            "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(demo_user)
        print("✓ Demo user created (email: demo@inkstreet.com, password: demo123)")
    
    # Create categories
    categories_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Streetwear",
            "slug": "streetwear",
            "description": "RAP / Hip-Hop inspired streetwear collection",
            "image_url": "https://images.unsplash.com/photo-1608687087371-2950241246f9?w=800",
            "products_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Anime Collection",
            "slug": "anime",
            "description": "Exclusive anime-themed apparel",
            "image_url": "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800",
            "products_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for cat in categories_data:
        existing = await db.categories.find_one({"slug": cat["slug"]})
        if not existing:
            await db.categories.insert_one(cat)
            print(f"✓ Category '{cat['name']}' created")
    
    # Get category IDs
    streetwear_cat = await db.categories.find_one({"slug": "streetwear"})
    anime_cat = await db.categories.find_one({"slug": "anime"})
    
    # Create products
    products_data = [
        # Streetwear products
        {
            "id": str(uuid.uuid4()),
            "name": "Urban Legend Tee",
            "slug": "urban-legend-tee",
            "category_id": streetwear_cat["id"],
            "price": 1299,
            "description": "Bold graphic tee with urban street vibes. Premium cotton blend.",
            "images": [
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
                "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600"
            ],
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "colors": ["Black", "White", "Navy"],
            "stock": 50,
            "is_customizable": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cyber Hoodie",
            "slug": "cyber-hoodie",
            "category_id": streetwear_cat["id"],
            "price": 2499,
            "description": "Futuristic oversized hoodie with neon accents. Perfect for Gen-Z style.",
            "images": [
                "https://images.unsplash.com/photo-1642522282467-54fae4bc0f44?w=600"
            ],
            "sizes": ["M", "L", "XL", "XXL"],
            "colors": ["Black", "Gray"],
            "stock": 30,
            "is_customizable": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Street King Cap",
            "slug": "street-king-cap",
            "category_id": streetwear_cat["id"],
            "price": 799,
            "description": "Classic streetwear cap with embroidered logo.",
            "images": [
                "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600"
            ],
            "sizes": ["One Size"],
            "colors": ["Black", "White", "Navy"],
            "stock": 100,
            "is_customizable": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Rap Culture Oversized Tee",
            "slug": "rap-culture-oversized-tee",
            "category_id": streetwear_cat["id"],
            "price": 1499,
            "description": "Extra oversized fit inspired by hip-hop culture. Premium heavyweight cotton.",
            "images": [
                "https://images.unsplash.com/photo-1639600280284-6ef3f0d67fe1?w=600"
            ],
            "sizes": ["M", "L", "XL", "XXL"],
            "colors": ["Black", "White", "Gray"],
            "stock": 40,
            "is_customizable": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Anime products
        {
            "id": str(uuid.uuid4()),
            "name": "Dragon Spirit Tee",
            "slug": "dragon-spirit-tee",
            "category_id": anime_cat["id"],
            "price": 1399,
            "description": "Epic dragon-themed anime graphic tee. High-quality print.",
            "images": [
                "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600"
            ],
            "sizes": ["S", "M", "L", "XL"],
            "colors": ["Black", "Navy"],
            "stock": 45,
            "is_customizable": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Samurai Code Hoodie",
            "slug": "samurai-code-hoodie",
            "category_id": anime_cat["id"],
            "price": 2799,
            "description": "Premium anime hoodie featuring samurai warrior art. Soft fleece interior.",
            "images": [
                "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600"
            ],
            "sizes": ["M", "L", "XL"],
            "colors": ["Black", "Gray"],
            "stock": 25,
            "is_customizable": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Anime Tokyo Tee",
            "slug": "anime-tokyo-tee",
            "category_id": anime_cat["id"],
            "price": 1299,
            "description": "Tokyo street scene anime graphic. Bold and colorful design.",
            "images": [
                "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600"
            ],
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "colors": ["Black", "White"],
            "stock": 60,
            "is_customizable": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Manga Art Oversized Tee",
            "slug": "manga-art-oversized-tee",
            "category_id": anime_cat["id"],
            "price": 1599,
            "description": "Oversized fit with exclusive manga art print. Limited edition.",
            "images": [
                "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600"
            ],
            "sizes": ["M", "L", "XL", "XXL"],
            "colors": ["Black", "White", "Gray"],
            "stock": 35,
            "is_customizable": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for prod in products_data:
        existing = await db.products.find_one({"slug": prod["slug"]})
        if not existing:
            await db.products.insert_one(prod)
            # Update category product count
            await db.categories.update_one(
                {"id": prod["category_id"]},
                {"$inc": {"products_count": 1}}
            )
            print(f"✓ Product '{prod['name']}' created")
    
    # Create default policies
    policies_data = [
        {
            "id": str(uuid.uuid4()),
            "type": "privacy",
            "title": "Privacy Policy",
            "content": """# Privacy Policy

Last Updated: January 2026

At InkStreet, we value your privacy and are committed to protecting your personal information.

## Information We Collect
- Name, email, phone number, and shipping address
- Order history and payment information
- Browsing behavior and preferences

## How We Use Your Information
- Process and fulfill your orders
- Send order confirmations and updates
- Improve our products and services
- Send promotional emails (with your consent)

## Data Security
We implement industry-standard security measures to protect your personal information.

## Contact Us
For privacy concerns, contact us at privacy@inkstreet.com""",
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "terms",
            "title": "Terms & Conditions",
            "content": """# Terms & Conditions

Welcome to InkStreet!

## Agreement to Terms
By accessing our website, you agree to these terms and conditions.

## Products and Pricing
- All prices are in Indian Rupees (₹)
- Prices are subject to change without notice
- We reserve the right to limit quantities

## Orders and Payment
- Orders are subject to acceptance and availability
- Payment must be completed before order processing
- We accept UPI, credit/debit cards, and COD

## Intellectual Property
All designs, logos, and content are property of InkStreet.

## Contact
Questions? Email us at support@inkstreet.com""",
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "return",
            "title": "Return & Refund Policy",
            "content": """# Return & Refund Policy

## Standard Products
- 7-day return policy for standard products
- Items must be unused with original tags
- Refund processed within 5-7 business days

## Custom Printed Products
Custom printed items are NON-RETURNABLE unless:
- Item arrived damaged
- Item is defective
- Incorrect item shipped

## Return Process
1. Contact support@inkstreet.com within 7 days
2. Provide order number and reason
3. Ship item back with provided label
4. Refund issued upon inspection

## Exchanges
We offer exchanges for different sizes/colors subject to availability.

## Contact
Return queries: returns@inkstreet.com""",
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "shipping",
            "title": "Shipping Policy",
            "content": """# Shipping Policy

## Delivery Timeline
- Standard orders: 5-7 business days
- Custom printed orders: 7-10 business days
- Metro cities: 3-5 business days

## Shipping Charges
FREE shipping on all orders across India!

## Order Tracking
Track your order using the tracking link sent via email.

## Delivery Partners
We partner with leading courier services for reliable delivery.

## International Shipping
Currently shipping within India only.

## Contact
Shipping queries: shipping@inkstreet.com""",
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "contact",
            "title": "Contact Us",
            "content": """# Contact Us

We'd love to hear from you!

## Customer Support
Email: support@inkstreet.com
Phone: +91-XXXX-XXXXXX
Hours: Mon-Sat, 10 AM - 7 PM IST

## Business Inquiries
Email: business@inkstreet.com

## Social Media
Instagram: @inkstreet.official
Twitter: @inkstreet
Facebook: /inkstreetofficial

## Address
InkStreet Fashion Pvt Ltd
123 Street Fashion Lane
Mumbai, Maharashtra 400001
India

We aim to respond within 24 hours!""",
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "faq",
            "title": "Frequently Asked Questions",
            "content": """# FAQ

## Ordering
**Q: How do I place an order?**
A: Browse products, add to cart, and proceed to checkout.

**Q: Can I modify my order?**
A: Contact us within 1 hour of placing the order.

## Custom Designs
**Q: What file format for custom designs?**
A: PNG or JPG, minimum 1000x1000px, transparent background preferred.

**Q: Can I preview before ordering?**
A: Yes! Use our 3D preview tool on the Custom Design page.

## Shipping
**Q: Do you ship internationally?**
A: Currently India only.

**Q: How long does delivery take?**
A: 5-7 business days for standard, 7-10 for custom orders.

## Returns
**Q: Can I return custom printed items?**
A: Only if damaged, defective, or incorrect.

## Payment
**Q: What payment methods?**
A: UPI, Credit/Debit cards, Cash on Delivery.""",
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "size_guide",
            "title": "Size Guide",
            "content": """# Size Guide

## T-Shirts & Tees

| Size | Chest (inches) | Length (inches) |
|------|----------------|-----------------|
| S    | 36-38          | 27              |
| M    | 38-40          | 28              |
| L    | 40-42          | 29              |
| XL   | 42-44          | 30              |
| XXL  | 44-46          | 31              |

## Oversized Tees
Add 2-3 inches to chest measurement for oversized fit.

## Hoodies

| Size | Chest (inches) | Length (inches) |
|------|----------------|-----------------|
| M    | 40-42          | 28              |
| L    | 42-44          | 29              |
| XL   | 44-46          | 30              |
| XXL  | 46-48          | 31              |

## Caps
One size fits most (adjustable strap)

## Measuring Tips
- Measure over your favorite fitting garment
- Keep tape measure parallel to ground
- For best fit, measure an existing garment

Questions? Contact support@inkstreet.com""",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for policy in policies_data:
        existing = await db.policies.find_one({"type": policy["type"]})
        if not existing:
            await db.policies.insert_one(policy)
            print(f"✓ Policy '{policy['type']}' created")
    
    print("\n✅ Database seeding completed successfully!")
    print("\n📝 Login Credentials:")
    print("Admin: admin@inkstreet.com / admin123")
    print("Demo User: demo@inkstreet.com / demo123")

if __name__ == "__main__":
    asyncio.run(seed_data())
