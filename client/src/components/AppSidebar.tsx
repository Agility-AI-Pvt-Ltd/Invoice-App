import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar"
import {
    Home,
    Users,
    // FileText,
    Boxes,
    Receipt,
    UserCog,
    WalletMinimal,
    Settings,
    LogOut,
    BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useProfile } from "@/contexts/ProfileContext"

function slugify(label: string) {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function toTitleCase(input: string = ""): string {
    return input
        .replace(/-/g, " ") // Replace hyphens with spaces
        .split(" ")         // Split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
        .join(" ");         // Join with spaces
}

const menuItems = [
    { label: "Dashboard", icon: Home },
    { label: "My Customers", icon: Users },
    { label: "Sales", icon: BarChart2 },
    // { label: "Products/Services", icon: Package },
    { label: "Inventory", icon: Boxes },
    // { label: "Sales", icon: BarChart2 },
    { label: "Expenses", icon: WalletMinimal },
    // { label: "Purchases", icon: ShoppingCart },
    { label: "Tax Summary", icon: Receipt },
    // { label: "Accounts", icon: CreditCard },
    { label: "Team", icon: UserCog },
    { label: "Settings", icon: Settings },
]

export function AppSidebar() {
    const param = useParams();
    console.log(toTitleCase(param.menuItems))
    const [selected, setSelected] = useState(toTitleCase(param.menuItems));
    const navigate = useNavigate();
    const { logout } = useProfile();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (param.menuItems) {
            const titleCaseLabel = toTitleCase(param.menuItems);
            console.log("Title Case Label:", titleCaseLabel);
            setSelected(titleCaseLabel);
        }
    }, [param.menuItems]);

    return (
        <Sidebar className="bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
            <SidebarHeader>
                <div className="flex">
                    <img src="/agility.jpg" alt="Logo" className="h-18 m-2" />
                    <div className="flex flex-col items-center py-4">
                        <div className="text-xl font-bold text-white">Agility AI Invoicely</div>
                        <div className="text-xs text-muted-foreground">Powered by AgilityAI</div>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="overflow-auto scrollbar-hide">
                    {menuItems.map(({ label, icon: Icon }) => {
                        const isSelected = selected === label
                        console.log(label)
                        return (
                            <button
                                key={label}
                                className={cn(
                                    "flex items-center gap-3 w-full text-left px-4 py-3 rounded-md transition-all text-sm ",
                                    isSelected
                                        ? "rounded-md relative bg-white text-black font-semibold px-4 py-3 ml-3 mr-4  w-[92%] before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-purple-600"
                                        : "hover:bg-[#2b2b2b] text-white pl-4"
                                )}
                                onClick={() => {
                                    setSelected(label)
                                    navigate(`/app/${slugify(label)}`)
                                }}
                            >
                                <Icon className={cn("w-5 h-5", isSelected && "text-black")} />
                                <span>{label}</span>
                            </button>
                        )
                    })}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="p-4 border-t border-sidebar-border">
                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-md transition-colors text-sm hover:bg-red-600 text-white"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
