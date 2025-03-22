import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 4,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 4,
    backgroundColor: "#2f006c",
  },
}));

const LinearProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="flex items-center gap-5">
      <BorderLinearProgress
        variant="determinate"
        value={progress}
        className="w-full"
      />
      <span className="font-bold text-base">{progress}%</span>
    </div>
  );
};

export default LinearProgressBar;
