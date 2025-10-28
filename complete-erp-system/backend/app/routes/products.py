from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, and_
import sys
import os

# Add the parent directory to the path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.models.product import Product, Category, db
from app.models.user import User

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('/', methods=['GET'])
@jwt_required()
def get_products():
    """Get all products with filtering and pagination"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search', '')
        category_id = request.args.get('category_id', type=int)
        status = request.args.get('status', 'active')
        low_stock = request.args.get('low_stock', type=bool)
        
        # Build query
        query = Product.query
        
        # Apply filters
        if search:
            query = query.filter(or_(
                Product.name.contains(search),
                Product.code.contains(search),
                Product.barcode.contains(search)
            ))
        
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        if status != 'all':
            query = query.filter(Product.status == status)
        
        if low_stock:
            query = query.filter(Product.current_stock <= Product.minimum_stock)
        
        # Order by name
        query = query.order_by(Product.name)
        
        # Paginate
        products = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': {
                'products': [product.to_dict() for product in products.items],
                'pagination': {
                    'page': page,
                    'pages': products.pages,
                    'per_page': per_page,
                    'total': products.total,
                    'has_next': products.has_next,
                    'has_prev': products.has_prev
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get products: {str(e)}'
        }), 500

@products_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """Get single product by ID"""
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': product.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get product: {str(e)}'
        }), 500

@products_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    """Create new product"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user.has_permission('create_product'):
            return jsonify({
                'success': False,
                'message': 'Permission denied'
            }), 403
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['name', 'selling_price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Generate product code if not provided
        code = data.get('code') or Product.generate_code()
        
        # Check if code already exists
        if Product.query.filter_by(code=code).first():
            return jsonify({
                'success': False,
                'message': 'Product code already exists'
            }), 400
        
        # Create product
        product = Product(
            code=code,
            name=data['name'],
            name_en=data.get('name_en'),
            description=data.get('description'),
            description_en=data.get('description_en'),
            category_id=data.get('category_id'),
            brand=data.get('brand'),
            model=data.get('model'),
            type=data.get('type', 'product'),
            cost_price=data.get('cost_price', 0),
            selling_price=data['selling_price'],
            min_selling_price=data.get('min_selling_price', 0),
            wholesale_price=data.get('wholesale_price', 0),
            is_taxable=data.get('is_taxable', True),
            tax_rate=data.get('tax_rate', 15.0),
            track_inventory=data.get('track_inventory', True),
            current_stock=data.get('current_stock', 0),
            minimum_stock=data.get('minimum_stock', 0),
            maximum_stock=data.get('maximum_stock', 0),
            reorder_point=data.get('reorder_point', 0),
            reorder_quantity=data.get('reorder_quantity', 0),
            unit=data.get('unit', 'piece'),
            unit_en=data.get('unit_en', 'piece'),
            weight=data.get('weight'),
            dimensions=data.get('dimensions'),
            barcode=data.get('barcode'),
            sku=data.get('sku'),
            preferred_supplier_id=data.get('preferred_supplier_id'),
            supplier_code=data.get('supplier_code'),
            status=data.get('status', 'active'),
            is_featured=data.get('is_featured', False),
            allow_negative_stock=data.get('allow_negative_stock', False),
            image_path=data.get('image_path'),
            notes=data.get('notes')
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product created successfully',
            'data': product.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Failed to create product: {str(e)}'
        }), 500

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update product"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user.has_permission('update_product'):
            return jsonify({
                'success': False,
                'message': 'Permission denied'
            }), 403
        
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # Update product fields
        updatable_fields = [
            'name', 'name_en', 'description', 'description_en', 'category_id',
            'brand', 'model', 'type', 'cost_price', 'selling_price',
            'min_selling_price', 'wholesale_price', 'is_taxable', 'tax_rate',
            'track_inventory', 'minimum_stock', 'maximum_stock', 'reorder_point',
            'reorder_quantity', 'unit', 'unit_en', 'weight', 'dimensions',
            'barcode', 'sku', 'preferred_supplier_id', 'supplier_code',
            'status', 'is_featured', 'allow_negative_stock', 'image_path'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(product, field, data[field])
        
        # Check if code is being updated
        if 'code' in data and data['code'] != product.code:
            if Product.query.filter_by(code=data['code']).first():
                return jsonify({
                    'success': False,
                    'message': 'Product code already exists'
                }), 400
            product.code = data['code']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product updated successfully',
            'data': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Failed to update product: {str(e)}'
        }), 500

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete product"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user.has_permission('delete_product'):
            return jsonify({
                'success': False,
                'message': 'Permission denied'
            }), 403
        
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        # Check if product has transactions
        if product.invoice_items or product.purchase_items:
            return jsonify({
                'success': False,
                'message': 'Cannot delete product with existing transactions'
            }), 400
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Failed to delete product: {str(e)}'
        }), 500

@products_bp.route('/<int:product_id>/stock', methods=['PUT'])
@jwt_required()
def update_stock(product_id):
    """Update product stock"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user.has_permission('update_stock'):
            return jsonify({
                'success': False,
                'message': 'Permission denied'
            }), 403
        
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({
                'success': False,
                'message': 'Product not found'
            }), 404
        
        data = request.get_json()
        
        if not data or 'quantity' not in data:
            return jsonify({
                'success': False,
                'message': 'Quantity is required'
            }), 400
        
        quantity = data['quantity']
        movement_type = data.get('movement_type', 'adjustment')
        reference = data.get('reference', 'Manual adjustment')
        
        # Update stock
        product.update_stock(quantity, movement_type, reference)
        
        return jsonify({
            'success': True,
            'message': 'Stock updated successfully',
            'data': {
                'product_id': product.id,
                'new_stock': product.current_stock,
                'quantity_changed': quantity
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Failed to update stock: {str(e)}'
        }), 500

@products_bp.route('/low-stock', methods=['GET'])
@jwt_required()
def get_low_stock_products():
    """Get products with low stock"""
    try:
        products = Product.query.filter(
            and_(
                Product.track_inventory == True,
                Product.current_stock <= Product.minimum_stock,
                Product.status == 'active'
            )
        ).order_by(Product.name).all()
        
        return jsonify({
            'success': True,
            'data': [product.to_dict() for product in products]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get low stock products: {str(e)}'
        }), 500

@products_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get all categories"""
    try:
        categories = Category.query.filter_by(is_active=True).order_by(Category.name).all()
        
        return jsonify({
            'success': True,
            'data': [category.to_dict(include_products_count=True) for category in categories]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get categories: {str(e)}'
        }), 500

@products_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    """Create new category"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user.has_permission('create_category'):
            return jsonify({
                'success': False,
                'message': 'Permission denied'
            }), 403
        
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({
                'success': False,
                'message': 'Category name is required'
            }), 400
        
        category = Category(
            name=data['name'],
            name_en=data.get('name_en'),
            description=data.get('description'),
            description_en=data.get('description_en'),
            parent_id=data.get('parent_id'),
            level=data.get('level', 1),
            sort_order=data.get('sort_order', 0),
            is_active=data.get('is_active', True),
            image_path=data.get('image_path'),
            slug=data.get('slug')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Category created successfully',
            'data': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Failed to create category: {str(e)}'
        }), 500
