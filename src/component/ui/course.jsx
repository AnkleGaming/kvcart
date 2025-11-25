import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CourseCard from "./coursecard";

const Course = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.section
      className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 px-4 sm:px-6 lg:px-12 py-12 sm:py-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Course section"
    >
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <CourseCard />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default Course;

// import React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import OrderStatusTracker from "./orderstatus";

// const Course = () => {
//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { duration: 0.5 } },
//   };

//   // Dummy data for OrderStatusTracker - replace with API later
//   const dummyStatuses = [
//     "Ordered",
//     "Shipped",
//     "Ready for Delivery",
//     "Delivered",
//   ];
//   const dummyCurrentIndex = 2; // e.g., "Ready for Delivery" is current

//   return (
//     <motion.section
//       className="mt-10 min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 px-4 sm:px-6 lg:px-12 py-12 sm:py-16"
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//       aria-label="Order Status section"
//     >
//       <div className="max-w-7xl mx-auto">
//         <AnimatePresence>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             <OrderStatusTracker
//               statuses={dummyStatuses}
//               currentIndex={dummyCurrentIndex}
//             />
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     </motion.section>
//   );
// };

// export default Course;
