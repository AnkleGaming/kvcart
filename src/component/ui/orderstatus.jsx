// src/components/OrderStatusTracker.jsx
import React from "react";
import Colors from "../../core/constant";

const OrderStatusTracker = ({ statuses, currentIndex = 0 }) => {
  if (!statuses || statuses.length === 0) {
    return <div className="text-gray-500">No status available</div>;
  }

  const getStatusStyle = (index) => {
    if (index < currentIndex) {
      // Completed
      return {
        bg: `${Colors.successBg} border-2 border-green-300`,
        text: Colors.successText,
        icon: "✓",
        line: "bg-green-400",
      };
    } else if (index === currentIndex) {
      // Current
      return {
        bg: `${Colors.primaryFrom} ${Colors.primaryTo} bg-gradient-to-r border-2 border-white/50 shadow-lg`,
        text: Colors.textWhite,
        icon: "●", // Solid circle for current
        line: `${Colors.primaryFrom} ${Colors.primaryTo} bg-gradient-to-r`,
      };
    } else {
      // Pending
      return {
        bg: `${Colors.pendingBg} border-2 border-yellow-300`,
        text: Colors.pendingText,
        line: "bg-gray-300",
      };
    }
  };

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between mb-8">
        {/* Render steps with connecting lines */}
        {statuses.map((status, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center min-w-0 flex-1 relative">
              {/* Connecting Line (before the step, except first) */}
              {index > 0 && (
                <div
                  className={`absolute top-5 left-0 w-full h-1 z-0 transform -translate-x-1/2 ${
                    getStatusStyle(index - 1).line
                  }`}
                />
              )}

              {/* Step Circle */}
              <div
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  getStatusStyle(index).bg
                }`}
              >
                <span
                  className={`${getStatusStyle(index).text} drop-shadow-sm`}
                >
                  {getStatusStyle(index).icon}
                </span>
              </div>

              {/* Status Label */}
              <div className="mt-3 px-2 text-center">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    getStatusStyle(index).text
                  }`}
                >
                  {status}
                </p>
                {index === currentIndex && (
                  <p className="text-xs text-center text-gray-500 mt-1">
                    In Progress
                  </p>
                )}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Optional: Subtle divider */}
      <div className={`${Colors.bgGray} h-px w-full rounded-full`} />
    </div>
  );
};

export default OrderStatusTracker;
