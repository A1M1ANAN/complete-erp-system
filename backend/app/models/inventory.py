from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import sys
import os

# Add the parent directory to the path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

db = SQLAlchemy()

class InventoryMovement(db.Model):
    __tablename__ = 'inventory_movements'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # Movement Details
    movement_type = db.Column(db.String(30), nullable=False)  # purchase, sale, adjustment_in, adjustment_out, return_from_customer, return_to_supplier, transfer_in, transfer_out
    quantity = db.Column(db.Float, nullable=False)
    unit_cost = db.Column(db.Float, default=0.0)
    
    # Stock Levels
    old_stock = db.Column(db.Float, default=0.0)
    new_stock = db.Column(db.Float, default=0.0)
    
    # Reference Information
    reference_type = db.Column(db.String(20), nullable=True)  # invoice, purchase, adjustment, transfer
    reference_id = db.Column(db.Integer, nullable=True)
    reference = db.Column(db.String(100), nullable=True)  # Reference number or description
    
    # Location Information
    warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouses.id'), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    
    # Additional Information
    notes = db.Column(db.Text, nullable=True)
    batch_number = db.Column(db.String(50), nullable=True)
    expiry_date = db.Column(db.Date, nullable=True)
    
    # User Information
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    movement_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('User', backref='inventory_movements', lazy=True)
    warehouse = db.relationship('Warehouse', backref='inventory_movements', lazy=True)
    
    def get_movement_direction(self):
        """Get movement direction (in/out)"""
        in_movements = ['purchase', 'adjustment_in', 'return_from_customer', 'transfer_in']
        return 'in' if self.movement_type in in_movements else 'out'
    
    def get_total_value(self):
        """Get total value of movement"""
        return abs(self.quantity) * self.unit_cost
    
    def to_dict(self):
        """Convert inventory movement object to dictionary"""
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'product_code': self.product.code if self.product else None,
            'movement_type': self.movement_type,
            'movement_direction': self.get_movement_direction(),
            'quantity': self.quantity,
            'unit_cost': self.unit_cost,
            'total_value': self.get_total_value(),
            'old_stock': self.old_stock,
            'new_stock': self.new_stock,
            'reference_type': self.reference_type,
            'reference_id': self.reference_id,
            'reference': self.reference,
            'warehouse_id': self.warehouse_id,
            'warehouse_name': self.warehouse.name if self.warehouse else None,
            'location': self.location,
            'notes': self.notes,
            'batch_number': self.batch_number,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'created_by': self.created_by,
            'creator_name': self.creator.name if self.creator else None,
            'movement_date': self.movement_date.isoformat(),
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<InventoryMovement {self.movement_type}: {self.quantity}>'


