const Razorpay = require("razorpay");

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        status: "error",
        message: "Amount and OrderID are required",
      });
    }

    const razorpay = new Razorpay({
      key_id: "rzp_live_sdP67bgbbdrRid", // ⭐ Your Live Key
      key_secret: "i10gp-pi2qb", // ⭐ Your Live Secret
    });

    const options = {
      amount: Number(amount) * 100, // Convert to paise
      currency: "INR",
      receipt: `order_${orderId}`, // ⭐ Link your internal OrderID
      notes: {
        internalOrderId: orderId, // Saved in Razorpay Dashboard also
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      status: "success",
      order,
    });
  } catch (err) {
    console.error("Razorpay Error:", err);
    return res.status(500).json({
      status: "error",
      message: "Unable to create Razorpay order",
    });
  }
};

module.exports = createRazorpayOrder;
