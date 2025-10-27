import React, { useState } from "react";
import Header from "../../components/Header";
import { IoTrashBin } from "react-icons/io5";
import GetAPI from "../../utilities/GetAPI";
import { BASE_URL } from "../../utilities/URL";
import { error_toaster, success_toaster } from "../../utilities/Toaster";
import { PostAPI } from "../../utilities/PostAPI";
import Loader from "../../components/Loader";
import RestaurantCard from "../../components/RestaurantCard";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { useTranslation } from "react-i18next";

export default function Wishlist() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Restaurants");
  const [loadingMap, setLoadingMap] = useState({});
  
  const handleImageLoad = (id) => {
    setLoadingMap(prev => ({ ...prev, [id]: false }));
  };
  const { data, loading } = GetAPI(
    `frontsite/favRestaurant/${localStorage.getItem("userId")}`
  );
  const { t, i18n } = useTranslation();
  const response = GetAPI("users/getCountriesAndCities");

  const addToWishlistFunc = async (RPLinkId) => {
    let res = await PostAPI("frontsite/addToWishList", {
      RPLinkId: RPLinkId,
      userId: parseInt(localStorage.getItem("userId")),
    });
    if (res?.data?.status === "1") {
      success_toaster(res?.data?.message);
    } else {
      error_toaster(res?.data?.message);
    }
  };

  const resDetails = (restaurantId, city, country, businessName, name) => {
    const countries = response?.data?.data?.countries || [];
    const countryData = countries.find((c) => c.name === country);
    const countryShortName = countryData ? countryData.shortName : null;
    localStorage.setItem("resId", restaurantId);
    if (name === "res") {
      const slug = `${businessName
        ?.replace(/\s+/g, "-")
        .toLowerCase()}-res-${restaurantId}`;
      navigate(
        `/${countryShortName?.toLowerCase()}/${city?.toLowerCase()}/restaurants/${slug}`
      );
    } else {
      const slug = `${businessName
        ?.replace(/\s+/g, "-")
        .toLowerCase()}-store-${restaurantId}`;
      navigate(
        `/${countryShortName?.toLowerCase()}/${city?.toLowerCase()}/stores/${slug}`
      );
    }
  };
  const wishlistData =
    tab === "Restaurants" ? data?.data?.restaurantList : data?.data?.storeList;
  console.log("wishlistData", wishlistData);

  return data?.length === 0 || loading ? (
    <Loader />
  ) : (
    <>
      <div className="relative">
        <Header home={false} rest={true} />
        <section className="relative font-sf">
          <div className="flex justify-center pt-28 store-selection">
            <div className="w-fit flex bg-theme-gray-3 p-1 rounded-full ms-8">
              <button
                onClick={() => setTab("Restaurants")}
                className={`sm:py-2.5 py-1.5 sm:px-5 px-3 text-black rounded-full sm:font-medium font-medium text-sm flex justify-center items-center gap-x-2 ${
                  tab === "Restaurants" ? "bg-white" : "text-opacity-40"
                }`}
              >
                <img
                  src={`/images/restaurants/fork${
                    tab === "Restaurants" ? "" : "-gray"
                  }.webp`}
                  alt="fork"
                  className="w-5"
                />
                {t("Restaurants")}
              </button>
              <button
                onClick={() => setTab("Stores")}
                className={`sm:py-2.5 py-1.5 sm:px-5 px-3 text-black rounded-full sm:font-medium font-medium text-sm flex justify-center items-center gap-x-2 ${
                  tab === "Stores" ? "bg-white" : "text-opacity-40"
                }`}
              >
                <img
                  src={`/images/restaurants/bag${
                    tab === "Stores" ? "" : "-gray"
                  }.webp`}
                  alt="fork"
                  className="w-5"
                />
                {t("Stores")}
              </button>
            </div>
          </div>
          <div className="mb-24 custom-max-width  w-[92%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%] mx-auto pb-6 mt-14">
            <h3 className="font-omnes font-bold text-3xl">
              {`  Favourites ${
                tab === "Restaurants" ? "Restaurants" : "Stores"
              }`}
            </h3>
            <div className="mt-10">
              {wishlistData && wishlistData.length > 0 ? (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">
                  {wishlistData.map((wish, index) => (
                    <div key={index}>
                      <RestaurantCard
                        id={wish?.id}
                        img={`${BASE_URL}${wish?.image}`}
                        logo={`${BASE_URL}${wish?.logo}`}
                        title={wish?.businessName}
                        desc={wish?.city}
                        price={wish?.deliveryFee}
                        deliveryFee={wish?.deliveryFee}
                        deliveryTime={wish?.deliveryTime}
                        time={wish?.deliveryTime}
                        rating={wish?.rating}
                        isOpen={wish?.isOpen}
                        loadingMap={loadingMap}
                        handleLoad={handleImageLoad}
                        onClick={() => {
                          resDetails(
                            wish?.id,
                            wish?.city,
                            wish?.country,
                            wish?.businessName.toLowerCase(),
                            tab === "Restaurants" ? "res" : "store"
                          );
                          localStorage.removeItem("how");
                          localStorage.removeItem("when");
                        }}
                        logoWidth="w-20 h-20"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mx-auto w-full text-center  my-5">
                  <figure>
                    <img
                      className="h-96 object-cover mx-auto"
                      src="../../../images/restaurants/no-data.gif"
                      alt="No data available"
                    />
                  </figure>
                  <h5 className="text-3xl font-extrabold">No results found</h5>
                </div>
              )}
            </div>
          </div>
        </section>
        <Footer width="custom-max-width w-[92%] lg:w-[94%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%]" />
      </div>
    </>
  );
}
