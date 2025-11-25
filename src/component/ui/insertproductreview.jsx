import { useState } from "react";
import { Star, X } from "lucide-react";
import Colors from "../../core/constant";

// Change this to your brand color

const ReviewModal = ({ orderId, itemName, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewText, setReviewText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a star rating!");
      return;
    }

    onSubmit({
      orderId,
      rating,
      review: reviewText.trim(),
    });

    // Reset form
    setRating(0);
    setReviewText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`bg-${Colors.primaryMain} text-white p-5 relative`}>
          <h2 className="text-xl font-bold text-center">
            Rate Your Experience
          </h2>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white hover:bg-white/20 rounded-full p-1 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Order ID:</p>
            <p className="font-bold text-lg">#{orderId}</p>
            {itemName && (
              <p className="text-sm text-gray-700 mt-1 italic">"{itemName}"</p>
            )}
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-700 font-medium">
              How was your experience?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={48}
                    className={`transition-all duration-200 ${
                      star <= (hoveredStar || rating)
                        ? `fill-${Colors.primaryMain} text-${Colors.primaryMain}`
                        : "fill-gray-200 text-gray-400"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {rating === 0
                ? "Tap a star to rate"
                : rating === 5
                ? "Amazing!"
                : rating === 4
                ? "Good!"
                : rating === 3
                ? "Okay"
                : rating === 2
                ? "Not great"
                : "Bad"}
            </p>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Write your review (optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              placeholder="Share your experience... What did you like? Any suggestions?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`flex-1 py-3 bg-${Colors.primaryMain} hover:bg-${Colors.primaryMain}/90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-[1.02]`}
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
