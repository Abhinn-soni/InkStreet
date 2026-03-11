from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import razorpay
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT & Auth
JWT_SECRET = os.environ.get('JWT_SECRET', 'change_this_secret')
JWT_ALGORITHM = 'HS256'
security = HTTPBearer()

# Razorpay (will be configured when user adds keys)
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and 'your_razorpay' not in RAZORPAY_KEY_ID:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    razorpay_client = None

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str = ""
    phone: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    is_admin: bool = False

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    products_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    category_id: str
    price: float
    description: Optional[str] = None
    images: List[str] = []
    sizes: List[str] = ["S", "M", "L", "XL"]
    colors: List[str] = ["Black", "White"]
    stock: int = 100
    is_customizable: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    slug: str
    category_id: str
    price: float
    description: Optional[str] = None
    images: List[str] = []
    sizes: List[str] = ["S", "M", "L", "XL"]
    colors: List[str] = ["Black", "White"]
    stock: int = 100
    is_customizable: bool = False

class CartItem(BaseModel):
    product_id: str
    quantity: int
    size: str
    color: str
    custom_design_url: Optional[str] = None

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Wishlist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_ids: List[str] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem]
    total: float
    payment_id: Optional[str] = None
    payment_status: str = "pending"  # pending, paid, failed
    order_status: str = "processing"  # processing, shipped, delivered, cancelled
    shipping_address: Dict[str, Any]
    tracking_info: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[CartItem]
    total: float
    shipping_address: Dict[str, Any]

class Policy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # privacy, terms, return, shipping, contact, faq, size_guide
    title: str
    content: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PolicyUpdate(BaseModel):
    title: str
    content: str

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int  # 1-5 stars
    comment: str
    photos: List[str] = []  # URLs of uploaded review photos
    is_verified_buyer: bool = False
    is_seed_review: bool = False  # For initial seed reviews
    helpful_count: int = 0
    not_helpful_count: int = 0
    helpful_by: List[str] = []  # user_ids who marked as helpful
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str
    photos: List[str] = []

class ReviewStats(BaseModel):
    average_rating: float
    total_reviews: int
    rating_distribution: Dict[str, int]  # "5": count, "4": count, etc.

class HelpfulVote(BaseModel):
    review_id: str
    is_helpful: bool
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_message: str
    bot_response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class PaymentOrder(BaseModel):
    amount: int  # in paise
    order_id: str

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, is_admin: bool = False) -> str:
    payload = {
        'user_id': user_id,
        'is_admin': is_admin,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_admin_user(user: Dict = Depends(get_current_user)) -> Dict:
    if not user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============== AUTH ENDPOINTS ==============

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    password = user_dict.pop('password')
    user_obj = User(**user_dict, password_hash=hash_password(password))
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    return UserResponse(**user_obj.model_dump())

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user.get('is_admin', False))
    return {
        "token": token,
        "user": UserResponse(**user).model_dump()
    }

@api_router.get("/auth/profile", response_model=UserResponse)
async def get_profile(user: Dict = Depends(get_current_user)):
    return UserResponse(**user)

@api_router.put("/auth/profile", response_model=UserResponse)
async def update_profile(
    name: Optional[str] = None,
    phone: Optional[str] = None,
    address: Optional[Dict[str, Any]] = None,
    user: Dict = Depends(get_current_user)
):
    update_data = {}
    if name: update_data['name'] = name
    if phone: update_data['phone'] = phone
    if address: update_data['address'] = address
    
    if update_data:
        await db.users.update_one({"id": user['id']}, {"$set": update_data})
        updated_user = await db.users.find_one({"id": user['id']}, {"_id": 0})
        return UserResponse(**updated_user)
    return UserResponse(**user)

