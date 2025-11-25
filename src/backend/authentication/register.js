// backend/authentication/register.js
import axios from "axios";

const RegisterUser = async (
  Image,
  Type,
  Fullname,
  Phone,
  Email,
  Gender,
  Dob
) => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");
  formData.append("image", Image || "");
  formData.append("type", Type || "");
  formData.append("fullname", Fullname || "");
  formData.append("phone", Phone || "");
  formData.append("email", Email || "");
  formData.append("gender", Gender || "");
  formData.append("dob", Dob || "");

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/Register",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Register Error:", error);
    return null;
  }
};

export default RegisterUser;
