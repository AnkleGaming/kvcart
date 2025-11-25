import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./card";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import GetSubCategory from "../../backend/subcategory/getsubcategory";
import { useDelayedNavigate } from "./delayedbutton";
import Colors from "../../core/constant";

const WomensCard = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center space-y-3 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-2xl"
      aria-label={`Select ${label}`}
    >
      <div
        className={`
          relative w-20 h-20 sm:w-24 sm:h-24 md:w-20 md:h-20 lg:w-24 lg:h-24 
          rounded-2xl overflow-hidden ${Colors.borderGray} 
          bg-white/80 backdrop-blur-sm shadow-lg 
          ring-1 ring-gray-200 
          hover:shadow-2xl hover:ring-orange-300 
          transition-all duration-300 
          group-hover:ring-2 group-hover:ring-orange-400
          group-focus:ring-2 group-focus:ring-orange-400
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <img
          src={icon}
          alt={label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = "/fallback-service-image.png";
          }}
        />
      </div>
      <span
        className={`
          text-xs sm:text-sm md:text-xs lg:text-sm font-semibold 
          ${Colors.textGrayDark} text-center max-w-full leading-tight 
          line-clamp-2 
          group-hover:${Colors.tableHeadText} 
          transition-all duration-300 
          group-hover:text-orange-600
        `}
      >
        {label}
      </span>
    </button>
  );
};

const WomensSalonCard = ({ onClose, service }) => {
  const navigate = useNavigate();
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await GetSubCategory(service.id, "Brand");
      setSubServices(data);
      setLoading(false);
    };
    fetchData();
  }, [service]);

  const handleServiceClick = (subService) => {
    navigate("/womensaloonIn", {
      state: { subService },
    });
  };

  return (
    <div
      className={`
        relative w-full max-w-4xl mx-auto 
        bg-white/90 backdrop-blur-xl 
        rounded-3xl p-5 sm:p-7 
        shadow-2xl border border-white/20 
        z-50 
        animate-in fade-in slide-in-from-bottom-16 duration-500
        overflow-hidden
      `}
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/70 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 hover:scale-110 z-10"
        aria-label="Close panel"
      >
        <X size={20} className="stroke-current text-gray-600" />
      </button>

      {/* Title */}

      <div className="mb-6">
        <h2
          className={`
            text-2xl sm:text-3xl md:text-4xl font-bold 
            bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} 
            bg-clip-text text-transparent 
            tracking-tight
          `}
        >
          {service?.ServiceName || "Select a Service"}
        </h2>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-32 sm:h-40">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-orange-500"></div>
          <p
            className={`ml-2 sm:ml-3 ${Colors.textMuted} text-sm sm:text-base`}
          >
            Loading sub-services...
          </p>
        </div>
      ) : (
        /* Sub-services Grid */
        <div className="h-[calc(100%-4rem)] sm:h-[calc(100%-5rem)] overflow-y-auto hide-scrollbar p-2 sm:p-4">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
            {subServices.map((subService) => (
              <WomensCard
                key={subService.id}
                icon={`https://api.hukmee.in/${subService.image}`}
                label={subService.text}
                onClick={() => handleServiceClick(subService)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WomensSalonCard;
