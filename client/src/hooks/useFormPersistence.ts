// Custom Hook for Form State Persistence
// Automatically saves and restores form state

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  saveFormState,
  loadFormState,
  clearFormState,
  hasFormState,
} from '@/utils/formPersistence';

interface UseFormPersistenceOptions<T> {
  formId: string;
  initialData?: T;
  autoSave?: boolean;
  autoSaveDelay?: number;
  onRestore?: (data: T) => void;
}

interface UseFormPersistenceReturn<T> {
  formData: T;
  setFormData: (data: T | ((prev: T) => T)) => void;
  updateField: (field: keyof T, value: any) => void;
  updateNestedField: (path: string, value: any) => void;
  isDirty: boolean;
  hasSavedState: boolean;
  saveManually: () => void;
  clearSavedState: () => void;
  restoreFromStorage: () => void;
  resetForm: () => void;
}

export function useFormPersistence<T extends Record<string, any>>(
  options: UseFormPersistenceOptions<T>
): UseFormPersistenceReturn<T> {
  const {
    formId,
    initialData,
    autoSave = true,
    autoSaveDelay = 1000,
    onRestore,
  } = options;

  const [formData, setFormDataInternal] = useState<T>(() => {
    // Try to restore from storage first
    const saved = loadFormState<T>(formId);
    if (saved) {
      console.log(`✅ Restored form state for: ${formId}`);
      onRestore?.(saved);
      return saved;
    }
    return initialData || ({} as T);
  });

  const [isDirty, setIsDirty] = useState(false);
  const [hasSavedState, setHasSavedState] = useState(() => hasFormState(formId));
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const initialDataRef = useRef(initialData);

  // Update initial data reference when it changes (edit mode)
  useEffect(() => {
    if (initialData && JSON.stringify(initialData) !== JSON.stringify(initialDataRef.current)) {
      initialDataRef.current = initialData;
      setFormDataInternal(initialData);
      setIsDirty(false);
    }
  }, [initialData]);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && isDirty) {
      // Clear existing timeout
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }

      // Set new timeout
      autoSaveTimeout.current = setTimeout(() => {
        saveFormState(formId, formData);
        setHasSavedState(true);
        console.log(`💾 Auto-saved: ${formId}`);
      }, autoSaveDelay);
    }

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [formData, isDirty, autoSave, autoSaveDelay, formId]);

  // Set form data with dirty tracking
  const setFormData = useCallback((dataOrUpdater: T | ((prev: T) => T)) => {
    setFormDataInternal((prev) => {
      const newData = typeof dataOrUpdater === 'function' 
        ? dataOrUpdater(prev) 
        : dataOrUpdater;
      
      setIsDirty(true);
      return newData;
    });
  }, []);

  // Update a single field
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, [setFormData]);

  // Update nested field using dot notation (e.g., "billTo.address")
  const updateNestedField = useCallback((path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;

      // Navigate to the parent object
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }

      // Set the final value
      current[keys[keys.length - 1]] = value;

      return newData;
    });
  }, [setFormData]);

  // Save manually
  const saveManually = useCallback(() => {
    saveFormState(formId, formData);
    setHasSavedState(true);
    setIsDirty(false);
    console.log(`💾 Manually saved: ${formId}`);
  }, [formId, formData]);

  // Clear saved state
  const clearSavedState = useCallback(() => {
    clearFormState(formId);
    setHasSavedState(false);
    console.log(`🗑️ Cleared saved state: ${formId}`);
  }, [formId]);

  // Restore from storage
  const restoreFromStorage = useCallback(() => {
    const saved = loadFormState<T>(formId);
    if (saved) {
      setFormDataInternal(saved);
      setIsDirty(false);
      onRestore?.(saved);
      console.log(`📂 Restored from storage: ${formId}`);
    }
  }, [formId, onRestore]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormDataInternal(initialDataRef.current || ({} as T));
    setIsDirty(false);
    clearFormState(formId);
    setHasSavedState(false);
    console.log(`🔄 Form reset: ${formId}`);
  }, [formId]);

  return {
    formData,
    setFormData,
    updateField,
    updateNestedField,
    isDirty,
    hasSavedState,
    saveManually,
    clearSavedState,
    restoreFromStorage,
    resetForm,
  };
}

