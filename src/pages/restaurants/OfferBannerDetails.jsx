import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import RestaurantCard from "../../components/RestaurantCard";
import { BASE_URL } from "../../utilities/URL";
import Footer from "../../components/Footer";
import GetAPI from "../../utilities/GetAPI";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { IoClose } from "react-icons/io5";

const OfferBannerDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  //   const bannerId = location.state?.bannerId;
  const { tab } = useParams();
  const [currentTab, setCurrentTab] = useState(
    tab ? tab.toUpperCase() : "RESTAURANTS"
  );
  const { countryCode, cityName, offer_name, bannerId } = useParams();
  const { data } = GetAPI(`users/getOfferRestaurantsGet/${bannerId}`);
  const [filterData, setFilterData] = useState([]);
  const [modal, setModal] = useState(false);
  const [showClearFilterBtn, setShowClearFilterBtn] = useState(false);
  const [getItsCuisine, setGetItsCuisine] = useState([]);
  const [sort, setSort] = useState("Recommended");
  const [filterShow, setFilterShow] = useState(false);
  const [originalData, setOriginaldata] = useState([]);
  console.log(originalData);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [found, setFound] = useState("");

  const sortBy = [
    "Recommended",
    "Delivery Price",
    "Rating",
    "Delivery Time",
    "Distance",
  ];

  const resDetails = (restaurantId, businessName, name) => {
    localStorage.setItem("resId", restaurantId);

    if (name === "res") {
      const slug = `${businessName
        .replace(/\s+/g, "-")
        .toLowerCase()}-res-${restaurantId}`;
      navigate(`/${countryCode}/${cityName}/restaurants/${slug}`);
    } else {
      const slug = `${businessName
        .replace(/\s+/g, "-")
        .toLowerCase()}-store-${restaurantId}`;
      navigate(`/${countryCode}/${cityName}/stores/${slug}`);
    }
  };

  const closeModal = () => {
    setModal(false);
    setFilterShow(false);
    setFilterData([]);
    if (!filterData.length > 0 && sort === "Recommended") {
      navigate(`/${countryCode}/${cityName}/offer/${offer_name}/${bannerId}`);
    }
  };

  const handleCuisineSelect = (cuisineId) => {
    const exist = filterData.find((ele) => ele === cuisineId);
    if (!exist) {
      setFilterData((prevFilterData) => [...prevFilterData, cuisineId]);
      setShowClearFilterBtn(true);
    } else {
      setFilterData((prevFilterData) =>
        prevFilterData.filter((ele) => ele !== cuisineId)
      );
      setShowClearFilterBtn(false);
    }
  };

  const handleClearFilters = () => {
    setFilterData([]);
    setSort("Recommended");
    setShowClearFilterBtn(false);
    setFilteredRestaurants(originalData);
    setModal(false);
    navigate(`/${countryCode}/${cityName}/offer/${offer_name}/${bannerId}`);
  };

  // Haversine formula to calculate distance
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Returns the distance in kilometers
  };

  // Get the user's current location (lat, lng)
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => reject(error),
          { enableHighAccuracy: true }
        );
      } else {
        reject("Geolocation not supported");
      }
    });
  };

  // Handle the filter logic
  const handleFilter = async () => {
    const filteredRestaurantsByCuisine = filteredRestaurants?.filter(
      (restaurant) => {
        if (filterData?.length === 0) return true;
        return restaurant?.cusinesList?.some((cuisine) =>
          filterData?.includes(cuisine?.cuisine?.id)
        );
      }
    );

    // Apply sorting logic
    switch (sort) {
      case "Delivery Price":
        filteredRestaurantsByCuisine.sort(
          (a, b) => a.deliveryFee - b.deliveryFee
        );
        break;
      case "Rating":
        filteredRestaurantsByCuisine.sort((a, b) => b.rating - a.rating);
        break;
      case "Delivery Time":
        filteredRestaurantsByCuisine.sort(
          (a, b) => a.deliveryTime - b.deliveryTime
        );
        break;
      case "Distance":
        const userLocation = await getUserLocation();
        filteredRestaurantsByCuisine.sort((a, b) => {
          const distanceA = haversineDistance(
            userLocation.lat,
            userLocation.lng,
            a?.lat,
            a?.lng
          );
          const distanceB = haversineDistance(
            userLocation.lat,
            userLocation.lng,
            b?.lat,
            b?.lng
          );
          return distanceA - distanceB;
        });
        break;
      default:
        break;
    }

    setFilteredRestaurants(filteredRestaurantsByCuisine);
    setModal(false);

    // Step 4: Update the URL with filter and sort query params (for navigation)
    const cuisineQuery =
      filterData?.length > 0 ? filterData.map((id) => `${id}`).join("&") : "";
    const sortQuery = sort !== "Recommended" ? `&sort=${sort}` : "";
    navigate(
      `/${countryCode}/${cityName}/offer/${offer_name}/${bannerId}?filters=${cuisineQuery}${sortQuery}`
    );
  };

  useEffect(() => {
    const list = data?.data?.list;

    setOriginaldata(list);

    const cuisines = list?.map((restaurant) => {
      return restaurant?.cusinesList?.map((cuisineItem) => cuisineItem.cuisine);
    });

    const flattenedCuisines = [
      ...new Map(
        cuisines?.flat()?.map((cuisine) => [cuisine?.id, cuisine])
      ).values(),
    ];

    setGetItsCuisine(flattenedCuisines);
    setFilteredRestaurants(list);
  }, [data?.data]);

  useEffect(() => {
    const list = data?.data?.list;

    const filtered = list?.filter((item) => {
      if (filterData?.length === 0) return true;
      return item?.cusinesList?.some((cuisineItem) =>
        filterData.includes(cuisineItem?.cuisine?.id)
      );
    });

    setFound(filtered);
  }, [filterData]);

  return data.length === 0 ? (
    <Loader />
  ) : (
    <>
      <section className="relative mb-12">
        <Header home={false} rest={true} discovery={true} />
        <section className={`relative space-y-12 font-sf`}>
          <div className="flex justify-center md:pt-24 pt-36 store-selection">
            <div className="w-fit flex bg-theme-gray-3 p-1 rounded-full">
              <button
                onClick={() => {
                  navigate(`/${countryCode}/${cityName}/restaurants`);
                  setCurrentTab("RESTAURANTS");
                }}
                className={`sm:py-2.5 py-1.5 sm:px-5 px-3 text-black text-opacity-40 rounded-full sm:font-medium font-medium text-sm flex justify-center items-center gap-x-2 
                }`}
              >
                <img
                  src={`/images/restaurants/fork-gray.webp`}
                  alt="fork"
                  className="w-5"
                />
                Restaurants
              </button>
              <button
                onClick={() => {
                  navigate(`/${countryCode}/${cityName}/stores`);
                  setCurrentTab("STORES");
                }}
                className={`sm:py-2.5 py-1.5 sm:px-5 px-3 text-black text-opacity-40 rounded-full sm:font-medium font-medium text-sm flex justify-center items-center gap-x-2 
                }`}
              >
                <img
                  src={`/images/restaurants/bag-gray.webp`}
                  alt="fork"
                  className="w-5"
                />
                Stores
              </button>
            </div>
          </div>

          <section className="custom-max-width w-[92%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%] mx-auto space-y-3">
            {/* <h5 className=" font-tt-norms font-black text-4xl ">OFFER Name</h5> */}

            <div className="flex justify-between">
              <h5 className=" font-omnes font-bold text-[48px] ">
                {t("Offers")} ✨
              </h5>
              {originalData?.length > 0 && (
                <button
                  onClick={() => setModal(true)}
                  className="flex justify-end items-center gap-x-2 text-theme-red-2 font-sf  font-medium lg:order-2 order-1 relative"
                >
                  <span className="md:block hidden">
                    <span className="text-base font-medium ">
                      {t("Sorted by")}{" "}
                    </span>
                    <span className="text-base  font-bold">
                      {t("Recommended")}
                    </span>
                  </span>
                  <span className="md:w-10 w-10 md:h-10 h-10 flex justify-center items-center bg-theme-red bg-opacity-20 rounded-fullest">
                    <img
                      src="/images/restaurants/filter.webp"
                      alt="filter"
                      className="md:w-4 md:h-4 w-5 h-5"
                    />
                  </span>

                  {filterData?.length > 0 && (
                    <sup className="absolute top-3 -right-1 bg-theme-black-2 text-white rounded-full shrink-0 size-4 flex justify-center items-center">
                      {filterData?.length}
                    </sup>
                  )}
                </button>
              )}
            </div>

            <div>
              {filteredRestaurants?.length > 0 ? (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5 font-sf mb-40">
                  {filteredRestaurants.map((res, index) => (
                    <div key={index}>
                      <RestaurantCard
                        img={`${BASE_URL}${res?.image}`}
                        logo={`${BASE_URL}${res?.logo}`}
                        title={res?.businessName}
                        desc={res?.city}
                        price={res?.deliveryFee}
                        currency={res?.units?.currencyUnit?.symbol}
                        deliveryTime={res?.deliveryTime}
                        deliveryFee={res?.deliveryFee}
                        rating={res?.rating}
                        isOpen={res?.isOpen}
                        isRushMode={res?.isRushMode}
                        openingTime={res?.openingTime}
                        closingTime={res?.closingTime}
                        completelyClosed={res?.completelyClosed}
                        getConfiguration={res?.getConfiguration}
                        restBanners={res?.restBanners}
                        time={res.time}
                        onClick={() => {
                          resDetails(
                            res?.id,
                            res?.businessName.toLowerCase(),
                            "res"
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
                <div className="mx-auto w-full text-center">
                  <figure>
                    <img
                      className="h-96 object-cover mx-auto"
                      src="/images/restaurants/no-data.gif"
                      alt="No data available"
                    />
                  </figure>
                  <h5 className="text-3xl font-extrabold">No results found</h5>
                </div>
              )}
            </div>
          </section>
        </section>

        <Modal onClose={closeModal} isOpen={modal} isCentered size="lg">
          <ModalOverlay />
          <ModalContent borderRadius={"20px"}>
            <ModalHeader>
              {showClearFilterBtn && (
                <button
                  className="text-theme-red-2 font-sf  text-base "
                  onClick={handleClearFilters}
                >
                  {t("Clear filters")}
                </button>
              )}
              <div
                onClick={() => setModal(false)}
                className="absolute z-20 top-5 right-6 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
              >
                <IoClose size={30} />
              </div>
            </ModalHeader>

            <ModalBody p={0}>
              <div className="h-auto overflow-auto !font-sf space-y-10 px-4">
                <div className="space-y-5">
                  <h5 className="font-bold text-3xl font-omnes text-theme-black-2">
                    Filter
                  </h5>
                  <div className="flex flex-wrap sm:gap-2 gap-1">
                    {currentTab === "RESTAURANTS" ? (
                      getItsCuisine?.map((menu, index) => (
                        <button
                          key={index}
                          onClick={() => handleCuisineSelect(menu?.id)}
                          className={`sm:py-2 py-1.5 sm:px-4 px-3 font-medium text-sm rounded-full font-sf ${
                            filterData?.find(
                              (ele) => parseInt(ele) === menu?.id
                            )
                              ? "text-white bg-theme-green-2"
                              : "text-theme-green-2 bg-theme-green-4"
                          }`}
                        >
                          {menu?.name?.replace(/^\p{Emoji}+/u, "").trim()}
                        </button>
                      ))
                    ) : currentTab === "STORES" ? (
                      getItsCuisine?.map((menu, index) => (
                        <button
                          key={index}
                          onClick={() => handleCuisineSelect(menu?.id)}
                          className={`sm:py-2.5 py-1.5 sm:px-4 px-3 font-medium text-sm rounded-full font-sf ${
                            filterData?.find(
                              (ele) => parseInt(ele) === menu?.id
                            )
                              ? "text-white bg-theme-green-2"
                              : "text-theme-green-2 bg-theme-green-4"
                          }`}
                        >
                          {menu?.name?.replace(/^\p{Emoji}+/u, "").trim()}
                        </button>
                      ))
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <div className="space-y-5 ">
                  <h5 className="font-semibold text-xl font-omnes">
                    {t("Sort by")}
                  </h5>
                  <div className="flex items-center flex-wrap sm:gap-2 gap-1">
                    {sortBy?.map((sorting, index) => (
                      <button
                        key={index}
                        onClick={() => setSort(sorting)}
                        className={`sm:py-1 py-1.5 sm:px-3 px-2 font-medium text-sm rounded-full border-2 border-[#e4e4e5] text-theme-black-2 text-opacity-65 hover:bg-theme-green-2 hover:bg-opacity-10 hover:border-theme-green-2 ${
                          sorting === sort
                            ? " border-theme-green-2 text-opacity-65 "
                            : "bg-transparent  "
                        }`}
                      >
                        {t(sorting)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter p={4}>
              <button
                onClick={
                  filterData?.length > 0 || sort !== "Recommended"
                    ? handleFilter
                    : closeModal
                }
                className={`w-full py-[15px] rounded-md font-bold font-sf shadow-buttonShadow ${
                  filterData?.length > 0 || sort !== "Recommended"
                    ? "bg-theme-red text-white"
                    : "bg-theme-red bg-opacity-20 text-theme-red"
                }`}
              >
                {filterData?.length > 0 || sort !== "Recommended"
                  ? t("Apply") +
                    `${
                      filterData?.length > 0 ? ` (${found?.length} found)` : ""
                    } `
                  : t("Close")}
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </section>

      <Footer width="custom-max-width w-[92%] lg:w-[94%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%]" />
    </>
  );
};

export default OfferBannerDetails;
