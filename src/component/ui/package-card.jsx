// src/components/package/PackageCard.jsx
import React, { useEffect, useState, useCallback, memo } from "react";
import GetServicePack from "../../backend/servicepack/getservicepack";
import Colors from "../../core/constant";

// === SKELETON CARD COMPONENT ===
const SkeletonCard = () => (
  <div className="group relative w-full max-w mx-auto animate-pulse">
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100">
      {/* Skeleton Image */}
      <div className="relative aspect-[5/2.5] bg-gray-200" />

      {/* Skeleton Content */}
      <div className="p-5 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-11 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// === MEMOIZED PACKAGE CARD ITEM ===
const PackageCardItem = memo(
  ({
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
        await onAdd();
        refreshPackages?.();
      } catch (err) {
        console.error("Add to cart failed:", err);
      } finally {
        setIsAdding(false);
      }
    };

    return (
      <div className="group relative w-full max-w mx-auto">
        <div
          className="relative overflow-hidden rounded-2xl bg-white shadow-lg 
                     ring-1 ring-gray-100 transition-all duration-300 
                     hover:shadow-2xl hover:ring-2 hover:ring-orange-200 
                     hover:-translate-y-1 cursor-pointer"
        >
          {/* Image */}
          <div className="relative aspect-[5/2.5] overflow-hidden">
            <img
              src={image || "https://via.placeholder.com/600x300"}
              alt={servicename}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {/* Duration Badge */}
            <div
              className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold text-white 
                         shadow-md bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo}`}
            >
              {duration}
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
              {servicename}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo}`}
              >
                ₹{discountfee || fees}
              </span>
              {discountfee && (
                <span className="line-through text-gray-400 text-sm">
                  ₹{fees}
                </span>
              )}
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddClick}
              disabled={isAdding}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 
                         flex items-center justify-center gap-2 shadow-md
                         ${
                           isAdding
                             ? "bg-gray-400 cursor-not-allowed"
                             : `bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} 
                                hover:${Colors.hoverFrom} hover:${Colors.hoverTo} 
                                hover:shadow-xl active:scale-95`
                         }`}
              aria-label={`Add ${servicename} to cart`}
            >
              {isAdding ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding...
                </>
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

PackageCardItem.displayName = "PackageCardItem";

// === MAIN PACKAGE CARD COMPONENT ===
const PackageCard = ({ addToCart, selectedServiceTab }) => {
  const [servicePackages, setServicePackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // === FETCH USER'S REAL-TIME LOCATION ===
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      setUserLocation({ lat: 26.551381, lon: 84.767491 }); // fallback
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        console.log("Location updated:", latitude, longitude);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setUserLocation({ lat: 26.551381, lon: 84.767491 }); // fallback
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // === FETCH PACKAGES ===
  const fetchPackages = useCallback(async () => {
    if (!selectedServiceTab?.id) return;
    setLoading(true);
    setError(null);

    try {
      const data = await GetServicePack(selectedServiceTab.id, "Service");
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

  // === ENHANCED addToCart WITH REAL-TIME LOCATION ===
  const handleAddToCart = useCallback(
    (pkg) => {
      if (!userLocation) {
        alert("Location not available yet. Please wait...");
        return Promise.reject("Location not ready");
      }

      const packageWithLocation = {
        ...pkg,
        lat: userLocation.lat,
        lon: userLocation.lon,
      };

      return addToCart(packageWithLocation);
    },
    [addToCart, userLocation]
  );

  return (
    <section className="py-1 mb-[50px] md:py-1 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-5">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h1
            className={`text-2xl sm:text-4xl md:text-3xl font-bold bg-clip-text text-transparent 
                       bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} 
                       tracking-tight`}
          >
            Explore Our Service Packages
          </h1>
        </div>

        {/* SKELETON LOADING */}
        {loading && (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
              {error}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && servicePackages.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 border-2 border-dashed rounded-xl p-12 max-w-md mx-auto">
              <p className="text-gray-500 text-lg">
                No packages available at the moment.
              </p>
            </div>
          </div>
        )}

        {/* PACKAGES GRID */}
        {!loading && !error && servicePackages.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {servicePackages.map((pkg) => (
              <PackageCardItem
                key={pkg.id}
                {...pkg}
                image={`https://api.hukmee.in/${pkg?.image}`}
                onAdd={() => handleAddToCart(pkg)}
                refreshPackages={fetchPackages}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PackageCard;
