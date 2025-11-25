import axios from "axios";

// 🧩 Model Class
class ShowOrderModel {
  constructor(
    ID,
    OrderID,
    UserID,
    OrderType,
    ItemImages,
    ItemName,
    Price,
    Quantity,
    Address,
    Slot,
    SlotDatetime,
    OrderDatetime,
    Status,
    VendorPhone,
    BeforVideo,
    AfterVideo,
    OTP,
    PaymentMethod
  ) {
    this.ID = ID;
    this.OrderID = OrderID;
    this.UserID = UserID;
    this.OrderType = OrderType;
    this.ItemImages = ItemImages;
    this.ItemName = ItemName;
    this.Price = Price;
    this.Quantity = Quantity;
    this.Address = Address;
    this.Slot = Slot;
    this.SlotDatetime = SlotDatetime;
    this.OrderDatetime = OrderDatetime;
    this.Status = Status;
    this.VendorPhone = VendorPhone;
    this.BeforVideo = BeforVideo;
    this.AfterVideo = AfterVideo;
    this.OTP = OTP;
    this.PaymentMethod = PaymentMethod;
  }

  // 🧠 Factory to safely parse JSON data
  static fromJson(json) {
    const imageUrl = json.ItemImages
      ? json.ItemImages.startsWith("http")
        ? json.ItemImages
        : `https://weprettify.com/Images/${json.ItemImages}`
      : "https://via.placeholder.com/150?text=No+Image";

    return new ShowOrderModel(
      json.ID || 0,
      json.OrderID || "",
      json.UserID || "",
      json.OrderType || "",
      imageUrl,
      json.ItemName || "",
      json.Price || "0",
      json.Quantity || "1",
      json.Address || "",
      json.Slot || "",
      json.SlotDatetime || "",
      json.OrderDatetime || "",
      json.Status || "",
      json.VendorPhone || "",
      json.BeforVideo || "",
      json.AfterVideo || "",
      json.OTP || "",
      json.PaymentMethod || ""
    );
  }
}

// 🛰️ API Function
const ShowOrders = async ({
  orderid,
  UserID = "",
  VendorPhone = "",
  Status = "",
}) => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");
  formData.append("OrderID", orderid);
  formData.append("UserID", UserID);
  formData.append("VendorPhone", VendorPhone);
  formData.append("Status", Status);

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/ShowOrders",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    let rawData = response.data;

    // Parse response if it's a JSON string
    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch (err) {
        console.error("JSON parsing failed:", err);
        return [];
      }
    }

    if (!Array.isArray(rawData)) return [];

    // ✅ Convert response to model objects
    return rawData.map((item) => ShowOrderModel.fromJson(item));
  } catch (error) {
    console.error("ShowOrders API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};

export default ShowOrders;
export { ShowOrderModel };
