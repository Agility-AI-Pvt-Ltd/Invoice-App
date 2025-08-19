// File: client/src/components/sales-form/Step2Form.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "../ui/Checkbox.tsx";

type StepProps = {
  data?: Record<string, any>;
  onChange?: (partial: Record<string, any>) => void;
};

export default function Step2Form({ data = {}, onChange }: StepProps) {
  // Local state for controlled inputs (keeps UI identical but allows parent sync)
  const [customerName, setCustomerName] = useState<string>(data?.customerName ?? "");
  const [billingAddress, setBillingAddress] = useState<string>(data?.billingAddress ?? "");
  const [shippingAddress, setShippingAddress] = useState<string>(data?.shippingAddress ?? "");
  const [sameAsBilling, setSameAsBilling] = useState<boolean>(Boolean(data?.sameAsBilling));
  const [email, setEmail] = useState<string>(data?.email ?? "");
  const [phone, setPhone] = useState<string>(data?.phone ?? "");
  const [gstin, setGstin] = useState<string>(data?.gstin ?? "");
  const [customerType, setCustomerType] = useState<string>(data?.customerType ?? "");
  const [country, setCountry] = useState<string>(data?.country ?? "India");
  const [stateValue, setStateValue] = useState<string>(data?.state ?? "");
  const [pan, setPan] = useState<string>(data?.pan ?? "");

  // Keep local state in sync when parent-provided `data` changes
  useEffect(() => {
    if (data) {
      setCustomerName(data?.customerName ?? "");
      setBillingAddress(data?.billingAddress ?? "");
      setShippingAddress(data?.shippingAddress ?? "");
      setSameAsBilling(Boolean(data?.sameAsBilling));
      setEmail(data?.email ?? "");
      setPhone(data?.phone ?? "");
      setGstin(data?.gstin ?? "");
      setCustomerType(data?.customerType ?? "");
      setCountry(data?.country ?? "India");
      setStateValue(data?.state ?? "");
      setPan(data?.pan ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // When checkbox toggled
  function handleSameAsBillingChange(checked: boolean) {
    setSameAsBilling(checked);
    if (checked) {
      setShippingAddress(billingAddress);
      onChange?.({ sameAsBilling: true, shippingAddress: billingAddress });
    } else {
      setShippingAddress("");
      onChange?.({ sameAsBilling: false, shippingAddress: "" });
    }
  }

  // When billing address changes, update shipping address if sameAsBilling is true
  function handleBillingAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setBillingAddress(value);
    onChange?.({ billingAddress: value });
    if (sameAsBilling) {
      setShippingAddress(value);
      onChange?.({ shippingAddress: value });
    }
  }

  return (
    <div className="p-6">
      <h3 className="font-semibold text-lg mb-6">Buyer (Bill To)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column */}
        <div className="space-y-8">
          <div>
            <Label htmlFor="customerName" className="mb-2 block">
              Customer Name
            </Label>
            <Input
              id="customerName"
              placeholder="Name"
              value={customerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCustomerName(e.target.value);
                onChange?.({ customerName: e.target.value });
              }}
              className="p-3"
            />
          </div>

          <div>
            <Label htmlFor="billingAddress" className="mb-2 block">
              Billing Address
            </Label>
            <Input
              id="billingAddress"
              placeholder="Billing Address"
              value={billingAddress}
              onChange={handleBillingAddressChange}
              className="p-3"
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                onChange?.({ email: e.target.value });
              }}
              className="p-3"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="mb-2 block">
              Phone Number
            </Label>
            <Input
              id="phone"
              placeholder="Phone no."
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPhone(e.target.value);
                onChange?.({ phone: e.target.value });
              }}
              className="p-3"
            />
          </div>

          <div>
            <Label htmlFor="gstin" className="mb-2 block">
              GSTRIN/Tax ID
            </Label>
            <Input
              id="gstin"
              placeholder="XXXX"
              value={gstin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setGstin(e.target.value);
                onChange?.({ gstin: e.target.value });
              }}
              className="p-3"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div>
            <Label htmlFor="customerType" className="mb-2 block">
              Customer Type
            </Label>
            {/* Keep existing Select UI intact; sync selection to local state */}
            <Select
              // many Select implementations accept value/onValueChange; if yours does, this will work.
              value={customerType}
              onValueChange={(val: string) => {
                setCustomerType(val);
                onChange?.({ customerType: val });
              }}
            >
              <SelectTrigger id="customerType" className="w-full py-3 px-4">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="shippingAddress" className="mb-2  flex items-center gap-3">
              Shipping Address
              <Checkbox
                id="sameAsBilling"
                checked={sameAsBilling}
                onCheckedChange={handleSameAsBillingChange}
              />

              <span className="text-sm select-none">Same as Billing Address</span>
            </Label>
            <Input
              id="shippingAddress"
              placeholder="Shipping Address"
              value={shippingAddress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setShippingAddress(e.target.value);
                onChange?.({ shippingAddress: e.target.value });
              }}
              disabled={sameAsBilling}
              className={`p-3 ${sameAsBilling ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <Label htmlFor="country" className="mb-2 block">
              Country
            </Label>
            <Input
              id="country"
              placeholder="India"
              value={country}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCountry(e.target.value);
                onChange?.({ country: e.target.value });
              }}
            />
          </div>

          <div>
            <Label htmlFor="state" className="mb-2 block">
              State
            </Label>
            <Select
              value={stateValue}
              onValueChange={(val: string) => {
                setStateValue(val);
                onChange?.({ state: val });
              }}
            >
              <SelectTrigger id="state" className="w-full py-3 px-4">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="gujarat">Gujarat</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                  {/* Add more states as needed */}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pan" className="mb-2 block">
              PAN Number
            </Label>
            <Input
              id="pan"
              placeholder="XXXX"
              value={pan}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPan(e.target.value);
                onChange?.({ pan: e.target.value });
              }}
              className="p-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
