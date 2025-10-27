import React, { useState } from "react";
import DriverHeader from "../../components/DriverHeader";
import InfoCard from "../../components/ui/InfoCard";
import { FaTv } from "react-icons/fa";
import { BsBicycle } from "react-icons/bs";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Footer from "../../components/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useMediaQuery } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Merchant = () => {
  const [xl] = useMediaQuery("(min-width: 1280px)");
  const [lg] = useMediaQuery("(min-width: 1024px)");
  const [md] = useMediaQuery("(min-width: 768px)");
  const [sm] = useMediaQuery("(min-width: 640px)");
  const navigate = useNavigate();

  const [openIndexes, setOpenIndexes] = useState([]);
  const toggleFAQ = (index) => {
    const isOpen = openIndexes.includes(index);
    setOpenIndexes((prevIndexes) =>
      isOpen ? prevIndexes.filter((i) => i !== index) : [...prevIndexes, index]
    );
  };
  const faqData = [
    {
      question:
        "What are the fees and commissions fomino  will charge my business?",
      answer:
        "fomino  charges you a commission from the orders made through the fomino  platform. There are no fees to join, and you can end the partnership at any time.",
    },
    {
      question: "When do I get paid after customers place orders on fomino?",
      answer:
        "You’ll need to be 18 years or older, and in possession of a valid work permit. Additional requirements vary depending on whether you want to deliver using a car, a scooter, or a bike. You’ll be informed about which documents are required based on your selected mode of transportation.",
    },
    {
      question: "What is the delivery radius from my venue?",
      answer:
        "fomino  typically has an up to 4 km delivery radius from a venue, but that may vary from city to city.",
    },
    {
      question: "How does the fomino  Courier Partner app work?",
      answer:
        "The fomino  Courier Partner app offers helpful tools and resources such as suggested directions, hotspots, real-time earnings totals. Once you’ve been approved to deliver, you can just open the fomino  Courier Partner app, and go online. You’ll then have the ability to accept and reject tasks.",
    },
  ];
  const cardData = [
    {
      image: "/images/driver/growWithFomino.svg",
      heading: "Grow with fomino ",
      textItems: [
        "Access our active customer base by offering pickup and delivery on the fomino  app. Plus, increase sales by reaching loyal customers using our fomino + subscription service – customers who order more from fomino  on average.",
      ],
      bgColor: "bg-[#f5fbfe]",
    },
    {
      image: "/images/driver/moreOrders.svg",
      heading: "Get more orders",
      textItems: [
        "With fomino , you can increase your orders by reaching our active customers. Joining is free and pricing is commission based. In addition, fomino  Ads helps you increase your visibility and get even more orders on the fomino  app.",
      ],
      bgColor: "bg-[#871DC40A]",
    },
    {
      image: "/images/driver/deliveryTo.svg",
      heading: "Deliver to more customers",
      textItems: [
        "After an order is placed, fomino  courier partners deliver to your customers in about 30 minutes. You can also connect your own website or app and deliver with fomino  Drive – offering same-hour express deliveries from your business to your customers’ homes.",
      ],
      bgColor: "bg-[#20212505]",
    },
  ];
  const reviewData = [
    {
      id: 1,
      image: "/images/driver/mc.webp",
      testimonial: "Thanks to fomino, we've been able to double our sales.",
      name: "Mohamad Harkal & Mahmoud Felleh",
      role: "Owner",
      company: "Möllers Köttbullar",
      logo: "/images/driver/mclogo.webp",
    },
    {
      id: 2,
      image: "/images/driver/team.jpg",
      testimonial: "fomino is modern and technically most advanced.",
      name: "Denis Ben Hamed",
      role: "Owner",
      company: "Rembrandt Burger",
      logo: "/images/driver/mkblau.webp",
    },
    {
      id: 3,
      image: "/images/driver/Testimony.webp",
      testimonial: "fomino is modern and technically most advanced.",
      name: "Denis Ben Hamed",
      role: "Owner",
      company: "Rembrandt Burger",
      logo: "/images/driver/Burgerbunt.webp",
    },
    // Add more review objects as needed...
  ];

  return (
    <>
      <DriverHeader />
      <section className="font-sf">
        <div className="py-32 pb-12 sm:pb-20 sm:py-40  flex flex-col justify-center items-center space-y-8 sm:space-y-10">
          <h1 className="px-6 max-w-[850px] leading-[50px] lg:leading-[67px]  font-bold font-omnes text-[40px] md:text-[56px] text-center sm:leading-none  sm:px-0  ">
            Reach more customers and grow your business with fomino
          </h1>
          <p className="text-base text-theme-black-2 text-opacity-65 text-center sm:px-0 px-4">
            Partner with fomino to create more sales on the app and through your
            own website
          </p>
          <button
            onClick={() => navigate("/merchant-signup")}
            className="mx-auto font-sf font-semibold mt-2 my-5 py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red "
          >
            Sign up now
          </button>
        </div>
        <div>
          <img
            src="/images/driver/hero.webp"
            alt="hero"
            className="w-full sm:h-full h-72 object-cover"
          />
        </div>
        <div className="my-20 md:my-40 space-y-10">
          <h2 className="text-center text-[32px] md:text-5xl font-bold font-omnes">
            Why partner with us?
          </h2>
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-5 max-w-[1300px] px-4 mx-auto ">
            {cardData.map((card, index) => (
              <InfoCard
                key={index}
                image={card.image}
                heading={card.heading}
                textItems={card.textItems}
                bgColor={card.bgColor}
              />
            ))}
          </div>
        </div>

        <section className="max-w-[1300px] mx-auto px-4 mb-36 space-y-40">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 lg:order-1 order-2">
              <h2 className="text-theme-black-2 font-bold text-[32px] md:text-5xl font-omnes">
                How fomino works
              </h2>
              <p className="text-theme-black-2 text-opacity-65 text-base ">
                A customer browses the fomino app and places an order from your
                store. The order appears in the Merchant App for you to
                complete. Once packed and ready, a courier partner will arrive
                to pick up the order and deliver the goods to the customer. In
                total, it takes about 30 minutes for the customer to receive and
                enjoy their order.
              </p>

              <button className="mx-auto font-sf font-semibold mt-2 my-5 py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red ">
                Grow your business
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden lg:order-1 order-1">
              <img
                src="/images/driver/merchant1.jpg"
                alt=""
                className="w-full h-full"
              />
            </div>
          </div>
          {/*  */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="rounded-2xl overflow-hidden lg:order-1 order-1">
              <img
                src="/images/driver/merchant2.jpg"
                alt=""
                className="w-full h-full"
              />
            </div>
            <div className="space-y-6 lg:order-1 order-2">
              <h2 className="text-theme-black-2 font-bold text-[32px] md:text-5xl font-omnes leading-none md:leading-[56px]">
                World-class Customer Support for your success
              </h2>
              <p className="text-theme-black-2 text-opacity-65 text-base ">
                Our 24/7 Customer Support replies in your local language in a
                matter of minutes. We’re available to you and your customers
                until the last order of the day is delivered.
              </p>

              <button className="mx-auto font-sf font-semibold mt-2 my-5 py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red ">
                Get started
              </button>
            </div>
          </div>

          {/*  */}
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 lg:order-1 order-2">
              <h2 className="text-theme-black-2 font-bold text-[32px] md:text-5xl font-omnes">
                Insights that deliver growth
              </h2>
              <p className="text-theme-black-2 text-opacity-65 text-base ">
                The fomino Merchant Portal gives you tailored tools to grow your
                business. Access easy-to-use actionable insights, track payouts
                and orders, edit menu items and discover performance metrics
                that can help you grow your business.
              </p>

              <button className="mx-auto font-sf font-semibold mt-2 my-5 py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red ">
                Grow your business
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden lg:order-1 order-1">
              <img
                src="/images/driver/merchant3.jpg"
                alt=""
                className="w-full h-full"
              />
            </div>
          </div>
          {/*  */}

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="rounded-2xl overflow-hidden lg:order-1 order-1">
              <img
                src="/images/driver/merchant4.jpg"
                alt=""
                className="w-full h-full"
              />
            </div>
            <div className="space-y-6 lg:order-1 order-2">
              <h2 className="text-theme-black-2 font-bold text-[32px] md:text-5xl font-omnes leading-normal md:leading-[56px]">
                You do what you do best, and we'll handle the rest
              </h2>
              <p className="text-theme-black-2 text-opacity-65 text-base ">
                fomino handles customer support and the backend of payments,
                including fraud prevention. You can focus on running your
                business while we handle the rest.
              </p>

              <button className="mx-auto font-sf font-semibold mt-2 my-5 py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red ">
                Get started
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col md:flex-row justify-center items-start gap-x-12 gap-y-12 mb-36 md:px-0 px-4 ">
          <div className="flex flex-row md:flex-col gap-y-5 gap-x-6 items-center justify-center ">
            <div className="bg-theme-red-2 w-12 h-12 sm:w-20 sm:h-20 rounded-full justify-center flex items-center text-white">
              <FaTv className="text-xl sm:text-2xl md:text-4xl lg:text-4xl" />
            </div>
            <div className="flex flex-col md:items-center justify-center md:gap-y-4">
              <h2 className="font-bold text-theme-black-2 text-2xl md:text-[32px] font-omnes">
                45m+
              </h2>
              <p className="font-sf text-base text-theme-black-2 text-opacity-65">
                Registered users
              </p>
            </div>
          </div>
          <div className="flex flex-row md:flex-col gap-y-5 gap-x-6 items-center justify-center">
            <div className="bg-theme-red-2 w-12 h-12 sm:w-20 sm:h-20 rounded-full justify-center flex items-center text-white">
              <BsBicycle className="text-xl sm:text-2xl md:text-4xl lg:text-4xl" />
            </div>
            <div className="flex flex-col md:items-center justify-center md:gap-y-4">
              <h2 className="font-bold text-theme-black-2 text-[32px] font-omnes text-center leading-10">
                260000+
              </h2>
              <p className="font-sf text-base text-theme-black-2 text-opacity-65">
                Courier partners
              </p>
            </div>
          </div>
          <div className="flex flex-row md:flex-col gap-y-5 gap-x-6 items-center justify-center">
            <div className="bg-theme-red-2 w-12 h-12 sm:w-20 sm:h-20 rounded-full justify-center flex items-center text-white">
              <BsBicycle className="text-xl sm:text-2xl md:text-4xl lg:text-4xl" />
            </div>
            <div className="flex flex-col md:items-center justify-center md:gap-y-4">
              <h2 className="font-bold text-theme-black-2 text-[32px] font-omnes md:text-center leading-10">
                32 min
              </h2>
              <p className="font-sf text-base text-theme-black-2 text-opacity-65 md:text-center">
                Average delivery time
              </p>
            </div>
          </div>
          <div className="flex flex-row md:flex-col gap-y-5 gap-x-6 items-center justify-center">
            <div className="bg-theme-red-2 w-12 h-12 sm:w-20 sm:h-20 rounded-full justify-center flex items-center text-white">
              <BsBicycle className="text-xl sm:text-2xl md:text-4xl lg:text-4xl" />
            </div>
            <div className="flex flex-col md:items-center justify-center md:gap-y-4">
              <h2 className="font-bold text-theme-black-2 text-[32px] font-omnes text-center leading-10">
                170 000+
              </h2>
              <p className="font-sf text-base text-theme-black-2 text-opacity-65 md:text-center">
                Merchant partners
              </p>
            </div>
          </div>
        </div>

        <div className=" max-w-[1400px] px-4 sm:px-10 mx-auto  ">
          <div className="flex gap-5 justify-center items-center flex-wrap  ">
            <div className="p-6 pb-14 rounded-3xl bg-[#f5fbfe] space-y-5 w-[417px]">
              <div>
                <img
                  src="/images/driver/merchantCard1.jpg"
                  alt="courier"
                  className="h-[300px] rounded-xl w-full object-cover "
                />
              </div>
              <div className="space-y-4 text-center">
                <h4 className="font-omnes font-bold text-theme-black-2 text-[32px]">
                  fomino for restaurants
                </h4>
                <p className="text-theme-black-2 text-opacity-60 text-center space-y-3 font-normal text-base">
                  See how restaurants benefit from fomino .
                </p>
                <button className="mx-auto font-sf font-semibold !mt-8 py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red ">
                  Learn more
                </button>
              </div>
            </div>
            <div className="p-6 pb-14 rounded-3xl bg-[#871DC40A] space-y-5 w-[417px]">
              <div>
                <img
                  src="/images/driver/merchantCard2.png "
                  alt="courier"
                  className="h-[300px] rounded-xl w-full object-cover "
                />
              </div>
              <div className="space-y-4 text-center">
                <h4 className="font-omnes font-bold text-theme-black-2 text-[32px]">
                  fomino for restaurants
                </h4>
                <p className="text-theme-black-2 text-opacity-60 text-center space-y-3 font-normal text-base">
                  See how restaurants benefit from fomino .
                </p>
                <button className="mx-auto font-sf font-semibold !mt-8  py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red ">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center flex-col my-40 space-y-10">
          <h2 className="text-[32px] md:text-5xl font-bold font-omnes max-w-[500px] text-center md:leading-[56px]">
            Getting started is easy – sign up today
          </h2>
          <p className="text-base text-theme-black-2 text-opacity-65 font-sf text-center px-4 ">
            Sign up and get the most out of fomino . Just fill in a few details
            about your business and you’ll be all set in no time.
          </p>

          <button className="mx-auto font-sf font-semibold mt-2 my-5 py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red ">
            Sign up
          </button>
        </div>

        <div className="bg-[#eeeeee] lg:pb-28 pb-10">
          <div className="max-w-[1400px] mx-auto flex flex-col justify-center items-center space-y-6">
            <h2 className="px-4 py-10 md:px-72 md:py-16 font-omnes text-4xl md:text-5xl font-bold text-center md:leading-[56px]">
              Over 120 000 merchants already grow their business with fomino
            </h2>

            <div className=" max-w-[1400px] w-full mx-auto px-4">
              <div className="swiper-container ">
                <Swiper
                  spaceBetween={30}
                  slidesPerView={xl ? 3.1 : lg ? 3.1 : md ? 2.2 : 1.2}
                  className="[&>div>div>button]:shadow-restaurantCardSahadow pb-4 px-1"
                >
                  {reviewData.map((offer) => (
                    <SwiperSlide key={offer.id}>
                      <div className="flex flex-col rounded-3xl overflow-hidden bg-white shadow-courierContainerShadow h-[760px]">
                        <div className="w-full h-[277px]">
                          <img
                            src={offer.image}
                            alt={offer.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-10 text-center font-sf space-y-6">
                          <p>{offer.testimonial}</p>
                          <p className="font-bold text-theme-black-2">
                            {offer.name}
                          </p>
                          <div>
                            <p className="font-bold">Owner</p>
                            <p className="text-sm text-theme-black-2 text-opacity-65">
                              {offer.company}
                            </p>
                          </div>
                          <img
                            src={offer.logo}
                            alt={offer.company}
                            className="w-32 mx-auto "
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 max-w-[800px] mx-auto my-28">
          <h2 className="font-bold text-[32px] sm:text-5xl font-omnes text-center text-theme-black-2 !mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <button
                key={index}
                onClick={() => toggleFAQ(index)}
                className="p-8 w-full text-start rounded-xl border border-theme-black-2 border-opacity-10"
              >
                <div className="flex justify-between items-center gap-x-1">
                  <h6 className="font-medium  text-base text-theme-black-2">
                    {item.question}
                  </h6>
                  {openIndexes.includes(index) ? (
                    <FaChevronUp size={16} />
                  ) : (
                    <FaChevronDown size={16} />
                  )}
                </div>
                <p
                  className={`mt-2 font-normal text-sm text-theme-black-2 text-opacity-65 font-sf ${
                    openIndexes.includes(index) ? "block" : "hidden"
                  }`}
                >
                  {item.answer}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-5 justify-center items-center text-center mb-24">
          <h4 className="font-bold lg:text-5xl text-4xl font-omnes text-theme-black-2">
            Need more information?
          </h4>
          <p className="font-normal  text-base text-theme-black-2 text-opacity-60  mx-auto max-w-[800px] px-4">
            Leave us your contact information and we'll be in touch soon.
          </p>
          <button className="mx-auto font-sf font-semibold mt-2 my-5 py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red ">
            Contact us
          </button>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Merchant;
