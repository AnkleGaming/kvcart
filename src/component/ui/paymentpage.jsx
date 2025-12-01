import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Minus, Plus, Trash2, X, IndianRupee } from "lucide-react";
import { useLocation } from "react-router-dom";
import PaymentCard from "./paymentCard";
import PaymentCard2 from "./paymentCard2";
import PaymentCardButton from "./paymentCardButton";
import AddressFormCard from "./addressCard";
import { motion, AnimatePresence } from "framer-motion";
import UpdateOrder from "../../backend/order/updateorder";
import GetOrder from "../../backend/order/getorderid";
import Colors from "../../core/constant";
import PaymentGateway from "../../backend/paymentgateway/paymentgateway";

const PaymentPage = () => {
  const location = useLocation();
  const {
    cartItems: incomingCartItems = [],
    total = 0,
    discountfee = 0,
    title = "Selected Package",
  } = location.state || {};

  const itemTotal = Number(total) || 0;
  const navigate = useNavigate();

  const calculateTotal = () => {
    const rawTotal = itemTotal;
    return rawTotal > 0 ? rawTotal : 0;
  };

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("isLoggedIn") === "true"
      : false
  );
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState(
    Array.isArray(incomingCartItems) ? incomingCartItems : []
  );

  const UserID = localStorage.getItem("userPhone");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!UserID) {
        setOrderId(null);
        setCartItems([]);
        return;
      }

      try {
        const rawItems = await GetOrder(UserID, "Pending");
        console.log("Raw pending items from backend:", rawItems);

        if (!Array.isArray(rawItems) || rawItems.length === 0) {
          setOrderId(null);
          setCartItems([]);
          return;
        }

        // Group by OrderID (in case user has multiple pending orders — rare but safe)
        const ordersMap = {};

        rawItems.forEach((item) => {
          const oid = item.OrderID;
          if (!ordersMap[oid]) {
            ordersMap[oid] = {
              OrderID: oid,
              Address: item.Address,
              Slot: item.Slot,
              SlotDatetime: item.SlotDatetime,
              items: [],
            };
          }
          ordersMap[oid].items.push(item);
        });

        // Take the first (and usually only) pending order
        const orderIds = Object.keys(ordersMap);
        const firstOrderId = orderIds[0];
        const pendingOrder = ordersMap[firstOrderId];

        setOrderId(firstOrderId);

        // Convert backend items → clean cart items
        const cartItemsFromBackend = pendingOrder.items.map((item, index) => ({
          id: item.ID || `item-${index}`,
          name: item.ItemName || "Service",
          price: Number(item.Price) || 0,
          quantity: Number(item.Quantity) || 1,
          image: item.ItemImages || null,
          orderId: item.OrderID,
        }));

        setCartItems(cartItemsFromBackend);

        // Auto-fill address
        if (pendingOrder.Address) {
          setSelectedAddress({
            FullAddress: pendingOrder.Address,
            Name: "", // not available in this model
            Phone: UserID,
          });
        }

        console.log("Cart loaded successfully:", cartItemsFromBackend);
        console.log("Total items:", cartItemsFromBackend.length);
        console.log("Total quantity:", getTotalQuantity(cartItemsFromBackend));
      } catch (err) {
        console.error("Failed to load pending order:", err);
        setCartItems([]);
        setOrderId(null);
      }
    };

    fetchOrders();
  }, [UserID]);

  const getTotalQuantity = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  // 1. COD Handler (Updated for your backend response)
  const handleCOD = async () => {
    if (!selectedAddress || !orderId) {
      alert("Please select address and try again.");
      setShowAddressModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await UpdateOrder({
        OrderID: orderId,
        Price: calculateTotal(),
        Quantity: getTotalQuantity(),
        Address: selectedAddress.FullAddress,
        Status: "Placed",
        PaymentMethod: "Cash on Delivery",
      });

      // This is the correct way to check your backend response
      if (res && res.message && res.message === "Updated Successfully") {
        alert("Order placed successfully! Pay when expert arrives.");
        navigate("/");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  console.log("Rendering PaymentPage with OrderID:", orderId);

  const handleOnlinePayment = async () => {
    if (!selectedAddress) {
      alert("Please select an address before payment.");
      return;
    }

    if (!orderId) {
      alert("Order ID is missing! Cannot continue payment.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Use real backend Order ID
      const orderIdToPay = orderId;

      // 2️⃣ Call PaymentGateway API
      const orderResponse = await PaymentGateway(
        orderIdToPay,
        calculateTotal(),
        selectedAddress?.Name || "User",
        selectedAddress?.Email || "user@gmail.com",
        selectedAddress?.Phone || UserID,
        selectedAddress?.Phone || UserID
      );

      console.log("Cashfree Order Response:", orderResponse);

      // 3️⃣ Validate Response
      if (!orderResponse || !orderResponse.payment_link) {
        alert("Payment link missing from server!");
        return;
      }

      // 4️⃣ Redirect to Cashfree checkout
      window.location.href = orderResponse.payment_link;
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong while starting the payment.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    // Check if user can go back in history
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1); // go back in stack
    } else {
      navigate("/"); // fallback route
    }
  };

  const openPaymentModal = () => {
    setPaymentOrderId(orderId || "N/A");
    setPaymentAmount(calculateTotal());
    setShowPaymentModal(true);
  };

  const PaymentModal = ({ isOpen, onClose }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IndianRupee className="text-blue-600" size={32} />
            </div>

            <h3 className="text-lg font-semibold mb-2">Payment Method?</h3>
            <p className="text-sm text-gray-600 mb-5">
              Order #{orderId} • ₹{calculateTotal()}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onClose();
                  handleCOD();
                }}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition text-sm disabled:opacity-70"
              >
                {loading ? "Processing..." : "Cash on Delivery"}
              </button>

              <button
                onClick={() => {
                  onClose();
                  handleOnlinePayment();
                }}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition text-sm disabled:opacity-70"
              >
                Pay Online
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              You can pay when our expert arrives
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow-md z-10 border-b border-gray-200">
          <div className="flex items-center justify-start px-4 py-3 sm:px-6">
            <button
              onClick={goBack}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
              Checkout
            </h2>
          </div>
        </div>

        {/* <div className="pt-[35px] mb-[10px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Confirm details & complete payment
              </p>
              {orderId && (
                <p className="text-xs text-green-600 mt-1">
                  Current Order ID: {orderId}
                </p>
              )}
            </div>
          </div>
        </div> */}

        <div className="w-full mt-[30px] max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <PaymentCard
              onSelectAddress={() => setShowAddressModal(true)}
              onSelectSlot={() => setShowSlotFirst(true)}
              onProceed={() => openPaymentModal(calculateTotal())}
              selectedAddress={selectedAddress}
              calculateTotal={calculateTotal}
            />
          </div>

          <div className="flex flex-col gap-4 md:mt-[40px] mb-[70px]">
            <PaymentCard2
            // cartItems={cartItems}
            // calculateTotal={calculateTotal}
            // setCartItems={setCartItems}
            />
            <PaymentCardButton
            // itemTotal={itemTotal}
            // calculateTotal={calculateTotal}
            // onProceed={(amount, coupon) =>
            //   handleRazorpayPayment(amount, coupon)
            // }
            // loading={loading}
            />
          </div>

          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
          />
        </div>

        {showAddressModal && (
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-5"
                initial={{ y: 20, scale: 0.98 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 20, scale: 0.98 }}
              >
                <AddressFormCard
                  onSelectAddress={(address) => {
                    // normalize address
                    const formattedAddress = {
                      Name: address.Name || address.name || "",
                      Email: address.Email || address.email || "",
                      Phone: address.Phone || address.phone || "",
                      FullAddress:
                        address.FullAddress ||
                        `${address.Address || address.address || ""}, ${
                          address.City || address.city || ""
                        }, ${address.State || address.state || ""} - ${
                          address.PinCode || address.pincode || ""
                        }`,
                    };
                    setSelectedAddress(formattedAddress);
                    setShowAddressModal(false);
                  }}
                  onClose={() => setShowAddressModal(false)}
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
