import axios from "axios";

class PaymentOrderModel {
  constructor(success, message, order_id, order_token, payment_link) {
    this.success = success;
    this.message = message;
    this.order_id = order_id;
    this.order_token = order_token;
    this.payment_link = payment_link;
  }

  static fromJson(json) {
    return new PaymentOrderModel(
      json.success || false,
      json.message || "",
      json.order_id || "",
      json.order_token || "",
      json.payment_link || ""
    );
  }
}

const PaymentGateway = async (
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  customerId
) => {
  const formData = new URLSearchParams();
  formData.append("orderId", orderId);
  formData.append("amount", amount);
  formData.append("customerName", customerName);
  formData.append("customerEmail", customerEmail);
  formData.append("customerPhone", customerPhone);
  formData.append("customerId", customerId);
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/CreateOrder", // API URL
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    let rawData = response.data;

    // 🔹 Extract JSON inside <string>...</string>
    const match = rawData.match(/<string[^>]*>(.*)<\/string>/);
    if (!match) {
      console.error("Invalid XML Response:", rawData);
      return null;
    }

    const jsonText = match[1];

    // 🔹 Convert XML JSON → JS Object
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (err) {
      console.error("JSON Parse Error:", jsonText);
      return null;
    }

    // 🔹 Convert to Model
    return PaymentOrderModel.fromJson(parsedData);
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};

export default PaymentGateway;
