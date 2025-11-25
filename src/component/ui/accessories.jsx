// src/components/package/PackageCard.jsx
import React, { useEffect, useState, useCallback } from "react";
import GetServicePack from "../../backend/servicepack/getservicepack";
import Colors from "../../core/constant";

const PackageCardItem = ({
  image,
  servicename,
  duration,
  fees,
  discountfee,
  onAdd,
  refreshPackages,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = async () => {
    setIsAdding(true);
    try {
      // Simulate network delay (2–3 seconds)
      const delay = Math.floor(Math.random() * 1000) + 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      await onAdd();
      refreshPackages?.();
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className={`relative w-full max-w-[400px] sm:max-w-[350px] md:max-w-[500px] lg:max-w-[550px] rounded-2xl border ${Colors.borderGray} bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
    >
      {/* Image section */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={image || "https://via.placeholder.com/550x200"}
          alt={servicename}
          className="w-full h-32 sm:h-40 md:h-48 lg:h-56 object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div
          className={`absolute top-3 right-3 bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} ${Colors.textWhite} px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm`}
        >
          {duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 md:p-6 space-y-3">
        <h2
          className={`text-base sm:text-lg md:text-xl font-bold ${Colors.textGrayDark} tracking-tight line-clamp-2`}
        >
          {servicename}
        </h2>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span
            className={`text-base sm:text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo}`}
          >
            ₹{discountfee || fees}
          </span>
          {discountfee && (
            <span
              className={`line-through ${Colors.textMuted} text-xs sm:text-sm md:text-base`}
            >
              ₹{fees}
            </span>
          )}
        </div>

        {/* Button */}
        <button
          onClick={handleAddClick}
          disabled={isAdding}
          className={`w-full py-2 sm:py-2.5 bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} ${Colors.textWhite} text-xs sm:text-sm md:text-base font-semibold rounded-lg hover:bg-gradient-to-r ${Colors.hoverFrom} ${Colors.hoverTo} transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 flex justify-center items-center gap-2`}
          aria-label={`Add ${servicename} to cart`}
        >
          {isAdding && (
            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
          )}
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

const Accesories = ({ addToCart, selectedServiceTab }) => {
  const [servicePackages, setServicePackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log(
    "Received selectedServiceTab in PackageCard:",
    selectedServiceTab
  );

  const fetchPackages = useCallback(async () => {
    if (!selectedServiceTab?.id) return; // Safety check
    setLoading(true);
    setError(null);

    try {
      const data = await GetServicePack(selectedServiceTab.id, "Accesories");
      setServicePackages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError("Failed to load packages. Please try again later.");
      setServicePackages([]);
    } finally {
      setLoading(false);
    }
  }, [selectedServiceTab]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return (
    <div
      className={`w-full bg-gradient-to-b border ${Colors.borderGray} rounded-[8px] py-8 sm:py-10 md:py-12`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${Colors.textGrayDark} mb-6 sm:mb-8 md:mb-10 tracking-tight`}
        >
          Explore Our Service Accesories
        </h1>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center h-40 sm:h-48 md:h-56 gap-2">
            <div
              className={`animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 ${Colors.primaryFrom.replace(
                "from",
                "border"
              )}`}
            ></div>
            <p className={`text-base sm:text-lg ${Colors.textMuted}`}>
              Loading packages...
            </p>
          </div>
        ) : error ? (
          <p className="text-center text-red-600 text-base sm:text-lg py-8 sm:py-10 bg-white rounded-2xl shadow-md">
            {error}
          </p>
        ) : servicePackages.length === 0 ? (
          <p
            className={`text-center ${Colors.textMuted} text-base sm:text-lg py-8 sm:py-10 bg-white rounded-2xl shadow-md`}
          >
            No packages available at the moment.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            {servicePackages.map((pkg) => (
              <PackageCardItem
                key={pkg.id}
                {...pkg}
                image={`https://api.hukmee.in/${pkg?.image}`}
                onAdd={() => addToCart(pkg)}
                refreshPackages={fetchPackages}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Accesories;
