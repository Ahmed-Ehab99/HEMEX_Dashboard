import React, { JSX } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Paper,
  TablePagination,
} from "@mui/material";
import { TableFilters } from "./TablesFilters";

type Props = {
  filters?: {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (value: string[]) => void;
  }[];
  tableColumns: {
    tableHead: {
      key: string;
      label: string;
      button?: JSX.Element;
      render?: () => JSX.Element;
    }[];
  };
  children: React.ReactNode;
  pagination?: {
    rowsPerPage: number;
    page: number;
    setPage: (value: number) => void;
    setRowsPerPage: (value: number) => void;
    count: number;
  };
};

export const TableComponent = ({
  filters,
  children,
  tableColumns,
  pagination,
}: Props) => {
  const { rowsPerPage, page, setPage, setRowsPerPage, count } =
    pagination || {};

  const handleChangePage = (event: unknown, newPage: number) => {
    if (setPage) {
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (setRowsPerPage) {
      setRowsPerPage(parseInt(event.target.value, 10));
    }
    if (setPage) {
      setPage(0);
    }
  };

  return (
    <>
      {filters && (
        <Box mb={3} display="flex" gap={2} sx={{borderColor: "red"}}>
          {filters.map((filter, index) => (
            <TableFilters
              key={index}
              label={filter.label}
              options={filter.options}
              selectedValues={filter.selectedValues}
              onChange={filter.onChange}
            />
          ))}
        </Box>
      )}

      <TableContainer
        component={Paper}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          boxShadow: "none",
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              {tableColumns.tableHead.map((column, index) => (
                <TableCell key={index} sx={{ fontWeight: "bold" }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {column.render && column.render()}
                    {column.label}
                    {column.button && column.button}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ bgcolor: "background.default" }}>
            {children}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={count || 0}
          rowsPerPage={rowsPerPage || 10}
          page={page || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ mt: 2 }}
        />
      )}
    </>
  );
};
