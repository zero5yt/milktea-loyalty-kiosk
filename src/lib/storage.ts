import { Customer } from '../types';

const STORAGE_KEY = 'boba_rewards_customers';

export const storage = {
  getCustomers: (): Record<string, Customer> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to read from local storage', e);
      return {};
    }
  },

  getCustomer: (phone: string): Customer | null => {
    const customers = storage.getCustomers();
    return customers[phone] || null;
  },

  saveCustomer: (customer: Customer): void => {
    const customers = storage.getCustomers();
    customers[customer.phone] = customer;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  },
};
