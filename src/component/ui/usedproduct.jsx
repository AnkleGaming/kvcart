import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./card";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import spaImage from "../../assets/imageforback.jpg";
import GetProduct from "../../backend/getproduct/getproduct";
import GetProductImage from "../../backend/getproduct/getproductimage";
import { AlertCircle, ShoppingCart } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import Colors from "../../core/constant";

const UsedProduct = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    const fetchServicesWithImages = async () => {
      try {
        setIsLoading(true);
        const products = await GetProduct("Old");

        if (!products || products.length === 0) {
          setServices([]);
          setFilteredServices([]);
          return;
        }

        const productsWithImages = await Promise.all(
          products.map(async (product) => {
            try {
              const images = await GetProductImage(product.ProID);
              return {
                ...product,
                imageUrl:
                  images.length > 0
                    ? `https://api.hukmee.in/${images[0].productImage}`
                    : spaImage,
              };
            } catch (err) {
              console.error(
                `Error fetching image for product ${product.ProID}:`,
                err
              );
              return { ...product, imageUrl: spaImage };
            }
          })
        );

        setServices(productsWithImages);
        setFilteredServices(productsWithImages);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServicesWithImages();
  }, []);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((service) =>
        service.ProductName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchTerm, services]);

  const handleServiceClick = (service) => {
    navigate("/productmainpage", { state: { subService: service } });
  };

  const CartWithBadge = ({ count }) => (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="8" cy="21" r="2" />
        <circle cx="20" cy="21" r="2" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-4 -right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg border-2 border-white"
        >
          {count > 99 ? "99+" : count}
        </motion.div>
      )}
    </div>
  );

  // Skeleton Card
  const SkeletonCard = () => (
    <Card className="flex flex-col h-[360px] rounded-xl shadow-lg border animate-pulse bg-white">
      <CardContent className="p-0 flex-grow">
        <div className="h-[200px] bg-gray-200 rounded-t-xl"></div>
      </CardContent>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </Card>
  );

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* === FIXED HEADER === */}
      <header className="md:hidden sticky top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200 ">
        <div className=" py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Back Button + Title */}
            <div className="flex items-center gap-3 flex-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                aria-label="Go back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>
              <h1
                className={`text-xl font-bold bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} bg-clip-text text-transparent`}
              >
                Used Products
              </h1>
            </div>

            {/* Cart */}
          </div>

          {/* Search Bar */}
        </div>
      </header>

      {!isMobile && (
        <header className="mt-15 ml-[120px] mr-[120px] rounded-[10px] top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
          <div className="px-4 py-4 sm:px-6">
            {/* Search Bar */}
            <div className="flex justify-between items-center">
              <motion.div
                variants={headerVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5 }}
                className="mt-3"
              >
                <div className="w-[280px] flex items-center border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 shadow-sm">
                  <FiSearch className="text-gray-500 mr-3" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="flex-grow outline-none text-gray-700 placeholder-gray-400 bg-transparent text-sm"
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/cartpage")}
                className="flex items-center gap-1 text-gray-700 hover:text-orange-600 cursor-pointer"
                aria-label="View cart"
              >
                <div className="p-2 border border-gray-400 rounded-full">
                  <ShoppingCart size={18} />
                </div>
              </motion.div>
            </div>
          </div>
        </header>
      )}

      {/* === MAIN CONTENT (Starts below header) === */}

      <div>
        <div className="md:hidden flex justify-between items-center px-[25px] mt-1">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="mt-1"
          >
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-5 py-3 shadow-sm focus-within:ring-2 focus-within:ring-orange-400 transition-all">
              <FiSearch className="text-gray-500 mr-[1px] " size={20} />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex bg-transparent outline-none text-gray-700 placeholder-gray-400 font-normal ml-[10px]"
              />
            </div>
          </motion.div>

          <div className="">
            <button
              onClick={() => navigate("/cartpage")}
              className="m-[1px]-1 p-[10px] rounded-full border b "
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CartWithBadge count={2} />
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="pt-[5px] md:pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            <AlertCircle className="mr-2" size={20} />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {/* Product Grid */}
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading ? (
            Array(6)
              .fill()
              .map((_, i) => <SkeletonCard key={i} />)
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <motion.div
                key={service.ProID}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card
                  className="h-[340px] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-300 cursor-pointer overflow-hidden group"
                  onClick={() => handleServiceClick(service)}
                >
                  <CardContent className="p-0 h-full flex flex-col">
                    <div className="h-[380px] overflow-hidden">
                      <img
                        src={service.imageUrl || spaImage}
                        alt={service.ProductName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.src = spaImage)}
                      />
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                        {service.ProductName}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1 flex-grow">
                        {service.ProductDes}
                      </p>
                      <span className="text-lg font-bold text-orange-600">
                        ₹{Number(service.Price).toFixed(0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">
                No products found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UsedProduct;
