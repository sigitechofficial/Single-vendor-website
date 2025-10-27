import { useRef, useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CountrySection from "../../components/CountrySection";
import { useNavigate, useParams } from "react-router-dom";
import HomeCard from "../../components/HomeCard";
import { Autocomplete } from "@react-google-maps/api";
import GetAPI from "../../utilities/GetAPI";
import { info_toaster } from "../../utilities/Toaster";
import { useTranslation } from "react-i18next";
import { IoPlayCircle } from "react-icons/io5";
import LazyLoadComponent from "../../components/LazyLoadComponent";

export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const autocompleteRef = useRef(null);

  const calculateRoute = () => {
    if (!autocompleteRef.current) {
      return;
    }
    const place = autocompleteRef.current.getPlace();
    const formattedAddress = place.formatted_address;

    const countryComponent = place?.address_components.find((component) =>
      component.types.includes("country")
    );
    const countryName = countryComponent ? countryComponent.long_name : "";
    const countryShortName = countryComponent
      ? countryComponent.short_name
      : " ";

    const cityComponent = place?.address_components.find((component) =>
      component.types.includes("locality")
    );

    const city = cityComponent
      ? cityComponent.long_name
      : `lat=${place.geometry.location.lat()}&lng=${place.geometry.location.lng()} `;

    if (!place || !place.geometry || !place.geometry.location) {
      info_toaster("Please select an address");
      return;
    }
    const latLng = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    localStorage.setItem("countryShortName", countryShortName);
    localStorage.setItem("countryName", countryName);
    localStorage.setItem("guestFormatAddress", city);
    localStorage.setItem("lat", latLng.lat);
    localStorage.setItem("lng", latLng.lng);
    localStorage.setItem("guestFormatAddress", formattedAddress);
    navigate(
      `/${countryShortName.toLowerCase()}/${city
        .replace(/\s+/g, "")
        .toLowerCase()}/restaurants`
    );
  };

  return (
    <>
      <Header home={true} rest={false} setLoginModal={false} />
      <section className="bg-theme-gray-13 xl:pt-[66.57px] md:pt-[59.15px] pt-[54.15px] smallDesktop:bg-hero-bg bg-no-repeat bg-cover bg-center  ">
        <div className="max-w-[1200px]  mx-auto grid grid-cols-1 lg:grid-cols-2 h-[650px] ">
          <div className="px-[16px] sm:px-[30px] lg:py-28 py-12 md:space-y-8 space-y-6  flex flex-col justify-center pe-7">
            <h2 className="font-omnes font-bold lg:text-[52px] text-[40px]  tracking-tight leading-10 sm:leading-10">
              {t("Order food and more")}
            </h2>
            <p className="font-bold text-theme-black-2 font-sf xl:text-[28px] text-xlsm:leading-8 leading-tight">
              <span> {t("Find restaurant and shops delivering")} </span>
              {i18n.language === "en" && <br className="lg:block hidden" />}
              {t("near you")}
            </p>
            <Autocomplete
              onLoad={(autocomplete) =>
                (autocompleteRef.current = autocomplete)
              }
              onPlaceChanged={calculateRoute}
            >
              <div className="w-full relative">
                <input
                  type="text"
                  className="font-sf sm:py-4 py-2.5 pl-4 pr-[120px] w-full bg-theme-gray border border-black border-opacity-40 rounded-full font-light text-base  placeholder:text-black placeholder:text-opacity-40 focus:outline-none"
                  placeholder={t("Choose a delivery address")}
                />
                <button
                  onClick={calculateRoute}
                  className="px-8 sm:py-3 py-2 rounded-full bg-theme-red font-medium text-base font-sf text-white absolute right-[3px] md:right-[5px] top-1/2 -translate-y-1/2"
                >
                  {t("Search")}
                </button>
              </div>
            </Autocomplete>
          </div>

          <div className="flex bg-theme-red pt-16 pb-5 sm:pb-10 lg:py-20 md:h-full   flex-col  items-center lg:items-end justify-center gap-y-8 hero-bg   ">
            <div className="flex flex-col justify-center items-center gap-y-8 desktop:me-0 lg:me-28 ">
              <img
                src="/images/burger.webp"
                alt="burger"
                className="w-44 lg:w-56 extraLargeDesktop:w-[260px] object-contain"
              />
              <img
                src="/images/logo-2.webp"
                alt="logo"
                className="w-40 md:w-48 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className=" lg:py-20 relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-[44%] lg:before:bg-theme-gray">
        <div className="max-w-[1200px] lg:px-[30px] mx-auto">
          <div className=" w-full shadow-lgBoxShadow rounded lg:grid grid-cols-2 relative">
            <div className="lg:py-28 px-6 py-20 lg:px-28 flex flex-col justify-between lg:justify-center h-full sm:gap-y-8 gap-y-6 lg:bg-white absolute lg:relative z-10">
              <div className=" font-semibold text-2xl font-omnes text-white lg:text-theme-black-2  mb-5 ">
                {t("What is Fomino?")}
              </div>
              <h2 className="font-bold text-[28px] sm:text-[48px] font-omnes text-white lg:text-theme-black-2">
                {t("We deliver it.")}
              </h2>
              <p className="font-normal text-base  font-sf  text-theme-black-2 hidden lg:block">
                {t(
                  "Fomino makes it incredibly easy for you to discover and get what you want. Delivered to you - quickly, reliably and affordably."
                )}
              </p>
              <button className=" text-start text-white lg:text-theme-green-2 font-normal text-xl font-sf flex items-center  gap-x-2">
                <IoPlayCircle className="text-white lg:text-theme-green-2 w-[50px] h-[50px] sm:w-[70px] sm:h-[70px]" />
                {t("Watch video")}
              </button>
            </div>
            <div className="before:absolute before:bg-black before:w-full before:h-full before:opacity-25 lg:before:bg-transparent lg:before:w-auto lg:before:h-auto">
              <img
                src="/images/sec2-img.webp"
                alt="kitchen"
                className="w-full h-[320px] sm:h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 md:py-24 lg:py-28">
        <div className="max-w-[1200px] px-[24px] sm:px-[90px] lg:px-[185px]  mx-auto flex flex-col items-center gap-y-8 lg:gap-y-[40px]">
          <h3 className="font-omnes text-theme-black-2 font-bold text-[32px] md:text-[48px] text-center ">
            {t("Did you know?")}
          </h3>
          <p className="font-normal text-lg md:text-xl lg:text-[28px] lg:leading-10 text-center text-theme-black-2 font-sf">
            {t(
              "Getting home-delivered sushi is more than your life made easy. When you order with Fomino, you help thousands of hard-working restaurant and store owners and couriers make a living."
            )}
          </p>
        </div>
      </section>

      <LazyLoadComponent>
        <section className="pt-[73px] sm:pt-[181px] md:py-[181px] bg-theme-gray-2 relative md:before:block before:hidden before:absolute before:bottom-0 before:right-0 ultraLargeDesktop:before:right-80 before:h-full before:w-[300px] lg:before:w-[56%] ultraLargeDesktop:before:w-[43%] before:bg-cover before:bg-no-repeat before:bg-sec4-bg before:z-10">
          <div className="md:grid grid-cols-3 space-y-5 md:space-y-0 max-w-[1200px] px-[16px] sm:px-[30px] mx-auto">
            <div className="space-y-8 col-span-2 relative z-10 ">
              <h3 className="font-omnes font-bold text-[46px] max-w-xl text-theme-black-2 sm:pe-10 leading-[56px]">
                {t("Honey, we're not cooking tonight")}
              </h3>
              <p className="font-normal text-[16px] leading-relaxed text-[#707174] max-w-lg font-sf">
                {t(
                  "Get the Apple-awarded Fomino app and choose from 40,000 restaurants and hundreds of stores in 20+ countries. Discover and get what you want - our courier partners bring it to you."
                )}
              </p>
              <div className="space-y-4 col-span-1">
                <img
                  src="/images/appleButton.svg"
                  alt="google-play"
                  className="w-[160px] h-[52px]"
                />
                <img
                  src="/images/googleP.png"
                  alt="google-play"
                  className="w-[160px] h-[48px]"
                />
              </div>
            </div>
          </div>
          <div className="block md:hidden mt-10 bg-sec4-bg  bg-cover bg-no-repeat h-[273px]"></div>
        </section>
      </LazyLoadComponent>
      <section className="sm:py-24 sm:pb-[200px] py-12">
        <div className="max-w-[1200px] px-[30px] w-[92%] lg:w-[94%] smallDesktop:w-[95%] xl:w-[90%] desktop:w-[82.22%] largeDesktop:w-[75%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%] mx-auto sm:space-y-12 space-y-8">
          <h3 className="font-omnes font-bold text-theme-black-2 text-[24px] md:text-[48px] text-center leading-[44px] ">
            {t("Hungry for more than food?")}
          </h3>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 ">
            <LazyLoadComponent>
              <HomeCard
                img="1"
                alt="courier"
                text="Get paid as a courier partner"
                apply={() => navigate("driver-home")}
              />
            </LazyLoadComponent>
            <LazyLoadComponent>
              <HomeCard
                img="2"
                alt="chef"
                text="Serve more people as a Restaurant partner"
                apply={() => navigate("retailer-signup")}
              />
            </LazyLoadComponent>
            <LazyLoadComponent>
              <HomeCard
                img="3"
                alt="shakehand"
                text="Serve more people as a Restaurant partner"
                apply={() => navigate("retailer-signup")}
              />
            </LazyLoadComponent>
          </div>
        </div>
      </section>
      <Footer width=" max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
    </>
  );
}
