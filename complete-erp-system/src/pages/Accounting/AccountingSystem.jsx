import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  CalculatorIcon,
  BanknotesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AccountingSystem = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  const [accountingData, setAccountingData] = useState({
    accounts: [
      {
        id: 1,
        code: '1001',
        name: 'النقدية',
        type: 'asset',
        parentId: null,
        level: 1,
        balance: 50000,
        debitBalance: 75000,
        creditBalance: 25000,
        isActive: true
      },
      {
        id: 2,
        code: '1002',
        name: 'البنك - الراجحي',
        type: 'asset',
        parentId: null,
        level: 1,
        balance: 125000,
        debitBalance: 150000,
        creditBalance: 25000,
        isActive: true
      },
      {
        id: 3,
        code: '1101',
        name: 'العملاء',
        type: 'asset',
        parentId: null,
        level: 1,
        balance: 35000,
        debitBalance: 45000,
        creditBalance: 10000,
        isActive: true
      },
      {
        id: 4,
        code: '1201',
        name: 'المخزون',
        type: 'asset',
        parentId: null,
        level: 1,
        balance: 85000,
        debitBalance: 120000,
        creditBalance: 35000,
        isActive: true
      },
      {
        id: 5,
        code: '2001',
        name: 'الموردين',
        type: 'liability',
        parentId: null,
        level: 1,
        balance: 28000,
        debitBalance: 5000,
        creditBalance: 33000,
        isActive: true
      },
      {
        id: 6,
        code: '2101',
        name: 'ضريبة القيمة المضافة',
        type: 'liability',
        parentId: null,
        level: 1,
        balance: 12500,
        debitBalance: 2500,
        creditBalance: 15000,
        isActive: true
      },
      {
        id: 7,
        code: '3001',
        name: 'رأس المال',
        type: 'equity',
        parentId: null,
        level: 1,
        balance: 200000,
        debitBalance: 0,
        creditBalance: 200000,
        isActive: true
      },
      {
        id: 8,
        code: '4001',
        name: 'إيرادات المبيعات',
        type: 'revenue',
        parentId: null,
        level: 1,
        balance: 180000,
        debitBalance: 5000,
        creditBalance: 185000,
        isActive: true
      },
      {
        id: 9,
        code: '5001',
        name: 'تكلفة البضاعة المباعة',
        type: 'expense',
        parentId: null,
        level: 1,
        balance: 95000,
        debitBalance: 95000,
        creditBalance: 0,
        isActive: true
      },
      {
        id: 10,
        code: '5101',
        name: 'مصاريف التشغيل',
        type: 'expense',
        parentId: null,
        level: 1,
        balance: 25000,
        debitBalance: 25000,
        creditBalance: 0,
        isActive: true
      }
    ],
    journalEntries: [
      {
        id: 1,
        entryNumber: 'JE-2025-001',
        date: '2025-10-12',
        description: 'مبيعات نقدية',
        reference: 'INV-2025-001',
        totalDebit: 6067.5,
        totalCredit: 6067.5,
        status: 'posted',
        entries: [
          { accountId: 1, accountName: 'النقدية', debit: 6067.5, credit: 0 },
          { accountId: 8, accountName: 'إيرادات المبيعات', debit: 0, credit: 5450 },
          { accountId: 6, accountName: 'ضريبة القيمة المضافة', debit: 0, credit: 817.5 },
          { accountId: 9, accountName: 'تكلفة البضاعة المباعة', debit: 4000, credit: 0 },
          { accountId: 4, accountName: 'المخزون', debit: 0, credit: 4000 }
        ]
      },
      {
        id: 2,
        entryNumber: 'JE-2025-002',
        date: '2025-10-11',
        description: 'شراء بضاعة آجل',
        reference: 'PUR-2025-001',
        totalDebit: 31700,
        totalCredit: 31700,
        status: 'posted',
        entries: [
          { accountId: 4, accountName: 'المخزون', debit: 28000, credit: 0 },
          { accountId: 6, accountName: 'ضريبة القيمة المضافة', debit: 4200, credit: 0 },
          { accountId: 5, accountName: 'الموردين', debit: 0, credit: 31700 },
          { accountId: 1, accountName: 'النقدية', debit: 0, credit: 500 }
        ]
      }
    ],
    vouchers: [
      {
        id: 1,
        voucherNumber: 'RV-2025-001',
        type: 'receipt',
        date: '2025-10-12',
        amount: 15000,
        fromAccount: 'العملاء',
        toAccount: 'البنك - الراجحي',
        description: 'تحصيل من العميل أحمد محمد',
        reference: 'INV-2025-001',
        status: 'approved'
      },
      {
        id: 2,
        voucherNumber: 'PV-2025-001',
        type: 'payment',
        date: '2025-10-11',
        amount: 25000,
        fromAccount: 'البنك - الراجحي',
        toAccount: 'الموردين',
        description: 'دفع للمورد شركة التوريد المتقدمة',
        reference: 'PUR-2025-001',
        status: 'approved'
      }
    ]
  });

  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    type: 'asset',
    parentId: null,
    description: ''
  });

  const [journalForm, setJournalForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    entries: [
      { accountId: '', debit: 0, credit: 0 },
      { accountId: '', debit: 0, credit: 0 }
    ]
  });

  const accountTypes = {
    asset: { name: 'أصول', color: 'bg-blue-100 text-blue-800' },
    liability: { name: 'خصوم', color: 'bg-red-100 text-red-800' },
    equity: { name: 'حقوق ملكية', color: 'bg-green-100 text-green-800' },
    revenue: { name: 'إيرادات', color: 'bg-purple-100 text-purple-800' },
    expense: { name: 'مصروفات', color: 'bg-orange-100 text-orange-800' }
  };

  const getAccountTypeBadge = (type) => {
    const typeInfo = accountTypes[type];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.name}
      </span>
    );
  };

  const getBalanceColor = (type, balance) => {
    if (type === 'asset' || type === 'expense') {
      return balance >= 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return balance >= 0 ? 'text-blue-600' : 'text-red-600';
    }
  };

  const handleSaveAccount = () => {
    if (!accountForm.name || !accountForm.code) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    const newAccount = {
      id: selectedAccount ? selectedAccount.id : Date.now(),
      code: accountForm.code,
      name: accountForm.name,
      type: accountForm.type,
      parentId: accountForm.parentId,
      level: 1,
      balance: selectedAccount ? selectedAccount.balance : 0,
      debitBalance: selectedAccount ? selectedAccount.debitBalance : 0,
      creditBalance: selectedAccount ? selectedAccount.creditBalance : 0,
      isActive: true
    };

    if (selectedAccount) {
      setAccountingData(prev => ({
        ...prev,
        accounts: prev.accounts.map(a => a.id === selectedAccount.id ? newAccount : a)
      }));
      toast.success('تم تحديث الحساب بنجاح');
    } else {
      setAccountingData(prev => ({
        ...prev,
        accounts: [newAccount, ...prev.accounts]
      }));
      toast.success('تم إضافة الحساب بنجاح');
    }

    setShowAccountModal(false);
    setSelectedAccount(null);
    setAccountForm({
      code: '',
      name: '',
      type: 'asset',
      parentId: null,
      description: ''
    });
  };

  const handleAddJournalEntry = () => {
    setJournalForm(prev => ({
      ...prev,
      entries: [...prev.entries, { accountId: '', debit: 0, credit: 0 }]
    }));
  };

  const handleRemoveJournalEntry = (index) => {
    if (journalForm.entries.length > 2) {
      setJournalForm(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const handleJournalEntryChange = (index, field, value) => {
    setJournalForm(prev => {
      const newEntries = [...prev.entries];
      newEntries[index] = { ...newEntries[index], [field]: value };
      return { ...prev, entries: newEntries };
    });
  };

  const calculateJournalTotals = () => {
    const totalDebit = journalForm.entries.reduce((sum, entry) => sum + (parseFloat(entry.debit) || 0), 0);
    const totalCredit = journalForm.entries.reduce((sum, entry) => sum + (parseFloat(entry.credit) || 0), 0);
    return { totalDebit, totalCredit };
  };

  const handleSaveJournalEntry = () => {
    const { totalDebit, totalCredit } = calculateJournalTotals();
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error('إجمالي المدين يجب أن يساوي إجمالي الدائن');
      return;
    }

    if (!journalForm.description) {
      toast.error('يرجى إدخال وصف القيد');
      return;
    }

    const entriesWithNames = journalForm.entries.map(entry => {
      const account = accountingData.accounts.find(a => a.id === parseInt(entry.accountId));
      return {
        ...entry,
        accountName: account ? account.name : ''
      };
    });

    const newJournalEntry = {
      id: Date.now(),
      entryNumber: `JE-2025-${String(accountingData.journalEntries.length + 1).padStart(3, '0')}`,
      date: journalForm.date,
      description: journalForm.description,
      reference: journalForm.reference,
      totalDebit,
      totalCredit,
      status: 'posted',
      entries: entriesWithNames
    };

    setAccountingData(prev => ({
      ...prev,
      journalEntries: [newJournalEntry, ...prev.journalEntries]
    }));

    setShowJournalModal(false);
    setJournalForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      reference: '',
      entries: [
        { accountId: '', debit: 0, credit: 0 },
        { accountId: '', debit: 0, credit: 0 }
      ]
    });

    toast.success('تم حفظ القيد المحاسبي بنجاح');
  };

  const filteredAccounts = accountingData.accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.includes(searchTerm)
  );

  const AccountModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedAccount ? 'تعديل الحساب' : 'حساب جديد'}
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كود الحساب *</label>
            <input
              type="text"
              value={accountForm.code}
              onChange={(e) => setAccountForm(prev => ({ ...prev, code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الحساب *</label>
            <input
              type="text"
              value={accountForm.name}
              onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="اسم الحساب"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحساب *</label>
            <select
              value={accountForm.type}
              onChange={(e) => setAccountForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="asset">أصول</option>
              <option value="liability">خصوم</option>
              <option value="equity">حقوق ملكية</option>
              <option value="revenue">إيرادات</option>
              <option value="expense">مصروفات</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحساب الأب</label>
            <select
              value={accountForm.parentId || ''}
              onChange={(e) => setAccountForm(prev => ({ ...prev, parentId: e.target.value ? parseInt(e.target.value) : null }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">لا يوجد</option>
              {accountingData.accounts.filter(a => a.type === accountForm.type).map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => {
              setShowAccountModal(false);
              setSelectedAccount(null);
              setAccountForm({
                code: '',
                name: '',
                type: 'asset',
                parentId: null,
                description: ''
              });
            }}
            className="btn btn-outline"
          >
            إلغاء
          </button>
          <button
            onClick={handleSaveAccount}
            className="btn btn-primary"
          >
            حفظ الحساب
          </button>
        </div>
      </div>
    </div>
  );

  const JournalModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">قيد محاسبي جديد</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
              <input
                type="date"
                value={journalForm.date}
                onChange={(e) => setJournalForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المرجع</label>
              <input
                type="text"
                value={journalForm.reference}
                onChange={(e) => setJournalForm(prev => ({ ...prev, reference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="رقم الفاتورة أو المرجع"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف *</label>
              <input
                type="text"
                value={journalForm.description}
                onChange={(e) => setJournalForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="وصف القيد"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">تفاصيل القيد</h4>
              <button
                onClick={handleAddJournalEntry}
                className="btn btn-primary btn-sm"
              >
                <PlusIcon className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                إضافة سطر
              </button>
            </div>
            
            <div className="space-y-3">
              {journalForm.entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <select
                      value={entry.accountId}
                      onChange={(e) => handleJournalEntryChange(index, 'accountId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">اختر الحساب</option>
                      {accountingData.accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={entry.debit}
                      onChange={(e) => handleJournalEntryChange(index, 'debit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="مدين"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={entry.credit}
                      onChange={(e) => handleJournalEntryChange(index, 'credit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="دائن"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => handleRemoveJournalEntry(index)}
                      className="w-full btn btn-danger btn-sm"
                      disabled={journalForm.entries.length <= 2}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>إجمالي المدين:</span>
                  <span className="font-medium">{calculateJournalTotals().totalDebit.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي الدائن:</span>
                  <span className="font-medium">{calculateJournalTotals().totalCredit.toFixed(2)} ر.س</span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className={`text-sm font-medium ${
                  Math.abs(calculateJournalTotals().totalDebit - calculateJournalTotals().totalCredit) < 0.01
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  الفرق: {Math.abs(calculateJournalTotals().totalDebit - calculateJournalTotals().totalCredit).toFixed(2)} ر.س
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => {
              setShowJournalModal(false);
              setJournalForm({
                date: new Date().toISOString().split('T')[0],
                description: '',
                reference: '',
                entries: [
                  { accountId: '', debit: 0, credit: 0 },
                  { accountId: '', debit: 0, credit: 0 }
                ]
              });
            }}
            className="btn btn-outline"
          >
            إلغاء
          </button>
          <button
            onClick={handleSaveJournalEntry}
            className="btn btn-primary"
          >
            حفظ القيد
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
          <h1 className="text-2xl font-bold text-gray-900">{t('accounting')}</h1>
          <p className="text-gray-600">النظام المحاسبي المتكامل</p>
        </div>
        <div className="flex space-x-3 rtl:space-x-reverse mt-4 sm:mt-0">
          <button
            onClick={() => setShowJournalModal(true)}
            className="btn btn-secondary"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
            قيد محاسبي
          </button>
          <button
            onClick={() => setShowAccountModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
            حساب جديد
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
          {[
            { key: 'accounts', label: 'دليل الحسابات', icon: CalculatorIcon },
            { key: 'journal', label: 'القيود المحاسبية', icon: DocumentTextIcon },
            { key: 'vouchers', label: 'سندات الدفع والتحصيل', icon: BanknotesIcon }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
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
        <button className="btn btn-outline">
          <DocumentArrowDownIcon className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
          تصدير
        </button>
      </div>

      {/* Content */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">
                    كود الحساب
                  </th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">اسم الحساب</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الرصيد</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">مدين</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">دائن</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {account.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {account.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getAccountTypeBadge(account.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${getBalanceColor(account.type, account.balance)}`}>
                        {account.balance.toLocaleString('ar-SA')} ر.س
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {account.debitBalance.toLocaleString('ar-SA')} ر.س
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {account.creditBalance.toLocaleString('ar-SA')} ر.س
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setAccountForm({
                              code: account.code,
                              name: account.name,
                              type: account.type,
                              parentId: account.parentId,
                              description: ''
                            });
                            setShowAccountModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="تعديل"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من الحذف؟')) {
                              setAccountingData(prev => ({
                                ...prev,
                                accounts: prev.accounts.filter(a => a.id !== account.id)
                              }));
                              toast.success('تم حذف الحساب بنجاح');
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
      )}

      {activeTab === 'journal' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">
                    رقم القيد
                  </th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">المرجع</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accountingData.journalEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {entry.entryNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{entry.date}</td>
                    <td className="px-6 py-4 text-gray-900">{entry.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{entry.reference}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {entry.totalDebit.toLocaleString('ar-SA')} ر.س
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        مرحل
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="عرض التفاصيل"
                        >
                          <DocumentTextIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من الحذف؟')) {
                              setAccountingData(prev => ({
                                ...prev,
                                journalEntries: prev.journalEntries.filter(j => j.id !== entry.id)
                              }));
                              toast.success('تم حذف القيد بنجاح');
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
      )}

      {activeTab === 'vouchers' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">
                    رقم السند
                  </th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">من</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">إلى</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الوصف</th>
                  <th className="px-6 py-3 text-right rtl:text-left font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accountingData.vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {voucher.voucherNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        voucher.type === 'receipt' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {voucher.type === 'receipt' ? 'تحصيل' : 'دفع'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{voucher.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {voucher.amount.toLocaleString('ar-SA')} ر.س
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{voucher.fromAccount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{voucher.toAccount}</td>
                    <td className="px-6 py-4 text-gray-900">{voucher.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        معتمد
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAccountModal && <AccountModal />}
      {showJournalModal && <JournalModal />}
    </div>
  );
};

export default AccountingSystem;
