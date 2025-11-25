import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WomenSaloonIn from "./component/ui/womensaloonIn";
import PaymentPage from "./component/ui/paymentpage";
import Navbar from "./component/Navigation";
import Footer from "./component/Footer";
import Login from "./component/login/Login";
import OtpVerification from "./component/ui/otpverification";
import MobileNavbar from "./component/MobileNavb";
import { CartProvider } from "./component/context/cartContext";
import Course from "./component/ui/course";
import SkinAnalyzer from "./component/ui/skinanalyzer";
import UserProfile from "./component/ui/userprofile";
import JoinCourses from "./component/ui/join";
import TermsPage from "./component/ui/terms&condition";
import PrivacyAndPolicy from "./component/ui/privacy&policy";
import TransactionHistory from "./component/ui/transactions";
import ProductScreen from "./component/ui/products";
import ProductMainPage from "./component/ui/productmainpage";
import CartPage from "./component/ui/cartmainpage";
import ContactInfo from "./component/ui/contact";
import ScrollToTop from "./component/context/scrolltop";
import UsedProduct from "./component/ui/usedproduct";
import RegisterPage from "./component/ui/register";
import VendorWait from "./component/ui/vendorwait";
import Product from "./component/ui/products";

const queryClient = new QueryClient();

// Layout Wrapper
const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const isHomePage = location.pathname === "/";

  return (
    <div
      className="min-h-screen font-sans flex flex-col bg-gray-50 
                 mt-[env(safe-area-inset-top)] sm:mt-2"
    >
      {/* Desktop Navbar */}
      {!isMobile && (
        <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
          <Navbar />
        </header>
      )}

      {/* Main Content */}
      <main>{children}</main>

      {/* Mobile Navbar (only on home) */}
      {isMobile && isHomePage && (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-white shadow-t-md">
          <MobileNavbar />
        </div>
      )}

      {/* Footer - show only on desktop */}
      {!isMobile && (
        <footer className="mt-8 bg-gray-100 z-10">
          <Footer />
        </footer>
      )}
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <HashRouter>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/womensaloonIn" element={<WomenSaloonIn />} />
              <Route path="/paymentpage" element={<PaymentPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/otpverification" element={<OtpVerification />} />
              <Route path="/course" element={<Course />} />
              <Route path="/skinanalyzer" element={<SkinAnalyzer />} />
              <Route path="/userprofile" element={<UserProfile />} />
              <Route path="/joincourses" element={<JoinCourses />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              <Route path="/productscreen" element={<ProductScreen />} />
              <Route path="/productmainpage" element={<ProductMainPage />} />
              <Route path="/cartpage" element={<CartPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyAndPolicy />} />
              <Route path="/contact" element={<ContactInfo />} />
              <Route path="/usedproduct" element={<UsedProduct />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/vendorwait" element={<VendorWait />} />
              <Route path="/newproduct" element={<Product />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </HashRouter>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;
