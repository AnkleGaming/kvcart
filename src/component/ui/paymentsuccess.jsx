import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const [countdown, setCountdown] = useState(4); // seconds

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");

    // Optional: verify payment (you can remove if you trust the gateway)
    if (orderId) {
      fetch(`http://localhost:5000/api/verify?order_id=${orderId}`)
        .then((res) => res.json())
        .catch(() =>
          console.log("Skipping verification or failed (still redirecting)")
        );
    }

    // Countdown + Auto Redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Change this to your actual homepage
          window.location.href = "/"; // or "https://yourstore.com", "/dashboard", etc.
          return 0;
        }
        return prev - 1;
      });
    }, 100000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
        {/* Success Icon with subtle animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <CheckCircle className="w-24 h-24 text-green-500 animate-ping absolute" />
            <CheckCircle className="w-24 h-24 text-green-600 relative" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Thank you for your purchase. Your order is confirmed.
        </p>

        {/* Countdown */}
        <div className="text-lg text-gray-500">
          Redirecting you home in{" "}
          <span className="font-bold text-green-600 text-2xl">{countdown}</span>{" "}
          seconds...
        </div>

        {/* Optional manual redirect */}
        <div className="mt-10">
          <a href="/" className="text-green-600 font-semibold hover:underline">
            ← Back to Home Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
