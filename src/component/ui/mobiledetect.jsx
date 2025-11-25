import React, { useEffect, useState } from "react";
import Colors from "../../core/constant";

// 🧩 Common model codes → real names
const modelMap = {
  // 🔹 Samsung
  "SM-S928B": "Samsung Galaxy S24 Ultra",
  "SM-S926B": "Samsung Galaxy S24+",
  "SM-S921B": "Samsung Galaxy S24",
  "SM-S918B": "Samsung Galaxy S23 Ultra",
  "SM-A556B": "Samsung Galaxy A55",
  "SM-A146P": "Samsung Galaxy A14",

  // 🔹 Vivo
  V2303A: "Vivo V40",
  V2327: "Vivo Y200e",
  V2230: "Vivo V27 Pro",
  V2141: "Vivo X80",

  // 🔹 Realme
  RMX3901: "Realme 11 Pro",
  RMX3840: "Realme Narzo 60x",
  RMX3741: "Realme 10",
  RMX3561: "Realme GT Neo 3",

  // 🔹 Oppo
  CPH2551: "Oppo Reno8 T",
  CPH2583: "Oppo F25 Pro",
  CPH2447: "Oppo Reno10 Pro",
  CPH2603: "Oppo A79 5G",

  // 🔹 Xiaomi / Redmi
  "22101316I": "Xiaomi 13 Pro",
  "23076PC4BI": "Redmi Note 12",
  "22011211RG": "Xiaomi 12 Pro",
  "24048RN6CI": "Redmi Note 13",

  // 🔹 OnePlus
  CPH2487: "OnePlus 11",
  CPH2581: "OnePlus Nord 3",
  CPH2573: "OnePlus 12R",

  // 🔹 iPhone (approx.)
  "iPhone15,4": "iPhone 16",
  "iPhone15,3": "iPhone 15 Pro Max",
  "iPhone14,5": "iPhone 14",
  "iPhone13,2": "iPhone 12",
  "iPhone12,1": "iPhone 11",

  // 🔹 Google Pixel
  "Pixel 9 Pro": "Google Pixel 9 Pro",
  "Pixel 8": "Google Pixel 8",
  "Pixel 7": "Google Pixel 7",
  "Pixel 6": "Google Pixel 6",
};

// 🔍 Helper function to map internal codes to nice names
const getPrettyModelName = (code) => {
  if (!code) return "Unknown Device";
  const cleaned = code.trim();
  return modelMap[cleaned] || cleaned;
};

const MobileDetect = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [deviceModel, setDeviceModel] = useState("Detecting...");

  // ✅ Detect using both User-Agent & modern API (UA Client Hints)
  const detectDeviceModel = async () => {
    let model = "Unknown Device";

    // Modern browsers (Chrome, Edge)
    if (navigator.userAgentData) {
      try {
        const ua = await navigator.userAgentData.getHighEntropyValues([
          "model",
          "platform",
          "mobile",
        ]);
        if (ua.model) model = ua.model;
      } catch (e) {
        console.warn("UserAgentData detection failed:", e);
      }
    }

    // Fallback: classic userAgent parsing
    if (model === "Unknown Device") {
      const ua = navigator.userAgent;

      if (/Android/i.test(ua)) {
        const match = ua.match(/Android.*;\s?([^)]+)/);
        if (match && match[1]) {
          model = match[1]
            .split(";")
            .pop()
            .replace(/Build.*/, "")
            .trim();
        } else model = "Android Device";
      } else if (/iPhone/i.test(ua)) {
        model = "iPhone";
      } else if (/iPad/i.test(ua)) {
        model = "iPad";
      } else if (/Windows/i.test(ua)) {
        model = "Windows PC";
      } else if (/Mac/i.test(ua)) {
        model = "Mac";
      } else if (/Linux/i.test(ua)) {
        model = "Linux Device";
      }
    }

    // Return friendly model name
    return getPrettyModelName(model);
  };

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640);
    checkScreen();
    window.addEventListener("resize", checkScreen);

    detectDeviceModel().then(setDeviceModel);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const sharedStyles = {
    container: "w-full flex items-center justify-center py-8",
    card: "bg-orange-50 shadow-lg rounded-xl border border-gray-200 flex flex-col items-center text-center p-6 max-w-sm w-full",
    title: `font-bold text-xl mb-3 text-${Colors.primaryMain}`,
    model: "font-semibold text-lg text-gray-800 mb-2",
    subtitle: "text-sm text-gray-500",
  };

  const DeviceCard = ({ title, subtitle }) => (
    <div className={sharedStyles.container}>
      <div className={`${sharedStyles.card} p-8`}>
        <div className={sharedStyles.title}>{title}</div>
        <div className={sharedStyles.model}>{deviceModel}</div>
        {/* <div className={sharedStyles.subtitle}>{subtitle}</div> */}
      </div>
    </div>
  );

  return isMobile ? (
    <DeviceCard title="📱 Your Device" subtitle="Detected on mobile" />
  ) : (
    <DeviceCard title="💻 Your Device Model" subtitle="Running on desktop" />
  );
};

export default MobileDetect;
