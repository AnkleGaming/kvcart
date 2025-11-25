// components/BecomeWePretiffyCard.js
import React, { useState } from "react";
import WePretiffyVendor from "../../backend/weprettifyvendor/weprettifyvendor";
import Colors from "../../core/constant";

const BecomeWePretiffyCard = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
    type: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.type) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const result = await WePretiffyVendor(
        formData.name,
        formData.phone,
        formData.message,
        formData.type
      );

      if (result.success) {
        alert("Sent successful! 🎉");
        setFormData({ name: "", phone: "", message: "", type: "" });
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`max-w-md mx-auto bg-white rounded-[8px] p-8 font-sans border ${Colors.borderGray}`}
    >
      <h2
        className={`text-2xl font-bold mb-2 ${Colors.textGrayDark} text-center`}
      >
        Become a Hukmee Vendor
      </h2>
      <p className={`text-sm ${Colors.textMuted} text-center mb-6`}>
        Fill out the form below and join our community.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="relative">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder=" "
            className={`peer w-full border ${Colors.borderGray} rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FA7D09] focus:border-transparent transition-all`}
            required
          />
          <label
            className={`absolute left-3 -top-2.5 text-xs ${Colors.textGray} bg-white px-1 transition-all 
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#FA7D09]`}
          >
            Name
          </label>
        </div>

        {/* Phone */}
        <div className="relative">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder=" "
            className={`peer w-full border ${Colors.borderGray} rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FA7D09] focus:border-transparent transition-all`}
            required
          />
          <label
            className={`absolute left-3 -top-2.5 text-xs ${Colors.textGray} bg-white px-1 transition-all 
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#FA7D09]`}
          >
            Phone
          </label>
        </div>

        {/* Message */}
        <div className="relative">
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder=" "
            rows="3"
            className={`peer w-full border ${Colors.borderGray} rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FA7D09] focus:border-transparent transition-all resize-none`}
          ></textarea>
          <label
            className={`absolute left-3 -top-2.5 text-xs ${Colors.textGray} bg-white px-1 transition-all 
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#FA7D09]`}
          >
            Message
          </label>
        </div>

        {/* Type */}
        <div className="relative">
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`peer w-full border ${Colors.borderGray} rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FA7D09] focus:border-transparent transition-all appearance-none bg-white`}
            required
          >
            <option value="">Select Type</option>
            <option value="ShopOwner">Shop Owner</option>
            <option value="Individual">Individual</option>
          </select>
          <label
            className={`absolute left-3 -top-2.5 text-xs ${Colors.textGray} bg-white px-1 transition-all
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#FA7D09]`}
          >
            Type
          </label>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-[#FA7D09] text-white font-semibold py-3 rounded-xl shadow-md hover:cursor-pointer hover:-translate-y-0.5 transition-all ${Colors.hoverFrom} ${Colors.hoverTo}`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default BecomeWePretiffyCard;
