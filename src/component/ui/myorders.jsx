// components/MyOrder.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShowOrders from "../../backend/order/showorder";
import ReviewModal from "./insertproductreview";
import Colors from "../../core/constant";
import InsertProductReview from "../../backend/getproduct/insertproductreview";
import GetUser from "../../backend/authentication/getuser";
import {
  Package,
  User,
  MapPin,
  Clock,
  Calendar,
  IndianRupee,
  AlertCircle,
  XCircle,
  CheckCircle,
  Clock3,
} from "lucide-react";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState("Placed");
  const UserID = localStorage.getItem("userPhone");
  const [user, setUser] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const fetchedUser = await GetUser(UserID);
        console.log("Fetched user from the MyOrder ", fetchedUser[0].Fullname);
        setUser(fetchedUser || []);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    if (UserID) fetchuser();
  }, [UserID]);

  const handleInsertProductReview = async (productName, reviewData) => {
    try {
      const response = await InsertProductReview(
        productName,
        productName, // Product ID or Name
        reviewData.review, // REVIEW TEXT from modal
        reviewData.rating,
        user[0].Fullname, // Name
        user[0].Image,
        UserID // phone
      );

      console.log("API Response:", response);
    } catch (error) {
      console.error("Error during inserting review:", error);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!UserID) return;

      setIsLoading(true);
      setErrorMsg("");
      try {
        // map UI filter labels to API status values
        const statusMap = {
          Placed: "Placed", // <--- when filter is "Accepted" send "done"
          Cancelled: "Cancelled",
          Completed: "completed",

          // add more mappings if your API expects different keywords
        };

        // use mapping, but fall back to filter string if not present
        const apiStatus = statusMap.hasOwnProperty(filter)
          ? statusMap[filter]
          : filter;

        const data = await ShowOrders({
          orderid: "",
          UserID,
          VendorPhone: "",
          Status: apiStatus,
        });

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setErrorMsg("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [UserID, filter]);

  return (
    <div className={`${Colors.bgGray}`}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-8xl mx-auto px-2 py-2">
          <div className="mt-4 flex justify-center">
            <div className="inline-flex bg-gray-50 rounded-xl shadow-inner p-4 overflow-x-auto scrollbar-hide gap-1">
              {["Placed", "Cancelled", "Completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 sm:px-5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap min-w-[80px] sm:min-w-[100px] ${
                    filter === f
                      ? `bg-gradient-to-r ${Colors.gradientFrom} ${Colors.gradientTo} text-white shadow-md`
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-1 pb-2 pt-1">
        {isLoading ? (
          <LoadingSkeleton />
        ) : errorMsg ? (
          <ErrorMessage message={errorMsg} />
        ) : (
          <OrderCards
            orders={orders}
            filter={filter}
            onReviewClick={openReviewModal} // Pass handler down
          />
        )}
      </div>

      {/* Modal - Only one instance, outside the list */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={closeReviewModal}
        orderId={selectedOrder?.OrderID}
        itemName={selectedOrder?.ItemName}
        onSubmit={(reviewData) => {
          handleInsertProductReview(selectedOrder?.ItemName, reviewData);
          closeReviewModal();
        }}
      />
    </div>
  );
};

// ==========================
// Responsive Order Cards
// ==========================
const OrderCards = ({ orders = [], filter, onReviewClick }) => {
  const statusConfig = {
    Placed: { icon: Clock3, color: "bg-yellow-100 text-yellow-800" },
    Cancelled: { icon: XCircle, color: "bg-red-100 text-red-800" },
    Completed: { icon: CheckCircle, color: "bg-green-100 text-green-800" },
    Pending: { icon: AlertCircle, color: "bg-gray-100 text-gray-700" },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders =
    filter === "Placed"
      ? orders
      : orders.filter(
          (o) => (o.Status || "Pending").toLowerCase() === filter.toLowerCase()
        );

  if (!filteredOrders.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <AlertCircle size={56} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">No {filter} orders found.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
      <AnimatePresence>
        {filteredOrders.map((order, idx) => {
          const status = order.Status || "Pending";
          const statusKey =
            Object.keys(statusConfig).find(
              (k) => k.toLowerCase() === status.toLowerCase()
            ) || "Pending";

          const StatusIcon = statusConfig[statusKey].icon;
          const statusColor = statusConfig[statusKey].color;

          return (
            <motion.div
              layout
              key={order.OrderID || order.ID}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg flex items-center gap-2">
                      <Package size={18} /> #{order.OrderID}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{order.UserID}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColor}`}
                  >
                    <StatusIcon size={14} /> {statusKey}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service</span>{" "}
                    <span className="font-medium truncate max-w-[60%]">
                      {order.ItemName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>{" "}
                    <span className="font-medium">{order.OrderType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price</span>{" "}
                    <span className="font-bold text-green-600">
                      ₹{order.Price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Qty</span>{" "}
                    <span>{order.Quantity}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t">
                    <span className="text-gray-600">Ordered</span>{" "}
                    <span>{formatDate(order.OrderDatetime)}</span>
                  </div>
                </div>

                {/* Show Button Only for Completed Orders */}
                {filter === "Completed" && statusKey === "Completed" && (
                  <button
                    onClick={() => onReviewClick(order)}
                    className={`mt-5 w-full bg-${
                      Colors.primaryMain || "blue-600"
                    } hover:bg-${
                      Colors.primaryMain
                        ? Colors.primaryMain + "/90"
                        : "blue-700"
                    } text-white font-semibold py-3 rounded-xl transition-all hover:cursor-pointer `}
                  >
                    Add Review
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// ==========================
// Responsive Loading Skeleton
// ==========================
const LoadingSkeleton = () => (
  <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 animate-pulse border border-gray-100"
      >
        <div className="flex justify-between mb-3 sm:mb-4">
          <div>
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-28 sm:w-32 mb-2"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-5 sm:h-6 bg-gray-200 rounded-full w-16 sm:w-20"></div>
        </div>
        <div className="bg-gray-200 h-40 sm:h-48 rounded-xl mb-3 sm:mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/6"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/6"></div>
        </div>
      </div>
    ))}
  </div>
);

// ==========================
// Error Message
// ==========================
const ErrorMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-12 sm:py-16 mt-6"
  >
    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
    <p className="text-red-600 font-medium">{message}</p>
  </motion.div>
);

export default MyOrder;
