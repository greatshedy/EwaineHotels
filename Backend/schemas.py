from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field


class RoomType(BaseModel):
    type: str
    price: float
    available: int


class HotelBase(BaseModel):
    name: str
    description: str = ""
    price: float
    rating: float = 0
    city: str
    state: str = ""
    address: str = ""
    latitude: float = 0
    longitude: float = 0
    amenities: list[str] = []
    images: list[str] = []
    featured: bool = False
    available: bool = True
    roomTypes: list[RoomType] = []
    phone: str = ""
    email: str = ""
    website: str = ""


class HotelCreate(HotelBase):
    pass


class HotelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    amenities: Optional[list[str]] = None
    images: Optional[list[str]] = None
    featured: Optional[bool] = None
    available: Optional[bool] = None
    roomTypes: Optional[list[RoomType]] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None


class HotelResponse(HotelBase):
    id: int
    slug: str
    reviews: int = 0


class BookingBase(BaseModel):
    guestName: str
    guestEmail: str
    hotelName: str
    hotelId: int
    roomType: str
    checkIn: str
    checkOut: str
    totalPrice: float


class BookingCreate(BookingBase):
    pass


class BookingResponse(BookingBase):
    id: int
    status: str
    createdAt: str


class BookingStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "cancelled"]


class AdminLogin(BaseModel):
    email: str
    password: str


class AdminCreate(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    token: str
    email: str


class Destination(BaseModel):
    id: int
    name: str
    country: str = ""
    count: int = 0
    image: str = ""


class Testimonial(BaseModel):
    id: int
    name: str
    role: str = ""
    avatar: str = ""
    rating: int = 5
    text: str = ""


class TestimonialCreate(BaseModel):
    name: str
    role: str = ""
    avatar: str = ""
    rating: int = 5
    text: str = ""


class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None
    rating: Optional[int] = None
    text: Optional[str] = None


class TeamMember(BaseModel):
    id: int
    name: str
    role: str = ""
    avatar: str = ""
    bio: str = ""


class UserRegister(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class BlogPost(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: str = ""
    coverImage: str = ""
    author: str = "Admin"
    tags: list[str] = []
    published: bool = False
    createdAt: str = ""
    updatedAt: str = ""


class BlogCreate(BaseModel):
    title: str
    content: str
    excerpt: str = ""
    coverImage: str = ""
    author: str = "Admin"
    tags: list[str] = []
    published: bool = False


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    coverImage: Optional[str] = None
    author: Optional[str] = None
    tags: Optional[list[str]] = None
    published: Optional[bool] = None
