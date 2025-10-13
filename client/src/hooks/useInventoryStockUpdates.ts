import { useEffect, useCallback } from 'react';
import { updateInventoryStock } from '@/services/api/inventory';

/**
 * Custom hook for managing inventory stock updates
 * Provides functionality to update stock and listen for stock update events
 */
export function useInventoryStockUpdates() {
  // Function to update stock for a single item
  const updateStock = useCallback(async (itemId: string | number, quantityUsed: number) => {
    try {
      console.log(`📦 Updating stock for item ${itemId}, quantity used: ${quantityUsed}`);
      const result = await updateInventoryStock(itemId, quantityUsed);
      console.log(`✅ Stock updated for item ${itemId}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Failed to update stock for item ${itemId}:`, error);
      throw error;
    }
  }, []);

  // Function to update stock for multiple items
  const updateStockForItems = useCallback(async (items: Array<{
    inventoryItemId: number;
    quantity: number;
  }>) => {
    try {
      console.log('📦 Updating inventory stock for multiple items:', items);
      
      const stockUpdatePromises = items
        .filter(item => item.inventoryItemId && item.quantity > 0)
        .map(async (item) => {
          try {
            const result = await updateInventoryStock(item.inventoryItemId, item.quantity);
            console.log(`✅ Stock updated for item ${item.inventoryItemId}:`, result);
            return result;
          } catch (error) {
            console.error(`❌ Failed to update stock for item ${item.inventoryItemId}:`, error);
            return null;
          }
        });

      const results = await Promise.all(stockUpdatePromises);
      const successfulUpdates = results.filter(result => result !== null);
      
      console.log(`📦 Stock update completed: ${successfulUpdates.length}/${items.length} items updated`);
      
      // Notify inventory components to refresh
      window.dispatchEvent(new CustomEvent("inventory:stock-updated", { 
        detail: { updatedItems: successfulUpdates } 
      }));
      
      return successfulUpdates;
    } catch (error) {
      console.error('❌ Error updating inventory stock for multiple items:', error);
      throw error;
    }
  }, []);

  // Function to listen for stock update events
  const useStockUpdateListener = useCallback((onStockUpdate: (event: CustomEvent) => void) => {
    useEffect(() => {
      const handleStockUpdate = (event: CustomEvent) => {
        console.log('📦 Received inventory stock update event:', event.detail);
        onStockUpdate(event);
      };

      window.addEventListener('inventory:stock-updated', handleStockUpdate as EventListener);
      
      return () => {
        window.removeEventListener('inventory:stock-updated', handleStockUpdate as EventListener);
      };
    }, [onStockUpdate]);
  }, []);

  return {
    updateStock,
    updateStockForItems,
    useStockUpdateListener
  };
}

