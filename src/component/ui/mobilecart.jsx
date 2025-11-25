// src/components/cart/MobileCartSummary.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Colors from "../../core/constant";
import GetOrder from "../../backend/order/getorderid";
import ShowOrders from "../../backend/order/showorder";
import UpdateOrderstatus from "../../backend/order/updateorder";

const MobileCartSummary = () => {
  const [orders, setOrders] = useState([]); // Normal cart (Pending)
  const [pending1, setPending1] = useState([]); // Reorder suggestions (Pending1)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const UserID = localStorage.getItem("userPhone");

  // Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Fetch normal cart
  const fetchCart = useCallback(async () => {
    if (!UserID) return;
    try {
      const data = await GetOrder(UserID, "Pending");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setOrders([]);
    }
  }, [UserID]);

  // Fetch reorder suggestions
  const fetchPending1 = useCallback(async () => {
    if (!UserID) return;
    try {
      const data = await ShowOrders({
        orderid: "",
        UserID,
        VendorPhone: "",
        Status: "Pending1",
      });
      setPending1(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch pending1:", err);
      setPending1([]);
    }
  }, [UserID]);

  useEffect(() => {
    if (!UserID) {
      setOrders([]);
      setPending1([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCart(), fetchPending1()]);
      setLoading(false);
    };
    load();
  }, [UserID, fetchCart, fetchPending1]);

  // Calculations
  const cartQty = useMemo(
    () => orders.reduce((s, i) => s + Number(i.Quantity || 0), 0),
    [orders]
  );
  const pending1Qty = useMemo(
    () => pending1.reduce((s, i) => s + Number(i.Quantity || 0), 0),
    [pending1]
  );
  const cartTotal = useMemo(
    () =>
      orders.reduce(
        (a, i) => a + Number(i.Price || 0) * Number(i.Quantity || 0),
        0
      ),
    [orders]
  );
  const pending1Total = useMemo(
    () =>
      pending1.reduce(
        (a, i) => a + Number(i.Price || 0) * Number(i.Quantity || 0),
        0
      ),
    [pending1]
  );

  const hasReorder = pending1.length > 0;
  const hasNormalCart = orders.length > 0;

  if (loading || (!hasReorder && !hasNormalCart)) return null;

  // Handlers
  const handleProceed = () => {
    navigate("/paymentpage", {
      state: { cartItems: orders, total: cartTotal, totalDiscount: 0 },
    });
  };

  const handlecart = () => {
    navigate("/cartpage");
  };

  const openPaymentModal = () => {
    const orderId = pending1[0]?.OrderID || "N/A";
    setPaymentOrderId(orderId);
    setPaymentAmount(pending1Total);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (orderId, amount, mode) => {
    try {
      await UpdateOrderstatus({
        OrderID: orderId,
        Status: "Onservice",
        VendorPhone: UserID,
        PaymentMethod: "",
      });

      alert("Payment confirmed! Order is now in service.");
      navigate("/");
    } catch (error) {
      console.error("Payment update failed:", error);
      alert("Failed to confirm payment.");
    }
  };

  // Cart Badge Component
  const CartWithBadge = ({ count }) => (
    <div className="relative p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg border border-white/30">
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        <circle cx="8" cy="21" r="2" />
        <circle cx="20" cy="21" r="2" />
      </svg>
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center shadow-lg border-2 border-white"
        >
          {count > 99 ? "99+" : count}
        </motion.div>
      )}
    </div>
  );

  // Payment Modal
  const PaymentModal = ({ isOpen, onClose, orderId, amount, onConfirm }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <IndianRupee className="text-blue-600" size={36} />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Payment By?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Confirm ₹{amount.toFixed(2)} paid for Order #{orderId}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    onConfirm(orderId, amount, "Cash");
                    onClose();
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition"
                >
                  Cash
                </button>
                <button
                  onClick={() => {
                    onConfirm(orderId, amount, "Online");
                    onClose();
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition"
                >
                  Online
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      {/* Bottom Sticky Bar */}
      <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-6 pt-4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none">
        <div className="pointer-events-auto space-y-3">
          {/* Reorder: Update Items + Badge */}
          {hasReorder && (
            <div className="flex items-center gap-3">
              <button
                onClick={openPaymentModal}
                className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-medium text-lg shadow-2xl active:scale-98 transition-all border border-white/30"
              >
                Update Items ({pending1Qty} Item{pending1Qty !== 1 ? "s" : ""})
              </button>
              <button onClick={handlecart}>
                <CartWithBadge count={cartQty} />
              </button>
            </div>
          )}

          {/* Normal Cart: Proceed Button */}
          {hasNormalCart && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleProceed}
                className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-medium text-lg shadow-2xl active:scale-98 transition-all border border-white/30"
              >
                Cart Items ({cartQty} Item{cartQty !== 1 ? "s" : ""})
              </button>
              <button onClick={handlecart}>
                <CartWithBadge count={cartQty} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderId={paymentOrderId}
        amount={paymentAmount}
        onConfirm={handlePaymentComplete}
      />
    </>
  );
};

export default MobileCartSummary;
