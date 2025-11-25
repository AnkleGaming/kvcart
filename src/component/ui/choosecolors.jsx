import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./card";
import { X } from "lucide-react";
import Colors from "../../core/constant";

const SelectColor = ({ color, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center space-y-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-xl"
      aria-label={`Select ${label} color`}
    >
      <Card
        className={`w-[110px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[90px] md:h-[90px] lg:w-[90px] lg:h-[90px] rounded-xl overflow-hidden ${Colors.borderGray} bg-white shadow-md hover:shadow-xl transition-all duration-300 group-hover:ring-2 group-hover:ring-orange-300`}
      >
        <CardContent className="p-0 flex items-center justify-center w-full h-full">
          <div
            className="w-full h-full"
            style={{ backgroundColor: color }} // background color
          ></div>
        </CardContent>
      </Card>
      <span
        className={`text-xs sm:text-sm font-semibold ${Colors.textGrayDark} text-center max-w-[140px] leading-tight group-hover:${Colors.tableHeadText} transition-colors duration-300`}
      >
        {label}
      </span>
    </button>
  );
};

const SelectColorCard = ({ onClose }) => {
  const navigate = useNavigate();
  // Dummy colors
  const dummyColors = [
    { color: "red", label: "Red" },
    { color: "blue", label: "Blue" },
    { color: "green", label: "Green" },
    { color: "yellow", label: "Yellow" },
    { color: "pink", label: "Pink" },
    { color: "purple", label: "Purple" },
  ];

  const handleclick = () => {
    navigate("/womensaloonIn");
  };

  return (
    <div
      className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-6 w-[385px] md:w-full h-[400px] md:max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl relative shadow-xl z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-10`}
    >
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={20} className="stroke-2" />
      </button>

      {/* Title */}
      <h2
        className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-start ${Colors.textGrayDark} tracking-tight bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} bg-clip-text text-transparent`}
      >
        Choose Color
      </h2>

      {/* Dummy colors grid */}
      <div className="h-[calc(100%-4rem)] sm:h-[calc(100%-5rem)] overflow-y-auto hide-scrollbar p-2 sm:p-4">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {dummyColors.map((item, index) => (
            <SelectColor
              key={index}
              color={item.color}
              label={item.label}
              onClick={handleclick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectColorCard;
