import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Card, CardContent } from "./card";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import spaImage from "../../assets/facialimg.png";
import GetSuggestProduct from "../../backend/getproduct/suggestedproducts";

const SuggestProductScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [maxSlide, setMaxSlide] = useState(0);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const [sliderRef, instanceRef] = useKeenSlider({
    slides: { perView: 5, spacing: 16 },
    drag: true,
    friction: 0.2,
    duration: 600,
    breakpoints: {
      "(max-width: 1280px)": { slides: { perView: 4, spacing: 12 } },
      "(max-width: 1024px)": { slides: { perView: 3, spacing: 12 } },
      "(max-width: 768px)": { slides: { perView: 2, spacing: 10 } },
      "(max-width: 500px)": { slides: { perView: 1, spacing: 8 } },
    },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
    created(s) {
      setLoaded(true);
      updateMaxSlide(s);
    },
    updated(s) {
      updateMaxSlide(s);
    },
  });

  const updateMaxSlide = (s) => {
    const totalSlides = s.track.details.slides.length;
    const perView =
      typeof s.options.slides === "object" && s.options.slides?.perView
        ? s.options.slides.perView
        : 1;
    setMaxSlide(Math.max(0, totalSlides - perView));
  };

  useEffect(() => {
    if (loaded && instanceRef.current && services.length > 0) {
      instanceRef.current.update();
    }
  }, [services, loaded, instanceRef]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await GetSuggestProduct();
        console.log("Fetched suggested products:", data);
        setServices(data || []);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load services");
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handlePrev = () => instanceRef.current?.prev();
  const handleNext = () => instanceRef.current?.next();

  const handleServiceClick = (service) => {
    navigate("/womensaloonIn", { state: { subService: service } });
  };

  const imageBaseUrl = "https://api.weprettify.com/Images/";

  const SkeletonCard = () => (
    <div className="keen-slider__slide px-2">
      <Card className="flex flex-col h-[330px] rounded-xl shadow-md border border-gray-100 animate-pulse bg-white">
        <CardContent className="p-0 flex-grow">
          <div className="h-[220px] bg-gray-200 rounded-t-xl"></div>
        </CardContent>
        <div className="px-4 py-4">
          <div className="h-5 bg-gray-200 rounded w-4/5 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    </div>
  );

  return (
    <section
      id="services"
      className="py-6 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center mb-6 text-red-600 bg-red-50 p-4 rounded-xl shadow-sm">
            <AlertCircle className="mr-2" size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Slider Container */}
        <div className="relative min-h-[320px] w-full">
          {/* Arrow Buttons */}
          {loaded && services.length > 0 && currentSlide > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-[-12px] sm:left-[-20px] md:left-[-24px] lg:left-[-28px] top-1/2 z-20 transform -translate-y-1/2 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {loaded && services.length > 0 && currentSlide < maxSlide && (
            <button
              onClick={handleNext}
              className="absolute right-[-12px] sm:right-[-20px] md:right-[-24px] lg:right-[-28px] top-1/2 z-20 transform -translate-y-1/2 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Keen Slider */}
          <div ref={sliderRef} className="keen-slider">
            {isLoading ? (
              Array(5)
                .fill()
                .map((_, index) => <SkeletonCard key={index} />)
            ) : services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="keen-slider__slide px-[1px]">
                  <div
                    className="m-0"
                    onClick={() => handleServiceClick(service)}
                  >
                    <Card className="flex flex-col cursor-pointer h-[340px] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white hover:border-gray-200">
                      <CardContent className="p-0 flex-grow">
                        <div className="h-[220px] overflow-hidden rounded-t-xl">
                          <img
                            src={
                              service.image
                                ? `${imageBaseUrl}${service.image}`
                                : spaImage
                            }
                            alt={service.ProductName}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = spaImage;
                            }}
                          />
                        </div>
                      </CardContent>
                      <div className="px-4 py-4">
                        <span className="text-lg font-semibold text-gray-800 truncate block">
                          {service.ProductName}
                        </span>
                        <span className="text-md font-medium text-gray-600 truncate block">
                          ₹{service.Price}
                        </span>
                        <span className="text-sm font-normal text-gray-500 truncate block">
                          {service.ProductDes}
                        </span>
                      </div>
                    </Card>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg font-medium">
                  No services available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuggestProductScreen;
