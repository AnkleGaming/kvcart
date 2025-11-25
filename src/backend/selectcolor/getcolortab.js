import axios from "axios";

class GetColorTabModel {
  constructor(id, Colors, label, colorId) {
    this.id = id;
    this.Colors = Colors;
    this.label = label;
    this.colorId = colorId;
  }

  static fromJson(json) {
    return new GetColorTabModel(
      json.id || 0,
      json.Colors || "",
      json.label || 0,
      json.colorid || ""
    );
  }
}

const GetServicesTab = async (Id) => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");
  formData.append("colorid", Id);

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/ShowColors",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    let rawData = response.data;

    // Handle if response is JSON string
    if (typeof rawData === "string") {
      rawData = JSON.parse(rawData);
    }

    // Map JSON to model instances
    const serviceTab = rawData.map((item) => GetColorTabModel.fromJson(item));

    return serviceTab;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export default GetServicesTab;
