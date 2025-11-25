// components/PersonalDetails.js
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTimes, FaSave, FaArrowLeft, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import GetUser from "../../backend/authentication/getuser";
import RegisterUser from "../../backend/authentication/register";
import Colors from "../../core/constant";

const PersonalDetails = () => {
  const navigate = useNavigate();
  const number = localStorage.getItem("userPhone") || "";
  const [userDetails, setUserDetails] = useState({});
  const [editedDetails, setEditedDetails] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [base64Image, setBase64Image] = useState(null);
  const [preview, setPreview] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const fields = [
    {
      label: "Name",
      key: "Fullname",
      type: "text",
      editable: true,
      required: true,
    },
    { label: "Mobile No.", key: "PhoneNumber", type: "text", editable: false },
    { label: "Email Id", key: "Email", type: "email", editable: true },
    { label: "Gender", key: "Gender", type: "select", editable: true },
    { label: "Date of Birth", key: "DOB", type: "date", editable: true },
  ];

  /* ───── FETCH USER DATA ───── */
  useEffect(() => {
    const fetchUser = async () => {
      if (!number) return;
      try {
        const userData = await GetUser(number);
        if (userData && userData.length > 0) {
          const user = userData[0];
          setUserDetails(user);
          setEditedDetails(user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [number]);

  /* ───── DETECT MOBILE ───── */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ───── EDIT HANDLERS ───── */
  const handleEditClick = () => {
    setEditedDetails(userDetails);
    setIsEditing(true);
  };

  const handleInputChange = (key, value) => {
    setEditedDetails((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const required = fields.filter((f) => f.required);
    const empty = required.filter((f) => !editedDetails[f.key]?.trim());
    if (empty.length > 0) {
      alert(
        `Please fill all required fields: ${empty
          .map((e) => e.label)
          .join(", ")}`
      );
      return;
    }

    try { 
      const res = await RegisterUser(
        "",
        "Edit Profile",
        editedDetails.Fullname,
        number,
        editedDetails.Email || "",
        editedDetails.Gender || "",
        editedDetails.DOB || ""
      );

      if (res) {
        alert("User details updated successfully!");
        setUserDetails(editedDetails);
        setIsEditing(false);
      } else {
        alert("Failed to update. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  const handleCancel = () => {
    setEditedDetails(userDetails);
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatar(file);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.replace(
        /^data:image\/[a-zA-Z]+;base64,/,
        ""
      );
      setBase64Image(base64);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!base64Image) {
      alert("Please select an image.");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 10));
    }, 200);

    try {
      const res = await RegisterUser(
        base64Image,
        "Edit Profile Image",
        "",
        number,
        "",
        "",
        ""
      );

      if (res) {
        setProgress(100);
        setTimeout(() => {
          setUserDetails((prev) => ({ ...prev, Image: base64Image }));
          alert("Profile image updated!");
          handleCancelUpload();
          // Optional: remove reload if you want SPA behavior
          window.location.reload();
        }, 500);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setAvatar(null);
    setBase64Image(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const profileImageUrl = userDetails.Image
    ? `https://ecommerce.anklegaming.live//Images/${userDetails.Image}`
    : "https://via.placeholder.com/150?text=Avatar";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ───── MAIN CONTENT ───── */}
      <main className="pt-6 px-1 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg md:p-8 p-6"
        >
          {!isEditing ? (
            /* ───── VIEW MODE ───── */
            <>
              <div className="flex flex-row sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                <h3
                  className={`text-l md:text-2xl font-semibold ${Colors.textGrayDark}`}
                >
                  Personal Details
                </h3>
                <button
                  onClick={handleEditClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} text-white hover:opacity-90 transition shadow-md`}
                >
                  <FaEdit /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="md:hidden p-6 text-center">
                  <div className="relative inline-block">
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-orange-400 shadow-md"
                    />
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition"
                    >
                      <FaCamera size={16} />
                    </button>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-800">
                    {userDetails.Fullname || "User"}
                  </h3>
                </div>

                {fields.map((item) => (
                  <div
                    key={item.key}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition"
                  >
                    <p
                      className={`text-xs font-semibold ${Colors.textGray} uppercase tracking-wider`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`mt-1 text-base font-medium ${Colors.textGrayDark}`}
                    >
                      {item.key === "PhoneNumber"
                        ? `+91 ${number}`
                        : userDetails[item.key] || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* ───── EDIT MODE ───── */
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                <h3
                  className={`text-xl md:text-2xl font-semibold ${Colors.textGrayDark}`}
                >
                  Edit Personal Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {fields.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <label
                      className={`block text-sm font-semibold ${Colors.textGray} uppercase tracking-wider`}
                    >
                      {item.label}{" "}
                      {item.required && <span className="text-red-500">*</span>}
                    </label>

                    {item.editable === false ? (
                      <div className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-300">
                        +91 {number}
                      </div>
                    ) : item.type === "select" ? (
                      <select
                        value={editedDetails[item.key] || ""}
                        onChange={(e) =>
                          handleInputChange(item.key, e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm text-base"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <input
                        type={item.type}
                        value={editedDetails[item.key] || ""}
                        onChange={(e) =>
                          handleInputChange(item.key, e.target.value)
                        }
                        placeholder={item.label}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm text-base"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSave}
                  className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} text-white hover:opacity-90 transition shadow-lg`}
                >
                  <FaSave /> Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </>
          )}
        </motion.div>
      </main>

      {/* ───── UPLOAD MODAL ───── */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.95 },
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Upload Picture
                </h2>
                <button
                  onClick={handleCancelUpload}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
                  <img
                    src={
                      preview ||
                      (base64Image
                        ? `data:image/jpeg;base64,${base64Image}`
                        : "https://via.placeholder.com/160?text=Preview")
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} text-white hover:opacity-90 transition`}
                  >
                    Gallery
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-3 px-4 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    Camera
                  </button>
                </div>

                {base64Image && (
                  <div className="w-full space-y-3">
                    <button
                      onClick={handleSaveImage}
                      disabled={isUploading}
                      className={`w-full py-3 px-6 rounded-lg font-medium text-white transition ${
                        isUploading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {isUploading ? "Uploading..." : "Save Avatar"}
                    </button>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-green-600"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="text-center text-sm text-gray-600">
                          {progress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalDetails;
