import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { LuClock3 } from "react-icons/lu";
import { BsEmojiSmileFill } from "react-icons/bs";
import { FaCircleExclamation } from "react-icons/fa6";
import { MdOutlineTableRestaurant } from "react-icons/md";
import {
  FaArrowLeft,
  FaChevronRight,
  FaRegSmile,
  FaUsers,
} from "react-icons/fa";
import { HiShare } from "react-icons/hi";
import { RiSubtractFill } from "react-icons/ri";
import { BiPlus } from "react-icons/bi";
import DetailsCard from "../../components/DetailsCard";
import GetAPI from "../../utilities/GetAPI";
import { BASE_URL } from "../../utilities/URL";
import Loader, { RotatingLoader } from "../../components/Loader";
import { IoMdHeartEmpty, IoMdTime, IoMdHeart } from "react-icons/io";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { MarkerF } from "@react-google-maps/api";
import { GoogleMap, useLoadScript, Polygon } from "@react-google-maps/api";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useMediaQuery,
  useDisclosure,
} from "@chakra-ui/react";

import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import { PostAPI } from "../../utilities/PostAPI";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoCheckmark, IoLocationOutline, IoSearch } from "react-icons/io5";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaArrowLeftLong } from "react-icons/fa6";
import { googleApiKey } from "../../utilities/URL";
import { dataContext } from "../../utilities/ContextApi";
import { CiCircleInfo } from "react-icons/ci";
import { useTranslation } from "react-i18next";
import { getRestaurantStatus } from "../../utilities/restuarantTimeMessage";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import CustomCheckbox from "../../components/CustomCheckbox";
import CustomRadioBtn from "../../components/CustomRadioBtn";

