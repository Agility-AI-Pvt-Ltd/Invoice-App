import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/contexts/ProfileContext";

export default function Settings() {
  const [lightMode, setLightMode] = useState(true);
  const { profile } = useProfile();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">
        
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Profile */}
          <Card className="p-4 sm:p-6 xl:col-span-1 bg-white">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                <AvatarImage src="/public/dp.png" alt="Profile" />
                <AvatarFallback>FN</AvatarFallback>
              </Avatar>
              <Button variant="link" className="text-primary font-medium p-0 h-auto text-sm sm:text-base">
                Change Profile Photo
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Name:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2">{profile?.name || "Full Name"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Email:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2 break-all">{profile?.email || "user@email.com"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Phone No.:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2">+91 966 696 123</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Plan:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2">Hardcoded</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Label htmlFor="light-mode" className="font-medium text-foreground text-sm">
                  Light/Dark Mode
                </Label>
                <Switch
                  id="light-mode"
                  checked={lightMode}
                  onCheckedChange={setLightMode}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30"
                />
              </div>
            </div>
          </Card>

          {/* Right Column - Form */}
          <Card className="p-4 sm:p-6 xl:col-span-2 bg-white">
            <form className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullname"
                    placeholder="Text"
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessname" className="text-sm font-medium text-foreground">
                    Business Name/ Company Name
                  </Label>
                  <Input
                    id="businessname"
                    placeholder="Text"
                    className="bg-background border-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={profile?.email ?? ""}
                    readOnly
                    disabled
                    className="bg-muted border-input text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-foreground">
                    Business Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Address"
                    className="bg-background border-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentpassword" className="text-sm font-medium text-foreground">
                    Change Password
                  </Label>
                  <Input
                    id="currentpassword"
                    type="password"
                    placeholder="Current Password"
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-foreground">
                    State
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="california">California</SelectItem>
                      <SelectItem value="newyork">New York</SelectItem>
                      <SelectItem value="texas">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newpassword" className="text-sm font-medium text-foreground">
                    New Password
                  </Label>
                  <Input
                    id="newpassword"
                    type="password"
                    placeholder="New Password"
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-foreground">
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="xxxx"
                    className="bg-background border-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmpassword" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmpassword"
                    type="password"
                    placeholder="Confirm Password"
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan" className="text-sm font-medium text-foreground">
                    PAN Number
                  </Label>
                  <Input
                    id="pan"
                    placeholder="xxxxx"
                    className="bg-background border-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+91 xxxxxxxxxx"
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst" className="text-sm font-medium text-foreground">
                    GST Number (if Registered)
                  </Label>
                  <Input
                    id="gst"
                    placeholder="xxxxx"
                    className="bg-background border-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateformat" className="text-sm font-medium text-foreground">
                    Date & Time Format
                  </Label>
                  <Input
                    id="dateformat"
                    placeholder="DD/MM/YYYY"
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-sm font-medium text-foreground">
                    Add Business Logo
                  </Label>
                  <Button variant="outline" className="w-full justify-start text-muted-foreground">
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 rounded-md font-medium">
                  Save
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}