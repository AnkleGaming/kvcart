import axios from "axios";

class ShowSuggestProduct {
  constructor(
    ProID,
    ProductName,
    ProductDes,
    Price,
    Type,
    Id,
    PrdImgID,
    ProductImages
  ) {
    this.ProID = ProID;
    this.ProductName = ProductName;
    this.ProductDes = ProductDes;
    this.Price = Price;
    this.Type = Type;
    this.Id = Id;
    this.PrdImgID = PrdImgID;
    this.ProductImages = ProductImages;
  }

  static fromJson(json) {
    return new ShowSuggestProduct(
      json.ProID || 0,
      json.ProductName || "",
      json.ProductDes || "",
      json.Price || "",
      json.Type || "",
      json.Id || "",
      json.PrdImgID || "",
      json.ProductImages || ""
    );
  }
}

const GetSuggestProduct = async () => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/ShowSuggestedProducts",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    let rawData = response.data;

    // If API returns JSON as a string
    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch (err) {
        console.error("Parsing error in ShowSuggestedProducts:", err);
        return [];
      }
    }

    // Convert each item into model
    return rawData.map((item) => ShowSuggestProduct.fromJson(item));
  } catch (error) {
    console.error("ShowSuggestedProducts API Error:", error);
    return [];
  }
};

export default GetSuggestProduct;
