import { Avatar } from 'antd';

const AvatarGroupCall = ({ avatars }) => {
  if (avatars.length < 2) return <Avatar>B</Avatar>;
  if (avatars.length === 2) {
    let size = 35;
    return (
      <div className="flex justify-center">
        <div className="relative w-[50px] h-[50px]">
          <Avatar
            size={size}
            src={avatars[0]}
            className="border-2 border-white left-4"
          />
          <Avatar
            size={size}
            src={avatars[1]}
            className="absolute top-4 left-0 z-0 border-2 border-white"
          />
        </div>
      </div>
    );
  }
  if (avatars.length === 3) {
    let size = 28;
    return (
      <div className="flex justify-center">
        <div className="relative w-[50px] h-[50px]">
          <Avatar
            size={size}
            src={avatars[0]}
            className="border-2 border-white left-3 z-5"
          />
          <Avatar
            size={size}
            src={avatars[1]}
            className="absolute top-5 left-0 border-2 border-white z-7"
          />
          <Avatar
            size={size}
            src={avatars[2]}
            className="absolute top-5 right-0 border-2 border-white z-0"
          />
        </div>
      </div>
    );
  }

  if (avatars.length === 4) {
    let size = 28;
    return (
      <div className="flex justify-center">
        <div className="relative w-[50px] h-[50px]">
          <Avatar
            size={size}
            src={avatars[0]}
            className="border-1 border-white z-5"
          />
          <Avatar
            size={size}
            src={avatars[1]}
            className="absolute top-5 left-0 border-1 border-white z-7"
          />
          <Avatar
            size={size}
            src={avatars[2]}
            className="absolute top-5 right-0 border-1 border-white z-10"
          />
          <Avatar
            size={size}
            src={avatars[3]}
            className="absolute top-0 right-0 border-1 border-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="relative w-[50px] h-[50px]">
        <Avatar
          size={28}
          src={avatars[0]}
          className="border-1 border-white z-5"
        />
        <Avatar
          size={28}
          src={avatars[1]}
          className="absolute top-5 left-0 border-1 border-white z-7"
        />
        <Avatar
          size={28}
          src={avatars[2]}
          className="absolute top-0 right-0 border-1 border-white"
        />
        <Avatar
          size={28}
          className="absolute top-5 right-0 border-1 border-white z-10 "
        >
          +{avatars.length - 3}
        </Avatar>
      </div>
    </div>
  );
};

export default AvatarGroupCall;
