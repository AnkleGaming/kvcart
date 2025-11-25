import React from "react";
import Colors from "../../core/constant";

// Reusable Star Component (Beautiful & Accurate)
const Star = ({ type = "full", size = "sm" }) => {
  const sizeClass = size === "lg" ? "w-8 h-8" : "w-5 h-5";

  if (type === "half") {
    return (
      <div className="relative">
        <svg
          className={`${sizeClass} text-gray-300`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.27 8.384c-.784-.57-.382-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
        <svg
          className={`absolute top-0 left-0 ${sizeClass} text-yellow-400`}
          fill="currentColor"
          viewBox="0 0 20 20"
          style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.27 8.384c-.784-.57-.382-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      className={`${sizeClass} ${
        type === "full" ? "text-yellow-400" : "text-gray-300"
      }`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.27 8.384c-.784-.57-.382-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
    </svg>
  );
};

// Star Rating Row
const StarRating = ({ rating, size = "sm" }) => {
  const num = parseFloat(rating) || 0;
  const full = Math.floor(num);
  const half = num % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <div className="flex items-center gap-1">
      {[...Array(full)].map((_, i) => (
        <Star key={`full-${i}`} type="full" size={size} />
      ))}
      {half === 1 && <Star type="half" size={size} />}
      {[...Array(empty)].map((_, i) => (
        <Star key={`empty-${i}`} type="empty" size={size} />
      ))}
      <span
        className={`ml-2 font-bold ${
          size === "lg" ? "text-2xl" : "text-sm"
        } text-gray-700`}
      >
        {num.toFixed(1)}
      </span>
    </div>
  );
};

// Review Card
const ReviewCard = ({ review, isMobile }) => (
  <div
    className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-5 ${
      isMobile ? "w-80" : "w-full"
    } hover:shadow-xl transition-all duration-300`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <img
          src={review.image || "/default-avatar.png"}
          alt={review.Name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />
        <div className="flex flex-col">
          <div className="mb-2">
            <h4 className="font-bold text-gray-800">{review.Name}</h4>
            <p className="text-xs text-gray-500">Verified Customer</p>
          </div>

          <StarRating rating={review.Rating} size="sm" />
        </div>
      </div>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed mt-3 italic">
      "{review.Review}"
    </p>
  </div>
);

const RatingScreen = ({ reviews = [] }) => {
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + parseFloat(r.Rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-6 sm:p-8 max-w-7xl mx-auto shadow-xl border border-gray-200">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-4xl font-bold text-gray-800 mb-3">
          Customer Reviews
        </h2>
        <div className="flex items-center justify-center gap-4">
          <StarRating rating={avgRating} size="l" />
          <span className="text-gray-600 text-sm">
            ({reviews.length} reviews)
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">No reviews</div>
          <p className="text-gray-500">Be the first to review!</p>
        </div>
      ) : (
        <>
          {/* Mobile: Horizontal Scroll */}
          <div className="block sm:hidden">
            <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
              {reviews.map((review) => (
                <div
                  key={review.ID}
                  className="snap-start flex-shrink-0 p-[1px]"
                >
                  <ReviewCard review={review} isMobile={true} />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto pb-8 scrollbar-hide">
              <div className="flex gap-6">
                {reviews.map((review) => (
                  <div
                    key={review.ID}
                    className="flex-shrink-0 w-96" // ~3 cards fit perfectly
                  >
                    <ReviewCard review={review} isMobile={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RatingScreen;
