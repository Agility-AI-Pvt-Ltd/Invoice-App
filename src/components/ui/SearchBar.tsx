import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchBar = ({ iconOnly = false }: { iconOnly?: boolean }) => {
    if (iconOnly) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="w-9 h-9">
                        <Search className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2">
                    <Input
                        type="text"
                        placeholder="Search Client, Invoice ID & more..."
                        className="text-sm"
                    />
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search Client, Invoice ID & more..."
                className="pl-3 pr-10 py-1 border rounded-md shadow-sm text-sm w-72"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                🔍
            </div>
        </div>
    );
};

export default SearchBar;
