from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import sys
import os

# Add the parent directory to the path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

db = SQLAlchemy()

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    name_en = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=True)
    description_en = db.Column(db.Text, nullable=True)
    
    # Category and Classification
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    brand = db.Column(db.String(100), nullable=True)
    model = db.Column(db.String(100), nullable=True)
    
    # Product Type
    type = db.Column(db.String(20), default='product')  # product, service, bundle
    
    # Pricing Information
    cost_price = db.Column(db.Float, default=0.0)
    selling_price = db.Column(db.Float, default=0.0)
    min_selling_price = db.Column(db.Float, default=0.0)
    wholesale_price = db.Column(db.Float, default=0.0)
    
    # Tax Information
    is_taxable = db.Column(db.Boolean, default=True)
    tax_rate = db.Column(db.Float, default=15.0)  # VAT rate
    
    # Inventory Information
    track_inventory = db.Column(db.Boolean, default=True)
    current_stock = db.Column(db.Float, default=0.0)
    minimum_stock = db.Column(db.Float, default=0.0)
    maximum_stock = db.Column(db.Float, default=0.0)
    reorder_point = db.Column(db.Float, default=0.0)
    reorder_quantity = db.Column(db.Float, default=0.0)
    
    # Units
    unit = db.Column(db.String(20), default='piece')  # piece, kg, liter, meter, etc.
    unit_en = db.Column(db.String(20), default='piece')
    
    # Physical Properties
    weight = db.Column(db.Float, nullable=True)
    dimensions = db.Column(db.String(100), nullable=True)  # L x W x H
    
    # Barcode and SKU
    barcode = db.Column(db.String(100), unique=True, nullable=True)
    sku = db.Column(db.String(100), unique=True, nullable=True)
    
    # Supplier Information
    preferred_supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=True)
    supplier_code = db.Column(db.String(50), nullable=True)
    
    # Status and Settings
    status = db.Column(db.String(20), default='active')  # active, inactive, discontinued
    is_featured = db.Column(db.Boolean, default=False)
    allow_negative_stock = db.Column(db.Boolean, default=False)
    
    # Images and Media
    image_path = db.Column(db.String(500), nullable=True)
    gallery_images = db.Column(db.JSON, default=[])
    
    # SEO and Web
    slug = db.Column(db.String(200), unique=True, nullable=True)
    meta_title = db.Column(db.String(200), nullable=True)
    meta_description = db.Column(db.Text, nullable=True)
    
    # Accounting
    income_account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    expense_account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = db.relationship('Category', backref='products', lazy=True)
    preferred_supplier = db.relationship('Supplier', backref='preferred_products', lazy=True)
    invoice_items = db.relationship('InvoiceItem', backref='product', lazy=True)
    purchase_items = db.relationship('PurchaseItem', backref='product', lazy=True)
    inventory_movements = db.relationship('InventoryMovement', backref='product', lazy=True)
    
    def update_stock(self, quantity, movement_type='adjustment', reference=None):
        """Update product stock"""
        old_stock = self.current_stock
        
        if movement_type in ['sale', 'return_to_supplier', 'adjustment_out']:
            self.current_stock -= quantity
        elif movement_type in ['purchase', 'return_from_customer', 'adjustment_in']:
            self.current_stock += quantity
        
        # Create inventory movement record
        from app.models.inventory import InventoryMovement
        movement = InventoryMovement(
            product_id=self.id,
            movement_type=movement_type,
            quantity=quantity,
            old_stock=old_stock,
            new_stock=self.current_stock,
            reference=reference,
            notes=f"Stock updated via {movement_type}"
        )
        db.session.add(movement)
        db.session.commit()
    
    def is_low_stock(self):
        """Check if product is low on stock"""
        return self.current_stock <= self.minimum_stock
    
    def is_out_of_stock(self):
        """Check if product is out of stock"""
        return self.current_stock <= 0
    
    def calculate_profit_margin(self):
        """Calculate profit margin percentage"""
        if self.cost_price > 0:
            return ((self.selling_price - self.cost_price) / self.cost_price) * 100
        return 0
    
    def calculate_markup(self):
        """Calculate markup percentage"""
        if self.cost_price > 0:
            return ((self.selling_price - self.cost_price) / self.selling_price) * 100
        return 0
    
    def get_stock_value(self):
        """Get total stock value"""
        return self.current_stock * self.cost_price
    
    def get_selling_value(self):
        """Get total selling value of current stock"""
        return self.current_stock * self.selling_price
    
    def can_sell(self, quantity):
        """Check if product can be sold in requested quantity"""
        if not self.track_inventory:
            return True
        
        if self.allow_negative_stock:
            return True
        
        return self.current_stock >= quantity
    
    def to_dict(self, include_stock=True, include_pricing=True):
        """Convert product object to dictionary"""
        data = {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'name_en': self.name_en,
            'description': self.description,
            'description_en': self.description_en,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'brand': self.brand,
            'model': self.model,
            'type': self.type,
            'unit': self.unit,
            'unit_en': self.unit_en,
            'weight': self.weight,
            'dimensions': self.dimensions,
            'barcode': self.barcode,
            'sku': self.sku,
            'preferred_supplier_id': self.preferred_supplier_id,
            'supplier_code': self.supplier_code,
            'status': self.status,
            'is_featured': self.is_featured,
            'image_path': self.image_path,
            'gallery_images': self.gallery_images,
            'is_taxable': self.is_taxable,
            'tax_rate': self.tax_rate,
            'track_inventory': self.track_inventory,
            'allow_negative_stock': self.allow_negative_stock,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_stock:
            data.update({
                'current_stock': self.current_stock,
                'minimum_stock': self.minimum_stock,
                'maximum_stock': self.maximum_stock,
                'reorder_point': self.reorder_point,
                'reorder_quantity': self.reorder_quantity,
                'is_low_stock': self.is_low_stock(),
                'is_out_of_stock': self.is_out_of_stock(),
                'stock_value': self.get_stock_value()
            })
        
        if include_pricing:
            data.update({
                'cost_price': self.cost_price,
                'selling_price': self.selling_price,
                'min_selling_price': self.min_selling_price,
                'wholesale_price': self.wholesale_price,
                'profit_margin': self.calculate_profit_margin(),
                'markup': self.calculate_markup(),
                'selling_value': self.get_selling_value()
            })
        
        return data
    
    @staticmethod
    def generate_code():
        """Generate next product code"""
        last_product = Product.query.order_by(Product.id.desc()).first()
        if last_product:
            last_number = int(last_product.code.split('-')[1])
            return f"PRD-{str(last_number + 1).zfill(4)}"
        return "PRD-0001"
    
    def __repr__(self):
        return f'<Product {self.code}: {self.name}>'


class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    name_en = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    description_en = db.Column(db.Text, nullable=True)
    
    # Hierarchy
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    level = db.Column(db.Integer, default=1)
    sort_order = db.Column(db.Integer, default=0)
    
    # Settings
    is_active = db.Column(db.Boolean, default=True)
    image_path = db.Column(db.String(500), nullable=True)
    
    # SEO
    slug = db.Column(db.String(200), unique=True, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = db.relationship('Category', remote_side=[id], backref='children', lazy=True)
    
    def get_full_path(self):
        """Get full category path"""
        if self.parent:
            return f"{self.parent.get_full_path()} > {self.name}"
        return self.name
    
    def get_products_count(self):
        """Get number of products in this category"""
        return Product.query.filter_by(category_id=self.id).count()
    
    def to_dict(self, include_products_count=False):
        """Convert category object to dictionary"""
        data = {
            'id': self.id,
            'name': self.name,
            'name_en': self.name_en,
            'description': self.description,
            'description_en': self.description_en,
            'parent_id': self.parent_id,
            'level': self.level,
            'sort_order': self.sort_order,
            'is_active': self.is_active,
            'image_path': self.image_path,
            'slug': self.slug,
            'full_path': self.get_full_path(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_products_count:
            data['products_count'] = self.get_products_count()
        
        return data
    
    def __repr__(self):
        return f'<Category {self.name}>'
