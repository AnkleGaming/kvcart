import React, { useEffect, useState } from "react";
import Colors from "../../core/constant";
import { MdVerified, MdBuild, MdSchedule, MdShield } from "react-icons/md";
import { RiUserSettingsFill } from "react-icons/ri";
import { GrShieldSecurity } from "react-icons/gr";

const WhyUs = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const features = [
    {
      icon: MdVerified,
      title: "Premium Products",
      description: "Top quality certified products",
      color: `text-${Colors.primaryMain}`,
    },
    {
      icon: MdSchedule,
      title: "Fast Delivery",
      description: "We provide fast delivery on our platform",
      color: `text-${Colors.primaryMain}`,
    },
    {
      icon: MdShield,
      title: "Return policy available",
      description: "5 days return policy available",
      color: `text-${Colors.primaryMain}`,
    },
  ];

  const sharedStyles = {
    container: "w-full py-12 px-4 bg-gray-50",
    grid: isMobile
      ? "flex flex-col gap-6 max-w-md mx-auto"
      : "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto",
    card: "bg-orange-50 shadow-lg rounded-xl border border-gray-100 flex flex-col items-center text-center p-6 hover:shadow-xl transition-shadow duration-300",
    icon: "text-5xl mb-4",
    title: "font-bold text-xl mb-2",
    description: "text-gray-600",
  };

  return (
    <div className={sharedStyles.container}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Why Choose Us?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We provide exceptional repair services with certified experts and
          premium parts.
        </p>
      </div>
      <div className={sharedStyles.grid}>
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className={sharedStyles.card}>
              <IconComponent
                className={`${sharedStyles.icon} ${feature.color}`}
              />
              <h3 className={`${sharedStyles.title} ${feature.color}`}>
                {feature.title}
              </h3>
              <p className={sharedStyles.description}>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhyUs;
