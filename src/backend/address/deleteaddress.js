import axios from "axios";

const DeleteAddress = async (ID) => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");
  formData.append("id", ID);

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/DeleteAddress",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const data = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (err) {
        console.error("JSON parse error:", err);
        return { success: false, message: "Invalid server response" };
      }
    }

    if (data.message === "Deleted Successfully") {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message || "Delete failed" };
    }
  } catch (error) {
    console.error("DeleteAddress API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return { success: false, message: "Something went wrong" };
  }
};
export default DeleteAddress;
