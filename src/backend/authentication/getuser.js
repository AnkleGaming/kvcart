import axios from "axios";

class GetUserModel {
  constructor(id, Image, Fullname, PhoneNumber, Email, Gender, DOB) {
    this.id = id;
    this.Image = Image;
    this.Fullname = Fullname;
    this.PhoneNumber = PhoneNumber;
    this.Email = Email;
    this.Gender = Gender;
    this.DOB = DOB;
  }

  static fromJson(json) {
    return new GetUserModel(
      json.id || 0,
      json.Image || "",
      json.Fullname || "",
      json.PhoneNumber || "",
      json.Email || "",
      json.Gender || "",
      json.DOB || ""
    );
  }
}

const GetUser = async (phone) => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");
  formData.append("phone", phone);

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/GetProfile",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    let rawData = response.data;

    // If response is a string, try to parse
    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch {
        console.error("Could not parse response as JSON", rawData);
        return [];
      }
    }

    // Ensure it's an array before mapping
    if (!Array.isArray(rawData)) {
      console.warn("Expected array but got:", rawData);
      return [];
    }

    return rawData.map((item) => GetUserModel.fromJson(item));
  } catch (error) {
    console.error("Error fetching user data:", error);
    return [];
  }
};

export default GetUser;
