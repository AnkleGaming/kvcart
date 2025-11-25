import axios from "axios";

const InsertOrder = async ({
  OrderID,
  UserID,
  OrderType,
  ItemImages = "",
  ItemName = "",
  Price = "",
  Quantity = "",
  Address = "",
  Slot = "",
  SlotDatetime = "",
  OrderDatetime = new Date().toISOString(),
  VendorPhone = "",
  BeforVideo = "", // ✅ spelling must match exactly as in the API doc
  AfterVideo = "",
  OTP = "",
  PaymentMethod = "",
  lat = "",
  long = "",
  Status = "",
}) => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");
  formData.append("OrderID", OrderID);
  formData.append("UserID", UserID);
  formData.append("OrderType", OrderType);
  formData.append("ItemImages", ItemImages);
  formData.append("ItemName", ItemName);
  formData.append("Price", Price);
  formData.append("Quantity", Quantity);
  formData.append("Address", Address);
  formData.append("Slot", Slot);
  formData.append("SlotDatetime", SlotDatetime);
  formData.append("OrderDatetime", OrderDatetime);
  formData.append("VendorPhone", VendorPhone);
  formData.append("BeforVideo", BeforVideo); // ✅ fixed key name
  formData.append("AfterVideo", AfterVideo);
  formData.append("OTP", OTP);
  formData.append("PaymentMethod", PaymentMethod);
  formData.append("lat", lat);
  formData.append("lon", long);
  formData.append("Status", Status);

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/InsertOrders",
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // .asmx APIs often return XML — we’ll just return it raw for now
    return response.data;
  } catch (error) {
    console.error("InsertOrder Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return null;
  }
};

export default InsertOrder;
