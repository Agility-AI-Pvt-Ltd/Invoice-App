import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { menuItems } = useParams<{ menuItems?: string }>();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    // const { profile } = useProfile();
    // if (!profile) {
    //     navigate("/login");
    // }

    useEffect(() => {
        const token = Cookies.get("authToken");

        if (!token) {
            navigate("/login");
        } else {
            setIsAuthenticated(true);
        }
    }, [navigate]);

    if (isAuthenticated === null) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <ProfileProvider> {/* wrap children with profile provider */}
                <AppSidebar />
                <main className="w-full bg-[#F4F4F4]">
                    <SidebarTrigger />
                    <Header label={menuItems} />
                    {children}
                </main>
            </ProfileProvider>
        </SidebarProvider>
    );
}
