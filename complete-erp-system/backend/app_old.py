from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///erp_system.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
cors = CORS(app)
bcrypt = Bcrypt(app)

# Import models
from app.models.user import User
from app.models.company import Company
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.category import Category
from app.models.invoice import Invoice, InvoiceItem
from app.models.purchase import Purchase, PurchaseItem
from app.models.inventory import InventoryMovement
from app.models.account import Account
from app.models.journal import JournalEntry, JournalEntryLine
from app.models.voucher import Voucher

# Import routes
from app.routes.auth import auth_bp
from app.routes.companies import companies_bp
from app.routes.customers import customers_bp
from app.routes.suppliers import suppliers_bp
from app.routes.products import products_bp
from app.routes.invoices import invoices_bp
from app.routes.purchases import purchases_bp
from app.routes.inventory import inventory_bp
from app.routes.accounting import accounting_bp
from app.routes.reports import reports_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(companies_bp, url_prefix='/api/companies')
app.register_blueprint(customers_bp, url_prefix='/api/customers')
app.register_blueprint(suppliers_bp, url_prefix='/api/suppliers')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(invoices_bp, url_prefix='/api/invoices')
app.register_blueprint(purchases_bp, url_prefix='/api/purchases')
app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
app.register_blueprint(accounting_bp, url_prefix='/api/accounting')
app.register_blueprint(reports_bp, url_prefix='/api/reports')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token is required'}), 401

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

# Initialize database
@app.before_first_request
def create_tables():
    db.create_all()
    
    # Create default admin user if not exists
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(
            username='admin',
            email='admin@example.com',
            name='System Administrator',
            role='admin',
            is_active=True
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        
        # Create default company
        default_company = Company(
            name='شركة تجريبية',
            tax_number='300123456789003',
            address='الرياض، المملكة العربية السعودية',
            phone='0112345678',
            email='info@company.com',
            currency='SAR',
            is_active=True
        )
        db.session.add(default_company)
        
        # Create default chart of accounts
        accounts = [
            Account(code='1001', name='النقدية', type='asset', balance=0),
            Account(code='1002', name='البنك', type='asset', balance=0),
            Account(code='1101', name='العملاء', type='asset', balance=0),
            Account(code='1201', name='المخزون', type='asset', balance=0),
            Account(code='2001', name='الموردين', type='liability', balance=0),
            Account(code='2101', name='ضريبة القيمة المضافة', type='liability', balance=0),
            Account(code='3001', name='رأس المال', type='equity', balance=0),
            Account(code='4001', name='إيرادات المبيعات', type='revenue', balance=0),
            Account(code='5001', name='تكلفة البضاعة المباعة', type='expense', balance=0),
            Account(code='5101', name='مصاريف التشغيل', type='expense', balance=0)
        ]
        
        for account in accounts:
            db.session.add(account)
        
        # Create default categories
        categories = [
            Category(name='إلكترونيات', description='الأجهزة الإلكترونية'),
            Category(name='مكتبية', description='المستلزمات المكتبية'),
            Category(name='أثاث', description='الأثاث المكتبي'),
            Category(name='أدوات', description='الأدوات المختلفة')
        ]
        
        for category in categories:
            db.session.add(category)
        
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
