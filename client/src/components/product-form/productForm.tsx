import type React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "../ui/Input"

interface FormSectionProps {
    title: string
    children: React.ReactNode
}

function FormSection({ title, children }: FormSectionProps) {
    return (
        <div className="border border-gray-200 rounded-lg mb-6">
            {/* Heading Area with BG */}
            <div className="flex justify-between items-center px-6 py-3 bg-[#F4F0FF] rounded-t-lg">
                <h2 className="text-base font-semibold text-gray-800">{title}</h2>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    {/* <Plus className="h-5 w-5" /> */}
                    {/* <span className="sr-only">Add new section</span> */}
                </Button>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {children}
            </div>
        </div>
    )
}

export default function AddProductForm() {
    return (
        <div className="min-h-screen bg-white p-6 md:p-10 overflow-y-auto">
            <div className=" mx-auto">
                {/* Product Details Section */}
                <FormSection title="Product Details">
                    <div className="grid gap-2">
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input id="product-name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="product-sku">Product Code/ SKU</Label>
                        <Input id="product-sku" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sub-category">Sub Category</Label>
                        <Input id="sub-category" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="brand-name">Brand Name</Label>
                        <Input id="brand-name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" />
                    </div>
                </FormSection>

                {/* Pricing & Tax Section */}
                <FormSection title="Pricing & Tax">
                    <div className="grid gap-2">
                        <Label htmlFor="purchase-price">Purchase Price</Label>
                        <Input id="purchase-price" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="selling-price">Selling Price</Label>
                        <Input id="selling-price" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="discount">Discount (if applicable) (% or amount)</Label>
                        <Input id="discount" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tax-rate">Tax Rate</Label>
                        <Input id="tax-rate" />
                    </div>
                </FormSection>

                {/* Stock and Quantity Details Section */}
                <FormSection title="Stock and Quantity Details">
                    <div className="grid gap-2">
                        <Label htmlFor="payment-status">Payment Status</Label>
                        <select
                            id="payment-status"
                            name="payment-status"
                            className="border rounded-md p-2 w-full"
                        >
                            <option value="">Select Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>

                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount-received">Amount Received</Label>
                        <Input id="amount-received" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <select
                            id="payment-method"
                            name="payment-method"
                            className="border rounded-md p-2 w-full"
                        >
                            <option value="">Select Method</option>
                            <option value="upi">UPI</option>
                            <option value="card">Credit/Debit Card</option>
                            <option value="netbanking">Net Banking</option>
                            <option value="cod">Cash on Delivery</option>
                        </select>

                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="due-amount">Due Amount</Label>
                        <Input id="due-amount" />
                    </div>
                </FormSection>

                {/* Supplier/ Vendor Information Section */}
                <FormSection title="Supplier/ Vendor Information">
                    <div className="grid gap-2">
                        <Label htmlFor="vendor-name">Vendor Name</Label>
                        <Input id="vendor-name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="vendor-product-code">Vendor Product Code</Label>
                        <Input id="vendor-product-code" />
                    </div>
                </FormSection>

                {/* Images and Attachments Section */}
                <FormSection title="Images and Attachments">
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="product-image">Product Image</Label>
                        <Input id="product-image" type="file" accept="image/*" />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="remark">Remark</Label>
                        <Textarea id="remark" placeholder="Remark" className="min-h-[100px]" />
                    </div>
                </FormSection>

                {/* Action Buttons */}
                <div className="flex justify-end items-center gap-4 mt-8">
                    <Button
                        variant="link"
                        className="text-[#B5A3FF] hover:text-[#9F91D8] font-medium"
                    >
                        Save as Draft
                    </Button>
                    <Button
                        className="bg-gradient-to-b from-[#B5A3FF] via-[#785FDA] to-[#9F91D8] hover:opacity-90 text-white px-8 py-2 rounded-md"
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    )
}
