import React, { createContext, useContext, useState, useEffect } from 'react';
import { companyService } from '../services/companyService';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useLocalStorage('currentCompany', null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const companiesData = await companyService.getAll();
      setCompanies(companiesData);
      
      // Set default company if none selected
      if (!currentCompany && companiesData.length > 0) {
        setCurrentCompany(companiesData[0]);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchCompany = (company) => {
    setCurrentCompany(company);
    // Trigger any necessary data refresh for the new company
    window.location.reload();
  };

  const createCompany = async (companyData) => {
    try {
      const newCompany = await companyService.create(companyData);
      setCompanies(prev => [...prev, newCompany]);
      return { success: true, data: newCompany };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateCompany = async (id, companyData) => {
    try {
      const updatedCompany = await companyService.update(id, companyData);
      setCompanies(prev => 
        prev.map(company => 
          company.id === id ? updatedCompany : company
        )
      );
      
      // Update current company if it's the one being updated
      if (currentCompany && currentCompany.id === id) {
        setCurrentCompany(updatedCompany);
      }
      
      return { success: true, data: updatedCompany };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteCompany = async (id) => {
    try {
      await companyService.delete(id);
      setCompanies(prev => prev.filter(company => company.id !== id));
      
      // Switch to another company if current one is deleted
      if (currentCompany && currentCompany.id === id) {
        const remainingCompanies = companies.filter(c => c.id !== id);
        setCurrentCompany(remainingCompanies.length > 0 ? remainingCompanies[0] : null);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getCompanyById = (id) => {
    return companies.find(company => company.id === id);
  };

  const hasMultipleCompanies = () => {
    return companies.length > 1;
  };

  const value = {
    companies,
    currentCompany,
    loading,
    switchCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
    hasMultipleCompanies,
    loadCompanies
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};
