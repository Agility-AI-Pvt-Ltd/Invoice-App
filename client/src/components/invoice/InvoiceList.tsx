// FILE : client/src/components/invoice/InvoiceList.tsx

import React, { useState, useEffect } from 'react';
import { getInvoices } from '../../services/api/invoice';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getInvoices();
      // Handle both direct array and paginated response
      const invoices = Array.isArray(response) ? response : response.data || [];
      setInvoices(invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'PAID': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'OVERDUE': 'bg-red-100 text-red-800',
      'DRAFT': 'bg-gray-100 text-gray-800'
    };
    
    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
  };

  const editInvoice = (invoiceId: string) => {
    // Navigate to edit page or open edit modal
    console.log('Edit invoice:', invoiceId);
    // You can implement navigation logic here
  };

  return (
    <div className="invoice-list w-full max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <Button
          onClick={fetchInvoices}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            '🔄 Refresh'
          )}
        </Button>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading invoices...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-red-800">❌ Error:</strong>
              <span className="text-red-700 ml-2">{error}</span>
            </div>
            <Button 
              onClick={fetchInvoices}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[120px]">
                  Invoice #
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[150px]">
                  Client
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[100px]">
                  Date
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[120px]">
                  Amount
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[100px]">
                  Status
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id || invoice._id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">
                      <strong className="text-blue-600 font-mono">
                        {invoice.invoiceNumber}
                      </strong>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <div>
                        <div className="font-medium">{invoice.clientName}</div>
                        {invoice.clientEmail && (
                          <div className="text-sm text-gray-500">{invoice.clientEmail}</div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      {formatDate(invoice.createdAt || invoice.date)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <strong className="text-green-600 font-semibold">
                        {formatAmount(invoice.amount || invoice.total || 0)}
                      </strong>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => editInvoice(invoice.id || invoice._id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          ✏️ Edit
                        </Button>
                        <Button 
                          onClick={() => window.open(`/invoice/${invoice.id || invoice._id}`, '_blank')}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                          👁️ View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
