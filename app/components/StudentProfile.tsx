"use client";

import { ReactElement, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Modal,
  Slide,
  Snackbar,
  TextField,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CloseIcon from "@mui/icons-material/Close";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import ProfileLoader from "./ProfileLoader";
import { useProfile } from "../context/ProfileContext";
import { TransitionProps } from "@mui/material/transitions";

export const getImagePath = (imagePath: string | null) => {
  if (!imagePath) return "/no_image.png";
  if (imagePath.startsWith("local:")) {
    return imagePath.substring(6); // Remove the "local:" prefix
  }
  if (imagePath.startsWith("http")) return imagePath;
  return `${process.env.NEXT_PUBLIC_API_URL}/${imagePath}`;
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  bgcolor: "background.paper",
  border: "2px solid #2f006c",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const StudentProfile = () => {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { profileData, isLoading, setIsLoading, refreshProfile } = useProfile();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  function SlideTransition(
    props: TransitionProps & { children: ReactElement }
  ) {
    return <Slide {...props} direction="left" />;
  }

  const handleOpen = () => {
    if (profileData) {
      setName(profileData.name || "");
      setBirthDate(
        profileData.birth_date ? new Date(profileData.birth_date) : null
      );
      setSelectedImage(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      // updateProfileImage(`local:${imageUrl}`);
      setSelectedImage(imageUrl);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    if (!authToken) {
      console.error("No authToken found");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      if (fileInputRef.current?.files && fileInputRef.current.files[0]) {
        formData.append("image", fileInputRef.current.files[0]);
      }
      formData.append("name", name || "");
      if (birthDate) {
        formData.append("birth_date", birthDate.toISOString());
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/student/6`,
        formData,
        {
          headers: { userKey: authToken },
        }
      );

      setSnackbarMessage("Profile updated successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      await refreshProfile();
      setSelectedImage(null);
      handleClose();
    } catch (error) {
      console.error("Error updating student profile:", error);
      setSnackbarMessage("Failed to update profile.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      {isLoading ? (
        <ProfileLoader />
      ) : (
        <div className="flex items-center md:justify-normal justify-center md:gap-5 gap-3">
          <Image
            src={getImagePath(profileData?.image || null)}
            alt="Profile"
            width={100}
            height={100}
            className="w-24 h-24 rounded-full object-cover"
          />

          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">{profileData?.name}</h2>
            <p className="text-sm text-gray-500">
              {formatDate(profileData?.birth_date || "")}
            </p>
          </div>

          <Button
            onClick={handleOpen}
            className="!ml-3 hover:bg-transparent"
            color="secondary"
          >
            <ModeEditOutlinedIcon fontSize="large" className="text-[#2f006c]" />
          </Button>

          <Modal open={open} onClose={handleClose}>
            <Box sx={{ ...style, maxWidth: "400px" }}>
              <div className="flex flex-col items-center gap-5">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <div
                  className="cursor-pointer relative group"
                  onClick={handleImageClick}
                >
                  <Avatar
                    alt="Student Image"
                    src={
                      selectedImage || getImagePath(profileData?.image || null)
                    }
                    sx={{ width: 100, height: 100 }}
                  />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out text-center text-[#2f006c]">
                    Change Image
                  </span>
                </div>

                <TextField
                  fullWidth
                  label="Student Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="outlined"
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Birth Date"
                    value={birthDate}
                    onChange={(date) => setBirthDate(date)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>

                <Button
                  variant="contained"
                  onClick={handleSave}
                  fullWidth
                  sx={{
                    backgroundColor: "#2f006c",
                    "&:hover": { backgroundColor: "#24004f" },
                    mt: 2,
                  }}
                >
                  Save Changes
                </Button>
              </div>
              <button onClick={handleClose} className="absolute top-3 right-3">
                <CloseIcon />
              </button>
            </Box>
          </Modal>

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
        </div>
      )}
    </>
  );
};

export default StudentProfile;
