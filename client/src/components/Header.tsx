import React, { useEffect, useState } from "react";
import SearchBar from "./ui/SearchBar";
import ProfileAvatar from "./ui/ProfileAvatar";
import Notification from "./ui/Notification";
import { DateRangePicker } from "./ui/DateRangePicker";
import { getProfile } from "@/services/api/auth";

const Header: React.FC<any> = ({ label }: { label: string }) => {
    const [avatarUrl, setAvatarUrl] = useState<string>("/default-avatar.png"); // fallback
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
                const profile = await getProfile();
                if (profile.businessLogo) {
                    setAvatarUrl(profile.businessLogo);
                }
            } catch (err: any) {
                console.error("Failed to fetch profile:", err.message);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    return (
        <div className="bg-white px-4 py-3 shadow-sm rounded-md m-2 sm:m-4">
            <div className="flex items-center sm:flex-row sm:items-center sm:justify-between gap-10">
                <h1 className="text-lg sm:text-xl font-bold">{toTitleCase(label)}</h1>

                {/* Desktop */}
                <div className="hidden sm:flex flex-row items-center gap-4">
                    <DateRangePicker date={selectedDate} onDateChange={setSelectedDate} />
                    <SearchBar />
                    <Notification />
                    <ProfileAvatar imgUrl={avatarUrl} loading={loading} error={error} />
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
