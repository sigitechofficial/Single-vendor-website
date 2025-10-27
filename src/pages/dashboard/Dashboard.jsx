import React, { useEffect, useRef, useState, useCallback } from "react";
import Header from "../../components/Header";
import DashboardItem from "../../components/DashboardItem";
import { TbBrandBooking, TbUserCircle } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import {
  MdApartment,
  MdEditCalendar,
  MdLocationPin,
  MdLogout,
  MdOutlineSupportAgent,
  MdPayment,
  MdOutlineTableRestaurant,
  MdEdit,
} from "react-icons/md";
import {
  FaAddressBook,
  FaAngleRight,
  FaArrowLeft,
  FaBicycle,
  FaBriefcase,
  FaChevronLeft,
  FaHotel,
  FaPlus,
  FaRegTrashAlt,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GetAPI from "../../utilities/GetAPI";
import { BASE_URL } from "../../utilities/URL";
import formatDateFromDB from "../../utilities/FormateDateTime";
import { BsCashCoin } from "react-icons/bs";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import { PostAPI } from "../../utilities/PostAPI";
import { IoArrowBackOutline, IoClose, IoHome } from "react-icons/io5";
import { ImOffice } from "react-icons/im";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Skeleton,
  SkeletonCircle,
  useMediaQuery,
  HStack,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";
import { Autocomplete } from "@react-google-maps/api";
import { GrMapLocation } from "react-icons/gr";
import Select from "react-select";
import { PiHandWavingFill } from "react-icons/pi";
import { RxCounterClockwiseClock } from "react-icons/rx";
import { RiHotelLine } from "react-icons/ri";
import { FaMoneyBills } from "react-icons/fa6";
import PhoneInput from "react-phone-input-2";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { PhoneNumberUtil } from "google-libphonenumber";
import axios from "axios";
import { Spinner } from "@chakra-ui/react";
import FloatingLabelInput from "../../components/FloatingLabelInput";
import CountrySelect from "../../components/CountrySelect";
import en from "react-phone-number-input/locale/en";
import { FaRegAddressBook } from "react-icons/fa";
import Switch from "react-switch";
import { motion } from "framer-motion";

export default function Dashboard() {
  // Utility function to extract first and second letters
  const extractFirstLetters = useCallback((str) => {
    if (str) {
      const [firstLetter, secondLetter] = str.split(" ");
      return {
        firstLetter: firstLetter.charAt(0),
        secondLetter: secondLetter ? secondLetter.charAt(0) : "",
      };
    }
    return { firstLetter: "", secondLetter: "" };
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve user-related data from localStorage once
  const userId = localStorage.getItem("userId") || "";
  const userName = localStorage.getItem("userName") || "User";
  const countryName = localStorage.getItem("countryName") || "";
  const countryShortName = localStorage.getItem("countryShortName") || "";

  // API calls
  const { data: orderHistoryData, reFetch: reFetchOrderHistory } =
    GetAPI("users/orderhistory");

  const { data: addressesData, reFetch: reFetchAddresses } =
    GetAPI("users/alladdresses");
  const { data: tableBookingsData, reFetch: reFetchTableBookings } = GetAPI(
    "users/getTableBookings"
  );

  const { data: countriesData } = GetAPI("users/getCountriesAndCities");
  const { data: profileData, reFetch: reFetchProfile } = GetAPI(
    `users/getProfile/${userId}`
  );
  console.log("Profile Data:", profileData);
  const getAllAddressess = GetAPI("users/alladdresses");
  const [language, setLanguage] = useState({
    language: "",
  });
  const { t, i18n } = useTranslation();
  const languages = [
    { label: "English", value: "en" },
    { label: "German", value: "gr" },
    { label: "Swiss", value: "sw" },
  ];
  // State variables
  const [addNewCard, setAddNewCard] = useState(false);
  const [tab, setTab] = useState(location?.state?.tab || "Order History");
  const [creditStep, setCreditStep] = useState(0);
  const [addressModal, setAddressModal] = useState(false);
  const [addressTab, setAddressTab] = useState(1);
  const [modalScroll, setModalScroll] = useState(0);
  const [updateProfileModal, setUpdateProfileModal] = useState(false);
  const [updateField, setUpdateField] = useState(null);
  const [md] = useMediaQuery("(min-width: 768px)");
  const [hasPositionChanged, setHasPositionChanged] = useState(false);
  const [deleteAccountOtp, setDeleteAccountOtp] = useState("");
  const [bookingDetail, setBookingDetail] = useState(null);
  const [changeEmailOtp, setChangeEmailOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [DeleteOtpError, setDeleteOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    isEmail: false,
  });
  console.log("Profile:", profile);
  // Country state
  const [country, setCountry] = useState({
    // countries: {
    //   value: "",
    //   label: countryName,
    //   short: countryShortName,
    // },
    countries: null,
    selectedCountryShortName: countryShortName,
  });
  // Delivery Address state
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

  // Profile Update states
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [shortCountryName, setShortCountryName] = useState("PK");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [selectedReason, setSelectedReason] = useState(null);
  const options = [
    { value: "dont_use_anymore", label: "I don't use Fomino anymore" },
    { value: "not_happy", label: "I'm not happy with Fomino" },
    { value: "too_expensive", label: "Fomino is too expensive" },
    { value: "something_else", label: "Something else" },
    { value: "no_reason", label: "No reason" },
  ];
  const [tableBookingDetailModal, setTableBookingDetailModal] = useState(false);

  // Autocomplete reference
  const autocompleteRef = useRef(null);

  // Populate countries options
  const getCountries =
    countriesData?.data?.countries?.map((countr) => ({
      value: countr.id,
      label: countr.name,
      short: countr.shortName,
    })) || [];

  const countriesRestriction = {
    componentRestrictions: { country: [country.selectedCountryShortName] },
  };

  // Handle modal scroll
  const handleModalScroll = (event) => {
    setModalScroll(event.target.scrollTop);
  };

  // Fetch and set profile information
  useEffect(() => {
    if (profileData?.data) {
      setProfile({
        firstName: profileData?.data?.firstName || "",
        lastName: profileData?.data?.lastName || "",
        isEmail: profileData?.data?.isEmail,
      });
      setEmail(profileData?.data?.email || "");
      setPhoneNumber(profileData?.data?.phoneNum || "");
      setLoading(false); // immediately stop loading after data is set

      if (profileData?.data?.image) {
        const imageSrc = `${BASE_URL}${profileData?.data?.image}`;
        setImageUrl(imageSrc);
        // No need to block loading state for image
      }
    }
  }, [profileData]);

  // Reset credit step and update profile modal on component mount
  useEffect(() => {
    setCreditStep(0);
    setUpdateProfileModal(false);
  }, []);

  // Handle address extraction from autocomplete
  const getAddress = useCallback(async () => {
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
    setDeliveryAddress((prev) => ({
      ...prev,
      streetAddress: place.formatted_address || "",
      city:
        place.address_components?.[place.address_components?.length - 3]
          ?.long_name || "",
      state:
        place.address_components?.[place.address_components?.length - 2]
          ?.long_name || "",
      building: place.name || "",
      lat: latLng.lat,
      lng: latLng.lng,
    }));
    setAddressTab(2);
    return null;
  }, []);

  // Close address modal and reset related states
  const closeAddressModal = () => {
    setAddressModal(false);
    setModalScroll(0);
    setAddressTab(1);
    setCountry({
      countries: {
        value: "",
        label: countryName,
        short: countryShortName,
      },
      selectedCountryShortName: countryShortName,
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
      other: false,
    });
  };

  // Handle adding a new address
  const handleAddAddress = async () => {
    const { entrance, door, AddressType } = deliveryAddress;
    if (!entrance.trim()) {
      info_toaster("Please enter Entrance/Staircase");
      return;
    }
    if (!door.trim()) {
      info_toaster("Please enter Name/No on Door");
      return;
    }
    if (!AddressType.trim()) {
      info_toaster("Please select Address Label");
      return;
    }
    try {
      const res = await PostAPI("users/addaddress", {
        building: deliveryAddress.building,
        streetAddress: deliveryAddress.streetAddress,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        zipCode: "",
        addressTypeId: "1",
        addressTypeText: deliveryAddress.locationType,
        lat: deliveryAddress.lat,
        lng: deliveryAddress.lng,
        saveAddress: true,
        otherText: deliveryAddress.instructions,
        nameOnDoor: deliveryAddress.door,
        floor: "",
        entrance: deliveryAddress.entrance,
        deliveryLocation: "",
        locationType: deliveryAddress.locationType,
        AddressType: deliveryAddress.AddressType,
        note: deliveryAddress.instructions,
      });
      if (res?.data?.status === "1") {
        setAddressTab(1);
        setAddressModal(false);
        success_toaster(res?.data?.message);
        reFetchAddresses();
      } else {
        error_toaster(res?.data?.message);
      }
    } catch (error) {
      console.error("Error adding address:", error);
      error_toaster("An error occurred while adding the address.");
    }
  };

  //   add new address
  const [currentPosition, setCurrentPosition] = useState({
    lat: 0,
    lng: 0,
  });
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

  // Cancel order function
  const cancelOrderFunc = async (orderId) => {
    try {
      const res = await PostAPI("users/cancelorderfood", { orderId });
      if (res?.data?.status) {
        success_toaster(res?.data?.message);
        reFetchOrderHistory();
      } else {
        error_toaster(res?.data?.message);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      error_toaster("An error occurred while cancelling the order.");
    }
  };

  // Cancel table booking function
  const cancelTableBookingFunc = async (tableId) => {
    try {
      const res = await PostAPI("users/cancelledTableBooking", { tableId });
      if (res?.data?.status) {
        success_toaster(res?.data?.message);
        reFetchTableBookings();
      } else {
        error_toaster(res?.data?.message);
      }
    } catch (error) {
      console.error("Error cancelling table booking:", error);
      error_toaster("An error occurred while cancelling the table booking.");
    }
  };

  // Delete address function
  const deleteAddressFunc = async (id) => {
    try {
      const res = await PostAPI("users/deleteaddress", { addressId: id });
      if (res?.data?.status === "1") {
        success_toaster(res?.data?.message);
        reFetchAddresses();
      } else {
        error_toaster(res?.data?.message);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      error_toaster("An error occurred while deleting the address.");
    }
  };

  // Logout function
  const logoutFunc = () => {
    setTimeout(() => {
      const keysToRemove = [
        "accessToken",
        "loginStatus",
        "userName",
        "userEmail",
        "userId",
        "email",
        "cartItems",
        "countryShortName",
        "guestFormatAddress",
        "countryName",
        "orderId",
        "how",
        "when",
        "note",
      ];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      setDrawer(false); // Ensure setDrawer is defined or removed if not used
      info_toaster("Successfully Logged Out!");
      navigate("/login"); // Redirect to login page after logout
    }, 400);
  };

  // Handle profile updates
  const updateProfileFunc = async (file, updatedPhoneNumber, type) => {
    setLoading(true);

    if (type === "receipt") {
      setProfile({
        ...profile,
        isEmail: !profile?.isEmail,
      });

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("isEmail", profile?.isEmail);

      try {
        const res = await PostAPI("users/updateprofile", formData);

        if (res?.data?.status === "1") {
          success_toaster(
            !profile?.isEmail
              ? "Enabled receipt to email"
              : "Disabled receipt to email"
          );
        } else {
          error_toaster(res?.data?.message);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        error_toaster("An error occurred while updating the profile.");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        if (!profile.firstName.trim()) {
          info_toaster("Please enter First Name");
          setLoading(false);
          return;
        }
        if (!profile.lastName.trim()) {
          info_toaster("Please enter Last Name");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("firstName", profile.firstName);
        formData.append("lastName", profile.lastName);
        formData.append("countryCode", countryCode);
        formData.append("phoneNum", updatedPhoneNumber);
        formData.append("userName", profileData?.data?.userName || "");
        formData.append("userId", userId);
        formData.append("isEmail", profile?.isEmail);
        if (file) {
          formData.append("image", file);
        }

        const res = await PostAPI("users/updateprofile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res?.data?.status === "1") {
          reFetchProfile();
          success_toaster(res?.data?.message);
          localStorage.setItem(
            "userName",
            `${profile.firstName} ${profile.lastName}`
          );
          setUpdateProfileModal(false);
        } else {
          error_toaster(res?.data?.message);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        error_toaster("An error occurred while updating the profile.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle profile image update
  const handleUpdateProfileImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result);
      reader.readAsDataURL(file);
      updateProfileFunc(file, phoneNumber);
    }
  };

  // Open update profile modal
  const updateProfileInfo = (field) => {
    setUpdateField(field);
    setUpdateProfileModal(true);
  };

  // Close update profile modal and reset email
  const closeUpdateProfileModal = () => {
    setUpdateProfileModal(false);
    setEmail(profileData?.data?.email || "");
    setPhoneNumber(profileData?.data?.phoneNum || "");
    setPhoneError("");
    setDeleteAccountOtp("");
    setSelectedReason(null);
    setModalScroll(0);
    setChangeEmailOtp("");
    setOtpError("");
    setDeleteOtpError("");
    setDeleteAccountOtp("");
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
    setPhoneNumber(value);
    const isValid = validatePhoneNumber(shortCountryName, value);

    if (!isValid) {
      setPhoneError("Please enter a valid phone number");
    } else {
      setPhoneError("");
    }
  };
  const handleCountryChange = (value, country) => {
    setCountryCode(value);
    setShortCountryName(country?.countryCode);
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      let res = await PostAPI("users/sendDeleteAccountOTP", {
        userId: localStorage.getItem("userId"),
      });
      setUpdateField("otp");
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVerifyOtp = async (e) => {
    e.preventDefault();
    setDeleteOtpError("");
    setIsLoading(true);

    // Validate OTP Length (Must be 4 digits)
    if (deleteAccountOtp.length !== 4) {
      setDeleteOtpError("OTP must be 4 digits.");
      setIsLoading(false);
      return;
    }

    try {
      let res = await PostAPI("users/deleteAccount", {
        userId: localStorage.getItem("userId"),
        otp: deleteAccountOtp.toString(),
      });

      if (res?.data?.status === "1") {
        localStorage.clear();
        navigate("/");
      } else {
        setDeleteOtpError(
          res?.data?.message || "Invalid OTP. Please try again."
        );
        setDeleteAccountOtp("");
      }
    } catch (error) {
      setDeleteOtpError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  //   const handleEmailVerifyOtp = async (e) => {
  //     e.preventDefault();
  //     setIsLoading(true);
  //     try {
  //       let res = await PostAPI("frontsite/verifyOTPForEmailChange", {
  //         email: email,
  //         userId: localStorage.getItem("userId"),
  //         OTP: changeEmailOtp.toString(),
  //       });
  //       setUpdateProfileModal(false);
  //     } catch (error) {
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  const handleEmailVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError(""); // Clear previous errors
    setIsLoading(true);

    if (changeEmailOtp.length !== 4) {
      setOtpError("OTP must be 4 digits.");
      setIsLoading(false);
      return;
    }

    try {
      let res = await PostAPI("frontsite/verifyOTPForEmailChange", {
        email: email,
        userId: localStorage.getItem("userId"),
        OTP: changeEmailOtp.toString(),
      });
      console.log("res", res);

      if (res?.data?.status === "0") {
        setOtpError("Invalid OTP. Please try again.");
      } else {
        setUpdateProfileModal(false);
        setChangeEmailOtp("");
        setOtpError("");
      }
    } catch (error) {
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleShowDetail = async (bookingId) => {
    setTableBookingDetailModal(true);
    try {
      let res = await PostAPI("users/tableBookingDetails", {
        bookingId: Number(bookingId),
      });

      if (res?.data?.status === "1") {
        setBookingDetail(res?.data);
        console.log(bookingDetail, "orderDetails");
      } else {
        console.error("Failed to fetch order details.");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };
  const closetableBookingDetailModal = () => {
    setTableBookingDetailModal(false);
  };

  const handleEmailOtp = async () => {
    setIsLoading(true);
    try {
      let res = await PostAPI("users/resendotp", {
        email: email,
        userId: localStorage.getItem("userId"),
      });
      setUpdateField("emailOtp");
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  // Input styling
  const inputStyle =
    "w-full resize-none font-normal text-base text-black rounded-lg py-3 px-4 bg-white border-2 border-theme-gray-4 placeholder:text-black placeholder:text-opacity-40 focus:outline-none focus:border-2 focus:border-green-700 hover:border-2 hover:border-green-700 hover:cursor-pointer";

  const navigateToTimeline = async (orderId) => {
    var config = {
      headers: {
        accessToken: localStorage.getItem("accessToken"),
      },
    };

    let res = await axios.get(
      BASE_URL + `users/orderdetailsfood/${orderId}`,
      config
    );

    if (res?.data?.status === "1") {
      localStorage.setItem("orderId", res?.data?.data?.id);
      localStorage.setItem("resId", res?.data?.data?.restaurantId);
      localStorage.setItem("lat", res?.data?.data?.dropOffLat);
      localStorage.setItem("lng", res?.data?.data?.dropOffLng);
      localStorage.setItem(
        "eta_text",
        String(res?.data?.data?.estTime).slice(0, 2)
      );
      localStorage.setItem("type", res?.data?.data?.deliveryType);
      localStorage.setItem("mod", res?.data?.data?.orderMode?.name);
      localStorage.setItem("statusHistory", JSON.stringify([]));

      localStorage.setItem(
        "activeResData",
        JSON.stringify({
          id: res?.data?.data?.restaurantId,
          lat: res?.data?.data?.restaurantLat,
          lng: res?.data?.data?.restaurantLng,
        })
      );
      localStorage.setItem("connect", false);
      localStorage.setItem("his", true);
    }

    navigate("/timeline", { state: { history: res?.data?.data?.OrderStatus } });
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      {/* Address Modal */}
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
          <ModalHeader>
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
                  }
                  setHasPositionChanged(false);
                }}
                className={`flex justify-center items-center text-end rounded-fullest w-8 h-8 bg-[#F4F5FA] ${
                  addressTab === 0 ? "invisible" : "visible"
                }`}
              >
                <IoArrowBackOutline />
              </button>
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
                {addressTab === 4
                  ? `${deliveryAddress.building}`
                  : addressTab === 0
                  ? "Where to?"
                  : "Add New Address"}
              </motion.div>
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
              className="max-h-[calc(100vh-200px)] h-auto overflow-auto"
            >
              {addressTab === 0 ? (
                <div className="px-6">
                  <div className="space-y-5  ">
                    <h4 className="text-2xl text-black font-tt font-black">
                      Where to?
                    </h4>
                    {getAllAddressess?.data?.data?.addressList
                      ?.filter(
                        (fil) =>
                          fil.AddressType &&
                          fil.AddressType?.toString()?.length > 0
                      )
                      ?.map((addr, index) => (
                        <>
                          <div
                            key={index}
                            className="flex items-center gap-x-3"
                          >
                            <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 bg-theme-gray-4">
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
                            <div className="flex justify-between gap-x-5 items-center w-full">
                              <div>
                                <p className="text-lg font-semibold">
                                  {addr?.AddressType}
                                </p>
                                <div className="text-xs font-medium text-black text-opacity-40">
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
                                  className=" bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-2 px-4 font-semibold"
                                >
                                  Choose
                                </button>
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                          <hr className="max-w-[30.4rem] ms-auto" />
                        </>
                      ))}
                  </div>

                  <div className="font-medium text-xl text-black font-tt my-4">
                    <button
                      onClick={() => setAddressTab(1)}
                      className="flex items-center gap-x-3"
                    >
                      <FaPlus size={20} />
                      <span>Add new address</span>
                    </button>
                  </div>
                </div>
              ) : addressTab === 1 ? (
                <div className="px-6">
                  <div className="space-y-5">
                    <h4 className="capitalize text-2xl text-black  font-tt font-black">
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
                      placeholder="Select Country"
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
                      className="rounded-xl"
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
                      className="font-semibold text-base py-4 px-5 my-5 w-full bg-theme-red text-white rounded-lg"
                      onClick={() => getAddress()}
                    >
                      Continue
                    </button>
                  </div>
                  <div className=" md:h-[470px] ">
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
                      <h4 className="capitalize text-3xl text-black font-black font-tt">
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
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-semibold"
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
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-semibold"
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
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-semibold"
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
                      <h4 className="capitalize text-2xl text-black font-semibold font-tt">
                        Address details
                      </h4>
                      <p className="text-sm font-normal text-black text-opacity-50 ">
                        Giving exact address details helps us deliver your order
                        faster.
                      </p>
                    </div>
                    <div>
                      <h4 className="capitalize text-xl text-black font-semibold font-tt ">
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
                      <h4 className="capitalize text-xl text-black font-semibold font-tt">
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
                      {hasPositionChanged
                        ? "Edit tmeeting point on the map"
                        : "Add a meeting point on the map"}
                    </button>
                    <div className="space-y-1">
                      <h4 className="capitalize text-xl text-black font-semibold font-tt">
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
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded border ${
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
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded border ${
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
                      className="font-semibold text-base py-4 px-5 my-5 w-full bg-theme-red text-white rounded"
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
      </Modal>

      {/* Update Profile Modal */}
      <Modal
        onClose={closeUpdateProfileModal}
        isOpen={updateProfileModal}
        size={md ? "xl" : "sm"}
        isCentered
      >
        <ModalOverlay />

        <ModalContent
          borderRadius="20px"
          maxW={["512px"]}
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
            <div className="flex justify-between">
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
                {updateField === "email" && "Email"}
                {updateField === "emailOtp" && "Verify Email"}
                {updateField === "number" && "Mobile number"}
                {updateField === "name" && "Name"}
                {updateField === "deleteAccount" && "Delete Account"}
                {updateField === "otp" && "Verify OTP"}
              </motion.div>
            </div>
          </ModalHeader>
          <ModalBody padding={0}>
            <div
              onClick={closeUpdateProfileModal}
              className="absolute z-20 top-5 right-4 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
            >
              <IoClose size={30} />
            </div>
            {updateField === "email" && (
              <div
                onScroll={handleModalScroll}
                className="custom-scrollbar md:max-h-screen-minus-5vh ultraLargeDesktop:max-h-screen-minus-40vh max-h-screen-minus-9vh h-auto flex flex-col !mb-3"
              >
                <img src="/images/editEmail.gif" alt="email" className="" />

                <div className="px-4">
                  <h1 className="text-[28px] font-bold font-omnes mt-3 mb-5">
                    Email
                  </h1>

                  <FloatingLabelInput
                    type="Email"
                    className={inputStyle}
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="flex justify-between gap-x-5 mt-1 mb-1">
                    <button
                      className="mt-4 py-3 mx-auto w-full font-medium text-xl bg-[#F9D7D9] text-theme-red-2 rounded flex items-center justify-center font-tt"
                      onClick={closeUpdateProfileModal}
                    >
                      {t("Cancel")}
                    </button>
                    <button
                      onClick={handleEmailOtp}
                      className="mt-4 py-3 mx-auto w-full font-medium text-xl bg-theme-red-2 text-white rounded flex items-center justify-center font-tt"
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner size="sm" /> : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {updateField === "emailOtp" && (
              <div className="custom-scrollbar md:max-h-screen-minus-5vh ultraLargeDesktop:max-h-screen-minus-40vh max-h-screen-minus-9vh h-auto flex flex-col justify-center items-center">
                <img
                  src="/images/groupOrder3.gif"
                  alt=""
                  className="w-96 h-full"
                />

                <form className="my-5 !mt-0 mx-4">
                  <h4 className="font-bold text-[28px] font-omnes">
                    Great, check your inbox!
                  </h4>
                  <p className="font-normal text-base text-black text-opacity-60 font-sf">
                    {`We've just sent an OTP to delete account Please check your email.`}
                  </p>
                  <div className="flex justify-center my-2">
                    <HStack>
                      <PinInput
                        value={changeEmailOtp}
                        onChange={(e) => {
                          setChangeEmailOtp(e);
                          setOtpError("");
                        }}
                        placeholder={false}
                      >
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                      </PinInput>
                    </HStack>
                  </div>

                  {otpError && (
                    <p className="text-red-500 text-sm text-center">
                      {otpError}
                    </p>
                  )}
                  <div className="font-sf font-medium text-base text-center py-2">
                    <span>Didn't Receive? </span>
                    <button
                      type="button"
                      onClick={handleEmailOtp}
                      className="underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="font-sf font-semibold mt-2  py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red "
                    onClick={handleEmailVerifyOtp}
                  >
                    {isLoading ? <Spinner size="sm" /> : "Verify OTP"}
                  </button>
                </form>
              </div>
            )}
            {updateField === "number" && (
              <div
                onScroll={handleModalScroll}
                className="custom-scrollbar md:max-h-screen-minus-5vh ultraLargeDesktop:max-h-screen-minus-40vh max-h-screen-minus-9vh h-auto  flex flex-col !mb-4"
              >
                <img src="/images/editEmail.gif" alt="number" className="" />
                <h1 className="text-[28px] font-bold font-omnes mb-2 px-4 mt-3">
                  Mobile Number
                </h1>
                <div className="flex gap-x-1 mt-3 px-4">
                  <CountrySelect
                    labels={en}
                    value={countryCode}
                    onChange={handleCountryChange}
                  />
                  <FloatingLabelInput
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    type="number"
                    name="phoneNum"
                    id="phoneNum"
                    placeholder="Phone Number"
                  />
                </div>

                <span className="text-xs mt-1 text-theme-red-2 px-4">
                  {phoneError}
                </span>

                <div className="flex justify-between gap-x-5 px-4">
                  <button
                    className="mt-4 py-3 mx-auto w-full font-medium text-xl bg-[#F9D7D9] text-theme-red-2 rounded flex items-center justify-center font-tt"
                    onClick={closeUpdateProfileModal}
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    onClick={() => updateProfileFunc(null, phoneNumber)}
                    className="mt-4 py-3 mx-auto w-full font-medium text-xl bg-theme-red-2 text-white rounded flex items-center justify-center font-tt"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            {updateField === "name" && (
              <div
                onScroll={handleModalScroll}
                className="custom-scrollbar md:max-h-screen-minus-9vh ultraLargeDesktop:max-h-screen-minus-40vh max-h-screen-minus-9vh h-auto  flex flex-col !mb-4"
              >
                <img src="/images//editEmail.gif" alt="name" className="" />
                <h1 className="text-[28px] font-bold font-omnes px-4">Name</h1>
                <div className="flex flex-col space-y-4 mt-5 px-4">
                  <FloatingLabelInput
                    type="text"
                    placeholder="First Name"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                  />

                  <FloatingLabelInput
                    type="text"
                    placeholder="Last Name"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-between gap-x-5 px-4">
                  <button
                    className="mt-4 py-3 mx-auto w-full font-medium text-xl bg-[#F9D7D9] text-theme-red-2 rounded flex items-center justify-center font-tt"
                    onClick={closeUpdateProfileModal}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateProfileFunc(null, phoneNumber)}
                    className="mt-4 py-3 mx-auto w-full font-medium text-xl bg-theme-red-2 text-white rounded flex items-center justify-center font-tt"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {updateField === "deleteAccount" && (
              <div
                onScroll={handleModalScroll}
                className="custom-scrollbar md:max-h-screen-minus-9vh ultraLargeDesktop:max-h-screen-minus-40vh max-h-screen-minus-9vh h-auto flex flex-col !mb-4"
              >
                <img src="/images/deleteAccount.gif" alt="name" className="" />
                <h1 className="text-[28px] font-bold font-omnes mt-2 px-4">
                  {t("Delete account")}
                </h1>
                <p className="font-sf font-normal text-black text-opacity-80 px-4">
                  {`${profile.firstName}`} we're really sorry to see you go. Are
                  you sure you want to delete your account?
                </p>
                <div className="flex flex-col space-y-4 mt-5 px-4">
                  <Select
                    value={selectedReason}
                    onChange={(option) => setSelectedReason(option)}
                    options={options}
                    inputId="reasons"
                    placeholder="Choose a reason"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: "8px",
                        border: state.isFocused
                          ? "2px solid green"
                          : "1px solid #e7e7e7",
                        boxShadow: state.isFocused ? "0 0 0 1px green" : "none",
                        padding: "6px 6px",
                        "&:hover": {
                          borderColor: "green",
                          boxShadow: "0 0 0 1px green",
                          cursor: "pointer",
                        },
                      }),
                    }}
                  />
                </div>
                <div className="flex justify-between gap-x-5 px-4">
                  <button
                    className="mt-4 py-3 mx-auto w-full font-medium text-xl bg-[#F9D7D9] text-theme-red-2 rounded flex items-center justify-center font-tt"
                    onClick={closeUpdateProfileModal}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!selectedReason}
                    className={`mt-4 py-3 mx-auto w-full font-medium text-xl rounded flex items-center justify-center font-tt ${
                      selectedReason
                        ? "bg-theme-red-2 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? <Spinner size="sm" /> : "Delete"}
                  </button>
                </div>
              </div>
            )}

            {updateField === "otp" && (
              <div className="custom-scrollbar md:max-h-screen-minus-5vh ultraLargeDesktop:max-h-screen-minus-40vh max-h-screen-minus-9vh h-auto flex flex-col justify-center items-center">
                <img
                  src="/images/groupOrder3.gif"
                  alt=""
                  className="w-96 h-full"
                />

                <form className="my-5 !mt-0 mx-5">
                  <h4 className="font-bold text-[28px] font-omnes">
                    Great, check your inbox!
                  </h4>
                  <p className="font-normal text-base text-black text-opacity-60 font-switzer">
                    {`We've just sent an OTP to delete account Please check your email.`}
                  </p>
                  <div className="flex justify-center my-2">
                    <HStack>
                      <PinInput
                        value={deleteAccountOtp}
                        onChange={(e) => setDeleteAccountOtp(e)}
                        placeholder={false}
                      >
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                      </PinInput>
                    </HStack>
                  </div>
                  {DeleteOtpError && (
                    <p className="text-red-500 text-sm text-center">
                      {DeleteOtpError}
                    </p>
                  )}

                  <div className="font-switzer font-medium text-base text-center py-2">
                    <span>Didn't Receive? </span>
                    <button
                      type="button"
                      onClick={() => {
                        console.log("helo");
                      }}
                      className="underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="mt-2 py-2.5 px-5 w-full font-semibold md:text-base text-sm text-white bg-theme-red border border-theme-red rounded font-switzer"
                    onClick={handleDeleteVerifyOtp}
                  >
                    {isLoading ? <Spinner size="sm" /> : "Verify OTP"}
                  </button>
                </form>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* order Detail modal Modal */}
      <Modal
        onClose={closetableBookingDetailModal}
        isOpen={tableBookingDetailModal}
        isCentered
        className="modal-custom"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          maxW={["510px", "510px"]}
          className="modal-content-custom"
          overflow={"hidden"}
        >
          <ModalBody padding={0}>
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
            <div className="max-h-[calc(100vh-15vh)] h-auto  overflow-auto  custom-scrollbar">
              <div className=" py-12 px-4 flex flex-col space-y-3 items-center justify-center    ">
                <h1 className="font-omnes text-black font-bold text-[28px]">
                  Booking Details
                </h1>

                <div className="flex space-x-3 justify-center items-center">
                  <div className="w-4 h-4 rounded-fullest bg-theme-green-2 text-white flex justify-center items-center">
                    <p className="text-white text-xs"> ✓</p>
                  </div>
                  <p className="font-sf text-theme-black-2 font-light">
                    Reservation Confirmed
                  </p>
                </div>
                <div className="flex space-x-1">
                  <p className="font-sf text-theme-black-2 font-semibold">
                    Booking id#
                  </p>
                  <p> {bookingDetail?.data?.booking?.id}</p>
                </div>

                <div className="text-base font-sf  w-full !mt-10 space-y-3 pb-24 ">
                  <div className="flex justify-between">
                    <p className="font-light">Name</p>
                    <p className="font-semibold">
                      {bookingDetail?.data?.booking?.name}
                    </p>
                  </div>
                  <div className="w-full h-[1px] bg-black bg-opacity-10"></div>
                  <div className="flex justify-between">
                    <p className="font-light">Phone num</p>
                    <p className="font-semibold">
                      {" "}
                      {bookingDetail?.data?.booking?.user?.countryCode}{" "}
                      {bookingDetail?.data?.booking?.user?.phoneNum}
                    </p>
                  </div>
                  <div className="w-full h-[1px] bg-black bg-opacity-10"></div>
                  <div className="flex justify-between">
                    <p className="font-light">Email</p>
                    <p className="font-semibold">
                      {" "}
                      {bookingDetail?.data?.booking?.user?.email}
                    </p>
                  </div>
                  <div className="w-full h-[1px] bg-black bg-opacity-10"></div>
                  <div className="flex justify-between">
                    <p className="font-light">Restuarant Name</p>
                    <p className="font-semibold">
                      {" "}
                      {bookingDetail?.data?.booking?.restaurant?.businessName}
                    </p>
                  </div>
                  <div className="w-full h-[1px] bg-black bg-opacity-10"></div>
                  <div className="flex justify-between">
                    <p className="font-light">Restuarant Email</p>
                    <p className="font-semibold">
                      {bookingDetail?.data?.booking?.restaurant?.businessEmail}
                    </p>
                  </div>
                  <div className="w-full h-[1px] bg-black bg-opacity-10"></div>
                  <div className="flex justify-between">
                    <p className="font-light">Restuarant phone Number</p>
                    <p className="font-semibold">
                      {bookingDetail?.data?.booking?.restaurant?.phoneNum}
                    </p>
                  </div>

                  <div className="w-full h-[1px] bg-black bg-opacity-10"></div>
                  <div className="flex justify-between">
                    <p className="font-light">Date</p>
                    <p className="font-semibold">
                      {" "}
                      {bookingDetail?.data?.booking?.date}
                    </p>
                  </div>
                  <div className="w-full h-[1px] bg-black bg-opacity-10"></div>
                  <div className="flex justify-between">
                    <p className="font-light">No of People</p>
                    <p className="font-semibold">
                      {" "}
                      {bookingDetail?.data?.booking?.noOfMembers}
                    </p>
                  </div>
                  <div className="w-full h-[1px] bg-black bg-opacity-10"></div>
                </div>

                <div className="mx-w-[250px] flex flex-col space-y-3 w-full  !mt-8 absolute bottom-4 bg-white px-4">
                  <button
                    className="rounded-lg bg-theme-black-2  py-3  w-full 

                  font-medium text-xl text-white flex items-center justify-center 
                  "
                  >
                    Browse Menu
                  </button>
                  <button className="rounded-lg border border-theme-red-2 py-3 text-theme-red-2">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Header */}
      <Header home={true} />

      {/* Main Dashboard Section */}
      <section className="relative top-[44px] py-4 md:py-10 overflow-hidden">
        <div className="max-w-[1200px] px-4 sm:px-[30px] mx-auto ">
          <div className="grid grid-cols-1 lg:grid-cols-3   lg:shadow-xl rounded-md lg:py-6 lg:px-4">
            {/* Sidebar */}
            <div className="space-y-0 md:space-y-4">
              <div className="flex items-center gap-5"></div>
              {/* User Profile - Hidden on smaller screens */}
              <div className="lg:flex flex-col items-center justify-center gap-y-4 hidden">
                <div
                  className={`relative uppercase font-bold border text-xl w-16 h-16 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 flex justify-center items-center rounded-fullest ${
                    localStorage.getItem("loginStatus") === "true"
                      ? "bg-theme-red bg-opacity-20 text-theme-red"
                      : "bg-theme-gray-6 bg-opacity-60 text-white"
                  }`}
                >
                  {localStorage.getItem("loginStatus") === "true" &&
                  userName.length > 0 ? (
                    <div className="relative w-full h-full flex justify-center items-center">
                      {loading ? (
                        <div className="flex items-center justify-center rounded-full w-full h-full ">
                          <Stack maxW="xs" width="100%" height="100%">
                            <SkeletonCircle
                              size="100%"
                              startColor="gray.500"
                              endColor="gray.200"
                            />
                          </Stack>
                        </div>
                      ) : imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="initials">
                          {extractFirstLetters(userName).firstLetter}
                          {extractFirstLetters(userName).secondLetter}
                        </span>
                      )}
                      <div className="absolute bottom-1 right-0 bg-white rounded-full p-[3px] cursor-pointer flex items-center justify-center border">
                        <label htmlFor="file-input" className="cursor-pointer">
                          <MdEdit className="text-black text-sm" />
                        </label>
                        <input
                          id="file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleUpdateProfileImage}
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
                <h3 className="font-semibold text-2xl font-omnes text-theme-black-2">
                  Hi,&nbsp;{userName}
                </h3>
              </div>
              {/* Dashboard Items */}
              <ul className="xl:w-3/4 lg:w-11/12 mx-auto space-y-3 my-5 hidden lg:block font-sf text-theme-black-2">
                <DashboardItem
                  tab={tab}
                  setTab={() => setTab("Order History")}
                  Icon={RxCounterClockwiseClock}
                  title={t("Order History")}
                />
                <DashboardItem
                  tab={tab}
                  setTab={() => setTab("Table Bookings")}
                  Icon={MdOutlineTableRestaurant}
                  title={t("Table Bookings")}
                />
                <DashboardItem
                  tab={tab}
                  setTab={() => setTab("Credits")}
                  Icon={BsCashCoin}
                  title={t("Credits")}
                />
                <DashboardItem
                  tab={tab}
                  setTab={() => setTab("Account")}
                  Icon={TbUserCircle}
                  title={t("Account")}
                />
                <DashboardItem
                  tab={tab}
                  setTab={() => setTab("Payment methods")}
                  Icon={MdPayment}
                  title={t("Payment methods")}
                />
                <DashboardItem
                  tab={tab}
                  setTab={() => setTab("My addresses")}
                  Icon={FaRegAddressBook}
                  title={t("My addresses")}
                />
                <DashboardItem
                  tab={tab}
                  setTab={() => setTab("Help & Support")}
                  Icon={MdOutlineSupportAgent}
                  title={t("Help & Support")}
                />
                <DashboardItem
                  tab={tab}
                  setTab={() => navigate("/retailer-signup")}
                  Icon={RiHotelLine}
                  title={t("Become a retailer")}
                />
                <DashboardItem
                  tab={tab}
                  setTab={() => navigate("/driver-home")}
                  Icon={FaBicycle}
                  title={t("Become a courier")}
                />
                <DashboardItem
                  tab={tab}
                  setTab={logoutFunc}
                  Icon={MdLogout}
                  title={t("Logout")}
                />
              </ul>
            </div>

            {/* Main Content Area */}
            <div className="col-span-2 rounded-md my-8 lg:p-6 space-y-6">
              {tab === "Order History" && (
                <div className="relative rounded-md my-8 lg:p-6 space-y-6">
                  <h3 className="font-bold text-3xl font-omnes text-theme-black-2">
                    {t("Order History")}
                  </h3>
                  {orderHistoryData?.data?.ongoingOrdersList?.length > 0 && (
                    <h3 className="text-theme-black-2 font-omnes text-[20px] font-bold">
                      Active Orders
                    </h3>
                  )}

                  {/* Ongoing Orders */}
                  {orderHistoryData?.data?.ongoingOrdersList?.length > 0 &&
                    orderHistoryData.data.ongoingOrdersList.map(
                      (order, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            navigateToTimeline(order.orderId);
                          }}
                          className=" rounded-md w-full text-start relative cursor-pointer"
                        >
                          <div className="flex space-x-4 items-center pb-4">
                            <div className="w-40 h-24 rounded-lg  overflow-hidden ">
                              <img
                                src={`${BASE_URL}${order.restaurantlogo}`}
                                alt={`${order.restaurantName} Logo`}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className=" w-full pl-2 pr-1.5 py-1.5">
                              <div className=" flex justify-between items-center">
                                <div className="flex items-center justify-start  w-full flex-wrap ">
                                  <h2 className="text-sm sm:text-lg font-semibold font-sf text-theme-black-2  ">
                                    {order?.restaurantName}
                                  </h2>
                                  <div className="bg-theme-black-2 h-1 w-1 rounded-full ms-3 me-1"></div>
                                  <p className="text-sm sm:text-lg font-semibold font-sf text-theme-black-2">
                                    {`${order?.restaurantCurrency?.symbol}${order?.total}`}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-1 text-theme-black-2 text-opacity-80 text-base font-sf font-nomral">
                                <p className="ellipsis">
                                  {" "}
                                  {order?.restaurantDescription}
                                </p>
                              </div>
                              <div className="mt-[7px] flex justify-between items-center text-sm font-normal text-theme-black-2 text-opacity-65">
                                <div className="flex items-center flex-wrap flex-row gap-1">
                                  <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full me-1"></div>
                                  {order?.orderStatus}{" "}
                                  <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full ms-2 me-1"></div>
                                  {formatDateFromDB(order?.scheduleDate)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <hr className="md:w-[83%] lg:w-[77%] ms-auto" />
                        </div>
                      )
                    )}
                  {/* Food Orders */}
                  {orderHistoryData?.data?.pastOrders?.length > 0 && (
                    <h3 className="text-theme-black-2 font-omnes text-[20px] font-bold">
                      Past Orders
                    </h3>
                  )}
                  {orderHistoryData?.data?.pastOrders?.length > 0 &&
                    orderHistoryData.data.pastOrders.map(
                      (monthData, monthIndex) => (
                        <div key={monthIndex}>
                          <h3 className="text-xl font-semibold text-theme-black-2 mb-4">
                            {monthData.monthYear}
                          </h3>
                          {monthData.orders.map((order, index) => (
                            <button
                              key={index}
                              // onClick={() => {
                              //   localStorage.setItem("orderId", order.orderId);
                              //   handleShowDetail();
                              // }}
                              onClick={() => {
                                navigateToTimeline(order.orderId);
                                // handleShowDetail(order.orderId);
                              }}
                              className="w-full text-start"
                            >
                              <div className="flex space-x-4 items-center pb-4">
                                <div className="w-40 h-24 rounded-lg overflow-hidden">
                                  <img
                                    src={`${BASE_URL}${order?.restaurantlogo}`}
                                    alt={`${order?.restaurantName} Logo`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="w-full pl-2 pr-1.5 py-1.5">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center justify-start w-full flex-wrap">
                                      <h2 className="text-sm sm:text-lg font-semibold font-sf text-theme-black-2">
                                        {order?.restaurantName}
                                      </h2>
                                      <div className="bg-theme-black-2 h-1 w-1 rounded-full ms-3 me-1"></div>
                                      <p className="text-sm sm:text-lg font-semibold font-sf text-theme-black-2">
                                        {`${order?.restaurantCurrency?.symbol}${order.total}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-1 text-theme-black-2 text-opacity-80 text-base font-sf font-normal">
                                    <p className="ellipsis">
                                      {order?.restaurantDescription}
                                    </p>
                                  </div>
                                  <div className="mt-[7px] flex justify-between items-center text-sm font-normal text-theme-black-2 text-opacity-65">
                                    <div className="flex items-center flex-wrap flex-row gap-1">
                                      <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full me-1"></div>
                                      {order.orderStatus}
                                      <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full ms-2 me-1"></div>
                                      {formatDateFromDB(order?.scheduleDate)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <hr className="md:w-[83%] lg:w-[77%] ms-auto" />
                            </button>
                          ))}
                        </div>
                      )
                    )}

                  {/* No Orders */}
                  {orderHistoryData?.data?.ongoingOrdersList?.length === 0 &&
                    orderHistoryData?.data?.pastOrders?.length === 0 && (
                      <div className="text-center font-semibold text-2xl space-y-2">
                        <img
                          className="h-96 object-cover mx-auto"
                          src="../../../public/images/restaurant-details/no-data.webp"
                          alt=""
                        />
                        <h2 className="font-sf text-base">
                          You haven't any order yet 🤨
                        </h2>
                      </div>
                    )}
                </div>
              )}

              {tab === "Table Bookings" && (
                <div className="relative rounded-md my-8 md:p-6 space-y-6">
                  <h3 className="font-bold text-3xl font-omnes text-theme-black-2">
                    {t("Table Bookings")}
                  </h3>

                  {/* Active Bookings */}
                  {tableBookingsData?.data?.activeBookings?.length > 0 && (
                    <div>
                      <h3 className="text-theme-black-2 font-omnes text-[20px] font-bold !mb-3">
                        Active Bookings
                      </h3>
                      {tableBookingsData?.data?.activeBookings.map(
                        (table, index) => (
                          <div
                            key={index}
                            onClick={() => handleShowDetail(table.id)}
                            className="cursor-pointer"
                          >
                            <div className="flex space-x-4 items-center pb-4">
                              <div className="w-32 h-24 rounded-lg overflow-hidden ">
                                <img
                                  src={`${BASE_URL}${table?.logo}`}
                                  alt={`${table?.businessName} Logo`}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="w-full pl-2 pr-1.5 py-1.5">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center justify-start w-full flex-wrap">
                                    <h2 className="text-sm sm:text-lg font-semibold font-sf text-theme-black-2">
                                      {table?.businessName}
                                    </h2>
                                    <div className="bg-theme-black-2 h-1 w-1 rounded-full ms-3 me-1"></div>
                                    <p className="text-sm sm:text-lg font-semibold font-sf text-theme-black-2">
                                      {table?.noOfMembers} Persons
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-1 text-theme-black-2 text-opacity-80 text-base font-sf font-normal">
                                  <p className="ellipsis">
                                    {" "}
                                    {table?.description}
                                  </p>
                                </div>
                                <div className="mt-[7px] flex justify-between items-center text-sm font-normal text-theme-black-2 text-opacity-65">
                                  <div className="flex items-center flex-wrap flex-row gap-1">
                                    <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full me-1"></div>
                                    {table?.displayText}
                                    <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full ms-2 me-1"></div>
                                    {table?.date}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <hr className="md:w-[83%] lg:w-[80%] ms-auto" />
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Past Bookings */}
                  {tableBookingsData?.data?.pastBookings?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-theme-black-2 font-omnes text-[20px] font-bold">
                        Past Bookings
                      </h3>
                      {tableBookingsData?.data?.pastBookings.map(
                        (monthData, monthIndex) => (
                          <div key={monthIndex}>
                            <h3 className="text-xl font-semibold text-theme-black-2 mb-4">
                              {monthData.monthYear}
                            </h3>
                            {monthData.bookings.map((table, index) => (
                              <div key={index}>
                                <div className="flex space-x-4 items-center pb-4">
                                  <div className="w-32 h-24 rounded-lg overflow-hidden">
                                    <img
                                      src={`${BASE_URL}${table?.logo}`}
                                      alt={`${table?.businessName} Logo`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  <div className="w-full pl-2 pr-1.5 py-1.5">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center justify-start w-full flex-wrap">
                                        <h2 className="text-sm sm:text-lg font-semibold font-sf text-theme-black-2">
                                          {table?.businessName}
                                        </h2>
                                        <div className="bg-theme-black-2 h-1 w-1 rounded-full ms-3 me-1"></div>
                                        <p className="text-sm sm:text-lg font-semibold font-sf text-theme-black-2">
                                          {table?.noOfMembers} Persons
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-1 text-theme-black-2 text-opacity-80 text-base font-sf font-normal">
                                      <p className="ellipsis">
                                        {" "}
                                        {table?.description}
                                      </p>
                                    </div>
                                    <div className="mt-[7px] flex justify-between items-center text-sm font-normal text-theme-black-2 text-opacity-65">
                                      <div className="flex items-center flex-wrap flex-row gap-1">
                                        <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full me-1"></div>
                                        {table?.displayText}
                                        <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full ms-2 me-1"></div>
                                        {table?.date}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <hr className="md:w-[83%] lg:w-[80%] ms-auto" />
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* No Bookings */}
                  {!tableBookingsData?.data?.activeBookings?.length &&
                    !tableBookingsData?.data?.pastBookings?.length && (
                      <div className="text-center font-semibold text-2xl space-y-2">
                        <img
                          className="h-96 object-cover mx-auto"
                          src="../../../public/images/restaurant-details/no-data.webp"
                          alt=""
                        />
                        <h2 className="font-sf text-base">
                          You haven't made any booking yet 🤨
                        </h2>
                      </div>
                    )}
                </div>
              )}

              {tab === "Credits" && (
                <div className="md:col-span-2 rounded-md p-4 md:p-6 my-6 md:my-8">
                  {creditStep === 0 && (
                    <div className="py-2 space-y-6 font-tt w-full md:w-10/12 mx-auto">
                      <div className="font-bold text-3xl font-omnes text-theme-black-2 text-center">
                        <h5>{t("Credits and tokens")}</h5>
                      </div>
                      <div>
                        <img
                          src="/images/inviteFriend.gif"
                          alt="credits"
                          className="w-full object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <h5 className=" md:text-[28px] font-bold text-3xl font-omnes text-theme-black-2 mb-3">
                          {t("Want to pay less?")}
                        </h5>
                        <p className="font-sf text-black text-opacity-60">
                          {t(
                            "Want to pay less on your next order? Invite a friend, and earn Fomino credits with their first order."
                          )}
                        </p>
                      </div>
                      <div>
                        <button
                          className="py-4 px-5 w-full bg-theme-red text-white rounded font-bold text-base font-sf"
                          onClick={() => setCreditStep(1)}
                        >
                          {t("Invite Friends")}
                        </button>
                      </div>
                    </div>
                  )}
                  {creditStep === 1 && (
                    <div className="py-2 space-y-6 font-omnes w-full md:w-11/12">
                      <div className="flex items-center gap-x-5">
                        <button onClick={() => setCreditStep(0)}>
                          <FaChevronLeft size={20} />
                        </button>
                        <div className="font-bold text-[28px] font-omnes">
                          <h5>Invite friends, get Fomino credits</h5>
                        </div>
                      </div>
                      <div className="text-theme-red flex flex-col items-center">
                        <span className="font-bold text-3xl">
                          {profileData?.data?.creditPoints} &euro;
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xl">
                            My Credits{" "}
                          </span>
                          <span>
                            <FaMoneyBills size={22} />
                          </span>
                        </div>
                      </div>
                      <div className="space-y-7">
                        {/* Step 1 */}
                        <div className="flex gap-x-4">
                          <div>
                            <div className="min-w-[40px] min-h-[40px] bg-theme-red bg-opacity-20 text-theme-red font-bold text-xl flex justify-center items-center rounded-fullest">
                              1
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h6 className="font-semibold text-xl font-omnes">
                              Share your code
                            </h6>
                            <p className="font-normal text-base text-black text-opacity-60 leading-tight font-sf">
                              Your friends will get $4 in Fomino credits for
                              each of their first 3 delivery orders when they
                              use your code to sign up for Fomino.
                            </p>
                          </div>
                        </div>
                        {/* Step 2 */}
                        <div className="flex gap-x-4">
                          <div>
                            <div className="min-w-[40px] min-h-[40px] bg-theme-red bg-opacity-20 text-theme-red font-bold text-xl flex justify-center items-center rounded-fullest">
                              2
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h6 className="font-semibold text-xl font-omnes">
                              Earn credits
                            </h6>
                            <p className="font-normal text-base text-black text-opacity-60 leading-tight font-sf">
                              You'll get $2 Fomino credits every time a friend
                              completes one of their first 3 delivery orders.{" "}
                              <br />
                              <br />
                              You can earn a maximum of $18 in credits by
                              inviting your friends to join Fomino.
                            </p>
                          </div>
                        </div>
                        {/* Share Code Section */}
                        <div className="flex flex-col w-full gap-y-3 items-center">
                          <div className="py-4 px-5 w-full flex justify-center uppercase bg-theme-gray-10 rounded font-semibold text-base">
                            {profileData?.data?.referalCode}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                profileData?.data?.referalCode || ""
                              );
                              info_toaster("Copied to clipboard");
                            }}
                            className="py-4 px-5 w-full bg-theme-red text-white rounded font-semibold text-base"
                          >
                            Share your code
                          </button>
                          <button
                            onClick={() => setCreditStep(2)}
                            className="font-medium text-base text-theme-red font-sf"
                          >
                            How does this work?
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {creditStep === 2 && (
                    <div className="py-2 space-y-6 font-tt sm:w-4/5 w-11/12">
                      <div className="flex items-center gap-x-5">
                        <button onClick={() => setCreditStep(1)}>
                          <FaChevronLeft size={20} />
                        </button>
                        <div className="font-black text-[28px] font-tt">
                          <h5>How does this work?</h5>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {/* Share your code */}
                        <div className="space-y-1">
                          <h6 className="font-bold text-xl">Share your code</h6>
                          <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                            Your friends will get $4 in Fomino credits for each
                            of their first 3 delivery orders when they use your
                            code to sign up for Fomino.
                          </p>
                        </div>
                        {/* Earn credits */}
                        <div className="space-y-1">
                          <h6 className="font-bold text-xl">Earn credits</h6>
                          <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                            You'll get $2 Fomino credits every time a friend
                            completes one of their first 3 delivery orders.{" "}
                            <br />
                            <br />
                            You can earn a maximum of $18 in credits by inviting
                            your friends to join Fomino.
                          </p>
                        </div>
                        {/* Notes */}
                        <div className="space-y-1">
                          <h6 className="font-bold text-xl">Please note</h6>
                          <p className="font-normal text-base text-black text-opacity-60 leading-tight">
                            Credit can be used for delivery orders only. When
                            your friends get credits, they'll expire 30 days
                            after signing up to Fomino. Your credits will expire
                            30 days after your friend makes their first order.{" "}
                            <br />
                            <br />
                            Stay tuned! Happy sharing!
                          </p>
                        </div>
                        {/* Terms and Conditions */}
                        <div className="flex justify-center">
                          <button className="font-medium text-base text-theme-red">
                            Terms and Conditions
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "Account" && (
                <div className="col-span-2 rounded-md md:p-6 my-8 space-y-6">
                  <h5 className="font-bold text-theme-black-2 text-3xl font-omnes">
                    {t("Profile")}
                  </h5>
                  {/* Country Selection */}
                  <div className="text-theme-black-2 flex justify-between items-center pb-4 border-b border-b-[00000066] gap-x-2">
                    <div className="space-y-2">
                      <h2 className="text-base font-sf font-semibold">
                        {t("Country")}
                      </h2>
                      <p className="text-xs font-sf font-normal text-theme-black-2 text-opacity-65">
                        {t(
                          "The selected country determines the currency of your referral code."
                        )}
                      </p>
                    </div>
                    <Select
                      value={country.countries || null}
                      onChange={(e) => {
                        setCountry({
                          ...country,
                          countries: e,
                        });
                      }}
                      options={getCountries}
                      inputId="countries"
                      placeholder="Country"
                      className="font-sf"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          width: "180px",
                          borderRadius: "8px",
                          border: state.isFocused
                            ? "2px solid green"
                            : "1px solid #e7e7e7",
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
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-b-[00000066] gap-x-2">
                    <div className="space-y-2">
                      <h2 className="text-base font-sf font-semibold text-theme-black-2">
                        {t("Language")}
                      </h2>
                    </div>
                    <Select
                      value={languages.find(
                        (lang) => lang.value === language.language
                      )}
                      onChange={(e) => {
                        handleLanguageChange(e.value);
                        setLanguage({
                          ...language,
                          language: e.value,
                        });
                      }}
                      options={languages}
                      inputId="languages"
                      placeholder=" Language"
                      className="font-sf"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          width: "180px",
                          borderRadius: "8px",
                          border: state.isFocused
                            ? "2px solid green"
                            : "1px solid #e7e7e7",
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
                  </div>

                  {/* Email */}
                  <div className="flex justify-between items-center py-4 border-b border-b-[00000066]">
                    <h2 className="text-base font-sf font-semibold text-theme-black-2">
                      Email
                    </h2>

                    <button
                      onClick={() => updateProfileInfo("email")}
                      className="text-sm font-sf font-semibold text-theme-green-2"
                    >
                      {loading ? (
                        <Skeleton height="7px" width="120px" />
                      ) : (
                        <>{email}</>
                      )}
                    </button>
                  </div>

                  {/* Mobile Number */}
                  <div className="flex justify-between items-center py-4 border-b border-b-[00000066]">
                    <h2 className="text-base font-sf font-semibold text-theme-black-2">
                      {t("Mobile number")}
                    </h2>
                    <button
                      onClick={() => updateProfileInfo("number")}
                      className="text-sm font-sf font-semibold text-theme-green-2"
                    >
                      {loading ? (
                        <Skeleton height="7px" width="120px" />
                      ) : (
                        <>
                          {profileData?.data?.countryCode} {phoneNumber}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Name */}
                  <div className="flex justify-between items-center py-4 border-b border-b-[00000066]">
                    <h2 className="text-base font-sf font-semibold text-theme-black-2">
                      {t("Name")}
                    </h2>
                    <button
                      onClick={() => updateProfileInfo("name")}
                      className="text-sm font-sf font-semibold text-theme-green-2"
                    >
                      {loading ? (
                        <Skeleton height="7px" width="120px" />
                      ) : (
                        <>{`${profile.firstName} ${profile.lastName}`}</>
                      )}
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="flex justify-between items-center py-4 border-b border-b-[00000066]">
                    <p className="text-base font-sf font-semibold text-theme-black-2">
                      {t("Delete account")}
                    </p>
                    <button
                      onClick={() => updateProfileInfo("deleteAccount")}
                      className="text-sm font-sf font-semibold text-theme-red"
                    >
                      {t("Delete")}
                    </button>
                  </div>

                  {/* Send Receipts */}
                  <div className="flex justify-between items-center py-4 border-b border-b-[00000066]">
                    <h2 className="text-base font-sf font-semibold text-theme-black-2">
                      {t("Send receipts to email")}
                    </h2>
                    <p className="text-sm font-sf font-semibold text-theme-black-2">
                      {loading ? (
                        <Skeleton height="7px" width="120px" />
                      ) : (
                        <div className="flex flex-col items-end gap-y-2">
                          {email}{" "}
                          <p>
                            {" "}
                            <Switch
                              onChange={() => {
                                updateProfileFunc("", "", "receipt");
                              }}
                              checked={profile?.isEmail}
                              onColor="#379465"
                              offColor="#d9d9d9"
                              checkedIcon={false}
                              uncheckedIcon={false}
                              height={29}
                              width={52}
                              handleDiameter={23}
                            />
                          </p>
                        </div>
                      )}
                    </p>
                  </div>

                  {/* Clear Auto-Translation Settings */}
                  <div className="flex justify-between items-center py-4 border-b border-b-[00000066]">
                    <h2 className="text-base font-sf font-semibold text-theme-black-2">
                      {t("Clear auto-translation settings")}
                    </h2>
                    <p className="text-sm font-sf font-semibold text-theme-green-2">
                      {t("Reset")}
                    </p>
                  </div>

                  {/* Email Newsletter */}
                  <div className="flex justify-between items-center py-4 border-b border-b-[00000066]">
                    <h2 className="text-sm font-sf font-semibold max-w-lg">
                      {t(
                        "I'd like to receive news, offers and promotions from Fomino via EMAIL NEWSLETTER. I can unsubscribe from these notifications at any time in the app setting or via the unsubscribe link in the EMAIL NEWSLETTER."
                      )}
                    </h2>
                    <p className="text-sm font-sf font-semibold text-black">
                      {/* Placeholder text or toggle switch can be implemented here */}
                      {/* Example: */}
                      <input type="checkbox" checked={false} readOnly />
                    </p>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex justify-between items-center py-4">
                    <h2 className="text-sm font-switzer font-semibold max-w-lg">
                      {t(
                        "I'd like to receive exclusive special offers and information from Fomino PUSH NOTIFICATION. I can unsubscribe from these notifications at any time in the"
                      )}
                    </h2>
                    <p className="text-sm font-switzer font-semibold text-black">
                      {/* Placeholder text or toggle switch can be implemented here */}
                      {/* Example: */}
                      <input type="checkbox" checked={false} readOnly />
                    </p>
                  </div>
                </div>
              )}

              {tab === "Payment methods" && (
                <div className="col-span-2 rounded-md md:p-6 my-8 space-y-5">
                  {!addNewCard ? (
                    <>
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-3xl font-omnes">
                          {t("Payment Methods")}
                        </h3>
                      </div>
                      <div>
                        <div className="flex justify-between items-center py-4 border-b border-b-[00000066]">
                          <h2 className="text-sm font-sf font-semibold">
                            PayPal
                          </h2>
                          <p className="text-sm font-sf font-semibold text-theme-green-2">
                            {t("View")}
                          </p>
                        </div>

                        <div className="flex justify-between items-center py-4 border-b border-b-[00000066]">
                          <h2 className="text-sm font-sf font-semibold">
                            Klarna
                          </h2>
                          <p className="text-sm font-sf font-semibold text-theme-green-2">
                            {t("Activate")}
                          </p>
                        </div>
                      </div>
                      <div className="font-sf text-theme-black-2 text-opacity-65 text-xs  max-w-sm m-auto text-center">
                        Amet minim mollit non deserunt ullamco est sit aliqua
                        dolor do amet sint. Velit officia consequat duis enim
                        velit mollit.
                      </div>
                      <div className="flex justify-center">
                        <button
                          className="px-6 py-3 border-[1.5px] border-theme-green-2 rounded-md font-sf font-semibold text-theme-green-2"
                          onClick={() => setAddNewCard(true)}
                        >
                          + {t("Add new card")}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="md:py-7 md:px-5 rounded-2xl bg-white md:shadow-custom space-y-6">
                      <div className="flex items-center gap-5">
                        <button
                          type="button"
                          onClick={() => setAddNewCard(false)}
                          className="w-8 h-8 bg-[#F0F1F5] rounded-full flex justify-center items-center hover:bg-theme-red hover:text-white duration-200"
                        >
                          <FaArrowLeft />
                        </button>

                        <div className="text-lg font-omnes font-medium">
                          {t("Add new card")}
                        </div>
                      </div>

                      {/* Credit/Debit Card Form */}
                      <div className="relative bg-card-bg bg-cover bg-no-repeat bg-center w-full h-full before:absolute before:bg-theme-red before:top-0 before:left-0 before:w-full before:h-full before:bg-opacity-90 rounded-lg before:rounded-lg">
                        <div className="p-5 relative space-y-5">
                          <h2 className="text-white font-sf text-end">
                            Credit / Debit
                          </h2>

                          <div className="flex flex-col gap-1">
                            <label
                              htmlFor="number"
                              className="text-sm text-white font-sf"
                            >
                              {t("Card number")}
                            </label>
                            <input
                              type="number"
                              name="number"
                              className="px-2 py-2.5 border-none outline-none rounded-md font-sf"
                              placeholder="XXXX-XXXX-XXXX-XXXX"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1">
                              <label
                                htmlFor="expire"
                                className="text-sm text-white font-sf"
                              >
                                {t("Expiration date")}
                              </label>
                              <input
                                type="month"
                                name="expire"
                                className="px-2 py-2.5 border-none outline-none rounded-md font-sf"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label
                                htmlFor="code"
                                className="text-sm text-white font-sf"
                              >
                                {t("Security code")}
                              </label>
                              <input
                                type="number"
                                name="code"
                                className="px-2 py-2.5 border-none outline-none rounded-md font-sf"
                                placeholder="XXX"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Icons */}
                      <div className="flex justify-center gap-5">
                        {[
                          "visa.webp",
                          "mastercard.webp",
                          "amex.webp",
                          "discover.webp",
                        ].map((src, idx) => (
                          <img
                            key={idx}
                            src={`/images/${src}`}
                            alt={`${src.split(".")[0]} Logo`}
                            className="w-10 h-10 object-contain"
                          />
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-5 w-full">
                        <button
                          className="px-6 py-3 w-full rounded-md text-lg font-sf font-semibold text-theme-red bg-[#E1374333]"
                          onClick={() => setAddNewCard(false)}
                        >
                          {t("Cancel")}
                        </button>

                        <button className="px-6 py-3 w-full rounded-md text-lg font-sf font-semibold text-white bg-theme-red">
                          {t("Add Card")}
                        </button>
                      </div>

                      <div className="text-[#00000066] text-xs font-switzer max-w-sm m-auto text-center">
                        Amet minim mollit non deserunt ullamco est sit aliqua
                        dolor do amet sint. Velit officia consequat duis enim
                        velit mollit.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "My addresses" && (
                <div className="col-span-2 rounded-md md:p-6 my-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-3xl font-omnes">
                      Saved Addresses
                    </h3>
                  </div>
                  {addressesData?.data?.addressList?.length === 0 ? (
                    <div className="space-y-5">
                      <img
                        src="/images/where.webp"
                        alt="No addresses"
                        className="w-96 object-contain mx-auto"
                      />
                      <p className="text-center font-bold text-xl md:text-[28px] font-sf max-w-md mx-auto">
                        Sorry! You have not saved any address yet!😕
                      </p>
                    </div>
                  ) : (
                    addressesData?.data?.addressList.map((addr, index) => (
                      <div key={index} className="border-b-2 p-2 font-sf">
                        <div className="flex justify-between">
                          <div className="flex gap-x-3 py-3">
                            <div className="w-10 h-10 flex justify-center items-center rounded-full bg-theme-gray-4">
                              {addr.AddressType === "Home" ? (
                                <IoHome size={28} />
                              ) : addr.AddressType === "Work" ? (
                                <ImOffice size={24} />
                              ) : (
                                <MdEditCalendar size={24} />
                              )}
                            </div>
                            <div className="flex flex-col gap-y-1 font-sf">
                              <h2 className="text-base font-semibold">
                                {addr.AddressType || "Other"}
                              </h2>
                              <address className="text-theme-black-2  font-light text-sm not-italic">
                                {`${addr.building}, ${addr.city}`}
                              </address>
                              <p className="font-light text-base text-theme-black-2  text-opacity-60 font-sf">
                                {addr.state}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAddressFunc(addr.id)}
                            className="h-10 w-10 bg-theme-gray-4 text-theme-red rounded-full flex justify-center items-center"
                          >
                            <FaRegTrashAlt size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="flex justify-center text-theme-green-2">
                    <button
                      onClick={() => setAddressModal(true)}
                      className="font-sf py-3 px-5 font-semibold text-base rounded bg-transparent border border-theme-green-2 flex justify-center items-center gap-x-2 mt-10"
                    >
                      <FaPlus size={16} />
                      <span>Add new Address</span>
                    </button>
                  </div>
                </div>
              )}

              {tab === "Help & Support" && (
                <div className="col-span-2 md:bg-theme-gray rounded-md p-3 md:p-6 my-8 space-y-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-3xl font-omnes">
                        {t("Help & Support")}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="text-xl desktop:text-2xl font-semibold font-sf text-theme-black-2">
                        Hi,&nbsp;{userName}
                      </div>
                      <div>
                        <PiHandWavingFill size={28} color="#FFDD67" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-3xl desktop:text-4xl font-bold font-omnes">
                        {t("How can we help?")}
                      </h4>
                      <p className="text-lg desktop:text-xl font-sf text-theme-black-2 text-opacity-65 max-w-sm">
                        {t(
                          "To get started, choose a topic below so we can get you to the right place."
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Link
                      to="/support/orders"
                      className="w-full flex justify-between items-center py-4 border-b border-b-[#00000033]"
                    >
                      <span className="text-lg desktop:text-xl font-sf font-medium">
                        {t("Orders")}
                      </span>
                      <span className="text-lg desktop:text-xl font-sf">
                        <FaAngleRight />
                      </span>
                    </Link>

                    <Link
                      to="/support/profile"
                      className="w-full flex justify-between items-center py-4 border-b border-b-[#00000033]"
                    >
                      <span className="text-lg desktop:text-xl font-omnes font-bold">
                        {t("Profile")}
                      </span>
                      <span className="text-lg desktop:text-xl font-sf">
                        <FaAngleRight />
                      </span>
                    </Link>

                    <Link
                      to="/support/promotions-gifts"
                      className="w-full flex justify-between items-center py-4 border-b border-b-[#00000033]"
                    >
                      <span className="text-lg desktop:text-xl font-sf font-medium">
                        {t("Promotions and Gift Cards")}
                      </span>
                      <span className="text-lg desktop:text-xl font-sf">
                        <FaAngleRight />
                      </span>
                    </Link>

                    <Link
                      to="/support/bills-payments"
                      className="w-full flex justify-between items-center py-4 border-b border-b-[#00000033]"
                    >
                      <span className="text-lg desktop:text-xl font-sf font-medium">
                        {t("Bills and payments")}
                      </span>
                      <span className="text-lg desktop:text-xl font-sf">
                        <FaAngleRight />
                      </span>
                    </Link>

                    <Link
                      to="/support/chat-person"
                      className="w-full flex justify-between items-center py-4"
                    >
                      <span className="text-lg desktop:text-xl font-sf font-medium">
                        {t("Chat with a person")}
                      </span>
                      <span className="text-lg desktop:text-xl font-sf">
                        <FaAngleRight />
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
