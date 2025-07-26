import { AppSidebar } from "@/components/AppSidebar"
import Header from "@/components/Header"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="dashboard-theme">
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full bg-gray-50">
                    <SidebarTrigger />
                    <Header/>
                    {children}
                </main>
            </SidebarProvider>
        </div>
    )
}