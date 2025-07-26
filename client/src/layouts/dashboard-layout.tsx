import { AppSidebar } from "@/components/AppSidebar"
import Header from "@/components/Header"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full bg-[#F4F4F4]">
                <SidebarTrigger />
                <Header/>
                {children}
            </main>
        </SidebarProvider>
    )
}