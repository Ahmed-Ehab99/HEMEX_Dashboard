"use client";

import { SwapVerticalCircleOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, TableCell, TableRow } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { TableComponent } from "../Table";
import { useSessions } from "@/app/context/SessionsContext";
import Loader from "../Loader";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

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
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => window.open(assignment.assignment, "_blank")}
                  >
                    Download
                  </Button>
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
    </Box>
  );
}
