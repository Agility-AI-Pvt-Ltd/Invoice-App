import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
// Label import removed as not used
import { Search, Loader2, Package } from 'lucide-react';
import { getAllInventoryProducts } from '@/services/api/inventory';
import type { InventoryProduct } from '@/types/inventory';

interface InventoryItemSelectorProps {
  onItemSelect: (item: InventoryProduct) => void;
  placeholder?: string;
  className?: string;
}

export default function InventoryItemSelector({ 
  onItemSelect, 
  placeholder = "Search inventory items...",
  className = ""
}: InventoryItemSelectorProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryProduct[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Load inventory items on component mount
  useEffect(() => {
    loadInventoryItems();
  }, []);

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(inventoryItems);
    } else {
      const filtered = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, inventoryItems]);

  const loadInventoryItems = async () => {
    setLoading(true);
    try {
      const response = await getAllInventoryProducts(1, 100);
      if (response.success) {
        setInventoryItems(response.data);
        setFilteredItems(response.data);
        console.log('✅ Inventory items loaded:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Error loading inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: InventoryProduct) => {
    onItemSelect(item);
    setSearchQuery('');
    setShowDropdown(false);
    console.log('✅ Inventory item selected:', item);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for item selection
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={loading ? "Loading inventory..." : placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10 pr-10 w-full"
          disabled={loading}
        />
        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Inventory Items Dropdown */}
      {showDropdown && filteredItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleItemSelect(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <div className="flex flex-wrap gap-2">
                      <span>SKU: {item.sku || 'N/A'}</span>
                      <span>•</span>
                      <span>Category: {item.category || 'Uncategorized'}</span>
                      <span>•</span>
                      <span>Price: ₹{item.unitPrice}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span>Stock: {item.quantity}</span>
                      <span>•</span>
                      <span>Tax: {item.defaultTaxRate || 0}%</span>
                      <span>•</span>
                      <span>HSN: {item.hsnCode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <Package className="h-4 w-4 text-gray-400 ml-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showDropdown && searchQuery && filteredItems.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500">
            No items found matching "{searchQuery}"
          </div>
        </div>
      )}

      {/* Load More Button */}
      {!loading && inventoryItems.length === 0 && (
        <div className="mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadInventoryItems}
            className="w-full"
          >
            <Package className="h-4 w-4 mr-2" />
            Load Inventory Items
          </Button>
        </div>
      )}
    </div>
  );
}

