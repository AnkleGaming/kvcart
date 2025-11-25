import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ShowOrders from "../../backend/order/showorder";
import GetVendor from "../../backend/authentication/getvendor";

/* -------------------------
   Small UI skeletons
   ------------------------- */
const SkeletonVendorDetails = () => (
  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-48" />
      <div className="h-4 bg-gray-200 rounded w-36" />
      <div className="h-4 bg-gray-200 rounded w-56" />
    </div>
  </div>
);

const SkeletonItem = () => (
  <div className="flex justify-between items-center border-b border-gray-100 pb-3 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-32" />
    <div className="text-right">
      <div className="h-5 bg-orange-200 rounded-full w-16 mb-1" />
      <div className="h-6 bg-gray-200 rounded w-20" />
    </div>
  </div>
);

const SkeletonOTP = () => (
  <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 text-center animate-pulse">
    <div className="h-4 bg-blue-200 rounded w-40 mx-auto mb-2" />
    <div className="h-10 bg-blue-200 rounded w-32 mx-auto" />
  </div>
);

/* -------------------------
   OTPCard (self-contained)
   ------------------------- */
const OTPCard = ({ otp = "", mask = false, expirySeconds = 300 }) => {
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(expirySeconds);

  useEffect(() => {
    if (!secondsLeft) return;
    const t = setInterval(
      () => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => clearInterval(t);
  }, [secondsLeft]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(otp);
      } else {
        const el = document.createElement("textarea");
        el.value = otp;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const display = mask ? otp.replace(/\d/g, "•") : otp;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 text-center">
      <div className="mb-2">
        <div className="text-sm font-medium text-blue-700">
          Share this OTP with vendor
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="px-6 py-3 bg-white rounded-lg shadow-inner border border-blue-100">
          <div className="text-3xl sm:text-4xl font-bold text-blue-800 tracking-widest">
            {display || <span className="text-gray-400">— — — —</span>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
            aria-label="Copy OTP"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------
   VendorCard
   ------------------------- */
const VendorCard = ({
  title,
  vendorData = [],
  isLoading,
  isAccepted,
  vendorDetails,
  isVendorLoading,
}) => {
  const totalPrice = vendorData
    .reduce(
      (acc, item) =>
        acc + (parseFloat(item.Price) || 0) * (parseInt(item.Quantity) || 1),
      0
    )
    .toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 sm:p-8"
    >
      <h2
        className={`text-2xl sm:text-3xl font-bold text-center mb-6 ${
          isAccepted
            ? "text-green-600"
            : "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"
        }`}
      >
        {title}
      </h2>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
          <p className="text-center text-gray-600 text-base font-medium">
            Finding the best vendor for you...
          </p>
          <p className="text-xs text-gray-500">This may take 10-30 seconds</p>
        </div>
      ) : (
        <>
          {isAccepted && (
            <div className="space-y-5">
              {/* Vendor Details */}
              <div>
                {isVendorLoading ? (
                  <SkeletonVendorDetails />
                ) : vendorDetails ? (
                  <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                      Vendor Assigned
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong className="text-gray-900">Name:</strong>{" "}
                        {vendorDetails.fullname}
                      </p>
                      <p>
                        <strong className="text-gray-900">Phone:</strong>{" "}
                        {vendorDetails.phoneNumber}
                      </p>
                      <p>
                        <strong className="text-gray-900">Address:</strong>{" "}
                        {vendorDetails.Address || "N/A"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic p-5">
                    Vendor details not available
                  </p>
                )}
              </div>

              {/* OTP */}
              {vendorData[0]?.OTP ? (
                <OTPCard otp={String(vendorData[0].OTP)} />
              ) : (
                <SkeletonOTP />
              )}
            </div>
          )}

          {/* Items List */}
          {vendorData.length > 0 ? (
            <div className="mt-6 space-y-3">
              {vendorData.map((item, i) => (
                <div
                  key={item.ID || `${item.ItemName}-${i}`}
                  className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-b-0"
                >
                  <p className="font-medium text-gray-800 text-base">
                    {item.ItemName || "Item"}
                  </p>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      Qty: {item.Quantity || 1}
                    </span>
                    <p className="font-bold text-gray-900 mt-1 text-lg">
                      ₹{item.Price ?? "0.00"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 text-center text-gray-500">
              {/* <p>No items in order.</p> */}
            </div>
          )}

          {/* Total Price */}
          {vendorData.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-300 text-right">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                Total: <span className="text-orange-600">₹{totalPrice}</span>
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

/* -------------------------
   VendorWait (main)
   ------------------------- */
const VendorWait = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // incoming cart items
  const incomingCartItems = location.state?.cartItems || [];
  const [cartItems] = useState(
    Array.isArray(incomingCartItems) ? incomingCartItems : []
  );

  // order ID detection: cartItems, location.state.orderId, ?orderId=...
  const queryOrderId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("orderId")
      : null;

  const [orderIdState, setOrderIdState] = useState(
    cartItems[0]?.OrderID || location.state?.orderId || queryOrderId || ""
  );

  useEffect(() => {
    if (!orderIdState && cartItems[0]?.OrderID) {
      setOrderIdState(cartItems[0].OrderID);
    }
    if (!orderIdState && location.state?.orderId) {
      setOrderIdState(location.state.orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, location.state]);

  const userPhone = localStorage.getItem("userPhone");

  // states
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [isVendorLoading, setIsVendorLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [userLocation, setUserLocation] = useState(null);

  // refs & flags
  const pollTimeoutRef = useRef(null);
  const countdownRef = useRef(null);
  const hasAccepted = useRef(false);
  const vendorDetailsRef = useRef(null);
  const inflightRef = useRef(false);

  // debug toggle
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    vendorDetailsRef.current = vendorDetails;
  }, [vendorDetails]);

  // === fetch user location once ===
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not supported");
      setUserLocation({ lat: 26.551381, lon: 84.767491 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        console.log("Location fetched:", latitude, longitude);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setUserLocation({ lat: 26.551381, lon: 84.767491 }); // fallback
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // countdown timer
  useEffect(() => {
    if (hasAccepted.current) return;

    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          navigate("/", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [navigate]);

  // polling with location
  useEffect(() => {
    if (!orderIdState || !userPhone) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const safeShowOrders = async (payload) => {
      try {
        console.debug("Calling ShowOrders with", payload);
        const r = await ShowOrders(payload);
        console.debug("ShowOrders response:", r);
        return r;
      } catch (err) {
        console.error("ShowOrders error", err);
        throw err;
      }
    };

    const fetchOrderStatus = async () => {
      if (!isActive || hasAccepted.current || inflightRef.current) return;
      inflightRef.current = true;

      try {
        const payload = {
          orderid: orderIdState,
          UserID: userPhone,
          VendorPhone: "",
          Status: "Done",
          lat: userLocation?.lat?.toFixed(6) || 26.551381,
          lon: userLocation?.lon?.toFixed(6) || 84.767491,
        };

        const res = await safeShowOrders(payload);

        if (Array.isArray(res)) {
          const matched = res.filter((o) => o.OrderID === orderIdState);
          setVendorData(matched);
        } else {
          setVendorData([]);
        }

        const currentOrder = Array.isArray(res)
          ? res.find((o) => o.OrderID === orderIdState)
          : null;

        if (
          currentOrder &&
          currentOrder.Status === "Done" &&
          !hasAccepted.current
        ) {
          hasAccepted.current = true;
          setIsAccepted(true);
          setIsLoading(false);

          if (pollTimeoutRef.current) {
            clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
          }

          const vendorPhone = currentOrder.VendorPhone;
          if (vendorPhone && !vendorDetailsRef.current) {
            setIsVendorLoading(true);
            try {
              const vendorRes = await GetVendor(vendorPhone);
              if (Array.isArray(vendorRes) && vendorRes.length > 0) {
                setVendorDetails(vendorRes[0]);
              }
            } catch (err) {
              console.error("Failed to load vendor:", err);
            } finally {
              setIsVendorLoading(false);
            }
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Polling error:", error);
        setIsLoading(false);
      } finally {
        inflightRef.current = false;
        if (!hasAccepted.current && isActive) {
          pollTimeoutRef.current = setTimeout(fetchOrderStatus, 4000);
        }
      }
    };

    // start polling
    fetchOrderStatus();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !hasAccepted.current) {
        fetchOrderStatus();
      }
    };
    const handleFocus = () => !hasAccepted.current && fetchOrderStatus();
    const handleOnline = () => !hasAccepted.current && fetchOrderStatus();
    const handleUserInteraction = () =>
      !hasAccepted.current && fetchOrderStatus();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    document.addEventListener("click", handleUserInteraction);

    return () => {
      isActive = false;
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [orderIdState, userPhone, userLocation]);

  // reset loading state watcher
  useEffect(() => {
    if (!isAccepted && !hasAccepted.current) {
      setIsLoading(true);
    } else if (isAccepted && countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [isAccepted]);

  // initial debug info (also updates when userLocation changes)
  useEffect(() => {
    console.info("VendorWait mounted/updated:", {
      orderIdState,
      locationState: location.state,
      cartItems,
      userPhone,
      userLocation,
    });
  }, [orderIdState, userLocation]);

  // If missing orderId show helpful UI
  if (!orderIdState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-2">Order ID missing</h2>
          <p className="text-sm text-gray-600 mb-4">
            We couldn't find an order ID to poll for vendor assignment.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-100 rounded"
            >
              Go back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------
     Render
     ------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Debug Toggle */}

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-100"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
            Vendor Assignment
          </h1>
          <div className="w-[110px]" />
        </div>
      </div>

      {/* Countdown bar */}
      {!isAccepted && secondsLeft > 0 && (
        <div className="fixed top-16 md:top-20 left-0 right-0 bg-gray-200 h-1.5 z-30 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 120, ease: "linear" }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-24 md:py-32">
        <VendorCard
          title={
            isAccepted
              ? "Vendor Accepted!"
              : `Finding Vendor... (${secondsLeft}s)`
          }
          vendorData={vendorData}
          isLoading={isLoading && !isAccepted}
          isAccepted={isAccepted}
          vendorDetails={vendorDetails}
          isVendorLoading={isVendorLoading}
        />
      </div>

      {/* Last 10-sec warning */}
      {!isAccepted && secondsLeft <= 10 && secondsLeft > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-4 right-4 md:left-1/3 md:right-1/3 text-center z-50"
        >
          <p className="text-sm font-medium text-red-600 bg-white rounded-full py-3 shadow-xl border border-red-200">
            No vendor accepted. Redirecting in {secondsLeft}s...
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default VendorWait;
