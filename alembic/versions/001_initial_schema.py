"""initial_schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-09-18 12:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
try:
    import geoalchemy2
except ImportError:
    pass

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable PostGIS extension if available
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('phone', sa.Text(), nullable=False, unique=True),
        sa.Column('email', sa.Text(), nullable=True, unique=True),
        sa.Column('password_hash', sa.Text(), nullable=True),
        sa.Column('role', sa.Text(), nullable=False),
        sa.Column('language_pref', sa.Text(), server_default='hi', nullable=True),
        sa.Column('location', geoalchemy2.Geography(geometry_type='POINT', srid=4326) if 'geoalchemy2' in globals() else sa.NullType(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.CheckConstraint("role IN ('farmer', 'buyer')", name='check_user_role')
    )

    # 2. listings table
    op.create_table(
        'listings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('farmer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('farmer_name', sa.Text(), nullable=True),
        sa.Column('farmer_phone', sa.Text(), nullable=True),
        sa.Column('crop_type', sa.Text(), nullable=False),
        sa.Column('quantity_kg', sa.Numeric(), nullable=False),
        sa.Column('price_expectation', sa.Numeric(), nullable=True),
        sa.Column('district', sa.Text(), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('grade', sa.Text(), server_default='A', nullable=True),
        sa.Column('harvest_date', sa.Date(), nullable=True),
        sa.Column('photo_url', sa.Text(), nullable=True),
        sa.Column('location', geoalchemy2.Geography(geometry_type='POINT', srid=4326) if 'geoalchemy2' in globals() else sa.NullType(), nullable=True),
        sa.Column('status', sa.Text(), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.CheckConstraint("status IN ('active', 'clustered', 'sold')", name='check_listing_status')
    )

    # 3. lots table
    op.create_table(
        'lots',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('crop_type', sa.Text(), nullable=False),
        sa.Column('total_quantity_kg', sa.Numeric(), nullable=False),
        sa.Column('grade', sa.Text(), nullable=True),
        sa.Column('centroid', geoalchemy2.Geography(geometry_type='POINT', srid=4326) if 'geoalchemy2' in globals() else sa.NullType(), nullable=True),
        sa.Column('status', sa.Text(), server_default='open', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.CheckConstraint("status IN ('open', 'ordered', 'delivered')", name='check_lot_status')
    )

    # 4. lot_listings join table
    op.create_table(
        'lot_listings',
        sa.Column('lot_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('lots.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('listing_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('listings.id', ondelete='CASCADE'), primary_key=True)
    )

    # 5. quality_grades table
    op.create_table(
        'quality_grades',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('lot_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('lots.id', ondelete='CASCADE'), nullable=True),
        sa.Column('grade', sa.Text(), nullable=False),
        sa.Column('defects', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('photo_url', sa.Text(), nullable=True),
        sa.Column('graded_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True)
    )

    # 6. orders table
    op.create_table(
        'orders',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('lot_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('lots.id', ondelete='SET NULL'), nullable=True),
        sa.Column('listing_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('listings.id', ondelete='SET NULL'), nullable=True),
        sa.Column('buyer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('quantity_kg', sa.Numeric(), nullable=False),
        sa.Column('total_price', sa.Numeric(), nullable=True),
        sa.Column('payment_method', sa.Text(), nullable=True),
        sa.Column('delivery_address', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), server_default='placed', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.CheckConstraint("status IN ('placed', 'routed', 'picked_up', 'delivered', 'settled')", name='check_order_status')
    )

    # 7. routes table
    op.create_table(
        'routes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=True),
        sa.Column('route_geojson', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('distance_km', sa.Numeric(), nullable=True),
        sa.Column('eta', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True)
    )

    # 8. payments table
    op.create_table(
        'payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=True),
        sa.Column('farmer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('buyer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('amount', sa.Numeric(), nullable=False),
        sa.Column('currency', sa.Text(), server_default='INR', nullable=False),
        sa.Column('payment_method', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), server_default='pending', nullable=False),
        sa.Column('transaction_id', sa.Text(), nullable=True),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.CheckConstraint("status IN ('pending', 'partial_paid', 'settled')", name='check_payment_status')
    )

    # 9. price_history table
    op.create_table(
        'price_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('crop_type', sa.Text(), nullable=False),
        sa.Column('region', sa.Text(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('avg_price', sa.Numeric(), nullable=False)
    )

    # Create Indexes for high performance
    op.create_index('idx_listings_farmer_id', 'listings', ['farmer_id'])
    op.create_index('idx_listings_status_crop', 'listings', ['status', 'crop_type'])
    op.create_index('idx_lots_status_crop', 'lots', ['status', 'crop_type'])
    op.create_index('idx_lot_listings_listing_id', 'lot_listings', ['listing_id'])
    op.create_index('idx_orders_buyer_id', 'orders', ['buyer_id'])
    op.create_index('idx_orders_lot_id', 'orders', ['lot_id'])
    op.create_index('idx_orders_status_created', 'orders', ['status', 'created_at'])
    op.create_index('idx_quality_grades_lot_id', 'quality_grades', ['lot_id'])
    op.create_index('idx_routes_order_id', 'routes', ['order_id'])
    op.create_index('idx_payments_order_id', 'payments', ['order_id'])
    op.create_index('idx_payments_farmer_id', 'payments', ['farmer_id'])
    op.create_index('idx_price_history_crop_region_date', 'price_history', ['crop_type', 'region', 'date'])


def downgrade() -> None:
    op.drop_table('price_history')
    op.drop_table('payments')
    op.drop_table('routes')
    op.drop_table('orders')
    op.drop_table('quality_grades')
    op.drop_table('lot_listings')
    op.drop_table('lots')
    op.drop_table('listings')
    op.drop_table('users')
