import { useContext, useEffect, useRef, useState } from "react";
import {
  FaBriefcase,
  FaClock,
  FaDoorOpen,
  FaMinus,
  FaPlus,
  FaWalking,
  FaCalendar,
} from "react-icons/fa";
import { FaAngleRight, FaCheck } from "react-icons/fa6";
import GetAPI from "../../utilities/GetAPI";
import Header from "../../components/Header";
import { RiDeleteBinLine, RiEBike2Line, RiSubtractFill } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { PostAPI } from "../../utilities/PostAPI";
import { BiCycling, BiPlus, BiTrash } from "react-icons/bi";
import { IoIosArrowDown, IoMdHome } from "react-icons/io";
import { MdInsertComment } from "react-icons/md";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import {
  MdApartment,
  MdEditCalendar,
  MdLocationPin,
  MdOutlinePayment,
} from "react-icons/md";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import { DirectionsRenderer, GoogleMap, MarkerF } from "@react-google-maps/api";
import { BASE_URL } from "../../utilities/URL";
import { FaCirclePlus, FaLocationDot } from "react-icons/fa6";
import { IoArrowBackOutline, IoClose, IoHome } from "react-icons/io5";
import Select from "react-select";
import { Autocomplete } from "@react-google-maps/api";
import { ImOffice } from "react-icons/im";
import { GrMapLocation } from "react-icons/gr";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Footer from "../../components/Footer";
import { formatPrice } from "../../utilities/priceConverter";
import Switch from "react-switch";
import { dataContext } from "../../utilities/ContextApi";
import { BsQrCodeScan } from "react-icons/bs";
import QRCode from "react-qr-code";
import { PiPersonSimpleBike, PiShareNetworkFill } from "react-icons/pi";

dayjs.extend(customParseFormat);

