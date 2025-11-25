import axios from "axios";

const UpdateOrderQuantity = async ({ Id, OrderID, Price, Quantity }) => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");
  formData.append("ID", Id);
  formData.append("OrderID", OrderID);
  formData.append("Price", Price);
  formData.append("Quantity", Quantity);

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/UpdateQtyPrice",
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("UpdateOrder Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return null;
  }
};

export default UpdateOrderQuantity;
