import React, { useEffect, useRef, useState } from "react";
import { BiX } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Header from "../../components/Header";
import { IoIosArrowDown, IoMdHome } from "react-icons/io";
import { FaBriefcase, FaClock, FaWalking, FaPlus } from "react-icons/fa";
import { FaCirclePlus, FaLocationDot } from "react-icons/fa6";
import GetAPI from "../../utilities/GetAPI";
import { IoIosArrowForward } from "react-icons/io";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useMediaQuery,
} from "@chakra-ui/react";
import { IoArrowBackOutline, IoClose, IoHome } from "react-icons/io5";
import { Autocomplete } from "@react-google-maps/api";
import { MdApartment, MdEditCalendar, MdLocationPin } from "react-icons/md";
import { ImOffice } from "react-icons/im";
import { GrMapLocation } from "react-icons/gr";
import { PostAPI } from "../../utilities/PostAPI";
import { BiCycling } from "react-icons/bi";
import {
  error_toaster,
  info_toaster,
  mini_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import dayjs from "dayjs";
import { inputStyle } from "../../utilities/Input";
import { BsArrowLeft } from "react-icons/bs";
import { DirectionsRenderer, GoogleMap, MarkerF } from "@react-google-maps/api";
import { useTranslation } from "react-i18next";
import CrossIcon from "../../components/CrossIcon";
import BackButtonIcon from "../../components/BackButtonIcon";
import { IoIosLink } from "react-icons/io";
import CustomLinkIcon from "../../components/CustomLinkIcon";
import { WEB_URL } from "../../utilities/URL";
import { FaArrowLeftLong } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import FloatingLabelInput from "./../../components/FloatingLabelInput";
import CustomPlusbtn from "../../components/CustomPlusbtn";
import CustomMenubtn from "../../components/CustomMenubtn";
import {
  getRestaurantOrderAvailability,
  determineButtonStates,
} from "../../utilities/orderConfiguration";

export default function GroupOrder(props) {
  const activeResData = JSON.parse(localStorage.getItem("activeResData"));
  const { slug } = useParams();
  const resId = slug?.split("-").pop();

  function convertToISO(date, time) {
    const [day, month, year] = date.split("-");
    const [hours, minutes] = time?.split(":");
    const [xl] = useMediaQuery("(min-width: 1280px)");
    const [lg] = useMediaQuery("(min-width: 1024px)");
    const [md] = useMediaQuery("(min-width: 768px)");
    const dateTime = dayjs(
      `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`
    );
    const isoDate = dateTime.toISOString();
    return isoDate;
  }

  const urlToFile = async (url, filename, mimeType) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return new File([buffer], filename, { type: mimeType });
  };
  const [showText, setShowText] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowText(true);
    mini_toaster("Copied");
  };
  const { t } = useTranslation();
  const iconOptions = [
    {
      value: "1",
      label: (
        <img
          src="/images/group-order/burger.png"
          className="w-10 h-10 object-contain"
        />
      ),
    },
    {
      value: "2",
      label: (
        <img
          src="/images/group-order/chicken_leg.png"
          className="w-10 h-10 object-contain"
        />
      ),
    },
    {
      value: "3",
      label: (
        <img
          src="/images/group-order/coffee.png"
          className="w-10 h-10 object-contain"
        />
      ),
    },
    {
      value: "4",
      label: (
        <img
          src="/images/group-order/noodles.png"
          className="w-10 h-10 object-contain"
        />
      ),
    },
    {
      value: "5",
      label: (
        <img
          src="/images/group-order/salad.png"
          className="w-10 h-10 object-contain"
        />
      ),
    },
    {
      value: "6",
      label: (
        <img
          src="/images/group-order/sandwich.png"
          className="w-10 h-10 object-contain"
        />
      ),
    },
    {
      value: "7",
      label: (
        <img
          src="/images/group-order/sushi.png"
          className="w-10 h-10 object-contain"
        />
      ),
    },
    {
      value: "8",
      label: (
        <img
          src="/images/group-order/taco.png"
          className="w-10 h-10 object-contain"
        />
      ),
    },
    {
      value: "9",
      label: (
        <img
          src="/images/group-order/donut.png"
          className="w-10 h-10 object-contain"
        />
      ),
    },
  ];

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      display: "flex",
      flexWrap: "wrap",
      width: "230px",
      padding: "12px",
      boxShadow:
        "0px 2px 8px 0px #0000001f, 0px 1px 2px 0px #0000001f, 0px 0px 1px 0px #0000001f;",
    }),
    option: (provided, { isFocused, isSelected }) => ({
      ...provided,
      display: "inline-flex",
      justifyContent: "center",
      width: "40px",
      backgroundColor: isSelected ? "" : isFocused ? "#f1f1f1" : "white",
      color: isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: "#f1f1f1",
      },
      borderRadius: "8px",
      padding: "0px 8px",
    }),
    control: (base, state) => ({
      ...base,
      borderRadius: "8px",
      border: state.isFocused ? "2px solid green" : "2px solid #E4E4E5",
      boxShadow: state.isFocused ? "0 0 0 0px green" : "none",
      padding: "4px 6px",
      "&:hover": {
        borderColor: "green",
        cursor: "pointer",
      },
      display: "flex",
      justifyContent: "center",
    }),
    singleValue: (provided) => ({
      ...provided,
      marginLeft: 0,
      paddingLeft: 0,
      display: "flex",
      alignItems: "center",
      width: "24px",
      height: "24px",
    }),
    input: (provided) => ({
      ...provided,
      caretColor: "transparent",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "rgba(32, 33, 37, 0.8)",
      "& svg": {
        width: "24px",
        height: "24px",
      },
    }),
  };

  const navigate = useNavigate();
  const { data } = GetAPI("users/getCountriesAndCities");
  const getAllAddressess = GetAPI("users/alladdresses");

  let preAddress = getAllAddressess?.data?.data?.addressList?.find(
    (ele) =>
      ele.lat === localStorage.getItem("lat") &&
      ele.lng === localStorage.getItem("lng")
  );

  const [link, setLink] = useState("");
  link ? localStorage.setItem("gLink", link) : "";
  const [groupOrderStep, setGroupOrderStep] = useState(1);
  //   const [addressModal, setAddressModal] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [addressTab, setAddressTab] = useState(0);
  const [modalScroll, setModalScroll] = useState(0);
  const [modal, setModal] = useState(false);
  const [days, setDays] = useState([]);
  const [timeChunks, setTimeChunks] = useState([]);
  const [groupOrder, setGroupOrder] = useState({
    groupName: localStorage.getItem("userName") + " " + "and friends",
    groupIcon: new File([], "icon-2.webp", {
      type: "image/webp",
      lastModified: Date.now(),
    }),
    groupShow: iconOptions[0],
  });
  console.log("🚀 ~ GroupOrder ~ groupOrder:", groupOrder);
  const [currentPosition, setCurrentPosition] = useState({
    lat: 0,
    lng: 0,
  });
  const [hasPositionChanged, setHasPositionChanged] = useState(false);
  const [schedule, setSchedule] = useState({
    day: "",
    time: "",
    date: "",
  });
  const [country, setCountry] = useState({
    countries: {
      value: "",
      label: localStorage.getItem("countryName"),
      short: localStorage.getItem("countryShortName"),
    },
    selectedCountryShortName: localStorage.getItem("countryShortName"),
  });
  const [deliveryCharges, setDeliveryCharges] = useState({
    distance: "",
    distanceUnit: "",
    currencyUnit: "",
    packingFee: "",
    deliveryCharges: "",
    serviceCharges: "",
    VAT: "",
  });
  const [deliveryData, setDeliveryData] = useState({
    how: 1,
    where: 1,
    when: 1,
    howShow: false,
    whereShow: false,
    whenShow: false,
    schedule: "",
  });
  console.log("🚀 ~  ~ deliveryData:", deliveryData);
  const [deliveryAddress, setDeliveryAddress] = useState({
    id: "",
    lat: "",
    lng: "",
    building: "",
    city: "",
    AddressType: "",
    locationType: "",
    state: "",
    streetAddress: "",
    zipCode: "",
    entrance: "",
    door: "",
    instructions: "",
    other: false,
  });
  const [currentCoordinates, setCurrentCoordinates] = useState({
    lat: "",
    lng: "",
  });

  const getCountries = [];
  data?.data?.countries?.map((countr, index) => {
    return getCountries.push({
      value: countr?.id,
      label: countr?.name,
      short: countr?.shortName,
    });
  });

  const closeAddressModal = () => {
    setAddressModal(false);
    setModalScroll(0);
    setAddressTab(0);
    setCountry({
      countries: {
        value: "",
        label: localStorage.getItem("countryName"),
        short: localStorage.getItem("countryShortName"),
      },
      selectedCountryShortName: localStorage.getItem("countryShortName"),
    });
    setDeliveryAddress({
      id: "",
      lat: "",
      lng: "",
      building: "",
      city: "",
      AddressType: "",
      locationType: "",
      state: "",
      streetAddress: "",
      zipCode: "",
      entrance: "",
      door: "",
      instructions: "",
    });
  };

  const normalizeTimeFormat = (time) => {
    return time.toLowerCase().replace("am", " AM").replace("pm", " PM");
  };

  const generateTimeChunks = (startTime, endTime, date) => {
    const currentDate = dayjs(date, "DD-MM-YYYY");
    const now = dayjs();
    const start = currentDate
      .hour(dayjs(normalizeTimeFormat(startTime.trim()), "h:mm").hour())
      .minute(dayjs(normalizeTimeFormat(startTime.trim()), "h:mm").minute())
      .second(0);
    const end = currentDate
      .hour(dayjs(normalizeTimeFormat(endTime.trim()), "h:mm").hour())
      .minute(dayjs(normalizeTimeFormat(endTime.trim()), "h:mm").minute())
      .second(0);
    let currentTime;
    if (currentDate.isSame(now, "day")) {
      const roundedMinutes = Math.ceil(now.minute() / 5) * 5;
      currentTime = now.minute(roundedMinutes).second(0);
      if (currentTime.isBefore(now)) {
        currentTime = currentTime.add(5, "minute");
      }
      if (currentTime.isBefore(start)) {
        currentTime = start;
      }
    } else {
      currentTime = start;
    }
    const times = [];
    let index = 1;
    let time = currentTime.isBefore(start) ? start : currentTime;
    while (time.isBefore(end) || time.isSame(end)) {
      times.push({ label: time.format("HH:mm"), value: index.toString() });
      time = time.add(5, "minute");
      index++;
    }
    if (time.isBefore(end.add(5, "minute"))) {
      times.push({ label: end.format("HH:mm"), value: index.toString() });
    }
    setTimeChunks(times);
  };

  const handleModalScroll = (event) => {
    setModalScroll(event.target.scrollTop);
  };

  const countriesRestriction = {
    componentRestrictions: { country: [`${country.selectedCountryShortName}`] },
  };

  const autocompleteRef = useRef(null);
  const getAddress = async () => {
    if (!autocompleteRef.current) {
      return null;
    }
    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry || !place.geometry.location) {
      info_toaster("Please search an address");
      return;
    }
    const latLng = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setDeliveryAddress({
      ...deliveryAddress,
      streetAddress: place?.formatted_address,
      city: place?.address_components[place?.address_components?.length - 3]
        ?.long_name,
      state:
        place?.address_components[place?.address_components?.length - 2]
          ?.long_name,
      building: place?.name,
      lat: latLng?.lat,
      lng: latLng?.lng,
    });
    setAddressTab(2);
    return null;
  };

  const calculateRoute = async () => {
    let res = await PostAPI("users/deliveryfee", {
      restaurantId: parseInt(localStorage.getItem("resId")),
      dropOffLat: parseFloat(deliveryAddress?.lat),
      dropOffLng: parseFloat(deliveryAddress?.lng),
      total: 0,
    });
    if (res?.data?.status === "1") {
      setDeliveryCharges({
        ...deliveryCharges,
        distance: res?.data?.data?.distance,
        distanceUnit: res?.data?.data?.distanceUnit,
        currencyUnit: res?.data?.data?.currencyUnit,
        packingFee: res?.data?.data?.packingFee,
        deliveryCharges: res?.data?.data?.deliveryCharges,
        serviceCharges: res?.data?.data?.serviceCharges,
        VAT: res?.data?.data?.VAT,
      });
    } else {
      error_toaster(res?.data?.message);
    }
  };

  const handleAddAddress = async () => {
    if (deliveryAddress.entrance === "") {
      info_toaster("Please enter Entrance/Staircase");
    } else if (deliveryAddress.door === "") {
      info_toaster("Please enter Name/No on Door");
    } else if (deliveryAddress.AddressType === "") {
      info_toaster("Please select Address Label");
    } else {
      let res = await PostAPI("users/addaddress", {
        building: deliveryAddress.building,
        streetAddress: deliveryAddress?.streetAddress,
        city: deliveryAddress?.city,
        state: deliveryAddress?.state,
        zipCode: "",
        addressTypeId: "1",
        addressTypeText: deliveryAddress?.locationType,
        lat: deliveryAddress?.lat,
        lng: deliveryAddress?.lng,
        saveAddress: true,
        otherText: deliveryAddress?.instructions,
        nameOnDoor: deliveryAddress?.door,
        floor: "",
        entrance: deliveryAddress?.entrance,
        deliveryLocation: "",
        locationType: deliveryAddress?.locationType,
        AddressType: deliveryAddress?.AddressType,
        note: deliveryAddress?.instructions,
      });
      if (res?.data?.status === "1") {
        setAddressTab(0);
        setAddressModal(false);
        success_toaster(res?.data?.message);
        getAllAddressess.reFetch();
      } else {
        error_toaster(res?.data?.message);
      }
    }
  };

  const groupStepOneFunc = () => {
    if (groupOrder.groupName === "") {
      info_toaster("Please enter Group Name");
    } else if (groupOrder.groupIcon === "") {
      info_toaster("Please select Group Icon");
    } else {
      localStorage.setItem("how", 1);
      localStorage.setItem("when", 1);

      setGroupOrderStep(2);
    }
  };

  const createGroupOrder = async (e) => {
    localStorage.removeItem("cartItems");
    e.preventDefault();
    if (deliveryData.how === 1 && deliveryAddress.id === "") {
      info_toaster("Please select Delivery Address");
    } else if (deliveryData.when === 2 && schedule.date === "") {
      info_toaster("Please select Schedule Day");
    } else if (deliveryData.when === 2 && schedule.time === "") {
      info_toaster("Please select Schedule Time");
    } else {
      setDisabled(true);
      const formData = new FormData();
      formData.append("groupName", groupOrder.groupName);
      formData.append("icon", groupOrder.groupIcon);
      formData.append(
        "scheduleDate",
        deliveryData.when === 1
          ? new Date().toISOString()
          : convertToISO(schedule.date, schedule.time.label)
      );
      formData.append("deliveryTypeId", deliveryData?.how);
      formData.append("orderModeId", deliveryData?.when);
      formData.append("paymentMethodId", 1);
      formData.append("restaurantId", parseInt(localStorage.getItem("resId")));
      formData.append("distance", parseFloat(deliveryCharges?.distance) || 0);
      formData.append("streetAddress", deliveryAddress?.streetAddress);
      formData.append(
        "dropOffLat",
        deliveryData?.how === 1
          ? parseFloat(deliveryAddress?.lat)
          : currentCoordinates.lat
      );
      formData.append(
        "dropOffLng",
        deliveryData?.how === 1
          ? parseFloat(deliveryAddress?.lng)
          : currentCoordinates.lng
      );
      formData.append("building", deliveryAddress?.building);
      formData.append(
        "deliveryFees",
        deliveryCharges?.deliveryCharges !== ""
          ? parseInt(deliveryCharges?.deliveryCharges)
          : 0
      );
      formData.append(
        "serviceCharges",
        deliveryCharges?.serviceCharges !== ""
          ? parseInt(deliveryCharges?.serviceCharges)
          : 0
      );
      formData.append("subTotal", 0);
      formData.append("VAT", parseInt(deliveryCharges?.VAT));
      formData.append("tip", 0);
      formData.append("total", 0);
      let res = await PostAPI("users/createGroup", formData);
      localStorage.setItem("groupData", JSON.stringify(res?.data?.data));
      if (res?.data?.status === "1") {
        setLink(
          `${WEB_URL}group-order?id=${res?.data?.data?.orderId}&hid=${res?.data?.data?.hostedById}`
          //   `http://localhost:5173/group-order?id=${res?.data?.data?.orderId}&hid=${res?.data?.data?.hostedById}`
        );
        setGroupOrderStep(3);
        success_toaster(res?.data?.message);
        setDisabled(false);
      } else {
        error_toaster(res?.data?.message);
        setDisabled(false);
      }
    }
  };

  const handleGroupOrderClick = () => {
    const pathSegments = location.pathname.split("/");
    const countryCode = pathSegments[1];
    const groupId = JSON.parse(localStorage.getItem("groupData"))?.orderId;
    if (countryCode && groupId) {
      console.log("helo");
      navigate(`/${countryCode}/group-order/${groupId}/venue`);
    } else {
      console.warn("Required information missing: countryCode or groupId");
    }
  };
  useEffect(() => {
    if (deliveryAddress?.lat && deliveryAddress?.lng) {
      setCurrentPosition({
        lat: deliveryAddress.lat,
        lng: deliveryAddress.lng,
      });
    }
  }, [deliveryAddress]);
  const handleDragEnd = () => {
    const newCenter = mapRef.current.getCenter();
    setCurrentPosition({
      lat: newCenter.lat(),
      lng: newCenter.lng(),
    });
    setHasPositionChanged(true);
  };

  const mapRef = useRef(null);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  useEffect(() => {
    // if (JSON.parse(localStorage.getItem("cartItems"))?.length === 0) {
    //   navigate("/");
    // }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentCoordinates({
            ...currentCoordinates,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    const today = new Date();
    const dayNames = [];
    const getDayName = (date) => {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    };
    const getLabel = (index) => {
      if (index === 0) return "Today";
      if (index === 1) return "Tomorrow";
      return getDayName(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + index)
      );
    };
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      dayNames.push({
        value: getDayName(currentDate),
        label: getLabel(i),
      });
    }
    setDays(dayNames);

    if (localStorage.getItem("how") || localStorage.getItem("when")) {
      setDeliveryData({
        ...deliveryData,
        how: parseInt(localStorage.getItem("how")) ?? 1,
        when: parseInt(localStorage.getItem("when")) ?? 1,
      });
    }
  }, []);

  useEffect(() => {
    if (preAddress && deliveryData.how === 1) {
      setDeliveryAddress({
        ...deliveryAddress,
        id: preAddress?.id,
        lat: preAddress?.lat,
        lng: preAddress?.lng,
        building: preAddress?.building,
        city: preAddress?.city,
        AddressType: preAddress?.AddressType,
        locationType: preAddress?.locationType,
        state: preAddress?.state,
        streetAddress: preAddress?.streetAddress,
        zipCode: preAddress?.zipCode,
        instructions: preAddress?.note,
      });
      calculateRoute();
    }
  }, [preAddress]);
  const [addressModal, setAddressModal] = useState(false);

  const [availability, setAvailability] = useState({});
  const prevHowRef = useRef(null);
  const [buttonStates, setButtonStates] = useState({
    disableDelivery: true,
    disablePickup: true,
    disableStandard: true,
    disableSchedule: true,
  });
  useEffect(() => {
    if (!activeResData) return;

    const availability = getRestaurantOrderAvailability(activeResData);
    const disableDelivery = !(
      availability.canDeliverStandard || availability.canDeliverSchedule
    );
    const disablePickup = !(
      availability.canPickupStandard || availability.canPickupSchedule
    );

    const disableStandard =
      deliveryData.how === 1
        ? !availability.canDeliverStandard
        : !availability.canPickupStandard;

    const disableSchedule =
      deliveryData.how === 1
        ? !availability.canDeliverSchedule
        : !availability.canPickupSchedule;

    setAvailability(availability);
    setButtonStates({
      disableDelivery,
      disablePickup,
      disableStandard,
      disableSchedule,
    });
    if (props?.updateButtonStates) {
      props?.updateButtonStates({
        disableDelivery,
        disablePickup,
        disableStandard,
        disableSchedule,
      });
    }
    // const previousHow = prevHowRef.current;
    // if (previousHow !== deliveryData.how && !disableStandard) {
    //   setDeliveryData((prev) => ({ ...prev, type: 1, when: 1 }));
    //   localStorage.setItem("when", "1");
    // }
    // prevHowRef.current = deliveryData.how;
    if (disableDelivery && !disablePickup && deliveryData.how === 1) {
      setDeliveryData((prev) => ({ ...prev, how: 2 }));
    }

    if (disableStandard && !disableSchedule && deliveryData.type === 1) {
      setDeliveryData((prev) => ({ ...prev, type: 2 }));
    }
    if (disableStandard && !disableSchedule && deliveryData.when === 1) {
      setDeliveryData((prev) => ({ ...prev, when: 2 }));
      localStorage.setItem("when", "2");
    }
  }, [deliveryData.how, deliveryData.when, deliveryData.type]);

  return (
    <>
      <Modal
        onClose={closeAddressModal}
        isOpen={addressModal}
        isCentered
        className="modal-custom"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          maxW={["510px", "510px", "600px"]}
          className="modal-content-custom"
        >
          <ModalHeader
            px={4}
            boxShadow={
              modalScroll > 10 ? "0px 4px 10px rgba(0, 0, 0, 0.1) " : "none"
            }
            borderBottom={
              modalScroll > 10 ? "1px solid rgba(0, 0, 0, 0.1) " : "none"
            }
          >
            <div className="flex justify-between">
              <button
                onClick={() => {
                  if (addressTab === 1) {
                    setAddressTab(0);
                  } else if (addressTab === 2) {
                    setAddressTab(1);
                  } else if (addressTab === 3) {
                    setAddressTab(2);
                  } else if (addressTab === 4) {
                    setAddressTab(3);
                  } else if (addressTab === 5) {
                    setAddressTab(0);
                  } else if (addressTab === 6) {
                    setAddressTab(5);
                  }
                  setHasPositionChanged(false);
                }}
                className={`flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16 ${
                  addressTab === 0 ? "invisible" : "visible"
                }`}
              >
                <FaArrowLeftLong size={20} />
              </button>
              <motion.div
                className="text-base font-medium text-center pt-2 capitalize text-ellipsis ellipsis4 text-theme-black-2"
                initial={{ opacity: 1, y: "-1rem" }} // Start from above and invisible
                animate={{
                  opacity: modalScroll > 10 ? 1 : 0, // Fade out on scroll down, fade in on scroll up
                  y: modalScroll > 10 ? 0 : "-1rem", // Move up on scroll down, move to center on scroll up
                }}
                transition={{
                  duration: 0.2, // Adjust the transition speed
                  delay: 0, // Add a delay of 0.2 seconds
                }}
              >
                {addressTab === 4
                  ? `${deliveryAddress.building}`
                  : addressTab === 0
                  ? t("Where to?")
                  : addressTab === 5
                  ? ` Fomino Cities in ${localStorage.getItem("countryName")}`
                  : t("Add New Address")}
              </motion.div>

              <div
                onClick={closeAddressModal}
                className="flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
              >
                <IoClose size={30} />
              </div>
            </div>
          </ModalHeader>
          <ModalBody padding={0}>
            <div
              onScroll={handleModalScroll}
              className="max-h-[calc(100vh-150px)] extraLargeDesktop:max-h-[calc(100vh-250px)] ultraLargeDesktop:max-h-[calc(100vh-56vh)] h-auto overflow-auto custom-scrollbar"
              //   style={
              //     md ? { maxHeight: addressModalHeight, height: "auto" } : {}
              //   }
            >
              {addressTab === 0 ? (
                <div className="">
                  <div className="space-y-4 px-4 ">
                    <h4 className="text-3xl text-theme-black-2 font-omnes font-bold ">
                      {t("Where to?")}
                    </h4>
                    {getAllAddressess?.data?.data?.addressList
                      ?.filter(
                        (fil) =>
                          fil.AddressType &&
                          fil.AddressType?.toString().length > 0
                      )
                      ?.map((addr, index) => (
                        <>
                          <div
                            key={index}
                            className="flex items-center gap-x-4"
                          >
                            <button className="flex justify-center items-center text-end outline-none w-8 h-12 flex-shrink-0 ">
                              {addr?.AddressType === "Home" ? (
                                <IoHome
                                  size={28}
                                  className={`${
                                    addr?.lat === localStorage.getItem("lat") &&
                                    addr?.lng === localStorage.getItem("lng")
                                      ? "text-theme-green-2"
                                      : "text-theme-black-2"
                                  }`}
                                />
                              ) : addr?.AddressType === "Work" ? (
                                <ImOffice
                                  size={24}
                                  className={`${
                                    addr?.lat === localStorage.getItem("lat") &&
                                    addr?.lng === localStorage.getItem("lng")
                                      ? "text-theme-green-2"
                                      : "text-theme-black-2"
                                  }`}
                                />
                              ) : addr?.AddressType === "Other" ? (
                                <MdEditCalendar
                                  size={24}
                                  className={`${
                                    addr?.lat === localStorage.getItem("lat") &&
                                    addr?.lng === localStorage.getItem("lng")
                                      ? "text-theme-green-2"
                                      : "text-theme-black-2"
                                  }`}
                                />
                              ) : (
                                <></>
                              )}
                            </button>
                            <div className="flex justify-between gap-x-5 items-center w-full ">
                              <div className="flex flex-col">
                                <p
                                  className={`text-base font-medium font-sf text-theme-black-2 ${
                                    addr?.lat === localStorage.getItem("lat") &&
                                    addr?.lng === localStorage.getItem("lng")
                                      ? "text-theme-green-2"
                                      : "text-theme-black-2"
                                  }`}
                                >
                                  {addr?.AddressType}
                                </p>
                                <div className="text-sm font-normal text-black text-opacity-40 font-sf ellipsis6">
                                  {`${addr?.building}, ${addr?.streetAddress}`}
                                </div>
                              </div>
                              {addr?.lat !== localStorage.getItem("lat") &&
                              addr?.lng !== localStorage.getItem("lng") ? (
                                <button
                                  onClick={() => {
                                    localStorage.setItem("lat", addr?.lat);
                                    localStorage.setItem("lng", addr?.lng);
                                    localStorage.setItem(
                                      "guestFormatAddress",
                                      `${addr?.AddressType} (${addr?.building})`
                                    );
                                    navigate(
                                      `${location.pathname}/${location.search}`
                                    );
                                    setAddressModal(false);
                                  }}
                                  className=" bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-[11px] px-4 font-medium"
                                >
                                  {t("Choose")}
                                </button>
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                          <hr className="max-w-[32.7rem] ms-auto" />
                        </>
                      ))}
                  </div>

                  <div className="font-medium text-base text-theme-black-2  font-sf my-5 ps-5 ">
                    <button
                      onClick={() => setAddressTab(1)}
                      className="flex items-center gap-x-7"
                    >
                      <CustomPlusbtn color="#202125" />
                      <span>{t("Add new address")}</span>
                    </button>
                  </div>
                </div>
              ) : addressTab === 1 ? (
                <div className="px-4">
                  <div className="space-y-2">
                    <h4 className="capitalize text-3xl text-theme-black-2  font-omnes font-bold mb-5">
                      {t("Add New Address")}
                    </h4>
                    <Select
                      value={country?.countries || null}
                      onChange={(e) => {
                        setCountry({
                          ...country,
                          countries: e,
                          selectedCountryShortName: e.short,
                        });
                      }}
                      options={getCountries}
                      inputId="countries"
                      placeholder="Country"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: "8px",
                          border: state.isFocused
                            ? "2px solid green-700"
                            : "2px solid #E4E4E5",
                          borderColor: state.isFocused
                            ? "green-700"
                            : "#E4E4E5",
                          boxShadow: state.isFocused
                            ? "0 0 0 1px green"
                            : "none",
                          padding: "6px 6px",
                          "&:hover": {
                            borderColor: "green",

                            cursor: "pointer",
                          },
                        }),
                      }}
                      className="rounded-xl font-sf"
                    />
                    <Autocomplete
                      onLoad={(autocomplete) =>
                        (autocompleteRef.current = autocomplete)
                      }
                      options={countriesRestriction}
                    >
                      <FloatingLabelInput placeholder="Enter a location" />
                    </Autocomplete>
                  </div>
                  <div>
                    <button
                      onClick={() => getAddress()}
                      className="font-sf font-semibold mt-2 my-5 py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red "
                    >
                      {t("Continue")}
                    </button>
                  </div>
                  <div className=" w-full h-full ">
                    <img
                      className="w-full h-full mx-auto  object-cover"
                      src="/images/addAddress.gif"
                      alt="address"
                    />
                  </div>
                </div>
              ) : addressTab === 2 ? (
                <div className="px-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="capitalize text-3xl text-theme-black-2 font-bold font-omnes  mb-5">
                        What kind of location is this?
                      </h4>
                      <p className="text-base font-sf font-normal text-theme-black-2 text-opacity-60">
                        Help us find you faster by identifying the type of
                        location this is.
                      </p>
                    </div>
                    <div className="flex items-center gap-x-3 font-sf">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 ">
                        <IoHome size={28} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base font-medium text-theme-black-2">
                          House
                        </p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "House",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-medium font-sf"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-4">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 ">
                        <MdApartment size={28} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base font-medium text-theme-black-2">
                          Apartment
                        </p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "Apartment",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-medium"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-4">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0">
                        <ImOffice size={24} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base font-medium text-theme-black-2">
                          Office
                        </p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "Office",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-medium"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-4">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0">
                        <MdEditCalendar size={24} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base font-medium text-theme-black-2">
                          Others
                        </p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "Others",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-medium"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                  </div>
                </div>
              ) : addressTab === 3 ? (
                <div className="px-4">
                  <div className="space-y-4 pb-14">
                    <div>
                      <h4 className="capitalize text-3xl text-black font-bold font-omnes mb-4 ">
                        Address details
                      </h4>
                      <p className="text-base font-sf font-normal text-theme-black-2 text-opacity-60 ">
                        Giving exact address details helps us deliver your order
                        faster.
                      </p>
                    </div>
                    <div>
                      <h4 className="capitalize text-xl text-theme-black-2 font-semibold font-omnes mb-3">
                        Address
                      </h4>
                      <p className="text-base font-medium text-theme-black-2 mb-2">
                        {`${deliveryAddress.building} `}
                      </p>
                      <p className="text-sm font-normal text-theme-black-2 text-opacity-60">
                        {`${deliveryAddress.streetAddress}`}
                      </p>
                    </div>
                    <div className="space-y-2 font-sf text-theme-black-2">
                      <div>
                        <select
                          value={deliveryAddress.locationType}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: e.target.value,
                            })
                          }
                          className={inputStyle}
                        >
                          <option value="House">House</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Office">Office</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>

                      <div>
                        <FloatingLabelInput
                          id="entrance"
                          type="text"
                          name="entrance"
                          value={deliveryAddress.entrance}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              entrance: e.target.value,
                            })
                          }
                          placeholder="Entrance / Staircase"
                        />
                      </div>
                      <div>
                        <FloatingLabelInput
                          id="door"
                          type="text"
                          name="door"
                          value={deliveryAddress?.door}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              door: e.target.value,
                            })
                          }
                          placeholder="Name / No on Door"
                        />
                      </div>
                      <div>
                        <FloatingLabelInput
                          id="instructions"
                          type="text"
                          name="instructions"
                          value={deliveryAddress?.instructions}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              instructions: e.target.value,
                            })
                          }
                          placeholder="Other instructions for the courier"
                        />
                        <p className="text-xs text-black text-opacity-50 ml-3 mt-2">
                          Optional
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="capitalize text-xl text-theme-black-2 font-semibold font-omnes mb-3">
                        Address location
                      </h4>
                      <p className="text-base font-normal text-theme-black-2 text-opacity-50">
                        Pinpointing your exact location on the map helps us find
                        you fast.
                      </p>
                    </div>
                    {hasPositionChanged && (
                      <div className="h-36 rest-footer overflow-hidden sm:rounded-b-[20px] md:rounded-lg relative">
                        <GoogleMap
                          zoom={14}
                          center={currentPosition}
                          mapContainerStyle={{
                            width: "100%",
                            height: "100%",
                          }}
                          options={{
                            disableDefaultUI: true,
                            draggable: false,
                            scrollwheel: false,
                            disableDoubleClickZoom: true,
                            zoomControl: false,
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              zIndex: 1,
                            }}
                            className="customMarkF"
                          >
                            <img
                              src="/images/pin-location.svg"
                              alt="Fixed Marker"
                            />
                          </div>
                        </GoogleMap>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setAddressTab(4);
                      }}
                      className="font-sf flex items-center justify-center gap-x-3 text-[#E13743] bg-theme-red-2 bg-opacity-15  font-medium w-full rounded-lg px-3 py-[15px]"
                    >
                      <GrMapLocation />
                      {hasPositionChanged
                        ? "Edit tmeeting point on the map"
                        : "Add a meeting point on the map"}
                    </button>
                    <div className="space-y-1">
                      <h4 className="capitalize text-xl text-theme-black-2 font-semibold font-omnes ">
                        Address label
                      </h4>
                      <p className="text-base font-normal text-theme-black-2 text-opacity-50">
                        Labelling addresses helps you to choose between them.
                      </p>
                      <div className="pt-3 grid grid-cols-3 gap-3 font-sf">
                        <button
                          onClick={() =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              AddressType: "Home",
                              other: false,
                            })
                          }
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded-lg border ${
                            deliveryAddress.AddressType === "Home"
                              ? "border-green-700 text-green-700"
                              : "border-black border-opacity-20 text-black text-opacity-60"
                          }`}
                        >
                          <IoHome size={24} />
                          <span className="font-normal text-xl">Home</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              AddressType: "Work",
                              other: false,
                            })
                          }
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded-lg border ${
                            deliveryAddress.AddressType === "Work"
                              ? "border-green-700 text-green-700"
                              : "border-black border-opacity-20 text-black text-opacity-60"
                          }`}
                        >
                          <FaBriefcase size={24} />
                          <span className="font-normal text-xl">Work</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              AddressType: "Other",
                              other: true,
                            })
                          }
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded-lg border ${
                            deliveryAddress.AddressType === "Other"
                              ? "border-green-700 text-green-700"
                              : "border-black border-opacity-20 text-black text-opacity-60"
                          }`}
                        >
                          <MdLocationPin size={24} />
                          <span className="font-normal text-xl">Other</span>
                        </button>
                      </div>
                      {deliveryAddress.other ? (
                        <div className="pt-2">
                          <input
                            value={deliveryAddress?.AddressType}
                            onChange={(e) =>
                              setDeliveryAddress({
                                ...deliveryAddress,
                                AddressType: e.target.value,
                              })
                            }
                            type="text"
                            placeholder="Name"
                            className={inputStyle}
                          />
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 font-sf font-semibold mt-5 py-[14px] px-5 w-[95%] bg-theme-red hover:bg-opacity-95 text-white shadow-md text-base rounded-lg border border-theme-red"
                      onClick={handleAddAddress}
                    >
                      Save address
                    </button>
                  </div>
                </div>
              ) : addressTab === 4 ? (
                <div className="h-[calc(100vh-400px)] rest-footer overflow-hidden sm:rounded-b-[20px] md:rounded-b-[20px] relative">
                  <GoogleMap
                    zoom={14}
                    center={currentPosition}
                    mapContainerStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                    options={{
                      disableDefaultUI: true,
                    }}
                    onDragEnd={handleDragEnd}
                    onLoad={handleMapLoad}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                      }}
                      className="customMarkF"
                    >
                      <img src="/images/pin-location.svg" alt="Fixed Marker" />
                    </div>
                  </GoogleMap>
                  <button
                    className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[95%] font-semibold text-base py-4 px-5 bg-theme-red hover:bg-opacity-95 text-white rounded-lg"
                    onClick={() => {
                      setAddressTab(3);
                    }}
                  >
                    {t("Continue")}
                  </button>
                </div>
              ) : addressTab === 5 ? (
                <div className="md:max-h-screen-minus-5vh ultraLargeDesktop:max-h-screen-minus-40vh max-h-screen-minus-9vh h-auto">
                  <div className="space-y-4  px-4">
                    <h4 className="text-3xl text-theme-black-2 font-omnes font-bold ">
                      Fomino in {localStorage.getItem("countryName")}
                    </h4>
                    {filteredCities.length === 0 ? (
                      <p className="font-sf text-theme-black-2   !mb-4">
                        There is no city
                      </p>
                    ) : (
                      filteredCities.map((city, index) => (
                        <div key={index} className="">
                          <div className="flex items-center gap-x-4 w-full pb-4">
                            <button className="flex justify-center items-center text-end outline-none w-8 h-12 flex-shrink-0 ">
                              <CustomHomeIcon size={24} />
                            </button>
                            <div className="flex justify-between gap-x-5 items-center w-full">
                              <div>
                                <p
                                  className={`text-base font-medium font-sf text-theme-black-2 ${
                                    city?.lat === localStorage.getItem("lat") &&
                                    city?.lng === localStorage.getItem("lng")
                                      ? "text-theme-green-2"
                                      : "text-theme-black-2"
                                  }`}
                                >
                                  {city.name}
                                </p>
                              </div>
                              {city?.lat !== localStorage.getItem("lat") ||
                              city?.lng !== localStorage.getItem("lng") ? (
                                <button
                                  onClick={() => {
                                    localStorage.setItem("lat", city?.lat);
                                    localStorage.setItem("lng", city?.lng);

                                    localStorage.setItem(
                                      "selectedCity",
                                      city?.name
                                    );
                                    localStorage.setItem(
                                      "guestFormatAddress",
                                      `${city?.name}`
                                    );
                                    navigate(
                                      `${location.pathname.replace(
                                        cityName,
                                        city?.name
                                      )}/${location.search}`
                                    );
                                    setAddressModal(false);
                                    setAddressTab(0);
                                  }}
                                  className=" bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-[11px] px-4 font-medium"
                                >
                                  {t("Choose")}
                                </button>
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                          {index !== filteredCities.length - 1 && (
                            <hr className="max-w-[32.3rem] ms-auto" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <hr />
                  <div className="font-medium text-base text-theme-black-2  font-sf my-5 ps-4">
                    <button
                      onClick={() => setAddressTab(6)}
                      className="flex items-center gap-x-7"
                    >
                      <CustomMenubtn color="#202125" />

                      <span>{t("Browse all fomino Countries")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="">
                  <div className="space-y-4  px-4">
                    <h4 className="text-3xl text-theme-black-2 font-omnes font-bold ">
                      Fomino Countries
                    </h4>
                    {getcountr?.data?.data?.countries.map((countr, index) => (
                      <div key={index} className="">
                        <div className="flex items-center gap-x-4 w-full pb-4">
                          <button className="flex justify-center items-center text-end outline-none w-8 h-12 flex-shrink-0 ">
                            <ReactCountryFlag
                              countryCode={
                                countr.shortName === "UK"
                                  ? "GB"
                                  : countr.shortName
                              }
                              className="text-2xl  rounded shadow-tabShadow !h-auto"
                              svg
                            />
                          </button>
                          <div className="flex justify-between gap-x-5 items-center w-full">
                            <div>
                              <p
                                className={`text-base font-medium font-sf text-theme-black-2 ${
                                  countr?.lat === localStorage.getItem("lat") &&
                                  countr?.lng === localStorage.getItem("lng")
                                    ? "text-theme-green-2"
                                    : "text-theme-black-2"
                                }`}
                              >
                                {countr.name}
                              </p>
                            </div>
                            {countr?.lat !== localStorage.getItem("lat") ||
                            countr?.lng !== localStorage.getItem("lng") ? (
                              <button
                                onClick={() => {
                                  localStorage.setItem(
                                    "countryShortName",
                                    countr.shortName
                                  );
                                  localStorage.setItem(
                                    "countryName",
                                    countr.name
                                  );
                                  setAddressTab(5);
                                }}
                                className="bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-[11px] px-4 font-medium"
                              >
                                {t("Choose")}
                              </button>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                        {index !== filteredCities.length - 1 && (
                          <hr className="max-w-[32.7rem] ms-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>

          {addressTab !== 4 && <ModalFooter></ModalFooter>}
        </ModalContent>
      </Modal>

      {/* <Modal
        onClose={closeAddressModal}
        isOpen={addressModal}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius={"20px"}
          maxW={["480px", "480px", "550px"]}
          className="modal-content-custom"
        >
          <ModalHeader>
            <div className="flex justify-between">
              <button
                onClick={() =>
                  addressTab === 1
                    ? closeAddressModal()
                    : addressTab === 2
                    ? setAddressTab(1)
                    : addressTab === 3
                    ? setAddressTab(2)
                    : addressTab === 4
                    ? setAddressTab(3)
                    : ""
                }
                className={`flex justify-center items-center text-end rounded-fullest w-8 h-8 bg-theme-gray-4`}
              >
                <IoArrowBackOutline />
              </button>
              <h3
                className={`${
                  modalScroll > 28 ? "block" : "hidden"
                } text-base text-center capitalize font-tt font-black`}
              >
                Add New Address
              </h3>
              <div
                onClick={closeAddressModal}
                className="flex justify-center items-center text-end rounded-fullest cursor-pointer w-8 h-8 bg-[#F4F5FA]"
              >
                <IoClose />
              </div>
            </div>
          </ModalHeader>
          <ModalBody padding={0}>
            <div
              onScroll={handleModalScroll}
              className="max-h-[calc(100vh-200px)] h-auto overflow-auto  font-sf "
            >
              {addressTab === 1 ? (
                <div className="px-6">
                  <div className="space-y-5">
                    <h4 className="capitalize text-2xl text-black font-black font-tt ">
                      Add New Address
                    </h4>
                    <Select
                      value={country?.countries}
                      onChange={(e) => {
                        setCountry({
                          ...country,
                          countries: e,
                          selectedCountryShortName: e.short,
                        });
                      }}
                      options={getCountries}
                      inputId="countries"
                      placeholder="Select your Country"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: "8px",
                          border: state.isFocused ? "2px solid green-700" : "",
                          borderColor: state.isFocused
                            ? "green-700"
                            : "#e7e7e7",
                          boxShadow: state.isFocused
                            ? "0 0 0 1px green"
                            : "none",
                          padding: "6px 6px",
                          "&:hover": {
                            borderColor: "green",
                            boxShadow: "0 0 0 1px green",
                            cursor: "pointer",
                          },
                        }),
                      }}
                    />
                    <Autocomplete
                      onLoad={(autocomplete) =>
                        (autocompleteRef.current = autocomplete)
                      }
                      options={countriesRestriction}
                    >
                      <input type="text" className={inputStyle} />
                    </Autocomplete>
                  </div>
                  <div>
                    <button
                      className="font-semibold text-base py-4 px-5 my-5 w-full bg-theme-red text-white rounded"
                      onClick={() => getAddress()}
                    >
                      Continue
                    </button>
                  </div>
                  <div className=" ">
                    <img
                      className="w-2/3 mx-auto  object-cover"
                      src="/images/address.gif"
                      alt="address"
                    />
                  </div>
                </div>
              ) : addressTab === 2 ? (
                <div className="px-6">
                  <div className="space-y-5">
                    <div>
                      <h4 className="capitalize text-3xl text-black font-black ">
                        What kind of location is this?
                      </h4>
                      <p className="text-sm font-normal">
                        Help us find you faster by identifying the type of
                        location this is.
                      </p>
                    </div>
                    <div className="flex items-center gap-x-3">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 bg-[#F4F5FA]">
                        <IoHome size={28} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-lg font-semibold">House</p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "House",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-semibold"
                        >
                          Choose
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-3">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 bg-[#F4F5FA]">
                        <MdApartment size={28} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-lg font-semibold">Apartment</p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "Apartment",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-1 px-3 bg-[#37946524]"
                        >
                          Choose
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-3">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 bg-[#F4F5FA]">
                        <ImOffice size={24} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-lg font-semibold">Office</p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "Office",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-1 px-3 bg-[#37946524]"
                        >
                          Choose
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-3">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 bg-[#F4F5FA]">
                        <MdEditCalendar size={24} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-lg font-semibold">Others</p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "Others",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-1 px-3 bg-[#37946524]"
                        >
                          Choose
                        </button>
                      </div>
                    </div>
                    <hr />
                  </div>
                </div>
              ) : addressTab === 3 ? (
                <div className="px-6">
                  <div className="space-y-5">
                    <div>
                      <h4 className="capitalize text-2xl text-black font-black font-tt ">
                        Address details
                      </h4>
                      <p className="text-sm font-normal text-black text-opacity-50">
                        Giving exact address details helps us deliver your order
                        faster.
                      </p>
                    </div>
                    <div>
                      <h4 className="capitalize text-xl text-black font-black font-tt ">
                        Address
                      </h4>
                      <p className="text-sm font-normal text-black">
                        {`${deliveryAddress.building} ${deliveryAddress.streetAddress}`}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <select
                          value={deliveryAddress.locationType}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: e.target.value,
                            })
                          }
                          className={inputStyle}
                        >
                          <option value="House">House</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Office">Office</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <div>
                        <input
                          value={deliveryAddress?.entrance}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              entrance: e.target.value,
                            })
                          }
                          type="text"
                          placeholder="Entrance / Staircase"
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <input
                          value={deliveryAddress?.door}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              door: e.target.value,
                            })
                          }
                          type="text"
                          placeholder="Name / No on Door"
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <input
                          value={deliveryAddress?.instructions}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              instructions: e.target.value,
                            })
                          }
                          type="text"
                          placeholder="Other instructions for the courier"
                          className={inputStyle}
                        />
                        <p className="text-sm text-black text-opacity-50 ml-3">
                          Optional
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="capitalize text-xl text-black font-black font-tt ">
                        Where exactly should we meet you?
                      </h4>
                      <p className="text-sm font-normal text-black text-opacity-50">
                        Pinpointing your exact location on the map helps us find
                        you fast.
                      </p>
                    </div>

                    {hasPositionChanged && (
                      <div className="h-36 rest-footer overflow-hidden sm:rounded-b-[20px] md:rounded-lg relative">
                        <GoogleMap
                          zoom={14}
                          center={currentPosition}
                          mapContainerStyle={{
                            width: "100%",
                            height: "100%",
                          }}
                          options={{
                            disableDefaultUI: true,
                            draggable: false,
                            scrollwheel: false,
                            disableDoubleClickZoom: true,
                            zoomControl: false,
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              zIndex: 1,
                            }}
                            className="customMarkF"
                          >
                            <img
                              src="/images/pin-location.svg"
                              alt="Fixed Marker"
                            />
                          </div>
                        </GoogleMap>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setAddressTab(4);
                      }}
                      className="flex items-center justify-center gap-x-3 text-[#E13743] bg-[#E1374366] font-semibold w-full rounded-sm px-3 py-2"
                    >
                      <GrMapLocation />
                      Add a meeting point on the map
                    </button>
                    <div className="space-y-1">
                      <h4 className="capitalize text-xl text-black font-tt font-black">
                        Address label
                      </h4>
                      <p className="text-sm font-normal text-black text-opacity-50">
                        Labelling addresses helps you to choose between them.
                      </p>
                      <div className="pt-3 grid grid-cols-3 gap-3">
                        <button
                          onClick={() =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              AddressType: "Home",
                              other: false,
                            })
                          }
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded border ${
                            deliveryAddress.AddressType === "Home"
                              ? "border-theme-red text-theme-red"
                              : "border-black border-opacity-20 text-black text-opacity-60"
                          }`}
                        >
                          <IoHome size={24} />
                          <span className="font-normal text-xl">Home</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              AddressType: "Work",
                              other: false,
                            })
                          }
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded border ${
                            deliveryAddress.AddressType === "Work"
                              ? "border-theme-red text-theme-red"
                              : "border-black border-opacity-20 text-black text-opacity-60"
                          }`}
                        >
                          <FaBriefcase size={24} />
                          <span className="font-normal text-xl">Work</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              AddressType: "Other",
                              other: true,
                            })
                          }
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded border ${
                            deliveryAddress.AddressType === "Other"
                              ? "border-theme-red text-theme-red"
                              : "border-black border-opacity-20 text-black text-opacity-60"
                          }`}
                        >
                          <MdLocationPin size={24} />
                          <span className="font-normal text-xl">Other</span>
                        </button>
                      </div>
                      {deliveryAddress.other ? (
                        <div className="pt-2">
                          <input
                            value={deliveryAddress?.AddressType}
                            onChange={(e) =>
                              setDeliveryAddress({
                                ...deliveryAddress,
                                AddressType: e.target.value,
                              })
                            }
                            type="text"
                            placeholder="Name"
                            className={inputStyle}
                          />
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      className="font-semibold text-base py-2 px-5 my-5 w-full bg-theme-red text-white rounded"
                      onClick={handleAddAddress}
                    >
                      Save address
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-[calc(100vh-400px)] rest-footer overflow-hidden sm:rounded-b-[20px] md:rounded-b-[20px] relative">
                  <GoogleMap
                    zoom={14}
                    center={currentPosition}
                    mapContainerStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                    options={{
                      disableDefaultUI: true,
                    }}
                    onDragEnd={handleDragEnd}
                    onLoad={handleMapLoad}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                      }}
                      className="customMarkF"
                    >
                      <img src="/images/pin-location.svg" alt="Fixed Marker" />
                    </div>
                  </GoogleMap>
                  <button
                    className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[95%] font-semibold text-base py-4 px-5 bg-theme-red text-white rounded"
                    onClick={() => {
                      setAddressTab(3);
                    }}
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </ModalBody>
          {addressTab !== 4 && <ModalFooter></ModalFooter>}
        </ModalContent>
      </Modal> */}

      <Header home={true} rest={false} />

      {groupOrderStep === 1 ? (
        <>
          <div className="absolute top-[90px] right-8">
            <button onClick={() => window.history.back()}>
              <CrossIcon />
            </button>
          </div>
          <section className="pt-16  py-24  mx-auto  max-w-[1200px] px-[30px]">
            <div className="flex items-center justify-between gap-5 md:mt-20 mt-5">
              <div>
                <button className="font-sf font-light text-lg text-theme-black-2">
                  {`${groupOrderStep} / 3`}
                </button>
              </div>
            </div>

            <div className="mt-1 grid lg:grid-cols-2 items-center lg:gap-44">
              <div className="space-y-8 order-2 lg:order-1">
                <h3 className="font-bold text-5xl  font-omnes lg:leading-[60px]">
                  Order together
                </h3>
                <p className="font-normal text-base font-sf text-theme-black-2 text-opacity-90">
                  Please name the group and start inviting your guests.
                </p>
                <div className="flex gap-x-4">
                  <div className="w-24 group-order">
                    <Select
                      value={groupOrder.groupShow}
                      onChange={async (selectedOption) => {
                        const file = await urlToFile(
                          selectedOption.src,
                          `icon-${selectedOption.value}.webp`,
                          "image/webp"
                        );

                        setGroupOrder({
                          ...groupOrder,
                          groupIcon: file,
                          groupShow: selectedOption,
                        });
                        console.log("Selected option:", file);
                      }}
                      options={iconOptions}
                      placeholder={false}
                      styles={customStyles}
                    />
                  </div>
                  <div className="w-[calc(100%-112px)]">
                    <input
                      value={groupOrder.groupName}
                      onChange={(e) =>
                        setGroupOrder({
                          ...groupOrder,
                          groupName: e.target.value,
                        })
                      }
                      type="text"
                      placeholder="Group name"
                      className={inputStyle}
                    />
                  </div>
                </div>
                <div className="font-sf">
                  <button
                    onClick={groupStepOneFunc}
                    className="py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base font-bold rounded-lg border border-theme-red"
                  >
                    Continue
                  </button>
                </div>
              </div>
              <div className="flex justify-center items-center order-1 lg:order-2">
                <img
                  src="/images/groupOrder1.gif"
                  alt="group-order"
                  className="w-full h-full"
                />
              </div>
            </div>
          </section>
        </>
      ) : groupOrderStep === 2 ? (
        <>
          <div className="pt-24 px-10 flex justify-between items-center gap-10 ">
            <div>
              <button onClick={() => setGroupOrderStep(1)}>
                <BackButtonIcon />
              </button>
            </div>

            <div>
              <button onClick={() => window.history.back()}>
                <CrossIcon />
              </button>
            </div>
          </div>
          <section className="pt-3 py-24 max-w-[1200px] px-[30px] mx-auto font-sf space-y-10">
            <div>
              <button className="font-sf font-light text-lg text-theme-black-2">
                {`${groupOrderStep} / 3`}
              </button>
            </div>

            <div className="mt-10 grid lg:grid-cols-9 gap-20">
              <div className="space-y-4 order-2 lg:order-1 lg:col-span-4">
                <h3 className="font-bold font-omnes text-[32px] lg:text-[48px]  lg:leading-[60px]">
                  How do you want your order?
                </h3>
                <div className="mx-auto py-5 space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="p-1 rounded-lg bg-theme-gray-4 grid grid-cols-2 mb-6">
                        <button
                          onClick={() => {
                            localStorage.setItem("how", 1);
                            {
                              setDeliveryData({ ...deliveryData, how: 1 });
                            }
                          }}
                          className={`text-theme-black-2 font-sf py-2 px-5 font-semibold text-base flex items-center justify-center gap-x-2 rounded-md ${
                            deliveryData.how === 1
                              ? "bg-white"
                              : "bg-transparent"
                          } ${
                            buttonStates.disableDelivery
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={buttonStates.disableDelivery}
                        >
                          <BiCycling size={24} />
                          <span>Delivery</span>
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem("how", 2);
                            {
                              setDeliveryData({ ...deliveryData, how: 2 });
                            }
                          }}
                          className={`text-theme-black-2 font-sf  py-2 px-5 font-semibold text-base flex items-center justify-center gap-x-2 rounded-md ${
                            deliveryData.how === 2
                              ? "bg-white"
                              : "bg-transparent"
                          } ${
                            buttonStates.disablePickup
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={buttonStates.disablePickup}
                        >
                          <FaWalking size={24} />
                          <span>Pickup</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <hr />
                  {deliveryData.how === 1 && (
                    <>
                      <div className="space-y-3">
                        <div className="font-semibold font-omnes text-[20px]">
                          Where?
                        </div>
                        <div
                          onClick={() => setAddressModal(true)}
                          className="flex items-center justify-between gap-x-2 mt-3 px-5 py-2.5 rounded-lg border-2 border-theme-gray-12 cursor-pointer "
                        >
                          <div className="flex items-center gap-x-3">
                            <span>
                              <IoMdHome size={24} />
                            </span>
                            <div>
                              <div className="text-base font-medium font-sf">
                                {deliveryData.how === 1 ? (
                                  deliveryAddress?.id !== "" ? (
                                    <span className="font-semibold ">
                                      {`${deliveryAddress?.AddressType}`} <br />
                                      <span className="text-theme-black-2 text-opacity-65 font-normal text-sm">
                                        {" "}
                                        {`${deliveryAddress.streetAddress}`}{" "}
                                      </span>
                                    </span>
                                  ) : (
                                    "Please add a delivery address"
                                  )
                                ) : (
                                  <>
                                    <span className="font-semibold">
                                      {" "}
                                      {` ${activeResData.location}`}
                                    </span>{" "}
                                    <span className="ms-2 text-gray-500">{`${deliveryCharges.distance} ${deliveryCharges.distanceUnit}`}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {deliveryData.how === 1 && (
                            <button>
                              <IoIosArrowForward size={24} color="#202125" />
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="space-y-3">
                    <div className="font-semibold font-omnes text-[20px]">
                      When?
                    </div>

                    <div
                      className={`border-2 border-theme-gray-12 flex items-center space-x-4 px-4 py-2 rounded-lg hover:border-2 hover:border-theme-green-2 ${
                        deliveryData.when === 1 ? "border-theme-green-2" : ""
                      } ${
                        buttonStates.disableStandard
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <input
                        onChange={() =>
                          setDeliveryData({
                            ...deliveryData,
                            when: 1,
                            whenShow: false,
                            schedule: "",
                          })
                        }
                        type="radio"
                        id="when-asap"
                        name="when"
                        disabled={buttonStates.disableStandard}
                        checked={deliveryData.when === 1}
                        className="custom-radio"
                      />
                      <label
                        className={`font-sf font-semibold text-base text-theme-black-2 ${
                          buttonStates.disableStandard ? "text-gray-400" : ""
                        }`}
                      >
                        Standard
                        <br />
                        <span className="font-normal font-sf  text-sm text-theme-black-2 text-opacity-65">
                          {activeResData?.deliveryTime}
                        </span>
                      </label>
                    </div>

                    <div
                      className={`border-2 border-theme-gray-12 flex items-center space-x-4 px-4 py-2 rounded-lg hover:border-2 hover:border-theme-green-2 ${
                        deliveryData.when === 2 ? "border-theme-green-2" : ""
                      } ${
                        buttonStates.disableSchedule
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <input
                        onChange={() =>
                          setDeliveryData({
                            ...deliveryData,
                            when: 2,
                          })
                        }
                        type="radio"
                        id="when-later"
                        name="when"
                        checked={deliveryData.when === 2}
                           disabled={buttonStates.disableSchedule}
                        className="custom-radio"
                      />
                      <label className="font-sf font-semibold text-base">
                        Schedule
                        <br />
                        <span className="font-normal font-sf  text-sm text-theme-black-2 text-opacity-65">
                          Choose a delivery time
                        </span>
                      </label>
                    </div>

                    {deliveryData.when === 2 && (
                      <div className="flex  justify-between space-x-7 my-3">
                        <Select
                          value={schedule.day}
                          onChange={(e) => {
                            const day = JSON.parse(
                              localStorage.getItem("activeResData")
                            ).times.find(
                              (ele) => ele.name === e.value.toLowerCase()
                            );
                            generateTimeChunks(
                              day.startAt,
                              day.endAt,
                              day.date
                            );
                            setSchedule({
                              ...schedule,
                              day: e,
                              date: day.date,
                            });
                          }}
                          isClearable={true}
                          isDisabled={deliveryData.when === 1 ? true : false}
                          options={days}
                          placeholder="Select day"
                          className="flex-1"
                        />
                        <Select
                          value={schedule.time}
                          onChange={(e) =>
                            setSchedule({
                              ...schedule,
                              time: e,
                            })
                          }
                          isClearable={true}
                          isDisabled={deliveryData.when === 1 ? true : false}
                          options={timeChunks}
                          placeholder="Select time"
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="font-sf">
                  <button
                    onClick={createGroupOrder}
                    className="py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white font-bold shadow-md text-base rounded-lg border border-theme-red "
                  >
                    Create the group
                  </button>
                </div>
              </div>

              <div className="flex justify-center items-start order-1 lg:order-2  lg:col-span-5">
                <img src="/images/groupOrder2.gif" alt="group-order" />
              </div>
            </div>
          </section>
        </>
      ) : groupOrderStep === 3 ? (
        <>
          <div className="pt-24 px-10 flex justify-between  gap-10 ">
            <div>
              <button
                onClick={() => {
                  setGroupOrderStep(2);
                  setShowText(false);
                }}
              >
                <BackButtonIcon />
              </button>
            </div>

            <div>
              <button
                onClick={() => {
                  window.history.back();
                  setShowText(false);
                }}
              >
                <CrossIcon />
              </button>
            </div>
          </div>
          <section className="max-w-[1200px] px-[30px] pt-3 py-24  mx-auto font-sf space-y-10">
            <div>
              <button className="font-sf font-light text-lg text-theme-black-2">
                {`${groupOrderStep} / 3`}
              </button>
            </div>

            <div className="mt-16 grid lg:grid-cols-9 items-center gap-8">
              <div className="space-y-8 order-2 lg:order-1 lg:col-span-4">
                <h3 className="font-omnes font-bold text-[32px] sm:text-5xl !leading-tight">
                  Invite to order together
                </h3>
                <p className="font-light text-base text-theme-black-2 ">
                  Share the link with your guests. when everyonr has added their
                  choices, confirm the order and a courier will deliver it your
                  way!
                </p>
                <div>
                  <div className=" relative flex gap-x-2 items-center font-sf w-full  font-normal text-base text-theme-black-2 rounded-lg py-[6px] px-1 bg-[#ededee] border-2 border-[#ededee] placeholder:text-black placeholder:text-opacity-40 focus:outline-none focus:border-2 focus:border-green-700 hover:border-2 hover:border-green-700 hover:cursor-pointer">
                    <button
                      onClick={() => copyToClipboard(link)}
                      className="font-sf font-light text-sm text-theme-black-2 text-opacity-80 m-2"
                    >
                      <CustomLinkIcon />
                    </button>
                    <input
                      value={link}
                      type="text"
                      readOnly={true}
                      className="resize-none bg-transparent w-full h-full focus:outline-none"
                    />

                    {showText && (
                      <p className="text-end absolute -bottom-6 right-2 text-theme-black-2 text-xs text-opacity-90">
                        Copied
                      </p>
                    )}
                  </div>
                  {!showText && (
                    <button
                      onClick={() => copyToClipboard(link)}
                      className="font-sf font-normal text-[13px] text-theme-black-2 text-opacity-80 mt-2"
                    >
                      Click to copy
                    </button>
                  )}
                </div>

                <div className="font-sf ">
                  <button
                    className="mt-4 py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white font-bold shadow-md text-base rounded-lg border border-theme-red "
                    onClick={() => {
                      localStorage.setItem("groupOrder", JSON.stringify({}));
                      handleGroupOrderClick();
                    }}
                  >
                    Continue
                  </button>
                </div>
                <div className="space-y-4 pt-5">
                  <h4 className=" font-omnes text-xl sm:text-[24px] font-semibold">
                    Suggested guests
                  </h4>

                  <div className="w-full h-[1px] bg-black bg-opacity-20"></div>

                  <p className="text-base font-normal font-sf text-theme-black-2 text-opacity-60">
                    Your guests will show up here
                  </p>
                </div>
              </div>

              <div className="flex justify-center items-center space-y-2 order-1 lg:order-2 lg:col-span-5">
                <img src="/images/groupOrder3.gif" alt="group-order" />
              </div>
            </div>
          </section>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
