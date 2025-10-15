import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HomeIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  CubeIcon,
  UsersIcon,
  TruckIcon,
  CalculatorIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ReceiptTaxIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ open, setOpen }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { hasPermission, user } = useAuth();

  const navigation = [
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: HomeIcon,
      permission: 'dashboard.view'
    },
    {
      name: t('sales'),
      href: '/sales',
      icon: ShoppingCartIcon,
      permission: 'sales.view',
      children: [
        { name: 'فواتير المبيعات', href: '/sales/invoices' },
        { name: 'عروض الأسعار', href: '/sales/quotes' },
        { name: 'أوامر البيع', href: '/sales/orders' },
      ]
    },
    {
      name: t('purchases'),
      href: '/purchases',
      icon: ShoppingBagIcon,
      permission: 'purchases.view',
      children: [
        { name: 'فواتير المشتريات', href: '/purchases/invoices' },
        { name: 'طلبات الشراء', href: '/purchases/orders' },
        { name: 'استلام البضائع', href: '/purchases/receipts' },
      ]
    },
    {
      name: t('inventory'),
      href: '/inventory',
      icon: CubeIcon,
      permission: 'inventory.view',
      children: [
        { name: 'المنتجات', href: '/inventory/products' },
        { name: 'المخازن', href: '/inventory/warehouses' },
        { name: 'حركة المخزون', href: '/inventory/movements' },
        { name: 'جرد المخزون', href: '/inventory/stocktaking' },
      ]
    },
    {
      name: t('customers'),
      href: '/customers',
      icon: UsersIcon,
      permission: 'customers.view'
    },
    {
      name: t('suppliers'),
      href: '/suppliers',
      icon: TruckIcon,
      permission: 'suppliers.view'
    },
    {
      name: t('accounting'),
      href: '/accounting',
      icon: CalculatorIcon,
      permission: 'accounting.view',
      children: [
        { name: 'دليل الحسابات', href: '/accounting/chart-of-accounts' },
        { name: 'القيود اليومية', href: '/accounting/journal-entries' },
        { name: 'دفتر الأستاذ', href: '/accounting/general-ledger' },
        { name: 'سندات الدفع', href: '/accounting/payment-vouchers' },
        { name: 'سندات القبض', href: '/accounting/receipt-vouchers' },
        { name: 'ميزان المراجعة', href: '/accounting/trial-balance' },
      ]
    },
    {
      name: t('reports'),
      href: '/reports',
      icon: DocumentChartBarIcon,
      permission: 'reports.view',
      children: [
        { name: 'تقارير المبيعات', href: '/reports/sales' },
        { name: 'تقارير المشتريات', href: '/reports/purchases' },
        { name: 'تقارير المخزون', href: '/reports/inventory' },
        { name: 'التقارير المالية', href: '/reports/financial' },
        { name: 'تقارير العملاء', href: '/reports/customers' },
        { name: 'تقارير الموردين', href: '/reports/suppliers' },
      ]
    }
  ];

  const adminNavigation = [
    {
      name: t('users'),
      href: '/users',
      icon: UserGroupIcon,
      permission: 'users.view'
    },
    {
      name: t('companies'),
      href: '/companies',
      icon: BuildingOfficeIcon,
      permission: 'companies.view'
    },
    {
      name: t('taxes'),
      href: '/taxes',
      icon: ReceiptTaxIcon,
      permission: 'taxes.view'
    },
    {
      name: t('settings'),
      href: '/settings',
      icon: CogIcon,
      permission: 'settings.view'
    }
  ];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavItem = (item) => {
    if (!hasPermission(item.permission)) {
      return null;
    }

    return (
      <li key={item.name}>
        <NavLink
          to={item.href}
          className={({ isActive }) =>
            `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isActive || isActive(item.href)
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700 rtl:border-r-0 rtl:border-l-2'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <item.icon
            className={`mr-3 rtl:ml-3 rtl:mr-0 h-5 w-5 transition-colors duration-200 ${
              isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
            }`}
          />
          {item.name}
        </NavLink>
        
        {/* Sub-navigation */}
        {item.children && isActive(item.href) && (
          <ul className="mt-2 space-y-1 ml-6 rtl:mr-6 rtl:ml-0">
            {item.children.map((child) => (
              <li key={child.name}>
                <NavLink
                  to={child.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <div className={`w-2 h-2 rounded-full mr-3 rtl:ml-3 rtl:mr-0 ${
                    location.pathname === child.href ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                  {child.name}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 ${
        document.documentElement.dir === 'rtl' ? 'right-0' : 'left-0'
      } h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : document.documentElement.dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ERP</span>
            </div>
            <span className="ml-3 rtl:mr-3 rtl:ml-0 text-lg font-semibold text-gray-900">
              نظام ERP
            </span>
          </div>
          
          {/* Close button for mobile */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3 rtl:mr-3 rtl:ml-0">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map(renderNavItem)}
          </ul>

          {/* Admin Section */}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <>
              <div className="pt-6 pb-2">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  إدارة النظام
                </h3>
              </div>
              <ul className="space-y-1">
                {adminNavigation.map(renderNavItem)}
              </ul>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>نظام ERP المتكامل</p>
            <p>الإصدار 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
