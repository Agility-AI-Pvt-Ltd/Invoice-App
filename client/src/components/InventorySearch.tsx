import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/button';
import { BASE_URL } from '@/lib/api-config';
import axios from 'axios';
import Cookies from 'js-cookie';
import type { InventoryItem } from '@/types/inventory';

interface InventorySearchProps {
    onSearchResults: (results: InventoryItem[]) => void;
    onSearchClear: () => void;
    onLoadingChange: (loading: boolean) => void;
}

export default function InventorySearch({
    onSearchResults,
    onSearchClear,
    onLoadingChange
}: InventorySearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const token = Cookies.get("authToken") || "";

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            handleClearSearch();
            return;
        }

        setIsSearching(true);
        onLoadingChange(true);
        setHasSearched(true);

        try {
            // First, let's check what products are available
            console.log('🔍 Checking available products first...');
            try {
                const allItemsResponse = await axios.get(`${BASE_URL}/api/inventory/items`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });
                console.log('📦 All available products:', allItemsResponse.data);
                if (allItemsResponse.data && allItemsResponse.data.data) {
                    console.log('📦 Available product names:', allItemsResponse.data.data.map((item: any) => item.name || item.productName || item.product_name));
                }
            } catch (err) {
                console.log('❌ Could not fetch all products:', err);
            }

            const encodedName = encodeURIComponent(query.trim());
            const searchUrl = `${BASE_URL}/api/inventory/${encodedName}`;

            console.log('🔍 Searching inventory by name:', searchUrl);
            console.log('🔍 Search query:', query.trim());

            const response = await axios.get(searchUrl, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            console.log('📦 Search API response:', response.data);
            console.log('📦 Response status:', response.status);
            console.log('🔍 Search term used:', query.trim());
            console.log('🔍 Encoded search term:', encodedName);
            console.log('🔍 Full search URL:', searchUrl);

            // Handle different response formats
            let results: Record<string, unknown>[] = [];

            if (Array.isArray(response.data)) {
                results = response.data;
                console.log('📦 Direct array response, items:', results.length);
            } else if (response.data && Array.isArray(response.data.data)) {
                results = response.data.data;
                console.log('📦 Nested data array, items:', results.length);
            } else if (response.data && typeof response.data === 'object' && (response.data.name || response.data.productName)) {
                // Single item result
                results = [response.data];
                console.log('📦 Single item result');
            } else {
                console.log('📦 No recognizable data format, response:', response.data);
            }

            // Normalize the results to match the expected format (only required fields)
            const normalizedResults = results.map((item: Record<string, unknown>) => ({
                id: (item.id as string) || (item._id as string) || Math.random().toString(),
                productName: (item.name as string) || (item.productName as string) || (item.product_name as string) || 'Unknown Product',
                category: (item.category as string) || 'Uncategorized',
                unitPrice: (item.unitPrice as number) || (item.unit_price as number) || (item.price as number) || 0,
                inStock: (item.inStock as number) || (item.in_stock as number) || (item.quantity as number) || 0,
                discount: (item.discount as number) || 0,
                totalValue: ((item.unitPrice as number) || (item.unit_price as number) || 0) * ((item.inStock as number) || (item.in_stock as number) || 0),
                status: ((item.status as string) || (((item.inStock as number) || (item.in_stock as number) || 0) > 0 ? 'In Stock' : 'Out of Stock')) as "In Stock" | "Out of Stock" | "Low in Stock"
            }));

            console.log('✅ Normalized search results:', normalizedResults);
            console.log('✅ Number of results:', normalizedResults.length);
            console.log('🔍 Sample result structure:', normalizedResults[0]);

            setSearchResults(normalizedResults);
            onSearchResults(normalizedResults);

        } catch (error: unknown) {
            console.error('❌ Search by name failed:', error);
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: unknown; status?: number } };
                console.error('Error details:', axiosError.response?.data);
                console.error('Error status:', axiosError.response?.status);
            }
            if (error && typeof error === 'object' && 'message' in error) {
                console.error('Error message:', (error as { message: string }).message);
            }

            // Fallback: Try searching using the regular items endpoint with search parameter
            try {
                console.log('🔄 Trying fallback search with items endpoint...');
                const fallbackUrl = `${BASE_URL}/api/inventory/items?search=${encodeURIComponent(query.trim())}`;
                console.log('🔍 Fallback search URL:', fallbackUrl);

                const fallbackResponse = await axios.get(fallbackUrl, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });

                console.log('📦 Fallback search response:', fallbackResponse.data);

                // Handle fallback response
                let fallbackResults: Record<string, unknown>[] = [];

                if (Array.isArray(fallbackResponse.data)) {
                    fallbackResults = fallbackResponse.data;
                } else if (fallbackResponse.data && Array.isArray(fallbackResponse.data.data)) {
                    fallbackResults = fallbackResponse.data.data;
                }

                // Normalize fallback results (only required fields)
                const normalizedFallbackResults = fallbackResults.map((item: Record<string, unknown>) => ({
                    id: (item.id as string) || (item._id as string) || Math.random().toString(),
                    productName: (item.name as string) || (item.productName as string) || (item.product_name as string) || 'Unknown Product',
                    category: (item.category as string) || 'Uncategorized',
                    unitPrice: (item.unitPrice as number) || (item.unit_price as number) || (item.price as number) || 0,
                    inStock: (item.inStock as number) || (item.in_stock as number) || (item.quantity as number) || 0,
                    discount: (item.discount as number) || 0,
                    totalValue: ((item.unitPrice as number) || (item.unit_price as number) || 0) * ((item.inStock as number) || (item.in_stock as number) || 0),
                    status: ((item.status as string) || (((item.inStock as number) || (item.in_stock as number) || 0) > 0 ? 'In Stock' : 'Out of Stock')) as "In Stock" | "Out of Stock" | "Low in Stock"
                }));

                console.log('✅ Fallback search results:', normalizedFallbackResults);
                setSearchResults(normalizedFallbackResults);
                onSearchResults(normalizedFallbackResults);

            } catch (fallbackError: unknown) {
                console.error('❌ Fallback search also failed:', fallbackError);
                // If both searches fail, show empty results
                setSearchResults([]);
                onSearchResults([]);
            }
        } finally {
            setIsSearching(false);
            onLoadingChange(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
        onSearchClear();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Auto-search as user types (with debounce)
        if (value.trim()) {
            const timeoutId = setTimeout(() => {
                handleSearch(value);
            }, 500); // 500ms debounce

            return () => clearTimeout(timeoutId);
        } else {
            handleClearSearch();
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            handleSearch(searchQuery);
        }
    };

    return (
        <div className="w-full max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        type="text"
                        placeholder={isSearching ? "Searching..." : "Search inventory by name..."}
                        value={searchQuery}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 w-full"
                        disabled={isSearching}
                    />
                    {isSearching && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    {searchQuery && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSearch}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                            disabled={isSearching}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {isSearching && (
                    <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="flex items-center justify-center text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Searching...
                        </div>
                    </div>
                )}
            </form>

            {/* Search Results Summary */}
            {hasSearched && !isSearching && (
                <div className="mt-2 text-sm text-gray-600">
                    {searchResults.length > 0 ? (
                        <span className="text-green-600">
                            Found {searchResults.length} item{searchResults.length !== 1 ? 's' : ''} matching "{searchQuery}"
                        </span>
                    ) : (
                        <span className="text-red-600">
                            No items found matching "{searchQuery}"
                        </span>
                    )}
                </div>
            )}

        </div>
    );
}
