import { useState } from "react";
import ActionButton from "./ui/ActionButton";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useNavigate } from "react-router-dom";

const ActionToolbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddClient = () => {
    navigate("/app/my-customers");
  };

  const handleANewInvoice = () => {
    navigate("/app/invoices");
  };

  return (
    <div className="flex gap-3">
      {/* Full buttons for medium+ screens */}
      <div className="hidden sm:flex flex-wrap gap-3">
        <ActionButton
          label="New Invoice"
          onClick={handleANewInvoice}
          className="bg-white-500 text-black hover:bg-black-600 hover:text-white"
        />
        <ActionButton
          label="Add Client"
          onClick={handleAddClient}
          className="bg-white-500 text-black hover:bg-black-600 hover:text-white"
        />
        {/* <ActionButton label="Add Payment" />
        <ActionButton label="Generate Report" /> */}
      </div>

      {/* For mobile (popover) */}
      <div className="sm:hidden">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2 w-48">
            <ActionButton
              label="New Invoice"
              iconOnly={false}
              onClick={() => {
                setOpen(false); // close popover
                handleANewInvoice();
              }}
            />
            <ActionButton
              label="Add Client"
              iconOnly={false}
              onClick={() => {
                setOpen(false); // close popover
                handleAddClient();
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ActionToolbar;
