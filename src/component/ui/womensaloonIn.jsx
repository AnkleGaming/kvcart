import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SelectServiceCardSection from "./select-service";
import PackageMain from "./package-card";
import CartPage from "./cartpage";
import CartSummary from "./cartsummury";
import GetOrderid from "../../backend/order/getorderid";
import InsertOrder from "../../backend/order/insertorder";
import LoginCard from "./loginCard";
import OtpVerification from "./otpverification";
import Accesories from "./accessories";
import Colors from "../../core/constant";
import UpdateOrder from "../../backend/order/updateorder";
import UpdateOrderQuantity from "../../backend/order/updateorderquantity";
import ShowOrders from "../../backend/order/showorder";
import MobileCartSummary from "./mobilecart";

const WomenSaloonIn = () => {
  const location = useLocation();
  const { subService } = location.state || {};

  const [cartItems, setCartItems] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);
  const [selectedServiceTab, setSelectedServiceTab] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState(null);
  const [pendingPhone, setPendingPhone] = useState("");
  const loginPromptRef = useRef(null);
  const loginCardRef = useRef(null);
  const otpModalRef = useRef(null);
  const [orderType, setOrderType] = useState(null);
  const UserID = localStorage.getItem("userPhone");
  const navigate = useNavigate();
  const [isProcessingAdd, setIsProcessingAdd] = useState(false);
  const [pending1Rows, setPending1Rows] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsLaptop(width >= 1024);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (!showLogin || !loginPromptRef.current) return;
    const modalElement = loginPromptRef.current;
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
  }, [showLogin]);

  useEffect(() => {
    if (!showLoginCard || !loginCardRef.current) return;
    const modalElement = loginCardRef.current;
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
  }, [showLoginCard]);

  useEffect(() => {
    if (!showOtpModal || !otpModalRef.current) return;
    const modalElement = otpModalRef.current;
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
  }, [showOtpModal]);

  useEffect(() => {
    if (showLogin || showLoginCard || showOtpModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [showLogin, showLoginCard, showOtpModal]);

  useEffect(() => {
    const fetchExistingOrder = async () => {
      try {
        if (!UserID) return;

        const orders = await GetOrderid(UserID, "Pending");

        if (orders && orders.length > 0) {
          setOrderId(orders[0].OrderID);
          setOrderType(orders[0].OrderType);
          console.log(
            "Existing order found:",
            orders[0].OrderID,
            orders[0].OrderType
          );
        } else {
          setOrderId(null);
          setOrderType(null);
          console.log("No existing order, will generate new one on first add");
        }
      } catch (err) {
        console.error("GetOrderid failed:", err);
      }
    };
    fetchExistingOrder();
  }, [UserID]);

  const fetchCartOrders = useCallback(async () => {
    if (!UserID) {
      return;
    }
    try {
      const rows = await GetOrderid(UserID, "Pending");
      // If GetOrderid returns array or something else adapt accordingly
      // store nothing because you already use fetch on useEffect, but we expose this for refreshs
      // if you want to keep local orders state add setOrders(...)
      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      console.error("fetchCartOrders error", err);
      return [];
    }
  }, [UserID]);

  const fetchPending1Orders = useCallback(async () => {
    if (!UserID) {
      setPending1Rows([]);
      return [];
    }
    setPendingLoading(true);
    try {
      const rows = await ShowOrders({
        orderid: "",
        UserID,
        VendorPhone: "",
        Status: "Pending1",
      });
      setPending1Rows(Array.isArray(rows) ? rows : []);
      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      console.error("fetchPending1Orders error", err);
      setPending1Rows([]);
      return [];
    } finally {
      setPendingLoading(false);
    }
  }, [UserID]);

  const [servicePackages, setServicePackages] = useState([]);
  const fetchPackages = useCallback(async () => {
    if (!selectedServiceTab?.SubCatid) return;
    try {
      const data = await import(
        "../../backend/servicepack/getservicepack"
      ).then((mod) => mod.default(selectedServiceTab.SubCatid));
      setServicePackages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    }
  }, [selectedServiceTab]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // inside your component, replace existing addToCart with this
  // Real-time location with fallback + continuous update
  const useRealTimeLocation = () => {
    const [location, setLocation] = useState({
      lat: "00.00000",
      long: "00.0000",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!navigator.geolocation) {
        setLocation({ lat: "00.0000", long: "00.0000" });
        setLoading(false);
        return;
      }

      let watchId = null;

      const updateLocation = (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: String(latitude),
          long: String(longitude),
        });
        setLoading(false);
      };

      const handleError = (err) => {
        console.warn("Location access denied or failed:", err.message);

        setLoading(false);
      };

      // First: Try one-time high accuracy
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation(pos);
          // Then: Start watching for better accuracy over time
          watchId = navigator.geolocation.watchPosition(
            updateLocation,
            handleError,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
          );
        },
        () => {
          // Fallback: Use low accuracy + watch
          watchId = navigator.geolocation.watchPosition(
            updateLocation,
            handleError,
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );

      // Cleanup watcher on unmount
      return () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    }, []);

    return { location, loading };
  };

  const { location: realTimeLocation } = useRealTimeLocation();

  const addToCart = async (item) => {
    if (!UserID) {
      setPendingCartItem(item);
      setShowLogin(true);
      return;
    }

    if (isProcessingAdd) return;
    setIsProcessingAdd(true);

    const price = parseInt(item.discountfee || item.fees || 0) || 0;
    const token = localStorage.getItem("token") || "SWNCMPMSREMXAMCKALVAALI";
    const normalize = (s) => (s || "").toString().trim().toLowerCase();

    try {
      // get best-effort location (async, may use fallback)
      const { lat, long } = realTimeLocation;

      // 1) check vendor-pending (Pending1)
      const p1 = await fetchPending1Orders();
      const pending1 = Array.isArray(p1) ? p1 : [];

      if (pending1.length > 0) {
        const pendingOrderId = pending1[0].OrderID || "";

        // normalize accessor: pending1 items could be ShowOrderModel instances or plain objects
        const firstPending = pending1[0] || {};
        const getField = (obj, key) =>
          obj && typeof obj[key] !== "undefined"
            ? obj[key]
            : obj?.[key]?.toString?.() ?? "";

        // grab values to reuse (safe fallbacks)
        const reuseOTP = getField(firstPending, "OTP") || "";
        const reuseBeforVideo = getField(firstPending, "BeforVideo") || "";
        const reuseAddress = getField(firstPending, "Address") || "";
        const reuseVendorPhone = getField(firstPending, "VendorPhone") || "";

        console.log("Reusing from pending1 (first row):", {
          reuseOTP,
          reuseBeforVideo,
          reuseAddress,
          reuseVendorPhone,
        });

        const existingRow = pending1.find((r) =>
          r.ItemID
            ? String(r.ItemID) === String(item.ItemID || item.itemId)
            : normalize(r.ItemName) ===
              normalize(item.servicename || item.ItemName)
        );

        if (existingRow) {
          const prevQty = Number(existingRow.Quantity || 0) || 0;
          const newQty = prevQty + 1;
          const updatePayload = {
            token,
            Id: String(existingRow.ID),
            OrderID: pendingOrderId,
            Price: String(existingRow.Price ?? price),
            Quantity: String(newQty),
          };
          console.log("Updating pending1 row:", updatePayload);
          const updResp = await UpdateOrderQuantity(updatePayload);
          console.log("UpdateOrderQuantity (pending1) response:", updResp);

          window.location.reload();
          alert(
            `${item.servicename || item.ItemName} quantity updated (pending1).`
          );
          window.location.reload();
        } else {
          // insert using reused OTP/Address/BeforVideo/VendorPhone from the first pending1 row
          const insertPayload = {
            token,
            OrderID: pendingOrderId,
            UserID,
            OrderType: "Service",
            ItemImages: "",
            ItemName: item.servicename || item.ItemName || "",
            Price: String(price),
            Quantity: "1",
            Address: reuseAddress,
            Slot: "",
            SlotDatetime: "",
            OrderDatetime: new Date().toISOString(),
            VendorPhone: reuseVendorPhone,
            BeforVideo: reuseBeforVideo,
            AfterVideo: "",
            OTP: reuseOTP,
            PaymentMethod: "",
            lat: String(lat),
            long: String(long), // use `long` (spelled out) — consistent with typical backend fields
            Status: "Pending1",
          };
          console.log(
            "Inserting (pending1) row (reused fields):",
            insertPayload
          );
          const insResp = await InsertOrder(insertPayload);
          console.log("InsertOrder (pending1) response:", insResp);

          await fetchPending1Orders();
          await fetchCartOrders();
          alert(
            `${
              item.servicename || item.ItemName
            } added to vendor pending order.`
          );
          window.location.reload();
        }
        // reload to reflect UI/quantity/state like your original flow

        setIsProcessingAdd(false);
        return;
      }

      // 2) No pending1: fallback to normal Pending
      const pendingRows = Array.isArray(await GetOrderid(UserID, "Pending"))
        ? await GetOrderid(UserID, "Pending")
        : [];

      const existingRow = (pendingRows || []).find((r) =>
        r.ItemID
          ? String(r.ItemID) === String(item.ItemID || item.itemId)
          : normalize(r.ItemName) ===
            normalize(item.servicename || item.ItemName)
      );

      if (existingRow) {
        const prevQty = Number(existingRow.Quantity || 0) || 0;
        const newQty = prevQty + 1;
        const updatePayload = {
          token,
          Id: String(existingRow.ID),
          OrderID: existingRow.OrderID || orderId || "",
          Price: String(existingRow.Price ?? price),
          Quantity: String(newQty),
        };
        console.log("Updating existing pending row:", updatePayload);
        const updResp = await UpdateOrderQuantity(updatePayload);
        console.log("UpdateOrderQuantity response:", updResp);
        window.location.reload();
        await fetchCartOrders();
        alert(`${item.servicename || item.ItemName} quantity updated.`);
      } else {
        let currentOrderId = orderId || `ORD${Date.now()}`;
        if (!orderId) {
          setOrderId(currentOrderId);
          setOrderType("Service");
        }

        const insertPayload = {
          token,
          OrderID: currentOrderId,
          UserID,
          OrderType: "Service",
          ItemImages: "",
          ItemName: item.servicename || item.ItemName || "",
          Price: String(price),
          Quantity: "1",
          Address: "",
          Slot: "",
          SlotDatetime: "",
          OrderDatetime: new Date().toISOString(),
          VendorPhone: "",
          BeforVideo: "",
          AfterVideo: "",
          OTP: "",
          PaymentMethod: "",
          lat: String(lat),
          long: String(long),
          Status: "Pending",
        };

        console.log("Inserting new cart row (normal):", insertPayload);
        const insResp = await InsertOrder(insertPayload);
        console.log("InsertOrder response:", insResp);

        await fetchCartOrders();
        alert(`${item.servicename || item.ItemName} added to cart.`);
        window.location.reload();
      }
    } catch (err) {
      console.error("addToCart error:", err);
      alert("Failed to add/update cart. Check console/network for details.");
    } finally {
      setIsProcessingAdd(false);
    }
  };

  const handleLoginSubmit = (phoneNumber) => {
    setPendingPhone(phoneNumber);
    setShowLogin(false);
    setShowLoginCard(false);
    setShowOtpModal(true);
  };

  const handleOtpSuccess = async (verifiedPhone) => {
    localStorage.setItem("userPhone", verifiedPhone);
    localStorage.setItem("isLoggedIn", "true");
    setShowOtpModal(false);

    if (pendingCartItem) {
      await addToCart(pendingCartItem);
      setPendingCartItem(null);
    }
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const calculateTotal = () =>
    cartItems.reduce(
      (acc, i) => acc + parseInt(i.discountfee || i.fees || 0) * i.quantity,
      0
    );

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const bottomSheetVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  };

  return (
    <div className="pt-4 px-1 md:px-6 lg:px-[120px] md:mt-[100px]">
      <div className="relative flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-1 sm:px-6 pt-16 lg:pt-5">
        {/* Header with Back Button and Title */}
        <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow-md z-10 border-b border-gray-200">
          <div className="flex items-center justify-start px-4 py-3 sm:px-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-gray-600 hover:text-gray-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2
              className={`text-xl sm:text-3xl font-bold bg-${Colors.primaryMain} bg-clip-text text-transparent`}
            >
              Packages
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row lg:flex-row gap-4 lg:gap-6 h-full">
          <div className="flex flex-col gap-4 flex-shrink-0">
            <SelectServiceCardSection
              subService={subService}
              selectedSubService={selectedServiceTab}
              onChangeSubService={(newTab) => setSelectedServiceTab(newTab)}
            />

            {isMobile && (
              <>
                <div>
                  <div className="mb-[60px]">
                    <PackageMain
                      addToCart={addToCart}
                      selectedServiceTab={selectedServiceTab}
                    />
                  </div>
                  <div>
                    <MobileCartSummary />
                  </div>
                </div>
              </>
            )}

            {isTablet && (
              <CartPage
                cartItems={cartItems}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                calculateTotal={calculateTotal}
              />
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex-grow max-h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar px-[1px] sm:px-[1px]">
              {!isMobile && (
                <PackageMain
                  addToCart={addToCart}
                  selectedServiceTab={selectedServiceTab}
                />
              )}
            </div>

            {/* <div className="flex-grow max-h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar px-[1px] sm:px-[1px]">
              {!isMobile && (
                <Accesories
                  addToCart={addToCart}
                  selectedServiceTab={selectedServiceTab}
                />
              )}
            </div> */}
          </div>

          {isLaptop && (
            <div className="mt-[30px] lg:block flex-shrink-0">
              <CartPage
                cartItems={cartItems}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                calculateTotal={calculateTotal}
              />
            </div>
          )}
        </div>

        {isMobile && (
          <div className="fixed bottom-0 left-0 w-full z-50 block lg:hidden">
            <CartSummary total={calculateTotal()} cartItems={cartItems} />
          </div>
        )}

        <AnimatePresence>
          {showLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-auto"
              ref={loginPromptRef}
              aria-modal="true"
              role="dialog"
            >
              {isMobile ? (
                <motion.div
                  variants={bottomSheetVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed bottom-0 left-0 right-0 w-full h-[50vh] bg-white rounded-t-2xl shadow-2xl p-6 max-w-md mx-auto pointer-events-auto"
                >
                  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2"
                    onClick={() => setShowLogin(false)}
                    aria-label="Close login prompt"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="flex flex-col items-center text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Login Required
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      You need to log in to add items to your cart.
                    </p>
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => {
                          setShowLogin(false);
                          setShowLoginCard(true);
                        }}
                        className={`px-6 py-3 bg-${Colors.primaryMain} text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-700 transition-all duration-200`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Proceed to login"
                      >
                        Log In
                      </motion.button>
                      <motion.button
                        onClick={() => setShowLogin(false)}
                        className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Return to browsing"
                      >
                        Return
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full pointer-events-auto">
                    <button
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2"
                      onClick={() => setShowLogin(false)}
                      aria-label="Close login prompt"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="flex flex-col items-center text-center">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                        Login Required
                      </h2>
                      <p className="text-sm text-gray-600 mb-6">
                        You need to log in to add items to your cart.
                      </p>
                      <div className="flex gap-4">
                        <motion.button
                          onClick={() => {
                            setShowLogin(false);
                            setShowLoginCard(true);
                          }}
                          className={`px-6 py-3 bg-${Colors.primaryMain} text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-700 transition-all duration-200`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Proceed to login"
                        >
                          Log In
                        </motion.button>
                        <motion.button
                          onClick={() => setShowLogin(false)}
                          className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Return to browsing"
                        >
                          Return
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCart && orderType === "Product" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-auto"
              ref={loginPromptRef}
              aria-modal="true"
              role="dialog"
            >
              {isMobile ? (
                <motion.div
                  variants={bottomSheetVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed bottom-0 left-0 right-0 w-full h-[50vh] bg-white rounded-t-2xl shadow-2xl p-6 max-w-md mx-auto pointer-events-auto"
                >
                  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2"
                    onClick={() => setShowCart(false)}
                    aria-label="Close cart prompt"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="flex flex-col items-center text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Product Cart Pending!
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      You need to Finish or Delete from Cart.
                    </p>
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => {
                          setShowCart(false);
                          setShowLoginCard(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Proceed to login"
                      >
                        Log In
                      </motion.button>
                      <motion.button
                        onClick={() => setShowCart(false)}
                        className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Return to browsing"
                      >
                        Return
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full pointer-events-auto">
                    <button
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2"
                      onClick={() => setShowCart(false)}
                      aria-label="Close cart prompt"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="flex flex-col items-center text-center">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                        Product Cart Pending!
                      </h2>
                      <p className="text-sm text-gray-600 mb-6">
                        You need to Finish or Delete from Cart.
                      </p>
                      <div className="flex gap-4">
                        <motion.button
                          onClick={() => {
                            navigate("/cartpage");
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Proceed to login"
                        >
                          Cart
                        </motion.button>
                        <motion.button
                          onClick={() => setShowCart(false)}
                          className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Return to browsing"
                        >
                          Return
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLoginCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-auto"
              ref={loginCardRef}
              aria-modal="true"
              role="dialog"
            >
              {isMobile ? (
                <motion.div
                  variants={bottomSheetVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed bottom-0 left-0 right-0 w-full h-[70vh] bg-white rounded-t-2xl shadow-2xl p-6 max-w-md mx-auto pointer-events-auto"
                >
                  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                  <LoginCard
                    onClose={() => setShowLoginCard(false)}
                    onSubmit={handleLoginSubmit}
                  />
                </motion.div>
              ) : (
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full pointer-events-auto">
                    <LoginCard
                      onClose={() => setShowLoginCard(false)}
                      onSubmit={handleLoginSubmit}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOtpModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-auto"
              ref={otpModalRef}
              aria-modal="true"
              role="dialog"
            >
              {isMobile ? (
                <motion.div
                  variants={bottomSheetVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed bottom-0 left-0 right-0 w-full h-[70vh] bg-white rounded-t-2xl shadow-2xl p-6 max-w-md mx-auto pointer-events-auto"
                >
                  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                  <OtpVerification
                    phone={pendingPhone}
                    onSuccess={handleOtpSuccess}
                    onClose={() => setShowOtpModal(false)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full pointer-events-auto">
                    <OtpVerification
                      phone={pendingPhone}
                      onSuccess={handleOtpSuccess}
                      onClose={() => setShowOtpModal(false)}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WomenSaloonIn;
