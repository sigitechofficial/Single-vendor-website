import React, { useEffect, useRef, useState } from "react";
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
import { GiChopsticks } from "react-icons/gi";
import { HiShare } from "react-icons/hi";
import { RiSubtractFill } from "react-icons/ri";
import { BiPlus } from "react-icons/bi";
import DetailsCard from "../../components/DetailsCard";
import GetAPI from "../../utilities/GetAPI";
import { BASE_URL } from "../../utilities/URL";
import Loader from "../../components/Loader";
import { IoMdHeartEmpty, IoMdTime } from "react-icons/io";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { MarkerF } from "@react-google-maps/api";
import { GoogleMap } from "@react-google-maps/api";
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
} from "@chakra-ui/react";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import { PostAPI } from "../../utilities/PostAPI";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoLocationOutline, IoSearch } from "react-icons/io5";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";

export default function RestaurantDetailsForApp() {
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
      localStorage.setItem("resId", match[1]);
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
  const navigate = useNavigate();
  const { resId } = useParams();

  const { data } = GetAPI(`users/restaurantbyid?restaurantId=${resId}`);
  const wishList = GetAPI("frontsite/getWishList");
  const deliveryTypes = GetAPI("frontsite/deliveryTypes");
  localStorage.setItem("activeResData", JSON.stringify(data.data));
  const [addOnsData, setAddOnsData] = useState([]);

  const handleAddOns = (
    total,
    quantity,
    collectionId,
    addOnId,
    name,
    key,
    checked
  ) => {
    if (key === "single") {
      const curr = {
        total: total,
        quantity: quantity,
        collectionId: collectionId,
        addOnId: addOnId,
        name: name,
      };
      const existingIndex = addOnsData.findIndex(
        (ele) => ele?.collectionId === collectionId
      );
      if (existingIndex === -1) {
        setAddOnsData((data) => [...data, curr]);
      } else {
        const updatedData = [...addOnsData];
        updatedData.splice(existingIndex, 1, curr);
        setAddOnsData(updatedData);
      }
    } else if (key === "multiple") {
      if (checked) {
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
      } else {
        const existingIndex = addOnsData.findIndex(
          (ele) =>
            ele?.collectionId === collectionId && ele?.addOnId === addOnId
        );
        if (existingIndex === -1) {
        } else {
          const updatedData = [...addOnsData];
          updatedData.splice(existingIndex, 1);
          setAddOnsData(updatedData);
        }
      }
    }
  };
  const [modal, setModal] = useState(false);
  const [productInfo, setProductInfo] = useState(false);

  const [disabled, setDisabled] = useState(false);
  const [tableModal, setTableModal] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
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
  const scrollToCategory = (categoryName) => {
    setActiveCategory(categoryName);
    const element = document.getElementById(`menu-${categoryName}`);
    if (element) {
      const navbarHeight = md ? 140 : 200;
      const scrollPosition =
        element.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  };
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
          if (categoryFilteredProducts.length > 0) {
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
  const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
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
    resId
  ) => {
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
      resId,
    };
    const sameRes = existingCartItems.find(
      (item) => parseInt(item.resId) === resId
    );
    if (sameRes || existingCartItems.length === 0) {
      const existingItemIndex = existingCartItems.findIndex(
        (item) => item.RPLinkId === RPLinkId
      );
      if (existingItemIndex !== -1) {
        const existingItem = existingCartItems[existingItemIndex];
        existingItem.quantity = quantity;
        existingItem.addOns = addOns;
        existingItem.addOnsCat = addOnsCat;
        localStorage.setItem("cartItems", JSON.stringify(existingCartItems));
        info_toaster("Product Updated in Cart");
      } else {
        const updatedCartItems = [...existingCartItems, newCartItem];
        localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
        success_toaster("Product Added To Cart");
      }
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
      });
      setAddOnsData([]);
      navigate(`${location.pathname}${location.search}`);
    } else {
      info_toaster(
        "You can't add any product from this restaurant. Please complete your previous order."
      );
    }
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
  const productDetails = (rpId, r_mcId, material) => {
    const menuCat = material?.data?.menuCategories?.find(
      (menu) => menu?.r_mcId === parseInt(r_mcId)
    );
    const prod = menuCat?.products?.find(
      (prod) => prod?.RPLinkId === parseInt(rpId)
    );
    const alreadyInCart = existingCartItems?.findIndex(
      (ele) => ele?.RPLinkId === prod?.RPLinkId
    );
    const alreadyInCartProd = existingCartItems?.find(
      (ele) => ele?.RPLinkId === prod?.RPLinkId
    );
    if (alreadyInCart === -1) {
      setModalData({
        quantity: 1,
        r_pId: prod?.RPLinkId,
        img: prod?.image,
        title: prod?.name,
        desc: prod?.description,
        originalPrice: parseInt(prod?.originalPrice),
        discountPrice: parseInt(prod?.discountPrice),
        addOns: prod?.addOnArr,
        addOnsCat: [],
        currencySign: prod?.currencySign,
        nutrients: prod?.nutrients,
        allergies: prod?.allergies,
        ingredients: prod?.ingredients,
      });
      prod?.addOnArr
        ?.filter((add) => add?.category?.minAllowed === 1)
        ?.forEach((category) => {
          const firstAddon = category.addons[0];
          if (firstAddon) {
            handleAddOns(
              firstAddon.price,
              1,
              firstAddon.collectionAddonId,
              firstAddon.id,
              firstAddon.name,
              "single",
              false
            );
            setModalData((prevModelData) => ({
              ...prevModelData,
              addOnsCat: [
                ...prevModelData.addOnsCat,
                prod?.addOnArr?.find(
                  (add) => add?.category?.id === firstAddon?.collectionAddonId
                )?.category,
              ],
            }));
          }
        });
    } else {
      setModalData({
        quantity: alreadyInCartProd?.quantity,
        r_pId: prod?.RPLinkId,
        img: prod?.image,
        title: prod?.name,
        desc: prod?.description,
        originalPrice: parseInt(prod?.originalPrice),
        discountPrice: parseInt(prod?.discountPrice),
        addOns: prod?.addOnArr,
        addOnsCat: [],
        currencySign: prod?.currencySign,
        nutrients: prod?.nutrients,
        allergies: prod?.allergies,
        ingredients: prod?.ingredients,
      });
      prod?.addOnArr
        ?.filter((add) => add?.category?.minAllowed === 1)
        ?.forEach((category) => {
          const firstAddon = category.addons.find(
            (ele) =>
              ele?.name ===
                alreadyInCartProd?.addOns?.find(
                  (fin) => fin?.name === ele?.name
                )?.name &&
              ele?.collectionAddonId ===
                alreadyInCartProd?.addOns?.find(
                  (fin) => fin?.collectionId === ele?.collectionAddonId
                )?.collectionId
          );
          if (firstAddon) {
            handleAddOns(
              firstAddon.price,
              1,
              firstAddon.collectionAddonId,
              firstAddon.id,
              firstAddon.name,
              "single",
              false
            );
            setModalData((prevModelData) => ({
              ...prevModelData,
              addOnsCat: [
                ...prevModelData.addOnsCat,
                prod?.addOnArr?.find(
                  (add) => add?.category?.id === firstAddon?.collectionAddonId
                )?.category,
              ],
            }));
          }
        });
      prod?.addOnArr
        ?.filter((add) => add?.category?.minAllowed > 1)
        ?.forEach((category) => {
          const addon = category.addons.filter(
            (ele) =>
              ele?.name ===
              alreadyInCartProd?.addOns?.find((fin) => fin?.name === ele?.name)
                ?.name
          );
          if (addon?.length > 0) {
            addon?.forEach((catAdd) => {
              const multi = {
                total: catAdd?.price,
                quantity: alreadyInCartProd?.addOns?.find(
                  (fin) => fin?.name === catAdd?.name
                )?.quantity,
                collectionId: catAdd?.collectionAddonId,
                addOnId: catAdd?.id,
                name: catAdd?.name,
              };
              setAddOnsData((data) => [...data, multi]);
            });
            setModalData((prevModelData) => ({
              ...prevModelData,
              addOnsCat: [
                ...prevModelData.addOnsCat,
                prod?.addOnArr?.find(
                  (add) => add?.category?.id === addon[0]?.collectionAddonId
                )?.category,
              ],
            }));
          }
        });
    }
    setModal(true);
  };
  const handleModalScroll = (event) => {
    setModalScroll(event.target.scrollTop);
  };
  const autocompleteRef = useRef(null);
  const [addShadow, setAddShadow] = useState(false);
  useEffect(() => {
    if (location.pathname !== "/restaurant-details/detail") {
      const slug = extractIdFromUrl(location);
      const mcId = extractmcIdFromUrl(location);
      var config = {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      };
      axios
        .get(`${BASE_URL}users/restaurantbyid?restaurantId=${resId}`, config)
        .then((dat) => {
          productDetails(slug, mcId, dat.data);
        });
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
      setActiveCategory("");
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
  const containerStyle = {
    width: "100%",
    height: "180px",
    marginBottom: "12px",
  };

  return data?.length === 0 ? (
    <Loader />
  ) : (
    <>
      <Header home={false} rest={true} />
      <section className="font-sf">
        <section className="relative border-b-[2px] border-b-black border-opacity-20">
          <section
            className="relative lg:min-h-[352px] sm:min-h-[280px] min-h-[240px] bg-cover bg-no-repeat bg-top before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-black before:bg-opacity-40"
            style={{
              backgroundImage: `url("${BASE_URL}${data?.data?.coverImage}")`,
            }}
          >
            {/* <button className="absolute sm:bottom-28 bottom-16 right-8 text-white w-12 h-12 rounded-fullest bg-black bg-opacity-60 flex justify-center items-center">
            <CiHeart size={32} />
          </button> */}
          </section>
          <div className="w-[94%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6 mx-auto pt-10 pb-4 md:py-4 md:flex lg:flex-row sm:flex-col md:flex-col-reverse lg:justify-between lg:items-center items-end gap-y-3 relative bg-white space-y-2 md:space-y-0">
            <div className="md:w-28 w-16 md:h-28 h-16 absolute left-0 -top-8 md:-top-20 border-4 bg-white border-white rounded-lg shadow-md">
              <img
                src={`${BASE_URL}${data?.data?.logo}`}
                alt="logo-1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex items-end justify-between  w-[calc(100%-9rem)] text-white absolute lg:bottom-16 bottom-28 lg:left-36 sm:left-32 left-20 lg:space-y-3">
              <div>
                <h3 className="font-semibold lg:text-4xl sm:text-3xl text-2xl">
                  {data?.data?.name}
                </h3>
                <p className="font-normal lg:text-xl sm:text-base text-sm">
                  {data?.data?.location}
                </p>
              </div>
              <div>
                <div className="bg-black bg-opacity-30 rounded-fullest p-2">
                  <IoMdHeartEmpty />
                </div>
              </div>
            </div>
            <div className="block space-y-2 md:space-y-0 md:flex items-center justify-end lg:gap-x-10 gap-x-5 lg:ml-40 md:ml-32 sm:w-fit w-full">
              <div className="flex items-center gap-x-2">
                <LuClock3 />
                <span className="font-semibold text-sm">
                  {`Open until ${dayjs(
                    data?.data?.times?.find(
                      (time) =>
                        (time?.name).toLowerCase() ===
                        dayjs().format("dddd").toLowerCase()
                    )?.endAt,
                    "HH:mm"
                  ).format("hh:mm A")}`}
                </span>
              </div>
              <div className="flex items-center gap-x-2">
                <BsEmojiSmileFill className="text-theme-yellow" />
                <span className="font-semibold text-sm">
                  {parseFloat(data?.data?.rating).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-x-2 text-theme-green-2">
                <FaCircleExclamation />
                <button
                  onClick={() => {
                    setInfoModal(true);
                  }}
                  className="font-semibold text-sm"
                >
                  {t("See more information")}
                </button>
              </div>
            </div>
            <div className="md:flex items-center lg:gap-x-10 gap-x-5 space-y-2 md:space-y-0">
              <button
                onClick={() => {
                  setTableModal(true);
                }}
                className="flex items-center gap-x-2 text-theme-green-2"
              >
                <MdOutlineTableRestaurant size={20} />
                <div className="font-medium text-sm">Book a table</div>
              </button>
              <button
                onClick={() => navigate("/group-order")}
                className="flex items-center gap-x-2 text-theme-green-2"
              >
                <FaUsers size={20} />
                <div className="font-medium text-sm">Order together</div>
              </button>
            </div>
          </div>
        </section>
        <section
          className={`py-3 md:py-5 cat-section ${
            addShadow ? "shadow-md" : ""
          } `}
        >
          <div className="w-[94%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6 mx-auto">
            <ul className="flex justify-between gap-x-2 md:gap-x-3 cursor-pointer overflow-x-auto w-full">
              <div className="flex gap-x-2 md:gap-x-3 cursor-pointer overflow-x-auto w-full py-1">
                <li
                  onClick={() => scrollToCategory("Cutlery")}
                  className={`uppercase text-xs md:text-[0.87rem] font-medium flex flex-shrink-0 items-center ${
                    activeCategory === "Cutlery" ||
                    activeMenu === "menu-Cutlery"
                      ? "text-[#FFAE00] bg-[#FFAE0014]"
                      : "text-black text-opacity-50"
                  } gap-x-1 md:gap-x-2 rounded-md px-2 md:px-2 py-1 duration-150`}
                >
                  <p>Cutlery</p>
                  <img
                    className="w-6 h-6 m-auto"
                    src="/images/restaurant-details/cutlery-icon.png"
                    alt="Cutlery"
                  />
                </li>
                {data?.data?.menuCategories?.map((cat, index) => (
                  <li
                    key={index}
                    onClick={() => scrollToCategory(cat.name)}
                    className={`uppercase text-xs md:text-[0.87rem] font-medium flex flex-shrink-0 items-center ${
                      activeCategory === cat.name ||
                      activeMenu === `menu-${cat.name}`
                        ? "text-[#FFAE00] bg-[#FFAE0014]"
                        : "text-black text-opacity-50"
                    } gap-x-1 md:gap-x-2 rounded-md  px-2 md:px-2 py-1 duration-150`}
                  >
                    <p>{cat?.name}</p>
                    <div>
                      <img
                        className="w-6 h-6 m-auto"
                        src={`${BASE_URL}${cat?.iconImage}`}
                        alt={cat?.name}
                      />
                    </div>
                  </li>
                ))}
              </div>
              <div className="relative hidden sm:block">
                <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none">
                  <IoSearch size={20} />
                </div>
                <input
                  type="search"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="text-base py-2.5 pr-5 pl-10 rounded-3xl bg-[#F8F8F8] focus:outline-none font-normal w-full"
                  placeholder="Search in rest..."
                />
              </div>
            </ul>
          </div>
        </section>
        <section className="w-[94%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6 mx-auto">
          <div className="bg-[#E1374333] rounded-md  px-3 py-3 font-switzer">
            <p className="text-sm font-light">
              This menu is in German. Would you like to view a machine
              translation in another language?
            </p>
            <div className="flex gap-x-10 cursor-pointer">
              <p className="text-[#E13743] text-base font-semibold">
                Translate
              </p>
              <p className="text-[#E13743] text-base font-medium">Always</p>
              <p className="text-[#E13743] text-base font-medium">Never</p>
            </div>
          </div>
        </section>
        <section className="w-[94%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6 py-12 mx-auto space-y-8">
          {searchQuery !== "" && (
            <>
              <div className="flex items-start gap-x-10">
                <p className="text-3xl font-bold font-tt">
                  Results for "{searchQuery}"
                </p>
                <button
                  className="text-sm text-[#E13743] font-medium"
                  onClick={() => {
                    setSearchQuery("");
                  }}
                >
                  Clear search
                </button>
              </div>
            </>
          )}
          <div className="section" id="menu-Cutlery">
            <h2 className="font-semibold sm:text-3xl text-2xl uppercase flex items-center gap-x-2">
              Cutlery
              <GiChopsticks size={28} />
            </h2>
            <p className="font-normal text-sm">
              Help us to reduce waste - only request cutlery when you need it
            </p>
            <div className="mt-5 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {data?.data?.cutlery_list?.length !== 0 ? (
                data?.data?.cutlery_list?.map((cut, index) => (
                  <div key={index}>
                    <DetailsCard
                      img={`${BASE_URL}${cut?.image}`}
                      title={cut?.name}
                      desc={cut?.description}
                      price={cut?.price}
                      // addCart={() => productDetails(cut?.RPLinkId)}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full flex justify-center items-center font-medium text-xl">
                  No Cutlery
                </div>
              )}
            </div>
          </div>
          {getSearchedResults().length > 0 ? (
            <>
              {getSearchedResults()?.map((menu, index) => (
                <div key={index} className="section" id={`menu-${menu?.name}`}>
                  <h2 className="font-semibold sm:text-3xl text-2xl uppercase flex items-center gap-x-2">
                    {menu?.name}
                    <div>
                      <img
                        className="h-10 w-10 object-cover"
                        src={`${BASE_URL}${menu?.iconImage}`}
                        alt={menu?.name}
                      />
                    </div>
                  </h2>
                  <div className="mt-7 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {menu?.products?.map((prod, key) => (
                      <div key={key}>
                        <DetailsCard
                          img={`${BASE_URL}${prod?.image}`}
                          title={prod?.name}
                          desc={prod?.description}
                          price={prod?.originalPrice}
                          currencyUnit={data?.data?.currencyUnit || "CHF"}
                          addCart={() => {
                            const formattedTitle = `${prod?.name
                              .toLowerCase()
                              .replace(/\s+/g, "-")}&id=${
                              prod?.RPLinkId
                            }&res=${resId}&mcId=${menu?.r_mcId} `;
                            navigate(`/restaurant-details/${formattedTitle}`);
                            productDetails(prod?.RPLinkId, menu?.r_mcId, data);
                          }}
                          qty={
                            existingCartItems?.find(
                              (ele) => ele?.RPLinkId === prod.RPLinkId
                            )?.quantity
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="mx-auto w-full text-center">
                <figure>
                  <img
                    className="h-96 object-cover mx-auto"
                    src="../images/restaurants/no-data.gif"
                    alt=""
                  />
                </figure>
                <h5 className="text-3xl font-extrabold font-tt">
                  No results found
                </h5>
              </div>
            </>
          )}
        </section>
        <section
          className="w-[94%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6 mx-auto mb-16 pt-8 space-y-6 shadow-custom rounded-md"
          style={{ background: "rgba(32, 33, 37, 0.04)" }}
        >
          <div className="grid lg:grid-cols-6 md:grid-cols-2 gap-y-8">
            <div className="space-y-4 md:border-r lg:col-span-2 lg:px-12 px-8">
              <h4 className="text-paraColor font-switzer max-w-xs capitalize">
                {data?.data?.description}
              </h4>
            </div>
            <div className="space-y-4 lg:border-r lg:px-8 px-8">
              <h4 className="text-black font-switzer font-semibold">Address</h4>
              <ul className="space-y-2">
                <li className="text-xs font-switzer">{data?.data?.location}</li>
                <li className="text-xs font-switzer">
                  <a
                    className="text-blue-400"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps?q=${data?.data?.lat},${data?.data?.lng}`}
                  >
                    See Map
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4 md:border-r lg:col-span-2 lg:px-12 px-8">
              <h4 className="text-black font-switzer font-semibold">
                Delivery times
              </h4>
              <div className="flex justify-between">
                <ul className="space-y-1 w-full">
                  {data?.data?.times
                    ?.sort((a, b) => parseInt(a.day) - parseInt(b.day))
                    ?.map((time, index) => (
                      <li
                        className="text-xs font-switzer capitalize"
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
                        className="text-xs font-switzer text-paraColor text-end"
                        key={index}
                      >
                        {time?.startAt} - {time?.endAt}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            <div className="space-y-2 lg:px-6 px-8">
              <h4 className="font-semibold font-switzer">More information</h4>
              <div className="text-sm text-greenColor font-switzer font-semibold">
                {data?.data?.businessEmail}
              </div>
              <div className="text-sm text-greenColor font-switzer font-semibold">
                Visit website
              </div>
              <p className="text-xs font-switzer text-paraColor">
                Prices include VAT (excluding additional shipping costs that may
                apply).
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute z-40 top-0 rest-footer h-1/5 w-full"></div>
            <div className="h-72 rest-footer">
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
        </section>
      </section>
      <Footer width="w-[94%] lg:w-[95%] largeDesktop:w-[95%] extraLargeDesktop:w-5/6" />
    </>
  );
}
