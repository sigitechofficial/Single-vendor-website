import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import GetAPI from "../../utilities/GetAPI";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import RestaurantCard from "../../components/RestaurantCard";
import { BASE_URL } from "../../utilities/URL";
import Footer from "../../components/Footer";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";

const DiscoveryByCuisine = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  //   const cuisineId = queryParams.get("cuisineId");
  const { countryCode, cityName, cuisineId, tab } = useParams();
  const type = tab.toUpperCase() || "RESTAURANTS";
  const { t } = useTranslation();
  const lat = localStorage.getItem("lat");
  const lng = localStorage.getItem("lng");
  const city = localStorage.getItem("guestFormatAddress");
  const apiUrl =
    lat && lng
      ? `users/home3?lat=${lat}&lng=${lng}`
      : `users/home3?cityName=${cityName}`;
  const { data, error } = GetAPI(apiUrl);

  const [currentTab, setCurrentTab] = useState(type.toUpperCase());
  const [modal, setModal] = useState(false);
  const [sort, setSort] = useState("Recommended");
  const [initialSort, setInitialSort] = useState("Recommended");
  const [filterShow, setFilterShow] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [modalScroll, setModalScroll] = useState(0);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [getItsCuisine, setGetItsCuisine] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [originalRestaurants, setOriginalRestaurants] = useState([]);
  const [originalStores, setOriginalStores] = useState([]);
  const [sortChanged, setSortChanged] = useState(false);
  const [showClearFilterBtn, setShowClearFilterBtn] = useState(false);
  const [found, setFound] = useState("");

  const sortBy = [
    "Recommended",
    "Delivery Price",
    "Rating",
    "Delivery Time",
    "Distance",
  ];

  useEffect(() => {
    const list =
      currentTab === "RESTAURANTS"
        ? data?.data?.restaurantList?.restaurantList
        : data?.data?.storeList?.storeList;
    console.log("data", data?.data?.restaurantList?.restaurantList);

    const filtered = list?.filter((item) => {
      return item?.cusinesList?.some(
        (cuisineItem) => cuisineItem?.cuisine?.id == cuisineId
      );
    });
    console.log("filter", filtered, list);
    if (currentTab === "RESTAURANTS") {
      setOriginalRestaurants(filtered);
    } else if (currentTab === "STORES") {
      setOriginalStores(filtered);
    }

    const cuisines = filtered?.map((restaurant) => {
      return restaurant?.cusinesList?.map((cuisineItem) => cuisineItem.cuisine);
    });

    const flattenedCuisines = [
      ...new Map(
        cuisines?.flat()?.map((cuisine) => [cuisine?.id, cuisine])
      ).values(),
    ];

    setGetItsCuisine(flattenedCuisines);
    setFilteredRestaurants(filtered);
    setFilteredStores(filtered);
  }, [cuisineId, data]);
  const openModal = () => {
    setInitialSort(sort);
    setModal(true);
  };
  useEffect(() => {
    const list =
      currentTab === "RESTAURANTS" ? filteredRestaurants : filteredStores;

    const filtered = list?.filter((item) => {
      if (filterData?.length === 0) return true; // No filter, return all
      return item?.cusinesList?.some((cuisineItem) =>
        filterData.includes(cuisineItem?.cuisine?.id)
      );
    });

    console.log("🚀 ~ filtered ~ filtered:", filtered);
    setFound(filtered);
  }, [filterData, currentTab]); // Re-run when filterData or currentTab changes

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

  useEffect(() => {
    // Retrieve the "filter" query parameter from the URL
    const queryParams = new URLSearchParams(location.search);
    const filterParam = queryParams.get("filter");

    if (filterParam) {
      // Parse the filter parameter and extract IDs
      const filters = [];
      let startIdx = 0;
      let endIdx = 0;

      while (endIdx < filterParam.length) {
        if (/\d/.test(filterParam[endIdx])) {
          startIdx = endIdx;
          while (/\d/.test(filterParam[endIdx])) endIdx++;
          filters.push(filterParam.slice(startIdx, endIdx));
        }
        endIdx++;
      }

      const numericFilters = filters.map((filter) => Number(filter));
      console.log("******** filters", numericFilters);

      setFilterData(numericFilters);
    }
  }, [location.search]);

  const removeEmojis = (str) => {
    return str.replace(/[^\w\s]/g, "");
  };

  const handleFilter = async () => {
    const filteredRestaurantsByCuisine = originalRestaurants?.filter(
      (restaurant) => {
        if (filterData?.length === 0) return true; // No filter, return all restaurants
        return restaurant?.cusinesList?.some((cuisine) =>
          filterData?.includes(cuisine?.cuisine?.id)
        );
      }
    );
    const filteredStoresByCuisine = originalStores?.filter((store) => {
      if (filterData.length === 0) return true; // No filter, return all stores
      return store?.cusinesList?.some((cuisine) =>
        filterData.includes(cuisine?.cuisine?.id)
      );
    });

    // Sort the filtered data based on the selected sorting option
    switch (sort) {
      case "Delivery Price":
        filteredRestaurantsByCuisine.sort(
          (a, b) => a.deliveryFee - b.deliveryFee
        );
        filteredStoresByCuisine.sort((a, b) => a.deliveryFee - b.deliveryFee);
        break;
      case "Rating":
        filteredRestaurantsByCuisine.sort((a, b) => b.rating - a.rating);
        filteredStoresByCuisine.sort((a, b) => b.rating - a.rating);
        break;
      case "Delivery Time":
        filteredRestaurantsByCuisine.sort(
          (a, b) => a.deliveryTime - b.deliveryTime
        );
        filteredStoresByCuisine.sort((a, b) => a.deliveryTime - b.deliveryTime);
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
        filteredStoresByCuisine.sort((a, b) => {
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

    // Set the filtered data
    setFilteredRestaurants(filteredRestaurantsByCuisine);
    setFilteredStores(filteredStoresByCuisine);
    setModal(false);
    setInitialSort(sort);

    // Update the URL with the applied filters and sorting
    const queryParams = new URLSearchParams();
    if (sort && sort !== initialSort) {
      const formattedSort = sort.replace(/\s+/g, "-").toLowerCase();
      queryParams.append("sorting", formattedSort);
    }

    if (filterData.length > 0) {
      const concatenatedFilters = filterData
        .map((filterId) => {
          const selectedCuisine = getItsCuisine?.find(
            (menu) => menu.id === filterId
          );
          const cuisineId = selectedCuisine?.id;
          let cuisineName = selectedCuisine?.name;
          cuisineName = removeEmojis(cuisineName);
          cuisineName = encodeURIComponent(cuisineName).replace(/%20/g, "");
          return cuisineId + cuisineName;
        })
        .join("");
      queryParams.append("filter", concatenatedFilters);
    }

    // Update the URL with the new filters
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const closeModal = () => {
    setModal(false);
    setInitialSort(sort);
    setFilterShow(false);
    setSortChanged(false);
    setFilterData([]);
  };

  const restaurantCuisineName =
    currentTab === "RESTAURANTS"
      ? data?.data?.restaurantList?.restaurantList
          ?.flatMap((restaurant) => restaurant.cusinesList)
          .find((cuisine) => cuisine?.cuisine?.id === cuisineId)?.cuisine.name
      : undefined;

  const storeCuisineName =
    currentTab === "STORES"
      ? data?.data?.storeList?.storeList
          ?.flatMap((store) => store?.cusinesList)
          .find((cuisine) => cuisine?.cuisine?.id === cuisineId)?.cuisine.name
      : undefined;

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

  const handleClearFilters = () => {
    setFilterData([]);
    setSort("Recommended");
    setShowClearFilterBtn(false);
    setInitialSort(sort);
    setModal(false);

    if (currentTab === "RESTAURANTS") {
      setFilteredRestaurants(originalRestaurants);
    } else if (currentTab === "STORES") {
      setFilteredStores(originalStores);
    }

    navigate(`${location.pathname}`);
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

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <>
      <Modal onClose={closeModal} isOpen={modal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius={"20px"}>
          <ModalHeader px={4}>
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
              className="absolute z-20 top-5 right-4 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
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
                          filterData?.find((ele) => parseInt(ele) === menu?.id)
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
                          filterData?.find((ele) => parseInt(ele) === menu?.id)
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
                filterData?.length > 0 || sort !== initialSort
                  ? handleFilter
                  : closeModal
              }
              className={`w-full py-[15px] rounded-md font-bold font-sf shadow-buttonShadow ${
                filterData?.length > 0 || sort !== initialSort
                  ? "bg-theme-red text-white"
                  : "bg-theme-red bg-opacity-20 text-theme-red"
              }`}
            >
              {filterData?.length > 0 || sort !== initialSort
                ? t("Apply") +
                  (filterData?.length > 0 ? ` (${found?.length} found)` : "")
                : t("Close")}
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <section className="relative mb-20">
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
                {t("Stores")}
              </button>
            </div>
            
            {/* Map Button */}
            <div className="ms-4">
              <button
                onClick={() => {
                  navigate(`/${countryCode}/${cityName}/${currentTab.toLowerCase()}/map`);
                }}
                className="sm:py-2.5 py-1.5 sm:px-5 px-3 text-black rounded-full sm:font-medium font-medium text-sm flex justify-center items-center gap-x-2 bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Map View
              </button>
            </div>
          </div>

          <section className="custom-max-width w-[92%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%] mx-auto space-y-8">
            <div className="flex justify-between">
              <h5 className=" font-omnes font-bold text-[48px] ">
                {currentTab === "RESTAURANTS"
                  ? restaurantCuisineName
                  : storeCuisineName}
              </h5>
              {filteredRestaurants?.length > 0 && (
                <button
                  onClick={openModal}
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
              {currentTab === "RESTAURANTS" &&
              filteredRestaurants?.length > 0 ? (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5 font-sf">
                  {filteredRestaurants.map((res, index) => (
                    <div key={index}>
                      <RestaurantCard
                        img={`${BASE_URL}${res?.image}`}
                        logo={`${BASE_URL}${res?.logo}`}
                        title={res?.businessName}
                        desc={res?.city}
                        price={res?.deliveryFee}
                        deliveryTime={res?.deliveryTime}
                        deliveryFee={res?.deliveryFee}
                        rating={res?.rating}
                        isOpen={res?.isOpen}
                        isRushMode={res.isRushMode}
                        openingTime={res.openingTime}
                        closingTime={res.closingTime}
                        completelyClosed={res.completelyClosed}
                        getConfiguration={res.getConfiguration}
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
              ) : filteredStores?.length > 0 ? (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5 font-sf">
                  {filteredStores.map((store, index) => (
                    <div key={index}>
                      <RestaurantCard
                        img={`${BASE_URL}${store?.image}`}
                        logo={`${BASE_URL}${store?.logo}`}
                        title={store?.businessName}
                        desc={store?.city}
                        price={store?.deliveryFee}
                        time={store?.deliveryTime}
                        rating={store?.rating}
                        isOpen={store?.isOpen}
                        onClick={() => {
                          resDetails(
                            store?.id,
                            store.businessName.toLowerCase(),
                            "store"
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
      </section>

      <Footer width="custom-max-width w-[92%] lg:w-[94%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%]" />
    </>
  );
};

export default DiscoveryByCuisine;