export default function GroupRestaurantDetails() {
  const { countryCode, cityName, slug, produtInfo } = useParams();
  const userId = parseInt(localStorage.getItem("userId"));
  const favRestData = GetAPI(`frontsite/userFavRestaurantIds/${userId}`);
  const productId = produtInfo?.split("-").pop();
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
    setSearchTerm,
    headerDrawer,
    setHeaderDrawer,
    setDeleteProductId,
    deleteProductId,
  } = useContext(dataContext);
  console.log("🚀 ~ GroupRestaurantDetails ~ gData:", gData);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const resId = localStorage.getItem("resId");
  console.log("🚀 ~ GroupRestaurantDetails ~ resId:", resId);
  const { data, setData, reFetch } = GetAPI(
    `users/restaurantbyid?restaurantId=${resId}${
      userId ? `&userId=${userId}` : ""
    }`
  );
  console.log("************* datas", data);
  function convertToDateString(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  }
  const isToday = (dateString) => {
    const today = dayjs().startOf("day");
    const inputDate = dayjs(dateString, "DD-MM-YYYY").startOf("day");
    return today.isSame(inputDate);
  };
  function convertTo24HourFormat(time) {
    let [hoursMinutes, modifier] = time.split(" ");
    let [hours, minutes] = hoursMinutes.split(":");
    hours = parseInt(hours, 10);
    if (modifier.toLowerCase() === "pm" && hours !== 12) {
      hours += 12;
    }
    if (modifier.toLowerCase() === "am" && hours === 12) {
      hours = 0;
    }
    hours = hours.toString().padStart(2, "0");
    minutes = minutes.padStart(2, "0");

    return `${hours}:${minutes}`;
  }
  const compareTime = (inputTime) => {
    const currentDate = dayjs();
    const formattedInputTime = `${dayjs().format("YYYY-MM-DD")} ${inputTime}`;
    const inputTimeToday = dayjs(formattedInputTime, "YYYY-MM-DD HH:mm");

    if (!inputTimeToday.isValid()) {
      return false;
    }

    if (inputTimeToday.isBefore(currentDate)) {
      return false;
    } else if (inputTimeToday.isAfter(currentDate)) {
      return true;
    } else {
      return true;
    }
  };

  const location = useLocation();
  const [md] = useMediaQuery("(min-width: 767.5px)");
  function extractIdFromUrl(url) {
    const match = url.pathname.match(/&id=(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }
  function extractmcIdFromUrl(url) {
    const match = url.pathname.match(/&mcId=(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }
  function extractResIdFromUrl(url) {
    const match = url.pathname.match(/&res=(\d+)/);
    if (match && match[1]) {
      gData?.orderId
        ? localStorage.setItem("resId", gData?.restaurant?.id)
        : localStorage.setItem("resId", match[1]);
      return match[1];
    }
    return null;
  }
  function generateTimeList(start, end) {
    const timeList = [];
    const startTime = new Date(`1/1/2022 ${start}`);
    const endTime = new Date(`1/1/2022 ${end}`);

    while (startTime <= endTime) {
      const formattedTime = startTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      timeList.push(formattedTime);
      startTime.setMinutes(startTime.getMinutes() + 30);
    }
    return timeList;
  }
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(`localhost:3000${text}`);
    success_toaster("Copied to Clipboard!");
  };

  const wishList = GetAPI("frontsite/getWishList");
  const deliveryTypes = GetAPI("frontsite/deliveryTypes");
  data.data && localStorage.setItem("activeResData", JSON.stringify(data.data));
  const activeResData = JSON.parse(localStorage.getItem("activeResData")) || [];
  const [addOnsData, setAddOnsData] = useState([]);
  const categoryRefs = useRef([]);
  const [center, setCenter] = useState({ lat: 31.5204, lng: 74.3587 });
  const [coordinates, setCoordinates] = useState([]);
  const [polygonPaths, setPolygonPaths] = useState([]);
  const [translation, setTranslation] = useState({
    eng: {},
    de: {},
    load: false,
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteProduct, setIsFavoriteProduct] = useState(false);
  const [scheduleOrderModal, setScheduleOrderModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [addDiffProductOpMessage, setAddDiffProductOpMessage] = useState("");

  const handleAddOns = (
    total,
    quantity,
    collectionId,
    addOnId,
    name,
    key,
    checked
  ) => {
    const existingIndex = addOnsData.findIndex(
      (ele) => ele?.collectionId === collectionId && ele?.addOnId === addOnId
    );

    if (key === "single") {
      const curr = {
        total: total,
        quantity: quantity,
        collectionId: collectionId,
        addOnId: addOnId,
        name: name,
      };
      if (existingIndex === -1) {
        setAddOnsData((data) => [...data, curr]);
      } else {
        const updatedData = [...addOnsData];
        updatedData.splice(existingIndex, 1, curr);
        setAddOnsData(updatedData);
      }
    } else if (key === "multiple") {
      if (checked) {
        if (existingIndex !== -1) {
          const updatedData = [...addOnsData];
          updatedData[existingIndex].quantity += quantity;
          setAddOnsData(updatedData);
        } else {
          setAddOnsData((data) => [
            ...data,
            {
              total: total,
              quantity: quantity,
              collectionId: collectionId,
              addOnId: addOnId,
              name: name,
            },
          ]);
        }
      } else {
        if (existingIndex !== -1) {
          const updatedData = [...addOnsData];
          updatedData.splice(existingIndex, 1);
          setAddOnsData(updatedData);
        }
      }
    }

    if (quantity < 0 && existingIndex !== -1) {
      const updatedData = [...addOnsData];
      const currentQuantity = updatedData[existingIndex].quantity;
      if (currentQuantity + quantity > 0) {
        setAddOnsData(updatedData);
      } else {
        updatedData.splice(existingIndex, 1);
        setAddOnsData(updatedData);
      }
    }
  };

  const [modal, setModal] = useState(false);
  const [productInfo, setProductInfo] = useState(false);

  const closeModal = () => {
    setModal(false);
    setModalScroll(0);
    setAddOnsData([]);
    navigate(
      `/${countryCode ? countryCode : "pk"}/group-order/${
        JSON.parse(localStorage.getItem("groupData"))?.orderId
      }/venue`
    );
    setProductInfo(false);
    setAddDiffProductOpMessage("");
  };
  const [disabled, setDisabled] = useState(false);
  const [tableModal, setTableModal] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [modType, setModType] = useState({
    mod: "",
    language: "en",
  });
  const [modalScroll, setModalScroll] = useState(0);
  const [modalData, setModalData] = useState({
    quantity: 0,
    r_pId: "",
    img: "",
    title: "",
    desc: "",
    originalPrice: "",
    discountPrice: "",
    currencyUnit: "",
    addOns: [],
    addOnsCat: [],
    nutrients: "",
    allergies: "",
    ingredients: "",
    stock: 0,
    isUnlimited: false,
  });
  const [tableOrder, setTableOrder] = useState({
    noOfMembers: "",
    date: "",
    hour: "",
    minute: "",
    ampm: "AM",
    restaurantId: "",
    message: "",
  });
  const [activeCategory, setActiveCategory] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const navRefs = useRef([]);
  const navContainerRef = useRef(null);
  const manualScrollRef = useRef(false);
  const [showButtons, setShowButtons] = useState(false);

  const scrollToCategory = (categoryName) => {
    setActiveCategory(categoryName);
    const element = document.getElementById(`menu-${categoryName}`);

    if (element) {
      const navbarHeight = 200;
      const scrollPosition =
        element.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  //handle translation here
  const handleTranslate = async (lang) => {
    setModType({ ...modType, language: lang });
    if (translation[lang]?.menuCategories) {
      setData((prevData) => ({
        ...prevData,
        data: {
          ...prevData.data,
          menuCategories: translation[lang].menuCategories,
        },
      }));
    } else {
      setTranslation({ ...translation, load: true });
      let res = await PostAPI("users/translateMenu", {
        restaurantId: Number(resId),
        language: lang,
        menuCategories: data?.data?.menuCategories,
      });

      if (res?.data?.status === "1") {
        setInfoModal(false);
        setTranslation((prevTranslation) => ({
          ...prevTranslation,
          [lang]: { menuCategories: res?.data?.data?.menuCategories },
          load: false,
        }));

        setData((prevData) => ({
          ...prevData,
          data: {
            ...prevData.data,
            menuCategories: res?.data?.data?.menuCategories,
          },
        }));
      }
    }
  };

  const [diffProduct, setDiffProduct] = useState(false);
  const handleAddProductWithDiffOption = () => {
    setDiffProduct(true);
    let count = parseInt(localStorage.getItem("addCounter")) || 0;
    count = String(count)?.split("-")[0];

    !menuCategories?.length > 0 &&
      localStorage.setItem(
        "menuCategories",
        JSON.stringify(data?.data?.menuCategories)
      );

    count++;
    count++;

    localStorage.setItem("addCounter", `${count}-${resId}`);

    setModal(false);

    const selectedProduct = JSON.parse(localStorage.getItem("product"));

    const RPLinkId = String(selectedProduct?.RPLinkId);

    // Check if RPLinkId already contains a floating point
    let r_pId;
    if (RPLinkId.includes(".")) {
      r_pId = RPLinkId.split(".")[0] + `.${count}`;
    } else {
      r_pId = `${RPLinkId}.${count}`;
    }

    const updatedData = [];

    // Iterate over the addOns array
    modalData?.addOns?.forEach((item) => {
      for (let a of item?.addons) {
        updatedData.push({
          total: a.price,
          quantity: 1,
          collectionId: a.collectionId,
          addOnId: a.id,
          name: a.name,
        });
        break;
      }
    });

    setAddOnsData(updatedData);
    // Use a timeout to reopen the modal after a slight delay
    setTimeout(() => {
      setModalData((prevData) => ({
        ...prevData,
        r_pId: Number(r_pId),
        title: selectedProduct.name,
        r_mcId: selectedProduct.r_mcId,
        quantity: 1,
      }));
      setModal(true); // Reopen the modal
      setAddDiffProductOpMessage("");

      const modal = document.querySelector(".custom-scrollbar");
      if (modal) {
        modal.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }, 300);
  };

  //Handle translation End here

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!manualScrollRef.current) {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const categoryName = entry.target
                .getAttribute("id")
                .replace("menu-", "");
              setActiveCategory(categoryName);

              // Scroll the category list to center the active category
              const index = data?.data?.menuCategories?.findIndex(
                (cat) => cat.name === categoryName
              );

              if (navRefs.current[index] && navContainerRef.current) {
                const navItem = navRefs.current[index];
                const container = navContainerRef.current;
                const navItemLeft = navItem.offsetLeft;
                const navItemWidth = navItem.offsetWidth;
                const containerVisibleWidth = container.offsetWidth;
                const scrollTo =
                  navItemLeft - containerVisibleWidth / 2 + navItemWidth / 2;

                container.scrollTo({
                  left: scrollTo,
                  behavior: "smooth",
                });
              }
            }
          });
        }
      },
      {
        threshold: 0, // Detect when any part of the section intersects
        rootMargin: "-40% 0px 0px 0px", // Trigger when 40% of the section has scrolled into view
      }
    );

    const currentCategoryRefs = categoryRefs.current;
    currentCategoryRefs.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      currentCategoryRefs.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, [data]);
  const [modalHeight, setModalHeight] = useState(0);
  useEffect(() => {
    const updateModalHeight = () => {
      let newHeight = window.innerHeight;

      if (modalData?.addOns?.length > 0) {
        newHeight =
          window.innerHeight -
          window.innerHeight * 0 -
          window.innerHeight * 0.05;
      } else {
        newHeight =
          window.innerHeight -
          window.innerHeight * 0.01 -
          window.innerHeight * 0.1;
      }

      setModalHeight(newHeight);
    };
    updateModalHeight();
    window.addEventListener("resize", updateModalHeight);

    return () => {
      window.removeEventListener("resize", updateModalHeight);
    };
  }, [modalData]);
  const scrollAmount = 150;
  const scrollRight = () => {
    if (navContainerRef.current) {
      navContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (navContainerRef.current) {
      navContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (navContainerRef.current) {
        const containerWidth = navContainerRef.current.clientWidth;
        const totalWidth = Array.from(navRefs.current).reduce(
          (total, navItem) => {
            return total + (navItem ? navItem.clientWidth : 0);
          },
          0
        );
        setShowButtons(totalWidth > containerWidth);
      }
    };

    checkOverflow(); // Initial check
    window.addEventListener("resize", checkOverflow); // Check on resize

    return () => {
      window.removeEventListener("resize", checkOverflow); // Cleanup
    };
  }, [data]);

  const [searchQuery, setSearchQuery] = useState("");
  const getSearchedResults = () => {
    let filteredResults = [];
    if (data?.data?.menuCategories?.length > 0) {
      data.data.menuCategories.forEach((category) => {
        if (category.products?.length > 0) {
          const categoryFilteredProducts = category?.products?.filter(
            (item) =>
              item?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
              item?.description
                ?.toLowerCase()
                ?.includes(searchQuery?.toLowerCase())
          );
          if (categoryFilteredProducts?.length > 0) {
            filteredResults.push({
              name: category.name,
              iconImage: category.iconImage,
              r_mcId: category.r_mcId,
              products: categoryFilteredProducts,
            });
          }
        }
      });
    }
    return filteredResults;
  };
  const handleTableBooking = async (e) => {
    e.preventDefault();
    if (tableOrder.date === "") {
      info_toaster("Please select date");
    } else if (tableOrder.noOfMembers === "") {
      info_toaster("Please select no of persons");
    } else if (tableOrder.hour === "" || tableOrder.minute === "") {
      info_toaster("Please select time");
    } else if (
      isToday(convertToDateString(tableOrder.date)) &&
      compareTime(
        convertTo24HourFormat(
          `${tableOrder.hour}:${tableOrder.minute} ${tableOrder.ampm}`
        )
      ) === false
    ) {
      info_toaster("Given time is behind the current time");
    } else {
      setDisabled(true);
      let res = await PostAPI("users/bookTableBooking", {
        noOfMembers: tableOrder.noOfMembers,
        date: convertToDateString(tableOrder.date),
        time: convertTo24HourFormat(
          `${tableOrder.hour}:${tableOrder.minute} ${tableOrder.ampm}`
        ),
        restaurantId: parseInt(localStorage.getItem("resId")),
        message: tableOrder.message,
      });
      if (res?.data?.status === "1") {
        success_toaster(res?.data?.message);
        setDisabled(false);
        setTableModal(false);
        setTableOrder({
          noOfMembers: "",
          date: "",
          hour: "",
          minute: "",
          ampm: "AM",
          restaurantId: "",
          message: "",
        });
      } else {
        error_toaster(res?.data?.message);
        setDisabled(false);
      }
    }
  };
  const cartData = JSON.parse(localStorage.getItem("cartItem")) || {};
  const existingCartItems = cartData[`id_${resId}`] || [];
  const totalPrice = existingCartItems
    .reduce((accumulator, currentItem) => {
      const itemQuantity = currentItem.quantity;
      const itemUnitPrice = parseFloat(currentItem.unitPrice) || 0;
      const addonsTotal =
        currentItem?.addOns?.reduce((addonAccumulator, addon) => {
          return (
            addonAccumulator + (addon?.total || 0) * (addon?.quantity || 1)
          );
        }, 0) || 0;
      const itemTotalPrice = itemQuantity * (itemUnitPrice + addonsTotal);

      return accumulator + itemTotalPrice;
    }, 0)
    .toFixed(2);

  const handleClick = (
    quantity,
    RPLinkId,
    image,
    name,
    unitPrice,
    currencySign,
    description,
    addOns,
    addOnsCat,
    isUnlimited,
    resId,
    bannerType
  ) => {
    const cartItem = JSON.parse(localStorage.getItem("cartItem")) || {};

    // Use a key per restaurant, e.g. "id_48"
    const resKey = `id_${resId}`;
    const restaurantCart = cartItem[resKey] || [];

    const newCartItem = {
      quantity,
      unitPrice,
      RPLinkId,
      name,
      image,
      currencySign,
      description,
      addOns,
      addOnsCat,
      isUnlimited,
      resId,
      bannerType,
    };

    if (Object.keys(cartItem).length === 0 && data?.data?.cutlery_status) {
      localStorage.setItem(
        "cutleryList",
        JSON.stringify(data.data.cutlery_list)
      );
    }

    const existingItemIndex = restaurantCart.findIndex(
      (item) => item.RPLinkId === RPLinkId
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      restaurantCart[existingItemIndex] = {
        ...restaurantCart[existingItemIndex],
        quantity,
        addOns,
        addOnsCat,
      };
    } else {
      restaurantCart.push(newCartItem);
      if (String(newCartItem?.RPLinkId)?.includes(".")) {
        let product = JSON.parse(localStorage.getItem("product"));
        let upCartItem = {
          ...newCartItem,
          r_mcId: product?.r_mcId,
        };

        let matchingCategories = menuCategories?.filter(
          (item) => item?.r_mcId == product?.r_mcId
        );

        if (matchingCategories?.length) {
          addIt(product?.r_mcId, newCartItem);
        }
      }
    }

    // Save updated restaurant cart back into cartItems object
    cartItem[resKey] = restaurantCart;
    localStorage.setItem("cartItem", JSON.stringify(cartItem));

    setModal(false);
    setModalData({
      quantity: 0,
      r_pId: "",
      img: "",
      title: "",
      desc: "",
      originalPrice: "",
      discountPrice: "",
      currencyUnit: "",
      addOns: [],
      addOnsCat: [],
      nutrients: "",
      allergies: "",
      ingredients: "",
      nutritionalInfo: "",
      stock: 0,
    });
    setAddOnsData([]);
    navigate(`${location.pathname}${location.search}`);
  };

  const addToWishlistFunc = async (RPLinkId) => {
    let res = await PostAPI("frontsite/addToWishList", {
      RPLinkId: RPLinkId,
      userId: parseInt(localStorage.getItem("userId")),
    });
    if (res?.data?.status === "1") {
      success_toaster(res?.data?.message);
      wishList.reFetch();
    } else error_toaster(res?.data?.message);
  };
  let menuCategories = JSON.parse(localStorage.getItem("menuCategories")) || [];
  useEffect(() => {
    if (productId && data && data.data) {
      const id = productId.split("-").pop();
      const menuCategories = data?.data?.menuCategories || [];
      let foundProduct = null;
      for (let category of menuCategories) {
        const product = category.products.find(
          (p) => p.RPLinkId === parseInt(id)
        );
        if (product) {
          foundProduct = product;
          break;
        }
      }

      if (foundProduct) {
        setModalData({
          quantity: 1,
          r_pId: foundProduct?.RPLinkId,
          img: foundProduct?.image,
          title: foundProduct?.name,
          desc: foundProduct?.description,
          originalPrice: parseFloat(foundProduct?.originalPrice),
          discountPrice: parseFloat(foundProduct?.discountPrice),
          addOns: foundProduct?.addOnArr,
          addOnsCat: [],
          currencySign: foundProduct?.currencySign,
          nutrients: foundProduct?.nutrients,
          allergies: foundProduct?.allergies,
          ingredients: foundProduct?.ingredients,
          stock: foundProduct?.stock,
          isUnlimited: foundProduct?.isUnlimited,
        });
        foundProduct?.addOnArr
          ?.filter((add) => add?.category?.minAllowed === 1)
          ?.forEach((category) => {
            const firstAddon = category.addons[0];
            if (firstAddon) {
              handleAddOns(
                firstAddon.price,
                1,
                firstAddon.collectionId,
                firstAddon.id,
                firstAddon.name,
                "single",
                false
              );
              setModalData((prevModelData) => ({
                ...prevModelData,
                addOnsCat: [
                  ...prevModelData.addOnsCat,
                  foundProduct?.addOnArr?.find(
                    (add) => add?.category?.id === firstAddon?.collectionId
                  )?.category,
                ],
              }));
            }
          });
        setModal(true);
      }
    }
  }, [productId, data]);

  const productDetails = (rpId, name, r_mcId, material) => {
    const menuCat = material?.data?.menuCategories?.find(
      (menu) => menu?.r_mcId === parseInt(r_mcId)
    );
    const prod = menuCat?.products?.find(
      (prod) => prod?.RPLinkId === parseInt(rpId)
    );

    if (prod) {
      setModal(true);
      const formattedName = name.toLowerCase().replace(/\s+/g, "-");
      navigate(
        `/${countryCode}/group-order/${
          JSON.parse(localStorage.getItem("groupData"))?.orderId
        }/venue/${formattedName}-${rpId}`
      );
    }
  };

  const handleModalScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    setModalScroll(scrollTop);
    setHeaderShadow(scrollTop > 100);
  };

  const autocompleteRef = useRef(null);
  const [addShadow, setAddShadow] = useState(false);
  const [headerShadow, setHeaderShadow] = useState(false);
  useEffect(() => {
    if (productId > 0) {
      setModal(true);
    }

    const handleScroll = () => {
      const menuElements = document.querySelectorAll(".section");
      const navbarHeight = 180;
      let currentMenuId = null;
      menuElements.forEach((menu) => {
        const menuTop = menu.offsetTop;
        const menuHeight = menu.clientHeight;
        if (
          window.scrollY + navbarHeight >= menuTop &&
          window.scrollY < menuTop + menuHeight
        ) {
          currentMenuId = menu.id;
        }
      });
      setActiveMenu(currentMenuId);
      if (window.scrollY > 400) {
        setAddShadow(true);
      } else {
        setAddShadow(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  const getSelectionMessage = (category, totalSelected) => {
    const { minAllowed, maxAllowed, required, isSingleSelect } = category;

    // Single selection case
    if (isSingleSelect) {
      return "Choose one option. Only one item can be selected.";
    }

    // Optional add-ons with no minimum required
    if (minAllowed === 0 && maxAllowed > 1 && !required) {
      if (totalSelected === 0) {
        return `Choose up to ${maxAllowed} additional items.`;
      } else if (totalSelected < maxAllowed) {
        return `Choose up to ${maxAllowed - totalSelected} additional items.`;
      } else {
        return `Maximum of ${maxAllowed} items reached.`;
      }
    }

    // Exactly required case (minAllowed equals maxAllowed)
    if (minAllowed === maxAllowed) {
      if (totalSelected === 0) {
        return `Choose at least ${minAllowed} and at most ${maxAllowed} items.`;
      } else if (totalSelected < minAllowed) {
        return `Please select ${minAllowed - totalSelected} more items.`;
      } else if (totalSelected < maxAllowed) {
        return `Choose up to ${maxAllowed - totalSelected} more items.`;
      } else {
        return `Maximum of ${maxAllowed} items reached.`;
      }
    }

    // Minimum required, but more allowed up to maxAllowed
    if (minAllowed < maxAllowed) {
      if (totalSelected < minAllowed) {
        return `Please select at least ${minAllowed} items.`;
      } else if (totalSelected < maxAllowed) {
        return `You can select up to ${maxAllowed - totalSelected} more items.`;
      } else {
        return `Maximum of ${maxAllowed} items reached.`;
      }
    }

    // General case for optional add-ons
    if (minAllowed === 0 && maxAllowed > 0) {
      if (totalSelected < maxAllowed) {
        return `Choose up to ${maxAllowed - totalSelected} more items.`;
      } else {
        return `Maximum of ${maxAllowed} items reached.`;
      }
    }

    return "";
  };

  const containerStyle = {
    width: "100%",
    height: "280px",
    marginBottom: "12px",
  };
  const [isFullImageOpen, setIsFullImageOpen] = useState(false);
  const [updateCartModal, setUpdateCartModal] = useState(false);
  const [drawerCart, setDrawerCart] = useState(false);

  const handleOpenFullImage = () => {
    setIsFullImageOpen(true);
  };

  const handleCloseFullImage = () => {
    setIsFullImageOpen(false);
  };

  const handleCloseUpdateCartModal = () => {
    setUpdateCartModal(false);
    setDrawerCart(true);
  };

  const clearCart = () => {
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cutleryList");
  };
  const handleUpdateCart = () => {
    clearCart();
    setUpdateCartModal(false);
    navigate(`${location.pathname}${location.search}`);
  };
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleApiKey,
    libraries: ["places", "drawing"],
  });
  useEffect(() => {
    if (data?.data?.coordinates?.coordinates?.length) {
      const initialCoordinates = data?.data?.coordinates?.coordinates[0].map(
        ([lat, lng]) => ({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        })
      );
      setPolygonPaths(initialCoordinates);
      if (initialCoordinates.length > 0) {
        setCenter(initialCoordinates[0]);
      }
    }
  }, [data]);

  const initializeMap = useCallback(
    (map) => {
      if (!map) return;

      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingControl: false,
      });

      drawingManager.setMap(map);

      if (polygonPaths.length > 0) {
        const editablePolygon = new window.google.maps.Polygon({
          paths: polygonPaths,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
          editable: false,
          draggable: false,
          clickable: false,
        });
        editablePolygon.setMap(map);
      }
    },
    [polygonPaths]
  );

  useEffect(() => {
    const gettingGroupDetails = async () => {
      // if (location.state.g) {
      let res = await PostAPI("users/groupOrderDetails", {
        orderId:
          JSON.parse(localStorage.getItem("groupData"))?.orderId ||
          localStorage.getItem("orderId"),
      });
      if (res?.data?.status === "1") {
        setGData(res?.data?.data);
      }
      // }
    };
    gettingGroupDetails();

    let groupExists = localStorage.getItem("groupData");
    if (!groupExists) {
      const name = activeResData?.name || "";
      const rpId = activeResData?.RPLinkId || "";
      const lat = activeResData?.lat;
      const lng = activeResData?.lng;

      const formattedName = name.toLowerCase().replace(/\s+/g, "-");
      navigate(
        `/${countryCode}/lat=${lat}&lng=${lng}/restaurants/${formattedName}-res-${resId}`,
        { replace: true }
      );
      //   navigate(
      //     `${countryCode}/${cityName}/${
      //       activeResData?.businessType == 1 ? "res" : "store"
      //     }/${slug}`
      //   );
    }
  }, [groupDrawer]);

  const toggleFavorite = async () => {
    const currentFavoriteState = isFavorite;
    try {
      let res;
      if (currentFavoriteState) {
        res = await PostAPI("frontsite/removeFromFav", {
          restaurantId: Number(resId),
          userId: parseInt(localStorage.getItem("userId")),
        });
        if (res?.data?.status === "1") {
          success_toaster(res?.data?.message);
          favRestData.reFetch();
        } else {
          error_toaster(res?.data?.message);
        }
      } else {
        res = await PostAPI("frontsite/addToFav", {
          restaurantId: Number(resId),
          userId: parseInt(localStorage.getItem("userId")),
        });
        if (res?.data?.status === "1") {
          success_toaster(res?.data?.message);
          favRestData.reFetch();
        } else {
          error_toaster(res?.data?.message);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      error_toaster("Something went wrong!");
    }
  };

  useEffect(() => {
    if (favRestData && favRestData.data && favRestData.data.data) {
      const favoriteIds = favRestData.data.data.ids || [];
      const favoritePrId = favRestData.data.data.wishListIds || [];
      setIsFavorite(favoriteIds.includes(Number(resId)));
    }
  }, [resId, userId, favRestData]);

  const toggleFavoriteProduct = async (rpId) => {
    const currentFavoriteState = isFavoriteProduct;
    try {
      let res;
      if (currentFavoriteState) {
        res = await PostAPI("frontsite/removeFromWishList", {
          id: rpId,
        });
        if (res?.data?.status === "1") {
          success_toaster(res?.data?.message);
          setIsFavoriteProduct(false);
          favRestData.reFetch();
        } else {
          error_toaster(res?.data?.message);
        }
      } else {
        let res = await PostAPI("frontsite/addToWishList", {
          RPLinkId: rpId,
          userId: parseInt(localStorage.getItem("userId")),
        });
        if (res?.data?.status === "1") {
          success_toaster(res?.data?.message);
          setIsFavoriteProduct(true);
          favRestData.reFetch();
        } else {
          error_toaster(res?.data?.message);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      error_toaster("Something went wrong!");
    }
  };

  const [message, setMessage] = useState("");
  const [configurationMessage, setConfigurationMessage] = useState("");
  const restaurant = data?.data;

  useEffect(() => {
    if (!restaurant) return;

    const { message: newMessage, configurationMessage: newConfigMessage } =
      getRestaurantStatus(restaurant);

    setMessage(newMessage);
    setConfigurationMessage(newConfigMessage);
  }, [restaurant]);

  const addIt = (id, product) => {
    const updatedMenuCategories = menuCategories?.map((category) => {
      if (category?.r_mcId === id) {
        const productIndex = category?.products?.findIndex(
          (prod) =>
            prod?.RPLinkId +
              "." +
              String(localStorage.getItem("addCounter")).split("-")[0] ==
            product?.RPLinkId
        );

        if (productIndex !== -1) {
          const duplicatedProduct = { ...category.products[productIndex] };
          duplicatedProduct.RPLinkId = parseFloat(
            duplicatedProduct.RPLinkId +
              "." +
              String(localStorage.getItem("addCounter")).split("-")[0]
          );

          category.products.splice(productIndex + 1, 0, duplicatedProduct);
        }

        // Remove duplicates based on RPLinkId
        category.products = category.products.filter(
          (prod, index, self) =>
            index === self.findIndex((p) => p.RPLinkId === prod.RPLinkId)
        );

        return category;
      }
      return category;
    });
    localStorage.setItem(
      "menuCategories",
      JSON.stringify(updatedMenuCategories)
    );
    // Update state with unique menu categories
    setData((prevData) => ({
      ...prevData,
      data: {
        ...prevData.data,
        menuCategories: updatedMenuCategories,
      },
    }));
  };

  const deleteDiffOptionProduct = (RPLinkId) => {
    if (!RPLinkId) return false;
    if (String(RPLinkId).includes(".")) {
      const updatedMenuCategories = menuCategories?.map((category) => {
        // Check if the category has products
        if (category?.products) {
          // Filter out the product with the matching RPLinkId
          category.products = category.products.filter(
            (product) => product?.RPLinkId !== RPLinkId
          );
        }
        return category;
      });

      localStorage.setItem(
        "menuCategories",
        JSON.stringify(updatedMenuCategories)
      );
      setData((prevData) => ({
        ...prevData,
        data: {
          ...prevData.data,
          menuCategories: updatedMenuCategories,
        },
      }));
      setDeleteProductId("");
    }
  };

  useEffect(() => {
    deleteDiffOptionProduct(deleteProductId);
    if (existingCartItems.length < 1) {
      localStorage.removeItem("addCounter");
      localStorage.removeItem("menuCategories");
    }
  }, [deleteProductId, existingCartItems]);

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <>
      <Modal
        onClose={closeModal}
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
          className="modal-content-custom"
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
            {productInfo ? (
              <div>
                <motion.div
                  className="text-base text-center capitalize my-5 font-sf font-semibold text-theme-black-2"
                  initial={{ opacity: 1, y: "-1rem" }} // Start from above and invisible
                  animate={{
                    opacity: modalScroll > 10 ? 1 : 0, // Fade out on scroll down, fade in on scroll up
                    y: modalScroll > 10 ? 0 : "-1rem", // Move up on scroll down, move to center on scroll up
                  }}
                  transition={{
                    duration: 0.2,
                    delay: 0.1,
                  }}
                >
                  Product Info
                </motion.div>
              </div>
            ) : (
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
                {modalData.title}
              </motion.div>
            )}
          </ModalHeader>

          <div
            onClick={closeModal}
            className="absolute z-20 top-5 right-4 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
          >
            <IoClose size={30} />
          </div>
          <ModalBody p={0} borderRadius="20px">
            {productInfo ? (
              <div
                onScroll={handleModalScroll}
                className="md:h-screen-minus-5vh ultraLargeDesktop:h-screen-minus-40vh h-screen-minus-18vh  overflow-auto font-sf space-y-5 px-4 pt-10"
                style={md ? { maxHeight: modalHeight, height: "auto" } : {}}
              >
                <div className="flex items-center   ">
                  <button
                    onClick={() => setProductInfo(false)}
                    className="absolute top-4 left-4 bg-theme-gray-4 w-10 h-10 rounded-full flex justify-center items-center z-10"
                  >
                    <FaArrowLeftLong size={20} />
                  </button>
                </div>
                <div className=" pt-4">
                  <h6 className="font-bold text-xl capitalize mt-3 font-omnes">
                    {modalData.title}
                  </h6>
                  <p className="font-normal text-base text-black text-opacity-60">
                    {modalData.desc}
                  </p>
                </div>
                {modalData.ingredients && (
                  <div>
                    <h6 className="font-bold text-xl capitalize mt-3 font-omnes">
                      Ingredients
                    </h6>
                    <p className="font-normal text-base text-black text-opacity-60">
                      {modalData.ingredients}
                    </p>
                  </div>
                )}
                {modalData.nutrients && (
                  <div>
                    <h6 className="font-bold text-xl capitalize mt-3 font-omnes">
                      Nutrients
                    </h6>
                    <p className="font-normal text-base text-black text-opacity-60">
                      {modalData.nutrients}
                    </p>
                  </div>
                )}
                {modalData.allergies && (
                  <div>
                    <h6 className="font-bold text-xl capitalize mt-3 font-omnes">
                      Allergies
                    </h6>
                    <p className="font-normal text-base text-black text-opacity-60">
                      {modalData.allergies}
                    </p>
                  </div>
                )}
                {modalData?.nutritionalInfo && (
                  <div>
                    <h6 className="font-bold text-xl capitalize mt-3 font-omnes">
                      Nutrition facts
                    </h6>
                    <div className="border-t-4 border-b-4 border-theme-black-2 mt-2">
                      <div className="flex flex-wrap justify-between items-center [&>div]:border-b [&>div]:items-center [&>div]:py-1 [&>div]:text-[#202125A3]">
                        <div className="flex justify-between w-full">
                          <p>Energy</p>{" "}
                          {getNutrientValue(modalData?.nutritionalInfo?.energy)}
                        </div>

                        <div className="flex justify-between w-full">
                          <p>Carbohydrates</p>{" "}
                          {getNutrientValue(
                            modalData?.nutritionalInfo?.carbohydrates
                          )}
                        </div>

                        <div className="flex justify-between w-full">
                          <p>Fat</p>{" "}
                          {getNutrientValue(modalData?.nutritionalInfo?.fat)}
                        </div>

                        <div className="flex justify-between w-full">
                          <p>Protein</p>{" "}
                          {getNutrientValue(
                            modalData?.nutritionalInfo?.protein
                          )}
                        </div>

                        <div className="flex justify-between w-full">
                          <p>Salt</p>{" "}
                          {getNutrientValue(modalData?.nutritionalInfo?.salt)}
                        </div>

                        <div className="flex justify-between w-full">
                          <p>Saturated Fat</p>{" "}
                          {getNutrientValue(
                            modalData?.nutritionalInfo?.saturated_fat
                          )}
                        </div>

                        <div className="flex justify-between w-full">
                          <p>Sugar</p>{" "}
                          {getNutrientValue(modalData?.nutritionalInfo?.sugar)}
                        </div>

                        <div className="flex justify-between w-full">
                          <p>Fiber</p>{" "}
                          {modalData?.nutritionalInfo?.fiber || "Not Available"}
                        </div>

                        <div className="flex justify-between w-full">
                          <p>New Product</p>{" "}
                          {modalData?.nutritionalInfo?.isNew ? "Yes" : "No"}
                        </div>

                        <div className="flex justify-between w-full">
                          <p>Recommended</p>{" "}
                          {modalData?.nutritionalInfo?.isRecommended
                            ? "Yes"
                            : "No"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onScroll={handleModalScroll}
                className={`${
                  modalData?.addOns?.length > 0
                    ? "md:h-screen-minus-5vh ultraLargeDesktop:h-screen-minus-40vh h-screen-minus-9vh"
                    : "md:h-screen-minus-5vh desktop:max-h-screen-minus-5vh desktop:h-auto ultraLargeDesktop:h-auto h-screen-minus-9vh"
                } overflow-auto font-sf custom-scrollbar`}
                style={md ? { maxHeight: modalHeight, height: "auto" } : {}}
              >
                <div className="mb-3 h-[292px]">
                  <img
                    src={`${BASE_URL}${modalData.img}`}
                    alt="add-to-cart"
                    className="w-full h-full mx-auto object-cover rounded-t-md  cursor-zoom-in"
                    onClick={handleOpenFullImage}
                  />
                </div>

                <div className="flex justify-between items-center px-4">
                  <h4 className="!text-[32px]  text-theme-black-2 font-omnes font-bold capitalize  leading-10">
                    {modalData.title}
                  </h4>

                  <div className="flex items-center gap-4">
                    <div onClick={() => toggleFavoriteProduct(modalData.r_pId)}>
                      {userId ? (
                        isFavoriteProduct ? (
                          <IoMdHeart className="relative w-7 h-7 z-10 text-red-500 hover:cursor-pointer" />
                        ) : (
                          <IoMdHeartEmpty className="relative w-7 h-7 z-10 hover:cursor-pointer text-[#838383]" />
                        )
                      ) : null}
                    </div>
                    <button onClick={() => copyToClipboard(location.pathname)}>
                      <HiShare className="text-[#838383] text-2xl cursor-pointer" />
                    </button>
                  </div>
                </div>
                <div className=" mt-4">
                  <div className="px-4">
                    <div className="flex items-center gap-x-2">
                      <h3 className="text-base font-sf text-theme-green-3 font-medium ">
                        {modalData.discountPrice}
                        {data?.data?.currencyUnit}
                      </h3>
                      <h5 className="font-sf text-greenColor font-medium line-through">
                        {modalData.originalPrice}
                        {data?.data?.currencyUnit}
                      </h5>
                    </div>

                    <p className="capitalize text-sm font-sf text-theme-black-2  font-normal mt-7">
                      {modalData.desc}
                    </p>
                  </div>

                  {addDiffProductOpMessage && modalData?.addOns?.length > 0 && (
                    <div className="bg-red-100 p-4 rounded-lg text-theme-black-2 m-4 !mt-8">
                      <p className="text-sm text-theme-black-2">
                        You're currently editing your existing selection.
                      </p>
                      <h4
                        onClick={handleAddProductWithDiffOption}
                        className="text-red-600 font-semibold text-sm text-right mt-2 cursor-pointer"
                      >
                        {addDiffProductOpMessage}
                      </h4>
                    </div>
                  )}

                  {modalData?.addOns && modalData?.addOns?.length > 0 && (
                    <hr className="mt-4 -mb-3" />
                  )}
                  <div className="space-y-3 px-4">
                    {modalData?.addOns &&
                      modalData?.addOns?.map((add, index) =>
                        add?.addons?.length > 0 ? (
                          <div key={index}>
                            <h5 className="font-bold text-base text-theme-black-2 mt-7">
                              {add?.category?.name}
                            </h5>

                            <p
                              className={`font-normal text-sm ${
                                getSelectionMessage(
                                  add?.category,
                                  addOnsData?.reduce((accumulator, ele) => {
                                    return ele?.collectionId ===
                                      add?.addons[0]?.collectionId
                                      ? accumulator + ele?.quantity
                                      : accumulator;
                                  }, 0)
                                ).includes("at least")
                                  ? "text-red-500"
                                  : "text-theme-black-2"
                              }  mb-4`}
                            >
                              {getSelectionMessage(
                                add?.category,
                                addOnsData?.reduce((accumulator, ele) => {
                                  return ele?.collectionId ===
                                    add?.addons[0]?.collectionId
                                    ? accumulator + ele?.quantity
                                    : accumulator;
                                }, 0)
                              )}
                            </p>

                            {add?.addons?.map((addOn, key) => {
                              const isSelected = addOnsData?.find(
                                (fin) =>
                                  fin?.name === addOn?.name &&
                                  fin?.collectionId === addOn?.collectionId
                              );

                              const totalSelected = addOnsData?.reduce(
                                (accumulator, ele) => {
                                  return ele?.collectionId ===
                                    addOn?.collectionId
                                    ? accumulator + ele?.quantity
                                    : accumulator;
                                },
                                0
                              );

                              const selectedQuantity =
                                addOnsData?.find(
                                  (fin) =>
                                    fin?.name === addOn?.name &&
                                    fin?.collectionId === addOn?.collectionId
                                )?.quantity || 0;

                              const isIncrementDisabled =
                                selectedQuantity >= addOn?.maxAllowed ||
                                totalSelected >= add?.category?.maxAllowed;

                              const isDisabled =
                                totalSelected >= add?.category?.maxAllowed &&
                                !isSelected;
                              const inputId = `${addOn?.name}${key}${index}`;

                              return (
                                <label
                                  htmlFor={inputId}
                                  key={key}
                                  className="flex justify-between gap-x-2 my-2 text-theme-black-2 min-h-8 "
                                >
                                  <div className="flex  gap-x-1">
                                    {add?.category?.maxAllowed === 1 ? (
                                      <CustomRadioBtn
                                        name={`addons${index}`}
                                        id={inputId}
                                        onChange={() => {
                                          handleAddOns(
                                            addOn?.price,
                                            1,
                                            addOn?.collectionId,
                                            addOn?.id,
                                            addOn?.name,
                                            "single",
                                            false
                                          );
                                          if (
                                            modalData?.addOnsCat?.findIndex(
                                              (ele) =>
                                                ele?.id === addOn?.collectionId
                                            ) === -1
                                          ) {
                                            setModalData((prevModelData) => ({
                                              ...prevModelData,
                                              addOnsCat: [
                                                ...prevModelData.addOnsCat,
                                                add?.category,
                                              ],
                                            }));
                                          }
                                        }}
                                        checked={!!isSelected}
                                      />
                                    ) : (
                                      <CustomCheckbox
                                        id={inputId}
                                        onChange={(e) => {
                                          handleAddOns(
                                            addOn?.price,
                                            1,
                                            addOn?.collectionId,
                                            addOn?.id,
                                            addOn?.name,
                                            "multiple",
                                            e.target.checked
                                          );
                                          if (
                                            modalData?.addOnsCat?.findIndex(
                                              (ele) =>
                                                ele?.id === addOn?.collectionId
                                            ) === -1
                                          ) {
                                            setModalData((prevModelData) => ({
                                              ...prevModelData,
                                              addOnsCat: [
                                                ...prevModelData.addOnsCat,
                                                add?.category,
                                              ],
                                            }));
                                          }
                                        }}
                                        checked={!!isSelected}
                                        disabled={isDisabled}
                                        name={`addons${index}`}
                                      />
                                    )}
                                    <span
                                      className={`capitalize font-medium ms-3  ${
                                        add?.category?.maxAllowed > 1 &&
                                        isSelected
                                          ? "md:w-auto w-[150px]"
                                          : ""
                                      }`}
                                    >
                                      {add?.category?.maxAllowed > 1 &&
                                      selectedQuantity > 0 ? (
                                        <>
                                          <span className="text-theme-green-2 font-semibold ">
                                            {addOn?.maxAllowed > 1 &&
                                              `${selectedQuantity}x`}
                                          </span>
                                          {` ${addOn?.name}`}
                                        </>
                                      ) : (
                                        addOn?.name
                                      )}
                                    </span>
                                  </div>

                                  <div className="flex h-8 whitespace-nowrap">
                                    {addOn?.isPaid && (
                                      <p
                                        className={` ${
                                          selectedQuantity > 0
                                            ? "font-medium text-theme-black-2"
                                            : " text-opacity-65 text-black mr-1"
                                        } `}
                                      >
                                        +{" "}
                                        {`${addOn?.price} ${data?.data?.currencyUnit}`}
                                      </p>
                                    )}

                                    {add?.category?.maxAllowed > 1 &&
                                      addOn?.maxAllowed > 1 &&
                                      selectedQuantity > 0 && (
                                        <div className="flex ms-2 border border-gray-200 shadow-sm rounded-lg text-theme-green-3">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleAddOns(
                                                addOn?.price,
                                                -1,
                                                addOn?.collectionId,
                                                addOn?.id,
                                                addOn?.name,
                                                "multiple",
                                                true
                                              )
                                            }
                                            disabled={
                                              !isSelected
                                              // ||
                                              // selectedQuantity <=
                                              //   add?.category?.minAllowed
                                            }
                                            className="px-4 border-e text-theme-green-3 text-lg hover:bg-gray-100 rounded-s-md"
                                          >
                                            -
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleAddOns(
                                                addOn?.price,
                                                1,
                                                addOn?.collectionId,
                                                addOn?.id,
                                                addOn?.name,
                                                "multiple",
                                                true
                                              )
                                            }
                                            disabled={isIncrementDisabled}
                                            className="px-4 text-lg text-theme-green-3 hover:bg-gray-100 rounded-s-md"
                                          >
                                            +
                                          </button>
                                        </div>
                                      )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        ) : null
                      )}
                  </div>

                  <hr className="mt-10 mb-4" />
                  <button
                    onClick={() => setProductInfo(true)}
                    className="flex justify-between items-center w-full  px-4 text-theme-black-2"
                  >
                    <div className="font-medium text-base text-theme-green-2">
                      Product info
                    </div>
                    <FaChevronRight color="green" size={16} />
                  </button>
                  <hr className="mt-4 mb-4" />
                  <button className="flex justify-between items-center w-full  px-4">
                    <div className="font-medium text-base text-theme-green-2">
                      Report
                    </div>
                    <FaChevronRight color="green" size={16} />
                  </button>
                  <hr className="mt-4 mb-24" />
                </div>

                <div
                  display="flex"
                  justifyContent="space-between"
                  gap="10px"
                  className="bg-white bg-opacity-50 absolute  bottom-0 z-20  w-full"
                >
                  {productInfo ? (
                    <></>
                  ) : (
                    <div className="flex flex-col w-full">
                      <div className="px-5 py-5 flex justify-center items-center  gap-3 w-full">
                        <div className="shadow-smButtonShadow  w-40 h-14 rounded-full flex items-center justify-around text-[#707175] bg-white">
                          <button
                            onClick={() => {
                              if (
                                existingCartItems?.find(
                                  (ele) => ele?.RPLinkId === modalData.r_pId
                                )
                              ) {
                                if (modalData.quantity > 0) {
                                  setModalData({
                                    ...modalData,
                                    quantity: modalData.quantity - 1,
                                  });
                                }
                              } else {
                                if (modalData.quantity > 1) {
                                  setModalData({
                                    ...modalData,
                                    quantity: modalData.quantity - 1,
                                  });
                                }
                              }
                            }}
                            disabled={
                              (modalData.quantity === 0 &&
                                existingCartItems?.find(
                                  (ele) => ele?.RPLinkId === modalData.r_pId
                                )) ||
                              (modalData.quantity === 1 &&
                                !existingCartItems?.find(
                                  (ele) => ele?.RPLinkId === modalData.r_pId
                                ))
                                ? true
                                : false
                            }
                            className={`${
                              (modalData.quantity === 0 &&
                                existingCartItems?.find(
                                  (ele) => ele?.RPLinkId === modalData.r_pId
                                )) ||
                              (modalData.quantity === 1 &&
                                !existingCartItems?.find(
                                  (ele) => ele?.RPLinkId === modalData.r_pId
                                ))
                                ? "cursor-not-allowed text-black text-opacity-20"
                                : "hover:bg-black hover:text-white duration-300"
                            } w-10 h-10 flex justify-center items-center rounded-full`}
                          >
                            <RiSubtractFill />
                          </button>
                          <span className="text-lg font-sf">
                            {modalData.quantity}
                          </span>
                          <button
                            onClick={() =>
                              setModalData({
                                ...modalData,
                                quantity: modalData.quantity + 1,
                              })
                            }
                            disabled={
                              modalData.isUnlimited === false &&
                              modalData.quantity >= modalData.stock
                            }
                            className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-black hover:text-white duration-300"
                          >
                            <BiPlus />
                          </button>
                        </div>
                        <Button
                          isDisabled={
                            modalData.isUnlimited === false &&
                            (modalData.stock === 0 || modalData.stock == null)
                          }
                          onClick={() => {
                            let bannerType = JSON.parse(
                              localStorage.getItem("product")
                            )?.bannerType;

                            if (
                              localStorage.getItem("groupOrder") &&
                              !window.location.href.includes("group-order")
                            ) {
                              setInfoModal(true);
                              setModType({ ...modType, mod: "groupOrder" });
                              return false;
                            }

                            if (activeResData?.isOpen) {
                              if (modalData.quantity > 0) {
                                handleClick(
                                  modalData?.quantity,
                                  modalData?.r_pId,
                                  modalData?.img,
                                  modalData?.title,
                                  modalData?.discountPrice,
                                  modalData?.currencySign,
                                  modalData?.desc,
                                  addOnsData,
                                  modalData?.addOnsCat,
                                  modalData?.isUnlimited,
                                  parseInt(localStorage.getItem("resId")),
                                  bannerType
                                );
                                const groupId = JSON.parse(
                                  localStorage.getItem("groupData")
                                )?.orderId;
                                navigate(
                                  `/${countryCode}/group-order/${groupId}/venue`
                                );
                              } else {
                                deleteDiffOptionProduct(modalData?.r_pId);
                                const quan = modalData?.quantity;
                                const incCart = existingCartItems?.find(
                                  (ele) => ele?.RPLinkId === modalData.r_pId
                                );
                                if (incCart) {
                                  incCart.quantity = quan - quan;
                                }
                                const existingIndex =
                                  existingCartItems.findIndex(
                                    (ele) => ele?.RPLinkId === modalData.r_pId
                                  );
                                if (existingIndex !== -1) {
                                  existingCartItems.splice(existingIndex, 1);
                                  localStorage.setItem(
                                    "cartItems",
                                    JSON.stringify(existingCartItems)
                                  );
                                  closeModal();
                                  info_toaster("Product Removed from Cart");
                                }
                              }
                            } else {
                              info_toaster("Restaurant is closed right now!");
                            }
                          }}
                          bgColor="black"
                          display="flex"
                          color="white"
                          justifyContent={
                            modalData.quantity > 0 ? "space-between" : "center"
                          }
                          borderRadius="full"
                          width="300px"
                          height="56px"
                          _hover={{
                            opacity: ".8",
                          }}
                          className="shadow-lgButtonShadow "
                        >
                          <div className="text-md font-sf font-bold">
                            {modalData.quantity > 0
                              ? existingCartItems?.find(
                                  (ele) => ele?.RPLinkId === modalData.r_pId
                                )
                                ? "Update Cart"
                                : "Add to Cart"
                              : "Remove from cart"}
                          </div>
                          {modalData.quantity > 0 ? (
                            <div className="text-md font-sf font-semibold">
                              {(
                                modalData.quantity *
                                (parseFloat(modalData.discountPrice) +
                                  addOnsData.reduce((accumulator, ele) => {
                                    return (
                                      accumulator +
                                      (parseFloat(ele?.total) || 0) *
                                        (ele?.quantity || 1)
                                    );
                                  }, 0))
                              ).toFixed(2)}{" "}
                              {data?.data?.currencyUnit}
                            </div>
                          ) : (
                            <></>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        onClose={() => {
          setInfoModal(false);
        }}
        isOpen={infoModal}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          maxW={["510px", "510px"]}
          className="modal-content-custom"
        >
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
          <ModalBody padding={0}>
            {modType?.mod === "info" ? (
              <div className="font-sf   overflow-auto    md:h-screen-minus-10vh ultraLargeDesktop:h-screen-minus-40vh h-screen-minus-40vh rounded-t-[20px]">
                <div className="rounded-t-[20px] overflow-hidden">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={9}
                    onLoad={initializeMap}
                    options={{
                      mapTypeControl: false,
                      fullscreenControl: false,
                      streetViewControl: false,
                    }}
                  >
                    {polygonPaths?.length > 0 && (
                      <Polygon
                        paths={polygonPaths}
                        options={{
                          strokeColor: "#FF0000",
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                          fillColor: "#FF0000",
                          fillOpacity: 0.35,
                          clickable: true,
                          editable: true,
                          draggable: true,
                          geodesic: true,
                        }}
                      />
                    )}
                  </GoogleMap>
                </div>
                <div className="flex items-center justify-between px-4 m-auto font-sf">
                  <div className="flex items-center gap-x-2">
                    <span>
                      <FaRegSmile />
                    </span>
                    <h4 className="text-base font-normal text-black text-opacity-60">
                      Ratings
                    </h4>
                  </div>
                  <p className="text-base font-normal text-black">
                    {parseFloat(data?.data?.rating).toFixed(2)}
                  </p>
                </div>
                <hr className="my-4" />
                <div className="flex items-center justify-between px-4 m-auto">
                  <div className="flex items-center gap-x-2">
                    <span>
                      <IoLocationOutline />
                    </span>
                    <h4 className="text-black text-opacity-60">Location</h4>
                  </div>
                  <p>{data?.data?.location}</p>
                </div>
                <hr className="my-4" />
                <div className="flex items-center justify-between px-4 m-auto">
                  <div className="flex items-center gap-x-2">
                    <span>
                      <MdOutlineDeliveryDining />
                    </span>
                    <h4 className="text-black text-opacity-60">
                      Estd. delivery time
                    </h4>
                  </div>
                  <p>{data?.data?.deliveryTime}</p>
                </div>
                <hr className="my-4" />
                <div className="flex items-center justify-between px-4 m-auto">
                  <div className="flex items-center gap-x-2">
                    <span>
                      <IoMdTime />
                    </span>
                    <h4 className="text-black text-opacity-60">
                      Opening hours
                    </h4>
                  </div>
                  {/* <div className="">
                  {data?.data?.times.map((t, index) => (
                    <p key={index}>
                      {t?.startAt} - {t?.endAt}
                    </p>
                  ))}
                </div> */}
                  <p>{data?.data?.timings}</p>
                </div>
                <hr className="my-4" />
                <div className="px-4 m-auto pb-4">
                  <h4 className="font-medium text-2xl">Contact info</h4>
                  <p className="font-normal text-sm text-black text-opacity-60">
                    If you have allergies or dietary restrictions, please <br />{" "}
                    contact the restaurant for dish-specific information.
                  </p>
                </div>
                <div className="flex items-center justify-between px-4 m-auto">
                  <div className="flex items-center gap-x-2">
                    <h4 className="text-black text-opacity-60">
                      Restaurant contact
                    </h4>
                  </div>
                  <p className="text-[#E13743] font-bold text-base">
                    {data?.data?.businessEmail}
                  </p>
                </div>
                <hr className="my-4" />
                <div className="flex items-center justify-between px-4 m-auto">
                  <div className="flex items-center gap-x-2">
                    <h4 className="text-black text-opacity-60">Email</h4>
                  </div>
                  <p className="text-[#E13743] font-bold text-base">
                    {data?.data?.businessEmail}
                  </p>
                </div>
                <hr className="my-4" />
              </div>
            ) : (
              <>
                <div className="w-full">
                  {!translation?.load ? (
                    <div className="w-full py-10 px-5">
                      <h4 className="font-tt font-extrabold text-xl">
                        Menu Language
                      </h4>
                      <div className="bg-red-100 rounded-md mt-2 py-2 px-4">
                        <div className="flex gap-x-2 items-center">
                          <p className="font-tt">Automatic Translation</p>
                          <CiCircleInfo size="20" />
                        </div>
                        <p className=" text-gray-500">
                          These automated machine translation are not always
                          accurate. if you have severe allergies, contact the
                          restaurant befor order
                        </p>
                      </div>
                      <div
                        className="flex items-center justify-between px-4 py-2 [&>h4]:text-xl border-b mt-2 cursor-pointer"
                        onClick={() => {
                          handleTranslate("en");
                        }}
                      >
                        <h4>English</h4>
                        {modType?.language === "en" && (
                          <IoCheckmark color="green" size={25} />
                        )}
                      </div>
                      <div
                        className="flex items-center justify-between px-4 py-2 [&>h4]:text-xl border-b cursor-pointer"
                        onClick={() => {
                          handleTranslate("de");
                        }}
                      >
                        <h4>German</h4>
                        {modType?.language === "de" && (
                          <IoCheckmark color="green" size={25} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-[290px] flex justify-center items-center">
                      <RotatingLoader />
                    </div>
                  )}
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        onClose={() => {
          setTableModal(false);
          setTableOrder({
            noOfMembers: "",
            date: "",
            hour: "",
            minute: "",
            ampm: "AM",
            restaurantId: "",
            message: "",
          });
        }}
        isOpen={tableModal}
        isCentered
        size="xl"
      >
        <ModalOverlay />
        <ModalContent borderRadius={"20px"}>
          <ModalHeader>
            <h2
              className={`font-tt text-center ${
                modalScroll > 20
                  ? "font-bold text-lg"
                  : "font-black text-[28px]"
              }`}
            >
              Select Order Details
            </h2>
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleTableBooking}>
            <ModalBody
              style={{
                paddingRight: "0",
                paddingLeft: "0",
              }}
            >
              <section
                onScroll={handleModalScroll}
                className="h-[calc(100vh-200px)] overflow-auto px-6 font-tt space-y-4"
              >
                <div className="bg-theme-gray-15 px-3 py-2 rounded-md">
                  <h4 className="text-base font-normal capitalize">
                    {data?.data?.name}
                  </h4>
                  <div className="font-normal text-sm text-black text-opacity-40 capitalize">
                    {data?.data?.location}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-base">Select day</h4>
                  <div className="bg-theme-gray-15 px-3 py-2 rounded-md">
                    <Calendar
                      value={tableOrder.date}
                      onChange={(e) =>
                        setTableOrder({
                          ...tableOrder,
                          date: e,
                        })
                      }
                      minDate={new Date()}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-base">How many person?</h4>
                  <input
                    value={tableOrder.noOfMembers}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^[0-9]\d*$/.test(value)) {
                        setTableOrder({
                          ...tableOrder,
                          noOfMembers: value,
                        });
                      }
                    }}
                    type="text"
                    maxLength={3}
                    placeholder="Enter person in number"
                    className="bg-theme-gray-15 px-5 py-3.5 rounded-md w-full font-medium text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-base">What time?</h4>
                  <div className="bg-theme-gray-15 px-4 py-3 rounded-md">
                    <div className="font-bold text-xl">Enter Time</div>
                    <div className="flex items-center justify-center gap-x-3">
                      <input
                        value={tableOrder.hour}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            value === "" ||
                            (/^[0-9]\d*$/.test(value) && value <= 12)
                          ) {
                            setTableOrder({
                              ...tableOrder,
                              hour: e.target.value,
                            });
                          }
                        }}
                        type="text"
                        maxLength={2}
                        placeholder="12"
                        className="p-2 bg-white rounded-md w-20 font-bold text-[32px] text-center focus:outline-none"
                      />
                      <div className="flex flex-col justify-center items-center gap-y-5">
                        <div className="w-3 h-3 rounded-fullest bg-theme-red bg-opacity-20"></div>
                        <div className="w-3 h-3 rounded-fullest bg-theme-red bg-opacity-20"></div>
                      </div>
                      <input
                        value={tableOrder.minute}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            value === "" ||
                            (/^[0-9]\d*$/.test(value) && value <= 59)
                          ) {
                            setTableOrder({
                              ...tableOrder,
                              minute: e.target.value,
                            });
                          }
                        }}
                        type="text"
                        maxLength={2}
                        placeholder="00"
                        className="p-2 bg-white rounded-md w-20 font-bold text-[32px] text-center focus:outline-none"
                      />
                      <div>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() =>
                              setTableOrder({ ...tableOrder, ampm: "AM" })
                            }
                            className={`${
                              tableOrder.ampm === "AM"
                                ? "bg-theme-red text-white"
                                : "bg-white text-black"
                            } font-medium text-xl px-2 py-0.5 rounded-t-lg`}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setTableOrder({ ...tableOrder, ampm: "PM" })
                            }
                            className={`${
                              tableOrder.ampm === "PM"
                                ? "bg-theme-red text-white"
                                : "bg-white text-black"
                            } font-medium text-xl px-2 py-0.5 rounded-b-lg`}
                          >
                            PM
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-base">Message</h4>
                  <textarea
                    value={tableOrder.message}
                    onChange={(e) =>
                      setTableOrder({
                        ...tableOrder,
                        message: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Write your message.."
                    className="border border-black border-opacity-40 px-3 py-2 rounded-md w-full font-normal text-base focus:outline-none resize-none"
                  ></textarea>
                </div>
                <div className="bg-theme-gray-15 px-3 py-2 rounded-md space-y-1">
                  <div className="text-base font-medium">Personal Details</div>
                  <div className="text-sm font-normal text-black text-opacity-40 capitalize">
                    {localStorage.getItem("userName")}
                  </div>
                  <div className="text-sm font-normal text-black text-opacity-40">
                    {localStorage.getItem("userEmail")}
                  </div>
                </div>
              </section>
            </ModalBody>
            <ModalFooter>
              <div className="text-center w-full ">
                <button
                  type="submit"
                  disabled={disabled ? true : false}
                  className="text-white bg-[#E13743] px-4 py-2 rounded-md w-full"
                >
                  Send Request
                </button>
              </div>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* FULL image modal */}
      <Modal
        isOpen={isFullImageOpen}
        onClose={handleCloseFullImage}
        size="full"
      >
        <ModalOverlay />
        <ModalContent backgroundColor="transparent">
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
            right="25px"
            top="25px"
            zIndex={10}
          />
          <ModalBody
            className="flex justify-center items-center bg-white rounded-2xl "
            p={0}
          >
            <span className="w-full h-[80vh]">
              <img
                src={`${BASE_URL}${modalData.img}`}
                alt="Full View"
                className="w-full h-full object-contain"
              />
            </span>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Cart Clear Confirmation modal*/}
      <Modal
        isOpen={updateCartModal}
        onClose={handleCloseUpdateCartModal}
        size="lg"
        isCentered
        className="modal-custom"
      >
        <ModalOverlay />
        <ModalContent backgroundColor="transparent">
          <ModalBody
            className="flex justify-center items-center bg-white rounded-2xl "
            p={0}
          >
            <div className="w-full h-[31vh] px-4 py-9 flex flex-col justify-center items-center gap-3">
              <h2 className="font-tt text-[28px] font-black">
                Continue Order?
              </h2>
              <p className="text-center font-switzer font-normal text-base max-w-[363px] w-full">
                You created an order previously that you didn't finish, would
                you like to continue from where you left off?
              </p>

              <div className="flex gap-4 w-full mt-3">
                <button
                  onClick={handleUpdateCart}
                  className="flex-1 h-12 rounded bg-theme-red bg-opacity-10 text-theme-red font-switzer font-semibold text-base"
                >
                  {" "}
                  No
                </button>
                <button
                  onClick={handleCloseUpdateCartModal}
                  className=" flex-1 h-12 rounded bg-theme-red  text-white font-switzer font-semibold text-base"
                >
                  {" "}
                  Yes
                </button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Header
        home={false}
        rest={true}
        resDetail={true}
        drawerCart={drawerCart}
        message={configurationMessage}
        restaurantData={data}
        scheduleOrderModal={scheduleOrderModal}
        setScheduleOrderModal={setScheduleOrderModal}
        loginModal={loginModal}
        setLoginModal={setLoginModal}
        openModal={(product) => {
          setModal(true);
          setModalData(product);
        }}
        handleClick={handleClick}
        productDetails={productDetails}
        setAddDiffProductOpMessage={setAddDiffProductOpMessage}
        groupOrderHeader={false}
      />
      <section className="font-sf ">
        <section className="relative border-b-[1px] border-b-black border-opacity-10">
          <section
            className="relative lg:min-h-[352px] min-h-[280px] bg-cover bg-no-repeat bg-top before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-black before:bg-opacity-40"
            style={{
              backgroundImage: `url("${BASE_URL}${data?.data?.coverImage}")`,
            }}
          >
            {/* <button className="absolute sm:bottom-28 bottom-16 right-8 text-white w-12 h-12 rounded-fullest bg-black bg-opacity-60 flex justify-center items-center">
            <CiHeart size={32} />
          </button> */}
          </section>
          <div className="custom-max-width w-[92%] lg:w-[96.3%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6 mx-auto pt-10 pb-4 md:py-4 md:flex lg:flex-row sm:flex-col md:flex-col-reverse lg:justify-between lg:items-center items-end gap-y-3 relative bg-white space-y-2 md:space-y-0">
            <div className="md:w-28 w-24 md:h-28 h-24 absolute left-0 2xl:left-6  -top-16 md:-top-20 border-4 bg-white border-white rounded-lg shadow-md ">
              <img
                src={`${BASE_URL}${data?.data?.logo}`}
                alt="logo-1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className=" pb-4 flex items-end justify-between w-[calc(100%-5rem)] md:w-[calc(100%-11rem)] text-white absolute lg:bottom-16 bottom-[200px] md:bottom-24 lg:left-36 sm:left-32 left-20 lg:space-y-3">
              <div className="md:mb-auto mb-5  md:ms-4  ms-8">
                <h3 className="font-bold lg:text-[46px] md:text-3xl text-2xl capitalize font-omnes mb-4">
                  {data?.data?.name}
                </h3>
                <p className="font-medium lg:text-[18px] sm:text-base text-sm">
                  {data?.data?.location}
                </p>
              </div>
              <div className="md:mb-2 mb-6 ">
                {userId ? (
                  <div
                    onClick={toggleFavorite}
                    className="relative w-10 h-10 flex justify-center items-center "
                  >
                    <div className="border absolute inset-0 bg-white bg-opacity-15 rounded-full backdrop-blur-xl hover:cursor-pointer hover:bg-opacity-20"></div>
                    {isFavorite ? (
                      <IoMdHeart className="relative w-6 h-6 z-10 text-red-500 hover:cursor-pointer" /> // Filled red heart
                    ) : (
                      <IoMdHeartEmpty className="relative w-6 h-6 z-10 hover:cursor-pointer" /> // Empty heart
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="block space-y-2 md:space-y-0 md:flex items-center justify-end xl:gap-x-10 gap-x-5 lg:ml-36 md:ml-32 sm:w-fit w-full ">
              <div className="flex items-center gap-x-2">
                <LuClock3 />
                <span className="font-normal text-sm  text-theme-black-2">
                  {t(message)}
                </span>
              </div>
              <div className="flex items-center gap-x-2 text-theme-black-2">
                <BsEmojiSmileFill className="text-theme-yellow" />
                <span className="font-normal text-sm">
                  {parseFloat(data?.data?.rating).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-x-2 text-theme-green-2">
                <FaCircleExclamation />
                <button
                  onClick={() => {
                    setInfoModal(true);
                    setModType({ ...modType, mod: "info" });
                  }}
                  className="font-medium text-sm"
                >
                  {t("See more information")}
                </button>
              </div>
            </div>
            <div className="md:flex items-center xl:gap-x-3 gap-x-2 space-y-2 md:space-y-0">
              <button
                onClick={() => {
                  setTableModal(true);
                }}
                className="flex items-center gap-x-2 text-theme-green-2  bg-theme-green-4 py-2 px-4 rounded-lg"
              >
                <MdOutlineTableRestaurant size={20} />
                <div className="font-medium text-sm">{t("Book a table")}</div>
              </button>
              {localStorage.getItem("groupData") &&
              gData?.restaurant?.id == localStorage.getItem("resId") ? (
                <button
                  onClick={() => setGroupDrawer(true)}
                  className="flex items-center gap-x-2 text-theme-green-2 bg-theme-green-4 py-2 px-4 rounded-lg"
                >
                  <FaUsers size={20} />
                  <div className="font-medium text-sm">
                    {JSON.parse(localStorage.getItem("groupData"))?.groupName ||
                      gData?.groupName}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => navigate(`${location.pathname}/group-order`)}
                  className="flex items-center gap-x-2 text-theme-green-2 bg-theme-green-4 py-2 px-4 rounded-lg"
                >
                  <FaUsers size={20} />
                  <div className="font-medium text-sm">
                    {t("Order together")}
                  </div>
                </button>
              )}
            </div>
          </div>
        </section>

        <section
          className={`py-3 md:py-5 cat-section ${
            addShadow ? "shadow-md" : ""
          } `}
        >
          <div className="custom-max-width w-[92%] sm:w-[96.3%] lg:w-[96.3%] desktop:w-[96.3%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6 mx-auto">
            <ul className="flex md:flex-row flex-col-reverse justify-between gap-x-2 md:gap-x-3 cursor-pointer pt-4">
              <div
                className="flex gap-x-2 md:gap-x-3 overflow-x-auto hide-scrollbar w-full py-1 max-w-screen-xl  md:mt-0 mt-3"
                ref={navContainerRef}
              >
                {data?.data?.menuCategories?.map((cat, index) => (
                  <li
                    ref={(el) => (navRefs.current[index] = el)}
                    key={index}
                    data-category={cat.name}
                    onClick={() => scrollToCategory(cat.name)}
                    className={`uppercase text-sm md:text-[0.87rem] font-medium flex flex-shrink-0 items-center ${
                      activeCategory === cat.name
                        ? "bg-[#FFAE0014] !text-theme-yellow"
                        : "text-black"
                    } gap-x-1 md:gap-x-2 rounded-md px-2 md:px-2 py-1 duration-150 hover:text-theme-yellow`}
                  >
                    <p>{cat?.name}</p>
                  </li>
                ))}
              </div>

              <div className=" space-x-3 menu-category items-center justify-center ml-4 mr-2 md:flex  hidden">
                {showButtons && (
                  <>
                    <div
                      className="cat-custom-swiper-button-prev relative"
                      onClick={scrollLeft}
                    >
                      <FaArrowLeftLong
                        size={17}
                        color="#2b2b2b"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 "
                      />
                    </div>
                    <div
                      className="cat-custom-swiper-button-next relative"
                      onClick={scrollRight}
                    >
                      <FaArrowRightLong
                        size={17}
                        color="#2b2b2b"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 "
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="relative md:flex md:w-auto w-full">
                <div className="relative flex items-center bg-theme-gray-12 space-x-2 md:w-[280px] rounded-3xl pl-3 pr-3 md:mt-auto mt-4">
                  <IoSearch size={20} className="cursor-auto" />
                  <input
                    type="search"
                    name="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-base py-2 focus:outline-none font-normal w-full bg-transparent"
                    placeholder="Search in rest..."
                  />
                </div>
              </div>
            </ul>
          </div>
        </section>

        <section className="custom-max-width w-[92%] sm:w-[96.3%] lg:w-[96.3%] desktop:w-[96.3%]  largeDesktop:w-[95%] extraLargeDesktop:w-5/6 mx-auto">
          <div className="bg-[#FFAE0014] rounded-lg  px-5 py-4 font-sf space-y-2">
            <p className="text-sm font-nomral text-theme-black-2">
              {t(
                "This menu is in German. Would you like to view a machine translation in another language?"
              )}
            </p>
            <div className="flex gap-x-10 cursor-pointer text-theme-yellow">
              <p
                className=" text-sm font-semibold"
                onClick={() => {
                  setInfoModal(true);
                  setModType({ ...modType, mod: "translate" });
                }}
              >
                Translate
              </p>
            </div>
          </div>
        </section>

        <section className="custom-max-width w-[92%] sm:w-[96.3%] lg:w-[96.3%] desktop:w-[96.3%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6 py-12 mx-auto space-y-8">
          {searchQuery !== "" && (
            <>
              <div className="flex items-start gap-x-10">
                <p className="text-3xl font-bold">
                  Results for "{searchQuery}"
                </p>
                <button
                  className="text-sm text-[#E13743] font-medium"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </button>
              </div>
            </>
          )}

          {/* Other Categories */}
          {getSearchedResults()?.length > 0 ? (
            <>
              {getSearchedResults()?.map((menu, index) => (
                <div
                  key={index}
                  className="section "
                  id={`menu-${menu?.name}`}
                  ref={(el) => (categoryRefs.current[index] = el)}
                >
                  <h2 className="text-theme-black-2 font-omnes font-semibold text-[28px] leading-9 uppercase flex items-center gap-x-2 mt-10">
                    {menu?.name}
                  </h2>
                  <div className="mt-7 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {menu?.products?.map((prod, key) => {
                      const cartItemsForProduct = existingCartItems?.filter(
                        (item) => item?.RPLinkId === prod.RPLinkId
                      );
                      const isInCart = cartItemsForProduct?.length > 0;
                      return (
                        <div key={key} className="relative flex">
                          <DetailsCard
                            img={`${BASE_URL}${prod?.image}`}
                            title={prod?.name}
                            desc={prod?.description}
                            price={prod?.originalPrice}
                            currencyUnit={data?.data?.currencyUnit || "CHF"}
                            stock={prod?.stock}
                            isUnlimited={prod?.isUnlimited}
                            addCart={() => {
                              if (isInCart) {
                                setAddDiffProductOpMessage(
                                  "Add another with different options"
                                );
                                productDetails(
                                  prod.RPLinkId,
                                  prod.name,
                                  menu.r_mcId,
                                  data
                                );
                              } else {
                                productDetails(
                                  prod.RPLinkId,
                                  prod.name,
                                  menu.r_mcId,
                                  data
                                );
                              }
                            }}
                            qty={
                              existingCartItems?.find(
                                (ele) => ele?.RPLinkId === prod.RPLinkId
                              )?.quantity
                            }
                            cartItems={cartItemsForProduct}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="mx-auto w-full text-center">
              <figure>
                <img
                  className="h-96 object-cover mx-auto"
                  src="../images/restaurants/no-data.gif"
                  alt=""
                />
              </figure>
              <h5 className="text-3xl font-extrabold">No results found</h5>
            </div>
          )}
        </section>

        <section className="custom-max-width w-[94%] lg:w-[96.3%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6 mx-auto mb-16  space-y-6  rounded-xl  ">
          <div
            className="flex flex-col rounded-xl"
            style={{ background: "rgba(32, 33, 37, 0.04)" }}
          >
            <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-y-8   pt-6 pb-5 ">
              <div className="space-y-4 md:border-r lg:col-span-2 lg:px-12 px-8">
                <h4 className="text-paraColor font-sf capitalize font-normal text-opacity-90 text-theme-black-2">
                  {data?.data?.description}
                </h4>
              </div>
              <div className="space-y-4 lg:border-r lg:px-8 px-8  ">
                <h4 className="text-theme-black-2 font-omnes font-semibold text-xl">
                  {t("Address")}
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm font-sf font-normal">
                    {data?.data?.location}
                  </li>
                  <li className="text-sm font-sf font-normal">
                    <a
                      className="text-theme-green-2"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.google.com/maps?q=${data?.data?.lat},${data?.data?.lng}`}
                    >
                      {t("See Map")}
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-4 md:border-r lg:col-span-1 lg:px-6 px-8">
                <h4 className="text-theme-black-2 font-omnes font-semibold text-xl">
                  {t("Delivery times")}
                </h4>
                <div className="flex justify-between">
                  <ul className="space-y-1 w-full">
                    {data?.data?.times
                      ?.sort((a, b) => parseInt(a.day) - parseInt(b.day))
                      ?.map((time, index) => (
                        <li
                          className="text-sm font-sf capitalize  font-normal text-theme-black-2"
                          key={index}
                        >
                          {time?.name}
                        </li>
                      ))}
                  </ul>
                  <ul className="space-y-1 w-full">
                    {data?.data?.times
                      ?.sort((a, b) => parseInt(a.day) - parseInt(b.day))
                      ?.map((time, index) => (
                        <li
                          className="text-sm font-sf text-theme-black-2 text-opacity-65 text-end font-light"
                          key={index}
                        >
                          {time?.startAt} - {time?.endAt}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
              <div className="space-y-2 lg:px-6 px-8">
                <h4 className="font-semibold font-omnes text-xl text-theme-black-2">
                  {t("More information")}
                </h4>
                <div className="text-sm text-greenColor font-sf font-medium text-theme-green-2">
                  {data?.data?.businessEmail}
                </div>
                <div className="text-sm text-greenColor font-sf font-medium text-theme-green-2">
                  {t("Visit website")}
                </div>
                <p className="text-xs font-sf text-paraColor font-normal text-theme-black-2 text-opacity-65">
                  {t(
                    "Prices include VAT (excluding additional shipping costs that may apply)."
                  )}
                </p>
              </div>
            </div>

            <div className="relative ">
              <div className="absolute z-40 top-0 rest-footer h-1/5 w-full"></div>
              <div className="h-48 rest-footer border rounded-b-xl overflow-hidden">
                <GoogleMap
                  zoom={14}
                  center={{
                    lat: parseFloat(localStorage.getItem("lat")),
                    lng: parseFloat(localStorage.getItem("lng")),
                  }}
                  mapContainerStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                  options={{
                    disableDefaultUI: true,
                  }}
                >
                  <MarkerF
                    position={{
                      lat: parseFloat(localStorage.getItem("lat")),
                      lng: parseFloat(localStorage.getItem("lng")),
                    }}
                  />
                </GoogleMap>
              </div>
            </div>
          </div>
        </section>
      </section>

      <div
        className="w-full sticky bottom-0 pb-4 !z-[150] lg:hidden sm:max-w-[400px] mx-auto max-sm:px-4"
        onClick={() => setHeaderDrawer(true)}
      >
        <button className=" bg-theme-red font-bold text-white rounded-lg px-4 w-full h-[54px] flex items-center justify-between">
          <div className="flex space-x-3 items-center">
            <span className="flex justify-center items-center bg-white text-theme-red rounded-full font-medium text-[12px] size-6">
              {String(existingCartItems?.length).padStart(2, "0")}
            </span>
            <p> View Order </p>
          </div>
          <p className="font-medium">
            {totalPrice} {activeResData?.currencyUnit}
          </p>
        </button>
      </div>
      <Footer width="custom-max-width w-[94%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6" />
    </>
  );
}
