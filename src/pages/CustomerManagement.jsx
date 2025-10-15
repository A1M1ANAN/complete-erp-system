import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CustomerManagement = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [customersData, setCustomersData] = useState([
    {
      id: 1,
      code: 'CUS-001',
      name: 'أحمد محمد علي',
      type: 'individual',
      phone: '0501234567',
      email: 'ahmed@example.com',
      address: 'الرياض، حي النخيل، شارع الملك فهد',
      city: 'الرياض',
      country: 'السعودية',
      taxNumber: '',
      creditLimit: 10000,
      currentBalance: 2500,
      totalPurchases: 15750,
      lastPurchase: '2025-10-12',
      status: 'active',
      notes: 'عميل مميز'
    },
    {
      id: 2,
      code: 'CUS-002',
      name: 'شركة التقنية المتقدمة',
      type: 'company',
      phone: '0112345678',
      email: 'info@techadvanced.com',
      address: 'جدة، حي الحمراء، طريق الملك عبدالعزيز',
      city: 'جدة',
      country: 'السعودية',
      taxNumber: '300123456789003',
      creditLimit: 50000,
      currentBalance: 8750,
      totalPurchases: 45200,
      lastPurchase: '2025-10-11',
      status: 'active',
      notes: 'شركة كبيرة - دفع شهري'
    },
    {
      id: 3,
      code: 'CUS-003',
      name: 'فاطمة أحمد السالم',
      type: 'individual',
      phone: '0507654321',
      email: 'fatima@example.com',
      address: 'الدمام، حي الشاطئ، شارع الخليج',
      city: 'الدمام',
      country: 'السعودية',
      taxNumber: '',
      creditLimit: 5000,
      currentBalance: 0,
      totalPurchases: 3200,
      lastPurchase: '2025-10-08',
      status: 'active',
      notes: ''
    }
  ]);

  const [customerForm, setCustomerForm] = useState({
    code: '',
    name: '',
    type: 'individual',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'السعودية',
    taxNumber: '',
    creditLimit: 0,
    notes: ''
  });

  const generateCustomerCode = () => {
    const nextNumber = customersData.length + 1;
    return `CUS-${String(nextNumber).padStart(3, '0')}`;
  };

  const handleSaveCustomer = () => {
    if (!customerForm.name || !customerForm.phone) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    const newCustomer = {
      id: selectedCustomer ? selectedCustomer.id : Date.now(),
      code: customerForm.code || generateCustomerCode(),
      name: customerForm.name,
      type: customerForm.type,
      phone: customerForm.phone,
      email: customerForm.email,
      address: customerForm.address,
      city: customerForm.city,
      country: customerForm.country,
      taxNumber: customerForm.taxNumber,
      creditLimit: parseFloat(customerForm.creditLimit) || 0,
      currentBalance: selectedCustomer ? selectedCustomer.currentBalance : 0,
      totalPurchases: selectedCustomer ? selectedCustomer.totalPurchases : 0,
      lastPurchase: selectedCustomer ? selectedCustomer.lastPurchase : null,
      status: 'active',
      notes: customerForm.notes
    };

    if (selectedCustomer) {
      setCustomersData(prev => prev.map(c => c.id === selectedCustomer.id ? newCustomer : c));
      toast.success('تم تحديث العميل بنجاح');
    } else {
      setCustomersData(prev => [newCustomer, ...prev]);
      toast.success('تم إضافة العميل بنجاح');
    }

    setShowCustomerModal(false);
    setSelectedCustomer(null);
    setCustomerForm({
      code: '',
      name: '',
      type: 'individual',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: 'السعودية',
      taxNumber: '',
      creditLimit: 0,
      notes: ''
    });
  };

  const getCustomerTypeBadge = (type) => {
    return type === 'company' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        شركة
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        فرد
      </span>
    );
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-red-600'; // مدين
    if (balance < 0) return 'text-green-600'; // دائن
    return 'text-gray-600'; // متوازن
  };

  const filteredCustomers = customersData.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesType = filterType === 'all' || customer.type === filterType;
    return matchesSearch && matchesType;
  });

  const CustomerModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedCustomer ? 'تعديل العميل' : 'عميل جديد'}
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كود العميل</label>
              <input
                type="text"
                value={customerForm.code}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="سيتم إنشاؤه تلقائياً"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع العميل</label>
              <select
                value={customerForm.type}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="individual">فرد</option>
                <option value="company">شركة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل *</label>
            <input
              type="text"
              value={customerForm.name}
              onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل اسم العميل"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
              <input
                type="tel"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="05xxxxxxxx"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
            <textarea
              value={customerForm.address}
              onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="العنوان التفصيلي"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
              <input
                type="text"
                value={customerForm.city}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="الرياض"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الدولة</label>
              <select
                value={customerForm.country}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="السعودية">السعودية</option>
                <option value="الإمارات">الإمارات</option>
                <option value="الكويت">الكويت</option>
                <option value="قطر">قطر</option>
                <option value="البحرين">البحرين</option>
                <option value="عمان">عمان</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الضريبي</label>
              <input
                type="text"
                value={customerForm.taxNumber}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, taxNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="300123456789003"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحد الائتماني</label>
              <input
                type="number"
                value={customerForm.creditLimit}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, creditLimit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea
              value={customerForm.notes}
              onChange={(e) => setCustomerForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="ملاحظات إضافية"
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => {
              setShowCustomerModal(false);
              setSelectedCustomer(null);
              setCustomerForm({
                code: '',
                name: '',
                type: 'individual',
                phone: '',
                email: '',
                address: '',
                city: '',
                country: 'السعودية',
                taxNumber: '',
                creditLimit: 0,
                notes: ''
              });
            }}
            className="btn btn-outline"
          >
            إلغاء
          </button>
          <button
            onClick={handleSaveCustomer}
            className="btn btn-primary"
          >
            حفظ العميل
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
          <h1 className="text-2xl font-bold text-gray-900">{t('customers')}</h1>
          <p className="text-gray-600">إدارة العملاء والحسابات</p>
        </div>
        <button
          onClick={() => setShowCustomerModal(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
          عميل جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4 rtl:ml-4 rtl:mr-0">
              <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-gray-900">{customersData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4 rtl:ml-4 rtl:mr-0">
              <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-gray-900">
                {customersData.reduce((sum, c) => sum + c.totalPurchases, 0).toLocaleString('ar-SA')} ر.س
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4 rtl:ml-4 rtl:mr-0">
              <p className="text-sm font-medium text-gray-600">الأرصدة المدينة</p>
              <p className="text-2xl font-bold text-gray-900">
                {customersData.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0).toLocaleString('ar-SA')} ر.س
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="mr-4 rtl:ml-4 rtl:mr-0">
              <p className="text-sm font-medium text-gray-600">متوسط المشتريات</p>
              <p className="text-2xl font-bold text-gray-900">
                {(customersData.reduce((sum, c) => sum + c.totalPurchases, 0) / customersData.length).toFixed(0)} ر.س
              </p>
            </div>
          </div>
        </div>
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">جميع الأنواع</option>
            <option value="individual">أفراد</option>
            <option value="company">شركات</option>
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
                  كود العميل
                </th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">اسم العميل</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">معلومات الاتصال</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الرصيد الحالي</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">إجمالي المشتريات</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">آخر شراء</th>
                <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {customer.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-gray-500 flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {customer.city}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCustomerTypeBadge(customer.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${getBalanceColor(customer.currentBalance)}`}>
                      {customer.currentBalance.toLocaleString('ar-SA')} ر.س
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {customer.totalPurchases.toLocaleString('ar-SA')} ر.س
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {customer.lastPurchase || 'لا يوجد'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerForm({
                            code: customer.code,
                            name: customer.name,
                            type: customer.type,
                            phone: customer.phone,
                            email: customer.email,
                            address: customer.address,
                            city: customer.city,
                            country: customer.country,
                            taxNumber: customer.taxNumber,
                            creditLimit: customer.creditLimit,
                            notes: customer.notes
                          });
                          setShowCustomerModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="تعديل"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من الحذف؟')) {
                            setCustomersData(prev => prev.filter(c => c.id !== customer.id));
                            toast.success('تم حذف العميل بنجاح');
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

      {/* Customer Modal */}
      {showCustomerModal && <CustomerModal />}
    </div>
  );
};

export default CustomerManagement;
