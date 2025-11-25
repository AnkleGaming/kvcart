import axios from "axios";

// Order model
class GetOrderModel {
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
    Status
  ) {
    this.ID = ID;
    this.OrderID = OrderID;
    this.UserID = UserID;
    this.OrderType = OrderType;
    this.ItemImages = ItemImages; // lowercase
    this.ItemName = ItemName;
    this.Price = Price;
    this.Quantity = Quantity;
    this.Address = Address;
    this.Slot = Slot;
    this.SlotDatetime = SlotDatetime;
    this.OrderDatetime = OrderDatetime;
    this.Status = Status;
  }

  static fromJson(json) {
    // Normalize image URL
    let imageUrl = "";
    if (json.ItemImages) {
      imageUrl = json.ItemImages.startsWith("http")
        ? json.ItemImages
        : `https://weprettify.com/Images/${json.ItemImages}`;
    }

    return new GetOrderModel(
      json.ID || 0,
      json.OrderID || "",
      json.UserID || "",
      json.OrderType || "",
      imageUrl,
      json.ItemName || "",
      json.Price || "",
      json.Quantity || "",
      json.Address || "",
      json.Slot || "",
      json.SlotDatetime || "",
      json.OrderDatetime || "",
      json.Status || ""
    );
  }
}

// Fetch orders function
const GetOrders = async (orderid, UserID, Status = "Pending") => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");
  formData.append("OrderID", orderid);
  formData.append("UserID", UserID);
  formData.append("VendorPhone", "");
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

    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch (err) {
        console.error("Invalid JSON format in ShowOrders response", err);
        return [];
      }
    }

    if (!Array.isArray(rawData)) {
      console.error("Unexpected response format:", rawData);
      return [];
    }

    // Map and normalize each order
    return rawData.map((item) => GetOrderModel.fromJson(item));
  } catch (error) {
    console.error("Error fetching GetOrders:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};

export default GetOrders;
export { GetOrderModel };
