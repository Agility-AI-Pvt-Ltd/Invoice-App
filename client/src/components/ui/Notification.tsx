import { IconNotification } from "@tabler/icons-react";
import { Button } from "./button";
import { useNavigate } from "react-router-dom";

const Notification = () => {
    const navigate = useNavigate()
    return (
        <Button className="relative p-2 rounded-full hover:bg-gray-100 cursor-pointer bg-white" onClick={() => navigate("/app/dashboard")}>
            {/* <span role="img" aria-label="bell">🔔</span>
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" /> */}
            <IconNotification className="text-black h-6 w-6"></IconNotification>
        </Button>
    );
};

export default Notification;
