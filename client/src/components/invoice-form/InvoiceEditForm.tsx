// FILE : client/src/components/invoice-form/InvoiceEditForm.tsx

import React, { useState } from 'react';
import { updateInvoice } from '../../services/api/invoice';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface InvoiceEditFormProps {
  invoiceId: string;
  initialData: any;
  onSave: (data: any) => void;
}

const InvoiceEditForm: React.FC<InvoiceEditFormProps> = ({ 
  invoiceId, 
  initialData, 
  onSave 
}) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare update data
      const updateData = {
        totalTax: formData.totalTax,
        subtotal: formData.subtotal,
        cgst: formData.cgst,
        sgst: formData.sgst,
        igst: formData.igst,
        amount: formData.amount,
        // Add other fields that can be updated
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        // ... other updatable fields
      };

      console.log('🔄 Updating invoice with data:', updateData);

      const result = await updateInvoice(invoiceId, updateData);
      
      console.log('✅ Invoice updated successfully:', result);
      onSave(result);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice';
      setError(errorMessage);
      console.error('❌ Error updating invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-edit-form w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Invoice</h2>
      
      {/* Tax Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <Label htmlFor="totalTax" className="text-sm font-medium text-foreground">
            Total Tax
          </Label>
          <Input
            id="totalTax"
            type="number"
            value={formData.totalTax || ''}
            onChange={(e) => handleFieldChange('totalTax', parseFloat(e.target.value) || 0)}
            className="h-11 px-3 text-sm border border-input bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtotal" className="text-sm font-medium text-foreground">
            Subtotal
          </Label>
          <Input
            id="subtotal"
            type="number"
            value={formData.subtotal || ''}
            onChange={(e) => handleFieldChange('subtotal', parseFloat(e.target.value) || 0)}
            className="h-11 px-3 text-sm border border-input bg-background"
          />
        </div>
      </div>

      {/* GST Breakdown (Read-only, calculated by backend) */}
      <div className="gst-breakdown mb-6">
        <h4 className="text-lg font-semibold mb-4">GST Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">CGST</Label>
            <Input
              type="number"
              value={formData.cgst || 0}
              readOnly
              className="h-11 px-3 text-sm border border-input bg-background bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">SGST</Label>
            <Input
              type="number"
              value={formData.sgst || 0}
              readOnly
              className="h-11 px-3 text-sm border border-input bg-background bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">IGST</Label>
            <Input
              type="number"
              value={formData.igst || 0}
              readOnly
              className="h-11 px-3 text-sm border border-input bg-background bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <strong className="text-red-800">❌ Update Failed:</strong>
          <span className="text-red-700 ml-2">{error}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="form-actions flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            '💾 Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceEditForm;
