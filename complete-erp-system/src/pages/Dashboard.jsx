import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CurrencyDollarIcon,
  UsersIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon
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

import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      todaySales: 15750,
      totalCustomers: 1250,
      totalProducts: 850,
      lowStockItems: 23
    },
    salesChart: [
      { name: 'يناير', sales: 12000, purchases: 8000 },
      { name: 'فبراير', sales: 15000, purchases: 9500 },
      { name: 'مارس', sales: 18000, purchases: 11000 },
      { name: 'أبريل', sales: 22000, purchases: 13500 },
      { name: 'مايو', sales: 25000, purchases: 15000 },
      { name: 'يونيو', sales: 28000, purchases: 17000 }
    ],
    topProducts: [
      { name: 'منتج أ', sales: 1250, revenue: 25000 },
      { name: 'منتج ب', sales: 980, revenue: 19600 },
      { name: 'منتج ج', sales: 750, revenue: 15000 },
      { name: 'منتج د', sales: 650, revenue: 13000 },
      { name: 'منتج هـ', sales: 520, revenue: 10400 }
    ],
    recentTransactions: [
      { id: 1, type: 'sale', customer: 'أحمد محمد', amount: 1500, date: '2025-10-12', status: 'completed' },
      { id: 2, type: 'purchase', supplier: 'شركة التوريد المتقدمة', amount: 2800, date: '2025-10-12', status: 'pending' },
      { id: 3, type: 'sale', customer: 'فاطمة علي', amount: 750, date: '2025-10-11', status: 'completed' },
      { id: 4, type: 'purchase', supplier: 'مؤسسة الجودة', amount: 1200, date: '2025-10-11', status: 'completed' },
      { id: 5, type: 'sale', customer: 'محمد حسن', amount: 950, date: '2025-10-10', status: 'completed' }
    ],
    categoryDistribution: [
      { name: 'إلكترونيات', value: 35, color: '#3b82f6' },
      { name: 'ملابس', value: 25, color: '#10b981' },
      { name: 'أطعمة', value: 20, color: '#f59e0b' },
      { name: 'أدوات منزلية', value: 15, color: '#ef4444' },
      { name: 'أخرى', value: 5, color: '#8b5cf6' }
    ]
  });

  useEffect(() => {
    // Simulate loading dashboard data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
            </p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'increase' ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                )}
                {change}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          مرحباً، {user?.name}
        </h1>
        <p className="text-blue-100">
          {currentCompany ? `شركة ${currentCompany.name}` : 'نظام ERP المتكامل'}
        </p>
        <div className="mt-4 text-sm text-blue-100">
          <p>آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('todaySales')}
          value={`${dashboardData.stats.todaySales.toLocaleString('ar-SA')} ر.س`}
          icon={CurrencyDollarIcon}
          change="+12.5%"
          changeType="increase"
          color="blue"
        />
        <StatCard
          title={t('totalCustomers')}
          value={dashboardData.stats.totalCustomers}
          icon={UsersIcon}
          change="+8.2%"
          changeType="increase"
          color="green"
        />
        <StatCard
          title={t('totalProducts')}
          value={dashboardData.stats.totalProducts}
          icon={CubeIcon}
          change="+3.1%"
          changeType="increase"
          color="yellow"
        />
        <StatCard
          title={t('lowStock')}
          value={dashboardData.stats.lowStockItems}
          icon={ExclamationTriangleIcon}
          change="-2.3%"
          changeType="decrease"
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('salesChart')}</h3>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 rtl:ml-2 rtl:mr-0"></div>
                <span className="text-sm text-gray-600">المبيعات</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 rtl:ml-2 rtl:mr-0"></div>
                <span className="text-sm text-gray-600">المشتريات</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.salesChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="purchases" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">توزيع الفئات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.categoryDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {dashboardData.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('topProducts')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right rtl:text-left py-3 px-4 font-medium text-gray-600">المنتج</th>
                  <th className="text-right rtl:text-left py-3 px-4 font-medium text-gray-600">المبيعات</th>
                  <th className="text-right rtl:text-left py-3 px-4 font-medium text-gray-600">الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                    <td className="py-3 px-4 text-gray-600">{product.sales.toLocaleString('ar-SA')}</td>
                    <td className="py-3 px-4 text-gray-600">{product.revenue.toLocaleString('ar-SA')} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('recentTransactions')}</h3>
          <div className="space-y-4">
            {dashboardData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 rtl:ml-3 rtl:mr-0 ${
                    transaction.type === 'sale' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.type === 'sale' ? transaction.customer : transaction.supplier}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-left rtl:text-right">
                  <p className="font-medium text-gray-900">
                    {transaction.amount.toLocaleString('ar-SA')} ر.س
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.status === 'completed' ? 'مكتمل' : 'معلق'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <CurrencyDollarIcon className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">فاتورة جديدة</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <UsersIcon className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">عميل جديد</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <CubeIcon className="w-8 h-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-yellow-900">منتج جديد</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <TrendingUpIcon className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">تقرير</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
