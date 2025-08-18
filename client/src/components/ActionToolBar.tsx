import { useState } from 'react';
import ActionButton from './ui/ActionButton';
import { Plus } from 'lucide-react';
import { Button } from './ui/button'; // Assuming you're using shadcn/ui or similar
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useNavigate } from 'react-router-dom';

const ActionToolbar = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    return (
        <div className="flex gap-3">
            {/* Full buttons for medium+ screens */}
            <div className="hidden sm:flex flex-wrap gap-3">
                <ActionButton label="New Invoice" onClick={()=>navigate("/app/invoices")}/>
                <ActionButton label="Add Client" />
                <ActionButton label="Add Payment" />
                <ActionButton label="Generate Report" />
            </div>

            
            <div className="sm:hidden">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button size="icon" variant="outline">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col gap-2 w-48">
                        <ActionButton label="New Invoice" iconOnly={false} />
                        <ActionButton label="Add Client" iconOnly={false} />
                        <ActionButton label="Add Payment" iconOnly={false} />
                        <ActionButton label="Generate Report" iconOnly={false} />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export default ActionToolbar;
