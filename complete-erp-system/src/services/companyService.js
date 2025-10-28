import api from './authService';

export const companyService = {
  // Get all companies
  getAll: async () => {
    try {
      const response = await api.get('/companies');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في جلب بيانات الشركات');
    }
  },

  // Get company by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/companies/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في جلب بيانات الشركة');
    }
  },

  // Create new company
  create: async (companyData) => {
    try {
      const response = await api.post('/companies', companyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في إنشاء الشركة');
    }
  },

  // Update company
  update: async (id, companyData) => {
    try {
      const response = await api.put(`/companies/${id}`, companyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في تحديث بيانات الشركة');
    }
  },

  // Delete company
  delete: async (id) => {
    try {
      const response = await api.delete(`/companies/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في حذف الشركة');
    }
  },

  // Get company settings
  getSettings: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}/settings`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في جلب إعدادات الشركة');
    }
  },

  // Update company settings
  updateSettings: async (companyId, settings) => {
    try {
      const response = await api.put(`/companies/${companyId}/settings`, settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في تحديث إعدادات الشركة');
    }
  },

  // Get company users
  getUsers: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}/users`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في جلب مستخدمي الشركة');
    }
  },

  // Add user to company
  addUser: async (companyId, userData) => {
    try {
      const response = await api.post(`/companies/${companyId}/users`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في إضافة المستخدم للشركة');
    }
  },

  // Remove user from company
  removeUser: async (companyId, userId) => {
    try {
      const response = await api.delete(`/companies/${companyId}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في إزالة المستخدم من الشركة');
    }
  },

  // Get company statistics
  getStatistics: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}/statistics`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'فشل في جلب إحصائيات الشركة');
    }
  }
};
