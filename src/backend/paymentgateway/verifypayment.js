import axios from "axios";

// 🟦 Model Class for Verify Payment Response
class PaymentVerifyModel {
  constructor(success, status, data) {
    this.success = success; // true/false
    this.status = status; // PAID / FAILED / PENDING
    this.data = data; // Full Cashfree metadata object
  }

  static fromJson(json) {
    return new PaymentVerifyModel(
      json.success ?? false,
      json.status ?? "UNKNOWN",
      json.data ?? {}
    );
  }
}

// 🟩 API Function (Same style as PaymentGateway)
const VerifyPayment = async (orderId) => {
  if (!orderId) {
    console.error("VerifyPayment Error: orderId is required");
    return null;
  }

  // Create request body exactly as expected by .asmx
  const formData = new URLSearchParams();
  formData.append("order_id", orderId);

  try {
    // 🟧 Call .asmx API using POST (as required)
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/VerifyPayment",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        responseType: "text", // ensure XML comes as plain text
      }
    );

    let rawData = response.data;

    // 🟥 Extract JSON content inside <string> XML tag
    const match = rawData.match(/<string[^>]*>(.*)<\/string>/);

    if (!match) {
      console.error("VerifyPayment Error: Invalid XML Response:", rawData);
      return null;
    }

    const jsonText = match[1]; // pure JSON text inside <string></string>

    // 🟪 Parse extracted JSON string
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonText);
    } catch (err) {
      console.error("VerifyPayment JSON Parse Failed:", jsonText);
      return null;
    }

    // 🟦 Convert to Model & Return
    return PaymentVerifyModel.fromJson(parsedJson);
  } catch (error) {
    console.error("VerifyPayment API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return null;
  }
};

export default VerifyPayment;
export { PaymentVerifyModel };
