import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { currentCompany, companies, switchCompany } = useCompany();
  const [language, setLanguage] = useLocalStorage('language', 'ar');
  const [notifications] = useState([
    { id: 1, message: 'فاتورة جديدة من العميل أحمد', time: '5 دقائق', unread: true },
    { id: 2, message: 'تم تحديث المخزون', time: '10 دقائق', unread: true },
    { id: 3, message: 'تقرير المبيعات جاهز', time: '1 ساعة', unread: false },
  ]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLogout = async () => {
    await logout();
  };

  const unreadNotifications = notifications.filter(n => n.unread).length;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and Logo */}
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center ml-4 rtl:mr-4 rtl:ml-0">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ERP</span>
                </div>
              </div>
              <div className="ml-3 rtl:mr-3 rtl:ml-0">
                <h1 className="text-lg font-semibold text-gray-900">
                  {t('welcomeMessage')}
                </h1>
              </div>
            </div>
          </div>

          {/* Right side - Company selector, Language, Notifications, User menu */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Company Selector */}
            {companies.length > 1 && (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <BuildingOfficeIcon className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span className="max-w-32 truncate">
                    {currentCompany?.name || t('selectCompany')}
                  </span>
                  <ChevronDownIcon className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                </Menu.Button>
                
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {companies.map((company) => (
                        <Menu.Item key={company.id}>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } ${
                                currentCompany?.id === company.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                              } group flex w-full items-center px-4 py-2 text-sm`}
                              onClick={() => switchCompany(company)}
                            >
                              <BuildingOfficeIcon className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                              {company.name}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {/* Language Selector */}
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <GlobeAltIcon className="h-5 w-5" />
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-32 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } ${
                            language === 'ar' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                          } group flex w-full items-center px-4 py-2 text-sm`}
                          onClick={() => handleLanguageChange('ar')}
                        >
                          العربية
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } ${
                            language === 'en' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                          } group flex w-full items-center px-4 py-2 text-sm`}
                          onClick={() => handleLanguageChange('en')}
                        >
                          English
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Notifications */}
            <Menu as="div" className="relative">
              <Menu.Button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <BellIcon className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-80 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
                      الإشعارات
                    </div>
                    {notifications.map((notification) => (
                      <Menu.Item key={notification.id}>
                        {({ active }) => (
                          <div className={`${active ? 'bg-gray-50' : ''} px-4 py-3 border-b border-gray-100 last:border-b-0`}>
                            <div className="flex items-start">
                              <div className={`w-2 h-2 rounded-full mt-2 mr-3 rtl:ml-3 rtl:mr-0 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="text-right rtl:text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                </div>
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/settings"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } group flex items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <CogIcon className="mr-3 rtl:ml-3 rtl:mr-0 h-4 w-4" />
                          {t('settings')}
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 rtl:ml-3 rtl:mr-0 h-4 w-4" />
                          تسجيل الخروج
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
