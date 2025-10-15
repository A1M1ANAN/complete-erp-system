#!/usr/bin/env python3
"""
نظام ERP المتكامل - الخادم الرئيسي
Complete ERP System - Main Server Application
"""

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime, timedelta
import os
from werkzeug.security import generate_password_hash

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key-change-this-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Database configuration
database_url = os.environ.get('DATABASE_URL', 'sqlite:///erp_system.db')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

# Import models
from app.models.user import User
from app.models.company import Company
from app.models.customer import Customer
from app.models.supplier import Supplier
from app.models.product import Product, Category
from app.models.invoice import Invoice, InvoiceItem
from app.models.purchase import Purchase, PurchaseItem
from app.models.inventory import InventoryMovement, Warehouse, WarehouseStock, StockAdjustment, StockAdjustmentItem
from app.models.accounting import Account, JournalEntry, JournalEntryLine, Payment

# Import routes
from app.routes.auth import auth_bp
from app.routes.products import products_bp

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'success': False,
        'message': 'Token has expired'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'success': False,
        'message': 'Invalid token'
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        'success': False,
        'message': 'Authorization token is required'
    }), 401

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'message': 'Bad request'
    }), 400

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'ERP System is running',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }), 200

# System info endpoint
@app.route('/api/system-info', methods=['GET'])
def system_info():
    """Get system information"""
    try:
        # Count records
        users_count = User.query.count()
        companies_count = Company.query.count()
        customers_count = Customer.query.count()
        suppliers_count = Supplier.query.count()
        products_count = Product.query.count()
        invoices_count = Invoice.query.count()
        purchases_count = Purchase.query.count()
        
        return jsonify({
            'success': True,
            'data': {
                'system_name': 'نظام ERP المتكامل',
                'system_name_en': 'Complete ERP System',
                'version': '1.0.0',
                'database_type': 'SQLite' if 'sqlite' in database_url else 'PostgreSQL',
                'statistics': {
                    'users': users_count,
                    'companies': companies_count,
                    'customers': customers_count,
                    'suppliers': suppliers_count,
                    'products': products_count,
                    'invoices': invoices_count,
                    'purchases': purchases_count
                },
                'features': [
                    'إدارة المبيعات والمشتريات',
                    'إدارة المخزون',
                    'النظام المحاسبي المتكامل',
                    'إدارة العملاء والموردين',
                    'نظام التقارير المتقدم',
                    'دعم متعدد اللغات',
                    'إدارة المستخدمين والصلاحيات'
                ]
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get system info: {str(e)}'
        }), 500

def create_default_data():
    """Create default data for the system"""
    try:
        # Create default admin user if not exists
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            admin_user = User(
                username='admin',
                email='admin@erp-system.com',
                name='مدير النظام',
                role='admin',
                is_active=True
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            print("✅ تم إنشاء المستخدم الافتراضي: admin / admin123")
        
        # Create default company if not exists
        default_company = Company.query.first()
        if not default_company:
            default_company = Company(
                name='شركة تجريبية',
                name_en='Demo Company',
                email='info@demo-company.com',
                phone='+966501234567',
                address='الرياض، المملكة العربية السعودية',
                city='الرياض',
                country='Saudi Arabia',
                tax_number='123456789012345',
                currency='SAR',
                is_active=True
            )
            db.session.add(default_company)
            print("✅ تم إنشاء الشركة الافتراضية")
        
        # Create default chart of accounts
        accounts_data = [
            {'code': '1000', 'name': 'الأصول', 'name_en': 'Assets', 'account_type': 'asset', 'normal_balance': 'debit'},
            {'code': '1100', 'name': 'النقدية', 'name_en': 'Cash', 'account_type': 'asset', 'normal_balance': 'debit', 'parent_code': '1000'},
            {'code': '1200', 'name': 'العملاء', 'name_en': 'Accounts Receivable', 'account_type': 'asset', 'normal_balance': 'debit', 'parent_code': '1000'},
            {'code': '1300', 'name': 'المخزون', 'name_en': 'Inventory', 'account_type': 'asset', 'normal_balance': 'debit', 'parent_code': '1000'},
            {'code': '2000', 'name': 'الخصوم', 'name_en': 'Liabilities', 'account_type': 'liability', 'normal_balance': 'credit'},
            {'code': '2100', 'name': 'الموردين', 'name_en': 'Accounts Payable', 'account_type': 'liability', 'normal_balance': 'credit', 'parent_code': '2000'},
            {'code': '3000', 'name': 'حقوق الملكية', 'name_en': 'Equity', 'account_type': 'equity', 'normal_balance': 'credit'},
            {'code': '4000', 'name': 'الإيرادات', 'name_en': 'Revenue', 'account_type': 'revenue', 'normal_balance': 'credit'},
            {'code': '4100', 'name': 'مبيعات', 'name_en': 'Sales', 'account_type': 'revenue', 'normal_balance': 'credit', 'parent_code': '4000'},
            {'code': '5000', 'name': 'المصروفات', 'name_en': 'Expenses', 'account_type': 'expense', 'normal_balance': 'debit'},
            {'code': '5100', 'name': 'تكلفة البضاعة المباعة', 'name_en': 'Cost of Goods Sold', 'account_type': 'expense', 'normal_balance': 'debit', 'parent_code': '5000'}
        ]
        
        for account_data in accounts_data:
            existing_account = Account.query.filter_by(code=account_data['code']).first()
            if not existing_account:
                parent_id = None
                if 'parent_code' in account_data:
                    parent = Account.query.filter_by(code=account_data['parent_code']).first()
                    if parent:
                        parent_id = parent.id
                
                account = Account(
                    code=account_data['code'],
                    name=account_data['name'],
                    name_en=account_data['name_en'],
                    account_type=account_data['account_type'],
                    normal_balance=account_data['normal_balance'],
                    parent_id=parent_id,
                    is_system_account=True
                )
                db.session.add(account)
        
        print("✅ تم إنشاء دليل الحسابات الافتراضي")
        
        # Create default warehouse
        default_warehouse = Warehouse.query.first()
        if not default_warehouse:
            default_warehouse = Warehouse(
                code='WH001',
                name='المستودع الرئيسي',
                description='المستودع الافتراضي للنظام',
                address='الرياض، المملكة العربية السعودية',
                city='الرياض',
                country='Saudi Arabia',
                is_active=True,
                is_default=True
            )
            db.session.add(default_warehouse)
            print("✅ تم إنشاء المستودع الافتراضي")
        
        # Create sample categories
        categories_data = [
            {'name': 'إلكترونيات', 'name_en': 'Electronics'},
            {'name': 'ملابس', 'name_en': 'Clothing'},
            {'name': 'أغذية', 'name_en': 'Food'},
            {'name': 'كتب', 'name_en': 'Books'},
            {'name': 'أدوات منزلية', 'name_en': 'Home Appliances'}
        ]
        
        for cat_data in categories_data:
            existing_category = Category.query.filter_by(name=cat_data['name']).first()
            if not existing_category:
                category = Category(
                    name=cat_data['name'],
                    name_en=cat_data['name_en'],
                    is_active=True
                )
                db.session.add(category)
        
        print("✅ تم إنشاء الفئات الافتراضية")
        
        db.session.commit()
        print("✅ تم إنشاء جميع البيانات الافتراضية بنجاح")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ خطأ في إنشاء البيانات الافتراضية: {str(e)}")

def init_database():
    """Initialize database"""
    try:
        with app.app_context():
            # Create all tables
            db.create_all()
            print("✅ تم إنشاء جداول قاعدة البيانات")
            
            # Create default data
            create_default_data()
            
    except Exception as e:
        print(f"❌ خطأ في تهيئة قاعدة البيانات: {str(e)}")

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    # Print startup message
    print("\n" + "="*60)
    print("🚀 نظام ERP المتكامل - Complete ERP System")
    print("="*60)
    print("🌐 الخادم يعمل على: http://localhost:5000")
    print("📚 API Documentation: http://localhost:5000/api/health")
    print("👤 المستخدم الافتراضي: admin / admin123")
    print("="*60)
    print("اضغط Ctrl+C لإيقاف الخادم")
    print("="*60 + "\n")
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    )
