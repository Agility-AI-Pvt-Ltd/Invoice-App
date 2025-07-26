import React from "react";
import SearchBar from "./ui/SearchBar";
import ProfileAvatar from "./ui/ProfileAvatar";
import Notification from "./ui/Notification";
import { DateRangePicker } from "./ui/DateRangePicker";

const Header: React.FC = () => {
    return (
        <div className="bg-white px-4 py-3 shadow-sm rounded-md m-2 sm:m-4">
            <div className="flex items-center sm:flex-row sm:items-center sm:justify-between gap-10">
                <h1 className="text-lg sm:text-xl font-bold">Dashboard</h1>

                {/* Desktop */}
                <div className="hidden sm:flex flex-row items-center gap-4">
                    <DateRangePicker />
                    <SearchBar />
                    <Notification />
                    <ProfileAvatar imgUrl="/agility.jpg" />
                </div>

                {/* Mobile */}
                <div className="flex sm:hidden items-center gap-3">
                    <DateRangePicker iconOnly />
                    <SearchBar iconOnly />
                    <Notification/>
                    <ProfileAvatar imgUrl="/agility.jpg" />
                </div>
            </div>
        </div>
    );
};

export default Header;
