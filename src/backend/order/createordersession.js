import axios from "axios";

const CreateOrder = async ({
  orderId = "",
  amount = "",
  name = "",
  email = "",
  phone = "",
}) => {
  const formData = new URLSearchParams();

  // Append parameters exactly as API expects
  formData.append("orderId", orderId);
  formData.append("amount", amount);
  formData.append("name", name);
  formData.append("email", email);
  formData.append("phone", phone);

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/CreateOrder", // <-- replace with your real URL
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // ASMX returns XML → extract JSON inside it
    let data = response.data;

    return data; // fallback
  } catch (error) {
    console.error("CreateOrder Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return null;
  }
};

export default CreateOrder;
