import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  useMediaQuery,
  Box,
  Skeleton,
  SkeletonText,
  Flex,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { dataContext } from "../../utilities/ContextApi";
import SearchCard from "../../components/SearchCard";
import SearchProductCard from "../../components/SearchProductCard";
import { BASE_URL } from "../../utilities/URL";
import RestaurantSearchCard from "../../components/RestaurantSearchCard";
import CustomDeliveryIcon from "../../components/CustomDeliveryIcon";
import { MdNavigateNext } from "react-icons/md";
import getCountryCode from "../../utilities/getCountryCode";
import GetAPI from "../../utilities/GetAPI";
import RestaurantCard from "../../components/RestaurantCard";
import { IoClose } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import Switch from "react-switch";

const SearchResults = () => {
  const { type } = useParams();

  const city = "lahore";
  const countryCode = localStorage.getItem("countryShortName");
  const lat = localStorage.getItem("lat");
  const lng = localStorage.getItem("lng");

  const {
    gData,
    setGData,
    groupDrawer,
    setGroupDrawer,
    isFocused,
    setIsFocused,
    searchResult,
    setSearchResult,
    pending,
    setPending,
    searchTerm,
    headerSearch,
    setHeaderSearch,
    setSearchTerm,
  } = useContext(dataContext);
  const [showAll, setShowAll] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  const [filterShow, setFilterShow] = useState(false);
  const { t, i18n } = useTranslation();
  const [md] = useMediaQuery("(min-width: 768px)");
  const [sm] = useMediaQuery("(max-width: 640px)");
  const [tab, setTab] = useState("Restaurants");
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState(false);
  const navigate = useNavigate();
  const [modalScroll, setModalScroll] = useState(0);
  const [headerShadow, setHeaderShadow] = useState(false);
  const [modalData, setModalData] = useState({});

  const [filterData, setFilterData] = useState([]);
  const [cuisineIds, setCuisineIds] = useState([]);
  const [showContentAfterFilter, setShowContentAfterFilter] = useState(false);
  const [sort, setSort] = useState("Recommended");
  const [allResultsFilter, setAllResultsFilter] = useState([
    "All Results",
    "Restaurants",
  ]);
  const [selectedResultFilter, setSelectedResultFilter] =
    useState("All Results");
  const [filterDataCount, setFilterDataCount] = useState(0);
  const totalFilters = searchResult?.data?.cusinesList?.length || 0;

  const filtersToShow =
    totalFilters <= 18 || showAll
      ? searchResult?.data?.cusinesList
      : searchResult?.data?.cusinesList?.slice(0, 20);

  const sortBy = [
    "Recommended",
    "Delivery Price",
    "Rating",
    "Delivery Time",
    "Distance",
  ];

  const handleModalScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    setModalScroll(scrollTop);
    setHeaderShadow(scrollTop > 100);
  };

  const handleClearFilters = () => {
    setFilterData([]);
    setCuisineIds([]);
    setSort("Recommended");
    setSelectedResultFilter("All Results");
    setHeaderSearch({ ...headerSearch, openfilter: false });
  };

  const handleCuisineSelect = (id, filterType) => {
    const exist = cuisineIds?.find((ele) => ele === id);
    if (exist) {
      // if exist then remove it from the list
      setCuisineIds((prevFilterData) =>
        prevFilterData?.filter((ele) => ele !== id)
      );
    } else {
      //not exist add id to the list
      setCuisineIds((prevFilterData) => [...prevFilterData, id]);
    }
  };

  const handleFilter = async () => {
    let filteredItems = [];

    // Filtering for "venue" type
    if (type === "venue") {
      filteredItems = searchResult?.data?.list || [];
      //cuisine filter
      if (cuisineIds?.length > 0) {
        filteredItems =
          filteredItems?.filter((restaurant) =>
            restaurant.restaurantCusines?.some((cuisine) =>
              cuisineIds?.includes(cuisine?.cuisineId)
            )
          ) || [];
      }

      // Sorting by delivery charge
      if (sort === sortBy[1]) {
        filteredItems =
          filteredItems?.sort((a, b) => {
            return a?.deliveryCharge - b?.deliveryCharge;
          }) || [];
      }
      // Sorting by rating
      else if (sort === sortBy[2]) {
        filteredItems =
          filteredItems?.sort((a, b) => {
            return b?.rating - a?.rating; // Sort by descending rating
          }) || [];
      }

      // Sorting by delivery time
      else if (sort === sortBy[3]) {
        filteredItems =
          filteredItems?.sort((a, b) => {
            return a?.approxDeliveryTime - b?.approxDeliveryTime; // Sort by ascending delivery time
          }) || [];
      }

      // Sorting by distance (User's location)
      else if (sort === sortBy[4]) {
        // Fetch user's location asynchronously
        const userLocation = await getUserLocation();
        filteredItems = filteredItems?.sort((a, b) => {
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
          return distanceA - distanceB; // Sort by nearest distance
        });
      }

      // Open restaurants filter
      if (headerSearch.openFilter) {
        filteredItems =
          filteredItems?.filter((restaurant) => {
            return restaurant?.isOpen == true;
          }) || [];
      }

      // Filter by result type (e.g., Restaurants)
      if (selectedResultFilter === "All Results") {
      } else if (selectedResultFilter === "Restaurants") {
        filteredItems =
          filteredItems?.filter((item) => item?.businessType === "1") || [];
      } else {
        filteredItems =
          filteredItems?.filter((item) =>
            item?.restaurantCusines?.some(
              (cusine) => cusine?.cuisine?.name == selectedResultFilter
            )
          ) || [];
      }
    }

    // Filtering for "items" type
    else if (type === "items") {
      filteredItems = searchResult?.data?.productList || [];

      // Sorting by delivery charge
      if (sort === sortBy[1]) {
        filteredItems =
          filteredItems?.sort((a, b) => {
            return (
              a?.R_MCLink?.restaurant?.deliveryCharge -
              b?.R_MCLink?.restaurant?.deliveryCharge
            );
          }) || [];
      }
      // Sorting by rating
      else if (sort === sortBy[2]) {
        filteredItems =
          filteredItems?.sort((a, b) => {
            return (
              b?.R_MCLink?.restaurant?.rating - a?.R_MCLink?.restaurant?.rating
            ); // Sort by descending rating
          }) || [];
      }

      // Sorting by delivery time
      else if (sort === sortBy[3]) {
        filteredItems =
          filteredItems?.sort((a, b) => {
            return (
              a?.R_MCLink?.restaurant?.approxDeliveryTime -
              b?.R_MCLink?.restaurant?.approxDeliveryTime
            ); // Sort by ascending delivery time
          }) || [];
      }

      // Sorting by distance (User's location)
      else if (sort === sortBy[4]) {
        // Fetch user's location asynchronously
        const userLocation = await getUserLocation();
        filteredItems = filteredItems?.sort((a, b) => {
          const distanceA = haversineDistance(
            userLocation.lat,
            userLocation.lng,
            a?.R_MCLink?.restaurant?.lat,
            a?.R_MCLink?.restaurant?.lng
          );
          const distanceB = haversineDistance(
            userLocation.lat,
            userLocation.lng,
            b?.R_MCLink?.restaurant?.lat,
            b?.R_MCLink?.restaurant?.lng
          );

          return distanceA - distanceB; // Sort by nearest distance
        });
      }

      // Open restaurants filter
      if (headerSearch.openFilter) {
        filteredItems =
          filteredItems?.filter((restaurant) => {
            return restaurant?.R_MCLink?.restaurant?.isOpen == true;
          }) || [];
      }

      // Filter by result type (e.g., Restaurants)
      if (selectedResultFilter === "All Results") {
      } else if (selectedResultFilter === "Restaurants") {
        filteredItems =
          filteredItems?.filter(
            (item) => item?.R_MCLink?.restaurant?.businessType === "1"
          ) || [];
      } else {
        filteredItems =
          filteredItems?.filter((item) =>
            item?.R_MCLink?.restaurant?.cusineRestaurants?.some(
              (cusine) => cusine?.cuisine?.name == selectedResultFilter
            )
          ) || [];
      }
    }

    // Set the filtered data state and show content based on the filter applied
    setFilteredData(filteredItems);
    setFilterShow(true);
    setModal(false);
    setShowContentAfterFilter(filteredItems.length > 0);
    setFilterDataCount(filteredItems.length);
  };

  const resDetails = (restaurantId, businessName, name) => {
    localStorage.setItem("resId", restaurantId);

    if (name === "res") {
      const slug = `${businessName
        .replace(/\s+/g, "-")
        .toLowerCase()}-res-${restaurantId}`;
      navigate(
        `/${countryCode?.toLowerCase()}/${city.toLowerCase()}/restaurants/${slug}`
      );
    } else {
      const slug = `${businessName
        .replace(/\s+/g, "-")
        .toLowerCase()}-stores-${restaurantId}`;
      navigate(
        `/${countryCode?.toLowerCase()}/${city.toLowerCase()}/stores/${slug}`
      );
    }
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

  useEffect(() => {
    if (searchTerm == 0) {
      setPending("recent");
    }
  }, [searchTerm]);

  useEffect(() => {
    const modalContent = document.querySelector(".chakra-modal__content");

    if (modalContent) {
      modalContent.addEventListener("scroll", handleModalScroll);
    }

    return () => {
      if (modalContent) {
        modalContent.removeEventListener("scroll", handleModalScroll);
      }
    };
  }, []);

  useEffect(() => {
    let filteredItems = [];

    if (filterData.length === 0) {
      filteredItems =
        type === "venue"
          ? searchResult?.data?.list || []
          : searchResult?.data?.productList || [];
    }

    setFilteredData(filteredItems);

    if (searchResult?.data?.cusinesList) {
      const filteredBusinessTypes = searchResult?.data?.cusinesList
        .filter((el) => el?.businessType === "3")
        .map((el) => el?.name);

      const uniqueFilteredBusinessTypes = [
        ...new Set([...allResultsFilter, ...filteredBusinessTypes]),
      ];

      setAllResultsFilter(uniqueFilteredBusinessTypes);
    }
  }, [filterData, type, searchResult?.data?.cusinesList]);
  console.log("filer", filterData);
  return (
    <div className="w-full pb-20">
      <Header home={false} rest={true} />

      <div className="w-[92%] sm:w-full max-w-[1600px] sm:px-[31px] extraLargeDesktop:w-[83.34%] mx-auto">
        <div className="flex justify-center md:pt-24 pt-24 store-selection ">
          {!sm && (
            <div className="w-fit flex bg-theme-gray-3 p-1 rounded-full ms-8">
              <button
                onClick={() => {
                  navigate(
                    `/${countryCode?.toLowerCase()}/lat=${lat}&lng=${lng}/restaurants`
                  );
                  setSearchTerm(""); // ← clear search
                  setPending("recent");
                  setTab("Restaurants");
                }}
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
                onClick={() => {
                  navigate(
                    `/${countryCode?.toLowerCase()}/lat=${lat}&lng=${lng}/stores`
                  );
                  setTab("Stores");
                  setSearchTerm(""); // ← clear search
                  setPending("recent");
                }}
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
          )}
        </div>
        <div className="flex justify-between items-center mt-12">
          <h3 className="font-omnes font-bold md:text-[48px] text-3xl text-theme-black-2">
            Search results
          </h3>
          <button
            onClick={() => {
              setModal(true);
              setFilter(false);
            }}
            className=" flex justify-end items-center gap-x-2 text-theme-red-2 font-sf font-medium lg:order-2 order-1"
          >
            <span>
              <span className="text-sm font-medium max-sm:hidden">
                {t("Sorted by")}{" "}
              </span>
              <span className="text-sm font-bold max-sm:hidden">
                {t("Recommended")}
              </span>
            </span>
            <span className="sm:w-10 w-8 sm:h-10 h-8 flex justify-center items-center bg-theme-red bg-opacity-20 rounded-fullest shrink-0 relative">
              <img
                src="/images/restaurants/filter.webp"
                alt="filter"
                className="w-4 h-4"
              />
              {cuisineIds?.length > 0 && (
                <sup className="absolute -top-1 -right-1 bg-theme-black-2 text-white rounded-full shrink-0 size-4 flex justify-center items-center">
                  {cuisineIds?.length}
                </sup>
              )}{" "}
            </span>
          </button>
        </div>

        <h3 className="font-omnes font-semibold text-[1.75rem] text-theme-black-2 mt-7 mb-4">
          {type === "venue" ? "Restaurants and stores" : "Related items"}
        </h3>

        {type === "venue" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-4 font-sf">
            {filteredData?.map((item, idx) => {
              return (
                // <RestaurantSearchCard
                //   img={`${BASE_URL}${item?.image}`}
                //   logo={item?.logo ? BASE_URL + item?.logo : "favicon.webp"}
                //   title={item?.businessName}
                //   desc={item?.description}
                //   price={item?.deliveryFee}
                //   currency={item?.units?.currencyUnit?.symbol}
                //   deliveryTime={item?.approxDeliveryTime}
                //   deliveryFee={"CHF " + item?.deliveryCharge}
                //   rating={item?.rating}
                //   isOpen={item?.isOpen}
                //   isRushMode={item.isRushMode}
                //   openingTime={item.openingTime}
                //   closingTime={item.closingTime}
                //   completelyClosed={item.completelyClosed}
                //   getConfiguration={item.getConfiguration}
                //   time={item.time}
                //   restBanners={item.restBanners}
                //   onClick={() => {
                //     resDetails(
                //       item?.id,
                //       item?.businessName.toLowerCase(),
                //       item?.businessType == "1" ? "res" : "store"
                //     );
                //     localStorage.removeItem("how");
                //     localStorage.removeItem("when");
                //   }}
                //   logoWidth="w-20 h-20"
                // />

                <RestaurantCard
                  img={`${BASE_URL}${item?.image}`}
                  logo={`${BASE_URL}${item?.logo}`}
                  title={item?.businessName}
                  desc={item?.description}
                  price={item?.deliveryFee}
                  currency={item?.units?.currencyUnit?.symbol}
                  deliveryTime={item?.approxDeliveryTime}
                  deliveryFee={item?.deliveryCharge}
                  rating={item?.rating}
                  isOpen={item?.isOpen}
                  isRushMode={item.isRushMode}
                  openingTime={item.openingTime}
                  closingTime={item.closingTime}
                  completelyClosed={item.completelyClosed}
                  getConfiguration={item.getConfiguration}
                  time={item.time}
                  restBanners={item.restBanners}
                  v="search"
                  onClick={() => {
                    resDetails(
                      item?.id,
                      item?.businessName.toLowerCase(),
                      tab === "Restaurants" ? "res" : "store"
                    );
                    localStorage.removeItem("how");
                    localStorage.removeItem("when");
                  }}
                  logoWidth="w-20 h-20"
                />
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-4 font-sf">
            {filteredData.map((item, idx) => {
              return (
                <SearchProductCard
                  onClick={() => {
                    setModalData(item?.product);
                    setModal(true);
                    setFilter(true);
                  }}
                  deliveryFee={item?.product?.deliveryPrice}
                  resName={item?.product?.R_MCLink?.restaurant?.businessName}
                  productName={item?.product?.name}
                  image={item?.product?.image}
                  all={item?.product?.discountPrice}
                  text={item?.product?.description}
                  subtext={
                    item?.product?.R_MCLink?.restaurant?.approxDeliveryTime +
                    "-" +
                    (item?.product?.R_MCLink?.restaurant?.approxDeliveryTime +
                      10) +
                    " " +
                    "min"
                  }
                  img={BASE_URL + item?.product?.logo}
                  rating={item?.product?.R_MCLink?.restaurant?.rating}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ========Modal====== */}

      {filter ? (
        <Modal
          onClose={() => setModal(false)}
          isOpen={modal}
          motionPreset="scale"
          isCentered
          size="lg"
          className="modal-custom "
        >
          <ModalOverlay />
          <ModalContent
            borderRadius="20px"
            overflow={"hidden"}
            className=" modal-content-custom"
          >
            <ModalHeader
              p={0}
              boxShadow={
                modalScroll > 10 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none"
              }
              transition="all 0.3s ease"
              position="absolute"
              top={modalScroll > 10 ? "0" : "-60px"}
              left="0"
              right="0"
              backgroundColor="#fff"
              zIndex={10}
              opacity={modalScroll > 10 ? 1 : 0}
              visibility={modalScroll > 10 ? "visible" : "hidden"}
              height="70px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {false ? (
                <div></div>
              ) : (
                <h3
                  className={`${
                    modalScroll > 10 ? "block" : "hidden"
                  } text-base text-center capitalize my-5 font-sf font-medium text-theme-black-2`}
                >
                  {modalData?.name}
                </h3>
              )}
            </ModalHeader>

            <ModalCloseButton
              borderRadius="full"
              bg="#F4F5FA"
              _hover={{ bg: "#e5e5e5" }}
              _focus={{ boxShadow: "none" }}
              size="lg"
              width="40px"
              height="40px"
              fontSize="14px"
              color="black"
              p={2}
              position="absolute"
              right="20px"
              top="16px"
              zIndex={10}
            />
            <ModalBody p={0} borderRadius="20px">
              <div
                onScroll={handleModalScroll}
                className="w-full h-max overflow-auto font-sf custom-scrollbar pb-10"
              >
                <div className="w-full h-[292px] mb-3">
                  <img
                    className="w-full h-full object-cover"
                    src={BASE_URL + modalData?.image}
                    alt=""
                  />
                </div>
                <div className=" px-4">
                  <h4 className="!text-[32px] max-w-[400px]  text-theme-black-2 font-omnes font-bold capitalize  leading-10">
                    {modalData?.name}
                  </h4>
                  <p className="font-sf text-lg my-5 text-red-600">
                    {modalData?.R_MCLink?.restaurant?.zoneRestaurant?.zone
                      ?.zoneDetail?.currencyUnit?.symbol +
                      " " +
                      modalData?.discountPrice}
                  </p>
                  <p className="capitalize text-sm font-sf text-theme-black-2  font-normal mt-3">
                    {modalData?.description}
                  </p>
                  {console.log(modalData)}
                  <p className="text-gray-600 font-sf font-normal text-xs mt-8">
                    ORDER FROM
                  </p>

                  <div
                    onClick={() => {
                      navigate(
                        `/${countryCode?.toLowerCase()}/${city.toLowerCase()}/${
                          modalData?.R_MCLink?.restaurant?.businessType == "1"
                            ? "restaurants"
                            : "stores"
                        }/${
                          modalData?.R_MCLink?.restaurant?.businessName
                            .toLowerCase()
                            ?.split(" ")
                            .join("-") +
                          ("-" +
                            (modalData?.R_MCLink?.restaurant?.businessType ==
                            "1"
                              ? "res"
                              : "store") +
                            "-") +
                          modalData?.R_MCLink?.restaurant?.id
                        }`
                      );
                    }}
                    className="w-full flex justify-between items-center shadow-restaurantCardSahadow rounded-lg mt-4 pr-4 cursor-pointer"
                  >
                    <div className="flex gap-x-2 items-center">
                      <div className="w-32 h-20 rounded-lg p-3">
                        <img
                          className="w-full h-full object-cover"
                          src={BASE_URL + modalData?.image}
                          alt=""
                        />
                      </div>
                      <div>
                        <h4 className="font-bold font-sf text-lg line-clamp-1 text-theme-black-2">
                          {modalData?.name}
                        </h4>
                        <p className="text-sm text-gray-600 font-light flex gap-x-2 items-center">
                          {" "}
                          <CustomDeliveryIcon color="gray" size="16" />{" "}
                          {modalData?.R_MCLink?.restaurant?.zoneRestaurant?.zone
                            ?.zoneDetail?.currencyUnit?.symbol +
                            modalData?.R_MCLink?.restaurant
                              ?.deliveryCharge}{" "}
                          {modalData?.R_MCLink?.restaurant?.approxDeliveryTime}{" "}
                          min . 😊 8.4
                        </p>
                      </div>
                    </div>

                    <MdNavigateNext size={25} className="text-red-600" />
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter p={3}>
              <div
                onClick={() => {
                  navigate(
                    `/${countryCode?.toLowerCase()}/${city?.toLowerCase()}/${
                      modalData?.R_MCLink?.restaurant?.businessType == "1"
                        ? "restaurants"
                        : "stores"
                    }/${
                      modalData?.R_MCLink?.restaurant?.businessName
                        .toLowerCase()
                        ?.split(" ")
                        .join("-") +
                      ("-" +
                        (modalData?.R_MCLink?.restaurant?.businessType == "1"
                          ? "res"
                          : "store") +
                        "-") +
                      modalData?.R_MCLink?.restaurant?.id
                    }/${
                      modalData?.name?.toLowerCase().split(" ").join("-") +
                      "-" +
                      modalData?.id
                    }`
                  );
                }}
                className="w-full flex justify-center bg-theme-red text-white font-sf font-bold text-base py-4 rounded-lg cursor-pointer"
              >
                Start ordering
              </div>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : (
        <Modal
          onClose={() => setModal(false)}
          isOpen={modal}
          isCentered
          size={md ? "xl" : "sm"}
          className="modal-custom "
        >
          <ModalOverlay />
          <ModalContent
            borderRadius={"20px"}
            overflow={"hidden"}
            maxW={["500px", "510px"]}
            className="modal-content-custom"
          >
            <ModalHeader>
              <button
                className="text-theme-red-2 font-sf text-base"
                onClick={handleClearFilters}
              >
                {t("Clear filters")}
              </button>

              <div
                onClick={() => setModal(false)}
                className="absolute z-20 top-5 right-6 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
              >
                <IoClose size={30} />
              </div>
            </ModalHeader>

            <ModalBody p={0}>
              <div
                onScroll={handleModalScroll}
                className="custom-scrollbar  max-h-[calc(100vh-200px)] ultraLargeDesktop:h-screen-minus-50vh h-auto overflow-auto font-sf  space-y-10"
              >
                <div className="relative mt-4">
                  <div className="space-y-5 px-4">
                    <h5 className="font-bold text-3xl font-omnes text-theme-black-2">
                      Filter
                    </h5>

                    <div className="flex items-center flex-wrap sm:gap-2 gap-1">
                      {allResultsFilter?.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedResultFilter(item);
                          }}
                          className={`sm:py-1 py-1.5 sm:px-3 px-2 font-medium text-sm rounded-full border-2 border-[#e4e4e5] text-theme-black-2 text-opacity-65 hover:bg-theme-green-2 hover:bg-opacity-10 hover:border-theme-green-2 ${
                            item === selectedResultFilter
                              ? " border-theme-green-2 text-opacity-65 "
                              : "bg-transparent  "
                          }`}
                        >
                          {t(item)}
                        </button>
                      ))}
                    </div>

                    {type === "venue" && (
                      <>
                        <h5 className="font-semibold text-xl font-omnes">
                          {t("Category")}
                        </h5>
                        <div className="flex items-start justify-start flex-wrap sm:gap-2 gap-2  overflow-hidden">
                          {type === "venue" ? (
                            <>
                              {filtersToShow.map(
                                (menu, index) =>
                                  menu?.businessType === "1" && (
                                    <button
                                      key={`restaurant-${index}`}
                                      onClick={() =>
                                        handleCuisineSelect(menu?.id)
                                      }
                                      className={`sm:py-1.5 py-1.5 sm:px-3 px-2 font-medium text-sm rounded-full ${
                                        cuisineIds?.find(
                                          (ele) => parseInt(ele) === menu?.id
                                        )
                                          ? "text-white bg-theme-green-2"
                                          : "text-theme-green-2 bg-theme-green-4"
                                      }`}
                                    >
                                      <span className="capitalize">
                                        {menu?.name
                                          ?.replace(/^\p{Emoji}+/u, "")
                                          .trim()}
                                      </span>
                                    </button>
                                  )
                              )}
                            </>
                          ) : tab === "Stores" ? (
                            data?.data?.storeMenuCategories?.map(
                              (menu, index) => (
                                <button
                                  key={`store-${index}`}
                                  onClick={() => handleCuisineSelect(menu.id)}
                                  className={`sm:py-2.5 py-1.5 sm:px-4 px-3 font-medium text-sm rounded-full font-sf ${
                                    filterData?.find(
                                      (ele) => parseInt(ele) === menu?.id
                                    )
                                      ? "text-white bg-theme-green-2"
                                      : "text-theme-green-2 bg-theme-green-4"
                                  }`}
                                >
                                  <span className="capitalize">
                                    {" "}
                                    {menu?.name
                                      ?.replace(/^\p{Emoji}+/u, "")
                                      .trim()}
                                  </span>
                                </button>
                              )
                            )
                          ) : (
                            <></>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {!showAll && totalFilters > 20 && (
                    <div className="fade-gr"></div>
                  )}

                  {totalFilters > 20 && (
                    <button
                      className="gap-x-2 w-full bg-white flex justify-center items-center  text-sm font-medium text-theme-green-2 py-4 border-b border-[#2021250a]"
                      onClick={() => setShowAll(!showAll)}
                    >
                      <div className="p-[2px] bg-theme-green-2 rounded-full">
                        <FaPlus size={10} color="white" />
                      </div>
                      {showAll ? "See all filters" : "See all filters"}
                    </button>
                  )}
                </div>

                <div className="space-y-5 px-4">
                  <h5 className="font-semibold text-xl font-omnes">
                    {t("Sort by")}
                  </h5>
                  <div className="flex items-center flex-wrap sm:gap-2 gap-1">
                    {sortBy?.map((sorting, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSort(sorting);
                        }}
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
                <div className="space-y-5 px-4 flex justify-between items-center">
                  <h5 className="font-semibold text-xl font-omnes">
                    {t("Delivers to you now")}
                  </h5>
                  <div>
                    <Switch
                      onChange={(val) => {
                        setHeaderSearch({ ...headerSearch, openFilter: val });
                      }}
                      checked={headerSearch.openFilter}
                      onColor="#379465"
                      offColor="#d9d9d9"
                      checkedIcon={false}
                      uncheckedIcon={false}
                      height={29}
                      width={52}
                      handleDiameter={23}
                    />
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter px={4}>
              <button
                onClick={
                  cuisineIds?.length > 0 ||
                  sort !== sortBy[0] ||
                  headerSearch.openFilter ||
                  selectedResultFilter
                    ? handleFilter
                    : () => setModal(false)
                }
                className={`w-full py-[15px] rounded-md font-bold font-sf  shadow-buttonShadow ${
                  cuisineIds?.length > 0 ||
                  sort !== sortBy[0] ||
                  headerSearch.openFilter ||
                  selectedResultFilter
                    ? "bg-theme-red text-white"
                    : "bg-theme-red bg-opacity-10 hover:bg-opacity-20 text-theme-red"
                }`}
              >
                {cuisineIds?.length > 0 ||
                sort !== sortBy[0] ||
                headerSearch.openFilter ||
                selectedResultFilter
                  ? ` ${t("Apply")}`
                  : t("Close")}
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default SearchResults;
