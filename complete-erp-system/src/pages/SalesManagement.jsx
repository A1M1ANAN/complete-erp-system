import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SalesManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const [salesData, setSalesData] = useState({
    invoices: [
      {
        id: 1,
        invoiceNumber: 'INV-2025-001',
        customer: { id: 1, name: 'أحمد محمد علي', phone: '0501234567' },
        date: '2025-10-12',
        dueDate: '2025-10-27',
        items: [
          { id: 1, product: 'لابتوب ديل', quantity: 2, unitPrice: 2500, total: 5000 },
          { id: 2, product: 'ماوس لاسلكي', quantity: 3, unitPrice: 150, total: 450 }
        ],
        subtotal: 5450,
        taxRate: 15,
        taxAmount: 817.5,
        discount: 200,
        total: 6067.5,
        status: 'paid',
        paymentMethod: 'cash'
      },
      {
        id: 2,
        invoiceNumber: 'INV-2025-002',
        customer: { id: 2, name: 'فاطمة أحمد', phone: '0507654321' },
        date: '2025-10-11',
        dueDate: '2025-10-26',
        items: [
          { id: 1, product: 'طابعة HP', quantity: 1, unitPrice: 800, total: 800 },
          { id: 2, product: 'ورق A4', quantity: 5, unitPrice: 25, total: 125 }
        ],
        subtotal: 925,
        taxRate: 15,
        taxAmount: 138.75,
        discount: 0,
        total: 1063.75,
        status: 'pending',
        paymentMethod: 'credit'
      }
    ]
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ product: '', quantity: 1, unitPrice: 0, total: 0 }],
    discount: 0,
    taxRate: 15,
    paymentMethod: 'cash',
    notes: ''
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', text: 'مدفوع' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'معلق' },
      overdue: { color: 'bg-red-100 text-red-800', text: 'متأخر' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handlePrintInvoice = (invoice) => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px;">
        <h1 style="color: #1f2937; margin-bottom: 20px;">فاتورة مبيعات</h1>
        <div style="margin-bottom: 20px;">
          <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>التاريخ:</strong> ${invoice.date}</p>
          <p><strong>العميل:</strong> ${invoice.customer.name}</p>
          <p><strong>الهاتف:</strong> ${invoice.customer.phone}</p>
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
            ${invoice.items.map(item => `
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
          <p><strong>المجموع الفرعي:</strong> ${invoice.subtotal.toFixed(2)} ر.س</p>
          <p><strong>الضريبة (${invoice.taxRate}%):</strong> ${invoice.taxAmount.toFixed(2)} ر.س</p>
          <p><strong>الخصم:</strong> ${invoice.discount.toFixed(2)} ر.س</p>
          <p style="font-size: 18px; color: #1f2937;"><strong>الإجمالي:</strong> ${invoice.total.toFixed(2)} ر.س</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>فاتورة ${invoice.invoiceNumber}</title>
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

  const filteredData = salesData[activeTab] ? salesData[activeTab].filter(item => {
    const matchesSearch = item.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sales')}</h1>
          <p className="text-gray-600">إدارة المبيعات والفواتير</p>
        </div>
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
          فاتورة جديدة
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
            <option value="paid">مدفوع</option>
            <option value="pending">معلق</option>
            <option value="overdue">متأخر</option>
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
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {item.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{item.customer.name}</div>
                      <div className="text-gray-500">{item.customer.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {item.total.toLocaleString('ar-SA')} ر.س
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handlePrintInvoice(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="طباعة"
                      >
                        <PrinterIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInvoice(item);
                          setShowInvoiceModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="تعديل"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من الحذف؟')) {
                            setSalesData(prev => ({
                              ...prev,
                              invoices: prev.invoices.filter(i => i.id !== item.id)
                            }));
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
    </div>
  );
};

export default SalesManagement;
