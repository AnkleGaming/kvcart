// src/components/user/UserProfile.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaMinus,
  FaCamera,
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaInfoCircle,
  FaFileAlt,
  FaShieldAlt,
  FaCircle,
} from "react-icons/fa";
import { IoIosWallet } from "react-icons/io";
import { IoMdLogOut } from "react-icons/io";
import AddressDetails from "./addressDetailsh.jsx";
import PersonalDetails from "./personalDetailsh.jsx";
import ReferAndEarn from "./refer&earn.jsx";
import GetUser from "../../backend/authentication/getuser.js";
import TermsPage from "./terms&condition.jsx";
import AboutUs from "./aboutus.jsx";
import PrivacyAndPolicy from "./privacy&policy.jsx";
import EnterReferCode from "./enterrefercode.jsx";
import { useNavigate } from "react-router-dom";
import LoginCard from "./loginCard.jsx";
import OtpVerification from "./otpverification.jsx";
import RegisterUser from "../../backend/authentication/register.js";
import MyOrder from "../ui/myorders.jsx";
import Colors from "../../core/constant.js";
import Wallet from "../ui/transactions.jsx";

// Custom hooks
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: undefined });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth });
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};

const useFocusTrap = (isOpen, ref) => {
  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const modalElement = ref.current;
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    modalElement.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();
    return () => modalElement.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, ref]);
};

