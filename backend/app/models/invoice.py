from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import sys
import os

# Add the parent directory to the path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

db = SQLAlchemy()

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    
    # Customer Information
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    # Dates
    invoice_date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    due_date = db.Column(db.Date, nullable=False)
    
    # Financial Information
    subtotal = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    discount_percentage = db.Column(db.Float, default=0.0)
    tax_amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, default=0.0)
    paid_amount = db.Column(db.Float, default=0.0)
    balance_due = db.Column(db.Float, default=0.0)
    
    # Status
    status = db.Column(db.String(20), default='draft')  # draft, sent, paid, overdue, cancelled
    payment_status = db.Column(db.String(20), default='unpaid')  # unpaid, partial, paid
    
    # Additional Information
    notes = db.Column(db.Text, nullable=True)
    terms_conditions = db.Column(db.Text, nullable=True)
    reference = db.Column(db.String(100), nullable=True)
    
    # Currency
    currency = db.Column(db.String(3), default='SAR')
    exchange_rate = db.Column(db.Float, default=1.0)
    
    # User Information
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('InvoiceItem', backref='invoice', lazy=True, cascade='all, delete-orphan')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_invoices', lazy=True)
    updater = db.relationship('User', foreign_keys=[updated_by], backref='updated_invoices', lazy=True)
    
    def calculate_totals(self):
        """Calculate invoice totals"""
        self.subtotal = sum(item.total_amount for item in self.items)
        
        # Apply discount
        if self.discount_percentage > 0:
            self.discount_amount = self.subtotal * (self.discount_percentage / 100)
        
        # Calculate tax
        taxable_amount = self.subtotal - self.discount_amount
        self.tax_amount = sum(item.tax_amount for item in self.items)
        
        # Calculate total
        self.total_amount = taxable_amount + self.tax_amount
        self.balance_due = self.total_amount - self.paid_amount
        
        db.session.commit()
    
    def add_payment(self, amount, payment_date=None, payment_method='cash', notes=None):
        """Add payment to invoice"""
        if payment_date is None:
            payment_date = datetime.now().date()
        
        self.paid_amount += amount
        self.balance_due = self.total_amount - self.paid_amount
        
        # Update payment status
        if self.balance_due <= 0:
            self.payment_status = 'paid'
            self.status = 'paid'
        elif self.paid_amount > 0:
            self.payment_status = 'partial'
        
        # Update customer balance
        if self.customer:
            self.customer.update_balance(-amount)
        
        db.session.commit()
    
    def is_overdue(self):
        """Check if invoice is overdue"""
        return datetime.now().date() > self.due_date and self.balance_due > 0
    
    def days_overdue(self):
        """Get number of days overdue"""
        if self.is_overdue():
            return (datetime.now().date() - self.due_date).days
        return 0
    
    def update_status(self):
        """Update invoice status based on current state"""
        if self.balance_due <= 0:
            self.status = 'paid'
            self.payment_status = 'paid'
        elif self.is_overdue():
            self.status = 'overdue'
        elif self.paid_amount > 0:
            self.payment_status = 'partial'
        
        db.session.commit()
    
    def to_dict(self, include_items=False):
        """Convert invoice object to dictionary"""
        data = {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name if self.customer else None,
            'invoice_date': self.invoice_date.isoformat(),
            'due_date': self.due_date.isoformat(),
            'subtotal': self.subtotal,
            'discount_amount': self.discount_amount,
            'discount_percentage': self.discount_percentage,
            'tax_amount': self.tax_amount,
            'total_amount': self.total_amount,
            'paid_amount': self.paid_amount,
            'balance_due': self.balance_due,
            'status': self.status,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'terms_conditions': self.terms_conditions,
            'reference': self.reference,
            'currency': self.currency,
            'exchange_rate': self.exchange_rate,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_overdue': self.is_overdue(),
            'days_overdue': self.days_overdue()
        }
        
        if include_items:
            data['items'] = [item.to_dict() for item in self.items]
        
        return data
    
    def __repr__(self):
        return f'<Invoice {self.invoice_number}>'


class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    
    # Item Details
    item_name = db.Column(db.String(200), nullable=False)
    item_description = db.Column(db.Text, nullable=True)
    
    # Quantity and Pricing
    quantity = db.Column(db.Float, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    discount_percentage = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    
    # Tax Information
    is_taxable = db.Column(db.Boolean, default=True)
    tax_rate = db.Column(db.Float, default=15.0)
    tax_amount = db.Column(db.Float, default=0.0)
    
    # Totals
    subtotal = db.Column(db.Float, default=0.0)  # quantity * unit_price
    total_amount = db.Column(db.Float, default=0.0)  # subtotal - discount + tax
    
    # Unit
    unit = db.Column(db.String(20), default='piece')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def calculate_totals(self):
        """Calculate item totals"""
        self.subtotal = self.quantity * self.unit_price
        
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
    
    def to_dict(self):
        """Convert invoice item object to dictionary"""
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'item_name': self.item_name,
            'item_description': self.item_description,
            'quantity': self.quantity,
            'unit': self.unit,
            'unit_price': self.unit_price,
            'discount_percentage': self.discount_percentage,
            'discount_amount': self.discount_amount,
            'is_taxable': self.is_taxable,
            'tax_rate': self.tax_rate,
            'tax_amount': self.tax_amount,
            'subtotal': self.subtotal,
            'total_amount': self.total_amount,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<InvoiceItem {self.item_name}>'
