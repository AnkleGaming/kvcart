// src/components/cart/CartMain.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import Colors from "../../core/constant";
import CartPage from "./cartpage";

const CartMain = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Floating Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="md:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 shadow-lg border-b border-white/20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start gap-3 h-16">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="group p-3 rounded-full bg-white/60 backdrop-blur-md shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 border border-white/40"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-indigo-600 transition" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-1">
              <h1
                className={`text-2xl font-bold bg-${Colors.primaryMain} bg-clip-text text-transparent`}
              >
                Your Cart
              </h1>
            </div>

            {/* Empty Space */}
            <div className="w-12" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
        >
          {/* Inner Glow Effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 via-purple-100/20 to-pink-100/20 rounded-3xl" />

            {/* Cart Page */}
            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
              <CartPage />
            </div>
          </div>
        </motion.div>

        {/* Help Tip */}
      </main>
    </div>
  );
};

export default CartMain;
