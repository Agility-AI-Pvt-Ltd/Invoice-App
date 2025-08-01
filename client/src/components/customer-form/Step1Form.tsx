"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";

export default function Step1Form() {
    return (
        <TooltipProvider>
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Type Dropdown */}
                    <div className="space-y-2 relative">
                        <Label htmlFor="customerType" className="text-sm font-medium text-foreground">
                            Customer Type
                        </Label>
                        <div className="relative">
                            <select
                                id="customerType"
                                className="h-12 px-3 pr-10 py-2 text-sm border border-input bg-background placeholder:text-slate-400 appearance-none w-full rounded-md"
                                defaultValue=""
                            >
                                <option value="" disabled className="text-slate-400">Select a Customer Type</option>
                                <option value="individual">Individual</option>
                                <option value="business">Business</option>
                                <option value="organization">Organization</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                        </div>

                        {/* Tooltip under dropdown */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="text-sm text-blue-600 hover:underline cursor-pointer w-fit items-end">
                                    Learn more about roles
                                </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>Roles determine the permissions and access level of the customer in your system. Choose wisely!</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                            Full Name
                        </Label>
                        <Input
                            id="fullName"
                            placeholder="Full Name"
                            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email@email.com"
                            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                            Phone Number
                        </Label>
                        <Input
                            id="phone"
                            placeholder="+91 855-XXX-987"
                            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
                        />
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
                            Company Name
                        </Label>
                        <Input
                            id="companyName"
                            placeholder="Company Name"
                            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
                        />
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm font-medium text-foreground">
                            Website
                        </Label>
                        <Input
                            id="website"
                            type="url"
                            placeholder="Website.site"
                            className="h-11 px-3 py-2 text-sm border border-input bg-background placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
