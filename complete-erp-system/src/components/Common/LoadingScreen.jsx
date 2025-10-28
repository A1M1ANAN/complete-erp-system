import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingScreen = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        {/* Logo or Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="mb-6">
          <div className="w-12 h-12 mx-auto border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin"></div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">
          نظام ERP المتكامل
        </h1>
        <h2 className="text-xl font-semibold text-white text-opacity-90 mb-4">
          Complete ERP System
        </h2>

        {/* Loading Message */}
        <p className="text-white text-opacity-80 text-lg mb-2">
          {message || t('loading')}
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-1 rtl:space-x-reverse">
          <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Features List */}
        <div className="mt-8 text-white text-opacity-70 text-sm space-y-1">
          <p>✓ إدارة المبيعات والمشتريات</p>
          <p>✓ نظام محاسبي متكامل</p>
          <p>✓ تقارير شاملة</p>
          <p>✓ دعم متعدد الشركات</p>
        </div>
      </div>

      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white bg-opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white bg-opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
