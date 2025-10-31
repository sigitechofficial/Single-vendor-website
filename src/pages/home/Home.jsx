import { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import { Autocomplete } from "@react-google-maps/api";
import { info_toaster } from "../../utilities/Toaster";
import { useTranslation } from "react-i18next";
import GetAPI from "../../utilities/GetAPI";
import { BASE_URL } from "../../utilities/URL";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const autocompleteRef = useRef(null);

  const { data } = GetAPI(`users/userStampsAndBannersForWebSingleVendor`);
  const { data: hSettings } = GetAPI(`users/getHeaderSettings`);
  const headerSettings = hSettings?.data?.hSettings;

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
      <section
        className="xl:pt-[66.57px] md:pt-[59.15px] pt-[54.15px] bg-no-repeat bg-cover bg-center relative   "
        style={{
          backgroundImage: `url('${headerSettings?.headerImage ? `${BASE_URL}${headerSettings.headerImage}` : '/images/restaurants/bg-1.webp'}')`,
        }}
      >
        {/* Background Overlay for better text readability */}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: headerSettings?.overLay ? parseFloat(headerSettings.overLay) : 0.4 }}
        ></div>
        <div className="max-w-[1200px] mx-auto grid items-center text-center h-[650px] relative z-10">
          <div className="px-[16px] sm:px-[30px] lg:py-28 py-12 md:space-y-8 space-y-6  flex flex-col justify-center pe-7">
            <h2 className="font-omnes font-bold lg:text-[52px] text-[40px] tracking-tight leading-10 sm:leading-10 text-white drop-shadow-2xl drop-shadow-theme-black-2 ">
              {headerSettings?.headerTitle || t("Order food and more")}
            </h2>
            <p className="font-bold text-white font-sf xl:text-[28px] text-xlsm:leading-8 leading-tight drop-shadow-2xl drop-shadow-theme-black-2 whitespace-pre-line">
              {headerSettings?.headerDescription || t("where great food meets great finds")}
            </p>
            <Autocomplete
              onLoad={(autocomplete) =>
                (autocompleteRef.current = autocomplete)
              }
              onPlaceChanged={calculateRoute}
            >
              <div className="w-full relative  max-w-[750px] mx-auto">
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


        </div>
      </section>

      {/* Promotional Banners Section */}
      <section className="py-16 pb-20 bg-gray-100 bg-opacity-30">
        <div className="max-w-[1200px] px-[30px] mx-auto">
          <h2 className="font-omnes font-bold text-theme-black-2 text-[24px] md:text-[40px] leading-[44px] pb-10 ">
            Everything You Need in One Place
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* VIEW DEALS Banner */}
            <div className="relative overflow-hidden rounded-lg from-blue-500 to-blue-600 border h-20 cursor-pointer group">
              <div className="overflow-hidden">
                <img
                  src="/images/restaurants/card-1.webp"
                  alt="deals"
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-25"></div>
              <h3
                className="text-white font-bold text-lg md:text-2xl absolute inset-0 flex items-center justify-center drop-shadow-lg font-sf"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
              >
                VIEW DEALS
              </h3>
            </div>
            <div className="relative overflow-hidden rounded-lg from-blue-500 to-blue-600 border h-20 cursor-pointer group">
              <div className="overflow-hidden">
                <img
                  src="/images/restaurants/slider-2.webp"
                  alt="deals"
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-25"></div>
              <h3
                className="text-white font-bold text-lg md:text-2xl absolute inset-0 flex items-center justify-center drop-shadow-lg font-sf"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
              >
                BROWSE MENU
              </h3>
            </div>
          </div>

          {/* Dynamic Banner Cards Section */}
          <div className="grid md:grid-cols-3 gap-6">
            {data?.data?.obj?.restaurantBanners?.slice(0, 3).map((banner) => (
              <div
                key={banner.id}
                className="relative overflow-hidden rounded-lg h-80 cursor-pointer group"
                style={{
                  backgroundImage: banner.image
                    ? `url(${BASE_URL}${banner.image})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                <div className="relative p-6 h-full flex flex-col justify-between">
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-white mb-4">
                      <h3 className="text-2xl font-bold mb-2 drop-shadow-lg font-sf capitalize">
                        {banner.title}
                      </h3>
                      {banner.description && (
                        <p className="text-sm font-medium opacity-90 drop-shadow-md">
                          {banner.description}
                        </p>
                      )}
                    </div>

                    {/* Banner Type Badge */}
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {banner.bannerType}
                      </span>
                    </div>

                    {/* Discount Details */}
                    {banner.discountDetail && (
                      <div className="text-white">
                        <div className="text-lg font-bold">
                          {banner.discountDetail.discountType === 'Percentage'
                            ? `${banner.discountDetail.discountValue}% OFF`
                            : `$${banner.discountDetail.discountValue} OFF`
                          }
                        </div>
                        {banner.discountDetail.minimumOrderValue && (
                          <div className="text-xs opacity-80">
                            Min order: ${banner.discountDetail.minimumOrderValue}
                          </div>
                        )}
                      </div>
                    )}

                    {/* BOGO Deal Details */}
                    {banner.deal && (
                      <div className="text-white">
                        <div className="text-lg font-bold">
                          Buy {banner.deal.buyItemsQty} Get {banner.deal.getItemsQty}
                        </div>
                        <div className="text-xs opacity-80">
                          BOGO Deal
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-300">
                      {banner.deliveryType?.name || 'Delivery'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer width=" max-w-[1200px]  px-[16px] sm:px-[30px] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[62.5%] ultraLargeDesktop:w-[71%]" />
    </>
  );
}
