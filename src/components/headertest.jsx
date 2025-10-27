import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  PinInput,
  PinInputField,
  useMediaQuery,
  useDisclosure,
  DrawerCloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  SkeletonText,
  Box,
  Flex,
  Skeleton,
} from "@chakra-ui/react";
import {
  React,
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from "react";
import Select from "react-select";
import {
  Link,
  replace,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaRegClock } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import {
  FaBicycle,
  FaBriefcase,
  FaCalendar,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaHistory,
  FaHotel,
  FaPlus,
  FaUser,
  FaWalking,
} from "react-icons/fa";
import { RxCounterClockwiseClock } from "react-icons/rx";
import inviteFriendIcon from "/images/inviteFriend.svg";
import { CiLogout } from "react-icons/ci";
import { GrLocation, GrMapLocation, GrUserAdmin } from "react-icons/gr";
import { Spinner } from "@chakra-ui/react";
import {
  IoArrowBackOutline,
  IoCartOutline,
  IoClose,
  IoHome,
  IoLocationOutline,
  IoNotificationsOutline,
  IoSearch,
  IoLogOutOutline,
  IoLockClosedOutline,
  IoHomeOutline,
} from "react-icons/io5";
import { FaRegAddressBook } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import {
  MdApartment,
  MdEditCalendar,
  MdKeyboardArrowDown,
  MdLocationPin,
  MdLogout,
  MdOutlineSupportAgent,
  MdOutlineTableRestaurant,
  MdPayment,
  MdTableRestaurant,
  MdOutlineDiscount,
} from "react-icons/md";
import {
  BsApple,
  BsCashCoin,
  BsEmojiSmileFill,
  BsQrCodeScan,
} from "react-icons/bs";
import { TbBrandBooking, TbUserCircle } from "react-icons/tb";
import DrawerItem from "./DrawerItem";
import RestaurantCard from "./RestaurantCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  error_toaster,
  info_toaster,
  mini_toaster,
  success_toaster,
} from "../utilities/Toaster";
import { PostAPI, loginAPI } from "../utilities/PostAPI";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "react-phone-input-2/lib/style.css";
import { setLoginStatus } from "../utilities/AuthCheck";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from "firebase/auth";
import firebaseApp from "../firebase/Firebase";
import { IoMdClose, IoIosArrowDown, IoMdHome } from "react-icons/io";
import GetAPI from "../utilities/GetAPI";
import { BASE_URL } from "../utilities/URL";
import { RiDeleteBinLine, RiHotelLine, RiSubtractFill } from "react-icons/ri";
import { BiCycling, BiPlus, BiTrash } from "react-icons/bi";
import { ImOffice } from "react-icons/im";
import { Autocomplete } from "@react-google-maps/api";
import { FaLocationDot } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";
import { LuHistory } from "react-icons/lu";
import { formatPrice } from "../utilities/priceConverter";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { GoArrowSwitch, GoLink } from "react-icons/go";
import { SlLockOpen } from "react-icons/sl";
import { toast } from "react-toastify";
import { dataContext } from "../utilities/ContextApi";
import { GiChopsticks } from "react-icons/gi";
import { PiShareNetworkFill } from "react-icons/pi";
import QRCode from "react-qr-code";
import socket from "../utilities/Socket";
import RecentOrderCard from "./RecentOrderCard";
import { googleApiKey } from "../utilities/URL";
import { SearchTags } from "../utilities/SearchTags";
import { useTranslation } from "react-i18next";
import { GoPlus } from "react-icons/go";
import CustomPlusbtn from "./CustomPlusbtn";
import CustomMenubtn from "./CustomMenubtn";
import SearchCard from "./SearchCard";
import FloatingLabelInput from "./FloatingLabelInput";
import CountrySelect from "./CountrySelect";
import en from "react-phone-number-input/locale/en";
import { PhoneNumberUtil } from "google-libphonenumber";
import CustomDropArrow from "./CustomDropArrow";
import CustomCartIcon from "./CustomCartIcon";
import CustomHomeIcon from "./CustomHomeIcon";
import ReactCountryFlag from "react-country-flag";
import { AnimatePresence, motion } from "framer-motion";
import CustomDeliveryIcon from "./CustomDeliveryIcon";
import { GoChevronRight } from "react-icons/go";
import dayjs from "dayjs";
import FloatingTextarea from "./FloatingTextarea";
import { MdNavigateNext } from "react-icons/md";
// dayjs.extend(customParseFormat);

