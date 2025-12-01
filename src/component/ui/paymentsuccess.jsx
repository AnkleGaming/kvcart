import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom"; // This is the BEST way
import VerifyPayment from "../../backend/paymentgateway/verifypayment";
import UpdateOrder from "../../backend/order/updateorder";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams(); // Works with HashRouter & BrowserRouter
  const orderId = searchParams.get("order_id");

  const [countdown, setCountdown] = useState(5);
  const [paymentStatus, setPaymentStatus] = useState("CHECKING"); // CHECKING | SUCCESS | FAILED

  useEffect(() => {
    if (!orderId) {
      console.error("Order ID missing in URL:", window.location.href);
      setPaymentStatus("FAILED");
      startRedirectCountdown();
      return;
    }

    console.log("Order ID detected:", orderId);

    let isMounted = true;

    const verifyAndUpdate = async () => {
      try {
        const result = await VerifyPayment(orderId);

        // If API failed or returned null
        if (!result || !result.success) {
          throw new Error(
            result?.data?.message || "Payment verification failed"
          );
        }

        const { status } = result;

        if (!isMounted) return;

        if (status === "PAID") {
          setPaymentStatus("SUCCESS");

          await UpdateOrder({
            OrderID: orderId,
            Price: 0,
            Quantity: 1,
            Status: "Placed",
            PaymentMethod: "Online Payment",
          });

          console.log("Order marked as PLACED");
        } else {
          setPaymentStatus("FAILED");

          await UpdateOrder({
            OrderID: orderId,
            Price: 0,
            Quantity: 1,
            Status: "Cancelled",
            PaymentMethod: "Payment Failed",
          });

          console.log("Order marked as CANCELLED");
        }
      } catch (err) {
        console.error("Payment verification or order update failed:", err);

        if (isMounted) {
          setPaymentStatus("FAILED");

          // Try to cancel the order even if verification failed
          try {
            await UpdateOrder({
              OrderID: orderId,
              Status: "Cancelled",
              PaymentMethod: "Verification Failed",
            });
          } catch (updateErr) {
            console.error("Could not cancel order:", updateErr);
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
            window.location.href = "/"; // Go to homepage
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup on unmount
      return () => clearInterval(timer);
    };

    verifyAndUpdate();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [orderId]); // Re-run if orderId changes

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-2xl text-center">
        {/* Loading State */}
        {paymentStatus === "CHECKING" && (
          <>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h1 className="text-3xl font-bold text-gray-800">
              Verifying Payment...
            </h1>
            <p className="text-gray-600 mt-4">
              Please do not refresh or close this page.
            </p>
          </>
        )}

        {/* Success State */}
        {paymentStatus === "SUCCESS" && (
          <>
            <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-green-700">
              Payment Successful!
            </h1>
            <p className="text-gray-700 mt-4 text-lg">
              Thank you! Your order{" "}
              <span className="font-mono font-bold">{orderId}</span> has been
              placed.
            </p>
          </>
        )}

        {/* Failed State */}
        {paymentStatus === "FAILED" && (
          <>
            <XCircle className="w-24 h-24 text-red-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-red-700">Payment Failed</h1>
            <p className="text-gray-700 mt-4 text-lg">
              We couldn't process your payment. Order{" "}
              <span className="font-mono">{orderId}</span> was cancelled.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              You can try again from your orders page.
            </p>
          </>
        )}

        {/* Countdown */}
        <p className="mt-10 text-lg text-gray-600">
          Redirecting to homepage in{" "}
          <span className="font-bold text-2xl text-blue-600">{countdown}</span>{" "}
          seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
