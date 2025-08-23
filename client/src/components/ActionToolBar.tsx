import { useState } from "react";
import ActionButton from "./ui/ActionButton";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useNavigate } from "react-router-dom";

const ActionToolbar = () => {
  //@ts-ignore
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddClient = () => {
    // navigate to customers page and instruct it to open Add Customer form
    navigate("/app/my-customers", { state: { openAddCustomerForm: true } });
  };

  // <-- changed: send navigation state so sales page knows to open form
  const handleANewInvoice = () => {
    navigate("/app/sales", { state: { openSalesForm: true } });
  };

  return (
    <div className="flex gap-3">
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
      </div>

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
