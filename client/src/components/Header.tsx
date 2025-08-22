import React, { useEffect, useState } from "react";
import SearchBar from "./ui/SearchBar";
import ProfileAvatar from "./ui/ProfileAvatar";
import Notification from "./ui/Notification";
import { DateRangePicker } from "./ui/DateRangePicker";
import { fetchBusinessLogo } from "./setting";
import Cookies from "js-cookie";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";

const Header: React.FC<any> = ({ label }: { label: string }) => {
    const [avatarUrl, setAvatarUrl] = useState<any>(); // fallback
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    function toTitleCase(input: string = ""): string {
        return input
            .replace(/-/g, " ") // Replace hyphens with spaces
            .split(" ")         // Split into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
            .join(" ");         // Join with spaces
    }

    //TODO : Replace with useProfile context
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = Cookies.get("authToken") || "";
                const logo = await fetchBusinessLogo(token);
                console.log(logo)
                setAvatarUrl(logo);
            } catch (err: any) {
                console.error("Failed to fetch profile:", err.message);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const navigate = useNavigate();
    return (
        <div className="bg-white px-4 py-3 shadow-sm rounded-md m-2 sm:m-4">
            <div className="flex items-center sm:flex-row sm:items-center sm:justify-between gap-10 justify-between">
                <h1 className="text-lg sm:text-xl font-bold">{toTitleCase(label)}</h1>

                {/* Desktop */}
                <div className="hidden sm:flex flex-row items-center gap-4">
                    <DateRangePicker
                    // date={selectedDate} onDateChange={setSelectedDate}  //TODO - Uncomment when DateRangePicker is implemented
                    />
                    <SearchBar />
                    <Notification />
                    <>
                        <Avatar className="w-6 h-6 sm:w-10 sm:h-10" onClick={() => navigate('/app/settings')}>
                            <AvatarImage src={avatarUrl} alt="Profile" />
                            <AvatarFallback>{"A"}</AvatarFallback>
                        </Avatar>
                    </>
                </div>

                {/* Mobile */}
                <div className="flex sm:hidden items-center gap-3">
                    {/* <DateRangePicker iconOnly /> */}
                    <SearchBar iconOnly />
                    <Notification />
                    <ProfileAvatar imgUrl={avatarUrl} loading={loading} error={error} />
                </div>
            </div>
        </div>
    );
};

export default Header;
