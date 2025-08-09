type Props = {
    imgUrl: string;
    loading?: boolean;
    error?: string;
};

const ProfileAvatar = ({ imgUrl, loading = false, error = "" }: Props) => {
    if (loading) {
        return (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        );
    }

    if (error) {
        return (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xs text-red-500">
                !
            </div> 
        );
    }

    return (
        <img
            src={imgUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border"
            onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-avatar.png";
            }}
        />
    );
};

export default ProfileAvatar;
