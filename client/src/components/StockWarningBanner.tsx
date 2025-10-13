import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { InventoryItem } from '@/types/inventory';

interface StockWarningBannerProps {
  items: InventoryItem[];
  onDismiss?: () => void;
}

export default function StockWarningBanner({ items, onDismiss }: StockWarningBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // Filter items by stock status
    const lowStock = items.filter(item => 
      item.status === 'Low in Stock' || 
      (item.inStock > 0 && item.inStock <= 10) // Consider items with 10 or fewer as low stock
    );
    
    const outOfStock = items.filter(item => 
      item.status === 'Out of Stock' || 
      item.inStock === 0
    );

    setLowStockItems(lowStock);
    setOutOfStockItems(outOfStock);
  }, [items]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || (lowStockItems.length === 0 && outOfStockItems.length === 0)) {
    return null;
  }

  return (
    <div className="mb-4 space-y-2">
      {/* Out of Stock Warning */}
      {outOfStockItems.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Out of Stock:</strong> {outOfStockItems.length} item(s) are out of stock
                <div className="text-sm mt-1">
                  {outOfStockItems.slice(0, 3).map(item => item.productName).join(', ')}
                  {outOfStockItems.length > 3 && ` and ${outOfStockItems.length - 3} more...`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Low Stock Warning */}
      {lowStockItems.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Low Stock:</strong> {lowStockItems.length} item(s) are running low
                <div className="text-sm mt-1">
                  {lowStockItems.slice(0, 3).map(item => `${item.productName} (${item.inStock} left)`).join(', ')}
                  {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more...`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-orange-600 hover:text-orange-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

