"use client";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import Loader from "../Loader";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { useSessions } from "@/app/context/SessionsContext";

interface Data {
  level_id: number;
  course_name: string;
  level_name: string;
  sessions: Session[];
}

interface Session {
  id: number;
  name: string;
  status: string;
  date: string;
  time: string;
  instructor: Instructor;
  meeting: Meeting;
}

interface Instructor {
  name: string;
}

interface Meeting {
  meeting_link: string | null;
  recording_url: string | null;
  recording_download_url: string | null;
}

const SessionEvents = () => {
  const { sessions, isLoading } = useSessions();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-5">
          {sessions?.map((data: Data) => (
            <div key={data?.level_id}>
              <div className="py-4">
                <span className="text-xl capitalize flex items-center justify-center font-semibold mb-6">
                  {data?.course_name} {data?.level_name}
                </span>

                <div className="flex flex-col gap-5">
                  {data?.sessions?.map((session: Session) => (
                    <div key={session?.id} className="flex flex-col gap-3">
                      <div className="flex justify-between items-center gap-6">
                        <span className="font-medium md:w-2/3 w-1/2">
                          {session?.name}
                        </span>

                        {session?.status !== "not taken" ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <span>{session?.status}</span>
                            <EventAvailableOutlinedIcon fontSize="small" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <span>{session?.status}</span>
                            <EventBusyOutlinedIcon fontSize="small" />
                          </div>
                        )}
                      </div>

                      <div className="border-2 border-gray-200 rounded-2xl shadow-lg flex md:flex-row flex-col md:gap-0 gap-8 justify-between items-center px-4 py-3">
                        <div className="flex flex-col gap-3">
                          <span className="text-sm">
                            Instructor {session?.instructor?.name}
                          </span>

                          <div className="flex gap-4">
                            <span className="text-sm">
                              Session {session.id}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarMonthOutlinedIcon fontSize="small" />
                              <span className="text-sm">
                                {formatDate(session?.date)}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <ScheduleOutlinedIcon fontSize="small" />
                            <span>{session?.time}</span>
                          </div>
                        </div>

                        {/* not taken => join session */}
                        {/* taken => watch record */}
                        <a
                          href={session?.meeting?.meeting_link || ""}
                          className={`${
                            session?.status !== "not taken"
                              ? "opacity-50 cursor-not-allowed"
                              : "opacity-100 cursor-pointer"
                          } bg-purple-950 text-white px-8 py-[0.35rem] rounded-xl`}
                        >
                          Join session
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <hr className="border-gray-500 rounded-full lg:hidden block" />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SessionEvents;
