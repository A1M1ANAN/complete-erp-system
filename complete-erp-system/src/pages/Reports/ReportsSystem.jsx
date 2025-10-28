import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CubeIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const ReportsSystem = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('sales');
  const [selectedReport, setSelectedReport] = useState('sales-summary');
  const [dateRange, setDateRange] = useState({
    from: '2025-01-01',
    to: '2025-10-12'
  });
  const [filters, setFilters] = useState({
    customer: '',
    product: '',
    category: '',
    status: 'all'
  });

  const reportCategories = {
    sales: {
      name: 'تقارير المبيعات',
      icon: CurrencyDollarIcon,
      reports: [
        { id: 'sales-summary', name: 'ملخص المبيعات', description: 'تقرير شامل عن المبيعات' },
        { id: 'sales-by-customer', name: 'المبيعات حسب العميل', description: 'تحليل المبيعات لكل عميل' },
        { id: 'sales-by-product', name: 'المبيعات حسب المنتج', description: 'أداء المنتجات في المبيعات' },
        { id: 'sales-trend', name: 'اتجاه المبيعات', description: 'تطور المبيعات عبر الزمن' }
      ]
    },
    purchases: {
      name: 'تقارير المشتريات',
      icon: CubeIcon,
      reports: [
        { id: 'purchase-summary', name: 'ملخص المشتريات', description: 'تقرير شامل عن المشتريات' },
        { id: 'purchase-by-supplier', name: 'المشتريات حسب المورد', description: 'تحليل المشتريات من كل مورد' },
        { id: 'purchase-trend', name: 'اتجاه المشتريات', description: 'تطور المشتريات عبر الزمن' }
      ]
    },
    inventory: {
      name: 'تقارير المخزون',
      icon: CubeIcon,
      reports: [
        { id: 'inventory-status', name: 'حالة المخزون', description: 'الوضع الحالي للمخزون' },
        { id: 'inventory-movement', name: 'حركة المخزون', description: 'تفاصيل حركة المخزون' },
        { id: 'low-stock', name: 'المخزون المنخفض', description: 'المنتجات ذات المخزون المنخفض' },
        { id: 'inventory-valuation', name: 'تقييم المخزون', description: 'قيمة المخزون الحالية' }
      ]
    },
    financial: {
      name: 'التقارير المالية',
      icon: ChartBarIcon,
      reports: [
        { id: 'profit-loss', name: 'قائمة الدخل', description: 'الأرباح والخسائر' },
        { id: 'balance-sheet', name: 'الميزانية العمومية', description: 'الأصول والخصوم' },
        { id: 'cash-flow', name: 'التدفق النقدي', description: 'حركة النقدية' },
        { id: 'trial-balance', name: 'ميزان المراجعة', description: 'أرصدة الحسابات' }
      ]
    },
    customers: {
      name: 'تقارير العملاء',
      icon: UsersIcon,
      reports: [
        { id: 'customer-statement', name: 'كشف حساب العميل', description: 'تفاصيل حساب العميل' },
        { id: 'customer-aging', name: 'أعمار الديون', description: 'تحليل أعمار ديون العملاء' },
        { id: 'top-customers', name: 'أفضل العملاء', description: 'العملاء الأكثر شراءً' }
      ]
    }
  };

  // Sample data for reports
  const reportData = {
    'sales-summary': {
      summary: {
        totalSales: 285750,
        totalInvoices: 156,
        averageInvoice: 1832,
        growth: 12.5
      },
      chart: [
        { month: 'يناير', sales: 45000, invoices: 25 },
        { month: 'فبراير', sales: 52000, invoices: 28 },
        { month: 'مارس', sales: 48000, invoices: 26 },
        { month: 'أبريل', sales: 55000, invoices: 30 },
        { month: 'مايو', sales: 62000, invoices: 32 },
        { month: 'يونيو', sales: 58000, invoices: 29 }
      ],
      topProducts: [
        { name: 'لابتوب ديل', sales: 45000, quantity: 18 },
        { name: 'طابعة HP', sales: 32000, quantity: 40 },
        { name: 'ماوس لاسلكي', sales: 15000, quantity: 100 }
      ]
    },
    'inventory-status': {
      summary: {
        totalProducts: 850,
        totalValue: 425000,
        lowStockItems: 23,
        outOfStock: 5
      },
      categories: [
        { name: 'إلكترونيات', value: 250000, percentage: 58.8 },
        { name: 'مكتبية', value: 85000, percentage: 20.0 },
        { name: 'أثاث', value: 65000, percentage: 15.3 },
        { name: 'أخرى', value: 25000, percentage: 5.9 }
      ],
      lowStock: [
        { name: 'ماوس لاسلكي', current: 3, minimum: 10, status: 'critical' },
        { name: 'كيبورد ميكانيكي', current: 8, minimum: 15, status: 'low' },
        { name: 'سماعات بلوتوث', current: 12, minimum: 20, status: 'low' }
      ]
    },
    'profit-loss': {
      revenue: {
        sales: 285750,
        otherIncome: 15000,
        total: 300750
      },
      expenses: {
        cogs: 171450,
        operating: 45000,
        administrative: 25000,
        total: 241450
      },
      netProfit: 59300,
      profitMargin: 19.7
    }
  };

  const handleExportPDF = () => {
    // Create PDF content
    const reportContent = generateReportContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>تقرير ${reportCategories[activeCategory].reports.find(r => r.id === selectedReport)?.name}</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; text-align: right; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          ${reportContent}
          <div class="footer">
            <p>تم إنشاء التقرير في: ${new Date().toLocaleDateString('ar-SA')}</p>
            <p>نظام ERP المتكامل</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast.success('تم تصدير التقرير بصيغة PDF');
  };

  const handleExportExcel = () => {
    // Generate CSV data
    const csvData = generateCSVData();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report-${selectedReport}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير التقرير بصيغة Excel');
  };

  const generateReportContent = () => {
    const report = reportCategories[activeCategory].reports.find(r => r.id === selectedReport);
    const data = reportData[selectedReport];
    
    let content = `
      <div class="header">
        <h1>${report?.name}</h1>
        <p>الفترة: من ${dateRange.from} إلى ${dateRange.to}</p>
      </div>
    `;

    if (selectedReport === 'sales-summary' && data) {
      content += `
        <div class="summary">
          <div class="summary-card">
            <h3>إجمالي المبيعات</h3>
            <p>${data.summary.totalSales.toLocaleString('ar-SA')} ر.س</p>
          </div>
          <div class="summary-card">
            <h3>عدد الفواتير</h3>
            <p>${data.summary.totalInvoices}</p>
          </div>
          <div class="summary-card">
            <h3>متوسط الفاتورة</h3>
            <p>${data.summary.averageInvoice.toLocaleString('ar-SA')} ر.س</p>
          </div>
          <div class="summary-card">
            <h3>معدل النمو</h3>
            <p>%${data.summary.growth}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>المنتج</th><th>المبيعات</th><th>الكمية</th></tr>
          </thead>
          <tbody>
            ${data.topProducts.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>${product.sales.toLocaleString('ar-SA')} ر.س</td>
                <td>${product.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    return content;
  };

  const generateCSVData = () => {
    const data = reportData[selectedReport];
    let csvContent = '\uFEFF'; // BOM for UTF-8
    
    if (selectedReport === 'sales-summary' && data) {
      csvContent += 'المنتج,المبيعات,الكمية\n';
      data.topProducts.forEach(product => {
        csvContent += `${product.name},${product.sales},${product.quantity}\n`;
      });
    }
    
    return csvContent;
  };

  const renderReportContent = () => {
    const data = reportData[selectedReport];
    
    if (!data) {
      return (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد بيانات</h3>
          <p className="mt-1 text-sm text-gray-500">لا توجد بيانات متاحة لهذا التقرير</p>
        </div>
      );
    }

    switch (selectedReport) {
      case 'sales-summary':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                  <div className="mr-4 rtl:ml-4 rtl:mr-0">
                    <p className="text-sm font-medium text-blue-600">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {data.summary.totalSales.toLocaleString('ar-SA')} ر.س
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center">
                  <DocumentArrowDownIcon className="h-8 w-8 text-green-600" />
                  <div className="mr-4 rtl:ml-4 rtl:mr-0">
                    <p className="text-sm font-medium text-green-600">عدد الفواتير</p>
                    <p className="text-2xl font-bold text-green-900">{data.summary.totalInvoices}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                  <div className="mr-4 rtl:ml-4 rtl:mr-0">
                    <p className="text-sm font-medium text-yellow-600">متوسط الفاتورة</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {data.summary.averageInvoice.toLocaleString('ar-SA')} ر.س
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  <div className="mr-4 rtl:ml-4 rtl:mr-0">
                    <p className="text-sm font-medium text-purple-600">معدل النمو</p>
                    <p className="text-2xl font-bold text-purple-900">%{data.summary.growth}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">اتجاه المبيعات الشهرية</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">أفضل المنتجات مبيعاً</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">
                        المنتج
                      </th>
                      <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">
                        المبيعات
                      </th>
                      <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">
                        الكمية
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.topProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {product.sales.toLocaleString('ar-SA')} ر.س
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {product.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'inventory-status':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center">
                  <CubeIcon className="h-8 w-8 text-blue-600" />
                  <div className="mr-4 rtl:ml-4 rtl:mr-0">
                    <p className="text-sm font-medium text-blue-600">إجمالي المنتجات</p>
                    <p className="text-2xl font-bold text-blue-900">{data.summary.totalProducts}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  <div className="mr-4 rtl:ml-4 rtl:mr-0">
                    <p className="text-sm font-medium text-green-600">قيمة المخزون</p>
                    <p className="text-2xl font-bold text-green-900">
                      {data.summary.totalValue.toLocaleString('ar-SA')} ر.س
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                  <div className="mr-4 rtl:ml-4 rtl:mr-0">
                    <p className="text-sm font-medium text-yellow-600">مخزون منخفض</p>
                    <p className="text-2xl font-bold text-yellow-900">{data.summary.lowStockItems}</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-red-600" />
                  <div className="mr-4 rtl:ml-4 rtl:mr-0">
                    <p className="text-sm font-medium text-red-600">نفد المخزون</p>
                    <p className="text-2xl font-bold text-red-900">{data.summary.outOfStock}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المخزون حسب الفئة</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">المنتجات ذات المخزون المنخفض</h3>
                <div className="space-y-3">
                  {data.lowStock.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          المخزون الحالي: {item.current} | الحد الأدنى: {item.minimum}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'critical' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status === 'critical' ? 'حرج' : 'منخفض'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'profit-loss':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">قائمة الدخل</h3>
              
              <div className="space-y-4">
                {/* Revenue Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">الإيرادات</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>إيرادات المبيعات</span>
                      <span>{data.revenue.sales.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إيرادات أخرى</span>
                      <span>{data.revenue.otherIncome.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>إجمالي الإيرادات</span>
                      <span>{data.revenue.total.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                  </div>
                </div>

                {/* Expenses Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">المصروفات</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>تكلفة البضاعة المباعة</span>
                      <span>{data.expenses.cogs.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مصاريف التشغيل</span>
                      <span>{data.expenses.operating.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مصاريف إدارية</span>
                      <span>{data.expenses.administrative.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>إجمالي المصروفات</span>
                      <span>{data.expenses.total.toLocaleString('ar-SA')} ر.س</span>
                    </div>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-900">صافي الربح</span>
                    <span className="text-xl font-bold text-green-900">
                      {data.netProfit.toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-green-700">هامش الربح</span>
                    <span className="font-medium text-green-900">%{data.profitMargin}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">قريباً</h3>
            <p className="mt-1 text-sm text-gray-500">هذا التقرير قيد التطوير</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reports')}</h1>
          <p className="text-gray-600">نظام التقارير المتقدم</p>
        </div>
        <div className="flex space-x-3 rtl:space-x-reverse mt-4 sm:mt-0">
          <button
            onClick={handleExportExcel}
            className="btn btn-secondary"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
            تصدير Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="btn btn-primary"
          >
            <PrinterIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
            تصدير PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">فئات التقارير</h3>
            <div className="space-y-2">
              {Object.entries(reportCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(key);
                    setSelectedReport(category.reports[0].id);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeCategory === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <category.icon className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />
                  {category.name}
                </button>
              ))}
            </div>

            {/* Report List */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                {reportCategories[activeCategory].name}
              </h4>
              <div className="space-y-2">
                {reportCategories[activeCategory].reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full text-right rtl:text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedReport === report.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{report.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{report.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-900 mb-3">المرشحات</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">من تاريخ</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">إلى تاريخ</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {reportCategories[activeCategory].reports.find(r => r.id === selectedReport)?.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  الفترة: من {dateRange.from} إلى {dateRange.to}
                </p>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>

            {renderReportContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSystem;
