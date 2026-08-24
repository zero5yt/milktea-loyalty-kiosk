export type TransactionType = 'welcome' | 'add' | 'redeem';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  points: number;
  description: string;
}

export interface Customer {
  phone: string;
  name: string;
  points: number;
  transactions: Transaction[];
}

export type AppState = 
  | 'IDLE' // Waiting for phone number
  | 'NEW_CUSTOMER' // Asking for name
  | 'DASHBOARD' // Showing points and options
  | 'CASHIER_ADD' // Cashier adding points
  | 'CASHIER_REDEEM'; // Cashier redeeming points
