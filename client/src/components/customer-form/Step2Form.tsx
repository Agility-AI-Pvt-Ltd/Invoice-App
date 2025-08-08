
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "../ui/Checkbox";

export default function Step2Form() {
    const [billing, setBilling] = useState({
        address1: "",
        address2: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
    });

    const [shipping, setShipping] = useState({
        address1: "",
        address2: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
    });

    const [sameAsBilling, setSameAsBilling] = useState(false);

    useEffect(() => {
        if (sameAsBilling) {
            setShipping({ ...billing });
        }
    }, [sameAsBilling, billing]);

    const handleBillingChange = (e: any) => {
        const { name, value } = e.target;
        setBilling({ ...billing, [name]: value });
    };

    const handleShippingChange = (e: any) => {
        const { name, value } = e.target;
        setShipping({ ...shipping, [name]: value });
    };

    const fields = [
        { name: "address1", placeholder: "Address Line 1" },
        { name: "address2", placeholder: "Address Line 2" },
        { name: "city", placeholder: "City" },
        { name: "state", placeholder: "State" },
        { name: "pincode", placeholder: "Pincode" },
        { name: "country", placeholder: "Country" },
    ];

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Billing Address */}
                <div>
                    <h3 className="font-semibold text-lg mb-4">Billing Address</h3>
                    {fields.map((field) => (
                        <div key={field.name} className="mb-4">
                            <Label className="text-sm">{field.placeholder}</Label>
                            <Input
                                name={field.name}
                                placeholder={field.placeholder}
                                value={billing[field.name as keyof typeof billing]}
                                onChange={handleBillingChange}
                                className="placeholder:text-slate-400"
                            />
                        </div>
                    ))}
                </div>

                {/* Shipping Address */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Shipping Address</h3>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="sameAsBilling"
                                checked={sameAsBilling}
                                disabled={!billing.address1} // Disable if billing address is empty
                                onCheckedChange={(checked) => setSameAsBilling(Boolean(checked))}
                            />
                            <Label htmlFor="sameAsBilling" className="text-sm ">
                                Same as Billing Address
                            </Label>
                        </div>
                    </div>
                    {fields.map((field) => (
                        <div key={field.name} className="mb-4">
                            <Label className="text-sm">{field.placeholder}</Label>
                            <Input
                                name={field.name}
                                placeholder={field.placeholder}
                                value={shipping[field.name as keyof typeof shipping]}
                                onChange={handleShippingChange}
                                disabled={sameAsBilling}
                                className="placeholder:text-slate-400"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
