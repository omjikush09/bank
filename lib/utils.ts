import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

export function getTransactionLabel(
  type: string, 
  fromAccount: string | null, 
  currentAccount: string
): { label: string; isCredit: boolean } {
  if (type === 'deposit') {
    return { 
      label: 'Deposit', 
      isCredit: true 
    };
  }
  
  // For transfers
  const isReceiving = fromAccount !== currentAccount;
  return {
    label: isReceiving ? 'Transfer Received' : 'Transfer Sent',
    isCredit: isReceiving
  };
}