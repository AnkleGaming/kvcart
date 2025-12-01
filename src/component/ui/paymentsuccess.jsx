import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import UpdateOrder from "../../backend/order/updateorder";

const PaymentSuccess = () => {
  const [countdown, setCountdown] = useState(4);
  const [paymentStatus, setPaymentStatus] = useState("CHECKING");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");

    if (!orderId) {
      console.error("Order ID missing in URL!");
      return;
    }

    async function verifyAndUpdate() {
      try {
        // 🔍 1. VERIFY PAYMENT
        const res = await fetch(
          `https://ecommerce.anklegaming.live/APIs/APIs.asmx/VerifyPayment?order_id=${orderId}`
        );

        const text = await res.text();

        // Because .asmx returns XML-wrapped JSON sometimes, extract JSON
        const jsonStr = text.replace(/<\/?string[^>]*>/g, "");
        const data = JSON.parse(jsonStr);

        console.log("Verify Payment Result:", data);

        // 🔵 2. CHECK STATUS
        if (data.status === "PAID") {
          setPaymentStatus("SUCCESS");

          // 🟢 UPDATE ORDER → Placed
          await UpdateOrder({
            OrderID: orderId,
            Price: 0,
            Quantity: 1,
            Status: "Placed",
            PaymentMethod: "Online Payment",
          });
        } else {
          setPaymentStatus("FAILED");

          // 🔴 UPDATE ORDER → Cancelled
          await UpdateOrder({
            OrderID: orderId,
            Price: 0,
            Quantity: 1,
            Status: "Cancelled",
            PaymentMethod: "Payment Failed",
          });
        }
      } catch (err) {
        console.error("Verify API Error:", err);
        setPaymentStatus("FAILED");

        // If verify itself fails, mark order as failed
        await UpdateOrder({
          OrderID: orderId,
          Status: "Cancelled",
          PaymentMethod: "Payment Failed",
        });
      }

      // 🔄 Start redirect countdown
      let timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = "/";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    verifyAndUpdate();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
        {paymentStatus === "SUCCESS" && (
          <>
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-green-700">
              Payment Successful
            </h1>
            <p className="text-gray-600 mt-2">
              Your order has been placed successfully.
            </p>
          </>
        )}

        {paymentStatus === "FAILED" && (
          <>
            <XCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-red-700">Payment Failed</h1>
            <p className="text-gray-600 mt-2">
              The payment could not be completed. Order was cancelled.
            </p>
          </>
        )}

        <p className="mt-6 text-gray-500">
          Redirecting in <span className="font-bold">{countdown}</span>{" "}
          seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
