from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import sys
import os

# Add the parent directory to the path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

db = SQLAlchemy()

class Purchase(db.Model):
    __tablename__ = 'purchases'
    
    id = db.Column(db.Integer, primary_key=True)
    purchase_number = db.Column(db.String(50), unique=True, nullable=False)
    
    # Supplier Information
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    
    # Dates
    purchase_date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    due_date = db.Column(db.Date, nullable=False)
    delivery_date = db.Column(db.Date, nullable=True)
    
    # Financial Information
    subtotal = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    discount_percentage = db.Column(db.Float, default=0.0)
    tax_amount = db.Column(db.Float, default=0.0)
    shipping_cost = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, default=0.0)
    paid_amount = db.Column(db.Float, default=0.0)
    balance_due = db.Column(db.Float, default=0.0)
    
    # Status
    status = db.Column(db.String(20), default='draft')  # draft, sent, received, completed, cancelled
    payment_status = db.Column(db.String(20), default='unpaid')  # unpaid, partial, paid
    
    # Additional Information
    notes = db.Column(db.Text, nullable=True)
    terms_conditions = db.Column(db.Text, nullable=True)
    reference = db.Column(db.String(100), nullable=True)
    supplier_invoice_number = db.Column(db.String(100), nullable=True)
    
    # Delivery Information
    delivery_address = db.Column(db.Text, nullable=True)
    delivery_contact = db.Column(db.String(100), nullable=True)
    delivery_phone = db.Column(db.String(20), nullable=True)
    
    # Currency
    currency = db.Column(db.String(3), default='SAR')
    exchange_rate = db.Column(db.Float, default=1.0)
    
    # User Information
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    items = db.relationship('PurchaseItem', backref='purchase', lazy=True, cascade='all, delete-orphan')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_purchases', lazy=True)
    updater = db.relationship('User', foreign_keys=[updated_by], backref='updated_purchases', lazy=True)
    approver = db.relationship('User', foreign_keys=[approved_by], backref='approved_purchases', lazy=True)
    
    def calculate_totals(self):
        """Calculate purchase totals"""
        self.subtotal = sum(item.total_amount for item in self.items)
        
        # Apply discount
        if self.discount_percentage > 0:
            self.discount_amount = self.subtotal * (self.discount_percentage / 100)
        
        # Calculate tax
        taxable_amount = self.subtotal - self.discount_amount
        self.tax_amount = sum(item.tax_amount for item in self.items)
        
        # Calculate total
        self.total_amount = taxable_amount + self.tax_amount + self.shipping_cost
        self.balance_due = self.total_amount - self.paid_amount
        
        db.session.commit()
    
    def add_payment(self, amount, payment_date=None, payment_method='cash', notes=None):
        """Add payment to purchase"""
        if payment_date is None:
            payment_date = datetime.now().date()
        
        self.paid_amount += amount
        self.balance_due = self.total_amount - self.paid_amount
        
        # Update payment status
        if self.balance_due <= 0:
            self.payment_status = 'paid'
            if self.status == 'received':
                self.status = 'completed'
        elif self.paid_amount > 0:
            self.payment_status = 'partial'
        
        # Update supplier balance
        if self.supplier:
            self.supplier.update_balance(-amount)
        
        db.session.commit()
    
    def receive_items(self, received_items=None):
        """Mark purchase as received and update inventory"""
        if received_items is None:
            # Receive all items
            for item in self.items:
                if item.product:
                    item.product.update_stock(
                        item.quantity, 
                        'purchase', 
                        f"Purchase {self.purchase_number}"
                    )
        else:
            # Receive specific items with quantities
            for item_data in received_items:
                item = PurchaseItem.query.get(item_data['item_id'])
                if item and item.product:
                    received_qty = item_data.get('received_quantity', item.quantity)
                    item.product.update_stock(
                        received_qty, 
                        'purchase', 
                        f"Purchase {self.purchase_number}"
                    )
        
        self.status = 'received'
        if self.paid_amount >= self.total_amount:
            self.status = 'completed'
        
        db.session.commit()
    
    def is_overdue(self):
        """Check if purchase is overdue"""
        return datetime.now().date() > self.due_date and self.balance_due > 0
    
    def days_overdue(self):
        """Get number of days overdue"""
        if self.is_overdue():
            return (datetime.now().date() - self.due_date).days
        return 0
    
    def approve(self, approved_by_user_id):
        """Approve purchase order"""
        self.approved_by = approved_by_user_id
        self.approved_at = datetime.utcnow()
        self.status = 'sent'
        db.session.commit()
    
    def cancel(self, reason=None):
        """Cancel purchase order"""
        self.status = 'cancelled'
        if reason:
            self.notes = f"{self.notes}\nCancelled: {reason}" if self.notes else f"Cancelled: {reason}"
        db.session.commit()
    
    def to_dict(self, include_items=False):
        """Convert purchase object to dictionary"""
        data = {
            'id': self.id,
            'purchase_number': self.purchase_number,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name if self.supplier else None,
            'purchase_date': self.purchase_date.isoformat(),
            'due_date': self.due_date.isoformat(),
            'delivery_date': self.delivery_date.isoformat() if self.delivery_date else None,
            'subtotal': self.subtotal,
            'discount_amount': self.discount_amount,
            'discount_percentage': self.discount_percentage,
            'tax_amount': self.tax_amount,
            'shipping_cost': self.shipping_cost,
            'total_amount': self.total_amount,
            'paid_amount': self.paid_amount,
            'balance_due': self.balance_due,
            'status': self.status,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'terms_conditions': self.terms_conditions,
            'reference': self.reference,
            'supplier_invoice_number': self.supplier_invoice_number,
            'delivery_address': self.delivery_address,
            'delivery_contact': self.delivery_contact,
            'delivery_phone': self.delivery_phone,
            'currency': self.currency,
            'exchange_rate': self.exchange_rate,
            'created_by': self.created_by,
            'approved_by': self.approved_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'is_overdue': self.is_overdue(),
            'days_overdue': self.days_overdue()
        }
        
        if include_items:
            data['items'] = [item.to_dict() for item in self.items]
        
        return data
    
    def __repr__(self):
        return f'<Purchase {self.purchase_number}>'