# ============== CATEGORY ENDPOINTS ==============

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(cat_data: CategoryCreate, admin: Dict = Depends(get_admin_user)):
    category = Category(**cat_data.model_dump())
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, cat_data: CategoryCreate, admin: Dict = Depends(get_admin_user)):
    update_doc = cat_data.model_dump()
    await db.categories.update_one({"id": category_id}, {"$set": update_doc})
    updated = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Category(**updated)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, admin: Dict = Depends(get_admin_user)):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# ============== PRODUCT ENDPOINTS ==============

@api_router.get("/products", response_model=List[Product])
async def get_products(category_id: Optional[str] = None):
    query = {"category_id": category_id} if category_id else {}
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod.get('created_at'), str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(prod_data: ProductCreate, admin: Dict = Depends(get_admin_user)):
    product = Product(**prod_data.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    
    # Update category products_count
    await db.categories.update_one(
        {"id": prod_data.category_id},
        {"$inc": {"products_count": 1}}
    )
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, prod_data: ProductCreate, admin: Dict = Depends(get_admin_user)):
    update_doc = prod_data.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": update_doc})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Product(**updated)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: Dict = Depends(get_admin_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.products.delete_one({"id": product_id})
    
    # Update category products_count
    await db.categories.update_one(
        {"id": product['category_id']},
        {"$inc": {"products_count": -1}}
    )
    return {"message": "Product deleted"}

# ============== CART ENDPOINTS ==============

