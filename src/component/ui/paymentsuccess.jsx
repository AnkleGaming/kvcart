import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import VerifyPayment, {
  PaymentVerifyModel,
} from "../../backend/paymentgateway/verifypayment"; // Update this path
import UpdateOrder from "../../backend/order/updateorder";

const PaymentSuccess = () => {
  const [countdown, setCountdown] = useState(5);
  const [paymentStatus, setPaymentStatus] = useState("CHECKING"); // CHECKING | SUCCESS | FAILED

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");

    if (!orderId) {
      console.error("Order ID missing in URL!");
      setPaymentStatus("FAILED");
      startRedirectCountdown();
      return;
    }

    let isMounted = true;

    const verifyAndUpdate = async () => {
      try {
        // Use your clean VerifyPayment function
        const result = await VerifyPayment(orderId);

        if (!result || !result.success) {
          throw new Error("Verification failed or invalid response");
        }

        const { status, data } = result;

        if (!isMounted) return;

        if (status === "PAID") {
          setPaymentStatus("SUCCESS");

          // Update order as Placed
          await UpdateOrder({
            OrderID: orderId,
            Price: 0,
            Quantity: 1,
            Status: "Placed",
            PaymentMethod: "Online Payment",
          });
        } else {
          setPaymentStatus("FAILED");

          // Update order as Cancelled
          await UpdateOrder({
            OrderID: orderId,
            Price: 0,
            Quantity: 1,
            Status: "Cancelled",
            PaymentMethod: "Payment Failed",
          });
        }
      } catch (err) {
        console.error("Payment verification or update failed:", err);
        if (isMounted) {
          setPaymentStatus("FAILED");

          // Still try to mark as cancelled on error
          try {
            await UpdateOrder({
              OrderID: orderId,
              Status: "Cancelled",
              PaymentMethod: "Payment Failed",
            });
          } catch (updateErr) {
            console.error("Failed to cancel order on error:", updateErr);
          }
        }
      } finally {
        if (isMounted) {
          startRedirectCountdown();
        }
      }
    };

    const startRedirectCountdown = () => {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = "/";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    verifyAndUpdate();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
        {paymentStatus === "CHECKING" && (
          <>
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h1 className="text-3xl font-bold text-gray-800">
              Verifying Payment...
            </h1>
            <p className="text-gray-600 mt-2">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {paymentStatus === "SUCCESS" && (
          <>
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-green-700">
              Payment Successful!
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
              The payment could not be completed. Your order was cancelled.
            </p>
          </>
        )}

        <p className="mt-8 text-lg text-gray-500">
          Redirecting to homepage in{" "}
          <span className="font-bold text-xl">{countdown}</span> seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
