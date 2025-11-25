import React, { Suspense, lazy } from "react";
import Navigation from "../component/Navigation";
import HeroSection from "../component/HeroSection";
import PromoCard from "../component/PromocardSection";
import ServicesCarousel2 from "../component/ServicesCarousel2";
import ServicesCarousel4 from "../component/ServicesCarousel4";
import BecomeWePretiffyCard from "../component/ui/becomeweprettifycard";
import SpecialForYou from "../component/ui/specialyforyou";
import Footer from "../component/Footer";
import RatingScreen from "../component/ui/ratingscreen";
import WhyUs from "../component/ui/whyus";

const LazyServicesCarousel2 = lazy(() =>
  import("../component/ServicesCarousel2")
);
// const LazyServicesCarousel4 = lazy(() =>
//   import("../component/ServicesCarousel4")
// );
const LazyBecomeWePretiffyCard = lazy(() =>
  import("../component/ui/becomeweprettifycard")
);
const LazySpecialForYou = lazy(() => import("../component/ui/specialyforyou"));

const Index = () => {
  const dummyReviews = [
    {
      ID: 1,
      Name: "Vishal Gupta",
      Rating: "4",
      Review: "Great product! The quality exceeded my expectations.",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      ID: 2,
      Name: "Ananya Sharma",
      Rating: "5",
      Review: "Absolutely loved it. Highly recommend to others!",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      ID: 3,
      Name: "Rahul Verma",
      Rating: "4",
      Review: "It’s decent but could be improved in packaging.",
      image: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    {
      ID: 4,
      Name: "Priya Singh",
      Rating: "5",
      Review: "Very useful and affordable. Will buy again.",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      ID: 5,
      Name: "Aman Yadav",
      Rating: "5",
      Review: "The product works exactly as advertised. Worth the price!",
      image: "https://randomuser.me/api/portraits/men/76.jpg",
    },
    {
      ID: 6,
      Name: "Simran Kaur",
      Rating: "5",
      Review: "Excellent service and great product quality.",
      image: "https://randomuser.me/api/portraits/women/31.jpg",
    },
    {
      ID: 7,
      Name: "Rohit Sharma",
      Rating: "4",
      Review: "Superb experience! Will definitely purchase again.",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
    },
    {
      ID: 8,
      Name: "Sneha Patel",
      Rating: "4",
      Review: "Good product, packaging was also neat and clean.",
      image: "https://randomuser.me/api/portraits/women/24.jpg",
    },
    {
      ID: 9,
      Name: "Aditya Raj",
      Rating: "5",
      Review: "Fantastic product and timely delivery. Recommended!",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    {
      ID: 10,
      Name: "Neha Mehta",
      Rating: "4",
      Review: "Very happy with my purchase. Looks premium and durable.",
      image: "https://randomuser.me/api/portraits/women/50.jpg",
    },
    {
      ID: 11,
      Name: "Arjun Nair",
      Rating: "5",
      Review: "Product performance is great and value for money.",
      image: "https://randomuser.me/api/portraits/men/33.jpg",
    },
    {
      ID: 12,
      Name: "Kavya Joshi",
      Rating: "5",
      Review: "Loved the design and usability. Great experience overall.",
      image: "https://randomuser.me/api/portraits/women/37.jpg",
    },
    {
      ID: 13,
      Name: "Harsh Kumar",
      Rating: "5",
      Review: "Awesome product! The build quality is top-notch.",
      image: "https://randomuser.me/api/portraits/men/29.jpg",
    },
    {
      ID: 14,
      Name: "Isha Reddy",
      Rating: "5",
      Review: "Received it on time and it works perfectly fine.",
      image: "https://randomuser.me/api/portraits/women/63.jpg",
    },
    {
      ID: 15,
      Name: "Nitin Singh",
      Rating: "4",
      Review: "Met all my expectations. Really satisfied!",
      image: "https://randomuser.me/api/portraits/men/18.jpg",
    },
    {
      ID: 16,
      Name: "Pooja Mishra",
      Rating: "5",
      Review: "Stylish and efficient. A must-have product!",
      image: "https://randomuser.me/api/portraits/women/49.jpg",
    },
    {
      ID: 17,
      Name: "Deepak Chauhan",
      Rating: "4",
      Review: "Great experience overall. Customer support was helpful too.",
      image: "https://randomuser.me/api/portraits/men/55.jpg",
    },
    {
      ID: 18,
      Name: "Tanya Kapoor",
      Rating: "5",
      Review: "The product feels premium. Totally worth it!",
      image: "https://randomuser.me/api/portraits/women/52.jpg",
    },
    {
      ID: 19,
      Name: "Karan Malhotra",
      Rating: "5",
      Review: "Using it for a week, and it's performing great!",
      image: "https://randomuser.me/api/portraits/men/19.jpg",
    },
    {
      ID: 20,
      Name: "Divya Chauhan",
      Rating: "4",
      Review: "Elegant design and smooth functionality.",
      image: "https://randomuser.me/api/portraits/women/35.jpg",
    },
  ];

  return (
    <div className="min-h-screen p-[8px] ">
      <section className="relative bg-white">
        <HeroSection />
      </section>

      <section className="bg-white">
        <WhyUs />
      </section>

      <section className="bg-white">
        <PromoCard />
      </section>

      {/* Reviews Section - scrollable horizontally */}
      <section className="bg-white mb-[15px]">
        <div className="overflow-x-auto scrollbar-hide">
          <RatingScreen reviews={dummyReviews} />
        </div>
      </section>

      {/* <footer className="mt-8 bg-gray-100 z-10 md:hidden">
        <Footer />
      </footer> */}
    </div>
  );
};

export default Index;
