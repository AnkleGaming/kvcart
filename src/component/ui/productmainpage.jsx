import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import spaImage from "../../assets/imgbroke.png";
import GetProductImage from "../../backend/getproduct/getproductimage";
import SuggestProductScreen from "./suggestedproduct";
import RatingScreen from "./ratingscreen";
import GetProductReviews from "../../backend/getproduct/getproductreviews";
import InsertOrder from "../../backend/order/insertorder";
import GetOrder from "../../backend/order/getorderid";
import LoginCard from "./loginCard";
import OtpVerification from "./otpverification";
import Colors from "../../core/constant";
import UpdateOrderQuantity from "../../backend/order/updateorderquantity";

const ProductMainPage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const product = location.state?.subService;
  const [cartItems, setCartItems] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState(null);
  const [pendingPhone, setPendingPhone] = useState("");
  const loginPromptRef = useRef(null);
  const loginCardRef = useRef(null);
  const otpModalRef = useRef(null);
  const [addStatus, setAddStatus] = useState("idle");
  const [isProcessingAdd, setIsProcessingAdd] = useState(false);
  const [showGoToCart, setShowGoToCart] = useState(false);

  const UserID = localStorage.getItem("userPhone");

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      if (!product?.ProID) {
        setImages([spaImage]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const fetchedImages = await GetProductImage(product.ProID);
        console.log("product id is like", product.ProID);
        console.log("Fetched Images", fetchedImages);

        const baseUrl = "https://api.kvcart.com/";

        if (Array.isArray(fetchedImages) && fetchedImages.length > 0) {
          const mapped = fetchedImages.map((img) =>
            img.productImage
              ? `${baseUrl}${img.productImage.startsWith("/") ? "" : "/"}${
                  img.productImage
                }`
              : spaImage
          );
          setImages(mapped);
        } else {
          setImages([spaImage]);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setImages([spaImage]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, [product]);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  useEffect(() => {
    const fetchExistingOrder = async () => {
      try {
        if (!UserID) return;

        const orders = await GetOrder(UserID, "Pending");

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

  useEffect(() => {
    if (!instanceRef.current || isLoading) return;
    const autoplay = setInterval(() => {
      instanceRef.current?.next();
    }, 4000);
    return () => clearInterval(autoplay);
  }, [instanceRef, isLoading]);

  useEffect(() => {
    const fetchReview = async () => {
      if (!product?.ProductName) {
        setReviews([]);
        return;
      }
      try {
        const fetchedReviews = await GetProductReviews(product.ProductName);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      }
    };
    fetchReview();
  }, [product]);

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

  const addToCart = async (item) => {
    // require login
    if (!UserID) {
      setPendingCartItem(item);
      setShowLogin(true);
      return;
    }

    if (orderType === "Service") {
      setShowCart(true);
      return;
    }

    // prevent double requests
    if (isProcessingAdd) return;
    setIsProcessingAdd(true);

    // quick price fallback
    const price =
      parseInt(item.Price || item.fees || item.discountfee || 0, 10) || 0;

    // optimistic local update for UX
    setAddStatus("adding");
    setCartItems((prev) => {
      const exists = prev.find((i) => String(i.id) === String(item.ProID));
      if (exists) {
        return prev.map((i) =>
          String(i.id) === String(item.ProID)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        { id: item.ProID, ProductName: item.ProductName, price, quantity: 1 },
      ];
    });

    try {
      // 1) fetch server pending rows so we have DB row IDs
      const pendingRows = Array.isArray(await GetOrder(UserID, "Pending"))
        ? await GetOrder(UserID, "Pending")
        : [];

      // 2) try to find existing row by stable key: ProID (preferred), fallback to ProductName
      const normalize = (s) => (s ?? "").toString().trim().toLowerCase();

      const existingRow = (pendingRows || []).find((r) => {
        // if server returns a product id field use that (try r.ProID or r.ItemID)
        if (r.ProID && item.ProID) {
          return String(r.ProID) === String(item.ProID);
        }
        if (r.ItemID && item.ProID) {
          return String(r.ItemID) === String(item.ProID);
        }
        // fallback to name match (case-insensitive)
        return (
          normalize(r.ItemName) === normalize(item.ProductName || item.ItemName)
        );
      });

      if (existingRow) {
        // 3) UPDATE existing row: increment quantity by 1 using DB row ID
        const prevQty = Number(existingRow.Quantity || 0) || 0;
        const newQty = prevQty + 1;

        const updatePayload = {
          Id: String(existingRow.ID), // DB row id required by UpdateOrderQuantity
          OrderID: existingRow.OrderID || orderId || "",
          Price: String(existingRow.Price ?? price),
          Quantity: String(newQty),
        };

        console.log("Updating existing cart row:", updatePayload);
        const updResp = await UpdateOrderQuantity(updatePayload);
        // optional: inspect updResp for success; legacy .asmx endpoints often return wrappers

        // re-fetch server pending rows to get authoritative cart with IDs/quantities
        const refreshed = Array.isArray(await GetOrder(UserID, "Pending"))
          ? await GetOrder(UserID, "Pending")
          : [];

        // map server rows to local cart shape
        const mapped = (refreshed || []).map((r) => ({
          id: String(r.ID),
          dbId: r.ID,
          ProductName: r.ItemName || r.ProductName,
          price: Number(r.Price) || price,
          quantity: Number(r.Quantity) || 0,
        }));
        setCartItems(mapped);

        setAddStatus("added");
        setTimeout(() => setAddStatus("idle"), 1500);
        setIsProcessingAdd(false);
        return;
      }

      // 4) NOT FOUND -> INSERT new row (create orderId if missing)
      let currentOrderId = orderId;
      if (!currentOrderId) {
        currentOrderId = `ORD${Date.now()}`;
        setOrderId(currentOrderId);
        setOrderType("Product");
        console.log("Generated new order:", currentOrderId);
      }

      const insertPayload = {
        OrderID: currentOrderId,
        UserID,
        OrderType: "Product",
        ItemImages: "", // you can add product images if needed
        ItemName: item.ProductName || item.ItemName || "",
        Price: String(price),
        Quantity: "1",
        Address: "",
        Slot: "",
        SlotDatetime: "",
        OrderDatetime: new Date().toISOString(),
        VendorPhone: "",
        BeforVideo: "",
        AfterVideo: "",
        PaymentMethod: "",
        lat: "", // optional
        long: "",
      };

      console.log("Inserting new cart row:", insertPayload);
      await InsertOrder(insertPayload);

      // after insert, re-fetch pending rows to get DB ids and server-truth
      const refreshedAfterInsert = Array.isArray(
        await GetOrder(UserID, "Pending")
      )
        ? await GetOrder(UserID, "Pending")
        : [];

      const mappedAfterInsert = (refreshedAfterInsert || []).map((r) => ({
        id: String(r.ID),
        dbId: r.ID,
        ProductName: r.ItemName || r.ProductName,
        price: Number(r.Price) || price,
        quantity: Number(r.Quantity) || 0,
      }));
      setCartItems(mappedAfterInsert);

      setAddStatus("added");
      setTimeout(() => setAddStatus("idle"), 1500);
    } catch (err) {
      console.error("addToCart error:", err);
      setAddStatus("idle");
      // rollback: re-fetch server rows to restore authoritative state
      try {
        const refreshed = Array.isArray(await GetOrder(UserID, "Pending"))
          ? await GetOrder(UserID, "Pending")
          : [];
        const mapped = (refreshed || []).map((r) => ({
          id: String(r.ID),
          dbId: r.ID,
          ProductName: r.ItemName || r.ProductName,
          price: Number(r.Price) || price,
          quantity: Number(r.Quantity) || 0,
        }));
        setCartItems(mapped);
      } catch (fetchErr) {
        console.error("Rollback fetch failed:", fetchErr);
        // if even fetch fails, remove optimistic add for the item
        setCartItems((prev) =>
          prev.filter((c) => String(c.id) !== String(item.ProID))
        );
      }
      alert("Failed to add/update cart. Try again.");
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

  const goBack = () => {
    // Check if user can go back in history
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1); // go back in stack
    } else {
      navigate("/"); // fallback route
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-600">No product details found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow-lg z-50 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goBack}
            className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-700"
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
          </motion.button>

          {/* Title */}
          <h2
            className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} bg-clip-text text-transparent`}
          >
            Product
          </h2>

          {/* Spacer */}
          <div className="w-[210px]" />
        </div>
      </div>
      <div className="pt-[30px]"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto p-1 sm:p-6"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Slider */}
            <div className="relative h-72 md:h-96 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : images.length > 1 ? (
                <>
                  <div ref={sliderRef} className="keen-slider h-full">
                    {images.map((img, index) => (
                      <div key={index} className="keen-slider__slide">
                        <img
                          src={img}
                          alt={`${product.ProductName} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = spaImage;
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  {loaded && instanceRef.current && (
                    <>
                      <button
                        onClick={() => instanceRef.current?.prev()}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white transition-all duration-300 group"
                        aria-label="Previous slide"
                      >
                        <svg
                          className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => instanceRef.current?.next()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white transition-all duration-300 group"
                        aria-label="Next slide"
                      >
                        <svg
                          className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Dots Indicator */}
                  {loaded && instanceRef.current && (
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => instanceRef.current?.moveToIdx(index)}
                          className={`transition-all duration-300 ${
                            currentSlide === index
                              ? "w-10 h-2.5 bg-white rounded-full shadow-lg"
                              : "w-2.5 h-2.5 bg-white/60 rounded-full hover:bg-white/80"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="relative w-full h-full">
                    <img
                      src={images[0] || spaImage}
                      alt={product.ProductName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = spaImage;
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Product Details */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <h2
                  className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} bg-clip-text text-transparent mb-4 leading-tight`}
                >
                  {product.ProductName}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed line-clamp-4">
                  {product.ProductDes ||
                    "Experience premium quality with this handpicked product. Crafted with care for your satisfaction."}
                </p>
              </div>

              <div className="mt-8">
                {/* Price Row */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-2xl sm:text-4xl lg:text-3xl font-bold text-gray-900">
                    ₹{Number(product.Price).toFixed(0)}
                  </span>
                  {product.OriginalPrice && (
                    <span className="text-lg sm:text-xl text-gray-500 line-through">
                      ₹{Number(product.OriginalPrice).toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Buttons Row */}
                <div className="w-full flex flex-col md:flex-col gap-3 ">
                  {/* ADD TO CART BUTTON */}
                  <motion.button
                    whileHover={{ scale: addStatus === "added" ? 1 : 1.02 }}
                    whileTap={{ scale: addStatus === "added" ? 1 : 0.98 }}
                    onClick={() => {
                      addToCart(product);
                      setTimeout(() => setShowGoToCart(true), 800);
                    }}
                    disabled={addStatus === "adding"}
                    className={`
          relative w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all hover:cursor-pointer duration-300
          bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo}
          hover:shadow-2xl flex items-center justify-center gap-3 text-lg
          ${addStatus === "adding" ? "opacity-90 cursor-not-allowed" : ""}
        `}
                    aria-label="Add to cart"
                  >
                    {/* Default */}
                    <span
                      className={`flex items-center gap-3 ${
                        addStatus !== "idle" ? "opacity-0" : ""
                      }`}
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
                          strokeWidth="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Add to Cart
                    </span>

                    {/* Adding */}
                    {addStatus === "adding" && (
                      <span className="absolute inset-0 flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Adding…
                      </span>
                    )}

                    {/* Added */}
                    {addStatus === "added" && (
                      <span className="absolute inset-0 flex items-center justify-center gap-2">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Added!
                      </span>
                    )}
                  </motion.button>

                  {/* GO TO CART BUTTON */}
                  {showGoToCart && (
                    <button
                      onClick={() => navigate("/cartpage")}
                      className={`mx-auto mt-4 md:mt-0 w-auto py-4 px-8 flex items-center justify-center rounded-xl font-semibold text-white bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} hover:cursor-pointer shadow-md transition`}
                    >
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Go to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="p-1 mt-[7px]">
        <RatingScreen reviews={reviews} />
      </div>
      {/* <div className="p-1 mt-[7px]">
        <SuggestProductScreen />
      </div> */}

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
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
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
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
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
        {showCart && orderType === "Service" && (
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
                    Service Cart Pending!
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    You need to Finish or Delete from Cart.
                  </p>
                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => {
                        setShowCart(false);
                        navigate("/cartpage");
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Go to cart"
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
                      Service Cart Pending!
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      You need to Finish or Delete from Cart.
                    </p>
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => {
                          setShowCart(false);
                          navigate("/cartpage");
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-gray-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-gray-700 transition-all duration-200 hover:cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Go to cart"
                      >
                        Cart
                      </motion.button>
                      <motion.button
                        onClick={() => setShowCart(false)}
                        className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200 hover:cursor-pointer"
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
  );
};

export default ProductMainPage;
