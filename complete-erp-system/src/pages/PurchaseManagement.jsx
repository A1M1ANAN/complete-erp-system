import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PurchaseManagement = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  
  const [purchaseData, setPurchaseData] = useState([
    {
      id: 1,
      purchaseNumber: 'PUR-2025-001',
      supplier: { id: 1, name: 'شركة التوريد المتقدمة', phone: '0112345678' },
      date: '2025-10-12',
      dueDate: '2025-10-27',
      receivedDate: '2025-10-13',
      items: [
        { id: 1, product: 'لابتوب ديل', quantity: 10, unitPrice: 2200, total: 22000 },
        { id: 2, product: 'ماوس لاسلكي', quantity: 50, unitPrice: 120, total: 6000 }
      ],
      subtotal: 28000,
      taxRate: 15,
      taxAmount: 4200,
      discount: 500,
      total: 31700,
      status: 'received',
      paymentStatus: 'paid'
    },
    {
      id: 2,
      purchaseNumber: 'PUR-2025-002',
      supplier: { id: 2, name: 'مؤسسة الجودة للتجارة', phone: '0118765432' },
      date: '2025-10-11',
      dueDate: '2025-10-26',
      receivedDate: null,
      items: [
        { id: 1, product: 'طابعة HP', quantity: 5, unitPrice: 700, total: 3500 },
        { id: 2, product: 'ورق A4', quantity: 100, unitPrice: 20, total: 2000 }
      ],
      subtotal: 5500,
      taxRate: 15,
      taxAmount: 825,
      discount: 0,
      total: 6325,
      status: 'pending',
      paymentStatus: 'pending'
    },
    {
      id: 3,
      purchaseNumber: 'PUR-2025-003',
      supplier: { id: 3, name: 'شركة الإمدادات الشاملة', phone: '0115555555' },
      date: '2025-10-10',
      dueDate: '2025-10-25',
      receivedDate: '2025-10-12',
      items: [
        { id: 1, product: 'كيبورد ميكانيكي', quantity: 20, unitPrice: 250, total: 5000 }
      ],
      subtotal: 5000,
      taxRate: 15,
      taxAmount: 750,
      discount: 200,
      total: 5550,
      status: 'received',
      paymentStatus: 'partial'
    }
  ]);

  const [purchaseForm, setPurchaseForm] = useState({
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ product: '', quantity: 1, unitPrice: 0, total: 0 }],
    discount: 0,
    taxRate: 15,
    notes: ''
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      received: { color: 'bg-green-100 text-green-800', text: 'مستلم' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'معلق' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'ملغي' },
      partial: { color: 'bg-blue-100 text-blue-800', text: 'جزئي' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', text: 'مدفوع' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'معلق' },
      partial: { color: 'bg-blue-100 text-blue-800', text: 'جزئي' },
      overdue: { color: 'bg-red-100 text-red-800', text: 'متأخر' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleAddItem = () => {
    setPurchaseForm(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setPurchaseForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setPurchaseForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
      }
      
      return { ...prev, items: newItems };
    });
  };

  const calculateTotals = () => {
    const subtotal = purchaseForm.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * purchaseForm.taxRate) / 100;
    const total = subtotal + taxAmount - purchaseForm.discount;
    
    return { subtotal, taxAmount, total };
  };

  const handleSavePurchase = () => {
    const { subtotal, taxAmount, total } = calculateTotals();
    
    const newPurchase = {
      id: Date.now(),
      purchaseNumber: `PUR-2025-${String(purchaseData.length + 1).padStart(3, '0')}`,
      supplier: { id: 1, name: purchaseForm.supplier, phone: '0112345678' },
      date: purchaseForm.date,
      dueDate: purchaseForm.dueDate,
      receivedDate: null,
      items: purchaseForm.items,
      subtotal,
      taxRate: purchaseForm.taxRate,
      taxAmount,
      discount: purchaseForm.discount,
      total,
      status: 'pending',
      paymentStatus: 'pending'
    };

    setPurchaseData(prev => [newPurchase, ...prev]);
    setShowPurchaseModal(false);
    setPurchaseForm({
      supplier: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [{ product: '', quantity: 1, unitPrice: 0, total: 0 }],
      discount: 0,
      taxRate: 15,
      notes: ''
    });

    toast.success('تم حفظ فاتورة المشتريات بنجاح');
  };

  const handleReceivePurchase = (purchaseId) => {
    setPurchaseData(prev => 
      prev.map(purchase => 
        purchase.id === purchaseId 
          ? { ...purchase, status: 'received', receivedDate: new Date().toISOString().split('T')[0] }
          : purchase
      )
    );
    toast.success('تم تأكيد استلام البضاعة');
  };

  const handlePrintPurchase = (purchase) => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px;">
        <h1 style="color: #1f2937; margin-bottom: 20px;">فاتورة مشتريات</h1>
        <div style="margin-bottom: 20px;">
          <p><strong>رقم الفاتورة:</strong> ${purchase.purchaseNumber}</p>
          <p><strong>التاريخ:</strong> ${purchase.date}</p>
          <p><strong>المورد:</strong> ${purchase.supplier.name}</p>
          <p><strong>الهاتف:</strong> ${purchase.supplier.phone}</p>
          ${purchase.receivedDate ? `<p><strong>تاريخ الاستلام:</strong> ${purchase.receivedDate}</p>` : ''}
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">المنتج</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">الكمية</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">السعر</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${purchase.items.map(item => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.product}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.unitPrice.toFixed(2)}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 20px; text-align: left;">
          <p><strong>المجموع الفرعي:</strong> ${purchase.subtotal.toFixed(2)} ر.س</p>
          <p><strong>الضريبة (${purchase.taxRate}%):</strong> ${purchase.taxAmount.toFixed(2)} ر.س</p>
          <p><strong>الخصم:</strong> ${purchase.discount.toFixed(2)} ر.س</p>
          <p style="font-size: 18px; color: #1f2937;"><strong>الإجمالي:</strong> ${purchase.total.toFixed(2)} ر.س</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>فاتورة مشتريات ${purchase.purchaseNumber}</title>
          <meta charset="utf-8">
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredData = purchaseData.filter(item => {
    const matchesSearch = item.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const PurchaseModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedPurchase ? 'تعديل فاتورة المشتريات' : 'فاتورة مشتريات جديدة'}
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Supplier and Date Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
              <input
                type="text"
                value={purchaseForm.supplier}
                onChange={(e) => setPurchaseForm(prev => ({ ...prev, supplier: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="اختر المورد"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الفاتورة</label>
              <input
                type="date"
                value={purchaseForm.date}
                onChange={(e) => setPurchaseForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={purchaseForm.dueDate}
                onChange={(e) => setPurchaseForm(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">عناصر الفاتورة</h4>
              <button
                onClick={handleAddItem}
                className="btn btn-primary btn-sm"
              >
                <PlusIcon className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                إضافة عنصر
              </button>
            </div>
            
            <div className="space-y-3">
              {purchaseForm.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <input
                      type="text"
                      value={item.product}
                      onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="المنتج"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="الكمية"
                      min="1"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="السعر"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.total}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      placeholder="الإجمالي"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="w-full btn btn-danger btn-sm"
                      disabled={purchaseForm.items.length === 1}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{calculateTotals().subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة ({purchaseForm.taxRate}%):</span>
                <span>{calculateTotals().taxAmount.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>الخصم:</span>
                <input
                  type="number"
                  value={purchaseForm.discount}
                  onChange={(e) => setPurchaseForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-left rtl:text-right"
                  min="0"
                  step="0.01"
                />
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي:</span>
                <span>{calculateTotals().total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => setShowPurchaseModal(false)}
            className="btn btn-outline"
          >
            إلغاء
          </button>
          <button
            onClick={handleSavePurchase}
            className="btn btn-primary"
          >
            حفظ الفاتورة
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
          <h1 className="text-2xl font-bold text-gray-900">{t('purchases')}</h1>
          <p className="text-gray-600">إدارة المشتريات والموردين</p>
        </div>
        <button
          onClick={() => setShowPurchaseModal(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
          فاتورة مشتريات جديدة
        </button>
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="received">مستلم</option>
            <option value="pending">معلق</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        <button className="btn btn-outline">
          <DocumentArrowDownIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
          تصدير
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">
                  رقم الفاتورة
                </th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">المورد</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">حالة الاستلام</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">حالة الدفع</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {item.purchaseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{item.supplier.name}</div>
                      <div className="text-gray-500">{item.supplier.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {item.total.toLocaleString('ar-SA')} ر.س
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getPaymentStatusBadge(item.paymentStatus)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {item.status === 'pending' && (
                        <button
                          onClick={() => handleReceivePurchase(item.id)}
                          className="text-green-600 hover:text-green-900"
                          title="تأكيد الاستلام"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handlePrintPurchase(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="طباعة"
                      >
                        <PrinterIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPurchase(item);
                          setShowPurchaseModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="تعديل"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من الحذف؟')) {
                            setPurchaseData(prev => prev.filter(i => i.id !== item.id));
                            toast.success('تم الحذف بنجاح');
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && <PurchaseModal />}
    </div>
  );
};

export default PurchaseManagement;