export default function Header(props) {
  const [sm] = useMediaQuery("(min-width: 640px)");
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
    headerSearch,
    setHeaderSearch,
    setDeleteProductId,
    deleteProductId,
  } = useContext(dataContext);

  useEffect(() => {
    console.log("Updated dataContext values:", {
      gData,
      groupDrawer,
      isFocused,
      pending,
      searchResult,
      searchTerm,
      headerDrawer,
      headerSearch,
      deleteProductId,
    });
  }, [
    gData,
    groupDrawer,
    isFocused,
    pending,
    searchResult,
    searchTerm,
    headerDrawer,
    headerSearch,
    deleteProductId,
  ]);
  const activeResData = JSON.parse(localStorage.getItem("activeResData"));
  const groupData = JSON.parse(localStorage.getItem("groupData"));
  const groupId = JSON.parse(localStorage.getItem("groupData"))?.orderId;
  const [ready, setReady] = useState({
    show: 0,
    readyCount: 0,
    notReadyCount: 0,
  });

  const [substitution, setSubstitution] = useState(false);
  const [replacewith, setReplacewith] = useState({
    replaceWithVal: "",
    show: false,
    id: [],
    isSubstitutionAllow: false,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t, i18n } = useTranslation();

  const [xl] = useMediaQuery("(min-width: 1280px)");
  const [lg] = useMediaQuery("(min-width: 1024px)");
  const [md] = useMediaQuery("(min-width: 768px)");

  const [group, setGroup] = useState({
    viewSelection: "",
    liShow: false,
    show: 0,
  });

  function extractFirstLetters(str) {
    if (str) {
      const firstLetter = str.charAt(0);
      const spaceIndex = str.indexOf(" ");
      const secondLetter =
        spaceIndex !== -1 ? str.charAt(spaceIndex + 1) : null;
      return { firstLetter, secondLetter };
    }
  }

  const navigate = useNavigate();
  const location = useLocation();
  const { countryCode, cityName } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const q = queryParams.get("q");
  const [key, setKey] = useState(0);
  const userId = localStorage.getItem("userId");
  const [formatedAdress, setFormatedAddress] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [schedule, setSchedule] = useState({
    day: "",
    time: "",
    date: "",
  });
  const [timeChunks, setTimeChunks] = useState([]);
  const [searchItemModalData, setSearchItemModalData] = useState({});

  const [searchItemModal, setSearchItemModal] = useState(false);
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

  async function getAddressFromLatLng(lat, lng) {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;
    try {
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address;
        setFormatedAddress(formattedAddress);
        return formattedAddress;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  let lat, lng;
  if (cityName?.startsWith("lat=") && cityName?.includes("&lng=")) {
    const [latPart, lngPart] = cityName?.split("&");
    lat = latPart.split("=")[1];
    lng = lngPart.split("=")[1];
    getAddressFromLatLng(lat, lng);
  }
  const guestFormatAddress = localStorage.getItem("guestFormatAddress");
  const displayAddress =
    guestFormatAddress && guestFormatAddress.length > 0
      ? `${guestFormatAddress.slice(0, 10)}${
          guestFormatAddress.length > 10 ? "..." : ""
        }`
      : formatedAdress && formatedAdress.length > 0
      ? `${formatedAdress.slice(0, 20)}${
          formatedAdress.length > 10 ? "..." : ""
        }`
      : cityName && cityName.length > 0
      ? `${cityName.slice(0, 10)}${cityName.length > 10 ? "..." : ""}`
      : "";

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [location]);

  const cartItems = JSON.parse(localStorage.getItem("cartItems"));

  const getcountr = GetAPI("users/getCountriesAndCities");
  const { data } = GetAPI(
    `frontsite/favRestaurant/${localStorage.getItem("userId")}`
  );

  const getProfile = GetAPI(
    `users/getProfile/${localStorage.getItem("userId")}`
  );
  const getAllAddressess = GetAPI("users/alladdresses");
  const cutleryList = localStorage.getItem("cutleryList");
  const cutleryData = cutleryList ? JSON.parse(cutleryList) : [];

  const countryNameFromLocalStorage = localStorage.getItem("countryShortName");
  const filteredAddresses = getcountr?.data?.data?.countries?.filter(
    (address) => address.shortName == countryNameFromLocalStorage
  );
  const filteredCities = filteredAddresses?.[0]?.cities || [];
  function separateNames(fullName) {
    const namesArray = fullName.split(" ");
    const firstName = namesArray[0];
    const lastName = namesArray.slice(1).join(" ");
    return {
      firstName: firstName,
      lastName: lastName,
    };
  }

  const extractUsernameFromEmail = (email) =>
    (email.match(/^[a-zA-Z0-9._%+-]+/) || [])[0];

  // const [md] = useMediaQuery("(min-width: 768px)");

  const [loader, setLoader] = useState(false);
  ``;
  const [visible, setVisible] = useState(false);
  const [forgotVisible, setForgotVisible] = useState({
    password: false,
    confirmPassword: false,
  });
  const [drawer, setDrawer] = useState(
    props.profileDrawer ? props.profileDrawer : false
  );
  const [note, setNote] = useState(localStorage.getItem("note") ?? "");
  const [inviteFriend, setInviteFriend] = useState(0);
  const [drawerCart, setDrawerCart] = useState(
    props.drawerCart ? props.drawerCart : false
  );
  const [minimumOrderModel, setMinimumOrderModal] = useState(false);

  useEffect(() => {
    if (headerDrawer) {
      setDrawerCart(true);
    } else {
      setDrawerCart(false);
    }
    if (headerSearch.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [headerDrawer, headerSearch.isOpen]);

  useEffect(() => {
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
        how: parseInt(localStorage.getItem("how")) ?? 0,
        when: parseInt(localStorage.getItem("when")) || 1,
      });
    }
  }, []);

  const [drawerMsg, setDrawerMsg] = useState(false);
  const [isCutleryAdded, setIsCutleryAdded] = useState(false);
  const [modalScroll, setModalScroll] = useState(0);
  const [signUpStep, setSignUpStep] = useState(1);
  const [forgotStep, setForgotStep] = useState(1);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [signUpData, setSignUpData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    countryCode: "92",
    phoneNum: "",
    referalCode: "",
    signedFrom: "",
  });
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
  const [createAccountTab, setCreateAccountTab] = useState(1);
  const [otp, setOtp] = useState("");
  const [mergeOtp, setMergeOtp] = useState("");
  const [tab, setTab] = useState("Restaurants");

  const onChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };
  const onChange2 = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  const [counter, setCounter] = useState(null);
  const handleCounterClick = (index) => {
    setCounter(index);
  };

  const [modal, setModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [signUpModal, setSignUpModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [addressTab, setAddressTab] = useState(0);
  const [detailsTab, setDetailsTab] = useState(0);
  const [drawerScroll, setDrawerScroll] = useState(0);
  const [forgotData, setForgotData] = useState({
    email: "",
    OTP: "",
    password: "",
    confirmPassword: "",
    userId: "",
    forgetRequestId: "",
  });
  const [deliveryData, setDeliveryData] = useState({
    how: 1,
    where: 1,
    when: 1,
  });
  const [days, setDays] = useState([]);
  const [restDetailPath, setRestDetailPath] = useState("");

  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
  };

  const [country, setCountry] = useState({
    // countries: {
    //   value: "",
    //   label: localStorage.getItem("countryName"),
    //   short: localStorage.getItem("countryShortName"),
    // },
    countries: null,
    selectedCountryShortName: localStorage.getItem("countryShortName"),
  });

  const getCountries = [];
  getcountr?.data?.data?.countries?.map((countr, index) => {
    return getCountries.push({
      value: countr?.id,
      label: countr?.name,
      short: countr?.shortName,
    });
  });

  const closeModal = () => {
    setModal(false);
    props.setLoginModal(false);
    setModalScroll(0);
    setCreateAccountTab(1);
    setMergeOtp("");
    setSignUpStep(1);
    setLoginData({
      email: "",
      password: "",
    });
  };

  const closeAddressModal = () => {
    setModal(false);
    setAddressModal(false);
    props.setLoginModal(false);
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

  const closeDetailsModal = () => {
    props.setScheduleOrderModal(false);
    setDetailsModal(false);
    setModalScroll(0);
    setDetailsTab(0);
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

  const resPath = `/${countryCode}/${cityName}/restaurants`;
  const strPath = `/${countryCode}/${cityName}/stores`;

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

    if (location.pathname == resPath || strPath) {
      setAddressTab(2);
    } else {
      setDetailsTab(3);
    }
    return null;
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
        cityName: deliveryAddress?.city,
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
        deliveryLocation: "To the office",
        locationType: deliveryAddress?.locationType,
        AddressType: deliveryAddress?.AddressType,
        note: deliveryAddress?.instructions,
        countryShortName: country.selectedCountryShortName,
      });
      if (res?.data?.status === "1") {
        if (location.pathname == resPath || strPath) {
          setAddressTab(0);
          setAddressModal(false);
        } else {
          setDetailsTab(0);
          setDetailsModal(false);
        }
        success_toaster(res?.data?.message);
        getAllAddressess.reFetch();
      } else {
        error_toaster(res?.data?.message);
      }
    }
  };

  const countriesRestriction = {
    componentRestrictions: { country: [`${country.selectedCountryShortName}`] },
  };

  const calculateRoute = async () => {
    const resID = localStorage.getItem("resId");
    let res = await PostAPI("users/deliveryfee", {
      restaurantId: resID,
      dropOffLat: localStorage.getItem("deliveryLat"),
      dropOffLng: localStorage.getItem("deliveryLng"),
    });
    if (res?.data?.status === "1") {
      success_toaster(res?.data?.message);
    } else {
      error_toaster(res?.data?.message);
    }
  };

  const closeSignUpModal = () => {
    setSignUpStep(1);
    setModalScroll(0);
    setSignUpModal(false);
    setSignUpData({
      userName: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      countryCode: "92",
      phoneNum: "",
      referalCode: "",
      signedFrom: "",
    });
    setOtp("");
    setPhoneError("");
    localStorage.removeItem("email");
  };

  const loginFunc = async (e) => {
    e.preventDefault();
    if (loginData.email === "") {
      info_toaster("Please enter Email");
    } else {
      setLoader(true);

      let res = await loginAPI("frontsite/login", {
        email: loginData.email,
        password: loginData.password,
      });

      if (res?.data?.status === "1") {
        setLoader(false);
        success_toaster(res?.data?.message);
        localStorage.setItem("accessToken", res?.data?.data?.accessToken);
        localStorage.setItem("userId", res?.data?.data?.userId);
        localStorage.setItem("userEmail", res?.data?.data?.email);
        localStorage.setItem("userNumber", res?.data?.data?.phoneNum);
        localStorage.setItem(
          "userName",
          `${res?.data?.data?.firstName} ${res?.data?.data?.lastName}`
        );
        setLoginStatus(true);
        closeModal();
        setDrawer(false);
        navigate(`${location.pathname}${location.search}`);
      } else if (res?.data?.status === "2") {
        localStorage.setItem("userId", res?.data?.data?.userId);
        setSignUpModal(true);
        setSignUpStep(3);
        setModal(0);
        props.setLoginModal(false);
      } else {
        setLoader(false);
        error_toaster(res?.data?.message);
      }
    }
  };

  const signUpFunc = async (e) => {
    e.preventDefault();
    if (signUpData.firstName === "") {
      info_toaster("Please enter First Name");
    } else if (signUpData.lastName === "") {
      info_toaster("Please enter Last Name");
    } else if (signUpData.email === "") {
      info_toaster("Please enter Email");
    } else if (signUpData.phoneNum === "") {
      info_toaster("Please enter Phone Number");
    } else if (signUpData.password === "") {
      info_toaster("Please enter Password");
    } else {
      setLoader(true);

      const generatedUserName = `${signUpData.firstName}${signUpData.lastName}`
        .replace(/\s+/g, "")
        .toLowerCase();

      let res = await loginAPI("users/register", {
        userName: generatedUserName,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        email: signUpData.email,
        password: signUpData.password,
        countryCode: `+${signUpData.countryCode}`,
        phoneNum: signUpData.phoneNum,
        referalCode: signUpData.referalCode,
        gKey: "0",
        signedFrom: "email",
        deviceToken: "Windows",
      });

      if (res?.data?.status === "1") {
        setLoader(false);
        success_toaster(res?.data?.message);
        localStorage.setItem("userId", res?.data?.data?.userId);
        localStorage.setItem("email", res?.data?.data?.email);
        localStorage.setItem("userEmail", res?.data?.data?.email);
        localStorage.setItem("userNumber", res?.data?.data?.phoneNum);
        setSignUpStep(3);
      } else {
        setLoader(false);
        error_toaster(res?.data?.message);
      }
    }
  };

  const phoneUtil = PhoneNumberUtil.getInstance();
  const validatePhoneNumber = (shortCountryName, phoneNumber) => {
    try {
      const parsedNumber = phoneUtil.parse(
        phoneNumber,
        shortCountryName.toUpperCase()
      );
      return phoneUtil.isValidNumber(parsedNumber);
    } catch (error) {
      return false;
    }
  };
  const handlePhoneNumberChange = (value) => {
    setSignUpData((prevData) => ({
      ...prevData,
      phoneNum: value,
    }));

    const isValid = validatePhoneNumber(signUpData.countryCode, value);

    if (!isValid) {
      setPhoneError("Please enter a valid phone number");
    } else {
      setPhoneError("");
    }
  };

  const resendOTPfunc = async () => {
    let res = await PostAPI("users/resendotp", {
      email: localStorage.getItem("email"),
      userId: localStorage.getItem("userId"),
    });

    if (res?.data?.status === "1") {
      success_toaster(res?.data?.message);
    } else {
      error_toaster(res?.data?.message);
    }
  };

  const otpFunc = async (e) => {
    e.preventDefault();
    if (otp === "") {
      info_toaster("Please enter OTP");
    } else {
      setLoader(true);
      let res = await loginAPI("users/verifyEmail", {
        userId: parseInt(localStorage.getItem("userId")),
        OTP: otp,
        deviceToken: "",
      });
      if (res?.data?.status === "1") {
        setLoader(false);
        success_toaster(res?.data?.message);
        localStorage.setItem("accessToken", res?.data?.data?.accessToken);
        localStorage.setItem(
          "userName",
          `${res?.data?.data?.firstName} ${res?.data?.data?.lastName}`
        );
        localStorage.removeItem("email");
        setLoginStatus(true);
        closeSignUpModal();
        setDrawer(false);
        navigate(`${location.pathname}${location.search}`);
      } else {
        setLoader(false);
        error_toaster(res?.data?.message);
      }
    }
  };
  const [email, setEmail] = useState("");
  const [existingProvider, setExistingProvider] = useState("");
  const [pendingCred, setPendingCred] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth(firebaseApp);

  const handleAccountMerge = async (error, auth) => {
    if (error.code === "auth/account-exists-with-different-credential") {
      const pendingCred = OAuthProvider.credentialFromError(error);
      const email = error.customData.email;
      try {
        const existingMethods = await fetchSignInMethodsForEmail(auth, email);
        let existingProvider = "";

        if (existingMethods.includes("google.com")) {
          existingProvider = "Google";
        } else if (existingMethods.includes("facebook.com")) {
          existingProvider = "Facebook";
        } else if (existingMethods.includes("apple.com")) {
          existingProvider = "Apple";
        } else {
          existingProvider = existingMethods[0];
        }
        setCreateAccountTab(2);
        setPendingCred(pendingCred);
        setEmail(email);
        setExistingProvider(existingProvider);
      } catch (mergeError) {
        console.log(mergeError);
      }
    } else {
      console.log(error.message);
    }
  };
  const mergeAccounts = async (e) => {
    e.preventDefault();
    let res = await PostAPI("frontsite/verifyOTP", {
      email: email,
      OTP: mergeOtp,
    });

    const otpSatus = res?.data?.status;
    if (otpSatus === "1") {
      try {
        let existingProviderInstance;
        if (existingProvider === "Google") {
          existingProviderInstance = new GoogleAuthProvider();
        } else if (existingProvider === "Facebook") {
          existingProviderInstance = new FacebookAuthProvider();
        } else if (existingProvider === "Apple") {
          existingProviderInstance = new OAuthProvider("apple.com");
        }
        const existingResult = await signInWithPopup(
          auth,
          existingProviderInstance
        );
        const existingUser = existingResult.user;

        await linkWithCredential(existingUser, pendingCred);
        success_toaster("Accounts merged successfully.");
        localStorage.setItem("accessToken", existingUser.accessToken);
        localStorage.setItem("userId", res?.data?.data?.userId);
        localStorage.setItem("userEmail", existingUser.email);
        localStorage.setItem("userNumber", res?.data?.data?.phoneNum);
        localStorage.setItem("userName", existingUser.displayName || "");
        setLoginStatus(true);
        closeSignUpModal();
        setModal(false);
        setDrawer(false);
        setLoader(false);
        navigate(`${location.pathname}${location.search}`);
        setMergeOtp("");
        setCreateAccountTab(1);
      } catch (mergeError) {
        error_toaster("Error during account merging:");
      }
    } else {
      error_toaster("Incorrect otp");
    }
  };

  const handleSendMergeOtp = async () => {
    setIsLoading(true);
    try {
      let res = await PostAPI("frontsite/resendotp", {
        email: email,
      });
      setCreateAccountTab(3);
      info_toaster("sent otp");
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogleFunc = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setLoader(true);

      let res = await loginAPI("frontsite/emailChecker", {
        email: user?.email,
      });

      if (res?.data?.status === "1") {
        let resp = await loginAPI("frontsite/register", {
          userName: extractUsernameFromEmail(user?.email),
          firstName: "",
          lastName: "",
          email: user?.email,
          password: "",
          countryCode: "92",
          phoneNum: "",
          referalCode: "",
          signedFrom: "google",
        });

        if (resp?.data?.status === "1") {
          success_toaster(resp?.data?.message);
          localStorage.setItem("accessToken", resp?.data?.data?.accessToken);
          localStorage.setItem("userId", resp?.data?.data?.userId);
          localStorage.setItem("userEmail", resp?.data?.data?.email);
          localStorage.setItem("userNumber", resp?.data?.data?.phoneNum);
          localStorage.setItem(
            "userName",
            `${resp?.data?.data?.firstName} ${resp?.data?.data?.lastName}`
          );
          setLoginStatus(true);
          closeSignUpModal();
          setModal(false);
          setDrawer(false);
          setLoader(false);
          props.setLoginModal(false);
          navigate(`${location.pathname}${location.search}`);
        } else {
          error_toaster(resp?.data?.message);
          setLoader(false);
        }
      } else if (res?.data?.status === "2") {
        if (modal === true) {
          setModal(false);
          props.setLoginModal(false);
          setSignUpModal(true);
        }
        setSignUpData({
          userName: extractUsernameFromEmail(user?.email),
          firstName: separateNames(user?.displayName)?.firstName,
          lastName: separateNames(user?.displayName)?.lastName,
          email: user?.email,
          password: "",
          countryCode: "92",
          phoneNum: "",
          referalCode: "",
          signedFrom: "google",
        });
        setSignUpStep(2);
        setLoader(false);
      } else {
        error_toaster(res?.data?.message);
        setLoader(false);
      }
    } catch (error) {
      await handleAccountMerge(error, auth);
    }
  };

  const signInWithFacebookFunc = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new FacebookAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setLoader(true);
      let res = await loginAPI("frontsite/emailChecker", {
        email: user?.email,
      });

      if (res?.data?.status === "1") {
        let resp = await loginAPI("frontsite/register", {
          userName: "",
          firstName: "",
          lastName: "",
          email: user?.email,
          password: "",
          countryCode: "92",
          phoneNum: "",
          referalCode: "",
          signedFrom: "facebook",
        });

        if (resp?.data?.status === "1") {
          success_toaster(resp?.data?.message);
          localStorage.setItem("accessToken", resp?.data?.data?.accessToken);
          localStorage.setItem("userId", resp?.data?.data?.userId);
          localStorage.setItem("userEmail", resp?.data?.data?.email);
          localStorage.setItem("userNumber", res?.data?.data?.phoneNum);
          localStorage.setItem(
            "userName",
            `${resp?.data?.data?.firstName} ${resp?.data?.data?.lastName}`
          );
          setLoginStatus(true);
          closeSignUpModal();
          props.setLoginModal(false);
          setModal(false);
          setDrawer(false);
          setLoader(false);
          navigate(`${location.pathname}${location.search}`);
        } else {
          setLoader(false);
        }
      } else if (res?.data?.status === "2") {
        if (modal === true) {
          setModal(false);
          setSignUpModal(true);
          props.setLoginModal(false);
        }
        setSignUpData({
          userName: extractUsernameFromEmail(user?.email),
          firstName: separateNames(user?.displayName)?.firstName,
          lastName: separateNames(user?.displayName)?.lastName,
          email: user?.email,
          password: "",
          countryCode: "92",
          phoneNum: "",
          referalCode: "",
          signedFrom: "facebook",
        });
        setSignUpStep(2);
        setLoader(false);
      } else {
        setLoader(false);
      }
    } catch (error) {
      await handleAccountMerge(error, auth);
    }
  };

  const signInWithAppleFunc = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new OAuthProvider("apple.com");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setLoader(true);

      let res = await loginAPI("frontsite/emailChecker", {
        email: user?.email,
      });

      if (res?.data?.status === "1") {
        let resp = await loginAPI("frontsite/register", {
          userName: "",
          firstName: "",
          lastName: "",
          email: user?.email,
          password: "",
          countryCode: "92",
          phoneNum: "",
          referalCode: "",
          signedFrom: "apple.com",
        });

        if (resp?.data?.status === "1") {
          success_toaster(resp?.data?.message);
          localStorage.setItem("accessToken", resp?.data?.data?.accessToken);
          localStorage.setItem("userId", resp?.data?.data?.userId);
          localStorage.setItem("userEmail", resp?.data?.data?.email);
          localStorage.setItem("userNumber", res?.data?.data?.phoneNum);
          localStorage.setItem(
            "userName",
            `${resp?.data?.data?.firstName} ${resp?.data?.data?.lastName}`
          );
          setLoginStatus(true);
          closeSignUpModal();
          props.setLoginModal(false);
          setModal(false);
          setDrawer(false);
          setLoader(false);
          navigate(`${location.pathname}${location.search}`);
        } else {
          error_toaster(resp?.data?.message);
          setLoader(false);
        }
      } else if (res?.data?.status === "2") {
        if (modal === true) {
          setModal(false);
          setSignUpModal(true);
          props.setLoginModal(false);
        }
        setSignUpData({
          userName: "",
          firstName: "",
          lastName: "",
          email: user?.email,
          password: "",
          countryCode: "92",
          phoneNum: "",
          referalCode: "",
          signedFrom: "apple.com",
        });
        setSignUpStep(2);
        setLoader(false);
      } else {
        error_toaster(res?.data?.message);
        setLoader(false);
      }
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        await handleAccountMerge(error, auth);
      } else {
      }
    }
  };

  const signUpWithGoogleFunc = async (e) => {
    e.preventDefault();
    if (signUpData.firstName === "") {
      info_toaster("Please enter First Name");
    } else if (signUpData.lastName === "") {
      info_toaster("Please enter Last Name");
    } else if (signUpData.userName === "") {
      info_toaster("Please enter Username");
    } else if (signUpData.email === "") {
      info_toaster("Please enter Email");
    } else if (signUpData.phoneNum === "") {
      info_toaster("Please enter Phone Number");
    } else {
      setLoader(true);
      let res = await loginAPI("frontsite/register", {
        userName: signUpData.userName,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        email: signUpData.email,
        password: signUpData.password,
        countryCode: `+${signUpData.countryCode}`,
        phoneNum: signUpData.phoneNum,
        referalCode: signUpData.referalCode,
        signedFrom: signUpData.signedFrom,
      });

      if (res?.data?.status === "3") {
        setLoader(false);
        success_toaster(res?.data?.message);
        localStorage.setItem("accessToken", res?.data?.data?.accessToken);
        localStorage.setItem("userId", res?.data?.data?.userId);
        localStorage.setItem("userEmail", res?.data?.data?.email);
        localStorage.setItem("userNumber", res?.data?.data?.phoneNum);
        localStorage.setItem(
          "userName",
          `${res?.data?.data?.firstName} ${res?.data?.data?.lastName}`
        );

        setLoginStatus(true);
        closeSignUpModal();
        setModal(false);
        setDrawer(false);
        navigate(`${location.pathname}${location.search}`);
      } else if (res?.data?.status === "0") {
        setLoader(false);
        error_toaster(res?.data?.message);
      }
    }
  };
  const logoutFunc = () => {
    setTimeout(() => {
      // localStorage.removeItem("accessToken");
      // localStorage.removeItem("loginStatus");
      // localStorage.removeItem("userName");
      // localStorage.removeItem("userEmail");
      // localStorage.removeItem("userNumber");
      // localStorage.removeItem("userId");
      // localStorage.removeItem("email");
      // localStorage.removeItem("cartItems");
      // localStorage.removeItem("countryShortName");
      // localStorage.removeItem("guestFormatAddress");
      // localStorage.removeItem("countryName");
      // localStorage.removeItem("orderId");
      // localStorage.removeItem("cartItems");
      // localStorage.removeItem("how");
      // localStorage.removeItem("when");
      // localStorage.removeItem("note");
      // localStorage.removeItem("gLink");
      // localStorage.removeItem("groupData");
      // localStorage.removeItem("groupOrder");
      // localStorage.removeItem("hasJoinedGroup");
      // localStorage.removeItem("guestJoined");
      localStorage.clear();
      setDrawer(false);
      info_toaster("Successfully Logged Out!");
      navigate("/");
    }, 400);
  };

  const forgotStepOneFunc = async (e) => {
    e.preventDefault();
    if (forgotData.email === "") {
      info_toaster("Please enter Email");
    } else {
      let res = await PostAPI("users/forgetpasswordrequest", {
        email: forgotData.email,
      });
      if (res?.data?.status === "1") {
        setForgotData({
          ...forgotData,
          userId: res?.data?.data?.userId,
          forgetRequestId: res?.data?.data?.forgetRequestId,
        });
        setForgotStep(2);
        success_toaster(res?.data?.message);
      } else {
        error_toaster(res?.data?.message);
      }
    }
  };

  const forgotStepTwoFunc = (e) => {
    e.preventDefault();
    if (forgotData.OTP === "") {
      info_toaster("Please enter OTP");
    } else {
      setForgotStep(3);
    }
  };

  const forgotStepThreeFunc = async (e) => {
    e.preventDefault();
    if (forgotData.password === "") {
      info_toaster("Please create password");
    } else if (forgotData.confirmPassword === "") {
      info_toaster("Please confirm password");
    } else if (forgotData.password !== forgotData.confirmPassword) {
      info_toaster("Passwords do not match");
    } else {
      let res = await PostAPI("users/forgetpasswordresponse", {
        OTP: forgotData.OTP,
        password: forgotData.password,
        userId: forgotData.userId,
        forgetRequestId: forgotData.forgetRequestId,
      });
      if (res?.data?.status === "1") {
        setForgotStep(4);
      } else {
        setForgotStep(2);
        error_toaster(res?.data?.message);
      }
    }
  };

  const resDetails = (
    restaurantId,
    city,
    country,
    businessName,
    businessType
  ) => {
    const countries = getcountr?.data?.data?.countries || [];
    const countryData = countries.find((c) => c.name === country);
    const countryShortName = countryData ? countryData.shortName : null;

    localStorage.setItem("resId", restaurantId);
    if (businessType === "1") {
      const slug = `${businessName
        ?.replace(/\s+/g, "-")
        .toLowerCase()}-res-${restaurantId}`;
      navigate(
        `/${countryShortName?.toLowerCase()}/${city?.toLowerCase()}/restaurants/${slug}`
      );
      setRestDetailPath(slug);
    } else {
      const slug = `${businessName
        ?.replace(/\s+/g, "-")
        .toLowerCase()}-store-${restaurantId}`;
      navigate(
        `/${countryShortName?.toLowerCase()}/${city?.toLowerCase()}/stores/${slug}`
      );
    }
  };

  const searchFunction = async () => {
    const termToSearch = searchTerm?.trim() || q?.trim();

    if (!termToSearch || termToSearch.length === 0) {
      setPending("recent");
      return; // Exit early
    }

    setPending("pending");

    try {
      const res = await PostAPI("users/searchProduct", {
        productName: termToSearch,
        isOpen: headerSearch.openFilter,
        zoneId: parseFloat(localStorage.getItem("zoneId")),
        lat: parseFloat(localStorage.getItem("lat")),
        lng: parseFloat(localStorage.getItem("lng")),
      });

      if (res?.data?.status === "1") {
        if (
          res?.data?.data?.list?.length > 0 &&
          res?.data?.data?.productList?.length > 0
        ) {
          setPending("data");
        } else {
          setPending("empty");
        }
        setSearchResult(res?.data);
      } else {
        error_toaster(res?.data?.message);
        setPending("error");
      }
    } catch (error) {
      console.error("Search Error:", error);
      setPending("error");
    }
  };

  useEffect(() => {
    const termToSearch = searchTerm?.trim() || q?.trim();

    if (termToSearch?.length > 0) {
      searchFunction();
    } else {
      setPending("recent");
    }
  }, [searchTerm, q]);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setSearchTerm("");
    setPending("recent");
  };
  const [isAbsolute, setIsAbsolute] = useState(false);
  const handleScroll = () => {
    if (window.scrollY > 200) {
      setIsAbsolute(true);
    } else {
      setIsAbsolute(false);
    }
  };

  const handleModalScroll = (event) => {
    setModalScroll(event.target.scrollTop);
  };

  const navigateToDashboard = (tab) => {
    if (window.location.pathname === "/dashboard") {
      navigate("/temp-route");
      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            tab: tab,
          },
        });
      }, 0);
    } else {
      navigate("/dashboard", {
        state: {
          tab: tab,
        },
      });
    }
  };

  const drawerBodyRef = useRef(null);
  const handleDrawerScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    setDrawerScroll(scrollTop);
  };

  useEffect(() => {
    if (drawerBodyRef.current) {
      drawerBodyRef.current.addEventListener("scroll", handleDrawerScroll);
    }
    return () => {
      if (drawerBodyRef.current) {
        drawerBodyRef.current.removeEventListener("scroll", handleDrawerScroll);
      }
    };
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    if (location.pathname === "/restaurant-details/detail") {
      if (localStorage.getItem("how") || localStorage.getItem("when")) {
        setDeliveryData({
          ...deliveryData,
          how: parseInt(localStorage.getItem("how")) ?? 0,
          when: parseInt(localStorage.getItem("when")) ?? 0,
        });
      }
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    searchTerm.length < 1 && setIsFocused(false);
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        searchFunction();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const inputStyle =
    " font-sf w-full resize-none font-normal text-base text-theme-black-2 rounded-lg py-3 px-4 bg-white border-2 border-theme-gray-12 placeholder:text-black placeholder:text-opacity-40 focus:outline-none focus:border-2 focus:border-green-700 hover:border-2 hover:border-green-700 hover:cursor-pointer";

  const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const handleCutlary = () => {
    if (existingCartItems?.length === 1) {
      localStorage.removeItem("cutleryList");
    }
  };

  const currencySign =
    existingCartItems?.length > 0 ? existingCartItems[0].currencySign : "";

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

  const [currentPosition, setCurrentPosition] = useState({
    lat: 0,
    lng: 0,
  });
  const [hasPositionChanged, setHasPositionChanged] = useState(false);
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

  //delete group
  const delGroup = async () => {
    let res = await PostAPI("users/deleteGroup", {
      orderId:
        JSON.parse(localStorage.getItem("groupData"))?.orderId ||
        localStorage.getItem("orderId"),
    });
    if (res?.data?.status === "1") {
      info_toaster(res?.data?.message);
      localStorage.removeItem("groupData");
      localStorage.removeItem("groupOrder");
      localStorage.removeItem("gLink");
      setGroupDrawer(false);
      setGroup({ ...group, show: 0 });
    } else {
      info_toaster(res?.data?.message);
    }
  };

  //Remove Member
  const removeMember = async (orderId, userId) => {
    let res = await PostAPI("users/removeMember", {
      orderId,
      userId,
    });
    if (res?.data?.status === "1") {
      if (gData?.hostebBy?.id != localStorage.getItem("userId")) {
        localStorage.removeItem("groupData");
        localStorage.removeItem("groupOrder");
        success_toaster("Group left successfully");
      } else {
        success_toaster(res?.data?.message);
      }

      setGroupDrawer(false);
      setGroup({ ...group, show: 0 });
    } else {
      info_toaster(res?.data?.message);
    }
  };

  //Leave Group it has no events
  const leaveGroup = async (orderId, userId) => {
    let res = await PostAPI("users/leaveGroup", {
      orderId,
      userId,
    });
    if (res?.data?.status === "1") {
      localStorage.removeItem("groupData");
      localStorage.removeItem("groupOrder");
      success_toaster("Group left successfully");
      setGroupDrawer(false);
      setGroup({ ...group, show: 0 });
      localStorage.removeItem("groupOrder");
      localStorage.removeItem("groupData");
      localStorage.removeItem("gLink");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("hasJoinedGroup");
      localStorage.removeItem("guestJoined");
      navigate("/");
    } else {
      info_toaster(res?.data?.message);
    }
  };

  //Lock Group
  const lockGroup = async (orderId, isLocked) => {
    let res = await PostAPI("users/lockGroupOrder", {
      orderId,
      isLocked: isLocked ? false : true,
    });
    if (res?.data?.status === "1") {
      success_toaster(res?.data?.message);
      setGroupDrawer(false);
      setGroup({ ...group, show: 0 });
    } else {
      info_toaster(res?.data?.message);
    }
  };

  //Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      mini_toaster("Copied to Clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  //Sockets Events
  const GroupEvents = (response, text) => {
    if (text == "deleteGroup") {
      localStorage.removeItem("groupOrder");
      localStorage.removeItem("groupData");
      localStorage.removeItem("gLink");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("hasJoinedGroup");
      localStorage.removeItem("guestJoined");
      info_toaster("Group deleted");
    } else if (text == "removeMember") {
      localStorage.removeItem("groupOrder");
      localStorage.removeItem("groupData");
      localStorage.removeItem("gLink");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("hasJoinedGroup");
      localStorage.removeItem("guestJoined");
      info_toaster("You are removed from the group");
      navigate("/pk");
    } else if (text == "placeGroupOrder") {
      localStorage.removeItem("groupOrder");
      localStorage.removeItem("groupData");
      localStorage.removeItem("gLink");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("hasJoinedGroup");
      localStorage.removeItem("guestJoined");
      let userId = parseInt(localStorage.getItem("userId"));
      if (gData && gData?.hostebBy?.id !== userId) {
        navigate("/pk");
        setGData("");
      } else {
        setGData("");
      }
    } else if (text == "groupOrder") {
      setGData(response?.data);
    }
    setGData(response?.data);
  };

  const handleConnect = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      const map = {
        userId: userId,
        type: "connected",
      };

      socket.emit("message", JSON.stringify(map), (ack) => {
        console.log("[DEBUG] Emit confirmation received:", ack);
        if (ack) {
          setEvents((prevEvents) => [
            ...prevEvents,
            {
              eventType: "emit_confirmation",
              data: ack,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        } else {
          console.warn("[DEBUG] Emit did not receive acknowledgment");
        }
      });

      console.log("Socket connected");
    }
  };

  //handle substitution function here for store

  const handleSubstitution = (RPLinkId, action, replaceWithValue) => {
    if (cartItems) {
      const updatedCartItems = cartItems?.map((item) => {
        if (item?.RPLinkId === RPLinkId) {
          if (action === "refund") {
            return {
              ...item,
              isSubstitutionAllow: false,
              isRefund: true,
              replace: "",
            };
          }

          if (action === "replace") {
            return {
              ...item,
              isSubstitutionAllow: true,
              isRefund: false,
              replace: replaceWithValue,
            };
          }

          if (action === "replaceWithValue") {
            return {
              ...item,
              replaceWithValue: replaceWithValue,
              replace: replaceWithValue,
            };
          }
        } else if (
          replaceWithValue === "substitute" &&
          !item?.hasOwnProperty("isSubstitutionAllow")
        ) {
          return {
            ...item,
            isSubstitutionAllow: true,
            isRefund: false,
            replace: "",
          };
        }
        return item;
      });

      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
      setReplacewith((prev) => {
        return {
          ...prev,
          isSubstitutionAllow: !prev.isSubstitutionAllow,
        };
      });
    } else {
      console.log("No items found in the cart.");
    }
  };

  useEffect(() => {
    handleConnect();

    const handleDisconnect = (reason) => {
      console.log("Disconnected:", reason);
      reconnect();
    };

    const handleConnectError = (error) => {
      console.error("Connection Error:", error);
    };

    const handleGroupOrder = (data) => {
      try {
        const res = JSON.parse(data);
        console.log(data, "socket groupOrder");
        GroupEvents(res, "groupOrder");
      } catch (error) {
        console.error("Error parsing groupOrder data:", error);
      }
    };

    const handleDeleteGroup = (data) => {
      try {
        const res = JSON.parse(data);
        console.log(data, "socket deleteGroup");
        GroupEvents(res, "deleteGroup");
      } catch (error) {
        console.error("Error parsing deleteGroup data:", error);
      }
    };

    const handleRemoveMember = (data) => {
      try {
        const res = JSON.parse(data);
        console.log(data, "socket removeMember");
        GroupEvents(res, "removeMember");
      } catch (error) {
        console.error("Error parsing removeMember data:", error);
      }
    };
    const handlePlaceGroupOrder = (data) => {
      try {
        const res = JSON.parse(data);
        console.log(data, "socket placeGroupOrder");
        GroupEvents(res, "placeGroupOrder");
      } catch (error) {
        console.error("Error parsing removeMember data:", error);
      }
    };

    const reconnect = () => {
      console.log("Attempting to reconnect...");
      if (!socket.connected) {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const map = {
            userId: userId,
          };
          socket.emit("re-connect", JSON.stringify(map));
        }
      }
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("groupOrder", handleGroupOrder);
    socket.on("deleteGroup", handleDeleteGroup);
    socket.on("removeMember", handleRemoveMember);
    socket.on("placeGroupOrder", handlePlaceGroupOrder);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("groupOrder", handleGroupOrder);
      socket.off("deleteGroup", handleDeleteGroup);
      socket.off("removeMember", handleRemoveMember);
    };
  }, [socket]);

  const closeForgetModal = () => {
    setForgotModal(false);
    setForgotData({
      email: "",
      OTP: "",
      password: "",
      confirmPassword: "",
      userId: "",
      forgetRequestId: "",
    });
    setForgotStep(1);
    setForgotVisible({ password: false, confirmPassword: false });
  };

  const [modalHeight, setModalHeight] = useState(0);
  const [addressModalHeight, setAddressModalHeight] = useState(0);

  useEffect(() => {
    const updateModalHeight = () => {
      let newHeight = window.innerHeight;
      let addressModHeight = window.innerHeight;
      newHeight =
        window.innerHeight - window.innerHeight * 0 - window.innerHeight * 0.12;
      addressModHeight =
        window.innerHeight - window.innerHeight * 0 - window.innerHeight * 0.2;
      setModalHeight(newHeight);
      setAddressModalHeight(addressModHeight);
    };
    updateModalHeight();
    window.addEventListener("resize", updateModalHeight);

    return () => {
      window.removeEventListener("resize", updateModalHeight);
    };
  }, []);
  const [stockChange, setStockChange] = useState(false);
  const [changedItems, setChangedItems] = useState([]);
  const [quantityChange, setQuantityChange] = useState([]);

  const [unavailableItems, setUnavailableItems] = useState([]);
  const [quantityChangedItems, setQuantityChangedItems] = useState([]);

  const handleCartPage = async () => {
    if (activeResData?.smallOrderFee) {
      if (Number(totalPrice) < Number(activeResData?.minOrderAmount)) {
        const difference =
          Number(activeResData?.minOrderAmount) - Number(totalPrice);
        localStorage.setItem("smallOrderFee", difference.toString());
      } else {
        localStorage.removeItem("smallOrderFee");
      }
    } else {
      if (Number(totalPrice) < Number(activeResData?.minOrderAmount)) {
        setDrawerCart(false);
        setMinimumOrderModal(true);
        return;
      }
    }

    if (
      localStorage.getItem("loginStatus") === "true" ||
      localStorage.getItem("guestJoined")
    ) {
      const groupOrder = localStorage.getItem("groupOrder");
      const groupData = localStorage.getItem("groupData");
      const userId = localStorage.getItem("userId");

      // Check stock before navigating
      const items = cartItems?.map((item) => ({
        id: item.RPLinkId,
        price: item.unitPrice,
        qty: item.quantity,
      }));

      let res = await PostAPI("users/stockCheck", {
        productList: items,
      });

      if (res?.data?.status === "1") {
        const changed = res?.data?.data?.newList?.filter(
          (item) => item.isChange
        );
        setChangedItems(changed);
        const quantityChanged = res?.data?.data?.newList?.filter((item) => {
          const cartItem = cartItems.find(
            (cartItem) => cartItem.RPLinkId === item.RPLinkId
          );
          return cartItem?.quantity > item.stock;
        });

        setQuantityChangedItems(quantityChanged);

        const unavailable = changed
          .filter((item) => item.stock === 0 || item.stock == null)
          .map((item) => ({ id: item.id, name: item.name }));
        setUnavailableItems(unavailable);

        if (unavailable.length > 0) {
          setStockChange(true);

          // Remove unavailable items (stock 0 or null) from cart
          const updatedCart = cartItems.filter(
            (cartItem) => !unavailable.some((un) => un.id === cartItem.RPLinkId)
          );
          console.log("Updated cart:", updatedCart);

          localStorage.setItem("cartItems", JSON.stringify(updatedCart));
          setDrawerCart(false);
          return;
        }
      }

      // Proceed with navigation if no stock changes
      if (
        groupOrder &&
        (gData?.hostebBy?.id || gData?.hostebBy?.id) != userId &&
        existingCartItems.length > 0
      ) {
        navigate(`/${countryCode || "pk"}/group-order/${groupId}/lobby`);
      } else if (
        groupData &&
        (gData?.hostebBy?.id || gData?.hostebBy?.id) == userId
      ) {
        navigate("/checkout");
      } else if (!window.location.href.includes("group-order")) {
        navigate("/checkout");
      } else {
        setGroupDrawer(true);
      }

      setGroupDrawer(false);
    } else {
      setModal(true);
      setDrawerCart(false);
    }
  };

  const groupCheckItem = () => {
    return gData?.participantList?.some((member) => {
      return member?.items?.length > 0;
    });
  };

  const isGroupItemsExists = groupCheckItem();
  const isHost = gData?.hostebBy?.id == userId;

  return (
    <>
      <Modal
        isOpen={modal || props.loginModal}
        onClose={closeModal}
        size={md ? "xl" : "sm"}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          maxW={["500px"]}
          className="modal-content-custom"
          overflow={"hidden"}
        >
          <ModalHeader
            p={0}
            boxShadow={
              modalScroll > 10 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none"
            }
            transition="all 0.3s ease"
            position="absolute"
            top={modalScroll > 10 ? "0" : "-10px"}
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
            {createAccountTab === 1 ? (
              <>
                <h3
                  className={`font-sf font-normal ${
                    modalScroll > 10
                      ? "text-base text-center mt-2 block"
                      : "hidden"
                  }`}
                >
                  Create an account or log in
                </h3>
              </>
            ) : null}
          </ModalHeader>

          <div
            onClick={closeAddressModal}
            className="absolute z-20 top-5 right-4 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
          >
            <IoClose size={30} />
          </div>

          <ModalBody position={"relative"} padding={0}>
            {createAccountTab === 1 ? (
              <>
                <div
                  onScroll={handleModalScroll}
                  className="mt-2 mb-5 space-y-7 ultraLargeDesktop:h-screen-minus-53vh largeDesktop:h-screen-minus-30vh md:h-screen-minus-12vh h-screen-minus-10vh overflow-auto px-4  custom-scrollbar"
                  style={md ? { maxHeight: modalHeight, height: "auto" } : {}}
                >
                  <div className={`flex flex-col  justify-center space-y-4 `}>
                    <h3
                      className={`font-omnes font-bold text-2xl sm:text-[32px] mt-16 `}
                    >
                      Create an account or log in
                    </h3>
                    <p
                      className={`font-normal md:text-base text-base text-theme-black-2   font-sf `}
                    >
                      Log in below or create a new Fomino account.
                    </p>
                  </div>
                  <div className="space-y-2 font-semibold md:text-base text-sm">
                    <button
                      onClick={signInWithGoogleFunc}
                      className="font-sf relative py-[13px] px-5 flex justify-center items-center w-full bg-transparent border-2  border-theme-gray-12 rounded-lg hover:bg-theme-gray-12 transition-all duration-75 text-base font-bold  "
                    >
                      <FcGoogle
                        size={md ? 24 : 20}
                        className="absolute left-2.5"
                      />
                      <span>Continue with Google</span>
                    </button>
                    <button
                      onClick={signInWithAppleFunc}
                      className="font-sf  relative py-[14px] px-5 flex justify-center items-center w-full text-white bg-theme-black hover:bg-opacity-95 border border-theme-black rounded-lg transition-all duration-75 text-base font-bold "
                    >
                      <BsApple
                        size={md ? 24 : 20}
                        className="absolute left-2.5"
                      />
                      <span>Continue with Apple</span>
                    </button>
                    <button
                      onClick={signInWithFacebookFunc}
                      className="font-sf  relative py-[14px] px-5 flex justify-center items-center w-full text-white bg-theme-blue-2  hover:bg-opacity-95 border rounded-lg transition-all duration-75 text-base font-bold "
                    >
                      <FaFacebook
                        size={md ? 24 : 20}
                        className="absolute left-2.5"
                      />
                      <span>Continue with Facebook</span>
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 grid-cols-4 items-center">
                    <div className="border border-black border-opacity-20 h-0"></div>
                    <div className="font-sf md:col-span-1 col-span-2 font-normal text-theme-black-2 text-sm text-opacity-85 text-center">
                      or login with email
                    </div>
                    <div className="border border-black border-opacity-20 h-0"></div>
                  </div>
                  <form onSubmit={loginFunc} className="space-y-2">
                    <FloatingLabelInput
                      id="email"
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={onChange}
                      placeholder="Email"
                    />

                    <div className="relative">
                      <FloatingLabelInput
                        id="password"
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={onChange}
                        placeholder="Password"
                        isPassword={true}
                      />
                    </div>
                    <button
                      type="submit"
                      className="!mt-4 font-sf py-[14px] px-5 w-full font-bold  text-base text-white bg-theme-red hover:bg-opacity-95 border border-theme-red rounded-lg"
                    >
                      Login
                    </button>
                  </form>
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setModal(false);
                        setForgotModal(true);
                      }}
                      className="font-sf  font-normal text-sm text-theme-black-2 text-opacity-60"
                    >
                      Forgot your Password?
                    </button>
                  </div>
                  <p className="font-sf font-normal  text-xs text-theme-black-2 text-opacity-65 ">
                    Please visit fomino
                    <button className="text-theme-blue">
                      Privacy Statement
                    </button>
                    in English to learn about personal data processing at
                    fomino. You can access your local privacy statement related
                    to your fomino account in the next phase of registration
                    after you have provided the country and language preference
                    applicable to you.
                  </p>
                </div>
              </>
            ) : createAccountTab === 2 ? (
              <div className=" h-auto overflow-auto flex flex-col  p-5">
                <img
                  src="/images/group-order/group-order-2.gif"
                  alt=""
                  className=""
                />
                <h1 className="text-[28px] font-bold font-omnes ">
                  Do you want to link this account?
                </h1>
                <p className="font-sf text-sm opacity-80 mt-3">
                  Looks like you already have an account with these details.
                  Would you like to link your accounts?
                </p>
                <button
                  onClick={handleSendMergeOtp}
                  className="mt-4 py-4 mx-auto w-full font-semibold text-sm bg-[#F9D7D9] text-theme-red-2 rounded-lg flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner size="sm" /> : "Yes, link account"}
                </button>
              </div>
            ) : createAccountTab === 3 ? (
              <div className="custom-scrollbar md:max-h-screen-minus-5vh ultraLargeDesktop:max-h-screen-minus-40vh max-h-screen-minus-9vh h-auto flex flex-col justify-center items-center">
                <img
                  src="/images/groupOrder3.gif"
                  alt=""
                  className="w-96 h-full"
                />
                <form onSubmit={mergeAccounts} className="mt-5 mb-3 mx-5">
                  <h4 className="font-bold text-[28px] font-omnes">
                    Great, check your inbox!
                  </h4>
                  <p className="font-normal text-base text-black text-opacity-60 font-sf">
                    {`We've just sent an OTP to 
                    ${email} to merge account Please check your email.`}
                  </p>
                  <div className="flex justify-center my-2">
                    <HStack>
                      <PinInput
                        value={mergeOtp}
                        onChange={(e) => setMergeOtp(e)}
                        placeholder={false}
                      >
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                      </PinInput>
                    </HStack>
                  </div>
                  <div className="font-sf font-medium text-base text-center py-2">
                    <span>Didn't Receive? </span>
                    <button
                      type="button"
                      onClick={handleSendMergeOtp}
                      className="underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="mt-2 py-2.5 px-5 w-full font-semibold md:text-base text-sm text-white bg-theme-red border border-theme-red rounded font-sf"
                  >
                    Verify OTP
                  </button>
                </form>
              </div>
            ) : (
              <></>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={signUpModal}
        onClose={closeSignUpModal}
        size={md ? "xl" : "sm"}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          maxW={["500px"]}
          className="modal-content-custom"
          overflow={"hidden"}
        >
          <ModalHeader px={4}>
            <div
              className={`flex flex-col  justify-center ${
                modalScroll > 10 ? "mt-0" : "mt-5"
              } ${signUpStep === 3 ? "hidden" : "block"}`}
            >
              <h3
                className={`font-omnes font-bold   ${
                  modalScroll > 10
                    ? "text-base text-center mt-2"
                    : "text-[32px] mt-7"
                }`}
              >
                {signUpStep === 1
                  ? "Create an account or log in"
                  : signUpStep === 2
                  ? "Sign up"
                  : ""}
              </h3>
              <p
                className={`font-normal text-base  text-theme-black-2  font-sf ${
                  modalScroll > 10 || signUpStep !== 1 ? "hidden" : "block"
                }`}
              >
                Log in below or create a new Fomino account.
              </p>
            </div>
          </ModalHeader>
          <div
            onClick={closeSignUpModal}
            className="absolute z-20 top-5 right-4 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
          >
            <IoClose size={30} />
          </div>
          <ModalBody padding={0}>
            <div
              onScroll={handleModalScroll}
              className="mt-2 mb-5 space-y-7 max-h-[calc(100vh-200px)] h-auto overflow-auto px-4 custom-scrollbar"
            >
              {signUpStep === 1 ? (
                <>
                  <div className="space-y-3 font-semibold md:text-base text-sm">
                    <button
                      onClick={signInWithGoogleFunc}
                      className="font-sf relative py-[14px] px-5 flex justify-center items-center w-full bg-transparent border-2  border-theme-gray-12 rounded-lg hover:bg-theme-gray-12 transition-all duration-75 text-base font-bold "
                    >
                      <FcGoogle
                        size={md ? 24 : 20}
                        className="absolute left-2.5"
                      />
                      <span>Continue with Google</span>
                    </button>
                    <button
                      onClick={signInWithAppleFunc}
                      className="font-sf  relative py-[14px] px-5 flex justify-center items-center w-full text-white bg-theme-black hover:bg-opacity-95 border border-theme-black rounded-lg transition-all duration-75 text-base font-bold "
                    >
                      <BsApple
                        size={md ? 24 : 20}
                        className="absolute left-2.5"
                      />
                      <span>Continue with Apple</span>
                    </button>
                    <button
                      onClick={signInWithFacebookFunc}
                      className="font-sf  relative py-[14px] px-5 flex justify-center items-center w-full text-white bg-theme-blue-2  hover:bg-opacity-95 border rounded-lg transition-all duration-75 text-base font-bold "
                    >
                      <FaFacebook
                        size={md ? 24 : 20}
                        className="absolute left-2.5"
                      />

                      <span>Continue with Facebook</span>
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 grid-cols-4 items-center">
                    <div className="border border-black border-opacity-20 h-0"></div>
                    <div className="font-sf md:col-span-1 col-span-2 font-normal text-theme-black-2 text-sm text-opacity-85 text-center">
                      or sign up with email
                    </div>
                    <div className="border border-black border-opacity-20 h-0"></div>
                  </div>
                  <button
                    onClick={() => setSignUpStep(2)}
                    className="font-sf py-[14px] px-5 w-full font-bold text-base text-white bg-theme-red hover:bg-opacity-95 border border-theme-red rounded-lg"
                  >
                    Sign up with email
                  </button>
                  <p className="font-sf font-normal  text-xs text-theme-black-2 text-opacity-65">
                    Please visit fomino
                    <button className="text-theme-blue">
                      Privacy Statement
                    </button>
                    in English to learn about personal data processing at
                    fomino. You can access your local privacy statement related
                    to your fomino account in the next phase of registration
                    after you have provided the country and language preference
                    applicable to you
                  </p>
                </>
              ) : signUpStep === 2 ? (
                <>
                  <form
                    onSubmit={
                      signUpData?.signedFrom === "google" ||
                      signUpData?.signedFrom === "apple.com"
                        ? signUpWithGoogleFunc
                        : signUpFunc
                    }
                    className="space-y-2 mt-3"
                  >
                    <FloatingLabelInput
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={signUpData.firstName}
                      onChange={onChange2}
                      placeholder="First Name"
                    />

                    <FloatingLabelInput
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={signUpData.lastName}
                      onChange={onChange2}
                      placeholder="Last Name"
                    />

                    {signUpData.signedFrom !== "apple" && (
                      <FloatingLabelInput
                        id="email"
                        type="email"
                        name="email"
                        value={signUpData.email}
                        onChange={onChange2}
                        placeholder="Email"
                      />
                    )}
                    <div className="flex gap-x-1">
                      <CountrySelect
                        labels={en}
                        value={signUpData.countryCode || "+92"}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, countryCode: code })
                        }
                      />
                      <FloatingLabelInput
                        id="phoneNum"
                        type="number"
                        name="phoneNum"
                        value={signUpData.phoneNum}
                        onChange={(e) =>
                          handlePhoneNumberChange(e.target.value)
                        }
                        placeholder="Phone Number"
                      />
                    </div>
                    <span className="text-xs mt-1 text-theme-red-2">
                      {phoneError}
                    </span>

                    {signUpData.signedFrom === "" ? (
                      <div className="relative">
                        <FloatingLabelInput
                          id="password"
                          type="password"
                          name="password"
                          value={signUpData.password}
                          onChange={onChange2}
                          placeholder="Create Password"
                          isPassword={true}
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                    <FloatingLabelInput
                      value={signUpData.referalCode}
                      onChange={onChange2}
                      type="referalCode"
                      name="referalCode"
                      placeholder="Enter Referral Code"
                    />

                    <button
                      type="submit"
                      className=" !mt-5 font-sf py-[14px] px-5 w-full font-semibold md:text-base text-sm text-white bg-theme-red hover:bg-opacity-95 border border-theme-red rounded-lg"
                    >
                      Next
                    </button>
                  </form>
                </>
              ) : signUpStep === 3 ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-center items-center">
                      <img
                        src="/images/girl.webp"
                        alt="girl"
                        className="w-36"
                      />
                    </div>
                    <form onSubmit={otpFunc}>
                      <h4 className="font-bold text-[28px] font-omnes">
                        Great, check your inbox!
                      </h4>
                      <p className="font-normal text-base text-black text-opacity-60 font-sf">
                        We've just sent a sign-in link to
                        {localStorage.getItem("email")} Please check your spam
                        folder in case you didn't get the email.
                      </p>
                      <div className="flex justify-center my-2">
                        <HStack>
                          <PinInput
                            value={otp}
                            onChange={(e) => setOtp(e)}
                            placeholder={false}
                          >
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                          </PinInput>
                        </HStack>
                      </div>
                      <div className="font-sf font-medium text-base text-center py-2">
                        <span>Didn't Receive? </span>
                        <button
                          type="button"
                          onClick={resendOTPfunc}
                          className="underline"
                        >
                          Resend OTP
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="mt-2 py-2.5 px-5 w-full font-semibold md:text-base text-sm text-white bg-theme-red border border-theme-red rounded font-sf"
                      >
                        Verify OTP
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={forgotModal}
        onClose={closeForgetModal}
        size={md ? "xl" : "sm"}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          maxW={["510px", "510px"]}
          className="modal-content-custom show-modal "
        >
          <ModalHeader></ModalHeader>
          <div
            onClick={closeForgetModal}
            className="absolute z-20 top-5 right-6 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
          >
            <IoClose size={30} />
          </div>
          <ModalBody padding={0}>
            <div className="max-h-[calc(100vh-200px)] h-auto overflow-auto">
              <form
                onSubmit={
                  forgotStep === 1
                    ? forgotStepOneFunc
                    : forgotStep === 2
                    ? forgotStepTwoFunc
                    : forgotStep === 3
                    ? forgotStepThreeFunc
                    : ""
                }
                className="flex flex-col justify-center items-center gap-y-4 px-5 pb-10  text-center"
              >
                {forgotStep === 1 ? (
                  <>
                    <div>
                      <img
                        src="/images/lock.webp"
                        alt="lock"
                        className="h-24 w-24"
                      />
                    </div>
                    <h6 className="font-bold font-omnes text-[32px]">
                      Forgot password
                    </h6>
                    <p className="font-normal text-base  text-theme-black-2 font-sf">
                      Provide your account email for which you want to reset
                      your password
                    </p>
                    <input
                      value={forgotData.email}
                      onChange={handleForgotChange}
                      type="email"
                      name="email"
                      className={inputStyle}
                      placeholder="Email"
                    />
                    <button
                      type="submit"
                      className="py-[14px] px-5 w-full font-semibold md:text-base text-sm text-white bg-theme-red border border-theme-red rounded-lg"
                    >
                      Next
                    </button>
                  </>
                ) : forgotStep === 2 ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-center items-center">
                        <img
                          src="/images/girl.webp"
                          alt="girl"
                          className="w-36"
                        />
                      </div>
                      <div className="text-start space-y-3">
                        <h4 className="font-bold text-2xl font-omnes">
                          Great, check your inbox!
                        </h4>
                        <p className="font-normal text-base text-theme-black-2 text-opacity-65">
                          We've just sent a sign-in link to
                          {localStorage.getItem("email")} Please check your spam
                          folder in case you didn't get the email.
                        </p>
                        <div className="flex justify-center my-2 font-sf">
                          <HStack>
                            <PinInput
                              placeholder={false}
                              value={forgotData.OTP}
                              onChange={(e) =>
                                setForgotData({ ...forgotData, OTP: e })
                              }
                              size="lg"
                            >
                              <PinInputField />
                              <PinInputField />
                              <PinInputField />
                              <PinInputField />
                            </PinInput>
                          </HStack>
                        </div>
                        <div className="font-sf text-center font-medium text-base">
                          Didn't Receive?
                          <button
                            type="button"
                            onClick={forgotStepOneFunc}
                            className="underline"
                          >
                            Resend OTP
                          </button>
                        </div>
                        <button
                          type="submit"
                          className="font-sf mt-2 py-4 px-5 w-full font-semibold md:text-base text-sm text-theme-red bg-theme-red bg-opacity-10 border border-theme-red border-opacity-10 rounded"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </div>
                  </>
                ) : forgotStep === 3 ? (
                  <>
                    <div>
                      <img
                        src="/images/wifi.webp"
                        alt="wifi"
                        className="h-24 w-24"
                      />
                    </div>
                    <div className="space-y-1">
                      <h6 className="font-bold text-[28px] font-omnes">
                        Change Password
                      </h6>
                      <p className="font-normal text-base font-sf text-theme-black-2">
                        Your identity has been verified set your new password
                      </p>
                    </div>
                    <div className="space-y-2 w-full">
                      <div className="relative">
                        <input
                          value={forgotData.password}
                          onChange={handleForgotChange}
                          type={forgotVisible.password ? "text" : "password"}
                          name="password"
                          className={inputStyle}
                          placeholder="Password"
                        />
                        <button
                          onClick={() =>
                            setForgotVisible({
                              ...forgotVisible,
                              password: !forgotVisible.password,
                            })
                          }
                          type="button"
                          className="text-black text-opacity-40 absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          {forgotVisible.password ? (
                            <AiOutlineEye size={20} />
                          ) : (
                            <AiOutlineEyeInvisible size={20} />
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          value={forgotData.confirmPassword}
                          onChange={handleForgotChange}
                          type={
                            forgotVisible.confirmPassword ? "text" : "password"
                          }
                          name="confirmPassword"
                          className={inputStyle}
                          placeholder="Confirm Password"
                        />
                        <button
                          onClick={() =>
                            setForgotVisible({
                              ...forgotVisible,
                              confirmPassword: !forgotVisible.confirmPassword,
                            })
                          }
                          type="button"
                          className="text-black text-opacity-40 absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          {forgotVisible.confirmPassword ? (
                            <AiOutlineEye size={20} />
                          ) : (
                            <AiOutlineEyeInvisible size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="py-4 px-5 w-full font-semibold md:text-base text-sm text-white bg-theme-red border border-theme-red rounded"
                    >
                      Next
                    </button>
                  </>
                ) : forgotStep === 4 ? (
                  <>
                    <div>
                      <img
                        src="/images/check.webp"
                        alt="check"
                        className="h-24 w-24"
                      />
                    </div>
                    <div className="space-y-1">
                      <h6 className="font-bold text-[28px] font-omnes">
                        Password updated
                      </h6>
                      <p className="font-normal text-base font-sf">
                        Your password has been updated!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(1);
                        setForgotModal(false);
                        setForgotData({
                          email: "",
                          OTP: "",
                          password: "",
                          confirmPassword: "",
                          userId: "",
                          forgetRequestId: "",
                        });
                      }}
                      className="py-2.5 px-5 w-full font-semibold md:text-base text-sm text-white bg-theme-red border border-theme-red rounded"
                    >
                      Okay
                    </button>
                  </>
                ) : (
                  <></>
                )}
              </form>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

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
              style={
                md ? { maxHeight: addressModalHeight, height: "auto" } : {}
              }
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
                                    console.log("addr", addr);
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
                  <hr className="w-full" />
                  <div className="font-medium text-base text-theme-black-2  font-sf my-5 ps-5">
                    <button
                      onClick={() => setAddressTab(5)}
                      className="flex items-center gap-x-6"
                    >
                      <CustomMenubtn color="#202125" />

                      <span>{t("Browse all fomino cities")}</span>
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

      <Modal
        onClose={closeDetailsModal}
        isOpen={props.scheduleOrderModal}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          maxW={["600px"]}
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
                  detailsTab === 1
                    ? setDetailsTab(0)
                    : detailsTab === 2
                    ? setDetailsTab(1)
                    : detailsTab === 3
                    ? setDetailsTab(2)
                    : detailsTab === 4
                    ? setDetailsTab(3)
                    : detailsTab === 5
                    ? setDetailsTab(4)
                    : null;

                  setHasPositionChanged(false);
                }}
                className={`flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16 ${
                  detailsTab === 0 ? "invisible" : "visible"
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
                {detailsTab === 0
                  ? t("Order Details")
                  : detailsTab === 1
                  ? t("Where to?")
                  : detailsTab === 5
                  ? `${deliveryAddress.building}`
                  : t("Add New Address")}
              </motion.div>
              <div
                onClick={closeDetailsModal}
                className="flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
              >
                <IoClose size={30} />
              </div>
            </div>
          </ModalHeader>
          <ModalBody padding={0}>
            <div
              onScroll={handleModalScroll}
              className="max-h-[calc(100vh-200px)] h-auto overflow-auto font-sf custom-scrollbar"
            >
              {detailsTab === 0 ? (
                <div className="space-y-3">
                  <h3 className="px-4 text-[28px] font-bold font-omnes">
                    Orders detail
                  </h3>
                  <div className="p-1 rounded-full bg-theme-gray-4 grid grid-cols-2 mx-4 ">
                    <button
                      onClick={() => {
                        setDeliveryData({ ...deliveryData, how: 1 });
                        localStorage.setItem("how", 1);
                      }}
                      className={`py-2 px-5 font-bold text-base flex items-center justify-center gap-x-2 rounded-full text-theme-black-2 ${
                        deliveryData.how === 1 ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      <BiCycling size={24} />
                      <span>{t("Delivery")}</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeliveryData({ ...deliveryData, how: 2 });
                        localStorage.setItem("how", 2);
                      }}
                      className={`py-2 px-5 font-bold text-base flex items-center justify-center gap-x-2 rounded-full text-theme-black-2 ${
                        deliveryData.how === 2 ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      <FaWalking size={24} />
                      <span>Pickup</span>
                    </button>
                  </div>
                  {deliveryData.how === 1 && (
                    <>
                      <hr className="border-none h-[1px] bg-black bg-opacity-10  !my-4" />
                      <div className="px-4 space-y-3">
                        <div className="font-semibold text-xl font-omnes ">
                          {t("Where to?")}
                        </div>
                        <div className="bg-white rounded-lg border-2 border-checkoutGrayBorder  my-4 mb-12">
                          <div
                            className="flex items-center justify-between gap-x-2 px-4 py-3 cursor-pointer"
                            onClick={() => setDetailsTab(1)}
                          >
                            <div className="flex items-center gap-x-3">
                              <span>
                                <IoMdHome size={28} />
                              </span>
                              <div>
                                <div className="text-base font-semibold">
                                  {deliveryData.how === 1 ? (
                                    deliveryAddress?.id !== "" ? (
                                      <span className="font-semibold">
                                        {`${deliveryAddress?.AddressType}`}:{" "}
                                        <span className="text-gray-400 font-light">
                                          {" "}
                                          {`${deliveryAddress.streetAddress}`}{" "}
                                        </span>
                                      </span>
                                    ) : (
                                      "Please add a delivery address"
                                    )
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </div>
                            </div>

                            {deliveryData.how === 1 && (
                              <div className="">
                                <GoChevronRight size={22} color="#202125" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="px-4 space-y-3">
                    <div className="font-semibold text-xl font-omnes ">
                      When?
                    </div>
                    <div
                      className={`flex items-center space-x-4 px-4 py-3 mt-4 border-2 rounded-lg ${
                        deliveryData.when === 1 && "border-theme-green-2"
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
                        checked={deliveryData?.when === 1}
                        className="custom-radio "
                      />
                      <label
                        htmlFor="when-asap"
                        className="w-full cursor-pointer flex items-center space-x-4"
                      >
                        <div>
                          <label className="font-sf font-semibold text-base">
                            Standard
                          </label>
                          <p className="text-sm font-light text-checkoutTextColor/65">
                            {deliveryData?.how === 1
                              ? activeResData?.deliveryTime?.split(" ")[0] +
                                "-" +
                                (parseInt(activeResData?.deliveryTime) + 10)
                              : activeResData?.pickupTime?.split(" ")[0] +
                                "-" +
                                (parseInt(activeResData?.pickupTime) + 10)}{" "}
                            min
                          </p>
                        </div>
                      </label>
                    </div>
                    <div
                      className={`flex items-center space-x-4 px-4 py-3 mt-2 border-2 rounded-lg ${
                        deliveryData.when === 2 && "border-theme-green-2"
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
                        className="custom-radio "
                      />
                      <label
                        htmlFor="when-later"
                        className="w-full cursor-pointer flex items-center space-x-4"
                      >
                        <div>
                          <label className="font-sf font-semibold text-base">
                            Schedule
                          </label>
                          <p className="text-sm font-light text-checkoutTextColor/65">
                            Choose a delivery time
                          </p>
                        </div>
                      </label>
                    </div>

                    {deliveryData.when === 2 && (
                      <div className="flex  justify-between space-x-4 my-3 mb-5 relative z-50 w-full">
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
                          className="rounded-xl font-sf w-full"
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
                          className="rounded-xl font-sf w-full"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        closeDetailsModal();
                      }}
                      className=" font-sf font-semibold !mt-4 my-5 py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red  "
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : detailsTab === 1 ? (
                <div className="px-4 mt-4">
                  <div className="space-y-4">
                    <h4 className="text-3xl text-bold font-bold font-omnes  text-theme-black-2">
                      {t("Where to?")}
                    </h4>
                    {getAllAddressess?.data?.data?.addressList
                      ?.filter(
                        (fil) =>
                          fil.AddressType &&
                          fil.AddressType?.toString().length > 0
                      )
                      ?.map((addr, index) => (
                        <div key={index} className="space-y-4">
                          <div className="flex items-center gap-x-4">
                            <button className="flex justify-center items-center text-end outline-none w-8 h-12 flex-shrink-0  ">
                              {addr?.AddressType === "Home" ? (
                                <IoHome size={28} />
                              ) : addr?.AddressType === "Work" ? (
                                <ImOffice size={24} />
                              ) : addr?.AddressType === "Other" ? (
                                <MdEditCalendar size={24} />
                              ) : (
                                <></>
                              )}
                            </button>
                            <div className="flex justify-between gap-x-5 items-center w-full ">
                              <div>
                                <p className="text-base font-medium text-theme-black-2">
                                  {addr?.AddressType}
                                </p>
                                <div className="text-sm font-normal text-black text-opacity-40 font-sf ellipsis6">
                                  {`${addr?.building}, ${addr?.streetAddress}`}
                                </div>
                              </div>
                              {addr?.lat !== localStorage.getItem("lat") &&
                              addr?.lng !== localStorage.getItem("lng") ? (
                                <div className="">
                                  <button
                                    onClick={() => {
                                      localStorage.setItem("lat", addr?.lat);
                                      localStorage.setItem("lng", addr?.lng);
                                      localStorage.setItem(
                                        "guestFormatAddress",
                                        `${addr?.AddressType} (${addr?.building})`
                                      );
                                      setDeliveryAddress({
                                        id: addr?.id,
                                        lat: addr?.lat,
                                        lng: addr?.lng,
                                        building: addr?.building,
                                        city: addr?.city,
                                        AddressType: addr?.AddressType,
                                        locationType: addr?.locationType,
                                        state: addr?.state,
                                        streetAddress: addr?.streetAddress,
                                        zipCode: addr?.zipCode,
                                        entrance: addr?.entrance,
                                        door: addr?.door,
                                        instructions: addr?.instructions,
                                        other: addr?.other || false,
                                      });
                                      navigate(
                                        `${location.pathname}/${location.search}`
                                      );
                                      setDetailsTab(0);
                                    }}
                                    className=" bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-[11px] px-4 font-medium"
                                  >
                                    {t("Choose")}
                                  </button>
                                </div>
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>

                          {index !==
                            getAllAddressess?.data?.data?.addressList.length -
                              1 && <hr className="max-w-[32.7rem] ms-auto" />}
                        </div>
                      ))}
                  </div>

                  <div className="font-medium text-base text-theme-black-2  font-sf mt-5  ">
                    <button
                      onClick={() => setDetailsTab(2)}
                      className="flex items-center gap-x-4"
                    >
                      <FaPlus size={20} />
                      <span className="ms-2">{t("Add new address")}</span>
                    </button>
                  </div>
                </div>
              ) : detailsTab === 2 ? (
                <div className="px-4">
                  <div className="space-y-4">
                    <h4 className="capitalize text-3xl text-theme-black-2 font-bold font-omnes ">
                      {t("Add New Address")}
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
                      className="rounded-xl"
                    />
                    <Autocomplete
                      onLoad={(autocomplete) =>
                        (autocompleteRef.current = autocomplete)
                      }
                      options={countriesRestriction}
                    >
                      <FloatingLabelInput placeholder="Enter the location" />
                    </Autocomplete>
                  </div>
                  <div>
                    <button
                      className="font-sf font-semibold my-5 py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red "
                      onClick={() => {
                        setDetailsTab(3);
                      }}
                    >
                      {t("Continue")}
                    </button>
                  </div>
                  <div className="  ">
                    <img
                      className="w-full h-full mx-auto  object-cover"
                      src="/images/addAddress.gif"
                      alt="address"
                    />
                  </div>
                </div>
              ) : detailsTab === 3 ? (
                <div className="px-4 mt-3">
                  <div className="space-y-4">
                    <div>
                      <h4 className="capitalize text-3xl text-theme-black-2 font-bold font-omnes mb-3 ">
                        What kind of location is this?
                      </h4>
                      <p className="text-theme-black-2 text-base font-normal opacity-60">
                        Help us find you faster by identifying the type of
                        location this is.
                      </p>
                    </div>
                    <div className="flex items-center gap-x-4">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 ">
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
                            setDetailsTab(4);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-semibold"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-4">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0">
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
                            setDetailsTab(4);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 font-semibold bg-[#37946524]"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-4">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 ">
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
                            setDetailsTab(4);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 font-semibold bg-[#37946524] "
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-4">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0  ">
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
                            setDetailsTab(4);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 font-semibold bg-[#37946524]"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                  </div>
                </div>
              ) : detailsTab === 4 ? (
                <div className="px-4">
                  <div className="space-y-4">
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
                          value={deliveryAddress?.entrance}
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
                        setDetailsTab(5);
                      }}
                      className="font-sf flex items-center justify-center gap-x-3 text-[#E13743] bg-theme-red-2 bg-opacity-15  font-medium w-full rounded-lg px-3 py-[15px]"
                    >
                      <GrMapLocation />
                      {hasPositionChanged
                        ? "Edit tmeeting point on the map"
                        : "Add a meeting point on the map"}
                    </button>
                    <div className="space-y-1 pb-16">
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
              ) : (
                <div className="h-[calc(100vh-200px)] rest-footer overflow-hidden sm:rounded-b-[20px] md:rounded-b-[20px] relative">
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
                    className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[95%] font-semibold text-base py-4 px-5 bg-theme-red text-white rounded-lg"
                    onClick={() => {
                      setDetailsTab(4);
                    }}
                  >
                    {t("Continue")}
                  </button>
                </div>
              )}
            </div>
          </ModalBody>
          {detailsTab !== 5 && <ModalFooter py={2}></ModalFooter>}
        </ModalContent>
      </Modal>

      <Modal
        onClose={() => setSearchItemModal(false)}
        isOpen={searchItemModal}
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
              modalScroll > 200 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none"
            }
            transition="all 0.3s ease"
            position="absolute"
            top={modalScroll > 200 ? "0" : "-60px"}
            left="0"
            right="0"
            backgroundColor="#fff"
            zIndex={10}
            opacity={modalScroll > 200 ? 1 : 0}
            visibility={modalScroll > 200 ? "visible" : "hidden"}
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
                  modalScroll > 192 ? "block" : "hidden"
                } text-base text-center capitalize my-5 font-sf font-medium text-theme-black-2`}
              >
                {searchItemModalData?.name}
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
              className="pb-10 max-h-[calc(100vh-150px)] extraLargeDesktop:max-h-[calc(100vh-250px)] ultraLargeDesktop:max-h-[calc(100vh-56vh)] h-auto overflow-auto custom-scrollbar"
              style={
                md ? { maxHeight: addressModalHeight, height: "auto" } : {}
              }
            >
              <div className="w-full h-[292px] mb-3">
                <img
                  className="w-full h-full object-cover"
                  src={BASE_URL + searchItemModalData?.image}
                  alt=""
                />
              </div>
              <div className=" px-4">
                <h4 className="!text-[32px] max-w-[400px]  text-theme-black-2 font-omnes font-bold capitalize  leading-10">
                  {searchItemModalData?.name}
                </h4>
                <p className="font-sf text-lg my-5 text-red-600">
                  {searchItemModalData?.R_MCLink?.restaurant?.zoneRestaurant
                    ?.zone?.zoneDetail?.currencyUnit?.symbol +
                    " " +
                    searchItemModalData?.discountPrice}
                </p>
                <p className="capitalize text-sm font-sf text-theme-black-2  font-normal mt-3">
                  {searchItemModalData?.description}
                </p>
                <p className="text-gray-600 font-sf font-normal text-xs mt-8">
                  ORDER FROM
                </p>

                <div
                  onClick={() => {
                    navigate(
                      `/${countryCode?.toLowerCase()}/${cityName.toLowerCase()}/${
                        searchItemModalData?.R_MCLink?.restaurant
                          ?.businessType == "1"
                          ? "restaurants"
                          : "stores"
                      }/${
                        searchItemModalData?.R_MCLink?.restaurant?.businessName
                          .toLowerCase()
                          ?.split(" ")
                          .join("-") +
                        ("-" +
                          (searchItemModalData?.R_MCLink?.restaurant
                            ?.businessType == "1"
                            ? "res"
                            : "store") +
                          "-") +
                        searchItemModalData?.R_MCLink?.restaurant?.id
                      }`
                    );
                  }}
                  className="w-full flex justify-between items-center shadow-restaurantCardSahadow rounded-lg mt-4 pr-4 cursor-pointer"
                >
                  <div className="flex gap-x-2 items-center">
                    <div className="w-32 h-20 rounded-lg p-3">
                      <img
                        className="w-full h-full object-cover"
                        src={BASE_URL + searchItemModalData?.image}
                        alt=""
                      />
                    </div>
                    <div>
                      <h4 className="font-bold font-sf text-lg line-clamp-1 text-theme-black-2">
                        {searchItemModalData?.name}
                      </h4>
                      <p className="text-sm text-gray-600 font-light flex gap-x-2 items-center">
                        {" "}
                        <CustomDeliveryIcon color="gray" size="16" />{" "}
                        {searchItemModalData?.R_MCLink?.restaurant
                          ?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit
                          ?.symbol +
                          searchItemModalData?.R_MCLink?.restaurant
                            ?.deliveryCharge}{" "}
                        {
                          searchItemModalData?.R_MCLink?.restaurant
                            ?.approxDeliveryTime
                        }{" "}
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
                  `/${countryCode?.toLowerCase()}/${cityName?.toLowerCase()}/${
                    searchItemModalData?.R_MCLink?.restaurant?.businessType ==
                    "1"
                      ? "restaurants"
                      : "stores"
                  }/${
                    searchItemModalData?.R_MCLink?.restaurant?.businessName
                      .toLowerCase()
                      ?.split(" ")
                      .join("-") +
                    ("-" +
                      (searchItemModalData?.R_MCLink?.restaurant
                        ?.businessType == "1"
                        ? "res"
                        : "store") +
                      "-") +
                    searchItemModalData?.R_MCLink?.restaurant?.id
                  }/${
                    searchItemModalData?.name
                      ?.toLowerCase()
                      .split(" ")
                      .join("-") +
                    "-" +
                    searchItemModalData?.id
                  }`
                );
                setHeaderSearch({ ...headerSearch, isOpen: false });
                setIsFocused(false);
                console.log("searchItemModalData", searchItemModalData);
              }}
              className="w-full flex justify-center bg-theme-red text-white font-sf font-bold text-base py-4 rounded-lg cursor-pointer"
            >
              Start ordering
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        onClose={() => {
          setStockChange(false);
        }}
        isOpen={stockChange}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          //   maxW={["510px", "510px", "600px"]}
          className="modal-content-custom"
        >
          <ModalHeader px={4} pt={4} pb={2} ml="auto">
            <div
              onClick={() => {
                setPaymentModal(false);
              }}
              className="flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
            >
              <IoClose size={30} />
            </div>
          </ModalHeader>

          <ModalBody padding={0}>
            <div className="font-sf px-4 max-h-[calc(100vh-200px)] h-auto overflow-auto space-y-3 ">
              <h2 className="font-omnes font-bold text-[28px]">Cart updates</h2>
              <p className="font-sf text-sm text-theme-black-2 text-opacity-65">
                Some items in your cart were updated or removed due to limited
                availbility
              </p>
              <h2 className="font-omnes font-semibold text-xl">
                Quantity changes
              </h2>{" "}
              <div className="space-y-3 text-base">......</div>
              <h2 className="font-omnes font-semibold text-xl">
                Unavailable items
              </h2>
              <div className="space-y-3 text-base">
                {unavailableItems.map((item, index) => (
                  <p key={index}>{item.name}</p>
                ))}
              </div>
              <button
                onClick={() => {
                  setStockChange(false);
                }}
                className="mx-auto  w-full font-semibold text-base py-4 px-5 bg-theme-red text-white rounded"
              >
                {t("Got it")}
              </button>
            </div>
          </ModalBody>
          <ModalFooter px="4" py={2}></ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        onClose={() => {
          setMinimumOrderModal(false);
        }}
        isOpen={minimumOrderModel}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          //   maxW={["510px", "510px", "600px"]}
          className="modal-content-custom"
        >
          <ModalHeader px={4} pt={5} pb={4} ml="auto"></ModalHeader>

          <ModalBody padding={0}>
            <div className="font-sf px-4 max-h-[calc(100vh-200px)] h-auto overflow-auto space-y-3 ">
              <h2 className="text-center font-omnes text-[24px] font-semibold">
                {` Minimum order amount must be ${activeResData?.minOrderAmount}`}
              </h2>
              <p className="font-sf text-base text-theme-black-2 text-opacity-85 !my-3">
                Your cart does not meet the minimum order amount. Please add
                more items
              </p>

              <button
                onClick={() => {
                  setMinimumOrderModal(false);
                }}
                className="mx-auto  w-full font-semibold text-base py-3 px-5 bg-theme-red text-white rounded"
              >
                {t("Got it")}
              </button>
            </div>
          </ModalBody>
          <ModalFooter px="4" py={2}></ModalFooter>
        </ModalContent>
      </Modal>
      <Drawer
        placement={"right"}
        onClose={() => {
          setDrawer(false);
          setInviteFriend(0);
          setDrawerScroll(0);
          props?.setProfileDrawer(false);
        }}
        isOpen={drawer || props?.profileDrawer}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent
          className="rounded-s-xl wrelative w-full"
          maxW="550px"
          overflow={"hidden"}
        >
          <DrawerHeader
            className="rounded-tl-xl"
            p={0}
            boxShadow={
              drawerScroll > 10 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none"
            }
            transition="all 0.3s ease"
            position="absolute"
            top={drawerScroll > 10 ? "0" : "-60px"}
            left="0"
            right="0"
            backgroundColor="#fff"
            zIndex={10}
            opacity={drawerScroll > 10 ? 1 : 0}
            visibility={drawerScroll > 10 ? "visible" : "hidden"}
            height="70px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <div className="flex justify-center w-full px-4 sm:px-6">
              {/* <button
                onClick={() => {
                  setDrawer(false);
                  setDrawerScroll(0);
                  props.setProfileDrawer(false);
                }}
              >
                <FaChevronLeft />
              </button> */}

              <motion.div
                className="font-semibold text-base font-sf flex justify-center items-center "
                initial={{ opacity: 0, y: "-1rem" }}
                animate={{
                  opacity: drawerScroll > 10 ? 1 : 0,
                  y: drawerScroll > 10 ? 0 : "-1rem", // Move to center on scroll
                }}
                transition={{
                  duration: 0.5, // Adjust the transition speed
                  delay: 0.2, // Add a delay of 0.2 seconds
                }}
              >
                Profile
              </motion.div>
            </div>
          </DrawerHeader>
          <DrawerBody px={0} ref={drawerBodyRef} onScroll={handleDrawerScroll}>
            {inviteFriend === 0 ? (
              <section className="font-sf md:px-6 px-4 ">
                <div className="space-y-6">
                  <div className="flex justify-between items-center mt-4 absolute top-2 left-5 z-10">
                    <button
                      onClick={() => {
                        setDrawer(false);
                        props.setProfileDrawer(false);
                        setDrawerScroll(0);
                      }}
                    >
                      <FaChevronLeft />
                    </button>
                    <div></div>
                  </div>

                  <h1 className="font-omnes font-bold text-[32px] capitalize text-theme-black-2 !mt-12">
                    <span className="me-2">Howdy</span>
                    {localStorage.getItem("userName")
                      ? (() => {
                          const fullName = localStorage.getItem("userName");
                          const [firstName] = fullName.split(" ");
                          return `${firstName} `;
                        })()
                      : "User"}
                  </h1>
                  <div className="flex  items-start justify-start gap-7">
                    <div
                      className={` h-[120px] uppercase font-bold text-3xl  rounded-full w-[120px] md:h-[120px] flex justify-center items-center ${
                        localStorage.getItem("loginStatus") === "true"
                          ? "bg-theme-red bg-opacity-20 text-theme-red"
                          : "bg-theme-gray-6 bg-opacity-60 text-white"
                      }`}
                    >
                      {localStorage.getItem("loginStatus") === "true" &&
                      localStorage.getItem("userName").length > 0 ? (
                        getProfile?.data?.data?.image ? (
                          <img
                            src={`${BASE_URL}${getProfile?.data?.data?.image}`}
                            alt=""
                            className="w-[120px]  h-[120px] object-cover rounded-full"
                          />
                        ) : (
                          <span className="initials">
                            {`${
                              extractFirstLetters(
                                localStorage.getItem("userName")
                              )?.firstLetter
                            }${
                              extractFirstLetters(
                                localStorage.getItem("userName")
                              )?.secondLetter
                            }`}
                          </span>
                        )
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <div className="flex flex-col gap-2 text-theme-black-2">
                      <h2 className="text-2xl font-semibold font-omnes mt-3 capitalize">
                        Hi,
                        {localStorage.getItem("userName")
                          ? localStorage.getItem("userName")
                          : "User"}
                      </h2>
                      <p className="font-sf  text-sm font-normal text-theme-black-2 text-opacity-60">
                        {getProfile?.data?.data?.phoneNum ? (
                          <>
                            {getProfile?.data?.data?.countryCode}
                            {getProfile.data.data.phoneNum}
                          </>
                        ) : (
                          <></>
                        )}
                      </p>
                      <p className="font-sf  text-sm font-normal text-theme-black-2 text-opacity-60">
                        {localStorage.getItem("userEmail") || ""}
                      </p>
                      <div className="flex gap-10">
                        <div>
                          <p className="text-base font-bold  font-sf  capitalize">
                            {getProfile?.data?.data?.totalOrders}
                          </p>
                          <p className="text-theme-black-2 text-opacity-60 font-normal">
                            {t("Orders")}
                          </p>
                        </div>
                        <div>
                          <p className="text-base font-bold font-sf  capitalize">
                            {getProfile?.data?.data?.creditPoints}
                          </p>
                          <p className="text-theme-black-2 text-opacity-60 font-normal">
                            {t("Tokens")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12">
                    <div className="flex justify-between items-center">
                      <h2 className="text-theme-black-2 font-omnes text-2xl font-semibold">
                        {t("Favorites")}
                      </h2>
                      <Link
                        to={"/favourites "}
                        className="bg-[#40875D1A] text-[#40875D] text-sm px-2.5 py-1 rounded-lg"
                      >
                        {t("See all")}
                      </Link>
                    </div>
                    <div className="flex flex-shrink-0 overflow-x-auto gap-x-3 py-3">
                      {data?.data?.all.length > 0 ? (
                        <>
                          <div className="swiper-container w-full">
                            <Swiper
                              spaceBetween={16}
                              slidesPerView={
                                xl ? 1.3 : lg ? 1.4 : md ? 1.3 : 1.2
                              }
                              modules={[Navigation]}
                              className="[&>div>div>button]:shadow-cardShadow pb-4 pt-1 ps-1"
                            >
                              {data?.data?.all.map((res, index) => (
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
                                    time={res?.time}
                                    onClick={() => {
                                      resDetails(
                                        res?.id,
                                        res?.city,
                                        res?.country,
                                        res?.businessName.toLowerCase(),
                                        item?.businessType
                                      );
                                      localStorage.removeItem("how");
                                      localStorage.removeItem("when");
                                    }}
                                    logoWidth="w-[60px] h-[60px]"
                                    size="sm"
                                  />
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </div>
                        </>
                      ) : (
                        <p>
                          {t(
                            "You’ll find your favorite restaurants and stores here. You can add favorites by tapping the heart icon."
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 my-2 mt-6">
                  <div>
                    <div className="text-theme-black-2 font-omnes text-2xl font-semibold mb-3">
                      {t("Quick Links")}
                    </div>
                    <DrawerItem
                      Icon={() => (
                        <img
                          src="/images/inviteFriend.svg"
                          alt="Invite Friends"
                          style={{ width: "24px", height: "24px" }}
                        />
                      )}
                      text={t("Invite Friends")}
                      onClick={() => {
                        navigateToDashboard("Credits");
                      }}
                    />
                    <DrawerItem
                      Icon={() => (
                        <img
                          src="/images/stampCard.svg"
                          alt="Invite Friends"
                          style={{ width: "24px", height: "24px" }}
                        />
                      )}
                      text={t("Stamp Card")}
                      onClick={() => navigate("/stamp-card")}
                    />
                    <DrawerItem
                      Icon={MdOutlineSupportAgent}
                      text={t("Support")}
                      onClick={() => {
                        navigateToDashboard("Help & Support");
                      }}
                    />
                    <DrawerItem
                      Icon={FaBicycle}
                      text={t("Become a courier")}
                      onClick={() => navigate("/driver-home")}
                    />
                    <DrawerItem
                      Icon={RxCounterClockwiseClock}
                      text={t("Order history")}
                      onClick={() => {
                        navigateToDashboard("Order History");
                      }}
                    />
                    <DrawerItem
                      Icon={MdOutlineTableRestaurant}
                      text={t("Table Bookings")}
                      onClick={() => {
                        navigateToDashboard("Table Bookings");
                      }}
                    />
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-theme-black-2 font-omnes text-2xl font-semibold mb-2">
                        {t("Recent Orders")}
                      </h2>
                    </div>
                    {getProfile?.data?.data?.recentOrder ? (
                      <div
                        onClick={() => {
                          navigateToDashboard("Order History");
                        }}
                      >
                        <RecentOrderCard
                          data={getProfile?.data?.data?.recentOrder}
                        />
                      </div>
                    ) : (
                      <>
                        <p>{t("No Recent Order Yet")}</p>
                      </>
                    )}
                  </div>
                  <div>
                    <div className="text-theme-black-2 font-omnes text-2xl font-semibold mb-2">
                      Settings
                    </div>
                    <DrawerItem
                      Icon={TbUserCircle}
                      text={t("Account")}
                      onClick={() => {
                        navigateToDashboard("Account");
                      }}
                    />
                    <DrawerItem
                      Icon={MdPayment}
                      text={t("Payment methods")}
                      onClick={() => {
                        navigateToDashboard("Payment methods");
                      }}
                    />
                    <DrawerItem
                      Icon={FaRegAddressBook}
                      text={t("My addresses")}
                      onClick={() => {
                        navigateToDashboard("My addresses");
                      }}
                    />
                    {localStorage.getItem("loginStatus") === "true" ? (
                      <>
                        <DrawerItem
                          onClick={logoutFunc}
                          Icon={MdLogout}
                          text={t("Logout")}
                        />
                      </>
                    ) : (
                      <>
                        <DrawerItem
                          onClick={() => {
                            setModal(true);
                            setDrawer(false);
                          }}
                          Icon={GrUserAdmin}
                          text="Log in"
                        />
                        <DrawerItem
                          onClick={() => setSignUpModal(true)}
                          Icon={FiLogOut}
                          text="Sign up"
                        />
                      </>
                    )}
                  </div>
                </div>
              </section>
            ) : inviteFriend === 1 ? (
              <div className="py-2 space-y-6 font-tt ">
                <div className="font-black font-tt text-2xl">
                  <h5>Invite friends, get fomino credits</h5>
                </div>
                <div className="space-y-7">
                  <div className="flex gap-x-4">
                    <div>
                      <div className="min-w-[40px] min-h-[40px] bg-theme-red bg-opacity-20 text-theme-red font-bold text-xl flex justify-center items-center rounded-fullest">
                        1
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h6 className="font-bold text-xl">Share your code</h6>
                      <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                        Your friends will get $ 4 in Fomino credits for eachof
                        their first 3 delivery orders when they use your code to
                        sign up for Fomino.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-x-4">
                    <div>
                      <div className="min-w-[40px] min-h-[40px] bg-theme-red bg-opacity-20 text-theme-red font-bold text-xl flex justify-center items-center rounded-fullest">
                        2
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h6 className="font-bold text-xl">Earn credits</h6>
                      <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                        You'll get $ 2 Fomino credits every time a friend
                        completes one of their first 3 delivery orders. <br />
                        <br />
                        You can earn a maximum of $ 18 in credits by inviting
                        your friends to join Fomino.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-3 items-center">
                    <div className="py-3 px-5 w-full flex justify-center uppercase bg-theme-gray-10 rounded font-extrabold text-base">
                      {getProfile?.data?.data?.referalCode}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          (getProfile?.data?.data?.referalCode)
                            .toString()
                            .toUpperCase()
                        );
                        info_toaster("Copied to clipboard");
                      }}
                      className="py-3 px-5 w-full bg-theme-red text-white rounded font-bold text-base"
                    >
                      Share your code
                    </button>
                    <button
                      onClick={() => setInviteFriend(2)}
                      className="font-medium text-base text-theme-red"
                    >
                      How does this work?
                    </button>
                  </div>
                </div>
              </div>
            ) : inviteFriend === 2 ? (
              <div className="py-2 space-y-6 font-tt">
                <div className="font-extrabold text-2xl">
                  <h5>How does this work?</h5>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h6 className="font-bold text-xl">Share your code</h6>
                    <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                      Your friends will get $ 4 in Fomino credits for eachof
                      their first 3 delivery orders when they use your code to
                      sign up for Fomino.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h6 className="font-bold text-xl">Earn credits</h6>
                    <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                      You'll get $ 2 Fomino credits every time a friend
                      completes one of their first 3 delivery orders. <br />
                      <br />
                      You can earn a maximum of $ 18 in credits by inviting your
                      friends to join Fomino.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h6 className="font-bold text-xl">Please note</h6>
                    <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                      Credit can be used for delivery orders only. When your
                      friends gets credits, they'll expire 30 days after signing
                      up to Fomino. Your credits will expire30 days after your
                      friend makes their first order. <br />
                      <br />
                      Stay tuned! Happy sharing!
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <button className="font-medium text-base text-theme-red">
                      Terms and Conditions
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* cart drawer */}
      <Drawer
        placement={"right"}
        onClose={() => {
          setDrawerCart(false);
          setCounter(null);
          setDrawerMsg(false);
          setHeaderDrawer(false);
        }}
        isOpen={drawerCart}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent className="rounded-s-xl relative w-full" maxW="550px">
          <DrawerHeader
            className="rounded-tl-xl"
            p={0}
            boxShadow={
              drawerScroll > 100 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none"
            }
            transition="all 0.3s ease"
            position="absolute"
            top={drawerScroll > 100 ? "0" : "-60px"}
            left="0"
            right="0"
            backgroundColor="#fff"
            zIndex={10}
            opacity={drawerScroll > 100 ? 1 : 0}
            visibility={drawerScroll > 100 ? "visible" : "hidden"}
            height="70px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <p className="font-medium text-base">
              {substitution ? "Substitution" : "Your Order"}
            </p>
          </DrawerHeader>

          <DrawerBody
            ref={drawerBodyRef}
            className="mt-5   w-full !pb-0  custom-scrollbar "
            onScroll={handleDrawerScroll}
            px={0}
          >
            <div className="space-y-6 font-sf px-4 mb-28">
              <div className="flex justify-between items-center mt-10  ">
                {drawerMsg === false ? (
                  <h2 className="text-[32px] font-bold font-omnes text-theme-black-2">
                    Your order
                  </h2>
                ) : (
                  ""
                )}
                <button
                  onClick={() => {
                    setDrawerCart(false);
                    setHeaderDrawer(false);
                    setCounter(null);
                    setDrawerMsg(false);
                    setDrawerScroll(0);
                  }}
                  className="absolute right-5 top-4 z-10 rounded-full bg-[#F4F5FA] w-10 h-10 text-xl flex justify-center items-center 
               hover:bg-[#e5e5e5] focus:outline-none  focus:ring-[#e5e5e5]"
                >
                  <IoMdClose className="text-black text-2xl" />
                </button>
              </div>
              <div
                className={` flex flex-col justify-between  ${
                  drawerMsg === false ? "min-h-[64vh]  " : "h-auto "
                } `}
              >
                {drawerMsg === false ? (
                  <>
                    <div>
                      <div className="flex justify-between my-3 ">
                        <h2 className="font-omnes  text-xl font-semibold ">
                          Order items
                        </h2>
                      </div>

                      {cartItems?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-3/5 mt-24">
                          <img
                            src="/images/emptyCart.png" // path to your GIF file
                            alt="Empty cart"
                            className="w-64 h-full object-contain"
                          />
                          <h2 className="text-[28px] font-omnes font-bold">
                            Your cart is empty
                          </h2>
                          <p className="mt-2 text-gray-500 text-sm font-sf text-center px-4">
                            When you add items from a restaurant or store, your
                            order will be shown right here. You can make changes
                            whenever you want.
                          </p>
                        </div>
                      ) : (
                        <div className="">
                          <div className="h-3/5 overflow-y-auto   ">
                            {cartItems?.map((cartI, index) => (
                              <div
                                key={index}
                                className="font-sf relative flex   sm:flex-row items-start rounded-2xl h-full mb-3"
                              >
                                <div className="flex justify-center sm:w-[150px] w-[72px] sm:h-[72px] h-[72px] rounded-2xl ">
                                  <img
                                    src={`${BASE_URL}${cartI?.image}`}
                                    alt="cutlery"
                                    className="w-full h-full rounded-md object-cover "
                                  />
                                </div>
                                <div className="px-5 w-full font-sf">
                                  <h3 className="capitalize font-semibold text-base ">
                                    {cartI?.name}
                                  </h3>
                                  <div className="capitalize text-sm font-light text-[rgba(32,33,37,.9)] ">
                                    <ul>
                                      {cartI?.addOnsCat &&
                                      cartI?.addOnsCat?.length > 0
                                        ? cartI?.addOnsCat
                                            ?.filter(
                                              (ele) =>
                                                ele?.id ===
                                                cartI?.addOns?.find(
                                                  (fil) =>
                                                    fil?.collectionId ===
                                                    ele?.id
                                                )?.collectionId
                                            )
                                            ?.map((cat, key) => (
                                              <li key={key}>
                                                <span>{cat?.name}: </span>
                                                <br />
                                                {cartI?.addOns
                                                  ?.filter(
                                                    (fil) =>
                                                      fil?.collectionId ===
                                                      cat?.id
                                                  )
                                                  ?.map((add, addKey) => (
                                                    <div
                                                      key={addKey}
                                                      className="ml-2 mt-1"
                                                    >
                                                      {`${add?.quantity}x ${
                                                        add?.name
                                                      } ${
                                                        add?.total > 0
                                                          ? `(${add?.total}.00)`
                                                          : ""
                                                      }`}
                                                    </div>
                                                  ))}
                                              </li>
                                            ))
                                        : cartI?.addOns?.map((add, addKey) => (
                                            <li key={addKey}>
                                              <div className="ml-2 mt-1">
                                                {`${add?.quantity}x ${
                                                  add?.name
                                                } ${
                                                  add?.total > 0
                                                    ? `(${add?.total}.00)`
                                                    : ""
                                                }`}
                                              </div>
                                            </li>
                                          ))}
                                    </ul>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-x-3">
                                      <span className="font-semibold text-sm text-[#E13743] mt-1 ">
                                        {formatPrice(
                                          (cartI?.unitPrice +
                                            cartI?.addOns?.reduce(
                                              (accumulator, ele) => {
                                                return (
                                                  accumulator +
                                                  (ele?.total || 0) *
                                                    (ele?.quantity || 1)
                                                );
                                              },
                                              0
                                            )) *
                                            cartI?.quantity
                                        )}
                                        {activeResData?.currencyUnit || "CHF"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className=" cursor-pointer mt-2 mr-1  rounded-full flex items-center justify-around text-white p-1 absolute bg-black right-0">
                                  {counter === index ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          const quan = parseInt(
                                            cartI?.quantity
                                          );
                                          if (quan > 1) {
                                            const incCart = cartItems?.find(
                                              (ele) =>
                                                ele?.RPLinkId ===
                                                cartI?.RPLinkId
                                            );
                                            if (incCart) {
                                              incCart.quantity = quan - 1;
                                            }
                                            localStorage.setItem(
                                              "cartItems",
                                              JSON.stringify(cartItems)
                                            );
                                            navigate(
                                              `${
                                                location.pathname === "/"
                                                  ? ""
                                                  : location.pathname
                                              }${location.search}`
                                            );
                                          } else {
                                            setDeleteProductId(cartI.RPLinkId);
                                            handleCutlary();
                                            const existingIndex =
                                              cartItems.findIndex(
                                                (ele) =>
                                                  ele?.RPLinkId ===
                                                  cartI?.RPLinkId
                                              );
                                            if (existingIndex !== -1) {
                                              cartItems.splice(
                                                existingIndex,
                                                1
                                              );
                                              localStorage.setItem(
                                                "cartItems",
                                                JSON.stringify(cartItems)
                                              );
                                              setCounter(null);
                                              navigate(
                                                location.pathname
                                                  ? `${location.pathname}/${location.search}`
                                                  : "/"
                                              );
                                            }
                                          }
                                        }}
                                        className="w-8 h-8  flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
                                      >
                                        <RiSubtractFill />
                                      </button>

                                      <span className="text-lg font-sf w-7 text-center">
                                        {cartI?.quantity}
                                      </span>
                                      <button
                                        onClick={() => {
                                          const quan = parseInt(
                                            cartI?.quantity
                                          );
                                          const incCart = cartItems?.find(
                                            (ele) =>
                                              ele?.RPLinkId === cartI?.RPLinkId
                                          );
                                          if (incCart) {
                                            incCart.quantity = quan + 1;
                                          }
                                          localStorage.setItem(
                                            "cartItems",
                                            JSON.stringify(cartItems)
                                          );
                                          navigate(
                                            `${
                                              location.pathname === "/"
                                                ? ""
                                                : location.pathname
                                            }${location.search}`
                                          );
                                        }}
                                        className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
                                      >
                                        <BiPlus />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const quan = parseInt(
                                            cartI?.quantity
                                          );
                                          const incCart = cartItems?.find(
                                            (ele) =>
                                              ele?.RPLinkId === cartI?.RPLinkId
                                          );
                                          if (incCart) {
                                            incCart.quantity = quan - quan;
                                          }
                                          const existingIndex =
                                            cartItems.findIndex(
                                              (ele) =>
                                                ele?.RPLinkId ===
                                                cartI?.RPLinkId
                                            );
                                          if (existingIndex !== -1) {
                                            cartItems.splice(existingIndex, 1);
                                            localStorage.setItem(
                                              "cartItems",
                                              JSON.stringify(cartItems)
                                            );
                                            setCounter(null);
                                            navigate(
                                              `${
                                                location.pathname === "/"
                                                  ? ""
                                                  : location.pathname
                                              }${location.search}`
                                            );
                                          }
                                          handleCutlary();
                                          setDeleteProductId(incCart.RPLinkId);
                                        }}
                                        className="w-8 h-8  flex justify-center items-center rounded-full hover:bg-red-600 hover:text-white duration-300"
                                      >
                                        <BiTrash />
                                      </button>
                                    </>
                                  ) : (
                                    <span
                                      onClick={() => handleCounterClick(index)}
                                      className="text-lg font-sf w-7 text-center"
                                    >
                                      {cartI?.quantity}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* <div>
                      {cutleryData.length > 0 && <hr className="my-5" />}
                      <div>
                        {cutleryData.length > 0 &&
                          cutleryData.map((item, index) => (
                            <div
                              key={index}
                              className="relative flex items-center rounded-2xl md:px-3 md:py-2 px-3 shadow-restaurantCardSahadow h-full w-full space-x-3"
                            >
                              <div className="w-[100px] h-[100px] flex justify-center items-center rounded-2xl border-transparent">
                                <span className="w-[100px] h-[100px] rounded-2xl">
                                  <img
                                    src={`${BASE_URL}${item.image}`}
                                    alt="cutlery"
                                    className="w-full h-full object-cover rounded-2xl"
                                  />
                                </span>
                              </div>
                              <div className="pl-2">
                                <h3 className="font-semibold md:text-xl text-md text-start capitalize text-ellipsis">
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="capitalize h-[32px] max-h-[32px] font-normal text-xs text-theme-gray-6 mt-1 w-4/5 text-start ellipsis2">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-3 w-full">
                                  <div className="flex items-center gap-x-1">
                                    <span className="font-semibold md:text-base text-sm">
                                      {item.currencyUnit}
                                      {item.price}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setIsCutleryAdded(true);
                                    }}
                                    className="absolute bottom-3 right-6 bg-black text-white rounded-fullest w-[40px] h-[40px] flex justify-center items-center border"
                                  >
                                    {item.qty ? item.qty : <FaPlus size={16} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div> */}
                  </>
                ) : (
                  <>
                    {substitution ? (
                      <div className="space-y-3 ">
                        <button
                          onClick={() => {
                            setDrawerMsg(false);
                            setSubstitution(false);
                          }}
                          className="absolute top-4 left-4 bg-theme-gray-4 w-10 h-10 rounded-full flex justify-center items-center z-10"
                        >
                          <FaArrowLeftLong size={20} />
                        </button>
                        <h5 className="text-[32px] font-bold font-omnes">
                          Substituition
                        </h5>
                        <p className="font-sf font-normal text-base text-theme-black-2 !mt-8 leading-[22px]">
                          Select whether you want sold items replaced or
                          refunded if you choose to have an item replaced , add
                          your preferences😊
                        </p>
                        <div className="bg-red-200 rounded-md px-3 p-4 !mb-5">
                          <h4 className="text-sm font-semibold text-theme-black-2 !mb-2">
                            No extra costs
                          </h4>
                          <p className="font-sf font-normal text-sm text-theme-black-2">
                            Replaced item do not cost you more. if a replacement
                            costs less, we'll refund you the difference
                          </p>
                        </div>
                        <div className="">
                          <div className="h-3/5 overflow-y-auto   ">
                            {cartItems?.map((cartI, index) => (
                              <div
                                key={index}
                                className="font-sf relative flex flex-col sm:flex-row items-start rounded-2xl h-full mb-3"
                              >
                                <div className="flex justify-center sm:w-[150px] w-[72px] sm:h-[72px] h-[72px] rounded-2xl">
                                  <img
                                    src={`${BASE_URL}${cartI?.image}`}
                                    alt="cutlery"
                                    className="w-full h-full rounded-md object-cover "
                                  />
                                </div>
                                <div className="px-5 w-full">
                                  <h3 className="text-theme-red font-semibold">
                                    {cartI?.quantity > 1
                                      ? cartI?.quantity + " x "
                                      : ""}{" "}
                                    <span className="capitalize font-semibold text-base text-theme-black-2">
                                      {" "}
                                      {cartI?.name}
                                    </span>
                                  </h3>
                                  <div className="capitalize text-sm font-light text-[rgba(32,33,37,.9)] ">
                                    <ul>
                                      {cartI?.addOnsCat
                                        ?.filter(
                                          (ele) =>
                                            ele?.id ===
                                            cartI?.addOns?.find(
                                              (fil) =>
                                                fil?.collectionId === ele?.id
                                            )?.collectionId
                                        )
                                        ?.map((cat, key) => (
                                          <li key={key}>
                                            <span>{cat?.name}: </span>
                                            <br />
                                            {cartI?.addOns
                                              ?.filter(
                                                (fil) =>
                                                  fil?.collectionId === cat?.id
                                              )
                                              ?.map((add, addKey) => (
                                                <div
                                                  key={addKey}
                                                  className="ml-2 mt-1"
                                                >
                                                  {`${add?.quantity}x ${
                                                    add?.name
                                                  } ${
                                                    add?.total > 0
                                                      ? `(${add?.total}.00)`
                                                      : ""
                                                  }`}
                                                </div>
                                              ))}
                                          </li>
                                        ))}
                                    </ul>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-x-3">
                                      <span className="font-semibold text-sm text-[#E13743] mt-1 ">
                                        {formatPrice(
                                          (cartI?.unitPrice +
                                            cartI?.addOns?.reduce(
                                              (accumulator, ele) => {
                                                return (
                                                  accumulator +
                                                  (ele?.total || 0) *
                                                    (ele?.quantity || 1)
                                                );
                                              },
                                              0
                                            )) *
                                            cartI?.quantity
                                        )}
                                        {cartI?.currencySign}
                                      </span>
                                    </div>
                                  </div>

                                  {/* ===========Substitute======= */}

                                  <div className="flex items-center justify-between [&>div>button]:px-3 [&>div>button]:text-sm [&>div>button]:font-medium my-3">
                                    <div className="flex gap-x-2">
                                      <button
                                        onClick={() => {
                                          handleSubstitution(
                                            cartI?.RPLinkId,
                                            "replace"
                                          );
                                        }}
                                        className={`border-2 rounded-full py-1 ${
                                          cartI?.isSubstitutionAllow == true
                                            ? "border-theme-green-2 text-theme-black-2"
                                            : "text-theme-black-2/60"
                                        }`}
                                      >
                                        Replace
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleSubstitution(
                                            cartI?.RPLinkId,
                                            "refund"
                                          );
                                        }}
                                        className={`border-2 rounded-full py-1  ${
                                          !cartI?.isSubstitutionAllow
                                            ? "border-theme-green-2 text-theme-black-2"
                                            : "text-theme-black-2/60"
                                        }`}
                                      >
                                        Refund
                                      </button>
                                    </div>
                                    <p
                                      onClick={() => {
                                        if (
                                          replacewith?.id?.includes(
                                            cartI?.RPLinkId
                                          ) &&
                                          cartI?.isSubstitutionAllow
                                        ) {
                                          handleSubstitution(
                                            cartI?.RPLinkId,
                                            "replaceWithValue",
                                            ""
                                          );
                                          setReplacewith({
                                            ...replacewith,
                                            id: replacewith?.id?.filter(
                                              (el) => el !== cartI?.RPLinkId
                                            ),
                                          });
                                        } else {
                                          setReplacewith({
                                            ...replacewith,
                                            id: [
                                              ...replacewith.id,
                                              cartI.RPLinkId,
                                            ],
                                          });
                                        }
                                      }}
                                      className={`font-medium text-sm ${
                                        !cartI?.isSubstitutionAllow
                                          ? "text-gray-500"
                                          : "text-red-500"
                                      } `}
                                    >
                                      {replacewith?.id?.includes(
                                        cartI?.RPLinkId
                                      )
                                        ? !cartI?.isSubstitutionAllow
                                          ? "Add preference"
                                          : "Clear"
                                        : "Add preference"}
                                    </p>
                                  </div>

                                  {replacewith?.id?.includes(cartI?.RPLinkId) &&
                                    cartI?.isSubstitutionAllow && (
                                      <div className="mt-3 mb-6">
                                        <FloatingLabelInput
                                          name={cartI?.RPLinkId}
                                          value={cartI.replaceWithValue}
                                          onChange={(e) => {
                                            handleSubstitution(
                                              cartI?.RPLinkId,
                                              "replaceWithValue",
                                              e.target.value
                                            );
                                          }}
                                          placeholder="Replace with"
                                          cursor="cursor-text"
                                        />
                                      </div>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 ">
                        <button
                          onClick={() => {
                            setDrawerMsg(false);
                          }}
                          className="absolute top-4 left-4 bg-theme-gray-4 w-10 h-10 rounded-full flex justify-center items-center z-10 hover:bg-theme-gray-16"
                        >
                          <FaArrowLeftLong size={20} />
                        </button>
                        <h5 className="text-[28px] font-bold font-omnes ">
                          Add comment
                        </h5>
                        <p className="font-sf font-normal text-sm">
                          Your comment may be shared with Fomino partners who
                          prepare and deliver your order.
                        </p>
                        <div></div>
                        {/* <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          name="note"
                          className="rounded-md w-full text-sm border border-black border-opacity-40 px-3 py-1  focus:outline-theme-green-2"
                          placeholder="Special requests, allergies, dietary restrictions, greeting card text..."
                          rows="5"
                        ></textarea> */}
                        <FloatingTextarea
                          name="note"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Special requests, allergies, dietary restrictions, greeting card text..."
                        />
                      </div>
                    )}
                    <button
                      className="bg-black text-white rounded-lg h-[54px] my-5 w-[94%] absolute bottom-0 left-1/2 transform -translate-x-1/2 min-h-14 z-10"
                      onClick={() => {
                        localStorage.setItem("note", note);

                        setSubstitution(false);
                        setDrawerMsg(false);
                      }}
                    >
                      Done
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className=" sticky  bottom-0   bg-white pb-2">
              {drawerMsg === false ? (
                <>
                  {activeResData?.restType == "store" && (
                    <hr className="my-4" />
                  )}
                  {activeResData?.restType == "store" && (
                    <div
                      onClick={() => {
                        setDrawerMsg("true");
                        setSubstitution(true);
                        handleSubstitution("", "", "substitute");
                      }}
                      className="flex gap-x-2 cursor-pointer items-center px-4"
                    >
                      <div>
                        <GoArrowSwitch className="text-3xl text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold font-sf text-theme-black-2 leading-6">
                          {JSON.parse(localStorage.getItem("activeResData"))
                            ?.restType == "store"
                            ? "Subsituition"
                            : ""}
                        </h4>
                        <p className="text-lg font-normal font-sf">
                          <div className="flex gap-x-3">
                            <p className="font-sf text-sm text-checkoutTextColor/65">
                              {" "}
                              Sold out items can be replaced
                            </p>
                          </div>
                        </p>
                      </div>

                      <button className="bg-theme-red bg-opacity-20 h-max ml-auto font-medium text-base text-theme-red rounded py-1.5 px-4">
                        Edit
                      </button>
                    </div>
                  )}
                  <hr className="my-4" />
                  <button
                    onClick={() => {
                      if (!localStorage.getItem("note")) {
                        setSubstitution(false);
                        setDrawerMsg("true");
                      }
                    }}
                    className="flex items-center justify-between py-5 text-start w-full"
                  >
                    <div className="flex gap-x-4 items-center px-4">
                      <div>
                        <img
                          src="/images/message.png"
                          className="w-6 h-6 object-cover mt-1"
                          alt="message"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold font-sf">
                          Add a message for the{" "}
                          {JSON.parse(localStorage.getItem("activeResData"))
                            ?.restType == "restaurant"
                            ? " restaurant"
                            : " store"}
                        </h4>
                        <p className="text-sm font-normal font-sf text-black text-opacity-40">
                          {localStorage.getItem("note")
                            ? localStorage.getItem("note")
                            : "Special requests, allergies, dietary instructions?"}
                        </p>
                      </div>
                    </div>

                    {localStorage.getItem("note") && (
                      <button
                        onClick={() => {
                          setDrawerMsg("true");
                          setSubstitution(false);
                        }}
                        className="me-4 bg-theme-red bg-opacity-20 font-medium text-base text-theme-red rounded py-1.5 px-4"
                      >
                        Edit
                      </button>
                    )}
                  </button>
                </>
              ) : (
                ""
              )}

              {drawerMsg === false ? (
                <>
                  {cartItems?.length > 0 ? (
                    <div className="text-center mt-4 px-4">
                      <button
                        className="bg-black font-bold text-white rounded-full px-5 min-h-14 w-full flex items-center justify-between"
                        onClick={handleCartPage}
                      >
                        <div className="flex space-x-4 items-center">
                          <div className="bg-white text-black text-sm  py-[1px] px-[7px] rounded-full">
                            {String(cartItems?.length).padStart(2)}
                          </div>
                          <p> Go to checkout </p>
                        </div>
                        {totalPrice} {activeResData?.currencyUnit}
                      </button>
                    </div>
                  ) : gData && isGroupItemsExists && isHost ? (
                    <div className="text-center mt-4 px-4">
                      <button
                        className="bg-theme-red font-bold text-white rounded-md px-5 min-h-14 w-full flex justify-center items-center"
                        onClick={handleCartPage}
                      >
                        <div className="flex justify-center space-x-4 items-center font-semibold">
                          <p> Continue without selection </p>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center mt-4 mx-4">
                      <button
                        onClick={() => {
                          navigate(`/${countryCode}/${cityName}/restaurants`);
                        }}
                        className="bg-black  font-bold  text-white rounded-full px-5 min-h-14 w-full    `` "
                      >
                        Add items
                      </button>
                    </div>
                  )}
                </>
              ) : (
                ""
              )}
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* group cart drawer  */}

      <Drawer
        isOpen={groupDrawer}
        placement="right"
        onClose={() => {
          setGroupDrawer(false);
          setGroup({ ...group, show: 0 });
        }}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent borderTopLeftRadius="15px" borderBottomLeftRadius="15px">
          <DrawerCloseButton bg="gray.100" rounded="full" />
          <DrawerHeader borderBottomWidth={"1px"}>
            {group?.show === 1 ? (
              <div className="w-full space-y-8">
                <h2 className="text-3xl font-black font-omnes mt-14">
                  Your Order
                </h2>
              </div>
            ) : (
              <div className="w-full space-y-8">
                <h2 className="text-3xl font-bold font-omnes mt-10">
                  Group summary
                </h2>

                <div className="flex gap-x-2 items-center w-full">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={
                        BASE_URL + gData?.groupIcon || "/images/userIcon.jpeg"
                      }
                      alt=""
                    />
                  </div>
                  <div className=" font-sf">
                    <h4 className="text-lg">{gData?.groupName}</h4>
                    <p className="text-sm text-gray-500">
                      order from {gData?.restaurant?.businessName}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DrawerHeader>

          <DrawerBody onClick={() => setCounter(null)}>
            {group?.show === 1 ? (
              <div className="w-full font-sf">
                <p className="font-semibold text-xl">Order items</p>
                <div className="w-full flex gap-x-2 mt-4">
                  <div className="h-3/5 overflow-y-auto ">
                    {cartItems?.map((cartI, index) => (
                      <div
                        key={index}
                        className="font-sf relative flex flex-col sm:flex-row items-start rounded-2xl h-full mb-3"
                      >
                        <div className="flex justify-center sm:w-[150px] w-[72px] sm:h-[72px] h-[72px] rounded-2xl">
                          <img
                            src={`${BASE_URL}${cartI?.image}`}
                            alt="cutlery"
                            className="w-full h-full rounded-md object-cover "
                          />
                        </div>
                        <div className="px-5 w-full">
                          <h3 className="capitalize font-semibold text-base ">
                            {cartI?.name}
                          </h3>
                          <div className="capitalize text-sm font-light text-[rgba(32,33,37,.9)] ">
                            <ul>
                              {cartI?.addOnsCat
                                ?.filter(
                                  (ele) =>
                                    ele?.id ===
                                    cartI?.addOns?.find(
                                      (fil) => fil?.collectionId === ele?.id
                                    )?.collectionId
                                )
                                ?.map((cat, key) => (
                                  <li key={key}>
                                    <span>{cat?.name}: </span>
                                    <br />
                                    {cartI?.addOns
                                      ?.filter(
                                        (fil) => fil?.collectionId === cat?.id
                                      )
                                      ?.map((add, addKey) => (
                                        <div key={addKey} className="ml-2 mt-1">
                                          {`${add?.quantity}x ${add?.name} ${
                                            add?.total > 0
                                              ? `(${add?.total}.00)`
                                              : ""
                                          }`}
                                        </div>
                                      ))}
                                  </li>
                                ))}
                            </ul>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-x-3">
                              <span className="font-semibold text-sm text-[#E13743] mt-1 ">
                                {formatPrice(
                                  (cartI?.unitPrice +
                                    cartI?.addOns?.reduce(
                                      (accumulator, ele) => {
                                        return (
                                          accumulator +
                                          (ele?.total || 0) *
                                            (ele?.quantity || 1)
                                        );
                                      },
                                      0
                                    )) *
                                    cartI?.quantity
                                )}
                                {localStorage.getItem("groupData")
                                  ? gData?.currencyDetails?.symbol
                                  : cartI?.currencySign}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className=" cursor-pointer mt-2 mr-1  rounded-full flex items-center justify-around text-white p-1 absolute bg-black right-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {counter === index ? (
                            <>
                              <button
                                onClick={() => {
                                  const quan = parseInt(cartI?.quantity);
                                  if (quan > 1) {
                                    const incCart = cartItems?.find(
                                      (ele) => ele?.RPLinkId === cartI?.RPLinkId
                                    );
                                    if (incCart) {
                                      incCart.quantity = quan - 1;
                                    }
                                    localStorage.setItem(
                                      "cartItems",
                                      JSON.stringify(cartItems)
                                    );
                                    navigate(`${location.pathname}`);
                                  } else {
                                    const existingIndex = cartItems.findIndex(
                                      (ele) => ele?.RPLinkId === cartI?.RPLinkId
                                    );
                                    if (existingIndex !== -1) {
                                      cartItems.splice(existingIndex, 1);
                                      localStorage.setItem(
                                        "cartItems",
                                        JSON.stringify(cartItems)
                                      );
                                      setCounter(null);
                                      navigate(`${location.pathname}`);
                                    }
                                  }
                                }}
                                className="w-8 h-8  flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
                              >
                                <RiSubtractFill />
                              </button>

                              <span className="text-lg font-sf w-7 text-center">
                                {cartI?.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  const quan = parseInt(cartI?.quantity);
                                  const incCart = cartItems?.find(
                                    (ele) => ele?.RPLinkId === cartI?.RPLinkId
                                  );
                                  if (incCart) {
                                    incCart.quantity = quan + 1;
                                  }
                                  localStorage.setItem(
                                    "cartItems",
                                    JSON.stringify(cartItems)
                                  );
                                  navigate(`${location.pathname}`);
                                }}
                                className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-white hover:text-black duration-300"
                              >
                                <BiPlus />
                              </button>
                              <button
                                onClick={() => {
                                  const quan = parseInt(cartI?.quantity);
                                  const incCart = cartItems?.find(
                                    (ele) => ele?.RPLinkId === cartI?.RPLinkId
                                  );
                                  if (incCart) {
                                    incCart.quantity = quan - quan;
                                  }
                                  const existingIndex = cartItems.findIndex(
                                    (ele) => ele?.RPLinkId === cartI?.RPLinkId
                                  );
                                  if (existingIndex !== -1) {
                                    cartItems.splice(existingIndex, 1);
                                    localStorage.setItem(
                                      "cartItems",
                                      JSON.stringify(cartItems)
                                    );
                                    setCounter(null);
                                    navigate(`${location.pathname}`);
                                  }
                                }}
                                className="w-8 h-8  flex justify-center items-center rounded-full hover:bg-red-600 hover:text-white duration-300"
                              >
                                <BiTrash />
                              </button>
                            </>
                          ) : (
                            <span
                              onClick={() => handleCounterClick(index)}
                              className="text-lg font-sf w-7 text-center"
                            >
                              {cartI?.quantity}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full font-sf px-5 rounded-xl shadow-xl pb-8">
                <div className="">
                  <h4 className="font-bold font-omnes text-xl">Participants</h4>
                  <div className="flex gap-x-2 w-full [&>p]:cursor-pointer [&>p]:text-center my-8 border-b [&>p]:pb-2">
                    <p
                      className={`hover:text-red-500 w-1/2 ${
                        ready.show == 0 && "border-b-red-500 border-b-2"
                      }`}
                      onClick={() => setReady({ ...ready, show: 0 })}
                    >
                      Not ready:{" "}
                      {
                        gData?.participantList?.filter(
                          (participant) => !participant.isReady
                        )?.length
                      }
                    </p>
                    <p
                      className={`hover:text-red-500 w-1/2 ${
                        ready.show == 1 && "border-b-red-500 border-b-2"
                      }`}
                      onClick={() => setReady({ ...ready, show: 1 })}
                    >
                      Ready:{" "}
                      {
                        gData?.participantList?.filter(
                          (participant) => participant.isReady
                        )?.length
                      }
                    </p>
                  </div>
                </div>

                {ready?.show === 0 ? (
                  <div className="space-y-3 mt-5">
                    {gData &&
                      gData?.participantList?.map((participant, idx) => {
                        if (participant?.isReady === false) {
                          return (
                            <>
                              <div
                                key={idx}
                                onClick={() =>
                                  setGroup((prev) => ({
                                    ...prev,
                                    viewSelection: participant?.participantId,
                                    liShow: !prev.liShow,
                                  }))
                                }
                                className="flex gap-x-2 items-center w-full"
                              >
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                  <img
                                    className="w-full h-full object-cover"
                                    src="/images/userIcon.jpeg"
                                    alt="user image"
                                  />
                                </div>
                                <div className="font-sf w-full relative">
                                  <h4 className="text-lg">
                                    {participant?.participantName}
                                    {gData?.hostebBy?.id ==
                                    participant?.participantId ? (
                                      <sup className="bg-black text-white rounded-md p-1 ml-4">
                                        Host
                                      </sup>
                                    ) : (
                                      <div>
                                        {gData?.hostebBy?.id ==
                                          localStorage.getItem("userId") && (
                                          <div
                                            className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center p-2 absolute right-0 top-0 cursor-pointer"
                                            onClick={() =>
                                              removeMember(
                                                gData?.orderId,
                                                participant?.participantId
                                              )
                                            }
                                          >
                                            <RiDeleteBinLine />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </h4>

                                  <p className="text-sm font-light text-gray-500 flex gap-x-5">
                                    Choosing items &bull;{" "}
                                    {participant?.items?.length} items{" "}
                                    <IoIosArrowDown
                                      className={`${
                                        participant?.participantId ===
                                          group?.viewSelection && group.liShow
                                          ? "rotate-180"
                                          : ""
                                      }`}
                                    />
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {participant?.items?.map((el, idx) => {
                                  return (
                                    <div
                                      key={idx}
                                      className={`flex gap-x-3 items-center pl-5 ${
                                        participant?.participantId ==
                                          group?.viewSelection && group?.liShow
                                          ? ""
                                          : "h-0 overflow-hidden"
                                      }`}
                                    >
                                      <img
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={BASE_URL + el?.productName?.image}
                                        alt=""
                                      />{" "}
                                      {el?.qty}x {el?.productName?.name}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                            // ===============================================================================
                          );
                        }
                      })}
                    <div>
                      <div className="bg-[#FFF6E2] rounded-2xl p-4 flex items-center gap-x-3 mt-10 cursor-pointer">
                        <div className="flex gap-x-2 items-center w-full">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              className="w-full h-full object-cover"
                              src={
                                BASE_URL + gData?.groupIcon ||
                                "/images/userIcon.jpeg"
                              }
                              alt=""
                            />
                          </div>
                          <div className="font-sf">
                            <h4 className="text-lg font-semibold">
                              {gData?.groupName}
                            </h4>
                            <p className="text-sm font-light text-gray-500 leading-4">
                              Tap to copy shareable link
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-x-3">
                          <Popover placement="bottom">
                            <PopoverTrigger>
                              <BsQrCodeScan size={25} />
                            </PopoverTrigger>
                            <PopoverContent
                              position="fixed"
                              bottom="120px"
                              right="120px"
                            >
                              <PopoverBody
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                              >
                                <QRCode
                                  value={String(
                                    localStorage.getItem("gLink") || ""
                                  )}
                                />
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                          <PiShareNetworkFill
                            size={25}
                            onClick={() =>
                              copyToClipboard(localStorage.getItem("gLink"))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mt-5">
                    {gData &&
                      gData?.participantList?.map((participant, idx) => {
                        if (participant?.isReady === true) {
                          return (
                            <>
                              <div
                                key={idx}
                                className="flex gap-x-2 items-center w-full"
                                onClick={() =>
                                  setGroup((prev) => ({
                                    ...prev,
                                    viewSelection: participant?.participantId,
                                    liShow: !prev.liShow,
                                  }))
                                }
                              >
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                  <img
                                    className="w-full h-full object-cover"
                                    src="/images/userIcon.jpeg"
                                    alt="user image"
                                  />
                                </div>
                                <div className="font-sf w-full relative">
                                  <h4 className="text-lg">
                                    {participant?.participantName}
                                    {gData?.hostebBy?.id ==
                                    participant?.participantId ? (
                                      <sup className="bg-black text-white rounded-md p-1 ml-4">
                                        Host
                                      </sup>
                                    ) : (
                                      <div>
                                        {gData?.hostebBy?.id ==
                                          localStorage.getItem("userId") && (
                                          <div
                                            className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center p-2 absolute right-0 top-0 cursor-pointer"
                                            onClick={() =>
                                              removeMember(
                                                gData?.orderId,
                                                participant?.participantId
                                              )
                                            }
                                          >
                                            <RiDeleteBinLine />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </h4>
                                  <p className="text-sm font-light text-gray-500 flex gap-x-5">
                                    Choosing items &bull;{" "}
                                    {participant?.items?.length} items{" "}
                                    <IoIosArrowDown
                                      className={`${
                                        participant?.participantId ===
                                          group?.viewSelection && group.liShow
                                          ? "rotate-180"
                                          : ""
                                      }`}
                                    />
                                  </p>
                                </div>
                              </div>
                              {/* down arrow items show*/}
                              <div className="space-y-2">
                                {participant?.items?.map((el, idx) => {
                                  return (
                                    <div
                                      key={idx}
                                      className={`flex gap-x-3 items-center pl-5 ${
                                        participant?.participantId ==
                                          group?.viewSelection && group?.liShow
                                          ? ""
                                          : "h-0 overflow-hidden"
                                      }`}
                                    >
                                      <img
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={BASE_URL + el?.productName?.image}
                                        alt=""
                                      />{" "}
                                      {el?.qty}x {el?.productName?.name}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          );
                        }
                      })}
                    <div>
                      <div className="bg-[#FFF6E2] rounded-2xl p-4 flex items-center gap-x-3 mt-10 cursor-pointer">
                        <div className="flex gap-x-2 items-center w-full">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              className="w-full h-full object-cover"
                              src={
                                BASE_URL + gData?.groupIcon ||
                                "/images/userIcon.jpeg"
                              }
                              alt=""
                            />
                          </div>
                          <div className="font-sf">
                            <h4 className="text-lg font-semibold">
                              {gData?.groupName}
                            </h4>
                            <p className="text-sm font-light text-gray-500 leading-4">
                              Tap to copy shareable link
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-x-3">
                          <Popover placement="bottom">
                            <PopoverTrigger>
                              <BsQrCodeScan size={25} />
                            </PopoverTrigger>
                            <PopoverContent
                              position="fixed"
                              bottom="120px"
                              right="120px"
                            >
                              <PopoverBody
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                              >
                                <QRCode
                                  value={String(
                                    localStorage.getItem("gLink") || ""
                                  )}
                                />
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                          <PiShareNetworkFill
                            size={25}
                            onClick={() =>
                              copyToClipboard(localStorage.getItem("gLink"))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {gData?.isLocked ? (
                  <p className="text-gray-500 text-sm mt-10">
                    Unfortunately, this group is locked and new guests aren't
                    able to join.
                  </p>
                ) : (
                  ""
                )}
              </div>
            )}
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px" className="flex justify-between">
            {group?.show === 1 ? (
              <div
                className="w-full flex justify-between items-center px-3 py-3 cursor-pointer bg-black rounded-full text-white"
                onClick={handleCartPage}
              >
                <div className="flex items-center gap-x-2 font-omnes font-bold">
                  <span className="w-8 h-8 rounded-full bg-white text-black flex justify-center items-center">
                    {cartItems?.length
                      ? String(cartItems?.length).padStart(2)
                      : 0}
                  </span>{" "}
                  <p>Go to checkout</p>
                </div>
                <p className="font-omnes font-bold">
                  {totalPrice}{" "}
                  {localStorage.getItem("groupData")
                    ? gData?.currencyDetails?.symbol
                    : cartI?.currencySign}
                </p>
              </div>
            ) : (
              <div className="w-full flex gap-x-2">
                {gData?.hostebBy?.id == localStorage.getItem("userId") ? (
                  <>
                    <div
                      className="flex gap-x-2 items-center cursor-pointer"
                      onClick={() => {
                        lockGroup(gData?.orderId, gData?.isLocked);
                      }}
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center p-2 font-sf">
                        {gData?.isLocked ? (
                          <SlLockOpen />
                        ) : (
                          <IoLockClosedOutline />
                        )}
                      </div>
                      <p className="font-sf">
                        {gData?.isLocked
                          ? "Unlock the group"
                          : "Lock order together"}
                      </p>
                    </div>
                    <div
                      className="text-red-500 flex gap-x-2 items-center cursor-pointer"
                      onClick={() => {
                        delGroup();
                      }}
                    >
                      <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center p-2">
                        <RiDeleteBinLine />
                      </div>
                      <p>Cancel this order</p>
                    </div>
                  </>
                ) : (
                  <div
                    className="flex gap-x-2 items-center cursor-pointer [&>p]:text-red-500"
                    onClick={() => {
                      leaveGroup(
                        gData?.orderId,
                        Number(localStorage.getItem("userId"))
                      );
                    }}
                  >
                    <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center p-2 text-red-500">
                      <IoLogOutOutline />
                    </div>
                    <p>Leave this group</p>
                  </div>
                )}
              </div>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {!headerSearch.isOpen &&
        (props.home ? (
          <header
            className={`z-20 font-sf shadow w-full mx-auto bg-white ${
              isAbsolute ? "nav-css fixed w-full top-0 z-50" : "absolute w-full"
            }`}
          >
            <div className="z-20 font-sf max-w-[1200px] w-full mx-auto">
              <div
                className={`flex justify-between items-center mx-auto before-bg2 relative pe-4 sm:pe-[30px]`}
              >
                <Link
                  to={"/"}
                  onClick={handleLogoClick}
                  className={`bg-[#de2c35] ps-4 sm:ps-[30px]`}
                >
                  <div>
                    <img
                      src="/images/logo2.gif"
                      alt="fomino"
                      className="lg:w-[264px] w-24 md:h-[70px] h-16 object-contain lg:object-cover"
                    />
                  </div>
                </Link>
                <div className="flex">
                  {/* If the user is not logged in */}
                  {localStorage.getItem("loginStatus") !== "true" && (
                    <div className="flex gap-x-2 md:h-[40px]">
                      {/* Show login/signup buttons */}
                      <button
                        onClick={() => setModal(true)}
                        className={`flex justify-center items-center font-medium sm:text-sm text-xs py-3 sm:px-5 px-3 sm:w-24 w-20 rounded-full bg-transparent border border-transparent hover:border-theme-gray-11 hover:bg-theme-gray-11`}
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => setSignUpModal(true)}
                        className={`flex justify-center items-center font-medium sm:text-sm text-xs py-3 sm:px-5 px-3 sm:w-24 w-20 rounded-full bg-theme-red-2 bg-opacity-10 hover:bg-opacity-20 border border-theme-gray-11 text-theme-red-2`}
                      >
                        Sign up
                      </button>

                      {/* If the user is not logged in but has cart items, also show the cart */}
                      {cartItems?.length > 0 && (
                        <button
                          onClick={() => setDrawerCart(true)}
                          className="bg-theme-gray-11 md:w-[48px] w-10 md:h-[48px] h-10 rounded-fullest flex justify-center items-center text-theme-red relative"
                        >
                          <CustomCartIcon size={24} color="#DE2D35" />
                          <div className="absolute top-0 right-0 w-4 h-4 flex justify-center items-center bg-theme-red text-white text-xs rounded-fullest">
                            {cartItems?.reduce((accumulator, currentItem) => {
                              return accumulator + currentItem?.quantity;
                            }, 0)}
                          </div>
                        </button>
                      )}
                    </div>
                  )}

                  {/* If the user is logged in */}
                  {localStorage.getItem("loginStatus") === "true" && (
                    <div className="flex items-center md:gap-x-2 gap-x-1">
                      {/* Show profile and cart if user is logged in */}
                      <button
                        onClick={() => setDrawer(true)}
                        className={`rounded-fullest flex justify-center items-center md:w-[52px] w-12 md:h-[52px] h-12 font-semibold bg-theme-red bg-opacity-40 text-white border-4 border-white`}
                      >
                        <div className="w-full h-full overflow-hidden flex justify-center items-center">
                          {localStorage.getItem("userName")?.length > 0 ? (
                            getProfile?.data?.data?.image ? (
                              <img
                                src={`${BASE_URL}${getProfile?.data?.data?.image}`}
                                alt=""
                                className="w-full h-full object-cover rounded-fullest"
                              />
                            ) : (
                              <div className="initials text-center flex justify-center items-center w-full h-full text-lg">
                                {`${
                                  extractFirstLetters(
                                    localStorage.getItem("userName")
                                  )?.firstLetter
                                }`}
                              </div>
                            )
                          ) : (
                            <FaUser size={16} />
                          )}
                        </div>
                      </button>

                      {/* Show cart button if the user is logged in and has items in the cart */}
                      {cartItems?.length > 0 && (
                        <button
                          onClick={() => setDrawerCart(true)}
                          className="bg-theme-gray-11 md:w-[48px] w-10 md:h-[48px] h-10 rounded-fullest flex justify-center items-center text-theme-red relative"
                        >
                          <CustomCartIcon size={24} color="#DE2D35" />
                          <div className="absolute top-0 right-0 w-4 h-4 flex justify-center items-center bg-theme-red text-white text-xs rounded-fullest">
                            {cartItems?.reduce((accumulator, currentItem) => {
                              return accumulator + currentItem?.quantity;
                            }, 0)}
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        ) : props.rest ? (
          <header
            className={`z-20 font-sf ${
              isAbsolute
                ? "nav-css fixed top-0 z-50 shadow border-0 bg-white"
                : "absolute w-full border-b border-[#00000022]"
            } ${props?.resDetail ? "bg-transparent border-none" : "bg-white"}`}
          >
            <div className="grid grid-cols-3 items-center h-full w-full custom-max-width">
              {/* Logo and Location */}
              <div className="flex items-center space-x-4 md:flex-1 gap-x-3 xl:gap-x-5 before-bg relative">
                <Link
                  to="/"
                  className="bg-theme-red-2 px-2 md:pe-6"
                  onClick={handleLogoClick}
                >
                  <div
                    className={`${
                      props?.marginLeft
                        ? props?.marginLeft
                        : "ml-1 smallDesktop:ml-3 desktop:ml-5 largeDesktop:ml-4"
                    }`}
                  >
                    <img
                      src="/images/logo2.gif"
                      alt="fomino"
                      className="lg:w-[264px] w-28 md:h-[70px] h-16 object-contain lg:object-cover"
                    />
                  </div>
                </Link>

                {/* Location (only visible on large screens) */}
                <div
                  onClick={() => setAddressModal(true)}
                  className="lg:flex hidden items-center gap-x-2 cursor-pointer max-w-72"
                >
                  <div
                    className={`${
                      props?.resDetail && isAbsolute
                        ? "bg-theme-gray-11"
                        : props?.resDetail && !isAbsolute
                        ? "inset-0 !bg-lightTransparant rounded-full backdrop-blur-xl hover:cursor-pointer hover:bg-opacity-20"
                        : ""
                    } bg-theme-gray-11 p-2 flex justify-center items-center text-theme-red rounded-fullest`}
                  >
                    <GrLocation
                      size={20}
                      className={`${
                        props?.resDetail && !isAbsolute
                          ? "text-white"
                          : "text-theme-red"
                      }`}
                    />
                  </div>
                  <div
                    className={`font-medium text-sm font-sf ${
                      props?.resDetail && !isAbsolute
                        ? "text-white"
                        : "text-theme-red"
                    }`}
                  >
                    <h6 className="flex gap-x-1 items-center">
                      {displayAddress}
                      <MdKeyboardArrowDown size={24} />
                    </h6>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex justify-center md:flex-1 border-red-500 relative">
                <div
                  className="relative extraSmall:translate-x-5"
                  onClick={() =>
                    setHeaderSearch({ ...headerSearch, isOpen: true })
                  }
                >
                  <input
                    type="search"
                    name="search"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className={`rounded-full py-2.5 pl-10 pr-5 extraSmall:w-full small:w-48 md:w-[280px] focus:outline-none font-medium text-sm placeholder:text-black placeholder:text-opacity-40 ${
                      props?.resDetail && !isAbsolute
                        ? "inset-0 bg-lightTransparant rounded-full backdrop-blur-xl hover:cursor-pointer hover:bg-opacity-20 text-white !placeholder-white"
                        : "bg-theme-gray-12"
                    }`}
                    placeholder="Search in Fomino..."
                  />
                  <IoSearch
                    size={20}
                    className={`absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none ${
                      props?.resDetail && !isAbsolute
                        ? "text-white"
                        : "text-theme-black-2"
                    }`}
                  />
                </div>
              </div>

              {/* Profile + Cart OR Login/Signup */}
              <div
                className={`flex justify-end items-center space-x-4 md:flex-1 cart-margin ${
                  props.resDetail ? "cart-margin2" : ""
                }`}
              >
                {localStorage.getItem("loginStatus") === "true" ? (
                  cartItems?.length > 0 ? (
                    // ✅ Logged in + has cart items
                    <div className="flex items-center md:gap-x-7 gap-x-1">
                      {/* Profile Button */}
                      <button
                        onClick={() => setDrawer(true)}
                        className="rounded-fullest flex justify-center items-center md:w-[52px] w-12 md:h-[52px] h-12 font-semibold text-white border-white"
                      >
                        <div
                          onClick={() => setDrawer(true)}
                          className={`flex items-center justify-between cursor-pointer rounded-full py-[2px] px-[3px] pe-1 w-[73px] ${
                            props?.resDetail && !isAbsolute
                              ? "inset-0 bg-lightTransparant rounded-full backdrop-blur-xl hover:cursor-pointer hover:bg-opacity-20 text-white"
                              : "bg-theme-gray-11"
                          }`}
                        >
                          <div className="rounded-fullest flex justify-center items-center md:w-[35px] md:h-[34px] sm:h-12 h-10 sm:w-12 w-10 font-semibold bg-theme-red bg-opacity-40 text-white border-2 border-white">
                            <div className="w-full h-full flex justify-center items-center">
                              {getProfile?.data?.data?.image ? (
                                <img
                                  src={`${BASE_URL}${getProfile?.data?.data?.image}`}
                                  alt=""
                                  className="object-cover rounded-fullest w-full h-full"
                                />
                              ) : (
                                <span className="initials">
                                  {extractFirstLetters(
                                    localStorage.getItem("userName")
                                  )?.firstLetter || <FaUser size={16} />}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setDrawer(true)}
                            className={
                              props.home || isAbsolute || props.noRest
                                ? "text-black"
                                : "text-white"
                            }
                          >
                            <CustomDropArrow
                              color={
                                props?.resDetail && !isAbsolute
                                  ? "white"
                                  : "#DE2D35"
                              }
                            />
                          </button>
                        </div>
                      </button>
                      {gData &&
                      ((isGroupItemsExists && isHost) ||
                        existingCartItems?.length > 0) &&
                      activeResData?.id === groupData?.restaurant?.id
                        ? ""
                        : cartItems?.length > 0 && (
                            <button
                              onClick={() => setDrawerCart(true)}
                              className={`md:w-[40px] w-10 md:h-[40px] h-10 rounded-fullest flex justify-center items-center text-theme-red relative ${
                                props?.resDetail && !isAbsolute
                                  ? "inset-0 bg-lightTransparant rounded-full backdrop-blur-xl hover:cursor-pointer hover:bg-opacity-20 text-white"
                                  : "bg-theme-gray-11"
                              }`}
                            >
                              <CustomCartIcon
                                color={
                                  props?.resDetail && !isAbsolute
                                    ? "white"
                                    : "#DE2D35"
                                }
                              />
                              <div className="absolute top-0 right-0 w-4 h-4 flex justify-center items-center bg-theme-red text-white text-xs rounded-fullest">
                                {cartItems.reduce(
                                  (acc, item) => acc + item.quantity,
                                  0
                                )}
                              </div>
                            </button>
                          )}
                    </div>
                  ) : (
                    // ✅ Logged in + no cart
                    <div
                      onClick={() => setDrawer(true)}
                      className={`flex items-center justify-between cursor-pointer rounded-full py-[2px] px-[3px] pe-1 w-[73px] ${
                        props?.resDetail && !isAbsolute
                          ? "inset-0 bg-lightTransparant rounded-full backdrop-blur-xl hover:cursor-pointer hover:bg-opacity-20 text-white"
                          : "bg-theme-gray-11"
                      }`}
                    >
                      <div className="rounded-fullest flex justify-center items-center md:w-[35px] md:h-[35px] sm:h-12 h-10 sm:w-12 w-10 font-semibold bg-theme-red bg-opacity-40 text-white border-2 border-white">
                        <div className="w-full h-full flex justify-center items-center">
                          {getProfile?.data?.data?.image ? (
                            <img
                              src={`${BASE_URL}${getProfile?.data?.data?.image}`}
                              alt=""
                              className="object-cover rounded-fullest w-full h-full"
                            />
                          ) : (
                            <span className="initials">
                              {extractFirstLetters(
                                localStorage.getItem("userName")
                              )?.firstLetter || <FaUser size={16} />}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setDrawer(true)}
                        className={
                          props.home || isAbsolute || props.noRest
                            ? "text-black"
                            : "text-white"
                        }
                      >
                        <CustomDropArrow
                          color={
                            props?.resDetail && !isAbsolute
                              ? "white"
                              : "#DE2D35"
                          }
                        />
                      </button>
                    </div>
                  )
                ) : cartItems?.length > 0 ? (
                  // ✅ Not logged in + has cart
                  <div className="flex items-center gap-x-3">
                    {/* Login/Signup Buttons */}
                    <div className="flex gap-x-2 md:h-[40px]">
                      <button
                        onClick={() => setModal(true)}
                        className={`flex justify-center items-center font-medium sm:text-sm text-xs py-3 sm:px-5 px-3 sm:w-24 w-20 rounded-full bg-transparent border border-transparent hover:border-theme-gray-11 hover:bg-theme-gray-11 ${
                          props?.resDetail && !isAbsolute
                            ? "text-white"
                            : "text-theme-black-2"
                        }`}
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => setSignUpModal(true)}
                        className={`flex justify-center items-center font-medium sm:text-sm text-xs py-3 sm:px-5 px-3 sm:w-24 w-20 rounded-full bg-theme-red-2 bg-opacity-10 hover:bg-opacity-20 border border-theme-gray-11 text-theme-red-2"
                            ${
                              props?.resDetail && !isAbsolute
                                ? "text-white bg-white"
                                : "text-theme-red-2"
                            }
                       `}
                      >
                        Sign up
                      </button>
                    </div>

                    {/* Cart Button */}
                    <button
                      onClick={() => setDrawerCart(true)}
                      className={`md:w-[40px] w-10 md:h-[40px] h-10 rounded-fullest flex justify-center items-center text-theme-red relative ${
                        props?.resDetail && !isAbsolute
                          ? "inset-0 bg-lightTransparant rounded-full backdrop-blur-xl hover:cursor-pointer hover:bg-opacity-20 text-white"
                          : "bg-theme-gray-11"
                      }`}
                    >
                      <CustomCartIcon
                        color={
                          props?.resDetail && !isAbsolute ? "white" : "#DE2D35"
                        }
                      />
                      <div className="absolute top-0 right-0 w-4 h-4 flex justify-center items-center bg-theme-red text-white text-xs rounded-fullest">
                        {cartItems.reduce(
                          (acc, item) => acc + item.quantity,
                          0
                        )}
                      </div>
                    </button>
                  </div>
                ) : (
                  // ✅ Not logged in + no cart
                  <div className="flex gap-x-2 md:h-[40px]">
                    <button
                      onClick={() => setModal(true)}
                      className={`flex justify-center items-center font-medium sm:text-sm text-xs py-3 sm:px-5 px-3 sm:w-24 w-20 rounded-full bg-transparent border border-transparent hover:border-theme-gray-11 hover:bg-theme-gray-11 ${
                        props?.resDetail && !isAbsolute
                          ? "text-white"
                          : "text-theme-black-2"
                      }`}
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => setSignUpModal(true)}
                      className={`flex justify-center items-center font-medium sm:text-sm text-xs py-3 sm:px-5 px-3 sm:w-24 w-20 rounded-full bg-theme-red-2 bg-opacity-10 hover:bg-opacity-20 border border-theme-gray-11 text-theme-red-2"
                        ${
                          props?.resDetail && !isAbsolute
                            ? "text-white bg-white"
                            : "text-theme-red-2"
                        }
                   `}
                    >
                      Sign up
                    </button>
                  </div>
                )}

                {gData &&
                ((isGroupItemsExists && isHost) ||
                  existingCartItems?.length > 0) &&
                activeResData?.id === groupData?.restaurant?.id ? (
                  <button
                    onClick={() => setDrawerCart(true)}
                    className={`w-max md:h-[40px] h-10 hidden lg:flex rounded-md font-semibold  gap-x-2 px-8 justify-center items-center text-white relative ${
                      props?.resDetail && !isAbsolute
                        ? "inset-0 bg-lightTransparant rounded-full backdrop-blur-xl hover:cursor-pointer hover:bg-opacity-20 text-white"
                        : "bg-theme-red"
                    }`}
                  >
                    View Order
                  </button>
                ) : (
                  ""
                )}
              </div>
            </div>

            {/* Mobile Address Section */}
            {location.pathname === resPath || location.pathname === strPath ? (
              <div
                onClick={() => setAddressModal(true)}
                className="md:hidden flex items-center gap-x-2 cursor-pointer py-3 px-5"
              >
                <div className="bg-theme-gray-11 p-2 flex justify-center items-center text-theme-red rounded-fullest">
                  <GrLocation size={20} />
                </div>
                <div className="text-theme-red font-medium text-sm">
                  <h6 className="flex gap-x-1 items-center">
                    {localStorage.getItem("countryName")}{" "}
                    <MdKeyboardArrowDown size={20} />
                  </h6>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setAddressModal(true)}
                className={`lg:hidden flex items-center gap-x-2 cursor-pointer py-3 px-3 md:px-5 ${
                  isAbsolute ? "relative" : "absolute w-full"
                }`}
              >
                <div className="bg-theme-gray-11 p-2 flex justify-center items-center text-theme-red rounded-fullest">
                  <GrLocation size={20} />
                </div>
                <div className="text-theme-red font-medium text-sm">
                  <h6 className="flex gap-x-1 items-center">
                    {localStorage.getItem("countryName")}{" "}
                    <MdKeyboardArrowDown size={20} />
                  </h6>
                </div>
              </div>
            )}
          </header>
        ) : (
          <></>
        ))}

      <AnimatePresence>
        {headerSearch.isOpen && (
          <>
            <header className="font-sf shadow w-full mx-auto bg-white nav-css fixed top-0 z-50">
              <div className="z-20 font-sf max-w-[1600px] w-full mx-auto">
                <div className="flex justify-between items-center mx-auto relative pe-4 sm:pe-[30px]">
                  <Link
                    to="/"
                    className="md:min-w-[200px] relative bg-theme-red-2 ps-4 sm:ps-[30px] before:content-[''] before:absolute before:-z-10 before:w-[100vw] before:bg-[#de2c35] before:h-16 md:before:h-[70px] before:top-0 before:right-20"
                    onClick={handleLogoClick}
                  >
                    <img
                      src="/images/logo2.gif"
                      alt="fomino"
                      className="lg:w-[264px]  md:h-[70px] h-16 object-contain w-full lg:object-cover"
                    />
                  </Link>

                  <motion.div
                    initial={{ width: 300 }}
                    animate={{ width: 700 }}
                    exit={{ width: 180 }}
                    transition={{ duration: 0.1 }}
                    className={`relative flex justify-center border-red-500 duration-500 transition-all extraSmall:w-full small:w-48 md:w-[280px] md:mr-[225px] mx-2`}
                  >
                    <input
                      autoFocus
                      type="search"
                      name="search"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                      }}
                      onFocus={() => setIsFocused(true)}
                      className={`w-full bg-theme-gray-12 rounded-full py-2.5 pl-10 pr-5 focus:outline-none font-medium text-sm placeholder:text-black placeholder:text-opacity-40 border-red-500 border-2`}
                      placeholder="Search "
                    />
                    <IoSearch
                      size={20}
                      className="absolute top-1/2 -translate-y-1/2 left-4 text-black pointer-events-none"
                    />
                  </motion.div>

                  <div className="flex items-center md:gap-x-2 gap-x-1">
                    <motion.div
                      initial={{ rotate: 0, x: 10, opacity: 0 }}
                      animate={{ rotate: 360, x: 0, opacity: 1 }}
                      exit={{ rotate: 0, x: 100, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => {
                        setHeaderSearch({ ...headerSearch, isOpen: false });
                        setIsFocused(false);
                        if (searchTerm.trim().length == 0) {
                          setPending("recent");
                        }
                      }}
                      className="flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
                    >
                      <IoClose size={30} />
                    </motion.div>
                  </div>
                </div>
              </div>
            </header>
            <div
              className="backdrop-blur-sm bg-black/60 w-full h-screen fixed z-50 top-[70px] left-0"
              onClick={() =>
                setHeaderSearch({ ...headerSearch, isOpen: false })
              }
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height:
                    pending === "recent"
                      ? localStorage.getItem("recentSearch")
                        ? 190
                        : 10
                      : sm
                      ? 550
                      : "90svh",
                }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-[60vh] bg-white overflow-auto max-sm:pb-10"
                onClick={(e) => e.stopPropagation()}
              >
                {pending === "data" ? (
                  searchResult?.data?.list.length > 0 && (
                    <div className="w-full max-w-[708px] mx-auto">
                      <div className="w-full flex justify-between items-center font-sf px-2  mt-4">
                        <h4 className="font-omnes text-2xl leading-7 font-semibold">
                          Restaurants and stores
                        </h4>
                        <p
                          onClick={() => {
                            let res =
                              JSON.parse(
                                localStorage.getItem("recentSearch")
                              ) || [];
                            res = [...res, searchTerm];
                            localStorage.setItem(
                              "recentSearch",
                              JSON.stringify(res)
                            );

                            navigate(
                              `/search-results/venue?q=${encodeURIComponent(
                                searchTerm
                              )}`
                            );
                            setIsFocused(false);
                            setHeaderSearch({ ...headerSearch, isOpen: false });
                          }}
                          className="text-theme-red cursor-pointer font-semibold text-sm"
                        >
                          See all
                        </p>
                      </div>

                      <div className="w-full flex overflow-x-auto overflow-y-hidden sm:grid sm:grid-cols-4 gap-x-2 sm:overflow-hidden py-4 px-2 ">
                        {searchResult?.data?.list?.map((item, idx) => {
                          if (idx > 3) return false;

                          return (
                            <div
                              key={idx}
                              className="flex-shrink-0 w-[300px] sm:w-auto"
                              onClick={() => {
                                resDetails(
                                  item?.id,
                                  item?.city,
                                  item?.country,
                                  item?.businessName?.toLowerCase(),
                                  item?.businessType
                                );
                                setHeaderSearch({
                                  ...headerSearch,
                                  isOpen: false,
                                });
                              }}
                            >
                              <SearchCard
                                restaurantName={item?.businessName}
                                text={item?.description}
                                deliveryCharges={item?.deliveryCharge}
                                subtext={
                                  item?.approxDeliveryTime +
                                  "-" +
                                  (parseInt(item?.approxDeliveryTime) + 5) +
                                  " min"
                                }
                                img={BASE_URL + item?.image}
                                unit={item?.units?.currencyUnit?.symbol}
                                completeClosed={item?.completeClosed}
                                configuration={item?.configuration}
                                isOpen={item?.isOpen}
                                isRushMode={item?.isRushMode}
                                times={item?.times}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="w-full flex justify-between items-center font-sf pb-4 px-2 ">
                        <h4 className="font-omnes text-2xl leading-7 font-semibold">
                          Related Items
                        </h4>
                        <p
                          onClick={() => {
                            let res =
                              JSON.parse(
                                localStorage.getItem("recentSearch")
                              ) || [];
                            res = [...res, searchTerm];
                            localStorage.setItem(
                              "recentSearch",
                              JSON.stringify(res)
                            );
                            navigate(
                              `/search-results/items?q=${encodeURIComponent(
                                searchTerm
                              )}`
                            );
                            setIsFocused(false);
                            setHeaderSearch({ ...headerSearch, isOpen: false });
                          }}
                          className="text-theme-red cursor-pointer font-semibold text-sm"
                        >
                          See all
                        </p>
                      </div>

                      <div className="w-full grid sm:grid-cols-2 gap-4 font-sf px-2 overflow-auto sm:overflow-hidden">
                        {searchResult?.data?.productList.map((item, idx) => {
                          if (idx > 3) return null;
                          const restaurantTag = SearchTags(item);
                          return (
                            <div
                              onClick={() => {
                                setSearchItemModalData(item?.product);
                                setSearchItemModal(true);
                              }}
                              key={item.product?.id}
                              className="flex items-center gap-x-3 hover:scale-[1.02] duration-200 cursor-pointer relative"
                            >
                              <p className="absolute bg-black text-white rounded-xl top-2 left-2 text-sm px-2">
                                {restaurantTag}
                              </p>
                              <div className="w-[200px] h-[130px] max-sm:max-w-[280px] sm:h-[100px] sm:w-[160px] shrink-0 lg:min-w-[160px]">
                                <img
                                  className="rounded-lg w-full h-full object-cover"
                                  src={BASE_URL + item?.product?.image}
                                  alt="product"
                                />
                              </div>
                              <div>
                                <h4 className="text-theme-red font-medium text-sm">
                                  CHF {item?.product?.discountPrice}
                                </h4>
                                <h4 className="font-medium line-clamp-1 text-sm">
                                  {item?.product?.name}
                                </h4>
                                <p className="text-xs font-light text-gray-600 line-clamp-1">
                                  {item?.R_MCLink?.restaurant?.businessName}
                                </p>
                                <div className="py-1 text-sm font-sf flex gap-x-1">
                                  <CustomDeliveryIcon color="#0009" size="12" />
                                  <p className="text-gray-500 font-light font-sf text-xs line-clamp-1">
                                    {
                                      item?.product?.R_MCLink?.restaurant
                                        ?.zoneRestaurant?.zone?.zoneDetail
                                        ?.currencyUnit?.symbol
                                    }
                                    {item?.product?.deliveryPrice} .
                                    {
                                      item?.product?.R_MCLink?.restaurant
                                        ?.approxDeliveryTime
                                    }
                                    -
                                    {parseInt(
                                      item?.product?.R_MCLink?.restaurant
                                        ?.approxDeliveryTime
                                    ) + 10}{" "}
                                    min 😊
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ) : pending === "empty" ? (
                  <div className="w-full h-full max-w-[32.5rem] mx-auto flex flex-col justify-center items-center space-y-4 text-center pb-16">
                    <div>
                      <img
                        src="/images/restaurants/no-data.gif"
                        alt="no-data"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="font-bold text-5xl font-omnes">
                      {" "}
                      No results found
                    </p>
                  </div>
                ) : pending === "recent" ? (
                  searchTerm.trim().length == 0 &&
                  localStorage.getItem("recentSearch") && (
                    <div className="w-full max-w-[700px] mx-auto">
                      <div className="w-full flex justify-between items-center font-sf px-2 pt-4">
                        <h4 className="font-sf text-sm text-theme-black-2/65 leading-7 font-semibold">
                          You recently searched{" "}
                        </h4>
                        <p
                          onClick={() => {
                            localStorage.removeItem("recentSearch");
                            setHeaderSearch({ ...headerSearch, isOpen: false });
                          }}
                          className="text-theme-red cursor-pointer font-semibold text-sm"
                        >
                          Clear history
                        </p>
                      </div>
                      <div className="pl-3 pt-3 space-y-2">
                        {JSON.parse(localStorage.getItem("recentSearch"))?.map(
                          (item, idx) => {
                            if (idx > 3) return null;

                            return (
                              <div
                                onClick={() => {
                                  setSearchTerm(item);
                                }}
                                className="flex items-center gap-x-3 text-black font-semibold hover:text-red-500 cursor-pointer group font-sf"
                                key={idx}
                              >
                                <FaRegClock className="text-[20px] text-gray-300 group-hover:text-theme-red" />
                                <div>{item}</div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  pending === "pending" && (
                    <div className="max-w-[700px] mx-auto flex justify-center w-full">
                      {" "}
                      <Box p={4}>
                        <Box mb={8} px="3">
                          <SkeletonText mb={4} noOfLines={1} width="40%" />
                          <Flex
                            gap={4}
                            overflowX="auto" // Makes the top section horizontally scrollable
                            justifyContent="space-between"
                            wrap="nowrap" // Prevent wrapping in larger screens
                            sx={{
                              "@media (max-width: 640px)": {
                                flexDirection: "row",
                              },
                            }}
                          >
                            {[...Array(md ? 4 : sm ? 3 : 2)].map((_, index) => (
                              <Box
                                key={index}
                                borderWidth={1}
                                borderRadius="lg"
                                overflow="hidden"
                                width="170px"
                                flexShrink={1}
                              >
                                <Skeleton height="100px" mb={4} />
                                <SkeletonText
                                  noOfLines={2}
                                  spacing={2}
                                  mb={2}
                                  px={3}
                                />
                                <SkeletonText
                                  noOfLines={1}
                                  width="50%"
                                  mb={2}
                                  px={3}
                                />
                              </Box>
                            ))}
                          </Flex>
                        </Box>

                        <Box>
                          <SkeletonText mb={4} noOfLines={1} width="40%" />
                          <Flex
                            gap={4}
                            flexWrap="wrap" // This allows wrapping in the bottom section
                            justifyContent="space-between"
                            direction={{ base: "column", md: "row" }} // Change layout to column on smaller screens
                            sx={{
                              "@media (max-width: 640px)": {
                                flexDirection: "column", // Stack items in a column on small screens
                              },
                            }}
                          >
                            {[...Array(4)].map((_, index) => (
                              <Box
                                key={index}
                                overflow="hidden"
                                width="calc(50% - 16px)"
                                p={4}
                                sx={{
                                  "@media (max-width: 640px)": {
                                    width: "100%",
                                    marginBottom: "16px",
                                  },
                                }}
                              >
                                <Flex gap={4} align="center">
                                  <Skeleton
                                    height="100px"
                                    width="170px"
                                    borderRadius="md"
                                  />
                                  <Box flex="1">
                                    <SkeletonText
                                      noOfLines={1}
                                      width="50%"
                                      mb={2}
                                    />
                                    <SkeletonText
                                      noOfLines={2}
                                      width="100%"
                                      mb={2}
                                    />
                                    <SkeletonText noOfLines={1} width="100%" />
                                  </Box>
                                </Flex>
                              </Box>
                            ))}
                          </Flex>
                        </Box>
                      </Box>
                    </div>
                  )
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
