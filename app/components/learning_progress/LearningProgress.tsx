/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import Loader from "../Loader";
import CircularProgressBar from "./CircularProgressBar";
import Image from "next/image";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import CircleProgress from "./CircleProgress";
import LinearProgressBar from "./LinearProgressBar";
import axios from "axios";
import { useProfile } from "@/app/context/ProfileContext";
import { getImagePath } from "../StudentProfile";

interface StudentRound {
  id: number;
  name: string;
  day: string;
  time: string;
}

interface Student {
  name: string;
  points: number;
  rounds: StudentRound[];
}

interface Progress {
  progressPercentage: number;
  student: Student | null;
}

interface Track {
  id: number;
  course_name: string;
}

const LearningProgress = () => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [courses, setCourses] = useState<Track[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { profileData } = useProfile();

  const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;

  const getProgress = async () => {
    if (!authToken) {
      console.error("No authToken found");
      return;
    }

    setIsLoadingProgress(true);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/parents/student-track-progress`;

      const { data } = await axios.post(
        url,
        { student_id: 8, track_id: 31 },
        {
          headers: {
            userKey: authToken,
          },
        }
      );

      setProgress(data);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const getTracks = async () => {
    if (!authToken) {
      console.error("No authToken found");
      return;
    }

    setIsLoadingTracks(true);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/tracks/1`;

      const { data } = await axios.get(url, {
        headers: {
          userKey: authToken,
        },
      });

      setCourses(data.track.courses);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  useEffect(() => {
    getProgress();
    getTracks();
  }, []);

  if (isLoadingProgress || isLoadingTracks) {
    return <Loader />;
  }

  return (
    <div className="lg:mt-20 mt-10 flex flex-col items-center gap-20 w-full">
      <CircularProgressBar
        steps={courses?.map((course) => course.course_name) || []}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />

      <div className="w-full max-w-xl mx-auto">
        <p className="capitalize text-base font-medium">total progress</p>
        <LinearProgressBar progress={progress?.progressPercentage || 0} />
      </div>

      {progress?.student?.rounds?.length &&
        progress.student.rounds.map((round) => (
          <div
            key={round.id}
            className="border border-[#d2d2d2] w-full max-w-xl mx-auto py-5 px-10 rounded-2xl shadow-xl flex md:flex-row flex-col justify-between items-center md:gap-0 gap-10"
          >
            <div className="flex flex-col justify-center gap-5">
              <Image
                src={getImagePath(profileData?.image || null)}
                alt="Student Image"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />

              <div className="flex items-center justify-center gap-2">
                <Image src="/trophy.png" alt="Trophy" width={12} height={12} />
                <span className="text-xs font-normal">
                  {progress?.student?.points || 0} Points
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between items-center gap-4">
              <span className="text-xl font-medium">
                {profileData?.name || ""}
              </span>

              <span className="text-sm font-normal capitalize">
                {round.name}
              </span>

              <div className="flex gap-2 items-center">
                <ScheduleOutlinedIcon fontSize="small" />
                <span className="text-sm font-normal">
                  {round.day} {round.time}
                </span>
              </div>
            </div>

            <CircleProgress percentage={progress?.progressPercentage || 0} />
          </div>
        ))}
    </div>
  );
};

export default LearningProgress;
