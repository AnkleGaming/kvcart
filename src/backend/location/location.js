import axios from "axios";

// 🧩 Model Class
class LocationModel {
  constructor(latitude, longitude, city, state, pincode, country, address) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.city = city;
    this.state = state;
    this.pincode = pincode;
    this.country = country;
    this.address = address;
  }

  // 🧠 Factory to safely parse JSON response
  static fromJson(latitude, longitude, json) {
    return new LocationModel(
      latitude || 0,
      longitude || 0,
      json.city || json.locality || "",
      json.principalSubdivision || "",
      json.postcode || "",
      json.countryName || "",
      `${json.locality || ""}, ${json.principalSubdivision || ""}, ${
        json.countryName || ""
      }`
    );
  }
}

// 🛰️ API Function
const GetLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("❌ Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 🌍 Fetch address from BigDataCloud (Free, No API Key)
          const response = await axios.get(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          const data = response.data;
          console.log("📦 BigDataCloud Response:", data);

          const location = LocationModel.fromJson(latitude, longitude, data);
          resolve(location);
        } catch (error) {
          console.error("GetLocation API Error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          reject("Failed to fetch address details.");
        }
      },
      (error) => {
        console.error("Geolocation Error:", error);
        reject("Failed to get your location. Please allow location access.");
      }
    );
  });
};

export default GetLocation;
export { LocationModel };
