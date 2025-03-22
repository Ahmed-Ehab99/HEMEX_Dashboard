"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Avatar, Box, Button, Modal, TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CloseIcon from "@mui/icons-material/Close";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import ProfileLoader from "./ProfileLoader";

interface ProfileData {
  image: string;
  name: string;
  birth_date: string;
}

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
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const handleOpen = () => {
    if (profileData) {
      setName(profileData.name || "");
      setBirthDate(
        profileData.birth_date ? new Date(profileData.birth_date) : null
      );
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
      setProfileData((prev) => (prev ? { ...prev, image: imageUrl } : null));
    }
  };

  const getStudent = async () => {
    setIsLoading(true);
    const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    if (!authToken) {
      console.error("No authToken found");
      return;
    }
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/accounts/students/6`;

      const { data } = await axios.get(url, {
        headers: { userKey: authToken },
      });

      setProfileData(data?.student);
    } catch (error) {
      console.error("Error fetching student:", error);
    } finally {
      setIsLoading(false);
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

      console.log("Profile updated successfully");
      await getStudent();
      handleClose();
    } catch (error) {
      console.error("Error updating student profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStudent();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getImagePath = (imagePath: string | null) => {
    if (!imagePath) return "/no_image.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}/${imagePath}`;
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
            className="w-24 h-24 rounded-full"
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
                    src={getImagePath(profileData?.image || null)}
                    sx={{ width: 100, height: 100 }}
                  />
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
        </div>
      )}
    </>
  );
};

export default StudentProfile;
