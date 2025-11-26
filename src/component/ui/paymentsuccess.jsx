import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", paddingTop: "100px" }}>
      <h1 style={{ color: "green", fontSize: "2rem" }}>
        Payment Successful 🎉
      </h1>
      <p>You will be redirected to the home page shortly.</p>
    </div>
  );
};

export default PaymentSuccess;