@api_router.get("/cart", response_model=Cart)
async def get_cart(user: Dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user['id']}, {"_id": 0})
    if not cart:
        cart = Cart(user_id=user['id']).model_dump()
        cart['updated_at'] = cart['updated_at'].isoformat()
        await db.carts.insert_one(cart)
        cart['updated_at'] = datetime.fromisoformat(cart['updated_at'])
    else:
        if isinstance(cart.get('updated_at'), str):
            cart['updated_at'] = datetime.fromisoformat(cart['updated_at'])
    return Cart(**cart)

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, user: Dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user['id']}, {"_id": 0})
    if not cart:
        cart = Cart(user_id=user['id'], items=[item]).model_dump()
        cart['updated_at'] = cart['updated_at'].isoformat()
        await db.carts.insert_one(cart)
    else:
        items = cart.get('items', [])
        # Check if item already exists
        found = False
        for i, existing_item in enumerate(items):
            if (existing_item['product_id'] == item.product_id and 
                existing_item['size'] == item.size and 
                existing_item['color'] == item.color):
                items[i]['quantity'] += item.quantity
                found = True
                break
        if not found:
            items.append(item.model_dump())
        
        await db.carts.update_one(
            {"user_id": user['id']},
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    return {"message": "Item added to cart"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, user: Dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user['id']}, {"_id": 0})
    if cart:
        items = [item for item in cart.get('items', []) if item['product_id'] != product_id]
        await db.carts.update_one(
            {"user_id": user['id']},
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    return {"message": "Item removed from cart"}

@api_router.delete("/cart/clear")
async def clear_cart(user: Dict = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": user['id']},
        {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Cart cleared"}

# ============== WISHLIST ENDPOINTS ==============

@api_router.get("/wishlist", response_model=Wishlist)
async def get_wishlist(user: Dict = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({"user_id": user['id']}, {"_id": 0})
    if not wishlist:
        wishlist = Wishlist(user_id=user['id']).model_dump()
        wishlist['updated_at'] = wishlist['updated_at'].isoformat()
        await db.wishlists.insert_one(wishlist)
        wishlist['updated_at'] = datetime.fromisoformat(wishlist['updated_at'])
    else:
        if isinstance(wishlist.get('updated_at'), str):
            wishlist['updated_at'] = datetime.fromisoformat(wishlist['updated_at'])
    return Wishlist(**wishlist)

@api_router.post("/wishlist/add/{product_id}")
async def add_to_wishlist(product_id: str, user: Dict = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({"user_id": user['id']}, {"_id": 0})
    if not wishlist:
        wishlist = Wishlist(user_id=user['id'], product_ids=[product_id]).model_dump()
        wishlist['updated_at'] = wishlist['updated_at'].isoformat()
        await db.wishlists.insert_one(wishlist)
    else:
        product_ids = wishlist.get('product_ids', [])
        if product_id not in product_ids:
            product_ids.append(product_id)
            await db.wishlists.update_one(
                {"user_id": user['id']},
                {"$set": {"product_ids": product_ids, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
    return {"message": "Added to wishlist"}

@api_router.delete("/wishlist/remove/{product_id}")
async def remove_from_wishlist(product_id: str, user: Dict = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({"user_id": user['id']}, {"_id": 0})
    if wishlist:
        product_ids = [pid for pid in wishlist.get('product_ids', []) if pid != product_id]
        await db.wishlists.update_one(
            {"user_id": user['id']},
            {"$set": {"product_ids": product_ids, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    return {"message": "Removed from wishlist"}

# ============== ORDER ENDPOINTS ==============

@api_router.get("/orders", response_model=List[Order])
async def get_orders(user: Dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user['id']}, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, user: Dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": user['id']}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    return Order(**order)

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, user: Dict = Depends(get_current_user)):
    order = Order(**order_data.model_dump(), user_id=user['id'])
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    return order

# ============== PAYMENT ENDPOINTS ==============

@api_router.post("/payment/create-order")
async def create_payment_order(payment_data: PaymentOrder, user: Dict = Depends(get_current_user)):
    if not razorpay_client:
        raise HTTPException(status_code=503, detail="Payment gateway not configured. Please add Razorpay credentials.")
    
    try:
        razor_order = razorpay_client.order.create({
            "amount": payment_data.amount,
            "currency": "INR",
            "payment_capture": 1
        })
        
        # Update order with payment info
        await db.orders.update_one(
            {"id": payment_data.order_id},
            {"$set": {"payment_id": razor_order["id"]}}
        )
        
        return {
            "order_id": razor_order["id"],
            "amount": razor_order["amount"],
            "currency": razor_order["currency"],
            "key_id": RAZORPAY_KEY_ID
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/payment/verify")
async def verify_payment(
    payment_id: str,
    order_id: str,
    signature: str,
    user: Dict = Depends(get_current_user)
):
    if not razorpay_client:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")
    
    try:
        # Verify signature
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        })
        
        # Update order status
        await db.orders.update_one(
            {"payment_id": order_id},
            {"$set": {"payment_status": "paid", "order_status": "processing"}}
        )
        
        # Clear cart
        await db.carts.update_one(
            {"user_id": user['id']},
            {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {"message": "Payment verified successfully"}
    except Exception as e:
        await db.orders.update_one(
            {"payment_id": order_id},
            {"$set": {"payment_status": "failed"}}
        )
        raise HTTPException(status_code=400, detail="Payment verification failed")


# ============== REVIEW ENDPOINTS ==============

@api_router.get("/products/{product_id}/reviews", response_model=List[Review])
async def get_product_reviews(product_id: str, sort_by: str = "recent"):
    query = {"product_id": product_id}
    
    # Determine sort order
    if sort_by == "highest":
        sort_field = [("rating", -1), ("created_at", -1)]
    elif sort_by == "lowest":
        sort_field = [("rating", 1), ("created_at", -1)]
    else:  # recent
        sort_field = [("created_at", -1)]
    
    reviews = await db.reviews.find(query, {"_id": 0}).sort(sort_field).to_list(1000)
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews

@api_router.get("/products/{product_id}/review-stats", response_model=ReviewStats)
async def get_review_stats(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0, "rating": 1}).to_list(10000)
    
    if not reviews:
        return ReviewStats(
            average_rating=0.0,
            total_reviews=0,
            rating_distribution={"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
        )
    
    total = len(reviews)
    ratings = [r['rating'] for r in reviews]
    avg = sum(ratings) / total
    
    distribution = {str(i): ratings.count(i) for i in range(1, 6)}
    
    return ReviewStats(
        average_rating=round(avg, 1),
        total_reviews=total,
        rating_distribution=distribution
    )

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, user: Dict = Depends(get_current_user)):
    # Check if user has purchased this product
    has_purchased = await db.orders.find_one({
        "user_id": user['id'],
        "payment_status": "paid",
        "items.product_id": review_data.product_id
    })
    
    # Check if user already reviewed this product
    existing_review = await db.reviews.find_one({
        "user_id": user['id'],
        "product_id": review_data.product_id
    })
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    review = Review(
        **review_data.model_dump(),
        user_id=user['id'],
        user_name=user['name'],
        is_verified_buyer=bool(has_purchased)
    )
    
    doc = review.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reviews.insert_one(doc)
    
    return review

@api_router.post("/reviews/{review_id}/helpful")
async def mark_review_helpful(review_id: str, vote: HelpfulVote, user: Dict = Depends(get_current_user)):
    review = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    helpful_by = review.get('helpful_by', [])
    
    # Remove previous vote if exists
    if user['id'] in helpful_by:
        helpful_by.remove(user['id'])
        await db.reviews.update_one(
            {"id": review_id},
            {"$inc": {"helpful_count": -1 if review.get('helpful_count', 0) > 0 else 0}}
        )
    
    # Add new vote
    if vote.is_helpful:
        helpful_by.append(user['id'])
        await db.reviews.update_one(
            {"id": review_id},
            {"$set": {"helpful_by": helpful_by}, "$inc": {"helpful_count": 1}}
        )
    else:
        await db.reviews.update_one(
            {"id": review_id},
            {"$set": {"helpful_by": helpful_by}, "$inc": {"not_helpful_count": 1}}
        )
    
    return {"message": "Vote recorded"}

@api_router.get("/reviews/user/can-review/{product_id}")
async def can_user_review(product_id: str, user: Dict = Depends(get_current_user)):
    # Check if user has purchased
    has_purchased = await db.orders.find_one({
        "user_id": user['id'],
        "payment_status": "paid",
        "items.product_id": product_id
    })
    
    # Check if already reviewed
    existing_review = await db.reviews.find_one({
        "user_id": user['id'],
        "product_id": product_id
    })
    
    return {
        "can_review": bool(has_purchased) and not bool(existing_review),
        "has_purchased": bool(has_purchased),
        "already_reviewed": bool(existing_review)
    }

# ============== ADMIN REVIEW ENDPOINTS ==============

@api_router.get("/admin/reviews", response_model=List[Review])
async def admin_get_all_reviews(admin: Dict = Depends(get_admin_user)):
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews

@api_router.delete("/admin/reviews/{review_id}")
async def admin_delete_review(review_id: str, admin: Dict = Depends(get_admin_user)):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}

@api_router.put("/admin/reviews/{review_id}")
async def admin_update_review(
    review_id: str,
    comment: str,
    rating: int,
    admin: Dict = Depends(get_admin_user)
):
    await db.reviews.update_one(
        {"id": review_id},
        {"$set": {"comment": comment, "rating": rating}}
    )
    return {"message": "Review updated"}

# ============== CHATBOT ENDPOINT ==============

@api_router.post("/chatbot")
async def chatbot(chat_req: ChatRequest):
    session_id = chat_req.session_id or str(uuid.uuid4())
    
    # Get chat history for context
    history = await db.chat_messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(5).to_list(5)
    
    # Build context from history
    context_messages = []
    for msg in reversed(history):
        context_messages.append(f"User: {msg['user_message']}")
        context_messages.append(f"Assistant: {msg['bot_response']}")
    
    system_message = f"""You are an AI customer support assistant for InkStreet, a Gen-Z streetwear and anime apparel brand.
Help customers with:
- Order tracking and status
- Product information and recommendations
- FAQs about shipping, returns, and policies
- Customer support queries

Be friendly, helpful, and professional. Keep responses concise and clear.

Previous conversation:
{chr(10).join(context_messages[-10:]) if context_messages else 'No previous messages'}"""
    
    try:
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=chat_req.message)
        response = await chat.send_message(user_message)
        
        # Save to database
        chat_msg = ChatMessage(
            session_id=session_id,
            user_message=chat_req.message,
            bot_response=response
        )
        doc = chat_msg.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.chat_messages.insert_one(doc)
        
        return {
            "response": response,
            "session_id": session_id
        }
    except Exception as e:
        logging.error(f"Chatbot error: {str(e)}")
        return {
            "response": "I'm having trouble connecting right now. Please try again later or contact our support team.",
            "session_id": session_id
        }

# ============== POLICY ENDPOINTS ==============

@api_router.get("/policies/{policy_type}", response_model=Policy)
async def get_policy(policy_type: str):
    policy = await db.policies.find_one({"type": policy_type}, {"_id": 0})
    if not policy:
        # Return default policy structure
        return Policy(
            type=policy_type,
            title=policy_type.replace('_', ' ').title(),
            content=f"Content for {policy_type} will be added by admin."
        )
    if isinstance(policy.get('updated_at'), str):
        policy['updated_at'] = datetime.fromisoformat(policy['updated_at'])
    return Policy(**policy)

@api_router.put("/policies/{policy_type}", response_model=Policy)
async def update_policy(policy_type: str, policy_data: PolicyUpdate, admin: Dict = Depends(get_admin_user)):
    existing = await db.policies.find_one({"type": policy_type}, {"_id": 0})
    
    if existing:
        await db.policies.update_one(
            {"type": policy_type},
            {"$set": {
                "title": policy_data.title,
                "content": policy_data.content,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        policy = Policy(
            type=policy_type,
            title=policy_data.title,
            content=policy_data.content
        )
        doc = policy.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.policies.insert_one(doc)
    
    updated = await db.policies.find_one({"type": policy_type}, {"_id": 0})
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return Policy(**updated)

# ============== ADMIN ENDPOINTS ==============

@api_router.get("/admin/orders", response_model=List[Order])
async def admin_get_orders(admin: Dict = Depends(get_admin_user)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(
    order_id: str,
    order_status: str,
    tracking_info: Optional[Dict[str, Any]] = None,
    admin: Dict = Depends(get_admin_user)
):
    update_data = {"order_status": order_status}
    if tracking_info:
        update_data["tracking_info"] = tracking_info
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    return {"message": "Order status updated"}

@api_router.get("/admin/customers", response_model=List[UserResponse])
async def admin_get_customers(admin: Dict = Depends(get_admin_user)):
    users = await db.users.find({"is_admin": False}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**user) for user in users]

@api_router.get("/admin/stats")
async def admin_get_stats(admin: Dict = Depends(get_admin_user)):
    total_orders = await db.orders.count_documents({})
    total_products = await db.products.count_documents({})
    total_customers = await db.users.count_documents({"is_admin": False})
    
    # Calculate total revenue
    orders = await db.orders.find({"payment_status": "paid"}, {"_id": 0, "total": 1}).to_list(10000)
    total_revenue = sum(order.get('total', 0) for order in orders)
    
    return {
        "total_orders": total_orders,
        "total_products": total_products,
        "total_customers": total_customers,
        "total_revenue": total_revenue
    }

# ============== CUSTOM DESIGN UPLOAD ==============

@api_router.post("/custom-design/upload")
async def upload_custom_design(file: UploadFile = File(...), user: Dict = Depends(get_current_user)):
    # Read file content
    content = await file.read()
    
    # Convert to base64 for simple storage (in production, use cloud storage)
    base64_image = base64.b64encode(content).decode('utf-8')
    image_url = f"data:{file.content_type};base64,{base64_image}"
    
    return {"image_url": image_url}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
