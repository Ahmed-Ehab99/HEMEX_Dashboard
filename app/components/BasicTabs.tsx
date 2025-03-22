"use client";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import SessionEvents from "./session/SessionEvents";
import Certificates from "./certificates/Certificates";
import RecordsTable from "./records/RecordsTable";
import AssignmentTable from "./assignments/AssignmentsTable";
import LearningProgress from "./learning_progress/LearningProgress";
import { useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tabs */}
      <div className="bg-[#e3e3e3]">
        <div className="max-w-screen-xl mx-auto xl:px-0 lg:px-10 px-5">
          <Box sx={{ backgroundColor: "#e3e3e3" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                "& .MuiTab-root": {
                  color: "#a4a4a4",
                  "&.Mui-selected": {
                    color: "#2f006c",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#2f006c",
                },
              }}
            >
              <Tab
                className="!text-base"
                label="Learning Progress"
                {...a11yProps(0)}
                sx={{ paddingLeft: "0px" }}
              />
              <Tab className="!text-base" label="Sessions" {...a11yProps(1)} />
              <Tab
                className="!text-base"
                label="Assignments"
                {...a11yProps(2)}
              />
              <Tab
                className="!text-base"
                label="Certificates"
                {...a11yProps(3)}
              />
              <Tab className="!text-base" label="Records" {...a11yProps(4)} />
            </Tabs>
          </Box>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="max-w-screen-xl mx-auto py-10 xl:px-0 lg:px-10 px-5">
        {/* Learning Progress Tab */}
        <CustomTabPanel value={value} index={0}>
          <LearningProgress />
        </CustomTabPanel>
        {/* Session Tab */}
        <CustomTabPanel value={value} index={1}>
          <SessionEvents />
        </CustomTabPanel>
        {/* Assignments Tab */}
        <CustomTabPanel value={value} index={2}>
          <AssignmentTable />
        </CustomTabPanel>
        {/* Certificates Tab */}
        <CustomTabPanel value={value} index={3}>
          <Certificates />
        </CustomTabPanel>
        {/* Records Tab */}
        <CustomTabPanel value={value} index={4}>
          <RecordsTable />
        </CustomTabPanel>
      </div>
    </Box>
  );
}