class PurchaseItem(db.Model):
    __tablename__ = 'purchase_items'
    
    id = db.Column(db.Integer, primary_key=True)
    purchase_id = db.Column(db.Integer, db.ForeignKey('purchases.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    
    # Item Details
    item_name = db.Column(db.String(200), nullable=False)
    item_description = db.Column(db.Text, nullable=True)
    
    # Quantity and Pricing
    quantity = db.Column(db.Float, nullable=False)
    received_quantity = db.Column(db.Float, default=0.0)
    unit_cost = db.Column(db.Float, nullable=False)
    discount_percentage = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    
    # Tax Information
    is_taxable = db.Column(db.Boolean, default=True)
    tax_rate = db.Column(db.Float, default=15.0)
    tax_amount = db.Column(db.Float, default=0.0)
    
    # Totals
    subtotal = db.Column(db.Float, default=0.0)  # quantity * unit_cost
    total_amount = db.Column(db.Float, default=0.0)  # subtotal - discount + tax
    
    # Unit
    unit = db.Column(db.String(20), default='piece')
    
    # Status
    status = db.Column(db.String(20), default='pending')  # pending, received, partial
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def calculate_totals(self):
        """Calculate item totals"""
        self.subtotal = self.quantity * self.unit_cost
        
        # Apply discount
        if self.discount_percentage > 0:
            self.discount_amount = self.subtotal * (self.discount_percentage / 100)
        
        # Calculate tax
        taxable_amount = self.subtotal - self.discount_amount
        if self.is_taxable:
            self.tax_amount = taxable_amount * (self.tax_rate / 100)
        else:
            self.tax_amount = 0
        
        # Calculate total
        self.total_amount = taxable_amount + self.tax_amount
        
        db.session.commit()
    
    def receive(self, quantity_received):
        """Mark item as received"""
        self.received_quantity += quantity_received
        
        if self.received_quantity >= self.quantity:
            self.status = 'received'
        elif self.received_quantity > 0:
            self.status = 'partial'
        
        db.session.commit()
    
    def to_dict(self):
        """Convert purchase item object to dictionary"""
        return {
            'id': self.id,
            'purchase_id': self.purchase_id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'item_name': self.item_name,
            'item_description': self.item_description,
            'quantity': self.quantity,
            'received_quantity': self.received_quantity,
            'unit': self.unit,
            'unit_cost': self.unit_cost,
            'discount_percentage': self.discount_percentage,
            'discount_amount': self.discount_amount,
            'is_taxable': self.is_taxable,
            'tax_rate': self.tax_rate,
            'tax_amount': self.tax_amount,
            'subtotal': self.subtotal,
            'total_amount': self.total_amount,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<PurchaseItem {self.item_name}>'
