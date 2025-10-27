import { useContext, useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import RestaurantCard from "../../components/RestaurantCard";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useMediaQuery,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import GetAPI from "../../utilities/GetAPI";
import { BASE_URL } from "../../utilities/URL";
import Loader from "../../components/Loader";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { RiErrorWarningFill } from "react-icons/ri";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  SampleNextArrow,
  SamplePrevArrow,
} from "../../components/SliderArrows";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { dataContext } from "../../utilities/ContextApi";
import findZoneByCoordinatesLocal from "../../utilities/FindZoneByLatLocal";
import { motion } from "framer-motion";
import LazyLoadComponent from "../../components/LazyLoadComponent";
import { Skeleton } from "@chakra-ui/react";
import { getRestaurantOrderType } from "../../utilities/discoveryConfig";
import { TbMapPin2 } from "react-icons/tb";
import { IoListSharp } from "react-icons/io5";
import RestaurantMap from "./RestaurantMap";

export default function Restaurants() {
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
    setSearchTerm,
  } = useContext(dataContext);

  const navigate = useNavigate();
  const location = useLocation();
  const [xl] = useMediaQuery("(min-width: 1280px)");
  const [lg] = useMediaQuery("(min-width: 1024px)");
  const [md] = useMediaQuery("(min-width: 768px)");
  const [sm] = useMediaQuery("(max-width: 640px)");
  const { countryCode, cityName } = useParams();
  const [profileDrawer, setProfileDrawer] = useState(false);
  const city = localStorage.getItem("guestFormatAddress");
  const { t, i18n } = useTranslation();

  let lat, lng;
  if (cityName.startsWith("lat=") && cityName.includes("&lng=")) {
    const [latPart, lngPart] = cityName.split("&");
    lat = latPart.split("=")[1];
    lng = lngPart.split("=")[1];
  }

  const apiUrl =
    lat && lng
      ? `users/home3?lat=${lat}&lng=${lng}`
      : `users/home3?cityName=${cityName}`;
  const { data, error, isLoading } = GetAPI(apiUrl);
  //   const { data, error, isLoading } = useRestaurants(cityName, lat, lng);

  //   const data = discoveryData?.data || [];
  console.log("discoveryData:", data); // --- IGNORE ---
  const checkZone = async () => {
    const zoneId = await findZoneByCoordinatesLocal(data?.data?.zoneList);
    localStorage.setItem("zoneId", zoneId);
  };

  useEffect(() => {
    if (data?.data?.zoneList) {
      checkZone();
    }
  }, [data?.data?.zoneList]);

  const [tab, setTab] = useState("Restaurants");
  const [mobileTab, setMobileTab] = useState("Restaurants");
  const [sort, setSort] = useState("Recommended");
  const [initialSort, setInitialSort] = useState("Recommended");
  const [sortChanged, setSortChanged] = useState(false);
  const [filterShow, setFilterShow] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [orderType, setOrderType] = useState("both");

  const sortBy = [
    "Recommended",
    "Delivery Price",
    "Rating",
    "Delivery Time",
    "Distance",
  ];
  const [filterData, setFilterData] = useState([]);
  const [modalScroll, setModalScroll] = useState(0);
  const [showContentAfterFilter, setShowContentAfterFilter] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

  const handleModalScroll = (event) => {
    setModalScroll(event.target.scrollTop);
  };
  const [modal, setModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const totalFilters = data?.data?.RestaurantMenuCategories?.length || 0;
  const filtersToShow =
    totalFilters <= 18 || showAll
      ? data?.data?.RestaurantMenuCategories
      : data?.data?.RestaurantMenuCategories?.slice(0, 20);
  const [isMap, setIsMap] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (location.pathname === `/${countryCode}/${cityName}/restaurants`) {
      setTab("Restaurants");
      setProfileDrawer(false);
    } else if (location.pathname === `/${countryCode}/${cityName}/stores`) {
      setTab("Stores");
    } else if (tab === "profile") {
      setProfileDrawer(true);
    } else {
      navigate(`/${countryCode}/${cityName}/restaurants`);
    }
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname, countryCode, cityName, navigate]);

  const resDetails = (restaurantId, businessName, businessType) => {
    localStorage.setItem("resId", restaurantId);
    setSearchTerm("");
    setPending("recent");
    if (businessType === "1") {
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

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2.00018,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0%",
    cssEase: "cubic-bezier(0.455, 0.030, 0.515, 0.955)",
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1920,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
          centerMode: true,
          centerPadding: "0%",
        },
      },
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
          centerMode: true,
          centerPadding: "2%",
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
          centerMode: true,
          centerPadding: "2%",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
          centerPadding: "3%",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
          centerPadding: "3%",
        },
      },
    ],
  };

  // Remove emoji from the text, coming with the category name
  const removeEmojis = (text) => {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
      .replace(/[\u{1F950}-\u{1F96B}]/gu, "")
      .replace(/[\u{1F980}-\u{1F991}]/gu, "")
      .replace(/[\u{1F9C0}-\u{1F9C2}]/gu, "")
      .replace(/[\uD83C\uDF00-\uD83C\uDFFF]/gu, "")
      .trim();
  };

  const [showClearFilterBtn, setShowClearFilterBtn] = useState(false);
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

  const [filterDataCount, setFilterDataCount] = useState(0);
  let [filteredItems, setFilteredItems] = useState("");
  useEffect(() => {
    if (tab === "Restaurants") {
      filteredItems =
        data?.data?.restaurantList?.restaurantList?.filter((restaurant) =>
          restaurant.cusinesList?.some((cuisine) =>
            filterData.includes(cuisine?.cuisine?.id)
          )
        ) || [];
    } else if (tab === "Stores") {
      filteredItems =
        data?.data?.storeList?.storeList?.filter((store) =>
          store.cusinesList?.some((cuisine) =>
            filterData.includes(cuisine?.cuisine?.id)
          )
        ) || [];
    }
    setFilterDataCount(filteredItems.length);
  }, [filterData, data, tab]);

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

  const handleSort = (sort) => {
    setSort(sort);
    if (sort !== "Recommended") {
      setShowClearFilterBtn(true);
    }
  };
  const handleFilter = async () => {
    let filteredItems = [];

    if (tab === "Restaurants") {
      if (filterData.length > 0) {
        filteredItems =
          data?.data?.restaurantList?.restaurantList?.filter((restaurant) =>
            restaurant.cusinesList?.some((cuisine) =>
              filterData.includes(cuisine?.cuisine?.id)
            )
          ) || [];
      } else {
        filteredItems = data?.data?.restaurantList?.restaurantList || [];
      }
    } else if (tab === "Stores") {
      if (filterData.length > 0) {
        filteredItems =
          data?.data?.storeList?.storeList?.filter((store) =>
            store.cusinesList?.some((cuisine) =>
              filterData.includes(cuisine?.cuisine?.id)
            )
          ) || [];
      } else {
        filteredItems = data?.data?.storeList?.storeList || [];
      }
    }

    // Now apply sorting properly
    switch (sort) {
      case "Delivery Price":
        filteredItems.sort((a, b) => a.deliveryFee - b.deliveryFee);
        break;
      case "Rating":
        filteredItems.sort((a, b) => b.rating - a.rating);
        break;
      case "Delivery Time":
        filteredItems.sort((a, b) => a.deliveryTime - b.deliveryTime);
        break;
      case "Distance":
        const userLocation = await getUserLocation();
        filteredItems.sort((a, b) => {
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

    setFilteredData(filteredItems);
    setFilterShow(true);
    setModal(false);
    setInitialSort(sort);
    setShowContentAfterFilter(filterData);

    if (filterData.length > 0) {
      const cuisineQuery = filterData
        .map((id) => {
          const cuisine = filtersToShow.find((c) => c.id === id);
          const name = formatCuisineName(cuisine?.name || "");
          return `${id}-${name}`;
        })
        .join("&");
      const sortQuery = sort ? `&sort=${sort}` : "";
      navigate(
        `/${countryCode}/${cityName}/${tab.toLowerCase()}?filters=${cuisineQuery}${sortQuery}`
      );
    } else {
      const sortQuery = sort ? `?sort=${sort}` : "";
      navigate(`/${countryCode}/${cityName}/${tab.toLowerCase()}${sortQuery}`);
    }
  };

  const [restaurantList, setRestaurantList] = useState(null);
  const [storeFilteredList, setStoreFilteredList] = useState(null);
  useEffect(() => {
    if (!data?.data) return;
    setRestaurantList(data?.data?.restaurantList?.restaurantList || []);
    setStoreFilteredList(data?.data?.storeList?.storeList || []);
  }, [data]);

  // re-filter on changes
  useEffect(() => {
    if (tab === "Restaurants") {
      filterRestaurants(orderType);
    } else if (tab === "Stores") {
      filterStores(orderType);
    }
  }, [tab, orderType, restaurantList, storeFilteredList]);

  // shared helper
  const filterByOrderType = (list = [], type) => {
    if (type === "all") return list;
    return list.filter((item) => {
      const t = getRestaurantOrderType(item); // 'delivery' | 'pickup' | 'both' | ''
      if (type === "pickup") return t === "pickup" || t === "both";
      if (type === "delivery") return t === "delivery" || t === "both";
      if (type === "both") return t === "both";
      return false;
    });
  };

  // restaurants
  const filterRestaurants = (type) => {
    if (!Array.isArray(restaurantList)) return setFilteredData([]);
    const next = filterByOrderType(restaurantList, type);
    setFilteredData(next);
  };
  const showPopular = isMap && !showContentAfterFilter && orderType === "both";

  const filterStores = (type) => {
    if (!Array.isArray(storeFilteredList)) return setFilteredData([]);
    const next = filterByOrderType(storeFilteredList, type);
    setFilteredData(next);
  };

  useEffect(() => {
    const query = location.search;
    const params = query.substring(1).split("&");

    const filtersIndex = params.findIndex((param) =>
      param.startsWith("filters=")
    );
    const filtersAndAfter =
      filtersIndex !== -1 ? params.slice(filtersIndex) : [];

    const filterValues = filtersAndAfter.map((param) => {
      const [key, value] = param.split("=");
      return value ? value.toLowerCase() : key.toLowerCase();
    });

    const cuisinesFromUrl = filterValues
      .map((entry) => {
        const [id] = entry.split("-");
        return parseInt(id);
      })
      .filter(Boolean);

    const sortParam = params.find((param) => param.startsWith("sort="));
    const sortValue = sortParam
      ? decodeURIComponent(sortParam.split("=")[1])
      : "";

    let filteredItems = [];

    if (cuisinesFromUrl.length > 0) {
      setFilterData(cuisinesFromUrl);
      setShowClearFilterBtn(true);
      setShowContentAfterFilter(true);
    }

    if (tab === "Restaurants") {
      filteredItems = (data?.data?.restaurantList?.restaurantList || []).filter(
        (restaurant) =>
          cuisinesFromUrl.length === 0
            ? true
            : restaurant.cusinesList?.some((cuisine) =>
                cuisinesFromUrl.includes(cuisine?.cuisine?.id)
              )
      );
    } else if (tab === "Stores") {
      filteredItems = (data?.data?.storeList?.storeList || []).filter((store) =>
        cuisinesFromUrl.length === 0
          ? true
          : store.cusinesList?.some((cuisine) =>
              cuisinesFromUrl.includes(cuisine?.cuisine?.id)
            )
      );
    }

    // ✅ Apply sorting from URL
    const applySort = async () => {
      const currentSort = sortValue?.trim() ? sortValue : "Recommended";

      switch (currentSort) {
        case "Delivery Price":
          filteredItems.sort((a, b) => a.deliveryFee - b.deliveryFee);
          break;
        case "Rating":
          filteredItems.sort((a, b) => b.rating - a.rating);
          break;
        case "Delivery Time":
          filteredItems.sort((a, b) => a.deliveryTime - b.deliveryTime);
          break;
        case "Distance":
          const userLocation = await getUserLocation();
          filteredItems.sort((a, b) => {
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
        case "Recommended":
        default:
          // Optionally, keep existing order or implement custom logic for "Recommended"
          break;
      }

      setFilteredData(filteredItems);
      setFilterShow(true);
      setInitialSort(currentSort);
    };

    applySort();
  }, [data, tab, location.search]);

  const openModal = () => {
    setInitialSort(sort);
    setModal(true);
  };

  const handleClearFilters = () => {
    setFilterData([]);
    setSort("Recommended");
    setInitialSort("Recommended");
    setShowClearFilterBtn(false);
  };
  const formatCuisineName = (name) => {
    return name.replace(/[^\w\s]/gi, "").trim();
  };

  const closeModal = () => {
    setModal(false);
    if (!filterData.length > 0 && sort === "Recommended") {
      setFilterShow(false);
      setFilteredData([]);
      setFilterData([]);
      setSort("Recommended");
      setSortChanged(false);
      setShowContentAfterFilter(false);
      setShowAll(false);
      navigate(`/${countryCode}/${cityName}/${tab.toLowerCase()}`);
    }
  };

  const handleCusineNavigation = (cuisineId, cuisineName) => {
    const formattedName = formatCuisineName(cuisineName);
    navigate(
      `/${countryCode}/${cityName}/${tab.toLocaleLowerCase()}/cuisine/${formattedName.toLocaleLowerCase()}/${cuisineId}`
    );
  };
  const handleOfferBanners = (bannerId, title) => {
    const formattedTitle = title.replace(/\s+/g, "-");
    navigate(
      `/${countryCode}/${cityName}/offer/${formattedTitle.toLowerCase()}/${bannerId}`,
      {
        // No need to pass state here
      }
    );
  };
  const [loadingMap, setLoadingMap] = useState({}); // Track loading for each banner by id

  // Initialize loading states for all items when data loads
  useEffect(() => {
    if (data?.data) {
      const initialLoadingState = {};
      
      // Initialize banners
      const banners = tab === "Restaurants" 
        ? data?.data?.restaurantBanners 
        : data?.data?.storeBanners;
      banners?.forEach(banner => {
        initialLoadingState[banner.id] = true;
      });
      
      // Initialize categories
      const categories = tab === "Restaurants"
        ? data?.data?.RestaurantMenuCategories
        : data?.data?.storeMenuCategories;
      categories?.forEach(category => {
        initialLoadingState[category.id] = true;
      });
      
      // Initialize restaurants/stores
      const items = tab === "Restaurants"
        ? [
            ...(data?.data?.restaurantList?.popularRestaurants || []),
            ...(data?.data?.restaurantList?.restaurantList || [])
          ]
        : [
            ...(data?.data?.storeList?.popularStores || []),
            ...(data?.data?.storeList?.storeList || [])
          ];
      items?.forEach(item => {
        initialLoadingState[item.id] = true;
      });
      
      setLoadingMap(initialLoadingState);
    }
  }, [data, tab]);

  const handleLoad = (id) => {
    setLoadingMap((prev) => ({ ...prev, [id]: false }));
  };

  // Helper function to check if item is loading (returns true for undefined items)
  const isItemLoading = (id) => {
    return loadingMap[id] !== false;
  };

  return isLoading ? (
    <Loader />
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Modal
        onClose={closeModal}
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
          <ModalHeader
            p={0}
            boxShadow={
              modalScroll > 10 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none"
            }
            transition="all 0.4s ease"
            position="absolute"
            top={modalScroll > 10 ? "0" : "-4px"}
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
            <motion.div
              className="text-base text-center capitalize my-5 font-sf font-semibold text-theme-black-2"
              initial={{ opacity: 1, y: "-1rem" }} // Start from above and invisible
              animate={{
                opacity: modalScroll > 10 ? 1 : 0, // Fade out on scroll down, fade in on scroll up
                y: modalScroll > 10 ? 0 : "-1rem", // Move up on scroll down, move to center on scroll up
              }}
              transition={{
                duration: 0.2, // Adjust the transition speed
                delay: 0.1, // Add a delay of 0.2 seconds
              }}
            >
              Filters
            </motion.div>
          </ModalHeader>

          <ModalBody p={0}>
            <div
              onScroll={handleModalScroll}
              className="custom-scrollbar  max-h-[calc(100vh-200px)] ultraLargeDesktop:h-screen-minus-50vh h-auto overflow-auto font-sf  space-y-10"
            >
              <div
                onClick={() => setModal(false)}
                className="absolute z-20 top-5 right-6 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
              >
                <IoClose size={30} />
              </div>
              <button
                className="text-theme-red-2 font-sf text-base px-4"
                onClick={handleClearFilters}
                style={{
                  visibility: showClearFilterBtn > 0 ? "visible" : "hidden",
                }}
              >
                {t("Clear filters")}
              </button>
              <div className="relative !mt-4">
                <div className="space-y-5 px-4">
                  <h5 className="font-bold text-3xl font-omnes text-theme-black-2 ">
                    Filter
                  </h5>
                  <div className="flex items-start justify-start flex-wrap sm:gap-2 gap-2  overflow-hidden">
                    {tab === "Restaurants" ? (
                      <>
                        {filtersToShow?.map((menu, index) => (
                          <button
                            key={`restaurant-${index}`}
                            onClick={() => handleCuisineSelect(menu?.id)}
                            className={`sm:py-1.5 py-1.5 sm:px-3 px-2 font-medium text-sm rounded-full ${
                              filterData?.find(
                                (ele) => parseInt(ele) === menu?.id
                              )
                                ? "text-white bg-theme-green-2"
                                : "text-theme-green-2 bg-theme-green-4"
                            }`}
                          >
                            <span className="capitalize">
                              {menu?.name?.replace(/^\p{Emoji}+/u, "").trim()}
                            </span>
                          </button>
                        ))}
                      </>
                    ) : tab === "Stores" ? (
                      data?.data?.storeMenuCategories?.map((menu, index) => (
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
                            {menu?.name?.replace(/^\p{Emoji}+/u, "").trim()}
                          </span>
                        </button>
                      ))
                    ) : (
                      <></>
                    )}
                  </div>
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
                        handleSort(sorting);
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
            </div>
          </ModalBody>
          <ModalFooter px={4}>
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
                  (filterData?.length > 0 ? ` (${filterDataCount} found)` : "")
                : t("Close")}
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Header
        home={false}
        rest={true}
        profileDrawer={profileDrawer}
        setProfileDrawer={setProfileDrawer}
        discovery={true}
      />
      {
        <section className="relative">
          <section className={`relative space-y-12 font-sf `}>
            <div className="relative px-[30px]  flex justify-center md:pt-24 pt-24 store-selection w-[92%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%] mx-auto space-y-3 custom-max-width">
              {!sm && (
                <>
                  <div className="w-fit flex bg-theme-gray-3 p-1 rounded-full ms-8 ">
                    <button
                      onClick={() => {
                        navigate(`/${countryCode}/${cityName}/restaurants`);
                        setTab("Restaurants");
                        setSearchTerm("");
                        setPending("recent");
                        setIsMap(true);
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
                        navigate(`/${countryCode}/${cityName}/stores`);
                        setTab("Stores");
                        setSearchTerm("");
                        setPending("recent");
                        setIsMap(true);
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

                  <div className="absolute md:right-[10px] largeDesktop:right-[30px] bottom-0">
                    <button
                      onClick={() => setIsMap(!isMap)}
                      className=" p-2.5 text-black rounded-full sm:font-medium font-medium text-sm flex justify-center items-center gap-x-2 bg-theme-gray-3 "
                    >
                      {isMap ? (
                        <TbMapPin2 size={25} color="#202125" />
                      ) : (
                        <IoListSharp size={25} color="#202125" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {loading && (
              <div className="flex justify-center items-center py-8 h-screen-minus-30vh">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-red"></div>
              </div>
            )}

            {!loading &&
              isMap &&
              ((tab === "Restaurants" &&
                data?.data?.restaurantList?.restaurantList?.length > 0) ||
              (tab === "Stores" &&
                data?.data?.storeList?.storeList?.length > 0) ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <div className="relative w-full">
                    <div className="space-y-9 sm:space-y-12">
                      {!showContentAfterFilter && (
                        <div className="carousel-container custom-max-width space-x-2">
                          <Slider {...settings}>
                            {(() => {
                              const banners =
                                tab === "Restaurants"
                                  ? data?.data?.restaurantBanners
                                  : data?.data?.storeBanners;

                              const filteredBanners =
                                banners?.filter((ban) => ban?.id >= 5) || [];

                              const finalBanners =
                                filteredBanners.length === 1
                                  ? [filteredBanners[0], filteredBanners[0]]
                                  : filteredBanners;

                              return finalBanners.map((ban, index) => {
                                const isVideo = ban?.image?.endsWith(".mp4");
                                const isLoading = isItemLoading(ban.id);

                                return (
                                  <div
                                    key={`${ban.id}-${index}`}
                                    className="outer-wrapper"
                                  >
                                    <div
                                      className="banner-slide bg-black bg-opacity-10 cursor-pointer"
                                      onClick={() =>
                                        handleOfferBanners(ban?.id, ban?.title)
                                      }
                                    >
                                      <Skeleton
                                        isLoaded={!isLoading}
                                        startColor="gray.300"
                                        endColor="gray.100"
                                        borderRadius="md"
                                        height="400px"
                                        width="100%"
                                        position="relative"
                                      >
                                        {isVideo ? (
                                          <video
                                            className="w-full h-full mx-auto object-cover"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            onLoadedData={() =>
                                              handleLoad(ban.id)
                                            }
                                            style={{
                                              display: isLoading
                                                ? "none"
                                                : "block",
                                            }}
                                          >
                                            <source
                                              src={`${BASE_URL}${ban?.image}`}
                                              type="video/mp4"
                                            />
                                            Your browser does not support the
                                            video tag.
                                          </video>
                                        ) : (
                                          <img
                                            src={`${BASE_URL}${ban?.image}`}
                                            alt={`banner-${index}`}
                                            className="w-full h-full mx-auto object-cover"
                                            onLoad={() => handleLoad(ban.id)}
                                            style={{
                                              display: isLoading
                                                ? "none"
                                                : "block",
                                            }}
                                          />
                                        )}
                                      </Skeleton>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </Slider>
                        </div>
                      )}

                      <div className="flex flex-row items-start justify-between w-[92%] lg:w-[95%] extraLargeDesktop:w-[83.34%] mx-auto custom-max-width">
                        {!showContentAfterFilter ? (
                          <div className="flex justify-between items-start w-full md:w-auto">
                            <div className="space-y-6">
                              <h3 className="font-omnes font-bold md:text-[40px] lg:text-[48px] text-3xl text-theme-black-2">
                                {t(
                                  tab === "Restaurants"
                                    ? "Restaurants"
                                    : "Stores"
                                )}{" "}
                                {t("Near me")}
                              </h3>
                              <div className="flex items-center gap-x-2 text-black text-opacity-65">
                                <RiErrorWarningFill size={16} />
                                <p className="font-sf font-normal text-xs">
                                  {t(
                                    "Learn how we find and sort search results"
                                  )}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setModal(true)}
                              className="pt-2 block md:hidden justify-end items-center gap-x-2 text-theme-red-2 font-sf font-medium lg:order-2 order-1"
                            >
                              <span className="rotate-90 sm:w-10 w-8 sm:h-10 h-8 flex justify-center items-center bg-theme-red bg-opacity-20 rounded-fullest">
                                <img
                                  src="/images/restaurants/filter.webp"
                                  alt="filter"
                                  className="w-4 h-4"
                                />
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="lg:order-1 order-2 space-y-3 flex items-center justify-between w-full flex-1">
                            <h3 className="font-omnes font-black text-3xl">
                              {`All ${
                                tab === "Restaurants" ? "Restaurants" : "Stores"
                              }`}
                            </h3>
                            <button
                              onClick={() => setModal(true)}
                              className="block md:hidden justify-end items-center gap-x-2 text-theme-red-2 font-sf font-medium lg:order-2 order-1"
                            >
                              <span className="rotate-90 sm:w-10 w-8 sm:h-10 h-8 flex justify-center items-center bg-theme-red bg-opacity-20 rounded-fullest">
                                <img
                                  src="/images/restaurants/filter.webp"
                                  alt="filter"
                                  className="w-4 h-4"
                                />
                              </span>
                            </button>
                          </div>
                        )}

                        <div className="flex justify-end gap-x-10">
                          <div className="flex-1 justify-center">
                            <div className="w-fit flex bg-theme-gray-3 p-1 rounded-full ms-8">
                              <button
                                onClick={() => setOrderType("both")}
                                className={`sm:py-1 py-1 sm:px-5 px-3 text-black rounded-full sm:font-medium font-medium text-sm flex justify-center items-center gap-x-2 ${
                                  orderType === "both"
                                    ? "bg-white"
                                    : "text-opacity-40"
                                }`}
                              >
                                {t("All")}
                              </button>
                              <button
                                onClick={() => setOrderType("delivery")}
                                className={`sm:py-1 py-1 sm:px-5 px-3 text-black rounded-full sm:font-medium font-medium text-sm flex justify-center items-center gap-x-2 ${
                                  orderType === "delivery"
                                    ? "bg-white"
                                    : "text-opacity-40"
                                }`}
                              >
                                {t("Delivery")}
                              </button>
                              <button
                                onClick={() => setOrderType("pickup")}
                                className={`sm:py-1 py-1 sm:px-5 px-3 text-black rounded-full sm:font-medium font-medium text-sm flex justify-center items-center gap-x-2 ${
                                  orderType === "pickup"
                                    ? "bg-white"
                                    : "text-opacity-40"
                                }`}
                              >
                                {t("Pickup")}
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => setModal(true)}
                            className="hidden md:flex justify-end items-center gap-x-2 text-theme-red-2 font-sf font-medium lg:order-2 order-1"
                          >
                            <span>
                              <span className="text-sm font-medium">
                                {t("Sorted by")}{" "}
                              </span>
                              <span className="text-base font-bold">
                                {t("Recommended")}
                              </span>
                            </span>
                            <span className="sm:w-10 w-8 sm:h-10 h-8 flex justify-center items-center bg-theme-red bg-opacity-10 hover:bg-theme-red-2 hover:bg-opacity-15 rounded-fullest">
                              <img
                                src="/images/restaurants/filter.webp"
                                alt="filter"
                                className="w-4 h-4 rotate-90"
                              />
                            </span>
                          </button>
                        </div>
                      </div>

                      {!showContentAfterFilter &&
                        ((data?.data?.RestaurantMenuCategories?.length > 0 &&
                          tab === "Restaurants") ||
                        data?.data?.storeMenuCategories?.length > 0 ? (
                          <div className="space-y-4 w-[92%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%] mx-auto custom-max-width">
                            <h6 className="font-omnes font-semibold text-theme-black-2 text-[22px] md:text-[28px]">
                              {t("Categories")}
                            </h6>
                            <div className="swiper-container">
                              <Swiper
                                spaceBetween={10}
                                navigation={{
                                  nextEl: ".cat-custom-swiper-button-next",
                                  prevEl: ".cat-custom-swiper-button-prev",
                                }}
                                breakpoints={{
                                  1440: { slidesPerView: 19 },
                                  1280: { slidesPerView: 15 },
                                  1024: { slidesPerView: 13 },
                                  768: { slidesPerView: 8 },
                                  425: { slidesPerView: 5 },
                                  375: { slidesPerView: 4 },
                                }}
                                modules={[Navigation]}
                                className="[&>div>div>button]:shadow-cardShadow pb-4"
                              >
                                <div className="flex items-center gap-x-5">
                                  {(tab === "Restaurants"
                                    ? data?.data?.RestaurantMenuCategories
                                    : data?.data?.storeMenuCategories
                                  )?.map((cat, index) => {
                                    const isLoading = isItemLoading(cat.id);
                                    return (
                                      <SwiperSlide key={index}>
                                        <div
                                          key={cat?.id}
                                          className="flex flex-col items-center justify-center cursor-pointer"
                                          onClick={() => {
                                            const formattedName =
                                              formatCuisineName(cat.name);
                                            handleCusineNavigation(
                                              cat?.id,
                                              cat.name
                                            );
                                          }}
                                        >
                                          <Skeleton
                                            isLoaded={!isLoading}
                                            borderRadius="full"
                                            height="54px"
                                            width="54px"
                                            startColor="gray.300"
                                            endColor="gray.100"
                                          >
                                            <img
                                              src={BASE_URL + cat?.image}
                                              alt="categories"
                                              className="w-16 h-16 object-contain"
                                              onLoad={() => handleLoad(cat.id)}
                                              style={{
                                                display: isLoading
                                                  ? "none"
                                                  : "block",
                                              }}
                                            />
                                          </Skeleton>
                                          <div className="font-sf font-medium text-sm capitalize text-center mt-2">
                                            <span className="text-ellipsis ellipsis3">
                                              {removeEmojis(cat?.name)}
                                            </span>
                                          </div>
                                        </div>
                                      </SwiperSlide>
                                    );
                                  })}
                                </div>
                              </Swiper>
                              <div className="swiper-btns">
                                <div className="cat-custom-swiper-button-prev">
                                  <FaArrowLeftLong
                                    size={20}
                                    color="#E13743"
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-black"
                                  />
                                </div>
                                <div className="cat-custom-swiper-button-next">
                                  <FaArrowRightLong
                                    size={20}
                                    color="#E13743"
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-black"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <></>
                        ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <></>
              ))}
          </section>

          {!loading &&
            showPopular &&
            (tab === "Restaurants" &&
            data?.data?.restaurantList?.popularRestaurants?.length > 0 ? (
              <section className="w-[92%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%] mx-auto pt-5 lg:pt-10 space-y-3 custom-max-width ">
                <div className="flex  items-center justify-between md:pe-24">
                  <h5 className="font-omnes  font-semibold text-theme-black-2 text-[22px] md:text-[28px]">
                    {t("Popular right now")}
                  </h5>
                  <button
                    className="text-theme-red-2 font-sf text-sm font-medium "
                    onClick={() => {
                      navigate(
                        `/${countryCode}/${cityName}/restaurants/hot-this-week-venues`
                      );
                    }}
                  >
                    {t("See all")}
                  </button>
                </div>
                <div className="swiper-container  ">
                  <Swiper
                    spaceBetween={16}
                    slidesPerView={xl ? 4.1 : lg ? 3.1 : md ? 2.1 : 1.4}
                    navigation={{
                      nextEl: ".custom-swiper-button-next",
                      prevEl: ".custom-swiper-button-prev",
                    }}
                    modules={[Navigation]}
                    className="[&>div>div>button]:shadow-discoveryCardShadow pb-4 pt-1 ps-1"
                  >
                    {data?.data?.restaurantList?.popularRestaurants?.map(
                      (res, index) => (
                        <SwiperSlide key={index}>
                          <RestaurantCard
                            img={`${BASE_URL}${res?.image}`}
                            logo={`${BASE_URL}${res?.logo}`}
                            title={res?.businessName}
                            desc={res?.description}
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
                                res?.businessType
                              );
                              localStorage.removeItem("how");
                              localStorage.removeItem("when");
                            }}
                            logoWidth="w-[60px] h-[60px]"
                            size="sm"
                            id={res?.id}
                            loadingMap={loadingMap}
                            handleLoad={handleLoad}
                          />
                        </SwiperSlide>
                      )
                    )}
                  </Swiper>

                  <div className="swiper-btns hidden md:block">
                    <div className="custom-swiper-button-prev ">
                      <FaArrowLeftLong
                        size={20}
                        color="#E13743"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-black"
                      />
                    </div>
                    <div className="custom-swiper-button-next">
                      <FaArrowRightLong
                        size={20}
                        color="#E13743"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-black"
                      />
                    </div>
                  </div>
                </div>
              </section>
            ) : tab === "Stores" &&
              data?.data?.storeList?.popularStores?.length > 0 ? (
              <section className="w-[92%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%] mx-auto pt-16 space-y-3 custom-max-width ">
                <div className="flex  items-center justify-between md:pe-24">
                  <h5 className="font-omnes  font-semibold text-theme-black-2 text-[22px] md:text-[28px]">
                    {t("Popular right now")}
                  </h5>
                  <button
                    className="text-theme-red-2 font-sf text-sm font-medium "
                    onClick={() => {
                      navigate(
                        `/${countryCode}/${cityName}/restaurants/hot-this-week-venues`
                      );
                    }}
                  >
                    {t("See all")}
                  </button>
                </div>
                <div className="swiper-container !p-1">
                  <Swiper
                    spaceBetween={16}
                    slidesPerView={xl ? 4.1 : lg ? 3.1 : md ? 2.2 : 1.2}
                    navigation={{
                      nextEl: ".custom-swiper-button-next",
                      prevEl: ".custom-swiper-button-prev",
                    }}
                    modules={[Navigation]}
                    className="[&>div>div>button]:shadow-cardShadow pb-4 pt-1 ps-1"
                  >
                    {data?.data?.storeList?.popularStores?.map(
                      (store, index) => (
                        <SwiperSlide key={index}>
                          <RestaurantCard
                            img={`${BASE_URL}${store?.image}`}
                            logo={`${BASE_URL}${store?.logo}`}
                            title={store?.businessName}
                            desc={store?.description}
                            price={store?.deliveryFee}
                            currency={store?.units?.currencyUnit?.symbol}
                            deliveryFee={store?.deliveryFee}
                            deliveryTime={store?.deliveryTime}
                            rating={store?.rating}
                            isOpen={store?.isOpen}
                            isRushMode={store?.isRushMode}
                            openingTime={store?.openingTime}
                            closingTime={store?.closingTime}
                            completelyClosed={store?.completelyClosed}
                            getConfiguration={store?.getConfiguration}
                            restBanners={store?.restBanners}
                            time={store.time}
                            onClick={() => {
                              resDetails(
                                store?.id,
                                store.businessName.toLowerCase(),
                                store?.businessType
                              );
                              localStorage.removeItem("how");
                              localStorage.removeItem("when");
                            }}
                            logoWidth="w-[60px] h-[60px]"
                            size="sm"
                            id={store?.id}
                            loadingMap={loadingMap}
                            handleLoad={handleLoad}
                          />
                        </SwiperSlide>
                      )
                    )}
                  </Swiper>
                  <div className="swiper-btns">
                    <div className="custom-swiper-button-prev">
                      <FaArrowLeftLong
                        size={20}
                        color="#E13743"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-black"
                      />
                    </div>
                    <div className="custom-swiper-button-next">
                      <FaArrowRightLong
                        size={20}
                        color="#E13743"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-black"
                      />
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <></>
            ))}
          {!loading &&
            isMap &&
            ((tab === "Restaurants" &&
              data?.data?.restaurantList?.restaurantList?.length > 0) ||
            (tab === "Stores" &&
              data?.data?.storeList?.storeList?.length > 0) ? (
              <section className="w-[92%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%] mx-auto py-12 space-y-3 custom-max-width">
                {!showContentAfterFilter && (
                  <h5 className="font-omnes font-semibold text-theme-black-2 text-[22px] md:text-[28px]">
                    {t("All")}{" "}
                    {tab === "Restaurants"
                      ? t("Restaurants")
                      : tab === "Stores"
                      ? t("Stores")
                      : ""}
                  </h5>
                )}

                <section className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 font-sf">
                  {filterShow && filteredData.length > 0
                    ? filteredData.map((res, index) => (
                        <LazyLoadComponent key={index}>
                          <RestaurantCard
                            img={`${BASE_URL}${res?.image}`}
                            logo={`${BASE_URL}${res?.logo}`}
                            title={res?.businessName}
                            desc={res?.description}
                            price={res?.deliveryFee}
                            currency={res?.units?.currencyUnit?.symbol}
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
                            restBanners={res.restBanners}
                            ticker="New"
                            onClick={() => {
                              resDetails(
                                res?.id,
                                res?.businessName.toLowerCase(),
                                res?.businessType
                              );
                              localStorage.removeItem("how");
                              localStorage.removeItem("when");
                            }}
                            logoWidth="w-20 h-20"
                            id={res?.id}
                            loadingMap={loadingMap}
                            handleLoad={handleLoad}
                          />
                        </LazyLoadComponent>
                      ))
                    : (tab === "Restaurants"
                        ? data?.data?.restaurantList?.restaurantList
                        : data?.data?.storeList?.storeList
                      )?.map((item, index) => (
                        <LazyLoadComponent key={index}>
                          <RestaurantCard
                            img={`${BASE_URL}${item?.image}`}
                            logo={`${BASE_URL}${item?.logo}`}
                            title={item?.businessName}
                            desc={item?.description}
                            price={item?.deliveryFee}
                            currency={item?.units?.currencyUnit?.symbol}
                            deliveryTime={item?.deliveryTime}
                            deliveryFee={item?.deliveryFee}
                            rating={item?.rating}
                            isOpen={item?.isOpen}
                            isRushMode={item.isRushMode}
                            openingTime={item.openingTime}
                            closingTime={item.closingTime}
                            completelyClosed={item.completelyClosed}
                            getConfiguration={item.getConfiguration}
                            time={item.time}
                            restBanners={item.restBanners}
                            onClick={() => {
                              resDetails(
                                item?.id,
                                item?.businessName.toLowerCase(),
                                item?.businessType
                              );
                              localStorage.removeItem("how");
                              localStorage.removeItem("when");
                            }}
                            logoWidth="w-20 h-20"
                            id={item?.id}
                            loadingMap={loadingMap}
                            handleLoad={handleLoad}
                          />
                        </LazyLoadComponent>
                      ))}
                </section>
              </section>
            ) : (
              <section className="2xl:w-4/5 w-11/12 mx-auto pt-16 pb-32 space-y-12 font-omnes">
                <h3 className="font-bold text-4xl">
                  {tab === "Restaurants"
                    ? "Restaurants"
                    : tab === "Stores"
                    ? "Stores and supermarkets"
                    : ""}{" "}
                  near me
                </h3>
                <div className="flex flex-col justify-center items-center space-y-4 text-center">
                  <div>
                    <img
                      src="/images/restaurants/no-data.gif"
                      alt="no-data"
                      className="w-96"
                    />
                  </div>
                  <h4 className="font-bold text-4xl">
                    There aren't any <br />
                    {tab === "Restaurants"
                      ? "restaurants"
                      : tab === "Stores"
                      ? "stores"
                      : ""}{" "}
                    on Fomino <br /> near you yet 😕
                  </h4>
                  <p className="font-normal text-base font-sf">
                    {tab === "Restaurants" ? (
                      <>
                        It's not you, it's us! We're working hard to expand and
                        hope to come to <br /> your area soon 😌
                      </>
                    ) : tab === "Stores" ? (
                      <>
                        It's not you, it's us! We're working hard to expand our
                        service for <br /> groceries and other stores. We hope
                        to come to your area soon 😌
                      </>
                    ) : (
                      ""
                    )}
                  </p>
                </div>
              </section>
            ))}
        </section>
      }
      {!loading && !isFocused && sm && (
        <div className="fixed bottom-0 w-full bg-white shadow-smButtonShadow flex justify-around gap-x-4 items-center py-2 pt-3 z-50 rounded-t-2xl">
          <button
            onClick={() => {
              navigate(`/${countryCode}/${cityName}/restaurants`);
              setMobileTab("Restaurants");
            }}
            className={`w-20 sm:py-2.5 py-1.5 sm:px-5 px-3 text-sm text-black font-sf font-light flex flex-col justify-center items-center gap-y-1  ${
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
            Restaurants
          </button>

          <button
            onClick={() => {
              navigate(`/${countryCode}/${cityName}/stores`);
              setMobileTab("Stores");
            }}
            className={`w-20 sm:py-2.5 py-1.5 sm:px-5 px-3 text-black  text-sm font-sf font-light flex flex-col justify-center items-center gap-y-1 ${
              mobileTab === "Stores" ? "bg-white" : "text-opacity-40"
            }`}
          >
            <img
              src={`/images/restaurants/bag${
                mobileTab === "Stores" ? "" : "-gray"
              }.webp`}
              alt="fork"
              className="w-5"
            />
            Stores
          </button>

          <button
            onClick={() => {
              setMobileTab("profile");
              setProfileDrawer(true);
              closeModal();
            }}
            className={`w-20 sm:py-2.5 py-1.5 sm:px-5 px-3 text-black  text-sm font-sf font-light flex flex-col justify-center items-center gap-y-1 ${
              mobileTab === "propfile" ? "bg-white" : "text-opacity-40"
            }`}
          >
            <img
              src={`/images/restaurants/user.png`}
              alt="fork"
              className="w-5"
            />
            Profile
          </button>
        </div>
      )}

      {!loading && !isMap && (
        <section className="  w-[92%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%] mx-auto  my-10 custom-max-width ">
          <RestaurantMap />
        </section>
      )}

      {
        <Footer width="w-[92%] lg:w-[94%] largeDesktop:w-[95%] extraLargeDesktop:w-[83.34%] custom-max-width" />
      }
    </motion.div>
  );
}
