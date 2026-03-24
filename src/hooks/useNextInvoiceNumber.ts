import { useState, useEffect, useCallback } from 'react';
import { getNextInvoiceNumber } from '@/services/api/invoice';

interface UseNextInvoiceNumberReturn {
  nextNumber: string;
  isCustom: boolean;
  userSettings: {
    prefix: string;
    startNumber: number;
  };
  currentCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNextInvoiceNumber(): UseNextInvoiceNumberReturn {
  const [nextNumber, setNextNumber] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [userSettings, setUserSettings] = useState<{
    prefix: string;
    startNumber: number;
  }>({ prefix: 'INV', startNumber: 1 });
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextNumber = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Starting to fetch next invoice number...');
      const data = await getNextInvoiceNumber();
      console.log('✅ Received data from API:', data);
      
      setNextNumber(data.nextInvoiceNumber);
      setIsCustom(data.isCustom);
      setUserSettings(data.userSettings);
      setCurrentCount(data.currentCount);
      
      console.log('✅ Next invoice number fetched and set:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch next number';
      setError(errorMessage);
      console.error('❌ Error fetching next invoice number:', err);
      console.log('⚠️ API call failed - backend endpoint needs to be fixed');
      
      // Don't generate any fallback numbers - let user know backend needs to be fixed
      console.log('🔄 Backend API failed - no invoice number generated');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNextNumber();
  }, [fetchNextNumber]);

  return {
    nextNumber,
    isCustom,
    userSettings,
    currentCount,
    loading,
    error,
    refetch: fetchNextNumber
  };
}

// Alternative hook for manual control (doesn't auto-fetch on mount)
export function useNextInvoiceNumberManual(): {
  nextNumber: string;
  isCustom: boolean;
  userSettings: {
    prefix: string;
    startNumber: number;
  };
  currentCount: number;
  loading: boolean;
  error: string | null;
  fetchNextNumber: () => Promise<void>;
} {
  const [nextNumber, setNextNumber] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [userSettings, setUserSettings] = useState<{
    prefix: string;
    startNumber: number;
  }>({ prefix: 'INV', startNumber: 1 });
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextNumber = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getNextInvoiceNumber();
      setNextNumber(data.nextInvoiceNumber);
      setIsCustom(data.isCustom);
      setUserSettings(data.userSettings);
      setCurrentCount(data.currentCount);
      console.log('📊 Next invoice number fetched manually:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch next invoice number';
      setError(errorMessage);
      console.error('❌ Error fetching next invoice number:', err);
      console.log('⚠️ API call failed - backend endpoint needs to be fixed');
      
      // Don't generate any fallback numbers - let user know backend needs to be fixed
      console.log('🔄 Backend API failed - no invoice number generated');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    nextNumber,
    isCustom,
    userSettings,
    currentCount,
    loading,
    error,
    fetchNextNumber
  };
}
