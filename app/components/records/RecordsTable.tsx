"use client";

import { SwapVerticalCircleOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, TableCell, TableRow } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { TableComponent } from "../Table";
import { useSessions } from "@/app/context/SessionsContext";
import Loader from "../Loader";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

interface Record {
  id: string;
  course_name: string;
  level_name: string;
  session_date: string;
  recording_link: string;
}

export default function RecordTable() {
  const { sessions, isLoading } = useSessions();
  const [records, setRecords] = useState<Record[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    field: keyof Record;
    direction: "asc" | "desc";
  }>({ field: "course_name", direction: "asc" });

  // Filtering state
  const [filters, setFilters] = useState({
    course_name: [] as string[],
    level_name: [] as string[],
  });

  useEffect(() => {
    if (sessions) {
      const convertedRecords = sessions.flatMap((level) =>
        level.sessions.map((session) => ({
          id: session.id.toString(),
          course_name: level.course_name,
          level_name: level.level_name,
          session_date: session.date,
          recording_link: session.meeting.recording_download_url || "",
        }))
      );
      setRecords(convertedRecords);
    }
  }, [sessions]);

  // Sorting handler
  const handleSort = (field: keyof Record) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sort records based on sortConfig
  const sortedRecords = useMemo(() => {
    if (!records) return [];

    return [...records].sort((a, b) => {
      const field = sortConfig?.field || "course_name";
      const direction = sortConfig?.direction || "asc";

      const aValue =
        field === "session_date"
          ? new Date(a[field]).getTime() || 0
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
  }, [records, sortConfig]);

  // Apply filters to recordsData
  const filteredRecords = useMemo(() => {
    return sortedRecords.filter((record) => {
      const courseMatch =
        filters.course_name.length === 0 ||
        filters.course_name.includes(record.course_name);
      const levelMatch =
        filters.level_name.length === 0 ||
        filters.level_name.includes(record.level_name);

      return courseMatch && levelMatch;
    });
  }, [sortedRecords, filters]);

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
        label: "Lesson Name",
        button: renderSortButton("level_name"),
      },
      {
        key: "session_date",
        label: "Session Date",
        button: renderSortButton("session_date"),
      },
      { key: "recording_link", label: "Recording Link" },
    ],
  };

  function renderSortButton(field: keyof Record) {
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
      options: Array.from(new Set(records.map((record) => record.course_name))),
      selectedValues: filters.course_name,
      onChange: (value: string[]) => handleFilterChange("course_name", value),
    },
    {
      label: "Lesson Name",
      options: Array.from(new Set(records.map((record) => record.level_name))),
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
          count: filteredRecords.length,
        }}
      >
        {filteredRecords
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((record) => (
            <TableRow key={record.id} hover>
              <TableCell>{record.course_name}</TableCell>
              <TableCell>{record.level_name}</TableCell>
              <TableCell>
                {new Date(record.session_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {record.recording_link ? (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => window.open(record.recording_link, "_blank")}
                  >
                    Download
                  </Button>
                ) : (
                  "No Records"
                )}
              </TableCell>
            </TableRow>
          ))}
      </TableComponent>
    </Box>
  );
}
