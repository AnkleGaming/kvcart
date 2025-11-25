import axios from "axios";

const AssignLeads = async (orderid) => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");
  formData.append("OrderID", orderid);

  try {
    // Send POST request
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/AssignLeads",
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Try to parse response (in case it's a JSON string)
    let data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        // if not JSON, return raw data
      }
    }

    // Return message or raw data
    return data?.message || data || "Unknown response";
  } catch (error) {
    console.error("AssignLeads Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return { message: "Failed to assign leads." };
  }
};

export default AssignLeads;
