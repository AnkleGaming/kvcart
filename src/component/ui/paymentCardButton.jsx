// PaymentCardButton.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import GetOrder from "../../backend/order/getorderid";
import Colors from "../../core/constant";

const PaymentCardButton = ({
  itemTotal = 0,
  calculateTotal = () => itemTotal,
  onProceed,
  loading = false,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const UserID = localStorage.getItem("userPhone");
  const [isLoading, setIsLoading] = useState(false);

  const fmt = (v) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(v) || 0);
    } catch {
      return `₹${Number(v) || 0}`;
    }
  };

  const fetchCart = async () => {
    if (!UserID) return;
    setIsLoading(true);
    try {
      const data = await GetOrder(UserID, "Pending");
      console.log("Fetched cart items from the paymentbutton:", data);
      setCartItems(data);
    } catch (err) {
      console.error("Error fetching cart items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totalItems = cartItems.reduce(
    (acc, item) => acc + Number(item.Quantity || 1),
    0
  );

  const finalTotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.Price) * Number(item.Quantity),
      0
    );
  }, [cartItems]);

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-orange-50`}>
            <Sparkles className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
            <p className="text-xs text-gray-500">Review before proceeding</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Subtotal</div>
          <div className="text-lg font-semibold text-orange-600">
            {fmt(finalTotal)}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex justify-between items-center">
          <span className="font-medium">Items Total</span>
          <span className="text-gray-900 font-semibold">{fmt(finalTotal)}</span>
        </div>

        <hr className="my-2 border-gray-200" />

        <div className="text-right">
          <div className="text-sm text-gray-500">
            Subtotal ({totalItems} items)
          </div>
          <div className="text-lg font-semibold text-orange-600">
            {fmt(finalTotal)}
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      {/* <div className="mt-5">
        <button
          onClick={onProceed}
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium shadow bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Proceed to Pay"}
        </button>
      </div> */}
    </div>
  );
};

export default PaymentCardButton;
