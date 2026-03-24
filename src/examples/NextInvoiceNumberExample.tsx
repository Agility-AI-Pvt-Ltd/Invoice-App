// Example component showing how to use the useNextInvoiceNumber hook
import React from 'react';
import { useNextInvoiceNumber, useNextInvoiceNumberManual } from '@/hooks/useNextInvoiceNumber';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Loader2 } from 'lucide-react';

// Example 1: Auto-fetch on mount
export function AutoFetchExample() {
  const { 
    nextNumber, 
    loading, 
    error, 
    refetch,
    userSettings,
    currentCount 
  } = useNextInvoiceNumber();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Auto-fetch Example</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <div className="relative">
            <Input
              id="invoiceNumber"
              value={nextNumber}
              placeholder={loading ? 'Loading...' : 'Invoice Number'}
              readOnly
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {nextNumber && !loading && (
          <div className="text-sm text-green-600">
            ✅ Next invoice number ready: <strong>{nextNumber}</strong>
            <div className="text-xs text-gray-500 mt-1">
              Current count: {currentCount} | Prefix: {userSettings.prefix} | Start: {userSettings.startNumber}
            </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600">
            ❌ {error}
            <Button onClick={refetch} variant="outline" size="sm" className="ml-2">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Example 2: Manual fetch control
export function ManualFetchExample() {
  const { 
    nextNumber, 
    loading, 
    error, 
    fetchNextNumber 
  } = useNextInvoiceNumberManual();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Manual Fetch Example</h3>
      
      <div className="space-y-4">
        <Button 
          onClick={fetchNextNumber} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            'Get Next Invoice Number'
          )}
        </Button>

        {nextNumber && (
          <div>
            <Label htmlFor="manualInvoiceNumber">Next Invoice Number</Label>
            <Input
              id="manualInvoiceNumber"
              value={nextNumber}
              readOnly
              className="bg-gray-50"
            />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600">
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
}

// Example 3: Form integration
export function FormIntegrationExample() {
  const { nextNumber, loading, refetch } = useNextInvoiceNumber();
  const [invoiceNumber, setInvoiceNumber] = React.useState('');

  // Auto-populate when nextNumber is available
  React.useEffect(() => {
    if (nextNumber && !invoiceNumber) {
      setInvoiceNumber(nextNumber);
    }
  }, [nextNumber, invoiceNumber]);

  const handleRefresh = async () => {
    await refetch();
    if (nextNumber) {
      setInvoiceNumber(nextNumber);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Form Integration Example</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="formInvoiceNumber">Invoice Number</Label>
          <div className="relative">
            <Input
              id="formInvoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder={loading ? 'Loading...' : 'Enter invoice number'}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Next available: {nextNumber || 'Loading...'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => setInvoiceNumber(nextNumber || '')}
            disabled={!nextNumber}
            variant="outline"
          >
            Use Next Number
          </Button>
          <Button 
            onClick={() => setInvoiceNumber('')}
            variant="outline"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main example component
export default function NextInvoiceNumberExamples() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Next Invoice Number Hook Examples</h1>
      
      <AutoFetchExample />
      <ManualFetchExample />
      <FormIntegrationExample />
    </div>
  );
}
