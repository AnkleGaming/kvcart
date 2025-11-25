// src/components/header/MobileHeader.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GetOrder from "../../backend/order/getorderid";
import GetSubCategory from "../../backend/homepageimage/getcategory";
import { FiSearch } from "react-icons/fi";
import logo from "../../assets/hukmee.png";
import WomensSalonCard from "./womensaloonCard";

const CartWithBadge = ({ count }) => (
  <div className="relative">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 text-gray-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="8" cy="21" r="2" />
      <circle cx="20" cy="21" r="2" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
    {count > 0 && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-4 -right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg border-2 border-white"
      >
        {count > 99 ? "99+" : count}
      </motion.div>
    )}
  </div>
);

const MobileHeader = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [subcategory, setSubcategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const userID = localStorage.getItem("userPhone");
  const dropdownRef = useRef(null);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setActiveModal("category");
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch cart count
  useEffect(() => {
    const fetchOrder = async () => {
      if (!userID) {
        setCartCount(0);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await GetOrder(userID, "Pending");
        const items = response?.items || response || [];
        setCartCount(Array.isArray(items) ? items.length : 0);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCartCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [userID]);

  // Fetch subcategories
  useEffect(() => {
    const fetchSubcategory = async () => {
      try {
        const data = await GetSubCategory();
        if (Array.isArray(data)) {
          setSubcategory(data);
          setFilteredResults(data);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubcategory();
  }, []);

  // Filter results
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResults(subcategory);
      return;
    }
    const filtered = subcategory.filter((item) =>
      item.ServiceName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(filtered);
  }, [searchTerm, subcategory]);

  return (
    <>
      {/* Top Logo Bar */}
      <div>
        <div
          onClick={() => navigate("/")}
          className="flex items-start cursor-pointer p-[5px] ml-[10px]"
        >
          <img
            src={logo}
            alt="WePrettify Logo"
            className="w-[250px] h-[150px] rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Main Header */}
        <header className="sticky top-0 z-10 bg-white rounded-[10px] border-b border-gray-200 px-[10px]">
          <div className="flex items-center justify-between px-[1px] py-[5px]">
            {/* Search Bar */}
            <div className="flex mx-3 relative" ref={dropdownRef}>
              <div
                className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-[20px] py-3 shadow-sm focus-within:ring-2 focus-within:ring-orange-400 transition-all"
                onClick={() => setIsDropdownOpen(true)}
              >
                <FiSearch className="text-gray-500 mr-[1px]" size={20} />
                <input
                  type="text"
                  placeholder="Search Categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="flex bg-transparent outline-none text-gray-700 placeholder-gray-400 font-normal ml-[10px] "
                />
              </div>

              {/* Dropdown Results */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
                  >
                    {filteredResults.length > 0 ? (
                      filteredResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleServiceClick(item)}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                        >
                          <img
                            src={`https://api.hukmee.in/${item.ServiceImage}`}
                            alt={item.ServiceName}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.ServiceName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.SubCatCount || ""} services
                            </p>
                          </div>
                        </div>
                      ))
                    ) : searchTerm ? (
                      <div className="p-8 text-center text-gray-500">
                        <p className="text-lg">No services found</p>
                        <p className="text-sm mt-1">
                          Try searching something else
                        </p>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-400">
                        Start typing to search...
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Button */}
            <div className="">
              <button
                onClick={() => navigate("/cartpage")}
                className="m-[1px]-1 p-[10px] rounded-full border b "
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CartWithBadge count={cartCount} />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Fullscreen Modal */}
        <AnimatePresence>
          {activeModal === "category" && selectedService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end justify-center"
              onClick={() => setActiveModal(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedService.ServiceName}
                  </h2>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  <WomensSalonCard
                    service={selectedService}
                    onClose={() => setActiveModal(null)}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MobileHeader;
