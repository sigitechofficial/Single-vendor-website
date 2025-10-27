import React, { useState } from "react";
import DriverHeader from "../../components/DriverHeader";
import Footer from "../../components/Footer";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import InfoCard from "../../components/ui/InfoCard";

export default function Driver() {
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
      question: "How long does the application process take?",
      answer:
        "Typically, it takes less than 30 minutes to fill out the application. If you’re new to Wolt, you’ll need to create an account, enter in a few basic details, and upload the required documents.",
    },
    {
      question: "Are there other requirements to deliver?",
      answer:
        "You’ll need to be 18 years or older, and in possession of a valid work permit. Additional requirements vary depending on whether you want to deliver using a car, a scooter, or a bike. You’ll be informed about which documents are required based on your selected mode of transportation.",
    },
    {
      question:
        "What does delivering using Wolt offer that traditional delivery jobs don’t?",
      answer:
        "Wolt Courier Partners are able to work flexible hours, whenever they choose. As a Courier Partner, you don’t have to choose between a traditional full-time food delivery job or part-time delivery driver job. Instead, as an independent contractor, you decide on your own schedule.",
    },
    {
      question: "How does the Wolt Courier Partner app work?",
      answer:
        "The Wolt Courier Partner app offers helpful tools and resources such as suggested directions, hotspots, real-time earnings totals. Once you’ve been approved to deliver, you can just open the Wolt Courier Partner app, and go online. You’ll then have the ability to accept and reject tasks.",
    },
  ];
  const cardData = [
    {
      image: "/images/sec5-img1.webp",
      heading: "Competitive Earnings",
      textItems: [
        "The more you deliver, the more money you can earn",
        "The more you deliver, the more money you can earn",
      ],
      bgColor: "bg-[#f5fbfe]",
    },
    {
      image: "/images/driver/driver2.webp",
      heading: "Flexible hours",
      textItems: [
        "Unlike full-time or part-time jobs, you decide your own hours",
        "Delivering with Wolt fits easily into your day-to-day life – giving you a flexible way to work",
      ],
      bgColor: "bg-[#871DC40A]",
    },
    {
      image: "/images/driver/driver3.jpg",
      heading: "Amazing support",
      textItems: [
        "Wolt's Support Team are on hand should you ever need help",
        "The Courier Partner app makes it easy to find your way around town.",
      ],
      bgColor: "bg-[#20212505]",
    },
  ];
  return (
    <>
      {/* <Header home={true} rest={false} /> */}
      <DriverHeader />
      <section className="font-sf">
        <div className=" py-32 pb-12 sm:pb-32 sm:py-40  flex flex-col justify-center items-center space-y-8 sm:space-y-10">
          <h1 className="font-bold font-omnes text-[40px] md:text-[56px] text-center sm:leading-none leading-10 sm:px-0 px-10 ">
            Become a Fomino Courier
          </h1>
          <button
            onClick={() => navigate("/driver-signup")}
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
        <div className=" mx-auto ">
          <div className="max-w-[808px] space-y-5 text-center mx-auto sm:py-28 py-10 ">
            <h2 className="text-base  text-theme-black-2 font-sf text-opacity-60 ">
              Enjoy the thrill of spreading joy with Wolt!{" "}
              <span className="text-opacity-100 text-theme-black-2">🌟</span>
            </h2>
            <p className="font-sf  text-base  text-theme-black-2 text-opacity-60 text-center  mx-auto px-10">
              Join our team and become the ultimate happiness hero in your city,
              starting at a guaranteed €12.41 per hour. As you bring joy to our
              customers, you will receive bonuses for your exceptional work. On
              top, we compensate you for distance, phone, and data usage. With
              our thoughtfully crafted preset schedule, you'll find the perfect
              balance between work and leisure.
              <br />
              <span className="text-opacity-100 text-theme-black-2"> 🚴💨</span>
            </p>
          </div>
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-5 max-w-[1400px] px-4 sm:px-10 mx-auto">
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
          <div className="text-center space-y-8 my-36">
            <h4 className="text-[32px] sm:text-5xl font-bold font-omnes !pb-12">
              {" "}
              💖 Next steps
            </h4>
            <div className="flex md:flex-row flex-col justify-center items-start md:items-start gap-x-5 gap-y-8 ">
              <div className="flex md:flex-col gap-y-6 items-center justify-center sm:w-60 px-4 sm:px-0 sm:gap-x-0 gap-x-6">
                <div className="font-omnes font-bold sm:text-5xl text-[30px] text-white bg-theme-red-2 w-12 h-12 sm:w-[80px] sm:h-[80px] flex justify-center items-center rounded-fullest">
                  1
                </div>
                <h6 className="font-omnes font-bold text-2xl sm:text-[32px] text-theme-black-2   leading-tight text-start sm:text-center">
                  Submit your application.
                </h6>
              </div>
              <div className="flex md:flex-col gap-y-6 items-center justify-center sm:w-60 px-4 sm:px-0 sm:gap-x-0 gap-x-6">
                <div className="font-omnes font-bold sm:text-5xl text-[30px] text-white bg-theme-red-2 w-12 h-12 sm:w-[80px] sm:h-[80px] flex justify-center items-center rounded-fullest">
                  2
                </div>
                <h6 className="font-omnes font-bold text-2xl sm:text-[32px] text-theme-black-2   leading-tight text-start sm:text-center">
                  Get Approved.
                </h6>
              </div>
              <div className="flex md:flex-col gap-y-6 items-center justify-center sm:w-60 px-4 sm:px-0 sm:gap-x-0 gap-x-6">
                <div className="font-omnes font-bold sm:text-5xl text-[30px] text-white bg-theme-red-2 w-12 h-12 sm:w-[80px] sm:h-[80px] flex justify-center items-center rounded-fullest">
                  3
                </div>
                <h6 className="font-omnes font-bold text-2xl sm:text-[32px] text-theme-black-2   leading-tight text-start sm:text-center">
                  Deliver & earn!
                </h6>
              </div>
            </div>
            <button
              onClick={() => navigate("/driver-signup")}
              className="mx-auto font-sf font-semibold !mt-28  py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red "
            >
              Apply now
            </button>
          </div>

          <div className="px-6 py-6  rounded-3xl shadow-courierContainerShadow max-w-[1300px]  mx-4 sm:mx-auto ">
            <div className="grid lg:grid-cols-2 gap-y-5 gap-x-5">
              <div className="space-y-6 flex flex-col justify-center sm:px-10 sm:pe-36 order-2 sm:order-1 ">
                <h4 className="font-bold text-[32px] sm:text-[48px] font-omnes text-theme-black-2 sm:leading-none">
                  A few things you’ll need to get started
                </h4>

                <ul className="text-theme-black-2 text-opacity-60 space-y-3 font-normal text-base">
                  <li>
                    <span className="text-theme-black-2 text-opacity-65">
                      ✔
                    </span>{" "}
                    A bike, car, or scooter
                  </li>
                  <li>
                    <span className="text-theme-black-2 text-opacity-65">
                      ✔
                    </span>{" "}
                    A valid driving license (for motorized vehicles)
                  </li>
                  <li>
                    <span className="text-theme-black-2 text-opacity-65">
                      ✔
                    </span>{" "}
                    ID and proof of right to work
                  </li>
                  <li>
                    <span className="text-theme-black-2 text-opacity-65">
                      ✔
                    </span>{" "}
                    A smartphone with data connection
                  </li>
                </ul>
                <button
                  onClick={() => navigate("/driver-signup")}
                  className="max-w-32 font-sf font-semibold   py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red "
                >
                  Apply now
                </button>
              </div>
              <div className="w-full sm:h-[700px]  rounded-2xl overflow-hidden order-1 sm:order-2">
                <img
                  src="/images/driver/driver3.jpg"
                  alt="delivery-man"
                  className="w-full h-full object-cover "
                />
              </div>
            </div>
          </div>
        </div>

        <div className="2xl:w-4/5 w-11/12 mx-auto sm:py-24 py-16 space-y-20">
          <div className="flex flex-col items-center justify-center gap-y-5">
            <h2 className="font-omnes font-bold text-[32px] sm:text-5xl text-center text-theme-black-2 leading-snug">
              Sign up today and you'll
              <br /> hit the road in no time!
            </h2>
            <button
              onClick={() => navigate("/driver-signup")}
              className="max-w-32 font-sf font-semibold !mt-8  py-[14px] px-5  bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red "
            >
              Apply now
            </button>
          </div>
          <div className="space-y-8 max-w-[800px] mx-auto">
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
          <div className="flex flex-col gap-y-5 justify-center items-center text-center">
            <h4 className="font-bold lg:text-5xl text-4xl font-omnes text-theme-black-2">
              About Fomino 💖
            </h4>
            <p className="font-normal  text-base text-theme-black-2 text-opacity-60  mx-auto max-w-[800px] px-4">
              We’re a tech company from Finland, best known for our delivery
              app, which connects customers, local businesses, and couriers who
              are looking for an opportunity to earn money in a flexible way. In
              2015 we started with restaurant food and over time we added
              groceries, gifts, and other items. Now it’s possible for people
              living in hundreds of cities across 23 countries to get whatever
              they need, delivered quickly and reliably to their front door. We
              try to do right by people, making every city we enter a better
              place.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
