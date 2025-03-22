import Skeleton from "@mui/material/Skeleton";

const ProfileLoader = () => {
  return (
    <div className="flex items-center md:justify-normal justify-center md:gap-5 gap-3">
      <Skeleton
        variant="circular"
        width={100}
        height={100}
        className="w-24 h-24"
      />
      <Skeleton variant="rounded" width={210} height={60} />
    </div>
  );
};

export default ProfileLoader;
