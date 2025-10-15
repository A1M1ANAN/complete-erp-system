from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import sys
import os

# Add the parent directory to the path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='employee')  # admin, manager, employee
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Permissions
    permissions = db.Column(db.JSON, default={
        'sales': {'read': True, 'write': True, 'delete': False},
        'purchases': {'read': True, 'write': True, 'delete': False},
        'inventory': {'read': True, 'write': True, 'delete': False},
        'customers': {'read': True, 'write': True, 'delete': False},
        'suppliers': {'read': True, 'write': True, 'delete': False},
        'accounting': {'read': False, 'write': False, 'delete': False},
        'reports': {'read': True, 'write': False, 'delete': False},
        'settings': {'read': False, 'write': False, 'delete': False}
    })
    
    # Relationships
    company = db.relationship('Company', backref='users', lazy=True)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def has_permission(self, module, action):
        """Check if user has specific permission"""
        if self.role == 'admin':
            return True
        
        if module in self.permissions:
            return self.permissions[module].get(action, False)
        
        return False
    
    def set_permissions(self, permissions):
        """Set user permissions"""
        self.permissions = permissions
        db.session.commit()
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'company_id': self.company_id,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat(),
            'permissions': self.permissions
        }
    
    @staticmethod
    def get_default_permissions(role):
        """Get default permissions based on role"""
        if role == 'admin':
            return {
                'sales': {'read': True, 'write': True, 'delete': True},
                'purchases': {'read': True, 'write': True, 'delete': True},
                'inventory': {'read': True, 'write': True, 'delete': True},
                'customers': {'read': True, 'write': True, 'delete': True},
                'suppliers': {'read': True, 'write': True, 'delete': True},
                'accounting': {'read': True, 'write': True, 'delete': True},
                'reports': {'read': True, 'write': True, 'delete': True},
                'settings': {'read': True, 'write': True, 'delete': True}
            }
        elif role == 'manager':
            return {
                'sales': {'read': True, 'write': True, 'delete': True},
                'purchases': {'read': True, 'write': True, 'delete': True},
                'inventory': {'read': True, 'write': True, 'delete': False},
                'customers': {'read': True, 'write': True, 'delete': False},
                'suppliers': {'read': True, 'write': True, 'delete': False},
                'accounting': {'read': True, 'write': False, 'delete': False},
                'reports': {'read': True, 'write': False, 'delete': False},
                'settings': {'read': True, 'write': False, 'delete': False}
            }
        else:  # employee
            return {
                'sales': {'read': True, 'write': True, 'delete': False},
                'purchases': {'read': True, 'write': True, 'delete': False},
                'inventory': {'read': True, 'write': True, 'delete': False},
                'customers': {'read': True, 'write': True, 'delete': False},
                'suppliers': {'read': True, 'write': False, 'delete': False},
                'accounting': {'read': False, 'write': False, 'delete': False},
                'reports': {'read': True, 'write': False, 'delete': False},
                'settings': {'read': False, 'write': False, 'delete': False}
            }
    
    def __repr__(self):
        return f'<User {self.username}>'
