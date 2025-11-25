// src/components/cart/CartPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Minus, Plus, Trash2, X, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // ← Required for modal animation
import GetOrder from "../../backend/order/getorderid";
import DeleteOrder from "../../backend/order/deleteorder";
import Colors from "../../core/constant";
import ShowOrders from "../../backend/order/showorder";
import UpdateOrderQuantity from "../../backend/order/updateorderquantity";
import UpdateOrderstatus from "../../backend/order/updateorder";
import CartSummary from "./cartsummury";

const CartPage = () => {
  const [orders, setOrders] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [pending1, setPending1] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("cart");
  const UserID = localStorage.getItem("userPhone");
  const navigate = useNavigate();

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Fetch cart orders (Pending)
  const fetchCartOrders = useCallback(async () => {
    if (!UserID) {
      setOrders([]);
      return;
    }
    setIsCartLoading(true);
    try {
      const data = await GetOrder(UserID, "Pending");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setOrders([]);
    } finally {
      setIsCartLoading(false);
    }
  }, [UserID]);

  // Fetch Pending1 (vendor suggestions)
  const fetchPending1Orders = useCallback(async () => {
    if (!UserID) {
      setPending1([]);
      return;
    }
    setPendingLoading(true);
    try {
      const data = await ShowOrders({
        orderid: "",
        UserID,
        VendorPhone: "",
        Status: "Pending1",
      });
      setPending1(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pending1 orders:", error);
      setPending1([]);
    } finally {
      setPendingLoading(false);
    }
  }, [UserID]);

  useEffect(() => {
    fetchCartOrders();
    fetchPending1Orders();
  }, [fetchCartOrders, fetchPending1Orders]);

  useEffect(() => {
    if (Array.isArray(pending1) && pending1.length > 0) {
      setActiveTab("reorder");
    } else {
      setActiveTab("cart");
      fetchCartOrders();
    }
  }, [pending1]);

  const canShowCart = pending1.length === 0;
  const hiddenCartBecauseReorder = pending1.length > 0;

  // Remove item
  const handleRemove = async (id) => {
    if (!id) return;
    setDeletingItemId(id);
    try {
      if (activeTab === "cart" && canShowCart) {
        setOrders((prev) =>
          prev.filter((item) => String(item.ID) !== String(id))
        );
        await DeleteOrder(id);
        await fetchCartOrders();
      } else {
        setPending1((prev) =>
          prev.filter((item) => String(item.ID) !== String(id))
        );
        await DeleteOrder(id);
        await fetchPending1Orders();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      await fetchCartOrders();
      await fetchPending1Orders();
      alert("Failed to remove item. Please try again.");
    } finally {
      setDeletingItemId(null);
    }
  };

  // Update quantity
  const handleUpdateQuantity = async (rowId, newQty) => {
    if (!rowId) return;

    const orderToUpdate =
      activeTab === "cart" && canShowCart
        ? orders.find((item) => String(item.ID) === String(rowId))
        : pending1.find((item) => String(item.ID) === String(rowId));

    if (!orderToUpdate) return;

    const clampedQty = Math.max(1, Number(newQty));

    if (activeTab === "cart" && canShowCart) {
      setOrders((prev) =>
        prev.map((item) =>
          String(item.ID) === String(rowId)
            ? { ...item, Quantity: clampedQty }
            : item
        )
      );
    } else {
      setPending1((prev) =>
        prev.map((item) =>
          String(item.ID) === String(rowId)
            ? { ...item, Quantity: clampedQty }
            : item
        )
      );
    }

    setUpdatingItemId(rowId);

    try {
      await UpdateOrderQuantity({
        Id: String(orderToUpdate.ID),
        OrderID: orderToUpdate.OrderID || "",
        Price: String(orderToUpdate.Price || "0"),
        Quantity: String(clampedQty),
      });

      activeTab === "cart" && canShowCart
        ? await fetchCartOrders()
        : await fetchPending1Orders();
    } catch (err) {
      console.error("Update quantity failed:", err);
      await fetchCartOrders();
      await fetchPending1Orders();
      alert("Failed to update quantity. Please try again.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Totals
  const cartTotal = useMemo(
    () =>
      (orders || []).reduce(
        (a, i) => a + Number(i.Price || 0) * Number(i.Quantity || 0),
        0
      ),
    [orders]
  );

  const pending1Total = useMemo(
    () =>
      (pending1 || []).reduce(
        (a, i) => a + Number(i.Price || 0) * Number(i.Quantity || 0),
        0
      ),
    [pending1]
  );

  const totalCartItemsQty = useMemo(
    () => orders.reduce((sum, item) => sum + Number(item.Quantity || 0), 0),
    [orders]
  );

  const totalPending1ItemsQty = useMemo(
    () => pending1.reduce((sum, item) => sum + Number(item.Quantity || 0), 0),
    [pending1]
  );

  const currentItems = activeTab === "cart" && canShowCart ? orders : pending1;
  const currentTotal =
    activeTab === "cart" && canShowCart ? cartTotal : pending1Total;
  const currentItemCount =
    activeTab === "cart" && canShowCart
      ? totalCartItemsQty
      : totalPending1ItemsQty;

  const handleProceed = () => {
    if (activeTab === "cart" && canShowCart) {
      navigate("/paymentpage", {
        state: { cartItems: orders, total: cartTotal, totalDiscount: 0 },
      });
    } else {
      navigate("/paymentpage", {
        state: { cartItems: pending1, total: pending1Total, isReorder: true },
      });
    }
  };

  // Open Payment Modal when "Update Items" is clicked
  const openPaymentModal = () => {
    const orderId = pending1[0]?.OrderID || "N/A";
    setPaymentOrderId(orderId);
    setPaymentAmount(pending1Total);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (orderId, amount, mode) => {
    try {
      // 1. Update Order Status (PaymentMethod)
      const updateResponse = await UpdateOrderstatus({
        OrderID: orderId,
        Price: "",
        Quantity: "",
        Status: "Onservice",
        VendorPhone: UserID,
        BeforVideo: "",
        AfterVideo: "",
        OTP: "",
        PaymentMethod: "",
      });

      alert("Payment Complited...");

      window.location.reload();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment process failed.");
    }
  };

  const pending1RemoveAllowed = () => pending1.length > 1;

  // Payment Confirmation Modal Component
  const PaymentModal = ({ isOpen, onClose, orderId, amount, onConfirm }) => {
    return (
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IndianRupee className="text-blue-600" size={32} />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Payment By?
              </h3>
              <p className="text-sm text-gray-600 mb-5">
                Confirm ₹{amount} has been paid for Order #{orderId}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onConfirm(orderId, amount, "Cash");
                    onClose();
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-medium hover:shadow-md transition"
                >
                  Cash
                </button>
                <button
                  onClick={() => {
                    onConfirm(orderId, amount, "Online");
                    onClose();
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 rounded-xl font-medium hover:shadow-md transition"
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
      <div className="w-full md:w-80 lg:w-96 mx-auto bg-white rounded-2xl shadow-lg overflow-hidden font-sans">
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b ${Colors.borderGray}`}>
          <h2
            className={`text-xl sm:text-2xl font-bold ${Colors.textGrayDark} mb-2 sm:mb-3`}
          >
            Your Cart
          </h2>
        </div>

        {/* Cart Body */}
        <div
          className="px-4 sm:px-6"
          style={{
            maxHeight: "calc(100vh - 460px)",
            overflowY: "auto",
            paddingRight: "8px",
          }}
        >
          {activeTab === "cart" && !hiddenCartBecauseReorder ? (
            /* Normal Cart */
            <div className="mb-8">
              {isCartLoading ? (
                <div className="flex justify-center items-center py-4">
                  <div
                    className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${Colors.primaryFrom.replace(
                      "from",
                      "border"
                    )}`}
                  />
                  <p className={`ml-3 ${Colors.textMuted}`}>Loading cart...</p>
                </div>
              ) : orders.length === 0 ? (
                <p className={`${Colors.textMuted}`}>Your cart is empty.</p>
              ) : (
                orders.map((item) => (
                  <div
                    key={item.ID}
                    className={`flex justify-between items-start mt-4 mb-4 pb-4 border-b ${Colors.divideGray}`}
                  >
                    <div className="flex-grow pr-3">
                      <p
                        className={`text-sm sm:text-base font-semibold ${Colors.textGrayDark}`}
                      >
                        {item.ItemName}
                      </p>
                      <button
                        onClick={() => handleRemove(item.ID)}
                        disabled={deletingItemId === item.ID}
                        className={`flex items-center mt-2 text-sm ${Colors.textMuted}`}
                      >
                        <Trash2 size={14} className="mr-1" />
                        {deletingItemId === item.ID ? "Removing..." : "Remove"}
                      </button>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 gap-2">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.ID,
                              Number(item.Quantity) - 1
                            )
                          }
                          disabled={
                            Number(item.Quantity) <= 1 ||
                            updatingItemId === item.ID
                          }
                        >
                          <Minus size={16} />
                        </button>
                        {updatingItemId === item.ID ? (
                          <div className="w-6 text-center">
                            <div
                              className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 ${Colors.primaryFrom.replace(
                                "from",
                                "border"
                              )}`}
                            />
                          </div>
                        ) : (
                          <span className="w-6 text-center">
                            {item.Quantity}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.ID,
                              Number(item.Quantity) + 1
                            )
                          }
                          disabled={updatingItemId === item.ID}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <p
                        className={`text-base sm:text-lg font-bold bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} bg-clip-text text-transparent mt-2`}
                      >
                        ₹
                        {(
                          Number(item.Price || 0) * Number(item.Quantity || 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Reorder (Pending1) */
            <div className="mb-8">
              {pendingLoading ? (
                <div className="flex justify-center items-center py-4">
                  <div
                    className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${Colors.primaryFrom.replace(
                      "from",
                      "border"
                    )}`}
                  />
                  <p className={`ml-3 ${Colors.textMuted}`}>
                    Loading reorder...
                  </p>
                </div>
              ) : pending1.length === 0 ? (
                <p className={`${Colors.textMuted}`}>No reorder suggestions.</p>
              ) : (
                pending1.map((item) => (
                  <div
                    key={item.ID}
                    className={`flex justify-between items-start mb-4 pb-4 border-b ${Colors.divideGray}`}
                  >
                    <div className="flex-grow pr-3">
                      <p
                        className={`text-sm sm:text-base font-semibold ${Colors.textGrayDark}`}
                      >
                        {item.ItemName}
                      </p>
                      <button
                        onClick={() => handleRemove(item.ID)}
                        disabled={
                          deletingItemId === item.ID || !pending1RemoveAllowed()
                        }
                        className={`flex items-center mt-2 text-sm ${
                          Colors.textMuted
                        } ${
                          !pending1RemoveAllowed()
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title={
                          !pending1RemoveAllowed()
                            ? "Cannot remove last vendor-suggested item"
                            : undefined
                        }
                      >
                        <Trash2 size={14} className="mr-1" />
                        {deletingItemId === item.ID ? "Removing..." : "Remove"}
                      </button>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 gap-2">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.ID,
                              Number(item.Quantity) - 1
                            )
                          }
                          disabled={
                            Number(item.Quantity) <= 1 ||
                            updatingItemId === item.ID
                          }
                        >
                          <Minus size={16} />
                        </button>
                        {updatingItemId === item.ID ? (
                          <div className="w-6 text-center">
                            <div
                              className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 ${Colors.primaryFrom.replace(
                                "from",
                                "border"
                              )}`}
                            />
                          </div>
                        ) : (
                          <span className="w-6 text-center">
                            {item.Quantity}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.ID,
                              Number(item.Quantity) + 1
                            )
                          }
                          disabled={updatingItemId === item.ID}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <p
                        className={`text-base sm:text-lg font-bold bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} bg-clip-text text-transparent mt-2`}
                      >
                        ₹
                        {(
                          Number(item.Price || 0) * Number(item.Quantity || 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Smart Summary using CartSummary Component */}
        {currentItems.length > 0 && (
          <CartSummary
            total={currentTotal}
            cartItems={currentItems}
            customButtonText={
              activeTab === "reorder" || hiddenCartBecauseReorder
                ? `Update Items (${currentItemCount} ${
                    currentItemCount === 1 ? "Item" : "Items"
                  })`
                : undefined
            }
            customOnClick={
              activeTab === "reorder" || hiddenCartBecauseReorder
                ? openPaymentModal
                : undefined
            }
          />
        )}
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

export default CartPage;
