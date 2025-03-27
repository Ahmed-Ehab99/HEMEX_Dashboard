"use client";

import { SwapVerticalCircleOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Slide,
  Snackbar,
  styled,
  TableCell,
  TableRow,
} from "@mui/material";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { TableComponent } from "../Table";
import { useSessions } from "@/app/context/SessionsContext";
import Loader from "../Loader";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import { TransitionProps } from "@mui/material/transitions";

interface Assignment {
  id: string;
  course_name: string;
  level_name: string;
  session_date: string;
  challenge: string | null;
  assignment: string;
  feedback: string | null;
}

export default function AssignmentTable() {
  const { sessions, isLoading } = useSessions();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const [downloadError, setDownloadError] = useState<Record<string, string>>(
    {}
  );
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    field: keyof Assignment;
    direction: "asc" | "desc";
  }>({ field: "course_name", direction: "asc" });

  // Filtering state
  const [filters, setFilters] = useState({
    course_name: [] as string[],
    level_name: [] as string[],
  });

  useEffect(() => {
    if (sessions) {
      const convertedAssignments = sessions.flatMap((level) =>
        level.sessions.map((session) => ({
          id: session.id.toString(),
          course_name: level.course_name,
          level_name: level.level_name,
          session_date: session.date,
          challenge: session.challenge || null,
          assignment: session.assignment_attachment.length
            ? session.assignment_attachment[0].file_path
            : "",
          feedback: session.feedback || null,
        }))
      );
      setAssignments(convertedAssignments);
    }
  }, [sessions]);

  // Sorting handler
  const handleSort = (field: keyof Assignment) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sort assignments based on sortConfig
  const sortedAssignments = useMemo(() => {
    if (!assignments) return [];

    return [...assignments].sort((a, b) => {
      const field = sortConfig?.field || "course_name";
      const direction = sortConfig?.direction || "asc";

      const aValue =
        field === "session_date"
          ? new Date(a[field] || "").getTime() || 0
          : (a[field] || "").toString().toLowerCase();

      const bValue =
        field === "session_date"
          ? new Date(b[field] || "").getTime() || 0
          : (b[field] || "").toString().toLowerCase();

      return direction === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });
  }, [assignments, sortConfig]);

  // Apply filters to assignmentsData
  const filteredAssignments = useMemo(() => {
    return sortedAssignments.filter((assignment) => {
      const courseMatch =
        filters.course_name.length === 0 ||
        filters.course_name.includes(assignment.course_name);
      const levelMatch =
        filters.level_name.length === 0 ||
        filters.level_name.includes(assignment.level_name);

      return courseMatch && levelMatch;
    });
  }, [sortedAssignments, filters]);

  // Filtering handler
  const handleFilterChange = (key: keyof typeof filters, value: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Table columns with sorting buttons
  const tableColumns = {
    tableHead: [
      {
        key: "course_name",
        label: "Course Name",
        button: renderSortButton("course_name"),
      },
      {
        key: "level_name",
        label: "Level Name",
        button: renderSortButton("level_name"),
      },
      {
        key: "session_date",
        label: "Session Date",
        button: renderSortButton("session_date"),
      },
      { key: "challenge", label: "Challenge" },
      { key: "assignment", label: "Assignment" },
      { key: "feedback", label: "Feedback" },
    ],
  };

  function renderSortButton(field: keyof Assignment) {
    return (
      <IconButton
        size="small"
        onClick={() => handleSort(field)}
        color={sortConfig.field === field ? "secondary" : "default"}
      >
        <SwapVerticalCircleOutlined />
      </IconButton>
    );
  }

  // Filters for the table
  const filtersSelect = [
    {
      label: "Course Name",
      options: Array.from(
        new Set(assignments.map((assignment) => assignment.course_name))
      ),
      selectedValues: filters.course_name,
      onChange: (value: string[]) => handleFilterChange("course_name", value),
    },
    {
      label: "Lesson Name",
      options: Array.from(
        new Set(assignments.map((assignment) => assignment.level_name))
      ),
      selectedValues: filters.level_name,
      onChange: (value: string[]) => handleFilterChange("level_name", value),
    },
  ];

  // Download assignment
  const handleDownload = async (filePath: string, assignmentId: string) => {
    if (!filePath) return;

    // Set downloading state
    setDownloading((prev) => ({ ...prev, [assignmentId]: true }));
    // Clear any previous errors
    setDownloadError((prev) => ({ ...prev, [assignmentId]: "" }));

    try {
      // Use the correct API route path
      const proxyUrl = `/api/download?path=${encodeURIComponent(filePath)}`;

      console.log(`Initiating download via proxy: ${proxyUrl}`);

      // Use fetch to download through the proxy
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to download: ${response.status} ${response.statusText}`
        );
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Get filename from path
      const filename = filePath.split("/").pop() || "assignment";

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(blobUrl);

      setSnackbarMessage("File downloaded successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error downloading file:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download file";
      setDownloadError((prev) => ({ ...prev, [assignmentId]: errorMessage }));

      setSnackbarMessage("Failed to download file.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      // Clear downloading state
      setDownloading((prev) => ({ ...prev, [assignmentId]: false }));
    }
  };

  // Upload assignment
  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    assignmentId: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const studentId = 8;

    // Set uploading state
    setUploading((prev) => ({ ...prev, [assignmentId]: true }));
    // Clear any previous errors
    setUploadError((prev) => ({ ...prev, [assignmentId]: "" }));

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("student_id", studentId.toString());
      formData.append("session_id", assignmentId); // Using assignmentId as session_id
      formData.append("assignment", file); // Append the file directly

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/students/upload-assignment`,
        formData,
        {
          headers: {
            userKey: process.env.NEXT_PUBLIC_AUTH_TOKEN,
          },
        }
      );

      const result = response.data;

      if (result.status === "success") {
        const newFilePath = result.data.attachment.file_path;

        setAssignments((prevAssignments) =>
          prevAssignments.map((assignment) =>
            assignment.id === assignmentId
              ? { ...assignment, assignment: newFilePath }
              : assignment
          )
        );
        setSnackbarMessage("File uploaded successfully!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage("Failed to upload file.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true); // Show error toast
      }
    } catch (error: unknown) {
      console.error("Error uploading file:", error);
      setSnackbarMessage("Failed to upload file.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setUploading((prev) => ({ ...prev, [assignmentId]: false }));
      // Clear the file input
      event.target.value = "";
    }
  };

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  function SlideTransition(
    props: TransitionProps & { children: ReactElement }
  ) {
    return <Slide {...props} direction="left" />;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        p: 3,
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >
      <TableComponent
        filters={filtersSelect}
        tableColumns={tableColumns}
        pagination={{
          rowsPerPage,
          page,
          setPage,
          setRowsPerPage,
          count: filteredAssignments.length,
        }}
      >
        {filteredAssignments
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((assignment) => (
            <TableRow key={assignment.id} hover>
              <TableCell>{assignment.course_name}</TableCell>
              <TableCell>{assignment.level_name}</TableCell>
              <TableCell>
                {new Date(assignment.session_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {assignment.challenge ? assignment.challenge : "No Challenge"}
              </TableCell>
              <TableCell>
                {assignment.assignment ? (
                  <div className="flex gap-3">
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{
                        borderRadius: "100%",
                        padding: "5px",
                        minWidth: "0px",
                      }}
                      onClick={() =>
                        handleDownload(assignment.assignment, assignment.id)
                      }
                      disabled={downloading[assignment.id]}
                    >
                      {downloading[assignment.id] ? (
                        <CircularProgress color="secondary" size={24} />
                      ) : (
                        <FileDownloadIcon />
                      )}
                    </Button>
                    {downloadError[assignment.id] && (
                      <div className="text-red-500 text-sm">
                        {downloadError[assignment.id]}
                      </div>
                    )}
                    <Button
                      component="label"
                      color="secondary"
                      sx={{
                        borderRadius: "100%",
                        padding: "5px",
                        minWidth: "0px",
                      }}
                      variant="outlined"
                      disabled={uploading[assignment.id]}
                    >
                      {uploading[assignment.id] ? (
                        <CircularProgress color="secondary" size={24} />
                      ) : (
                        <CloudUploadIcon />
                      )}
                      <VisuallyHiddenInput
                        type="file"
                        onChange={(event) => handleUpload(event, assignment.id)}
                        multiple={false}
                      />
                    </Button>
                    {uploadError[assignment.id] && (
                      <div className="text-red-500 text-sm">
                        {uploadError[assignment.id]}
                      </div>
                    )}
                  </div>
                ) : (
                  "No Assignment"
                )}
              </TableCell>
              <TableCell>
                {assignment.feedback ? assignment.feedback : "No Feedback"}
              </TableCell>
            </TableRow>
          ))}
      </TableComponent>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        slots={{ transition: SlideTransition }}
      >
        <Alert
          severity={snackbarSeverity}
          variant="filled"
          onClose={() => setOpenSnackbar(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
