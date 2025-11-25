import React from "react";

const ServicePromoCard = ({ title, subtitle, image, onClickCard }) => {
  return (
    <div
      onClick={onClickCard}
      className="m-2 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto cursor-pointer"
    >
      <div
        className="group relative w-full h-[220px] sm:h-[240px] md:h-[260px] lg:h-[280px] xl:h-[300px] 
                   rounded-2xl overflow-hidden shadow-xl 
                   transition-all duration-300 
                   hover:shadow-2xl hover:-translate-y-1"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
          <div className="space-y-1.5 transform transition-all duration-300 group-hover:translate-y-[-4px]">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg opacity-90 leading-snug">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
        </div>
      </div>
    </div>
  );
};

export default ServicePromoCard;