const UserProfile = () => {
  const phone = localStorage.getItem("userPhone");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 640;

  const [activeSection, setActiveSection] = useState(1);
  const [avatar, setAvatar] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [user, setUser] = useState([]);
  const [preview, setPreview] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pendingPhone, setPendingPhone] = useState("");
  const [addressRefreshKey, setAddressRefreshKey] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const loginModalRef = useRef(null);
  const otpModalRef = useRef(null);
  const uploadModalRef = useRef(null);

  useFocusTrap(showLoginModal, loginModalRef);
  useFocusTrap(showOtpModal, otpModalRef);
  useFocusTrap(showUploadModal, uploadModalRef);

  // Prevent scroll
  useEffect(() => {
    if (showLoginModal || showOtpModal || showUploadModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [showLoginModal, showOtpModal, showUploadModal]);

  // Fetch user
  useEffect(() => {
    if (!isLoggedIn || !phone) return;
    const fetchUser = async () => {
      try {
        const fetchedUser = await GetUser(phone);
        setUser(fetchedUser || []);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [phone, isLoggedIn]);

  const refreshAddresses = () => {
    setAddressRefreshKey((prev) => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem("userPhone");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  const handleLoginClick = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowLoginModal(true);
    }, 500);
  };

  const handleLoginSubmit = (phoneNumber) => {
    setIsProcessing(true);
    setTimeout(() => {
      setPendingPhone(phoneNumber);
      setShowLoginModal(false);
      setShowOtpModal(true);
      setIsProcessing(false);
    }, 500);
  };

  const handleOtpSuccess = (verifiedPhone) => {
    localStorage.setItem("userPhone", verifiedPhone);
    localStorage.setItem("isLoggedIn", "true");
    setShowOtpModal(false);
    window.location.reload();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setBase64Image(
          reader.result.replace(/^data:image\/[a-zA-Z]+;base64,/, "")
        );
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!base64Image) return alert("Please select an image.");

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
        phone,
        "",
        "",
        ""
      );
      if (res) {
        setProgress(100);
        setTimeout(() => {
          setUser((prev) =>
            prev.map((u, i) => (i === 0 ? { ...u, Image: base64Image } : u))
          );
          alert("Profile image updated!");
          handleCancelUpload();
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      alert("Upload failed.");
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

  const sections = [
    { id: 1, title: "Personal Details", Component: <PersonalDetails /> },
    {
      id: 2,
      title: "Saved Addresses",
      Component: (
        <AddressDetails key={addressRefreshKey} onRefresh={refreshAddresses} />
      ),
    },

    { id: 3, title: "My Orders", Component: <MyOrder /> },
    { id: 4, title: "Wallet Transactions", Component: <Wallet /> },
    { id: 5, title: "Terms & Conditions", Component: <TermsPage /> },
    { id: 6, title: "Privacy Policy", Component: <PrivacyAndPolicy /> },
    { id: 7, title: "About Us", Component: <AboutUs /> },
  ];

  const getIcon = (title, size = 18) => {
    const props = { size };
    switch (title) {
      case "Personal Details":
        return <FaUser {...props} />;
      case "Saved Addresses":
        return <FaMapMarkerAlt {...props} />;
      case "Wallet Transactions":
        return <IoIosWallet {...props} />;
      case "My Orders":
        return <FaShoppingBag {...props} />;
      case "About Us":
        return <FaInfoCircle {...props} />;
      case "Terms & Conditions":
        return <FaFileAlt {...props} />;
      case "Privacy Policy":
        return <FaShieldAlt {...props} />;
      default:
        return <FaCircle {...props} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${Colors.bgGray} px-4`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <h2
            className={`text-2xl sm:text-3xl font-bold ${Colors.textGrayDark} mb-4`}
          >
            You’re not logged in
          </h2>
          <p className={`text-sm sm:text-base ${Colors.textMuted} mb-8`}>
            Log in to access your profile.
          </p>
          <button
            onClick={handleLoginClick}
            disabled={isProcessing}
            className={`px-8 py-3 text-lg font-semibold bg-gradient-to-r ${
              Colors.primaryFrom
            } ${Colors.primaryTo} ${
              Colors.textWhite
            } rounded-xl shadow-lg hover:shadow-xl transition-all ${
              isProcessing ? "opacity-50" : ""
            }`}
          >
            {isProcessing ? "Processing..." : "Get Started"}
          </button>
        </motion.div>

        <AnimatePresence>
          {showLoginModal && (
            <Modal isMobile={isMobile} onClose={() => setShowLoginModal(false)}>
              <LoginCard
                onClose={() => setShowLoginModal(false)}
                onSubmit={handleLoginSubmit}
              />
            </Modal>
          )}
          {showOtpModal && (
            <Modal isMobile={isMobile} onClose={() => setShowOtpModal(false)}>
              <OtpVerification
                phone={pendingPhone}
                onSuccess={handleOtpSuccess}
                onClose={() => setShowOtpModal(false)}
              />
            </Modal>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className={`mt-[70px] min-h-screen ${Colors.bgGray} flex flex-col md:flex-row`}
    >
      {/* ===== SIDEBAR (Desktop) ===== */}
      <div className="hidden md:block w-64 bg-white shadow-lg h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2
            className={`text-2xl font-bold bg-gradient-to-r ${Colors.gradientFrom} ${Colors.gradientTo} bg-clip-text text-transparent`}
          >
            My Profile
          </h2>
        </div>

        <div className="p-6 text-center">
          <div className="relative inline-block">
            <img
              src={
                user[0]?.Image
                  ? `https://ecommerce.anklegaming.live//Images/${user[0].Image}`
                  : "https://via.placeholder.com/150?text=Avatar"
              }
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-orange-400 shadow-md"
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600"
            >
              <FaCamera size={14} />
            </button>
          </div>
          <h3 className="mt-3 font-semibold text-gray-800">
            {user[0]?.Fullname || "User"}
          </h3>
        </div>

        <nav className="px-4 pb-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all flex items-center gap-3 ${
                activeSection === section.id
                  ? `bg-gradient-to-r ${Colors.gradientFrom} ${Colors.gradientTo} text-white shadow-md`
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {getIcon(section.title)}
              <span className="font-medium">{section.title}</span>
            </button>
          ))}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full text-left px-4 py-3 rounded-lg mt-6 bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center gap-3"
          >
            <IoMdLogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 p-1 md:p-8 lg:p-12">
        <div className="max-w-8xl mx-auto">
          <AnimatePresence mode="wait">
            {sections.map(
              (section) =>
                activeSection === section.id && (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl p-3 md:p-8"
                  >
                    <h3
                      className={`text-xl md:text-2xl font-bold mb-6 bg-gradient-to-r ${Colors.gradientFrom} ${Colors.gradientTo} bg-clip-text text-transparent`}
                    >
                      {section.title}
                    </h3>
                    {section.Component}
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== MOBILE BOTTOM TABS ===== */}
      <div className="md:hidden fixed bottom-[80px] left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center py-1">
          {/* Scrollable Nav Items */}
          <div className="flex overflow-x-auto no-scrollbar flex-1 px-1 space-x-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg transition-all ${
                  activeSection === section.id
                    ? "text-orange-600"
                    : "text-gray-600"
                }`}
              >
                {getIcon(section.title, 20)}
                <span className="text-xs mt-1">{section.title}</span>
              </button>
            ))}
          </div>

          {/* Logout Button (Fixed on Right) */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex flex-col items-center p-2 text-red-600 min-w-[60px]"
          >
            <IoMdLogOut size={20} />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>

      <div className="pb-20 md:pb-0"></div>

      {/* ===== UPLOAD MODAL ===== */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            ref={uploadModalRef}
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
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-2 border-gray-200">
                  <img
                    src={
                      preview ||
                      (base64Image
                        ? `data:image/jpeg;base64,${base64Image}`
                        : "https://via.placeholder.com/150?text=Preview")
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
                    className={`flex-1 bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} text-white py-2 px-4 rounded-lg hover:opacity-90`}
                  >
                    Gallery
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                  >
                    Camera
                  </button>
                </div>

                {base64Image && (
                  <div className="mt-6 w-full">
                    <button
                      onClick={handleSave}
                      disabled={isUploading}
                      className={`w-full bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 ${
                        isUploading ? "opacity-50" : ""
                      }`}
                    >
                      {isUploading ? "Saving..." : "Save Avatar"}
                    </button>
                    {isUploading && (
                      <div className="mt-4">
                        <div className="bg-gray-200 rounded-lg h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-green-600"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-sm text-center mt-2">{progress}%</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== LOGOUT CONFIRMATION ===== */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm text-center"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Logout?
              </h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    handleLogout();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable Modal
const Modal = ({ children, isMobile, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isMobile ? (
        <motion.div
          variants={{
            hidden: { y: "100%" },
            visible: { y: 0 },
            exit: { y: "100%" },
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-0 left-0 right-0 w-full h-[70vh] bg-white rounded-t-2xl shadow-2xl p-6"
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          {children}
        </motion.div>
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

export default UserProfile;
