import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RegisterUser from "../../backend/authentication/register";
import Color from "../../core/constant";
import Colors from "../../core/constant";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    gender: "",
    dob: "",
  });
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const navigate = useNavigate();
  const phone = localStorage.getItem("userPhone");

  // Focus trap for accessibility
  useEffect(() => {
    const formElement = formRef.current;
    if (!formElement) return;

    const focusableElements = formElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    formElement.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => formElement.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = "Full name is required";
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/))
      newErrors.email = "Valid email is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dob.trim()) newErrors.dob = "Date of birth is required";
    return newErrors;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      console.log("Submitting data:", formData);

      const result = await RegisterUser(
        "", // No image for now
        "Register",
        formData.fullname,
        phone,
        formData.email,
        formData.gender,
        formData.dob
      );

      console.log("Register API Response:", result);

      // ✅ Handle JSON response
      if (result?.message === "Successfully Registered!") {
        alert("Registered successfully!");
        navigate("/");
        window.location.reload();
      } else {
        alert(result?.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("An error occurred during registration.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 font-sans flex items-center justify-center">
      <div
        className="relative w-full max-w-lg p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-200"
        ref={formRef}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2
          className={`text-2xl sm:text-3xl font-bold text-center text-[${Color.primaryMain}] mb-6`}
        >
          Register
        </h2>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Enter full name"
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${Color.primaryMain}`}
            />
            {errors.fullname && (
              <p className="text-red-600 text-sm">{errors.fullname}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${Color.primaryMain}`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${Color.primaryMain}`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-600 text-sm">{errors.gender}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${Color.primaryMain}`}
            />
            {errors.dob && <p className="text-red-600 text-sm">{errors.dob}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 bg-${Colors.primaryMain} text-white rounded-lg font-semibold shadow-md hover:bg-${Colors.primaryMain} hover:shadow-lg transition-all duration-300`}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
