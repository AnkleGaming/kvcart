import axios from "axios";

const InsertProductReview = async (
  ProductId,
  ProductName,
  Review,
  Rating,
  Name,
  Image,
  Phone
) => {
  const formData = new URLSearchParams();
  formData.append("token", "SWNCMPMSREMXAMCKALVAALI");
  formData.append("ProductID", ProductId);
  formData.append("ProductName", ProductName);
  formData.append("Review", Review);
  formData.append("Rating", Rating);
  formData.append("Name", Name);
  formData.append("image", Image);
  formData.append("Phone", Phone);

  try {
    const response = await axios.post(
      "https://ecommerce.anklegaming.live/APIs/APIs.asmx/insertProductReview",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getting error", error);
  }
};

export default InsertProductReview;
