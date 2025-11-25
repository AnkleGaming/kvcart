import React, { useState, useEffect } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosTime } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Colors from "../../core/constant";

const PaymentCard = ({
  onSelectAddress,

  onProceed,
  selectedAddress,
  selectedSlot,
  itemTotal = 0,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const navigate = useNavigate();

  // ---------- Detect mobile ----------
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ---------- Button state ----------
  const needAddress = !selectedAddress;
  const needSlot = !selectedSlot;
  const canProceed = selectedAddress;

  const getButtonLabel = () => {
    if (!isLoggedIn) return "Login to Continue";
    if (needAddress) return "Select Address";
    // if (needSlot) return "Select Slot";
    return `Proceed to Pay`;
  };

  const handleMainClick = () => {
    if (!isLoggedIn) return navigate("/login");
    if (needAddress) return onSelectAddress();
    // if (needSlot) return onSelectSlot();
    onProceed();
  };

  // -------------------------------------------------
  // Desktop UI
  // -------------------------------------------------
  const Desktop = () => (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <FaLocationDot className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-medium text-gray-900">Booking details to</p>
            <p className="text-sm text-gray-600">
              +91 {selectedAddress?.Phone || localStorage.getItem("userPhone")}
            </p>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Address */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
            <FaLocationDot className="w-5 h-5 text-orange-600" />
            Address
          </h3>

          {selectedAddress ? (
            <div
              onClick={onSelectAddress}
              className="p-4 bg-orange-50 border border-orange-200 rounded-xl cursor-pointer hover:bg-orange-100 transition"
            >
              <p className="font-medium text-gray-800">
                {selectedAddress.Name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {selectedAddress.FullAddress}
              </p>
              <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <MdEdit className="w-3.5 h-3.5" />
                Change
              </p>
            </div>
          ) : (
            <button
              onClick={onSelectAddress}
              className={`w-full py-3 rounded-xl font-medium text-white bg-${Colors.primaryMain} shadow-md hover:shadow-lg transition`}
            >
              Select Address
            </button>
          )}
        </div>

        {/* Slot */}
        {/* <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
            <IoIosTime className="w-5 h-5 text-indigo-600" />
            Slot
          </h3>

          {selectedSlot ? (
            <div
              onClick={onSelectSlot}
              className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-100 transition"
            >
              <p className="font-medium text-gray-800">
                {selectedSlot.day?.label} {selectedSlot.day?.date}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Time: {selectedSlot.time?.time}
              </p>
              {selectedSlot.day?.recommended && (
                <p className="text-xs text-amber-600 mt-2">Recommended</p>
              )}
              <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                <MdEdit className="w-3.5 h-3.5" />
                Change
              </p>
            </div>
          ) : (
            <button
              onClick={onSelectSlot}
              disabled={needAddress}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                needAddress
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : `bg-${Colors.primaryMain} text-white shadow-md hover:shadow-lg`
              }`}
            >
              Select Slot
            </button>
          )}
        </div> */}

        {/* Proceed */}
        <button
          onClick={handleMainClick}
          disabled={!canProceed}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
            !canProceed
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : `bg-${Colors.primaryMain} text-white shadow-md hover:shadow-lg hover:cursor-pointer`
          }`}
        >
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );

  // -------------------------------------------------
  // Mobile UI (Sticky Bottom Bar)
  // -------------------------------------------------
  const Mobile = () => (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="p-3 space-y-2">
        {/* Summary Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {selectedAddress && (
            <div
              onClick={onSelectAddress}
              className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-300 rounded-full whitespace-nowrap cursor-pointer hover:bg-orange-100 transition"
            >
              <FaLocationDot className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-gray-700">
                {selectedAddress.Name.split(" ")[0]}
              </span>
              <MdEdit className="w-3.5 h-3.5 text-gray-500" />
            </div>
          )}

          {/* {selectedSlot && (
            <div
              onClick={onSelectSlot}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-300 rounded-full whitespace-nowrap cursor-pointer hover:bg-indigo-100 transition"
            >
              <IoIosTime className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-gray-700">
                {selectedSlot.time?.time}
              </span>
              <MdEdit className="w-3.5 h-3.5 text-gray-500" />
            </div>
          )} */}
        </div>

        {/* Pay Button */}
        <button
          onClick={handleMainClick}
          className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg ${"bg-orange-500 hover:from-ornage-600  active:scale-95"}`}
        >
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );

  return <>{isMobile ? <Mobile /> : <Desktop />}</>;
};

export default PaymentCard;
