from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, JSON, Numeric, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

try:
    from geoalchemy2 import Geography
except ImportError:
    from sqlalchemy.types import UserDefinedType
    class Geography(UserDefinedType):
        def __init__(self, geometry_type='POINT', srid=4326):
            self.geometry_type = geometry_type
            self.srid = srid
        def get_col_spec(self, **kw):
            return f"geography({self.geometry_type}, {self.srid})"

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    phone = Column(Text, unique=True, nullable=False)
    email = Column(Text, unique=True)
    password_hash = Column(Text)
    role = Column(Text, nullable=False)  # 'farmer' or 'buyer'
    language_pref = Column(Text, default='hi')
    location = Column(Geography(geometry_type='POINT', srid=4326), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Listing(Base):
    __tablename__ = 'listings'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    farmer_name = Column(Text, nullable=True)
    farmer_phone = Column(Text, nullable=True)
    crop_type = Column(Text, nullable=False)
    quantity_kg = Column(Numeric, nullable=False)
    price_expectation = Column(Numeric, nullable=True)
    district = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    grade = Column(Text, nullable=True, default='A')
    harvest_date = Column(Date, nullable=True)
    photo_url = Column(Text, nullable=True)
    location = Column(Geography(geometry_type='POINT', srid=4326), nullable=True)
    status = Column(Text, default='active', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Lot(Base):
    __tablename__ = 'lots'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_type = Column(Text, nullable=False)
    total_quantity_kg = Column(Numeric, nullable=False)
    grade = Column(Text)
    centroid = Column(Geography(geometry_type='POINT', srid=4326), nullable=True)
    status = Column(Text, default='open', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LotListing(Base):
    __tablename__ = 'lot_listings'
    lot_id = Column(UUID(as_uuid=True), ForeignKey('lots.id', ondelete='CASCADE'), primary_key=True)
    listing_id = Column(UUID(as_uuid=True), ForeignKey('listings.id', ondelete='CASCADE'), primary_key=True)

class QualityGrade(Base):
    __tablename__ = 'quality_grades'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lot_id = Column(UUID(as_uuid=True), ForeignKey('lots.id', ondelete='CASCADE'), nullable=True)
    grade = Column(Text, nullable=False)
    defects = Column(JSONB)
    photo_url = Column(Text)
    graded_at = Column(DateTime(timezone=True), server_default=func.now())

class Order(Base):
    __tablename__ = 'orders'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lot_id = Column(UUID(as_uuid=True), ForeignKey('lots.id', ondelete='SET NULL'), nullable=True)
    listing_id = Column(UUID(as_uuid=True), ForeignKey('listings.id', ondelete='SET NULL'), nullable=True)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    quantity_kg = Column(Numeric, nullable=False)
    total_price = Column(Numeric, nullable=True)
    payment_method = Column(Text, nullable=True)
    delivery_address = Column(Text, nullable=True)
    status = Column(Text, default='placed', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Route(Base):
    __tablename__ = 'routes'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id', ondelete='CASCADE'), nullable=True)
    route_geojson = Column(JSONB)
    distance_km = Column(Numeric)
    eta = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Payment(Base):
    __tablename__ = 'payments'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id', ondelete='CASCADE'), nullable=True)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    amount = Column(Numeric, nullable=False)
    currency = Column(Text, default='INR', nullable=False)
    payment_method = Column(Text, nullable=True)
    status = Column(Text, default='pending', nullable=False)
    transaction_id = Column(Text, nullable=True)
    paid_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PriceHistory(Base):
    __tablename__ = 'price_history'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_type = Column(Text, nullable=False)
    region = Column(Text, nullable=False)
    date = Column(Date, nullable=False)
    avg_price = Column(Numeric, nullable=False)
