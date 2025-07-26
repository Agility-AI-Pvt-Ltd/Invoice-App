interface Props {
    imgUrl: string;
}

const ProfileAvatar: React.FC<Props> = ({ imgUrl }) => {
    return (
        <img
            src={imgUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border"
        />
    );
};

export default ProfileAvatar;