class Warehouse(db.Model):
    __tablename__ = 'warehouses'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Location Information
    address = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), default='Saudi Arabia')
    postal_code = db.Column(db.String(20), nullable=True)
    
    # Contact Information
    manager_name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    
    # Settings
    is_active = db.Column(db.Boolean, default=True)
    is_default = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_total_products(self):
        """Get total number of products in warehouse"""
        return WarehouseStock.query.filter_by(warehouse_id=self.id).count()
    
    def get_total_stock_value(self):
        """Get total stock value in warehouse"""
        stocks = WarehouseStock.query.filter_by(warehouse_id=self.id).all()
        return sum(stock.quantity * stock.product.cost_price for stock in stocks if stock.product)
    
    def to_dict(self, include_stats=False):
        """Convert warehouse object to dictionary"""
        data = {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'postal_code': self.postal_code,
            'manager_name': self.manager_name,
            'phone': self.phone,
            'email': self.email,
            'is_active': self.is_active,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_stats:
            data.update({
                'total_products': self.get_total_products(),
                'total_stock_value': self.get_total_stock_value()
            })
        
        return data
    
    def __repr__(self):
        return f'<Warehouse {self.code}: {self.name}>'


class WarehouseStock(db.Model):
    __tablename__ = 'warehouse_stocks'
    
    id = db.Column(db.Integer, primary_key=True)
    warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouses.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # Stock Information
    quantity = db.Column(db.Float, default=0.0)
    reserved_quantity = db.Column(db.Float, default=0.0)  # Reserved for orders
    available_quantity = db.Column(db.Float, default=0.0)  # quantity - reserved_quantity
    
    # Location in Warehouse
    location = db.Column(db.String(100), nullable=True)  # Aisle, Shelf, Bin
    
    # Timestamps
    last_movement_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    warehouse = db.relationship('Warehouse', backref='stocks', lazy=True)
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('warehouse_id', 'product_id', name='unique_warehouse_product'),)
    
    def update_available_quantity(self):
        """Update available quantity"""
        self.available_quantity = self.quantity - self.reserved_quantity
        db.session.commit()
    
    def reserve_stock(self, quantity):
        """Reserve stock for orders"""
        if self.available_quantity >= quantity:
            self.reserved_quantity += quantity
            self.update_available_quantity()
            return True
        return False
    
    def release_reservation(self, quantity):
        """Release reserved stock"""
        self.reserved_quantity = max(0, self.reserved_quantity - quantity)
        self.update_available_quantity()
    
    def to_dict(self):
        """Convert warehouse stock object to dictionary"""
        return {
            'id': self.id,
            'warehouse_id': self.warehouse_id,
            'warehouse_name': self.warehouse.name if self.warehouse else None,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'product_code': self.product.code if self.product else None,
            'quantity': self.quantity,
            'reserved_quantity': self.reserved_quantity,
            'available_quantity': self.available_quantity,
            'location': self.location,
            'last_movement_date': self.last_movement_date.isoformat() if self.last_movement_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<WarehouseStock W:{self.warehouse_id} P:{self.product_id} Q:{self.quantity}>'


class StockAdjustment(db.Model):
    __tablename__ = 'stock_adjustments'
    
    id = db.Column(db.Integer, primary_key=True)
    adjustment_number = db.Column(db.String(50), unique=True, nullable=False)
    
    # Basic Information
    adjustment_date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    adjustment_type = db.Column(db.String(20), nullable=False)  # increase, decrease, recount
    reason = db.Column(db.String(100), nullable=False)
    
    # Status
    status = db.Column(db.String(20), default='draft')  # draft, approved, cancelled
    
    # Additional Information
    notes = db.Column(db.Text, nullable=True)
    reference = db.Column(db.String(100), nullable=True)
    
    # User Information
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    items = db.relationship('StockAdjustmentItem', backref='adjustment', lazy=True, cascade='all, delete-orphan')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_adjustments', lazy=True)
    approver = db.relationship('User', foreign_keys=[approved_by], backref='approved_adjustments', lazy=True)
    
    def approve(self, approved_by_user_id):
        """Approve stock adjustment and update inventory"""
        self.approved_by = approved_by_user_id
        self.approved_at = datetime.utcnow()
        self.status = 'approved'
        
        # Update inventory for each item
        for item in self.items:
            if item.product:
                movement_type = 'adjustment_in' if item.adjustment_quantity > 0 else 'adjustment_out'
                item.product.update_stock(
                    abs(item.adjustment_quantity),
                    movement_type,
                    f"Adjustment {self.adjustment_number}"
                )
        
        db.session.commit()
    
    def to_dict(self, include_items=False):
        """Convert stock adjustment object to dictionary"""
        data = {
            'id': self.id,
            'adjustment_number': self.adjustment_number,
            'adjustment_date': self.adjustment_date.isoformat(),
            'adjustment_type': self.adjustment_type,
            'reason': self.reason,
            'status': self.status,
            'notes': self.notes,
            'reference': self.reference,
            'created_by': self.created_by,
            'approved_by': self.approved_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'approved_at': self.approved_at.isoformat() if self.approved_at else None
        }
        
        if include_items:
            data['items'] = [item.to_dict() for item in self.items]
        
        return data
    
    def __repr__(self):
        return f'<StockAdjustment {self.adjustment_number}>'


class StockAdjustmentItem(db.Model):
    __tablename__ = 'stock_adjustment_items'
    
    id = db.Column(db.Integer, primary_key=True)
    adjustment_id = db.Column(db.Integer, db.ForeignKey('stock_adjustments.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # Quantities
    current_quantity = db.Column(db.Float, nullable=False)
    new_quantity = db.Column(db.Float, nullable=False)
    adjustment_quantity = db.Column(db.Float, nullable=False)  # new_quantity - current_quantity
    
    # Cost Information
    unit_cost = db.Column(db.Float, default=0.0)
    total_cost = db.Column(db.Float, default=0.0)
    
    # Additional Information
    notes = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def calculate_adjustment(self):
        """Calculate adjustment quantity and cost"""
        self.adjustment_quantity = self.new_quantity - self.current_quantity
        self.total_cost = abs(self.adjustment_quantity) * self.unit_cost
        db.session.commit()
    
    def to_dict(self):
        """Convert stock adjustment item object to dictionary"""
        return {
            'id': self.id,
            'adjustment_id': self.adjustment_id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'product_code': self.product.code if self.product else None,
            'current_quantity': self.current_quantity,
            'new_quantity': self.new_quantity,
            'adjustment_quantity': self.adjustment_quantity,
            'unit_cost': self.unit_cost,
            'total_cost': self.total_cost,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<StockAdjustmentItem P:{self.product_id} Adj:{self.adjustment_quantity}>'
