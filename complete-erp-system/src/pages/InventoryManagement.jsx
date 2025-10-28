import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const InventoryManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [inventoryData, setInventoryData] = useState({
    products: [
      {
        id: 1,
        code: 'PRD-001',
        name: 'لابتوب ديل XPS 13',
        category: 'إلكترونيات',
        barcode: '1234567890123',
        unit: 'قطعة',
        costPrice: 2200,
        sellingPrice: 2500,
        currentStock: 15,
        minStock: 5,
        maxStock: 50,
        location: 'مخزن أ - رف 1',
        status: 'active',
        lastUpdated: '2025-10-12'
      },
      {
        id: 2,
        code: 'PRD-002',
        name: 'ماوس لاسلكي لوجيتك',
        category: 'إلكترونيات',
        barcode: '2345678901234',
        unit: 'قطعة',
        costPrice: 120,
        sellingPrice: 150,
        currentStock: 3,
        minStock: 10,
        maxStock: 100,
        location: 'مخزن أ - رف 2',
        status: 'active',
        lastUpdated: '2025-10-11'
      },
      {
        id: 3,
        code: 'PRD-003',
        name: 'طابعة HP LaserJet',
        category: 'إلكترونيات',
        barcode: '3456789012345',
        unit: 'قطعة',
        costPrice: 700,
        sellingPrice: 800,
        currentStock: 8,
        minStock: 3,
        maxStock: 20,
        location: 'مخزن ب - رف 1',
        status: 'active',
        lastUpdated: '2025-10-10'
      },
      {
        id: 4,
        code: 'PRD-004',
        name: 'ورق A4 - 500 ورقة',
        category: 'مكتبية',
        barcode: '4567890123456',
        unit: 'علبة',
        costPrice: 20,
        sellingPrice: 25,
        currentStock: 45,
        minStock: 20,
        maxStock: 200,
        location: 'مخزن ج - رف 1',
        status: 'active',
        lastUpdated: '2025-10-09'
      }
    ],
    movements: [
      {
        id: 1,
        productId: 1,
        productName: 'لابتوب ديل XPS 13',
        type: 'in',
        quantity: 10,
        reason: 'شراء جديد',
        reference: 'PUR-2025-001',
        date: '2025-10-12',
        user: 'أحمد محمد'
      },
      {
        id: 2,
        productId: 1,
        productName: 'لابتوب ديل XPS 13',
        type: 'out',
        quantity: 2,
        reason: 'مبيعات',
        reference: 'INV-2025-001',
        date: '2025-10-12',
        user: 'فاطمة أحمد'
      },
      {
        id: 3,
        productId: 2,
        productName: 'ماوس لاسلكي لوجيتك',
        type: 'out',
        quantity: 7,
        reason: 'مبيعات',
        reference: 'INV-2025-002',
        date: '2025-10-11',
        user: 'محمد حسن'
      },
      {
        id: 4,
        productId: 3,
        productName: 'طابعة HP LaserJet',
        type: 'in',
        quantity: 5,
        reason: 'شراء جديد',
        reference: 'PUR-2025-002',
        date: '2025-10-10',
        user: 'أحمد محمد'
      }
    ],
    categories: ['إلكترونيات', 'مكتبية', 'أثاث', 'أدوات', 'أخرى']
  });

  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    category: '',
    barcode: '',
    unit: 'قطعة',
    costPrice: 0,
    sellingPrice: 0,
    minStock: 0,
    maxStock: 0,
    location: '',
    description: ''
  });

  const [stockForm, setStockForm] = useState({
    productId: '',
    type: 'in',
    quantity: 0,
    reason: '',
    reference: '',
    notes: ''
  });

  const generateProductCode = () => {
    const nextNumber = inventoryData.products.length + 1;
    return `PRD-${String(nextNumber).padStart(3, '0')}`;
  };

  const generateBarcode = () => {
    return Math.random().toString().slice(2, 15);
  };

  const getStockStatus = (product) => {
    if (product.currentStock <= product.minStock) {
      return { status: 'low', color: 'text-red-600', text: 'مخزون منخفض' };
    } else if (product.currentStock >= product.maxStock) {
      return { status: 'high', color: 'text-orange-600', text: 'مخزون مرتفع' };
    } else {
      return { status: 'normal', color: 'text-green-600', text: 'مخزون طبيعي' };
    }
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.category) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    const newProduct = {
      id: selectedProduct ? selectedProduct.id : Date.now(),
      code: productForm.code || generateProductCode(),
      name: productForm.name,
      category: productForm.category,
      barcode: productForm.barcode || generateBarcode(),
      unit: productForm.unit,
      costPrice: parseFloat(productForm.costPrice) || 0,
      sellingPrice: parseFloat(productForm.sellingPrice) || 0,
      currentStock: selectedProduct ? selectedProduct.currentStock : 0,
      minStock: parseInt(productForm.minStock) || 0,
      maxStock: parseInt(productForm.maxStock) || 0,
      location: productForm.location,
      status: 'active',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    if (selectedProduct) {
      setInventoryData(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === selectedProduct.id ? newProduct : p)
      }));
      toast.success('تم تحديث المنتج بنجاح');
    } else {
      setInventoryData(prev => ({
        ...prev,
        products: [newProduct, ...prev.products]
      }));
      toast.success('تم إضافة المنتج بنجاح');
    }

    setShowProductModal(false);
    setSelectedProduct(null);
    setProductForm({
      code: '',
      name: '',
      category: '',
      barcode: '',
      unit: 'قطعة',
      costPrice: 0,
      sellingPrice: 0,
      minStock: 0,
      maxStock: 0,
      location: '',
      description: ''
    });
  };

  const handleStockMovement = () => {
    if (!stockForm.productId || !stockForm.quantity || !stockForm.reason) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const product = inventoryData.products.find(p => p.id === parseInt(stockForm.productId));
    if (!product) {
      toast.error('المنتج غير موجود');
      return;
    }

    const movement = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      type: stockForm.type,
      quantity: parseInt(stockForm.quantity),
      reason: stockForm.reason,
      reference: stockForm.reference,
      date: new Date().toISOString().split('T')[0],
      user: 'المستخدم الحالي'
    };

    // Update product stock
    const newStock = stockForm.type === 'in' 
      ? product.currentStock + parseInt(stockForm.quantity)
      : product.currentStock - parseInt(stockForm.quantity);

    if (newStock < 0) {
      toast.error('لا يمكن أن يكون المخزون أقل من الصفر');
      return;
    }

    setInventoryData(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === product.id 
          ? { ...p, currentStock: newStock, lastUpdated: new Date().toISOString().split('T')[0] }
          : p
      ),
      movements: [movement, ...prev.movements]
    }));

    setShowStockModal(false);
    setStockForm({
      productId: '',
      type: 'in',
      quantity: 0,
      reason: '',
      reference: '',
      notes: ''
    });

    toast.success('تم تحديث المخزون بنجاح');
  };

  const filteredProducts = inventoryData.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = inventoryData.products.filter(p => p.currentStock <= p.minStock);

  const ProductModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedProduct ? 'تعديل المنتج' : 'منتج جديد'}
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كود المنتج</label>
              <input
                type="text"
                value={productForm.code}
                onChange={(e) => setProductForm(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="سيتم إنشاؤه تلقائياً"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج *</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل اسم المنتج"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفئة *</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">اختر الفئة</option>
                {inventoryData.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
              <select
                value={productForm.unit}
                onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="قطعة">قطعة</option>
                <option value="كيلو">كيلو</option>
                <option value="لتر">لتر</option>
                <option value="متر">متر</option>
                <option value="علبة">علبة</option>
                <option value="حبة">حبة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سعر التكلفة</label>
              <input
                type="number"
                value={productForm.costPrice}
                onChange={(e) => setProductForm(prev => ({ ...prev, costPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع</label>
              <input
                type="number"
                value={productForm.sellingPrice}
                onChange={(e) => setProductForm(prev => ({ ...prev, sellingPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للمخزون</label>
              <input
                type="number"
                value={productForm.minStock}
                onChange={(e) => setProductForm(prev => ({ ...prev, minStock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للمخزون</label>
              <input
                type="number"
                value={productForm.maxStock}
                onChange={(e) => setProductForm(prev => ({ ...prev, maxStock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
              <div className="flex">
                <input
                  type="text"
                  value={productForm.barcode}
                  onChange={(e) => setProductForm(prev => ({ ...prev, barcode: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="سيتم إنشاؤه تلقائياً"
                />
                <button
                  type="button"
                  onClick={() => setProductForm(prev => ({ ...prev, barcode: generateBarcode() }))}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
                >
                  <QrCodeIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
              <input
                type="text"
                value={productForm.location}
                onChange={(e) => setProductForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="مخزن أ - رف 1"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
              setProductForm({
                code: '',
                name: '',
                category: '',
                barcode: '',
                unit: 'قطعة',
                costPrice: 0,
                sellingPrice: 0,
                minStock: 0,
                maxStock: 0,
                location: '',
                description: ''
              });
            }}
            className="btn btn-outline"
          >
            إلغاء
          </button>
          <button
            onClick={handleSaveProduct}
            className="btn btn-primary"
          >
            حفظ المنتج
          </button>
        </div>
      </div>
    </div>
  );

  const StockModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">حركة مخزون</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المنتج *</label>
            <select
              value={stockForm.productId}
              onChange={(e) => setStockForm(prev => ({ ...prev, productId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">اختر المنتج</option>
              {inventoryData.products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (المخزون الحالي: {product.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحركة *</label>
            <select
              value={stockForm.type}
              onChange={(e) => setStockForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="in">وارد</option>
              <option value="out">صادر</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الكمية *</label>
            <input
              type="number"
              value={stockForm.quantity}
              onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السبب *</label>
            <select
              value={stockForm.reason}
              onChange={(e) => setStockForm(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">اختر السبب</option>
              <option value="شراء جديد">شراء جديد</option>
              <option value="مبيعات">مبيعات</option>
              <option value="تسوية مخزون">تسوية مخزون</option>
              <option value="إرجاع">إرجاع</option>
              <option value="تلف">تلف</option>
              <option value="نقل">نقل</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المرجع</label>
            <input
              type="text"
              value={stockForm.reference}
              onChange={(e) => setStockForm(prev => ({ ...prev, reference: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="رقم الفاتورة أو المرجع"
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => {
              setShowStockModal(false);
              setStockForm({
                productId: '',
                type: 'in',
                quantity: 0,
                reason: '',
                reference: '',
                notes: ''
              });
            }}
            className="btn btn-outline"
          >
            إلغاء
          </button>
          <button
            onClick={handleStockMovement}
            className="btn btn-primary"
          >
            حفظ الحركة
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inventory')}</h1>
          <p className="text-gray-600">إدارة المخزون والمنتجات</p>
        </div>
        <div className="flex space-x-3 rtl:space-x-reverse mt-4 sm:mt-0">
          <button
            onClick={() => setShowStockModal(true)}
            className="btn btn-secondary"
          >
            <ArrowUpIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
            حركة مخزون
          </button>
          <button
            onClick={() => setShowProductModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
            منتج جديد
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2 rtl:ml-2 rtl:mr-0" />
            <span className="text-red-800 font-medium">
              تحذير: {lowStockProducts.length} منتج بمخزون منخفض
            </span>
          </div>
          <div className="mt-2 text-sm text-red-700">
            {lowStockProducts.map(product => (
              <span key={product.id} className="inline-block bg-red-100 rounded px-2 py-1 mr-2 rtl:ml-2 rtl:mr-0 mb-1">
                {product.name} ({product.currentStock})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
          {[
            { key: 'products', label: 'المنتجات' },
            { key: 'movements', label: 'حركة المخزون' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {activeTab === 'products' && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الفئات</option>
              {inventoryData.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          )}
        </div>
        <button className="btn btn-outline">
          <DocumentArrowDownIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
          تصدير
        </button>
      </div>

      {/* Content */}
      {activeTab === 'products' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">
                    كود المنتج
                  </th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">اسم المنتج</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الفئة</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">المخزون الحالي</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">سعر البيع</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">حالة المخزون</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {product.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-gray-500">{product.location}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${stockStatus.color}`}>
                          {product.currentStock} {product.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {product.sellingPrice.toFixed(2)} ر.س
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setProductForm({
                                code: product.code,
                                name: product.name,
                                category: product.category,
                                barcode: product.barcode,
                                unit: product.unit,
                                costPrice: product.costPrice,
                                sellingPrice: product.sellingPrice,
                                minStock: product.minStock,
                                maxStock: product.maxStock,
                                location: product.location,
                                description: ''
                              });
                              setShowProductModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="تعديل"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من الحذف؟')) {
                                setInventoryData(prev => ({
                                  ...prev,
                                  products: prev.products.filter(p => p.id !== product.id)
                                }));
                                toast.success('تم حذف المنتج بنجاح');
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="حذف"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">السبب</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">المرجع</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">المستخدم</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryData.movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{movement.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {movement.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {movement.type === 'in' ? (
                          <ArrowUpIcon className="w-4 h-4 text-green-600 mr-1 rtl:ml-1 rtl:mr-0" />
                        ) : (
                          <ArrowDownIcon className="w-4 h-4 text-red-600 mr-1 rtl:ml-1 rtl:mr-0" />
                        )}
                        <span className={movement.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                          {movement.type === 'in' ? 'وارد' : 'صادر'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{movement.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{movement.reference}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{movement.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showProductModal && <ProductModal />}
      {showStockModal && <StockModal />}
    </div>
  );
};

export default InventoryManagement;
