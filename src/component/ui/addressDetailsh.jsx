import React, { useEffect, useState } from "react";
import {
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { MdDelete, MdLocationOn } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import GetAddress from "../../backend/address/getaddress";
import DeleteAddress from "../../backend/address/deleteaddress";
import Colors from "../../core/constant";

const AddressList = ({ onRefresh }) => {
  const [addresses, setAddresses] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null); // track inline edit
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const phone = localStorage.getItem("userPhone") || "";

  // Fetch addresses
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await GetAddress(phone);
      setAddresses(data || []);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
    if (editingIndex !== null) {
      setEditingIndex(null);
      setEditForm({});
    }
  };

  const handleDeleteClick = (address) => {
    if (window.confirm("Delete this address?")) {
      DeleteAddress(address.id)
        .then((res) => {
          if (res.success) {
            alert("Deleted!");
            onRefresh?.();
          } else {
            alert("Delete failed");
          }
        })
        .catch(() => alert("Error"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div
          className={`animate-spin rounded-full h-10 w-10 border-b-2 border-${Colors.primaryMain}`}
        />
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Address Cards */}
      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <MdLocationOn className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-lg text-gray-600 font-medium">No addresses</p>
          <p className="text-sm text-gray-500">Add your first address!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address, index) => (
            <motion.div
              key={address.id || index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Compact Header */}
              <div
                className="p-5 cursor-pointer flex items-center justify-between"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <MdLocationOn
                      className={`text-${Colors.primaryMain} text-xl`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {address.Name || "Unnamed"}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {address.City}
                      {address.PinCode ? `, ${address.PinCode}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(address);
                    }}
                    className={`p-2 text-${Colors.primaryMain} hover:bg-orange-50 rounded-lg`}
                  >
                    <MdDelete className="text-lg" />
                  </button>
                  {expandedIndex === index ? (
                    <FaChevronUp className="text-lg text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-lg text-gray-500" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 bg-gray-50 px-5 py-6"
                  >
                    {editingIndex === index ? (
                      /* ===== INLINE EDIT FORM ===== */
                      <div className="space-y-4">
                        {[
                          { label: "Full Name", key: "Name" },
                          { label: "Phone", key: "Phone" },
                          { label: "Address", key: "Address" },
                          { label: "City", key: "City" },
                          { label: "Pin Code", key: "PinCode" },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="block text-xs font-medium text-gray-600 uppercase">
                              {field.label}
                            </label>
                            <input
                              type="text"
                              value={editForm[field.key] || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  [field.key]: e.target.value,
                                })
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
                              placeholder={field.label}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* ===== VIEW MODE ===== */
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          {[
                            { label: "Full Name", value: address.Name },
                            { label: "Phone", value: address.Phone },
                            { label: "Address", value: address.Address },
                            { label: "City", value: address.City },
                            { label: "Pin Code", value: address.PinCode },
                          ].map((field, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                            >
                              <p className="text-xs font-medium text-gray-500 uppercase">
                                {field.label}
                              </p>
                              <p className="mt-1 text-sm font-medium text-gray-900 break-words">
                                {field.value || "-"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;
