/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import axios from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AssignmentAttachment {
  id: number;
  file_path: string;
}

interface Instructor {
  id: number;
  name: string;
}

interface Meeting {
  meeting_link: string | null;
  recording_url: string | null;
  recording_download_url: string | null;
  invitation_link: string | null;
}

interface Session {
  id: number;
  name: string;
  status: string;
  date: string;
  time: string;
  challenge: string | null;
  feedback: string | null;
  instructor: Instructor;
  meeting: Meeting;
  assignment_attachment: AssignmentAttachment[];
}

interface Level {
  level_id: number;
  course_name: string;
  level_name: string;
  sessions: Session[];
}

interface SessionsContextType {
  sessions: Level[] | null;
  isLoading: boolean;
  error: Error | null;
}

const SessionsContext = createContext<SessionsContextType | undefined>(
  undefined
);

// Provider component
export const SessionsProvider: React.FC<{
  children: ReactNode;
  studentId: number;
  trackId: number;
}> = ({ children, studentId, trackId }) => {
  const [sessions, setSessions] = useState<Level[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    if (!authToken) {
      const tokenError = new Error("No authToken found");
      setError(tokenError);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/students/sessions?roundStatus=running`,
        { student_id: studentId, track_id: trackId },
        {
          headers: {
            "Content-Type": "application/json",
            userKey: authToken,
          },
        }
      );

      setSessions(data?.data?.levels || null);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [studentId, trackId]);

  return (
    <SessionsContext.Provider
      value={{ sessions, isLoading, error }}
    >
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionsContext);

  if (context === undefined) {
    throw new Error("useSessions must be used within a SessionsProvider");
  }

  return context;
};