export default function GroupCheckout() {
  const location = useLocation();
  const { gData, setGData, groupDrawer, setGroupDrawer } =
    useContext(dataContext);
  const [fee, setFee] = useState("");
  const [group, setGroup] = useState({
    viewSelection: "",
    liShow: false,
    show: 0,
  });

  const [ready, setReady] = useState({
    show: 0,
    readyCount: 0,
    notReadyCount: 0,
  });

  const [counter, setCounter] = useState(null);
  const handleCounterClick = (index) => {
    setCounter(index);
  };
  const cartItems = JSON.parse(localStorage.getItem("cartItems"));
  const [order, setOrder] = useState(() => {
    if (!cartItems || cartItems.length === 0) {
      return {
        orderId: null || JSON.parse(localStorage.getItem("groupData"))?.orderId,
        subTotal: 0,
        restaurantId: null || Number(localStorage.getItem("resId")),
        userId: null || Number(localStorage.getItem("userId")),
        voucherId: "",
        products: [],
        cutlery_data: [],
      };
    }

    const products = cartItems.map((item) => ({
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      RPLinkId: item.RPLinkId || null,
      name: item.name || "",
      image: item.image || "",
      addOns: item.addOns || [],
    }));

    // Calculate subtotal
    const currencySign = cartItems?.length > 0 ? cartItems[0].currencySign : "";

    const subTotal = cartItems
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

    return {
      orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
      subTotal: Number(subTotal),
      restaurantId: Number(localStorage.getItem("resId")),
      userId: Number(localStorage.getItem("userId")),
      voucherId: "",
      products: products,
      cutlery_data: [],
    };
  });

  console.log("🚀 ~ const[order,setOrder]=useState ~ order:", order);
  function filterKeys(obj, keys) {
    const newObj = {};
    for (const key in obj) {
      if (!keys.includes(key)) {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }

  const socketUrl = "ws://fominobackend.myace.app:3041/";
  const navigate = useNavigate();

  const { data } = GetAPI("users/getCountriesAndCities");
  const dataAddress = GetAPI("users/alladdresses");

  let preAddress = dataAddress?.data?.data?.addressList?.find(
    (ele) =>
      ele.lat === localStorage.getItem("lat") &&
      ele.lng === localStorage.getItem("lng")
  );

  const [deliveryData, setDeliveryData] = useState({
    how: 1,
    where: 1,
    when: 1,
    howShow: false,
    whereShow: false,
    whenShow: false,
    schedule: "",
  });
  const [schedule, setSchedule] = useState({
    day: "",
    time: "",
    date: "",
  });
  const [modal, setModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [modalScroll, setModalScroll] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [days, setDays] = useState([]);
  const [timeChunks, setTimeChunks] = useState([]);
  const [currentCoordinates, setCurrentCoordinates] = useState({
    lat: "",
    lng: "",
  });
  const [leaveAtDoor, setLeaveAtDoor] = useState(0);

  const handleLeaveAtDoor = () => {
    setLeaveAtDoor((prev) => (prev === 0 ? 1 : 0));
  };

  const [deliveryCharges, setDeliveryCharges] = useState({
    distance: "",
    distanceUnit: "",
    currencyUnit: "",
    packingFee: "",
    deliveryCharges: "",
    serviceCharges: "",
    VAT: "",
  });

  const [addressTab, setAddressTab] = useState(1);
  const [tip, setTip] = useState({
    tip: undefined,
    other: false,
  });
  const [isAbsolute, setIsAbsolute] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState({
    name: "",
    type: "",
  });

  const [paymentDetails, setpaymentDetails] = useState({
    cardNum: "4111111111111111",
    exp_month: "12",
    exp_year: "2025",
    cvc: "321",
    isCredit: "",
  });
  const [country, setCountry] = useState({
    countries: {
      value: "",
      label: localStorage.getItem("countryName"),
      short: localStorage.getItem("countryShortName"),
    },
    selectedCountryShortName: localStorage.getItem("countryShortName"),
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

  const onChange = (e) => {
    setpaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleSelect = (name, type) => {
    setSelectedPayment({
      ...selectedPayment,
      name,
      type,
    });
  };

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
    setAddressTab(1);
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

  const handleModalScroll = (event) => {
    setModalScroll(event.target.scrollTop);
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

  function convertToISO(date, time) {
    const [day, month, year] = date.split("-");
    const [hours, minutes] = time.split(":");
    const dateTime = dayjs(
      `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`
    );
    const isoDate = dateTime.toISOString();
    return isoDate;
  }

  const checkCoupon = async () => {
    if (coupon === "") {
      info_toaster("Please enter Coupon Code");
    } else {
      let res = await PostAPI("users/applyvoucher", {
        code: coupon,
        userId: localStorage.getItem("userId"),
        restaurantId: localStorage.getItem("resId"),
      });
      if (res?.data?.status === "1") {
        success_toaster(res?.data?.message);
      } else {
        error_toaster(res?.data?.message);
      }
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (paymentDetails.cardNum === "") {
      info_toaster("Please Enter Card Num");
    } else if (paymentDetails.exp_month === "") {
      info_toaster("Please Enter Exp Month");
    } else if (paymentDetails.exp_year === "") {
      info_toaster("Please Enter Exp Year");
    } else if (paymentDetails.cvc === "") {
      info_toaster("Please Enter CVC");
    } else {
      setPaymentModal(false);
    }
  };

  const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const totalPrice = existingCartItems.reduce((accumulator, currentItem) => {
    const itemQuantity = currentItem.quantity;
    const itemUnitPrice = parseFloat(currentItem.unitPrice) || 0;
    const addonsTotal =
      currentItem?.addOns?.reduce((addonAccumulator, addon) => {
        return addonAccumulator + (addon?.total || 0) * (addon?.quantity || 1);
      }, 0) || 0;
    const itemTotalPrice = itemQuantity * (itemUnitPrice + addonsTotal);

    return accumulator + itemTotalPrice;
  }, 0);

  const totalReadySubTotal = gData?.participantList
    // ?.filter((participant) => participant.isReady)
    ?.reduce((sum, participant) => sum + participant?.subTotal, 0);

  const hostTotal = gData?.participantList
    ?.filter((participant) => {
      return (
        participant?.participantId == gData?.hostebBy?.id &&
        participant?.isReady
      );
    })
    ?.reduce((sum, participant) => {
      const subTotal = parseFloat(participant?.subTotal || 0);
      return sum + subTotal;
    }, 0);

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
      total: parseInt(totalPrice),
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
      // success_toaster(res?.data?.message);
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
        setAddressTab(1);
        setAddressModal(false);
        success_toaster(res?.data?.message);
        dataAddress.reFetch();
      } else {
        error_toaster(res?.data?.message);
      }
    }
  };

  const createOrder = async (e) => {
    if (!localStorage.getItem("groupData")) {
      e.preventDefault();
      if (deliveryData.how === 1 && deliveryAddress.id === "") {
        info_toaster("Please select Delivery Address");
      } else if (deliveryData.when === 2 && schedule.date === "") {
        info_toaster("Please select Schedule Day");
      } else if (deliveryData.when === 2 && schedule.time === "") {
        info_toaster("Please select Schedule Time");
      } else if (selectedPayment?.name == "") {
        info_toaster("Please select Payment Method");
      } else if (
        paymentDetails.cardNum === "" ||
        paymentDetails.exp_month === "" ||
        paymentDetails.exp_year === "" ||
        paymentDetails.cvc === ""
      ) {
        info_toaster("Please Enter Payment Details");
      } else {
        setDisabled(true);
        let res = await PostAPI("users/addorder", {
          scheduleDate:
            deliveryData.when === 1
              ? new Date().toISOString()
              : convertToISO(schedule.date, schedule.time.label),
          note: localStorage.getItem("note") ?? "",
          leaveOrderAt: 1,
          subTotal: totalPrice,
          total:
            deliveryCharges?.deliveryCharges !== ""
              ? totalPrice +
                parseInt(deliveryCharges?.deliveryCharges) +
                parseInt(deliveryCharges?.serviceCharges) +
                parseInt(deliveryCharges?.VAT) +
                parseInt(deliveryCharges?.packingFee) +
                (tip?.tip !== undefined ? tip?.tip : 0)
              : totalPrice,
          productsDiscount: 0,
          VAT: parseInt(deliveryCharges?.VAT),
          deliveryTypeId: deliveryData?.how,
          orderModeId: deliveryData?.when,
          paymentMethodId: 1,
          dropOffLat:
            deliveryData?.how === 1
              ? parseFloat(deliveryAddress?.lat)
              : currentCoordinates.lat,
          dropOffLng:
            deliveryData?.how === 1
              ? parseFloat(deliveryAddress?.lng)
              : currentCoordinates.lng,
          building: deliveryAddress?.building,
          streetAddress: deliveryAddress?.streetAddress,
          distance: parseFloat(deliveryCharges?.distance),
          distanceUnit: deliveryCharges?.distanceUnit,
          restaurantId: parseInt(localStorage.getItem("resId")),
          userId: parseInt(localStorage.getItem("userId")),
          voucherId: "",
          orderType: 2,
          deliveryFees:
            deliveryCharges?.deliveryCharges !== ""
              ? parseInt(deliveryCharges?.deliveryCharges)
              : 0,
          serviceCharges:
            deliveryCharges?.serviceCharges !== ""
              ? parseInt(deliveryCharges?.serviceCharges)
              : 0,
          tip: tip?.tip !== undefined ? tip?.tip : 0,
          products: JSON.parse(localStorage.getItem("cartItems")).map((item) =>
            filterKeys(item, ["addOnsCat", "description", "currencySign"])
          ),
          cutlery_data: {
            cutleryId: 1,
            qty: 3,
          },
        });

        if (res?.data?.status === "1") {
          if (localStorage.getItem("orderId") == res?.data?.data?.orderId) {
          } else {
            localStorage.setItem("statusHistory", JSON.stringify([]));
          }
          window.location.href = `${BASE_URL}adyen/${res?.data?.data?.orderId}/${selectedPayment?.type}`;
          localStorage.setItem("orderId", res?.data?.data?.orderId);
        } else {
          error_toaster(res?.data?.message);
          setDisabled(true);
        }
      }
    } else {
      if (selectedPayment?.name == "") {
        info_toaster("Please select Payment Method");
        return false;
      } else if (totalReadySubTotal == 0) {
        info_toaster("Please add items to place group order");
        return false;
      } else if (
        gData?.participantList &&
        gData.participantList.length > 0 &&
        gData.participantList.some((participant) => !participant.isReady)
      ) {
        info_toaster(
          "All participants must be ready before placing the group order"
        );
        return false;
      }
      console.log(
        `Place Group Order Clicked ${totalReadySubTotal} ${gData?.participantList?.length}`
      );

      //GroupOrder APi
      let orderTotal =
        fee?.deliveryCharges !== ""
          ? parseInt(fee?.deliveryCharges) +
            parseInt(fee?.serviceCharges) +
            parseInt(fee?.VAT) +
            parseInt(fee?.packingFee)
          : 0;

      if (!orderTotal || orderTotal === 0) {
        error_toaster(orderTotal);
        return false;
      }
      // console.log(orderTotal, hostTotal, "orderTotal");
      let res = await PostAPI("users/placeGroupOrder", {
        orderId: order?.orderId,
        scheduleDate: gData?.scheduleDate,
        note: "",
        leaveOrderAt: 1,
        subTotal: totalReadySubTotal,
        total: parseInt(orderTotal) + parseInt(totalReadySubTotal),
        productsDiscount: 0,
        VAT: fee?.VAT,
        deliveryTypeId: gData?.deliveryTypeId,
        orderModeId: gData?.orderModeId,
        paymentMethodId: 1,
        dropOffLat: gData?.dropOffAddress?.lat,
        dropOffLng: gData?.dropOffAddress?.lng,
        building: "",
        streetAddress: gData?.dropOffAddress?.streetAddress,
        distance: gData?.distance,
        distanceUnit: fee?.distanceUnit,
        restaurantId: gData?.restaurant?.id,
        userId: gData?.hostebBy?.id,
        voucherId: "",
        orderType: 1,
        deliveryFees: fee?.deliveryCharges,
        serviceCharges: fee?.serviceCharges,
        products: order?.products,
        cutlery_data: [],
      });
      console.log(res, "groupOrderPlace API call");

      if (res?.data?.status === "1") {
        if (localStorage.getItem("orderId") == res?.data?.data?.orderId) {
        } else {
          localStorage.setItem("statusHistory", JSON.stringify([]));
        }
        localStorage.setItem("orderId", res?.data?.data?.orderId);
        window.location.href = `${BASE_URL}adyen/${res?.data?.data?.orderId}/${selectedPayment?.type}`;
      }
    }
  };

  const activeResData = JSON.parse(localStorage.getItem("activeResData"));
  async function calculateRoute1() {
    const directionsService = new window.google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: {
        lat: parseFloat(localStorage.getItem("lat")),
        lng: parseFloat(localStorage.getItem("lng")),
      },
      destination: {
        lat: parseFloat(deliveryAddress?.lat),
        lng: parseFloat(deliveryAddress?.lng),
      },
      travelMode: window.google.maps.TravelMode.DRIVING,
    });

    setDirectionsResponse(results);
  }

  const countriesRestriction = {
    componentRestrictions: { country: [`${country.selectedCountryShortName}`] },
  };

  useEffect(() => {
    if (
      JSON.parse(localStorage.getItem("cartItems"))?.length === 0 &&
      !localStorage.getItem("groupData")
    ) {
      navigate("/");
    }

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
        how: parseInt(localStorage.getItem("how")) ?? 0,
        when: parseInt(localStorage.getItem("when")) ?? 0,
      });
    }
  }, [fee]);

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

  const PayM = GetAPI("adyen/getPaymentMethods");
  const inputStyle =
    "w-full resize-none font-normal text-base text-black rounded-lg py-3 px-4 bg-white border-2 border-theme-gray-4 placeholder:text-black placeholder:text-opacity-40 focus:outline-none focus:border-2 focus:border-green-700 hover:border-2 hover:border-green-700 hover:cursor-pointer";

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
  }, [deliveryAddress, totalReadySubTotal]);
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

  const notReady = async () => {
    let res = await PostAPI("users/notReady", {
      orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
      userId: Number(localStorage.getItem("userId")),
    });
    console.log(res, "not ready");
    navigate(
      `/${countryCode ? countryCode : "pk"}/group-order/${groupId}/join`,
      {
        state: { g: true },
      }
    );
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
        localStorage.removeItem("gLink");
        localStorage.removeItem("hasJoinedGroup");
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

  //Joining the group/Host
  const joinGroup = async () => {
    const res = await PostAPI("users/joinGroup", {
      orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
      subTotal: order?.subTotal,
      restaurantId: Number(localStorage.getItem("resId")),
      userId: Number(localStorage.getItem("userId")),
      voucherId: "",
      products: order?.products,
      cutlery_data: [],
    });
    if (res?.data?.status === "1") {
      localStorage.setItem("hasJoinedGroup", true);
    }
  };

  useEffect(() => {
    //Getting Group Details Here
    const groupDets = async () => {
      let res = await PostAPI("users/groupOrderDetails", {
        orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
      });

      if (res?.data?.status === "1") {
        setGData(res?.data?.data);
      }
    };
    groupDets();

    //fee
    if (gData) {
      const fee = async () => {
        let res = await PostAPI("users/deliveryfee", {
          restaurantId: Number(gData?.restaurant?.id),
          dropOffLat: gData?.dropOffAddress?.lat,
          dropOffLng: gData?.dropOffAddress?.lng,
          total: 0,
        });
        if (res?.data?.status === "1") {
          setFee(res?.data?.data);
        }
      };
      fee();
    }

    if (!localStorage.getItem("hasJoinedGroup")) {
      joinGroup();
    }
  }, []);

  return (
    <>
      <Modal
        onClose={() => {
          setModal(false);
          setDeliveryData({
            ...deliveryData,
            howShow: false,
            whereShow: false,
            whenShow: false,
          });
        }}
        isOpen={modal}
        isCentered
        size="xl"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius={"20px"}
          maxW={["510px", "510px", "600px"]}
          className="modal-content-custom"
        >
          <ModalCloseButton />
          <ModalHeader>
            <h5 className="font-tt font-black text-[28px] text-center">
              Select order details
            </h5>
          </ModalHeader>
          <ModalBody padding={0}>
            <div className="font-switzer max-h-[calc(100vh-200px)] h-auto overflow-auto pt-8 pb-3 space-y-7">
              {deliveryData.how === 1 && (
                <>
                  <div className="px-6">
                    <div className="space-y-5  ">
                      <h4 className="text-2xl text-black font-tt font-black">
                        Where to?
                      </h4>
                      {dataAddress?.data?.data?.addressList
                        ?.filter(
                          (fil) =>
                            fil.AddressType &&
                            fil.AddressType.toString().length > 0
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
                                      calculateRoute();
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
                        onClick={() => {
                          setAddressModal(true);
                          setHasPositionChanged(false);
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
                        }}
                        className="flex items-center gap-x-3"
                      >
                        <FaPlus size={20} />
                        <span>Add new address</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <button
              onClick={() => setModal(false)}
              className="py-3 px-5 w-full bg-theme-red text-white font-switzer font-semibold text-base rounded border border-theme-red hover:bg-transparent hover:text-theme-red"
            >
              Done
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
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
              className="max-h-[calc(100vh-200px)] h-auto overflow-auto  font-switzer "
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
                      className="font-semibold text-base py-2 px-5 my-5 w-full bg-theme-red text-white rounded"
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
                              src="/public/images/pin_location.svg"
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
                      <img
                        src="/public/images/pin_location.svg"
                        alt="Fixed Marker"
                      />
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

      <Modal
        onClose={() => {
          setPaymentModal(false);
        }}
        isOpen={paymentModal}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        <ModalContent borderRadius={"20px"}>
          <ModalCloseButton />
          <form onSubmit={handlePayment}>
            <ModalBody padding={0}>
              <div className="font-switzer px-6">
                <h4 className="text-2xl text-black font-black capitalize mt-3 mb-6 text-center font-tt ">
                  Payment Methods
                </h4>

                <div className="space-y-4">
                  {PayM.data?.data?.simplifiedPaymentMethods.map((itm, idx) => (
                    <div
                      key={idx}
                      className={`border border-black border-opacity-20 rounded-lg py-2 px-3 cursor-pointer`}
                      onClick={() => handleSelect(itm?.name, itm.type)}
                    >
                      <div className="flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={`${
                              itm?.name.includes("card")
                                ? "/images/credit-card.webp"
                                : itm?.name.includes("Apple")
                                ? "/images/epay.webp"
                                : itm?.name.includes("Google")
                                ? "/images/gpay.webp"
                                : ""
                            }`}
                            alt="payment-card"
                            className="w-9 h-9 object-contain"
                          />
                          <span className="text-lg font-switzer font-medium text-black">
                            {itm?.name}
                          </span>
                        </div>
                        {selectedPayment.name === itm?.name && (
                          <span className="text-theme-green-2 text-xl">
                            <FaCheck />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="font-switzer font-light mt-1 mb-5">
                  A service fee will be charged.
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <button
                type="submit"
                className="bg-[#E13743] text-white text-lg rounded-sm border border-[#E13743] py-2 px-5 w-full hover:bg-transparent hover:text-[#E13743] font-semibold"
                onClick={() => {
                  if (selectedPayment.name === "") {
                    info_toaster("Please Select Payment Method");
                  } else {
                    // navigate("/payment", {
                    //   state: { paymentMethod: selectedPayment },
                    // });
                  }
                }}
              >
                Next
              </button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Header
        home={true}
        rest={false}
        groupDrawer={groupDrawer}
        setGroupDrawer={setGroupDrawer}
        gData={gData}
      />
      <section className="bg-theme-green">
        <div className="h-96 relative text-black hover:text-opacity-50">
          <GoogleMap
            zoom={12}
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
              icon={{
                url: "/images/restaurants/restaurant.webp",
                scaledSize: new window.google.maps.Size(45, 50),
              }}
            />

            <MarkerF
              position={{
                lat: parseFloat(deliveryAddress.lat),
                lng: parseFloat(deliveryAddress.lng),
              }}
              icon={{
                url: "/images/restaurants/home.webp",
                scaledSize: new window.google.maps.Size(45, 50),
              }}
            />

            {directionsResponse && (
              <DirectionsRenderer
                directions={directionsResponse}
                options={{ suppressMarkers: true }} // This line suppresses the default markers
              />
            )}
          </GoogleMap>

          <div className="w-[92%] lg:w-[94%] xl:w-[90%] smallDesktop:w-[95%] desktop:w-5/6 largeDesktop:w-[75%] extraLargeDesktop:w-[62.5%] mx-auto -mt-20 md:-mt-40 z-40 relative pointer-events-none">
            <div className="">
              <h3 className="text-3xl md:text-5xl font-black font-tt">
                Checkout
              </h3>
              <p className="text-xl md:text-2xl font-semibold font-sf">
                {activeResData?.name}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-x-10 gap-y-5 w-[92%] lg:w-[94%] xl:w-[90%] smallDesktop:w-[95%] desktop:w-5/6 largeDesktop:w-[75%] extraLargeDesktop:w-[62.5%] mx-auto my-20 font-switzer">
        <div className="lg:col-span-3">
          <div className="space-y-3">
            {/* =======Group card======== */}
            {localStorage.getItem("groupOrder") && (
              <div
                className=" relative flex gap-x-3 items-center font-sf  bg-white rounded-lg shadow-restaurantCardSahadow px-4 py-5 !mb-16 !mt-10 cursor-pointer"
                onClick={() => setGroupDrawer(!groupDrawer)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      BASE_URL +
                        JSON.parse(localStorage.getItem("groupData"))
                          ?.groupIcon || "/images/userIcon.jpeg"
                    }
                    alt=""
                  />
                </div>
                <div>
                  <h4 className="text-base font-semibold font-switzer">
                    {JSON.parse(localStorage.getItem("groupData"))?.groupName}
                  </h4>
                  <p className="text-sm font-light text-gray-500">
                    {gData?.participantList?.length} participant &bull; click to
                    manage
                  </p>
                </div>
                <div className="text-theme-green-2 text-xl absolute top-[50%] right-5 translate-y-[-50%]">
                  <button>
                    <FaAngleRight />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =============== */}
          <div className="shadow-restaurantCardSahadow px-4 py-8 rounded-md">
            <div className="flex items-center gap-x-4">
              <PiPersonSimpleBike size={38} />
              <div>
                <div className=" font-sf">
                  <h4 className="text-lg leading-6">
                    Delivery{" "}
                    <span className="text-gray-500">
                      in {gData?.restaurant?.approxDeliveryTime}-
                      {gData?.restaurant?.approxDeliveryTime + 5} min to
                    </span>{" "}
                    {gData?.dropOffAddress?.streetAddress}
                  </h4>
                </div>
                <p className="text-gray-500">
                  Note for the courier: Leave the order at my door
                </p>
              </div>
            </div>
          </div>

          {/* =======Participants========== */}
          <div className="">
            <div className="w-full text-right">
              <button
                className="bg-red-100 rounded-md px-4 py-1 text-red-500 mt-5 ml-auto"
                onClick={() => {
                  notReady();
                  localStorage.removeItem("hasJoinedGroup");
                  window.history.back();
                }}
              >
                Edit
              </button>
            </div>

            <div className="flex justify-between items-center">
              <h4 className="text-xl md:text-2xl  font-tt font-black">
                Participants
              </h4>
              <div className="flex gap-x-2 w-[200px] [&>p]:cursor-pointer [&>p]:text-center my-8 border-b [&>p]:pb-2">
                <p
                  className={`hover:text-red-500 w-1/2 ${
                    ready.show == 0 && "border-b-red-500 border-b-2"
                  }`}
                  onClick={() => setReady({ ...ready, show: 0 })}
                >
                  Not Ready:{" "}
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

            <div className="shadow-restaurantCardSahadow px-4 py-8 rounded-lg">
              {ready?.show === 0 ? (
                <div className="space-y-3">
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
                              className="flex gap-x-2 items-center w-full relative"
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
                                <div className="absolute top-1 right-10 text-green-700">
                                  {participant?.subTotal}{" "}
                                  {gData?.currencyDetails?.symbol}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {participant?.items?.map((el, idx) => {
                                return (
                                  <div
                                    key={idx}
                                    className={`${
                                      participant?.participantId ==
                                        group?.viewSelection && group?.liShow
                                        ? ""
                                        : "h-0 overflow-hidden"
                                    }`}
                                  >
                                    <div className="flex gap-x-3 items-center pl-5">
                                      <img
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={BASE_URL + el?.productName?.image}
                                        alt=""
                                      />{" "}
                                      {el?.qty}x {el?.productName?.name}
                                    </div>
                                    <div className="pl-20 text-gray-500">
                                      {el?.addOns?.map((addon, k) => (
                                        <div>
                                          {addon?.qty +
                                            "x" +
                                            addon?.addOn?.name +
                                            ` (${addon?.total})`}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      }
                    })}
                </div>
              ) : (
                <div className="space-y-3">
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
                                <div className="absolute top-1 right-10 text-green-700">
                                  {participant?.subTotal}{" "}
                                  {gData?.currencyDetails?.symbol}
                                </div>
                              </div>
                            </div>
                            {/* down arrow items show*/}
                            <div className={group?.liShow ? `space-y-2` : ""}>
                              {participant?.items?.map((el, i) => {
                                return (
                                  <div
                                    key={i}
                                    className={` ${
                                      participant?.participantId ==
                                        group?.viewSelection && group?.liShow
                                        ? ""
                                        : "h-0 overflow-hidden"
                                    }`}
                                  >
                                    <div className="flex gap-x-3 items-center pl-5">
                                      <img
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={BASE_URL + el?.productName?.image}
                                        alt=""
                                      />{" "}
                                      {el?.qty}x {el?.productName?.name}
                                    </div>

                                    <div className="pl-20 text-gray-500">
                                      {el?.addOns?.map((addon, k) => (
                                        <div>
                                          {addon?.qty +
                                            "x" +
                                            addon?.addOn?.name +
                                            ` (${addon?.total})`}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      }
                    })}
                </div>
              )}
            </div>
          </div>

          {/* ================== */}

          <div className="flex items-center gap-x-2 mt-10 mb-5">
            <MdOutlinePayment size={24} className="text-2xl" />
            <h3 className="text-xl md:text-2xl  font-tt font-black">
              Payment Method
            </h3>
          </div>
          <div className="bg-white rounded-lg p-5 my-4 shadow-restaurantCardSahadow  ">
            {selectedPayment?.name ? (
              <div
                className="flex items-center gap-3 justify-between"
                onClick={() => {
                  setPaymentModal(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`${
                      selectedPayment?.name.includes("card")
                        ? "/images/credit-card.webp"
                        : selectedPayment?.name.includes("Apple")
                        ? "/images/epay.webp"
                        : selectedPayment?.name.includes("Google")
                        ? "/images/gpay.webp"
                        : ""
                    }`}
                    alt="payment-card"
                    className="w-9 h-9 object-contain"
                  />
                  <span className="text-lg font-switzer font-medium text-black">
                    {selectedPayment?.name}
                  </span>
                </div>

                <span className="text-theme-green-2 text-xl">
                  <FaCheck />
                </span>
              </div>
            ) : (
              <div
                className="flex items-center justify-between w-full font-semibold text-lg cursor-pointer"
                onClick={() => {
                  setPaymentModal(true);
                }}
              >
                <div>Select Payment Method</div>
                <div className="text-theme-green-2 text-xl">
                  <button>
                    <FaAngleRight />
                  </button>
                </div>
              </div>
            )}
          </div>
          {deliveryData.how === 1 && (
            <>
              <div className="flex items-center gap-x-2 mt-10 mb-5">
                <h3 className="text-xl md:text-2xl font-semibold">
                  Tip the courier
                </h3>
              </div>
              <div className="bg-white rounded-lg shadow-restaurantCardSahadow   p-5 my-4">
                <div>
                  <p className="text-black text-opacity-50">
                    Your tip will be paid the courier together with their
                    salary. Fomino doesn't <br className="sm:block hidden" />{" "}
                    deduct anything from the tip.
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 my-5 cursor-pointer">
                    <button
                      onClick={() => setTip({ ...tip, other: false, tip: 0 })}
                      className={`font-light text-base text-black text-opacity-80 border-2 px-5 py-0.5 rounded-2xl w-full hover:bg-theme-red hover:bg-opacity-20 hover:border-theme-red ${
                        tip.tip === 0
                          ? "border-theme-red"
                          : "border-theme-gray-14"
                      }`}
                    >
                      0 CHF
                    </button>
                    <button
                      onClick={() => setTip({ ...tip, other: false, tip: 1 })}
                      className={`font-light text-base text-black text-opacity-80 border-2 px-5 py-0.5 rounded-2xl w-full hover:bg-theme-red hover:bg-opacity-20 hover:border-theme-red ${
                        tip.tip === 1
                          ? "border-theme-red"
                          : "border-theme-gray-14"
                      }`}
                    >
                      1 CHF
                    </button>
                    <button
                      onClick={() => setTip({ ...tip, other: false, tip: 2 })}
                      className={`font-light text-base text-black text-opacity-80 border-2 px-5 py-0.5 rounded-2xl w-full hover:bg-theme-red hover:bg-opacity-20 hover:border-theme-red ${
                        tip.tip === 2
                          ? "border-theme-red"
                          : "border-theme-gray-14"
                      }`}
                    >
                      2 CHF
                    </button>
                    <button
                      onClick={() => setTip({ ...tip, other: false, tip: 5 })}
                      className={`font-light text-base text-black text-opacity-80 border-2 px-5 py-0.5 rounded-2xl w-full hover:bg-theme-red hover:bg-opacity-20 hover:border-theme-red ${
                        tip.tip === 5
                          ? "border-theme-red"
                          : "border-theme-gray-14"
                      }`}
                    >
                      5 CHF
                    </button>
                    <button
                      onClick={() => setTip({ ...tip, other: true, tip: 10 })}
                      className={`font-light text-base text-theme-green-3 border-2 px-5 py-0.5 rounded-2xl w-full hover:bg-theme-red hover:bg-opacity-20 hover:border-theme-red ${
                        tip.other
                          ? "border-theme-red"
                          : "border-transparent bg-theme-green-3 bg-opacity-20"
                      }`}
                    >
                      Other
                    </button>
                  </div>
                  {tip.other && (
                    <div className="relative">
                      <input
                        value={tip.tip}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^[1-9]\d*$/.test(value)) {
                            setTip({ ...tip, tip: value });
                          }
                        }}
                        type="text"
                        min={1}
                        className="py-3 px-5 w-full rounded-lg font-normal text-base text-center border-2 border-black border-opacity-20 focus:outline-theme-red"
                      />
                      <button
                        onClick={() => setTip({ ...tip, tip: tip.tip - 1 })}
                        disabled={tip.tip === 1 ? true : false}
                        className={`p-1 rounded-full hover:bg-opacity-40 absolute top-1/2 left-5 -translate-y-1/2 ${
                          tip.tip === 1
                            ? "text-black bg-black bg-opacity-20 cursor-not-allowed"
                            : "text-theme-red bg-theme-red bg-opacity-20"
                        }`}
                      >
                        <FaMinus size={12} />
                      </button>
                      <button
                        onClick={() => setTip({ ...tip, tip: tip.tip + 1 })}
                        className={`p-1 rounded-full hover:bg-opacity-40 absolute top-1/2 right-5 -translate-y-1/2 text-theme-red bg-theme-red bg-opacity-20
                    }`}
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div
          className={`bg-white rounded-lg relative w-full shadow-restaurantCardSahadow   px-5 py-10 lg:col-span-2 h-[460px] space-y-6 lg:sticky lg:top-40 lg:-mt-40`}
        >
          <div className="flex items-center text-xl md:text-2xl gap-x-2">
            <h3 className="font-semibold font-switzer">
              Prices in CHF, incl. taxes
            </h3>
          </div>
          <div className="space-y-4 my-4">
            <div className="flex items-center justify-between gap-x-2">
              <h5 className="text-base md:text-lg font-semibold text-black text-opacity-50">
                Subtotal
              </h5>
              <h6>
                {existingCartItems?.length >= 0 ? (
                  <>
                    {formatPrice(totalReadySubTotal)}{" "}
                    {activeResData?.currencyUnit}
                  </>
                ) : (
                  0
                )}
              </h6>
            </div>
            {deliveryData.how === 1 && (
              <>
                <div className="flex items-center justify-between gap-x-2">
                  <h5 className="text-base md:text-lg font-switzer font-semibold text-black text-opacity-50">
                    Service Fee
                  </h5>
                  <h6>
                    {deliveryCharges?.serviceCharges
                      ? parseFloat(deliveryCharges?.serviceCharges).toFixed(2)
                      : 0}{" "}
                    {deliveryCharges?.currencyUnit}
                  </h6>
                </div>
                <div className="flex items-center justify-between gap-x-2">
                  <h5 className="text-base md:text-lg font-switzer font-semibold text-black text-opacity-50">
                    Delivery Fee
                  </h5>
                  <h6>
                    {deliveryCharges?.deliveryCharges
                      ? parseFloat(deliveryCharges?.deliveryCharges).toFixed(2)
                      : 0}{" "}
                    {deliveryCharges?.currencyUnit}
                  </h6>
                </div>
                {tip?.tip >= 1 && (
                  <div className="flex items-center justify-between gap-x-2">
                    <h5 className="text-base md:text-lg font-switzer font-semibold text-black text-opacity-50">
                      Tip the courier
                    </h5>
                    <h6>
                      {tip?.tip ? parseFloat(tip?.tip).toFixed(2) : 0}{" "}
                      {activeResData?.currencyUnit}
                    </h6>
                  </div>
                )}
              </>
            )}
            <div className="flex items-center justify-between gap-x-2">
              <h5 className="font-semibold text-xl md:text-2xl">Total</h5>
              <h6>
                {(
                  totalReadySubTotal +
                  (deliveryCharges?.deliveryCharges
                    ? parseInt(deliveryCharges.deliveryCharges)
                    : 0) +
                  (deliveryCharges?.serviceCharges
                    ? parseInt(deliveryCharges.serviceCharges)
                    : 0) +
                  (deliveryCharges?.packingFee
                    ? parseInt(deliveryCharges.packingFee)
                    : 0) +
                  (tip?.tip >= 1 ? parseInt(tip.tip) : 0)
                ).toFixed(2)}{" "}
                {activeResData?.currencyUnit}
              </h6>
            </div>
            <div className="border-dashed border" />
            <div className="relative">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                type="text"
                placeholder="Discount code"
                className="w-full resize-none font-normal text-base text-black rounded py-3 px-4 bg-[#F4F4F4] border-2 border-theme-gray-4 placeholder:text-black placeholder:text-opacity-40 focus:outline-none"
              />
              <button
                type="button"
                onClick={checkCoupon}
                className="bg-black text-white rounded-md h-[82%] px-5 absolute right-1 top-1/2 -translate-y-1/2"
              >
                Apply
              </button>
            </div>
          </div>
          <div>
            <button
              // disabled={disabled ? true : false}
              onClick={createOrder}
              className="bg-black w-full text-xl font-semibold text-white rounded-md px-3 py-3"
            >
              Place Order
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
