// src/components/cart/cartsummury.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Colors from "../../core/constant";

const CartSummary = ({
  total,
  cartItems,
  customButtonText, // Optional: override button text
  customOnClick, // Optional: override click behavior
}) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Calculate total discount (if DiscountPrice exists)
  const totalDiscount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const original = Number(item.Price) || 0;
      const discounted = Number(item.DiscountPrice) || original;
      const qty = Number(item.Quantity) || 1;
      return acc + (original - discounted) * qty;
    }, 0);
  }, [cartItems]);

  // Total quantity of items (e.g. 2 shirts + 3 pants = 5 items)
  const totalItemsQty = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.Quantity || 0), 0);
  }, [cartItems]);

  // Default click handler (navigate to payment)
  const handleClick =
    customOnClick ||
    (() => {
      navigate("/paymentpage", {
        state: {
          cartItems,
          total,
          totalDiscount,
        },
      });
    });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!cartItems || cartItems.length === 0) return null;
  // Desktop Summary (inside cart drawer)
  const DesktopSummary = () => (
    <div className="w-full p-5 bg-white border-t border-gray-200">
      <div className="space-y-3 mb-5">
        <div className="flex justify-between text-lg font-semibold text-gray-900">
          <span>
            {customButtonText?.includes("Update")
              ? "Reorder Total"
              : "Subtotal"}
          </span>
          <span>₹{Number(total).toFixed(2)}</span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>You Saved</span>
            <span>₹{totalDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Items</span>
          <span>
            {totalItemsQty} Item{totalItemsQty !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <button
        onClick={handleClick}
        className={`w-full bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3`}
      >
        <span>₹{Number(total).toFixed(2)}</span>
        <span className="border-l border-white/30 pl-3">
          {customButtonText || "Proceed to Pay →"}
        </span>
      </button>
    </div>
  );

  return <DesktopSummary />;
};

export default CartSummary;
