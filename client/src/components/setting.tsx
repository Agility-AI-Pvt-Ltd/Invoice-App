import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { useProfile } from "@/contexts/ProfileContext";
import { getUserProfile, updateUserProfile, type UserProfile } from "@/services/api/settings";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

export default function Settings() {
  // const [lightMode, setLightMode] = useState(true);
  // const { profile } = useProfile();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    address: "",
    phone: "",
    website: "",
    state: "",
    gstNumber: "",
    panNumber: "",
    isGstRegistered: false
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get('authToken') || "";
        const userData = await getUserProfile(token);
        setUserProfile(userData);
        setFormData({
          name: userData.name || "",
          company: userData.company || "",
          address: userData.address || "",
          phone: userData.phone || "",
          website: userData.website || "",
          state: userData.state || "",
          gstNumber: userData.gstNumber || "",
          panNumber: userData.panNumber || "",
          isGstRegistered: userData.isGstRegistered || false
        });

      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('authToken') || "";
      await updateUserProfile(token, formData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      // Refresh profile data
      const updatedProfile = await getUserProfile(token);
      setUserProfile(updatedProfile);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            <div className="xl:col-span-2 h-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">


        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Profile */}
          <Card className="p-4 sm:p-6 xl:col-span-1 bg-white">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                <AvatarImage src={userProfile?.businessLogo || "/public/dp.png"} alt="Profile" />
                <AvatarFallback>{userProfile?.name?.charAt(0) || "FN"}</AvatarFallback>
              </Avatar>
              <Button variant="link" className="text-primary font-medium p-0 h-auto text-sm sm:text-base">
                Change Profile Photo
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Name:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2">{userProfile?.name || "Full Name"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Email:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2 break-all">{userProfile?.email || "user@email.com"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Phone No.:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2">{userProfile?.phone || "+91 966 696 123"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Plan:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2">Free</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                {/* <Label htmlFor="light-mode" className="font-medium text-foreground text-sm">
                  Light/Dark Mode
                </Label>
                <Switch
                  id="light-mode"
                  checked={lightMode}
                  onCheckedChange={setLightMode}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30"
                /> */}
              </div>
            </div>
          </Card>

          {/* Right Column - Form */}
          <Card className="p-4 sm:p-6 xl:col-span-2 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullname"
                    placeholder="Text"
                    className="bg-background border-input"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
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
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
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
                    value={userProfile?.email ?? ""}
                    disabled
                    className="bg-muted border-input"
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
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
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
                  <Select
                    value={formData.state}
                    onValueChange={(value) => handleInputChange('state', value)}
                  >
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
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
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
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value)}
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
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
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
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
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