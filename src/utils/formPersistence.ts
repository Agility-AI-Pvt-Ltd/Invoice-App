// Form State Persistence Utilities
// Handles saving and restoring form state across navigation

const STORAGE_PREFIX = 'form_state_';

export interface PersistedFormState<T = any> {
  data: T;
  timestamp: string;
  formId: string;
}

/**
 * Save form state to localStorage
 */
export const saveFormState = <T = any>(formId: string, data: T): void => {
  try {
    const key = `${STORAGE_PREFIX}${formId}`;
    const state: PersistedFormState<T> = {
      data,
      timestamp: new Date().toISOString(),
      formId,
    };
    localStorage.setItem(key, JSON.stringify(state));
    console.log(`💾 Form state saved: ${formId}`);
  } catch (error) {
    console.error('Failed to save form state:', error);
  }
};

/**
 * Load form state from localStorage
 */
export const loadFormState = <T = any>(formId: string): T | null => {
  try {
    const key = `${STORAGE_PREFIX}${formId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }
    
    const state: PersistedFormState<T> = JSON.parse(stored);
    console.log(`📂 Form state loaded: ${formId}`);
    return state.data;
  } catch (error) {
    console.error('Failed to load form state:', error);
    return null;
  }
};

/**
 * Clear form state from localStorage
 */
export const clearFormState = (formId: string): void => {
  try {
    const key = `${STORAGE_PREFIX}${formId}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Form state cleared: ${formId}`);
  } catch (error) {
    console.error('Failed to clear form state:', error);
  }
};

/**
 * Check if form state exists
 */
export const hasFormState = (formId: string): boolean => {
  try {
    const key = `${STORAGE_PREFIX}${formId}`;
    return localStorage.getItem(key) !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Get all form state keys
 */
export const getAllFormStates = (): string[] => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
    return keys;
  } catch (error) {
    return [];
  }
};

/**
 * Clear all form states
 */
export const clearAllFormStates = (): void => {
  try {
    const keys = getAllFormStates();
    keys.forEach(formId => clearFormState(formId));
    console.log(`🗑️ Cleared ${keys.length} form states`);
  } catch (error) {
    console.error('Failed to clear all form states:', error);
  }
};

/**
 * Auto-save hook helper
 * Returns a debounced save function
 */
export const createAutoSave = <T = any>(
  formId: string,
  debounceMs: number = 1000
): ((data: T) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (data: T) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      saveFormState(formId, data);
    }, debounceMs);
  };
};













