import React, { useState } from "react";
import Home from "../pages/Index";
import UserProfile from "./ui/userprofile";
import logo from "../assets/logo.png";
import Colors from "../core/constant";
import { CiUser } from "react-icons/ci";

const navItems = [
  {
    label: "KV",
    // Fixed: Logo is now properly sized and centered
    icon: (
      <div className="w-10 h-10 flex items-center justify-center">
        <img
          src={logo}
          alt="KV Logo"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    ),
    component: <Home />,
  },
  {
    label: "Profile",
    icon: (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
        <CiUser />
      </div>
    ),
    component: <UserProfile />,
  },
];

const MobileNavbar = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="relative h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {navItems[activeTab].component}
      </div>
 
      {/* Floating Bottom Navbar - Clean & Balanced */}
      <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[97%] max-w-lg z-50">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 px-3 py-2">
          <div className="flex justify-around items-center">
            {navItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(index)}
                className="relative flex flex-col items-center gap-1.5 transition-all duration-300"
              >
                {/* Icon with smooth scale */}
                <div
                  className={`transition-all duration-300 ${
                    activeTab === index
                      ? "scale-125 drop-shadow-md"
                      : "scale-100 opacity-75"
                  }`}
                >
                  {item.icon}
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    activeTab === index
                      ? "text-orange-600 font-bold"
                      : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Indicator Dot */}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MobileNavbar;
