import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./card";
import GetSubCategory from "../../backend/homepageimage/getcategory";
import Colors from "../../core/constant"; // ✅ import your Colors file

// Reusable ServiceCard component
const ServiceCard = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-center justify-center
        w-full max-w-[140px] p-3 rounded-2xl
        transition-all duration-300 ease-out
        hover:scale-[1.03] hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2
        active:scale-95
      `}
      aria-label={`Select ${label}`}
    >
      {/* Card with subtle glow & gradient border */}
      <div
        className={`
          relative w-full aspect-square rounded-xl overflow-hidden
          border ${Colors.borderGray}
          bg-gradient-to-br from-white via-gray-50 to-gray-100
          shadow-lg
          group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-orange-300/50
          transition-all duration-300
        `}
      >
        {/* Image */}
        <img
          src={icon}
          alt={label}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/fallback-service-image.png";
          }}
        />

        {/* Optional: Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Label */}
      <span
        className={`
          mt-3 block text-center text-xs sm:text-sm font-semibold
          ${Colors.textGrayDark}
          leading-tight tracking-tight
          group-hover:${Colors.tableHeadText}
          transition-colors duration-300
          line-clamp-2
        `}
        title={label}
      >
        {label}
      </span>

      {/* Ripple effect (optional visual feedback) */}
      <span className="absolute inset-0 rounded-xl ring-0 group-active:ring-4 group-active:ring-orange-400/30 transition-all duration-200" />
    </button>
  );
};

const ServiceCardSection = ({ onServiceSelect }) => {
  const [serviceList, setServiceList] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Detect mobile
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await GetSubCategory();
        setServiceList(data);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      className={`w-full flex flex-col items-start sm:px-6 md:px-8 lg:px-12 font-sans border border-gray-300 rounded-[10px] py-1`}
    >
      <div className="w-full max-w-7xl">
        <div
          className={`bg-white ${Colors.borderGray} rounded-[8px] w-full py-6 px-4 sm:px-6 transition-all duration-300`}
        >
          <h3
            className={`text-lg text-start sm:text-xl md:text-2xl font-bold tracking-tight ${Colors.textGrayDark} mb-6 sm:mb-8 bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} bg-clip-text text-transparent`}
          >
            What are you looking for?
          </h3>

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-4 justify-center">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-3 animate-pulse"
                >
                  <div className="w-[90px] h-[90px] sm:w-[130px] sm:h-[130px] rounded-xl bg-gray-200"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-[300px] sm:max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-gray-50 p-1 sm:p-5">
              <div className="p-1 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5 sm:gap-6 justify-center ">
                {serviceList.map((service) => (
                  <ServiceCard
                    key={service.id}
                    icon={`https://ecommerce.anklegaming.live/${service.ServiceImage}`}
                    label={service.ServiceName}
                    onClick={() => onServiceSelect(service)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCardSection;
