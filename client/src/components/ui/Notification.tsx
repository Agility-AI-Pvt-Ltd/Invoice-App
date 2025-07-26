const Notification = () => {
    return (
        <div className="relative p-2 rounded-full hover:bg-gray-100 cursor-pointer">
            <span role="img" aria-label="bell">🔔</span>
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </div>
    );
};

export default Notification;
