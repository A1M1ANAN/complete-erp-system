from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import sys
import os

# Add the parent directory to the path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

db = SQLAlchemy()

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    name_en = db.Column(db.String(200), nullable=True)
    
    # Customer Type
    type = db.Column(db.String(20), nullable=False, default='individual')  # individual, company
    
    # Contact Information
    phone = db.Column(db.String(20), nullable=True)
    mobile = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    website = db.Column(db.String(200), nullable=True)
    
    # Address Information
    address = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), default='Saudi Arabia')
    postal_code = db.Column(db.String(20), nullable=True)
    
    # Business Information
    tax_number = db.Column(db.String(50), nullable=True)
    commercial_register = db.Column(db.String(50), nullable=True)
    industry = db.Column(db.String(100), nullable=True)
    
    # Financial Information
    credit_limit = db.Column(db.Float, default=0.0)
    current_balance = db.Column(db.Float, default=0.0)  # Positive = Customer owes us
    payment_terms = db.Column(db.Integer, default=30)  # Days
    currency = db.Column(db.String(3), default='SAR')
    
    # Sales Information
    total_purchases = db.Column(db.Float, default=0.0)
    last_purchase_date = db.Column(db.Date, nullable=True)
    discount_percentage = db.Column(db.Float, default=0.0)
    
    # Status and Settings
    status = db.Column(db.String(20), default='active')  # active, inactive, blocked
    is_vat_exempt = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    invoices = db.relationship('Invoice', backref='customer', lazy=True)
    
    def update_balance(self, amount):
        """Update customer balance"""
        self.current_balance += amount
        db.session.commit()
    
    def update_total_purchases(self, amount):
        """Update total purchases"""
        self.total_purchases += amount
        self.last_purchase_date = datetime.now().date()
        db.session.commit()
    
    def get_credit_available(self):
        """Get available credit"""
        return max(0, self.credit_limit - self.current_balance)
    
    def is_credit_exceeded(self, amount=0):
        """Check if credit limit would be exceeded"""
        return (self.current_balance + amount) > self.credit_limit
    
    def get_aging_analysis(self):
        """Get customer aging analysis"""
        from app.models.invoice import Invoice
        from sqlalchemy import and_
        
        today = datetime.now().date()
        
        # Get unpaid invoices
        unpaid_invoices = Invoice.query.filter(
            and_(
                Invoice.customer_id == self.id,
                Invoice.status.in_(['pending', 'overdue']),
                Invoice.balance_due > 0
            )
        ).all()
        
        aging = {
            'current': 0,      # 0-30 days
            'days_31_60': 0,   # 31-60 days
            'days_61_90': 0,   # 61-90 days
            'over_90': 0       # Over 90 days
        }
        
        for invoice in unpaid_invoices:
            days_overdue = (today - invoice.due_date).days
            
            if days_overdue <= 30:
                aging['current'] += invoice.balance_due
            elif days_overdue <= 60:
                aging['days_31_60'] += invoice.balance_due
            elif days_overdue <= 90:
                aging['days_61_90'] += invoice.balance_due
            else:
                aging['over_90'] += invoice.balance_due
        
        return aging
    
    def to_dict(self, include_aging=False):
        """Convert customer object to dictionary"""
        data = {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'name_en': self.name_en,
            'type': self.type,
            'phone': self.phone,
            'mobile': self.mobile,
            'email': self.email,
            'website': self.website,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'postal_code': self.postal_code,
            'tax_number': self.tax_number,
            'commercial_register': self.commercial_register,
            'industry': self.industry,
            'credit_limit': self.credit_limit,
            'current_balance': self.current_balance,
            'payment_terms': self.payment_terms,
            'currency': self.currency,
            'total_purchases': self.total_purchases,
            'last_purchase_date': self.last_purchase_date.isoformat() if self.last_purchase_date else None,
            'discount_percentage': self.discount_percentage,
            'status': self.status,
            'is_vat_exempt': self.is_vat_exempt,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'credit_available': self.get_credit_available()
        }
        
        if include_aging:
            data['aging_analysis'] = self.get_aging_analysis()
        
        return data
    
    @staticmethod
    def generate_code():
        """Generate next customer code"""
        last_customer = Customer.query.order_by(Customer.id.desc()).first()
        if last_customer:
            last_number = int(last_customer.code.split('-')[1])
            return f"CUS-{str(last_number + 1).zfill(3)}"
        return "CUS-001"
    
    def __repr__(self):
        return f'<Customer {self.code}: {self.name}>'
