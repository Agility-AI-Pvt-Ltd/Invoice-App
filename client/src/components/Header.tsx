import React from "react";
import ProfileAvatar from "./ui/ProfileAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";

const Header: React.FC<any> = ({ label }: { label: string }) => {
    const { profile, loading } = useProfile();
    
    function toTitleCase(input: string = ""): string {
        return input
            .replace(/-/g, " ") // Replace hyphens with spaces
            .split(" ")         // Split into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
            .join(" ");         // Join with spaces
    }

    // Get profile picture URL from profile context
    const profilePictureUrl = profile?.data?.profilePicture || "";
    const userName = profile?.data?.name || "User";

    const navigate = useNavigate();
    return (
        <div className="bg-white px-4 py-3 shadow-sm rounded-md m-2 sm:m-4">
            <div className="flex items-center sm:flex-row sm:items-center sm:justify-between gap-10 justify-between">
                <h1 className="text-lg sm:text-xl font-bold">{toTitleCase(label)}</h1>

                {/* Desktop */}
                <div className="hidden sm:flex flex-row items-center gap-4">
                    {/* <DateRangePicker
                    date={selectedDate} onDateChange={setSelectedDate}  //TODO - Uncomment when DateRangePicker is implemented
                    /> */}
                    {/* <SearchBar /> */}
                    {/* <Notification /> */}
                    <>
                        <Avatar className="w-6 h-6 sm:w-10 sm:h-10 cursor-pointer" onClick={() => navigate('/app/profile')}>
                            <AvatarImage 
                                src={profilePictureUrl} 
                                alt="Profile"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    const img = e.currentTarget as HTMLImageElement;
                                    img.src = ""; // force fallback to initials
                                }}
                            />
                            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </>
                </div>

                {/* Mobile */}
                <div className="flex sm:hidden items-center gap-3">
                    {/* <DateRangePicker iconOnly /> */}
                    {/* <SearchBar iconOnly /> */}
                    {/* <Notification /> */}
                    <Avatar className="w-8 h-8 cursor-pointer" onClick={() => navigate('/app/profile')}>
                        <AvatarImage 
                            src={profilePictureUrl} 
                            alt="Profile"
                            crossOrigin="anonymous"
                            onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                img.src = ""; // force fallback to initials
                            }}
                        />
                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
    );
};

export default Header;