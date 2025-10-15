from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import sys
import os

# Add the parent directory to the path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

db = SQLAlchemy()

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    name_en = db.Column(db.String(200), nullable=True)
    tax_number = db.Column(db.String(50), unique=True, nullable=True)
    commercial_register = db.Column(db.String(50), nullable=True)
    
    # Contact Information
    address = db.Column(db.Text, nullable=True)
    address_en = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), default='Saudi Arabia')
    postal_code = db.Column(db.String(20), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    fax = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    website = db.Column(db.String(200), nullable=True)
    
    # Business Information
    industry = db.Column(db.String(100), nullable=True)
    currency = db.Column(db.String(3), default='SAR')
    fiscal_year_start = db.Column(db.Date, nullable=True)
    
    # Settings
    logo_path = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    
    # VAT Settings
    vat_enabled = db.Column(db.Boolean, default=True)
    vat_rate = db.Column(db.Float, default=15.0)  # 15% VAT in Saudi Arabia
    vat_number = db.Column(db.String(50), nullable=True)
    
    # Invoice Settings
    invoice_prefix = db.Column(db.String(10), default='INV')
    invoice_counter = db.Column(db.Integer, default=1)
    purchase_prefix = db.Column(db.String(10), default='PUR')
    purchase_counter = db.Column(db.Integer, default=1)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_next_invoice_number(self):
        """Generate next invoice number"""
        number = f"{self.invoice_prefix}-{datetime.now().year}-{str(self.invoice_counter).zfill(3)}"
        self.invoice_counter += 1
        db.session.commit()
        return number
    
    def get_next_purchase_number(self):
        """Generate next purchase number"""
        number = f"{self.purchase_prefix}-{datetime.now().year}-{str(self.purchase_counter).zfill(3)}"
        self.purchase_counter += 1
        db.session.commit()
        return number
    
    def calculate_vat(self, amount):
        """Calculate VAT amount"""
        if self.vat_enabled:
            return round(amount * (self.vat_rate / 100), 2)
        return 0
    
    def to_dict(self):
        """Convert company object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'name_en': self.name_en,
            'tax_number': self.tax_number,
            'commercial_register': self.commercial_register,
            'address': self.address,
            'address_en': self.address_en,
            'city': self.city,
            'country': self.country,
            'postal_code': self.postal_code,
            'phone': self.phone,
            'fax': self.fax,
            'email': self.email,
            'website': self.website,
            'industry': self.industry,
            'currency': self.currency,
            'fiscal_year_start': self.fiscal_year_start.isoformat() if self.fiscal_year_start else None,
            'logo_path': self.logo_path,
            'is_active': self.is_active,
            'vat_enabled': self.vat_enabled,
            'vat_rate': self.vat_rate,
            'vat_number': self.vat_number,
            'invoice_prefix': self.invoice_prefix,
            'invoice_counter': self.invoice_counter,
            'purchase_prefix': self.purchase_prefix,
            'purchase_counter': self.purchase_counter,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Company {self.name}>'
