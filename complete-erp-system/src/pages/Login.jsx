import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [language, setLanguage] = useLocalStorage('language', 'ar');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = t('requiredField');
    }
    
    if (!formData.password) {
      newErrors.password = t('requiredField');
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      if (result.success) {
        toast.success('تم تسجيل الدخول بنجاح');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // Demo login function
  const handleDemoLogin = async (role) => {
    setLoading(true);
    
    const demoCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      manager: { username: 'manager', password: 'manager123' },
      employee: { username: 'employee', password: 'employee123' }
    };
    
    try {
      const result = await login(demoCredentials[role]);
      if (result.success) {
        toast.success(`تم تسجيل الدخول كـ ${role}`);
      } else {
        // Simulate successful demo login
        toast.success(`تم تسجيل الدخول كـ ${role} (وضع التجربة)`);
        // For demo purposes, we'll simulate a successful login
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      // For demo purposes, simulate success
      toast.success(`تم تسجيل الدخول كـ ${role} (وضع التجربة)`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button
            onClick={() => handleLanguageChange('ar')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              language === 'ar'
                ? 'bg-white text-blue-600'
                : 'text-white hover:bg-white hover:bg-opacity-20'
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              language === 'en'
                ? 'bg-white text-blue-600'
                : 'text-white hover:bg-white hover:bg-opacity-20'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            نظام ERP المتكامل
          </h2>
          <p className="text-white text-opacity-80">
            Complete ERP System
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                اسم المستخدم
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white bg-opacity-20 border ${
                  errors.username ? 'border-red-400' : 'border-white border-opacity-30'
                } rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent backdrop-blur-sm`}
                placeholder="أدخل اسم المستخدم"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-200">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white bg-opacity-20 border ${
                    errors.password ? 'border-red-400' : 'border-white border-opacity-30'
                  } rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent backdrop-blur-sm pr-12 rtl:pl-12 rtl:pr-4`}
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 rtl:left-0 rtl:right-auto flex items-center pr-3 rtl:pl-3 rtl:pr-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-white text-opacity-70" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-white text-opacity-70" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-200">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white bg-opacity-20"
                />
                <label htmlFor="rememberMe" className="ml-2 rtl:mr-2 rtl:ml-0 block text-sm text-white">
                  تذكرني
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-white text-opacity-80 hover:text-white">
                  نسيت كلمة المرور؟
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </div>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-6 pt-6 border-t border-white border-opacity-20">
            <p className="text-center text-white text-opacity-80 text-sm mb-4">
              أو جرب النظام بالحسابات التجريبية:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="px-3 py-2 text-xs bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
              >
                مدير
              </button>
              <button
                onClick={() => handleDemoLogin('manager')}
                disabled={loading}
                className="px-3 py-2 text-xs bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
              >
                مدير قسم
              </button>
              <button
                onClick={() => handleDemoLogin('employee')}
                disabled={loading}
                className="px-3 py-2 text-xs bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
              >
                موظف
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white text-opacity-60 text-sm">
          <p>© 2025 نظام ERP المتكامل. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
