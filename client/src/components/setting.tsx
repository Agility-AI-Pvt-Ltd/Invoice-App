import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserProfile, updateUserProfile, changePassword, uploadBusinessLogo, type UserProfile } from "@/services/api/settings";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export async function fetchBusinessLogo(): Promise<string> {
  try {
    const response = await api.get("/api/profile/logo", {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data); // returns usable image URL
  } catch (error) {
    // If logo endpoint doesn't exist, return empty string
    console.warn("Logo endpoint not available:", error);
    throw error;
  }
}

export default function Settings() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 UI Message state
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // 🔹 Password-specific message state
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 🔹 Original data to compare against for changes
  const [originalData, setOriginalData] = useState({
    name: "",
    businessName: "",
    address: "",
    phone: "",
    website: "",
    state: "",
    gst: "",
    pan: "",
    isGstRegistered: false,
    logoUrl: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    address: "",
    phone: "",
    website: "",
    state: "",
    gst: "",
    pan: "",
    isGstRegistered: false,
    logoUrl: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // 🔹 Function to clear password message
  const clearPasswordMessage = () => {
    setPasswordMessage(null);
  };

  // 🔹 Check if form has changes
  const hasChanges = () => {
    return Object.keys(formData).some(key => {
      const formValue = formData[key as keyof typeof formData];
      const originalValue = originalData[key as keyof typeof originalData];
      return formValue !== originalValue;
    });
  };

  // 🔹 Function to refresh logo
  const refreshLogo = async () => {
    try {
      const logoUrl = await fetchBusinessLogo();
      setFormData(prev => ({ ...prev, logoUrl }));
      setOriginalData(prev => ({ ...prev, logoUrl }));
    } catch (e) {
      console.warn("No logo found, using fallback");
      setFormData(prev => ({ ...prev, logoUrl: "" }));
      setOriginalData(prev => ({ ...prev, logoUrl: "" }));
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        let logoUrl = "";
        try {
          logoUrl = await fetchBusinessLogo();
        } catch (e) {
          console.warn("No logo found, using fallback");
        }
        console.log(userData)
        setUserProfile(userData);
        
        const profileData = {
          name: userData.data.name || "",
          businessName: userData.data.businessName || "",
          address: userData.data.address || "",
          phone: userData.data.phone || "",
          website: userData.data.website || "",
          state: userData.data.state || "",
          gst: userData.data.gst || "",
          pan: userData.data.pan || "",
          isGstRegistered: userData.data.isGstRegistered || false,
          logoUrl: logoUrl // prefer blob if exists
        };

        setFormData(profileData);
        setOriginalData(profileData); // 🔹 Store original data
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive",
        });
        setMessage({ type: "error", text: "Failed to fetch user profile" });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  // 🔹 Auto-clear password success messages after 5 seconds
  useEffect(() => {
    if (passwordMessage?.type === "success") {
      const timer = setTimeout(() => {
        setPasswordMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordMessage]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setMessage({ type: "success", text: "Profile updated successfully" });

      const updatedProfile = await getUserProfile();
      setUserProfile(updatedProfile);
      
      // 🔹 Update original data to match current form data after successful save
      setOriginalData({ ...formData });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      setMessage({ type: "error", text: "Failed to update profile" });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      setPasswordMessage({ type: "error", text: "New password and confirm password do not match" });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long",
        variant: "destructive",
      });
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters long" });
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setPasswordMessage({ type: "success", text: "Password changed successfully" });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.detail || "Failed to change password";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setPasswordMessage({ type: "error", text: errorMessage });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        setMessage({ type: "error", text: "File size must be less than 5MB" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      setMessage({ type: "error", text: "Please select a file first" });
      return;
    }

    try {
      setUploadingLogo(true);
      await uploadBusinessLogo(selectedFile);

      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
      setMessage({ type: "success", text: "Logo uploaded successfully" });

      const updatedProfile = await getUserProfile();
      setUserProfile(updatedProfile);

      // 🔹 Refresh logo after upload
      await refreshLogo();

      setSelectedFile(null);
      const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      const errorMessage = error.response?.data?.detail || "Failed to upload logo";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setUploadingLogo(false);
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

        {message && (
          <div
            className={`mb-4 p-3 rounded-md text-sm font-medium ${message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-400"
              : "bg-red-100 text-red-700 border border-red-400"
              }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Profile */}
          <Card className="p-4 sm:p-6 xl:col-span-1 bg-white">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                <AvatarImage src={formData.logoUrl} alt="Profile" />
                <AvatarFallback>{userProfile?.data?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="link" className="text-primary font-medium p-0 h-auto text-sm sm:text-base">
                {/* Change Profile Photo */}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Name:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2">{userProfile?.data?.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Email:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2 break-all">{userProfile?.data?.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Phone No.:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2">{userProfile?.data?.phone || userProfile?.data.PhoneNumber}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-foreground min-w-[80px]">Plan:</span>
                  <span className="text-muted-foreground mt-1 sm:mt-0 sm:ml-2">{userProfile?.data.plan}</span>
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
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
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
                    value={userProfile?.data?.email ?? ""}
                    readOnly
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
                  <Label htmlFor="state" className="text-sm font-medium text-foreground">
                    State
                  </Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => handleInputChange('state', value)}
                  >
                    <SelectTrigger className="bg-background border-input w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jammu-and-kashmir">01 - JAMMU AND KASHMIR</SelectItem>
                      <SelectItem value="himachal-pradesh">02 - HIMACHAL PRADESH</SelectItem>
                      <SelectItem value="punjab">03 - PUNJAB</SelectItem>
                      <SelectItem value="chandigarh">04 - CHANDIGARH</SelectItem>
                      <SelectItem value="uttarakhand">05 - UTTARAKHAND</SelectItem>
                      <SelectItem value="haryana">06 - HARYANA</SelectItem>
                      <SelectItem value="delhi">07 - DELHI</SelectItem>
                      <SelectItem value="rajasthan">08 - RAJASTHAN</SelectItem>
                      <SelectItem value="uttar-pradesh">09 - UTTAR PRADESH</SelectItem>
                      <SelectItem value="bihar">10 - BIHAR</SelectItem>
                      <SelectItem value="sikkim">11 - SIKKIM</SelectItem>
                      <SelectItem value="arunachal-pradesh">12 - ARUNACHAL PRADESH</SelectItem>
                      <SelectItem value="nagaland">13 - NAGALAND</SelectItem>
                      <SelectItem value="manipur">14 - MANIPUR</SelectItem>
                      <SelectItem value="mizoram">15 - MIZORAM</SelectItem>
                      <SelectItem value="tripura">16 - TRIPURA</SelectItem>
                      <SelectItem value="meghalaya">17 - MEGHALAYA</SelectItem>
                      <SelectItem value="assam">18 - ASSAM</SelectItem>
                      <SelectItem value="west-bengal">19 - WEST BENGAL</SelectItem>
                      <SelectItem value="jharkhand">20 - JHARKHAND</SelectItem>
                      <SelectItem value="odisha">21 - ODISHA</SelectItem>
                      <SelectItem value="chattisgarh">22 - CHATTISGARH</SelectItem>
                      <SelectItem value="madhya-pradesh">23 - MADHYA PRADESH</SelectItem>
                      <SelectItem value="gujarat">24 - GUJARAT</SelectItem>
                      <SelectItem value="dadra-nagar-haveli-daman-diu">26* - DADRA AND NAGAR HAVELI AND DAMAN AND DIU NEWLY MERGED UT</SelectItem>
                      <SelectItem value="maharashtra">27 - MAHARASHTRA</SelectItem>
                      <SelectItem value="andhra-pradesh-before-division">28 - ANDHRA PRADESH BEFORE DIVISION</SelectItem>
                      <SelectItem value="karnataka">29 - KARNATAKA</SelectItem>
                      <SelectItem value="goa">30 - GOA</SelectItem>
                      <SelectItem value="lakshadweep">31 - LAKSHADWEEP</SelectItem>
                      <SelectItem value="kerala">32 - KERALA</SelectItem>
                      <SelectItem value="tamil-nadu">33 - TAMIL NADU</SelectItem>
                      <SelectItem value="puducherry">34 - PUDUCHERRY</SelectItem>
                      <SelectItem value="andaman-nicobar">35 - ANDAMAN AND NICOBAR ISLANDS</SelectItem>
                      <SelectItem value="telangana">36 - TELANGANA</SelectItem>
                      <SelectItem value="andhra-pradesh-new">37 - ANDHRA PRADESH NEWLY ADDED</SelectItem>
                      <SelectItem value="ladakh">38 - LADAKH NEWLY ADDED</SelectItem>
                      <SelectItem value="outside-india">OUTSIDE INDIA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <Label htmlFor="pan" className="text-sm font-medium text-foreground">
                    PAN Number
                  </Label>
                  <Input
                    id="pan"
                    placeholder="xxxxx"
                    className="bg-background border-input"
                    value={formData.pan}
                    onChange={(e) => handleInputChange('pan', e.target.value)}
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
                    className="bg-muted border-input"
                    value={formData.phone}
                    readOnly
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
                    value={formData.gst}
                    onChange={(e) => handleInputChange('gst', e.target.value)}
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
                    className="bg-muted border-input"
                    value={userProfile?.data.dateFormat}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-sm font-medium text-foreground">
                    Add Business Logo
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="bg-background border-input"
                    />
                    {selectedFile && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
                        <Button
                          onClick={handleLogoUpload}
                          disabled={uploadingLogo}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {uploadingLogo ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={!hasChanges()}
                  className={`${
                    hasChanges() 
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Save Changes
                </Button>
              </div>


            </form>

            {/* Password Change Section - Moved outside form */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-medium text-foreground mb-4">Change Password</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="currentpassword" className="text-sm font-medium text-foreground">
                    Current Password
                  </Label>
                  <Input
                    id="currentpassword"
                    type="password"
                    placeholder="Current Password"
                    className="bg-background border-input"
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }));
                      clearPasswordMessage();
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newpassword" className="text-sm font-medium text-foreground">
                    New Password
                  </Label>
                  <Input
                    id="newpassword"
                    type="password"
                    placeholder="New Password"
                    className="bg-background border-input"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                      clearPasswordMessage();
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmpassword" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmpassword"
                    type="password"
                    placeholder="Confirm Password"
                    className="bg-background border-input"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                      clearPasswordMessage();
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <div className="space-y-2">

                    <Button
                      type="button"
                      onClick={handlePasswordChange}
                      disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium border-2 border-blue-600"
                      style={{ minWidth: '150px', minHeight: '40px' }}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
              {passwordMessage && (
                <div
                  className={`mt-4 p-3 rounded-md text-sm font-medium ${passwordMessage.type === "success"
                    ? "bg-green-100 text-green-700 border border-green-400"
                    : "bg-red-100 text-red-700 border border-red-400"
                    }`}
                >
                  {passwordMessage.text}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}