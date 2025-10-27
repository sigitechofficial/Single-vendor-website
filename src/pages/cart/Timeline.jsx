import React, { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { MdMessage, MdOutlineDeliveryDining, MdHotTub } from "react-icons/md";
import { FaCircleExclamation, FaRegRectangleList } from "react-icons/fa6";
import GetAPI from "../../utilities/GetAPI";
import dayjs from "dayjs";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import { GiCardPickup } from "react-icons/gi";
import {
  GoogleMap,
  MarkerF,
  DirectionsService,
  DirectionsRenderer,
  useLoadScript,
  Polygon,
} from "@react-google-maps/api";
import { FaRegSmile, FaCheck, FaCheckCircle, FaPhone } from "react-icons/fa";
import {
  IoLocationOutline,
  IoArrowBackOutline,
  IoChatbubbleEllipsesSharp,
  IoClose,
} from "react-icons/io5";
import { IoMdTime, IoIosClose, IoIosArrowRoundBack } from "react-icons/io";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import socket from "../../utilities/Socket";
import { PostAPI } from "../../utilities/PostAPI";
import { toast } from "react-toastify";
import { BASE_URL, googleApiKey } from "../../utilities/URL";
import { useLocation, useNavigate } from "react-router-dom";
import { info_toaster, mini_toaster } from "../../utilities/Toaster";
import axios from "axios";
import { getDriverLocation } from "../../firebase/firebaseDatabase";
import Loader, { RotatingLoader } from "../../components/Loader";
import Timer from "../../components/Timer";
import getCountryCode from "../../utilities/getCountryCode";
import { useTranslation } from "react-i18next";
import { getRestaurantStatus } from "../../utilities/restuarantTimeMessage";

dayjs.extend(advancedFormat);

export default function Timeline() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const mapRef = useRef();
  const userId = JSON.parse(localStorage.getItem("userId"));
  const orderId = localStorage.getItem("orderId");
  const his = JSON.parse(localStorage.getItem("his"));
  const driverId = JSON.parse(localStorage.getItem("driverId"));
  const activeResData = JSON.parse(localStorage.getItem("activeResData"));
  const mod = localStorage.getItem("mod");
  const type = localStorage.getItem("type");
  const [driverLocations, setDriverLocations] = useState();
  const [statusPercentage, setStatusPercentage] = useState(0);
  const [directions, setDirections] = useState(null);
  const [modType, setModType] = useState("details");
  const [modalScroll, setModalScroll] = useState(0);
  const [headerShadow, setHeaderShadow] = useState(false);
  const [infoModalTimings, setInfoModalTimings] = useState("Restaurant");
  const [configurationMessage, setConfigurationMessage] = useState("");
  const [message, setMessage] = useState("");
  const [polygonPaths, setPolygonPaths] = useState([]);
  const [center, setCenter] = useState({ lat: 31.5204, lng: 74.3587 });
  const [LS, setLS] = useState({
    time: true,
  });
  const navHis = location?.state?.history || "";
  console.log(navHis, "navHis");
  useEffect(() => {
    if (navHis) {
      setTab("details");
    }
  }, []);
  const [stTypes, setStTypes] = useState({
    mod,
    type,
    showCheck: false,
    innerMod: "emoji",
    driverSelEmoji: "",
    drivercmt: "",
    isCustom: false,
    driverTip: 0,
    resSelEmoji: "",
    restaurantCmt: "",
    count: 0,
    showCount: false,
  });

  const [visible, setVisible] = useState(false);

  const [statusString, setStatusString] = useState({
    str: [],
    progress: 0,
  });

  const convertDateFormat = (inputDate) => {
    const date = dayjs(inputDate);
    return date.format("Do, MMMM YYYY h:mm a");
  };
  const [tab, setTab] = useState("status");
  const [infoModal, setInfoModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const { data, reFetch: foodDetailsRefetch } = GetAPI(
    `users/orderdetailsfood/${localStorage.getItem("orderId")}`
  );
  console.log("hdauhauhauhau", data?.data);
  const countryCode = data?.data?.country;
  const city = data?.data?.city;

  useEffect(() => {
    const rawTime = data?.data?.estTime;
    if (rawTime && typeof rawTime === "string") {
      const estTimeString = String(rawTime);

      if (estTimeString.includes(":")) {
        const [estHours, estMinutes] = estTimeString.split(":").map(Number);

        const now = new Date();
        const estDate = new Date();
        estDate.setHours(estHours, estMinutes, 0, 0); // Set est time today

        const diffMs = estDate - now;
        const diffMins = Math.floor(diffMs / 60000);

        setTimeLeft(diffMins > 0 ? diffMins : 0);
      } else {
        console.warn("estTime format is not HH:MM:", estTimeString);
      }
    }
  }, [data]);

  // Decrement timeLeft every 60 seconds
  useEffect(() => {
    console.log("Time left:", timeLeft);
    if (timeLeft === null || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const resId = localStorage.getItem("resId");
  const resData = GetAPI(
    `users/restaurantbyid?restaurantId=${resId}${
      userId ? `&userId=${userId}` : ""
    }`
  );

  const getProfile = GetAPI(`users/getProfile/${userId}`);

  const orderAfterPayment = async () => {
    let response = await PostAPI("users/orderAfterPayment", {
      orderId: localStorage.getItem("orderId"),
      isCredit: false,
    });
  };

  const afterPaymentGroupOrder = async () => {
    let response = await PostAPI("users/afterPaymentGroupOrder", {
      orderId: localStorage.getItem("orderId"),
    });
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleApiKey,
    libraries: ["places", "drawing"],
  });

  const statusText = (status) => {
    console.log(status, "statusText");
    if (status === "afterPaymentGroupOrder") {
      localStorage.removeItem("groupOrder");
      localStorage.removeItem("groupData");
      localStorage.removeItem("gLink");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("hasJoinedGroup");
      localStorage.removeItem("guestJoined");
      // info_toaster("Order Placed");
    } else if (status !== "acceptOrder") {
      localStorage.removeItem("eta_minutes");
    }

    let str = {
      Title: "That’s it, we’ve got your order!",
      Message:
        "Kick back and relax - we’ll let you know when the restaurant gets to it!",
      progress: 10,
    };

    // if (
    //   status?.toLowerCase() === "delivered" ||
    //   status?.toLowerCase() === "restaurantdelivered"
    // ) {
    //   console.log("✅ Delivered status hit globally");

    //   str = {
    //     Title: "Thanks for choosing us.",
    //     Message:
    //       stTypes?.type === "Self-Pickup"
    //         ? "Please mention Fomino and your name to the staff. Feel free to skip the queue!"
    //         : "",
    //     progress: 100,
    //   };

    //   localStorage.setItem("Spercentage", str.progress);
    // }\

    console.log("stTypes", stTypes);
    if (stTypes?.type === "Delivery") {
      if (stTypes?.mod === "Standard") {
        //Delivery Standard
        if (status === "placeOrder" || status === "Placed") {
          str = {
            Title: "That’s it, we’ve got your order!",
            Message:
              "Kick back and relax - we’ll let you know when the restaurant gets to it!",
            progress: 10,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "Seen") {
          str = {
            Title: "Super! A human being has seen your order.",
            Message: "You should get the final confirmation any minute now!",
            progress: 20,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "acceptOrder" || status === "Accepted") {
          str = {
            Title: "Your order was confirmed!",
            Message: `All good to go! Your order will be delivered on ${localStorage.getItem(
              "orderScheduledDate"
            )} at ${localStorage.getItem("eta_text")} min`,
            progress: 30,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "Rejected") {
          str = {
            Title: "Order Rejected",
            Message: `Your order was rejected by restaurant! `,
            progress: 100,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status == "acceptOrderByDriver" || status === "Accepted") {
          str = {
            Title: "Almost there! Your order is now being prepared.",
            Message: `Estimated time until it’s ready: ${localStorage.getItem(
              "eta_text"
            )} mins`,
            progress: 40,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (
          status === "readyForPickup" ||
          status === "Ready for delivery"
        ) {
          str = {
            Title: "Almost there! Your order is now being prepared.",
            Message: `Estimated time until it’s ready: ${localStorage.getItem(
              "eta_text"
            )} mins`,
            progress: 50,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "foodPickedUp" || status === "Food Pickedup") {
          str = {
            Title: "Done! Your order is ready now.",
            Message: "",
            progress: 75,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "delivered") {
          str = {
            Title: "Thanks for choosing us.",
            Message: "",
            progress: 100,
          };
          localStorage.setItem("Spercentage", str.progress);
        }
      } else if (stTypes?.mod === "Scheduled") {
        //Delivery Schedule
        if (status == "placeOrder" || status === "Placed") {
          str = {
            Title: "That’s it, we've got your order!",
            Message:
              "Kick back and relax - we’ll let you know when the restaurant gets to it!",
            progress: 10,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status == "Seen" || status === "Seen") {
          str = {
            Title: "Super! A human being has seen your order.",
            Message: "You should get the final confirmation any minute now!",
            progress: 20,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "acceptScheduleOrder" || status === "Accepted") {
          str = {
            Title: "Super! A human being has seen your order.",
            Message: "You should get the final confirmation any minute now!",
            progress: 30,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "scheduleOrder_to_Outgoing") {
          str = {
            Title: "Your order was confirmed!",
            Message: `All good to go! Your order will be delivered on ${localStorage.getItem(
              "orderScheduledDate"
            )} at ${localStorage.getItem("eta_text")} min`,
            progress: 40,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "Rejected") {
          str = {
            Title: "Order Rejected",
            Message: `Your order was rejected by restaurant! `,
            progress: 100,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "acceptOrderByDriver" || status === "Accepted") {
          str = {
            Title: "Almost there! Your order is now being prepared.",
            Message: `Estimated time until it's ready: ${localStorage.getItem(
              "eta_text"
            )} mins`,
            progress: 50,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (
          status === "readyForPickup" ||
          status === "Ready for delivery"
        ) {
          str = {
            Title: "Done! Your order is ready and being delivered now.",
            Message: `Estimated time until it's ready: ${localStorage.getItem(
              "eta_text"
            )} mins`,
            progress: 75,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "foodPickedUp" || status === "Food Pickedup") {
          str = {
            Title: "Done! Your order is ready and being delivered now.",
            Message: `Estimated time until it’s ready: ${localStorage.getItem(
              "eta_text"
            )} mins`,
            progress: 85,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "delivered") {
          str = {
            Title: "Thanks for choosing us.",
            Message: "",
            progress: 100,
          };
          localStorage.setItem("Spercentage", str.progress);
        }
      }
    } else if (stTypes?.type == "Self-Pickup") {
      //Self-Pickup Standard
      if (stTypes?.mod == "Standard") {
        if (status === "placeOrder" || status === "Placed") {
          str = {
            Title: "That’s it, we've got your order!",
            Message:
              "Kick back and relax - we’ll let you know when the restaurant gets to it!",
            progress: 10,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "Seen" || status === "Seen") {
          str = {
            Title: "Super! A human being has seen your order.",
            Message: "You should get the final confirmation any minute now!",
            progress: 30,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "acceptOrder" || status === "Accepted") {
          str = {
            Title: "Your order was confirmed!",
            Message: `All good to go! Your order will be delivered on ${localStorage.getItem(
              "orderScheduledDate"
            )} at ${localStorage.getItem("eta_text")} min`,
            progress: 50,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "Rejected") {
          str = {
            Title: "Order Rejected",
            Message: `Your order was rejected by restaurant! `,
            progress: 100,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (
          status === "readyForPickup" ||
          status === "Ready for delivery"
        ) {
          str = {
            Title: "Done! Your order is ready now.",
            Message:
              "Please mention Fomino and your name to the staff. Feel free to skip the queue!",
            progress: 75,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "restaurantDelivered" || status === "delivered") {
          str = {
            Title: "Thanks for choosing us.",
            Message:
              "Please mention Fomino and your name to the staff. Feel free to skip the queue!",
            progress: 100,
          };
          localStorage.setItem("Spercentage", str.progress);
        }
      } else if (stTypes?.mod === "Scheduled") {
        //Self-Pickup Schedule
        if (status === "placeOrder" || status === "Placed") {
          str = {
            Title: "That’s it, we've got your order!",
            Message:
              "Kick back and relax - we’ll let you know when the restaurant gets to it!",
            progress: 10,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "Seen" || status === "Seen") {
          str = {
            Title: "Super! A human being has seen your order.",
            Message: "You should get the final confirmation any minute now!",
            progress: 30,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "acceptScheduleOrder" || status === "Accepted") {
          str = {
            Title: "Your order was confirmed!",
            Message: `All good to go! Your order will be delivered on ${localStorage.getItem(
              "orderScheduledDate"
            )} at ${localStorage.getItem("eta_text")} min`,
            progress: 50,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "Rejected") {
          str = {
            Title: "Order Rejected",
            Message: `Your order was rejected by restaurant! `,
            progress: 100,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "scheduleOrder_to_Outgoing") {
          str = {
            Title: "Almost there! Your order is now being prepared.",
            Message: `Estimated time until it's ready: ${localStorage.getItem(
              "eta_text"
            )} mins`,
            progress: 60,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (
          status === "readyForPickup" ||
          status === "Ready for delivery"
        ) {
          str = {
            Title: "Done! Your order is ready now.",
            Message:
              "Please mention Fomino and your name to the staff. Feel free to skip the queue!",
            progress: 75,
          };
          localStorage.setItem("Spercentage", str.progress);
        } else if (status === "restaurantDelivered" || status === "delivered") {
          str = {
            Title: "Thanks for choosing us.",
            Message: "",
            progress: 100,
          };
          localStorage.setItem("Spercentage", str.progress);
        }
      }
    }

    // ================
    // Normalize strings to handle variations in titles/messages
    const normalizeString = (str) =>
      str.trim().toLowerCase().replace(/[“”]/g, '"').replace(/’/g, "'");

    const newStatusEntry = {
      Title: str.Title,
      Message: str.Message,
      progress: str.progress,
    };
    const normalizedTitle = normalizeString(newStatusEntry.Title);
    const normalizedMessage = normalizeString(newStatusEntry.Message);

    // Retrieve and parse the status history from localStorage
    const rawHistory = localStorage.getItem("statusHistory");
    let existingHistory = rawHistory ? JSON.parse(rawHistory) : [];
    if (!Array.isArray(existingHistory)) existingHistory = [];

    // Check if the new status already exists in history
    const existsInHistory = existingHistory?.some(
      (item) =>
        normalizeString(item.Title) === normalizedTitle &&
        normalizeString(item.Message) === normalizedMessage
    );

    // Add the new status to history if it doesn't exist
    if (!existsInHistory) {
      existingHistory.push(newStatusEntry);
      localStorage.setItem("statusHistory", JSON.stringify(existingHistory));
    }

    // Update the state with the new status if it doesn't already exist
    setStatusString((prevStatus) => {
      const existsInState = prevStatus?.str?.some(
        (item) =>
          normalizeString(item.Title) === normalizedTitle &&
          normalizeString(item.Message) === normalizedMessage
      );

      if (!existsInState) {
        return {
          ...prevStatus,
          str: [...prevStatus.str, str],
          progress: str?.progress,
        };
      }
      return prevStatus;
    });
  };

  if (
    resData?.data?.data?.deliveryTime &&
    LS?.time &&
    !localStorage.getItem("eta_text")
  ) {
    localStorage.setItem(
      "eta_text",
      resData?.data?.data?.deliveryTime.slice(0, 2)
    );
    setLS({
      ...LS,
      time: false,
    });
  }

  const handleConnect = () => {
    console.log("Connected");
    const userId = localStorage.getItem("userId");
    if (userId) {
      const map = {
        userId: userId,
        type: "connected",
      };

      socket.emit("message", JSON.stringify(map), (ack) => {
        console.log("[DEBUG] Emit confirmation received:", ack);
      });
    }
  };

  // ========================
  let DeliveryStandard = [
    {
      title: "That’s it, we’ve got your order!",
      message:
        "Kick back and relax - we’ll let you know when the restaurant gets to it!",
    },
    {
      title: "Super! A human being has seen your order.",
      message: "You should get the final confirmation any minute now!",
    },
    {
      title: "Your order was confirmed!",
      message: `All good to go! Your order will be delivered on [orderScheduledDate] at [eta_text] min`,
    },
    {
      title: "Almost there! Your order is now being prepared.",
      message: `Estimated time until it’s ready: [eta_text] mins`,
    },
    {
      title: "Almost there! Your order is now being prepared.",
      message: `Estimated time until it’s ready: [eta_text] mins`,
    },
    { title: "Done! Your order is ready now.", message: "" },
    { title: "Thanks for choosing us.", message: "" },
  ];

  let DeliverySchedule = [
    {
      title: "That’s it, we’ve got your order!",
      message:
        "Kick back and relax - we’ll let you know when the restaurant gets to it!",
    },
    {
      title: "Super! A human being has seen your order.",
      message: "You should get the final confirmation any minute now!",
    },
    {
      title: "Your order was confirmed!",
      message: `All good to go! Your order will be delivered on [orderScheduledDate] at [eta_text] min`,
    },
    {
      title: "Almost there! Your order is now being prepared.",
      message: `Estimated time until it's ready: [eta_text] mins`,
    },
    {
      title: "Done! Your order is ready and being delivered now.",
      message: `Estimated time until it's ready: [eta_text] mins`,
    },
    {
      title: "Done! Your order is ready and being delivered now.",
      message: `Estimated time until it's ready: [eta_text] mins`,
    },
    { title: "Thanks for choosing us.", message: "" },
  ];

  let SelfPickupStandard = [
    {
      title: "That’s it, we’ve got your order!",
      message:
        "Kick back and relax - we’ll let you know when the restaurant gets to it!",
    },
    {
      title: "Super! A human being has seen your order.",
      message: "You should get the final confirmation any minute now!",
    },
    {
      title: "Your order was confirmed!",
      message: `All good to go! Your order will be delivered on [orderScheduledDate] at [eta_text] min`,
    },
    {
      title: "Done! Your order is ready now.",
      message:
        "Please mention Fomino and your name to the staff. Feel free to skip the queue!",
    },
    {
      title: "Thanks for choosing us.",
      message:
        "Please mention Fomino and your name to the staff. Feel free to skip the queue!",
    },
  ];

  let SelfPickupSchedule = [
    {
      title: "That’s it, we’ve got your order!",
      message:
        "Kick back and relax - we’ll let you know when the restaurant gets to it!",
    },
    {
      title: "Super! A human being has seen your order.",
      message: "You should get the final confirmation any minute now!",
    },
    {
      title: "Your order was confirmed!",
      message:
        "All good to go! Your order will be delivered on [orderScheduledDate] at [eta_text] min",
    },
    {
      title: "Almost there! Your order is now being prepared.",
      message: `Estimated time until it’s ready: ${localStorage.getItem(
        "eta_text"
      )} mins`,
    },
    {
      title: "Done! Your order is ready now.",
      message: `Please mention Fomino and your name to the staff. Feel free to skip the queue!`,
    },
    { title: "Thanks for choosing us.", message: "" },
  ];

  const selectedArray = (() => {
    if (!stTypes?.type || !stTypes?.mod) return [];

    if (stTypes.type === "Delivery" && stTypes.mod === "Standard")
      return DeliveryStandard;
    if (stTypes.type === "Delivery" && stTypes.mod === "Scheduled")
      return DeliverySchedule;
    if (stTypes.type === "Self-Pickup" && stTypes.mod === "Standard")
      return SelfPickupStandard;
    if (stTypes.type === "Self-Pickup" && stTypes.mod === "Scheduled")
      return SelfPickupSchedule;
    return [];
  })();

  const generateLink = () => {
    navigator.clipboard.writeText(
      `http://localhost:5173/tracking?id=${orderId}-${userId}`
    );
    mini_toaster("Copied to Clipboard!");
  };

  const orderAgain = () => {
    localStorage.setItem(
      "cartItems",
      JSON.stringify(data?.data?.orderAgain?.products)
    );
    navigate(
      `/${countryCode.toLowerCase()}/${city.toLowerCase()}/restaurants/${data?.data?.restaurantName.toLowerCase()}-res-${
        data?.data?.restaurantId
      }`
    );
  };

  const initializeMap = useCallback(
    (map) => {
      if (!map) return;

      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingControl: false,
      });

      drawingManager.setMap(map);

      if (polygonPaths?.length > 0) {
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

  //get driver location from firebase
  useEffect(() => {
    const subscribe = getDriverLocation((dr) => {
      if (dr) {
        setDriverLocations(dr[driverId]);
      }
    });

    return () => subscribe();
  }, [driverId]);

  // Recalculate route when driver location changes
  useEffect(() => {
    if (driverLocations && mapRef.current && isLoaded) {
      calculateRoute();
    }
  }, [driverLocations, isLoaded]);

  //handling popstate here
  let popstateListenerAttached = false;
  const handlePopState = () => {
    navigate("/", { replace: true });
  };

  if (!popstateListenerAttached) {
    window.addEventListener("popstate", handlePopState);
    popstateListenerAttached = true;
  }
  //popstate end here

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

  useEffect(() => {
    localStorage.removeItem("groupOrder");
    localStorage.removeItem("groupData");
    localStorage.removeItem("gLink");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("hasJoinedGroup");
    localStorage.removeItem("guestJoined");

    //connect / disconnect handle

    handleConnect();

    const handleDisconnect = (reason) => {
      console.log("Disconnected:", reason);
      reconnect();
    };

    const handleConnectError = (error) => {
      console.error("Connection Error:", error);
    };
    //connect / disconnect handle end

    socket.on("placeOrder", (data) => {
      let res = JSON.parse(data);
      foodDetailsRefetch();
      console.log(res, "socket placeOrder");
      localStorage.setItem("eta_text", res.data.estTime);
      if (!localStorage.getItem("statusHistory")) {
        localStorage.setItem("statusHistory", JSON.stringify([]));
        localStorage.setItem("Spercentage", 0);
      }
      statusText("placeOrder");
    });

    socket.on("addPreparingTimeForOrder", (data) => {
      let res = JSON.parse(data);
      foodDetailsRefetch();
      console.log(res, "socket addPreparingTimeForOrder");
    });

    socket.on("orderSeen", (data) => {
      let res = JSON.parse(data);
      foodDetailsRefetch();
      console.log(res, "socket orderSeen");
      localStorage.setItem(
        "orderScheduledDate",
        dayjs(res?.data?.scheduleDate).format("YYYY-MM-DD")
      );
      statusText("Seen");
    });

    socket.on("acceptOrder", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket acceptOrder");
      foodDetailsRefetch();
      localStorage.setItem("eta_text", res?.data?.eta_text);
      localStorage.setItem("eta_minutes", res?.data?.eta_text);
      statusText("acceptOrder");
    });

    socket.on("acceptScheduleOrder", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket acceptScheduleOrder");
      foodDetailsRefetch();
      localStorage.setItem("eta_text", res?.data?.eta_text);
      statusText("acceptScheduleOrder");
    });

    socket.on("scheduleOrder_to_Outgoing", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket scheduleOrder_to_Outgoing");
      foodDetailsRefetch();
      localStorage.setItem("eta_text", res?.data?.eta_text);
      statusText("scheduleOrder_to_Outgoing");
    });

    socket.on("groupOrder", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket groupOrder");
    });

    socket.on("acceptOrderByDriver", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket acceptOrderByDriver");
      statusText("acceptOrderByDriver");
      foodDetailsRefetch();
      localStorage.setItem("driverId", res?.driverId);
      localStorage.setItem("eta_text", res?.eta_text);
    });

    socket.on("foodPickedUp", (data) => {
      let res = JSON.parse(data);
      console.log(res, "foodPickedUp");
      foodDetailsRefetch();
      localStorage.setItem("eta_text", res?.eta_text);
      statusText("foodPickedUp");
      // getDriverTracking();
    });

    socket.on("delivered", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket delivered");
      foodDetailsRefetch();
      statusText("delivered");
      setStTypes({ ...stTypes, showCheck: true });
      setTimeout(() => {
        setModType("feedback");
        setInfoModal(true);
      }, 3000);
    });

    socket.on("restaurantDelivered", (data) => {
      let res = JSON.parse(data);
      foodDetailsRefetch();
      console.log(res, "socket restaurantDelivered");

      statusText("delivered");
      statusText("restaurantDelivered");
      setTimeLeft(0);
      setStTypes({ ...stTypes, showCheck: true });
      setTimeout(() => {
        setModType("restFeedback");
        setInfoModal(true);
      }, 3000);
    });

    socket.on("rejectOrder", (data) => {
      let res = JSON.parse(data);
      foodDetailsRefetch();
      console.log(res, "socket rejectOrder");
      statusText("Rejected");
    });

    socket.on("readyForPickup", (data) => {
      let res = JSON.parse(data);
      foodDetailsRefetch();
      console.log(res, "socket readyForPickup");
      if (res?.estTime) {
        localStorage.setItem("eta_text", res?.estTime);
      }
      statusText("readyForPickup");
    });

    socket.on("deleteGroup", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket deleteGroup");
      statusText("deleteGroup");
    });

    socket.on("removeMember", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket removeMember");
      statusText("removeMember");
    });

    socket.on("afterPaymentGroupOrder", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket afterPaymentGroupOrder");
      statusText("afterPaymentGroupOrder");
    });

    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    const navFromHistory = () => {
      const normalizedStatus = navHis?.trim()?.toLowerCase();
      console.log(normalizedStatus, "normalizedStatus");
      switch (normalizedStatus) {
        case "placed":
          statusText("Placed");
          break;
        case "seen":
          statusText("Seen");
          break;
        case "delivered":
          statusText("delivered");
          break;
        case "accepted":
          statusText("Accepted");
          break;
        case "preparing":
          statusText("Preparing");
          break;
        case "accepted by driver":
          statusText("acceptOrderByDriver");
          break;
        case "ready for delivery":
          statusText("readyForPickup");
          break;
        case "food pickedup":
          statusText("foodPickedUp");
          break;
        case "reject":
          statusText("Rejected");
          break;
        default:
          console.warn("Unknown status in navHis:", navHis);
      }
    };

    navFromHistory();

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("placeOrder");
      socket.off("acceptOrder");
    };
  }, [socket]);

  const containerStyle = {
    width: "100%",
    height: "360px",
  };
  useEffect(() => {
    const connect = JSON.parse(localStorage.getItem("connect"));

    if (connect === true && data?.data?.paymentMethod) {
      const paymentMethod = data.data.paymentMethod;
      console.log(paymentMethod, "paymentMethod");

      if (paymentMethod !== "COD") {
        orderAfterPayment();
      }

      afterPaymentGroupOrder();
      localStorage.setItem("connect", false);
    }
  }, [data]);

  if (data?.data?.orderMode?.name && data?.data?.deliveryType) {
    localStorage.setItem("mod", data?.data?.orderMode?.name);
    localStorage.setItem("type", data?.data?.deliveryType);
  }

  const selectFeedback = (num, type) => {
    if (type === "driver") {
      setStTypes({
        ...stTypes,
        driverSelEmoji: num,
      });
    } else if (type === "drivercmt") {
      if (num.includes("+")) {
        setStTypes({
          ...stTypes,
          innerMod: "custom comment",
          isCustom: true,
        });
      } else {
        setStTypes({
          ...stTypes,
          drivercmt: num,
        });
      }
    } else if (type === "driverTip") {
      setStTypes({
        ...stTypes,
        driverTip: num,
        showCount: false,
      });
    } else if (type === "resSelEmoji") {
      setStTypes({
        ...stTypes,
        innerMod: "comment",
        resSelEmoji: num,
      });
    } else if (type === "restaurantCmt") {
      setStTypes({
        ...stTypes,
        restaurantCmt: num,
      });
    } else if (type === "next1" && num == "0") {
      setStTypes({
        ...stTypes,
        innerMod: "comment",
      });
    }
  };

  //Feedback Submit

  const submitFeedback = async () => {
    if (!stTypes?.restaurantCmt) {
      info_toaster("Please add a comment");
      return;
    }

    let res = await PostAPI("users/addratingfeedback", {
      restaurantRate: stTypes.resSelEmoji,
      restaurantFeedBack: stTypes.restaurantCmt,
      driverRate: stTypes.driverSelEmoji || null,
      orderId: localStorage.getItem("orderId"),
      deliveryType: data?.data?.deliveryType || null,
      driverTip: stTypes.driverTip || null,
      driverFeedBack: stTypes.drivercmt || null,
    });
    if (res?.data?.status === "1") {
      toast.success(res?.data?.message);
      setInfoModal(false);
      localStorage.removeItem("driverId");
      localStorage.setItem("statusHistory", JSON.stringify([]));
      localStorage.setItem("Spercentage", 0);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      toast.error(res?.data?.message);
    }
  };

  const titles = [
    "We're sorry to hear that.",
    "We apologize for the bad experience.",
    "Thank you for your feedback.",
    "Glad to hear you enjoyed it!",
    "Fantastic to hear it went well!",
  ];

  const subtitles = [
    "What went wrong with your order?",
    "Please tell us more about what went wrong.",
    "What could have been better?",
    "What did you like?",
    "What did you especially enjoy?",
  ];

  const deliveryFeedbackTags = {
    2: [
      "Courier was Rude",
      "Late Delivery",
      "Items Damaged",
      "Delivery Took Too Long",
      "+ add a comment for Fomino",
    ],
    4: [
      "Delivery was Late",
      "Poor Professionalism",
      "Order Not Handled Well",
      "Miscommunication",
      "+ add a comment for Fomino",
    ],
    6: [
      "Delivery Delayed",
      "Courier Seemed Unorganized",
      "Order Accuracy Could Improve",
      "Better Communication",
      "+ add a comment for Fomino",
    ],
    8: [
      "On-Time Delivery",
      "Polite and Professional",
      "Handled Order Well",
      "Smooth Experience",
      "+ add a comment for Fomino",
    ],
    10: [
      "Courier Professionalism",
      "Estimate Accuracy",
      "Fast Delivery",
      "Well-Handled Order",
      "+ add a comment for Fomino",
    ],
  };

  const restaurantFeedbackTags = {
    2: [
      "Poor Taste",
      "Bad Packaging",
      "Food Was Cold",
      "Late Delivery",
      "+ add a comment for Fomino",
    ],
    4: [
      "Undercooked",
      "Poor Texture",
      "Unappetizing Smell",
      "Wrong Order",
      "+ add a comment for Fomino",
    ],
    6: [
      "Average Taste",
      "Boring Packaging",
      "Could Be Warmer",
      "Delivery Delays",
      "+ add a comment for Fomino",
    ],
    8: [
      "Tasty",
      "Well-Presented",
      "Perfect Temperature",
      "On-Time Delivery",
      "+ add a comment for Fomino",
    ],
    10: [
      "Appearance",
      "Texture",
      "Flavour",
      "Packaging",
      "+ add a comment for Fomino",
    ],
  };

  //Calculate Route to show direction

  const origin = {
    lat: parseFloat(activeResData?.lat),
    lng: parseFloat(activeResData?.lng),
  };

  const destination = {
    lat: parseFloat(localStorage.getItem("lat")),
    lng: parseFloat(localStorage.getItem("lng")),
  };

  const calculateRoute = () => {
    const directionsService = new window.google.maps.DirectionsService();
    const start = driverLocations || origin;

    directionsService.route(
      {
        origin: start,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);

          // Adjust bounds based on available locations
          const bounds = new window.google.maps.LatLngBounds();
          if (driverLocations) {
            bounds.extend(driverLocations);
            bounds.extend(destination);
          } else {
            bounds.extend(origin);
            bounds.extend(destination);
          }
          mapRef.current.fitBounds(bounds);
        } else {
          console.error(`Error fetching directions: ${result}`);
        }
      }
    );
  };

  const History = localStorage.getItem("statusHistory");
  let showHistory = JSON.parse(History);
  const lastEntry = showHistory[showHistory?.length - 1]?.Title || [];
  useEffect(() => {
    // foodDetailsRefetch();

    if (!navHis) {
      if (lastEntry.includes("Thanks for choosing us.")) {
        setVisible(true);
        setTimeout(() => {
          showHistory.push({ Title: "Thanks for choosing us" });
          localStorage.setItem("statusHistory", JSON.stringify(showHistory));

          setVisible(false);
        }, 2000);
      }
    }
  }, [lastEntry]);

  //Handle translation End here

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

  const handleModalScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    setModalScroll(scrollTop);
    setHeaderShadow(scrollTop > 100);
  };

  useEffect(() => {
    if (resData?.data?.data?.coordinates?.coordinates?.length) {
      const initialCoordinates =
        resData?.data?.data?.coordinates?.coordinates[0].map(([lat, lng]) => ({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        }));
      setPolygonPaths(initialCoordinates);
      if (initialCoordinates?.length > 0) {
        setCenter(initialCoordinates[0]);
      }
    }

    if (!resData?.data?.data) return;

    const { message: newMessage, configurationMessage: newConfigMessage } =
      getRestaurantStatus(resData?.data?.data);

    setMessage(newMessage);
    setConfigurationMessage(newConfigMessage);
  }, [resData?.data?.data]);

  // Ensure map is properly initialized when component mounts
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      // Trigger a resize event to ensure the map renders properly
      window.google.maps.event.trigger(mapRef.current, "resize");
    }
  }, [isLoaded]);

  // Ensure map is properly initialized when component is mounted
  useEffect(() => {
    if (isLoaded) {
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        if (mapRef.current) {
          window.google.maps.event.trigger(mapRef.current, "resize");
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Handle window resize to prevent gray map issue
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current && isLoaded) {
        window.google.maps.event.trigger(mapRef.current, "resize");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded]);

  // Handle visibility change to prevent gray map issue
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mapRef.current && isLoaded) {
        // Small delay to ensure the page is fully visible
        setTimeout(() => {
          window.google.maps.event.trigger(mapRef.current, "resize");
        }, 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isLoaded]);

  // Handle focus to prevent gray map issue
  useEffect(() => {
    const handleFocus = () => {
      if (mapRef.current && isLoaded) {
        // Small delay to ensure the page is fully focused
        setTimeout(() => {
          window.google.maps.event.trigger(mapRef.current, "resize");
        }, 100);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isLoaded]);

  const handleFeedback = () => {};

  const emojiRatings = [
    { value: 2, emoji: "😫", label: "Very Dissatisfied" },
    { value: 4, emoji: "☹️", label: "Dissatisfied" },
    { value: 6, emoji: "😑", label: "Neutral" },
    { value: 8, emoji: "😊", label: "Satisfied" },
    { value: 10, emoji: "😍", label: "Very Satisfied" },
  ];
  const selectedDriverValue = data?.data?.driverFeedBack?.value;
  const selectedRestaurantValue = data?.data?.restaurantFeedBack?.value;

  // Show loading state while Google Maps API is loading
  if (!isLoaded) {
    return <Loader />;
  }

  // Show error state if Google Maps API fails to load
  if (loadError) {
    return (
      <section className="relative">
        <Header home={true} />
        <div className="h-96 relative text-black hover:text-opacity-50 max-[500px]:h-[calc(100svh-210px)] md:pt-[70px] pt-14 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load map</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </section>
    );
  }

  return (
    <>
      {modType === "details" ? (
        <Modal
          onClose={() => {
            setInfoModal(false);
            setModalScroll(0);
          }}
          isOpen={infoModal}
          isCentered
          size="xl"
          className="modal-custom "
        >
          <ModalOverlay />
          <ModalContent
            borderRadius="20px"
            className=" modal-content-custom"
            maxW={["550px"]}
            overflow={"hidden"}
          >
            <ModalHeader
              p={0}
              boxShadow={
                modalScroll > 20 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none"
              }
              transition="all 0.3s ease"
              position="absolute"
              top={modalScroll > 20 ? "0" : "-4px"}
              left="0"
              right="0"
              backgroundColor="#fff"
              zIndex={10}
              opacity={modalScroll > 20 ? 1 : 0}
              visibility={modalScroll > 20 ? "visible" : "hidden"}
              height="70px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <h3
                className={`${
                  modalScroll > 20 ? "block" : "hidden"
                } text-base text-center capitalize my-5 font-sf font-medium text-theme-black-2`}
              >
                {resData?.data?.data?.name}
              </h3>
            </ModalHeader>
            <div
              onClick={() => {
                setInfoModal(false);
                setModalScroll(0);
              }}
              className="absolute z-20 top-5 right-6 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
            >
              <IoClose size={30} />
            </div>
            <ModalBody padding={0} borderRadius="20px" overflow={"hidden"}>
              <div
                onScroll={handleModalScroll}
                className="custom-scrollbar setScroll md:h-[calc(100vh-8vh)] largeDesktop:screen-minus-8vh ultraLargeDesktop:h-screen-minus-40vh h-screen-minus-18vh  overflow-auto font-sf space-y-5"
              >
                <div className="font-sf  rounded-t-[20px] ">
                  <div className="rounded-t-[20px] overflow-hidden">
                    <GoogleMap
                      zoom={9}
                      center={{
                        lat: parseFloat(resData?.data?.data?.lat),
                        lng: parseFloat(resData?.data?.data?.lng),
                      }}
                      mapContainerStyle={containerStyle}
                      onLoad={initializeMap}
                      options={{
                        mapTypeControl: false,
                        fullscreenControl: false,
                        streetViewControl: false,
                        zoomControl: true,
                      }}
                    >
                      {/* <MarkerF
                        position={{
                          lat: parseFloat(resData?.data?.data?.lat),
                          lng: parseFloat(resData?.data?.data?.lng),
                        }}
                      /> */}

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

                  <div className="px-4">
                    <h2 className="font-bold font-omnes text-[32px] text-theme-black-2 mt-3">
                      {resData?.data?.data?.name}
                    </h2>
                    <div className="flex items-center gap-x-2">
                      <div className="w-2 h-2 bg-[#cacacb] rounded-full"></div>
                      <p className="text-base text-theme-black-2 text-opacity-65">
                        {message}
                      </p>
                    </div>
                    <p className="font-sf text-lg font-normal text-theme-black-2  mt-8">
                      {resData?.data?.data?.description}
                    </p>
                    <h2 className="text-[28px] font-semibold text-theme-black-2 font-omnes mt-8">
                      Address
                    </h2>
                    <p className="font-sf font-base text-theme-black-2  mt-4 mb-2">
                      {resData?.data?.data?.location}
                    </p>
                    <p className="text-theme-green-2 font-sf text-sm font-medium mt-2">
                      See map
                    </p>
                    <div className="flex justify-between">
                      <h2 className="text-[28px] font-semibold text-theme-black-2 font-omnes mt-8 mb-4">
                        Opening times
                      </h2>
                    </div>
                    <div className="flex justify-between mt-3">
                      <ul className="space-y-1 w-full">
                        {resData?.data?.data?.times
                          ?.sort((a, b) => parseInt(a.day) - parseInt(b.day))
                          ?.map((time, index) => (
                            <li
                              className="text-base font-sf capitalize  font-normal text-theme-black-2"
                              key={index}
                            >
                              {time?.name}
                            </li>
                          ))}
                      </ul>
                      {infoModalTimings === "Restaurant" ? (
                        <ul className="space-y-1 w-full">
                          {resData?.data?.data?.times
                            ?.sort((a, b) => parseInt(a.day) - parseInt(b.day))
                            ?.map((time, index) => (
                              <li
                                className="text-base font-sf text-theme-black-2 text-opacity-65 text-end font-light"
                                key={index}
                              >
                                {time?.startAt} - {time?.endAt}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <ul className="space-y-1 w-full">
                          {resData?.data?.data?.times
                            ?.sort((a, b) => parseInt(a.day) - parseInt(b.day))
                            ?.map((time, index) => (
                              <li
                                className="text-base font-sf text-theme-black-2 text-opacity-65 text-end font-light"
                                key={index}
                              >
                                {time?.startAt} - {time?.endAt}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="px-4 m-auto pb-4">
                    <h4 className="text-2xl font-semibold text-theme-black-2 font-omnes mt-3">
                      {t("Contact info")}
                    </h4>
                    <p className="font-normal text-sm text-theme-black-2 text-opacity-60 mt-4">
                      If you have allergies or dietary restrictions, please
                      contact the restaurant for dish-specific information
                    </p>
                    <p className="mt-3 font-normal text-sm text-theme-black-2 font-sf">
                      The Partner is committed to only offering products and/or
                      services that comply with applicable laws.
                    </p>
                  </div>
                  <div className="flex items-center justify-between px-4 m-auto mt-3">
                    <div className="flex items-center gap-x-2">
                      <h4 className="text-theme-black-2 font-normal text-base">
                        {t("Restaurant")}
                      </h4>
                    </div>
                    <p className="text-theme-green-2 font-medium text-base">
                      {data?.data?.phoneNum}
                    </p>
                  </div>
                  <hr className="my-4" />
                  <div className="flex items-center justify-between px-4 m-auto">
                    <div className="flex items-center gap-x-2">
                      <h4 className="text-theme-black-2 font-normal text-base">
                        Website
                      </h4>
                    </div>
                    <p className="font-medium text-base">
                      <button className="text-theme-green-2">Open Site</button>
                    </p>
                  </div>
                  <hr className="my-4" />
                  <div className="flex items-center justify-between px-4 mb-4 m-auto">
                    <div className="flex items-center gap-x-2">
                      <h4 className="text-theme-black-2 font-normal text-base">
                        Fomino support
                      </h4>
                    </div>
                    <p className="font-medium text-base ">
                      <button className="text-theme-green-2">Open chat</button>
                    </p>
                  </div>

                  {/* <div className="flex items-center justify-between px-4 m-auto font-sf">
                    <div className="flex items-center gap-x-2">
                      <span>
                        <FaRegSmile />
                      </span>
                      <h4 className="text-base font-normal text-black text-opacity-60">
                        {t("Ratings")}
                      </h4>
                    </div>
                    <p className="text-base font-normal text-black">
                      {parseFloat(resData?.data?.data?.rating).toFixed(2)}
                    </p>
                  </div>
                  <hr className="my-4" />
                  <div className="flex items-center justify-between px-4 m-auto">
                    <div className="flex items-center gap-x-2">
                      <span>
                        <IoLocationOutline />
                      </span>
                      <h4 className="text-black text-opacity-60">
                        {t("Location")}
                      </h4>
                    </div>
                    <p>{resData?.data?.data?.location}</p>
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
                    <p>{resData?.data?.data?.deliveryTime}</p>
                  </div>
                  <hr className="my-4" />
                  <div className="flex items-center justify-between px-4 m-auto">
                    <div className="flex items-center gap-x-2">
                      <span>
                        <IoMdTime />
                      </span>
                      <h4 className="text-black text-opacity-60">
                        {t("Opening hours")}
                      </h4>
                    </div>
                    <p>{resData?.data?.data?.timings}</p>
                  </div>
                  <hr className="my-4" />
                  <div className="px-4 m-auto pb-4">
                    <h4 className="font-omnes font-bold text-[30px] mb-2">
                      {t("Contact info")}
                    </h4>
                    <p className="font-normal text-sm text-theme-black-2 text-opacity-60">
                      If you have allergies or dietary restrictions, please{" "}
                      <br />
                      contact the restaurant for dish-specific information.
                    </p>
                  </div>
                  <div className="flex items-center justify-between px-4 m-auto">
                    <div className="flex items-center gap-x-2">
                      <h4 className="text-black text-opacity-60">
                        {t("Restaurant contact")}
                      </h4>
                    </div>
                    <p className="text-[#E13743] font-bold text-base">
                      {resData?.data?.data?.businessEmail}
                    </p>
                  </div>
                  <hr className="my-4" />
                  <div className="flex items-center justify-between px-4 m-auto">
                    <div className="flex items-center gap-x-2">
                      <h4 className="text-black text-opacity-60">Email</h4>
                    </div>
                    <p className="text-[#E13743] font-bold text-base">
                      {resData?.data?.data?.businessEmail}
                    </p>
                  </div>
                  <hr className="my-4" /> */}
                </div>
              </div>
            </ModalBody>
            <ModalFooter></ModalFooter>
          </ModalContent>
        </Modal>
      ) : modType === "feedback" ? (
        <Modal
          onClose={() => {
            setInfoModal(false);
          }}
          isOpen={infoModal}
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
            <div className="flex justify-between">
              {stTypes.innerMod === "comment" ? (
                <IoIosArrowRoundBack
                  className="ml-3 mt-2 text-3xl rounded-full bg-[#F4F5FA] hover:bg-[#e5e5e5] focus:outline-none focus:shadow-none text-black p-1 w-[40px] h-[40px] text-[14px] absolute left-[5px] top-[8px] z-10 cursor-pointer duration-100"
                  onClick={() => {
                    setStTypes({
                      ...stTypes,
                      innerMod: "emoji",
                    });
                  }}
                />
              ) : stTypes.innerMod === "custom comment" ? (
                <IoIosArrowRoundBack
                  className="ml-3 mt-2 text-3xl rounded-full bg-[#F4F5FA] hover:bg-[#e5e5e5] focus:outline-none focus:shadow-none text-black p-1 w-[40px] h-[40px] text-[14px] absolute left-[5px] top-[8px] z-10 cursor-pointer duration-100"
                  onClick={() => {
                    setStTypes({
                      ...stTypes,
                      innerMod: "emoji",
                    });
                  }}
                />
              ) : (
                ""
              )}
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
            </div>

            <ModalBody padding={0}>
              <div className="font-sf  ultraLargeDesktop:h-auto largeDesktop:h-auto md:h-screen-minus-30vh h-screen-minus-12vh overflow-auto space-y-2 pt-16">
                <div className="flex justify-center items-center gap-x-2 py-4 [&>div]:rounded-full">
                  <div className="w-20 h-20  relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-500">
                      <img
                        className="w-full h-full object-cover"
                        src={`${
                          data?.data?.driverDetails?.image
                            ? BASE_URL + data?.data?.driverDetails?.image
                            : "/images/userIcon.jpeg"
                        }`}
                        alt="image"
                      />
                    </div>
                    <span className="absolute bottom-0 right-[-5px] text-2xl z-20">
                      {stTypes.driverSelEmoji == "2"
                        ? "😫"
                        : stTypes.driverSelEmoji == "4"
                        ? "☹️"
                        : stTypes.driverSelEmoji == "6"
                        ? "😑"
                        : stTypes.driverSelEmoji == "8"
                        ? "😊"
                        : stTypes.driverSelEmoji == "10"
                        ? "😍"
                        : ""}
                    </span>
                  </div>
                  <div className="w-16 h-16 overflow-hidden border-2 border-red-500">
                    <img
                      className="w-full h-full object-cover"
                      src={`${
                        data?.data?.restaurantPhoto
                          ? BASE_URL + data?.data?.restaurantPhoto
                          : "/images/userIcon.jpeg"
                      }`}
                      alt="image"
                    />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-3xl font-bold font-omnes text-theme-black-2">
                    {stTypes.innerMod === "emoji"
                      ? "How was the delivery?"
                      : stTypes.driverSelEmoji === 2
                      ? titles[0]
                      : stTypes.driverSelEmoji === 4
                      ? titles[1]
                      : stTypes.driverSelEmoji === 6
                      ? titles[2]
                      : stTypes.driverSelEmoji === 8
                      ? titles[3]
                      : stTypes.driverSelEmoji === 10
                      ? titles[4]
                      : ""}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {stTypes.innerMod === "emoji"
                      ? "Your feedback help us improve our delivery"
                      : stTypes.driverSelEmoji === 2
                      ? subtitles[0]
                      : stTypes.driverSelEmoji === 4
                      ? subtitles[1]
                      : stTypes.driverSelEmoji === 6
                      ? subtitles[2]
                      : stTypes.driverSelEmoji === 8
                      ? subtitles[3]
                      : stTypes.driverSelEmoji === 10
                      ? subtitles[4]
                      : ""}
                  </p>
                </div>
                {stTypes.innerMod === "emoji" ? (
                  <div className="px-10 py-5 place-items-center grid grid-cols-5 gap-x-2 [&>div]:cursor-pointer [&>div]:text-center [&>div>h4]:text-3xl">
                    <div onClick={() => selectFeedback(2, "driver")}>
                      <h4>😫</h4>
                      <p
                        className={
                          stTypes.driverSelEmoji == 2 ? "text-red-500" : ""
                        }
                      >
                        Horrible
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        selectFeedback(4, "driver");
                      }}
                    >
                      <h4>☹️</h4>
                      <p
                        className={
                          stTypes.driverSelEmoji == 4 ? "text-red-500" : ""
                        }
                      >
                        Bad
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        selectFeedback(6, "driver");
                      }}
                    >
                      <h4>😑</h4>
                      <p
                        className={
                          stTypes.driverSelEmoji == 6 ? "text-red-500" : ""
                        }
                      >
                        Okay
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        selectFeedback(8, "driver");
                      }}
                    >
                      <h4>😊</h4>
                      <p
                        className={
                          stTypes.driverSelEmoji == 8 ? "text-red-500" : ""
                        }
                      >
                        Good
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        selectFeedback(10, "driver");
                      }}
                    >
                      <h4>😍</h4>
                      <p
                        className={
                          stTypes.driverSelEmoji == 10 ? "text-red-500" : ""
                        }
                      >
                        Satisfied
                      </p>
                    </div>
                  </div>
                ) : stTypes.innerMod === "comment" ? (
                  <div className="flex flex-col items-center px-5">
                    <div className="flex flex-wrap justify-center gap-2 my-10">
                      {(deliveryFeedbackTags[stTypes.driverSelEmoji] || []).map(
                        (item, idx) => {
                          return (
                            <p
                              onClick={() => {
                                selectFeedback(item, "drivercmt");
                              }}
                              className={`${
                                stTypes.drivercmt == item
                                  ? "bg-red-500 text-white"
                                  : "text-red-500"
                              } bg-red-100 text-red-500 text-sm px-4 py-1 rounded-full cursor-pointer`}
                              key={idx}
                            >
                              {item}
                            </p>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : stTypes.innerMod === "custom comment" ? (
                  <div>
                    <div className="flex flex-wrap justify-center gap-2 my-10 px-5">
                      {(deliveryFeedbackTags[stTypes.driverSelEmoji] || []).map(
                        (item, idx) => {
                          return (
                            <p
                              onClick={() => {
                                selectFeedback(item, "drivercmt");

                                if (!item.includes("+")) {
                                  setStTypes({
                                    ...stTypes,
                                    isCustom: false,
                                    innerMod: "comment",
                                    drivercmt: item,
                                  });
                                }
                              }}
                              className={`${
                                (
                                  stTypes.isCustom
                                    ? item.includes("+")
                                    : stTypes.drivercmt == item
                                )
                                  ? "bg-red-500 text-white"
                                  : "text-red-500"
                              } bg-red-100 text-red-500 text-sm px-4 py-1 rounded-full cursor-pointer`}
                              key={idx}
                            >
                              {item}
                            </p>
                          );
                        }
                      )}
                    </div>
                    {stTypes.isCustom && (
                      <div className="mx-5">
                        <p className="font-semibold">Add a comment.</p>
                        <div>
                          <textarea
                            className="outline-none border border-gray-300 rounded-lg w-full resize-none my-4 p-2 h-28 relative"
                            placeholder="Write your message... "
                            name=""
                            id=""
                            onChange={(e) => {
                              selectFeedback(e.target.value, "drivercmt");
                            }}
                          ></textarea>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  ""
                )}

                <hr />
                <div className="px-5 space-y-8">
                  <div className="flex justify-between pt-2 font-medium">
                    <p>Courier Tip:</p>
                    <button
                      onClick={() => setModType("tip")}
                      className="bg-green-100 rounded-md text-green-600 text-sm px-2 py-1"
                    >
                      {stTypes.driverTip
                        ? "Tip:" +
                          " " +
                          stTypes.driverTip +
                          " " +
                          data?.data?.currency
                        : "Add tip"}
                    </button>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter
              px={4}
              sx={{
                "@media screen and (max-width: 500px)": {
                  position: "sticky", // Keeps footer in view at the bottom
                  bottom: 0,
                  backgroundColor: "white", // Match background to modal content
                  width: "100%",
                  paddingBottom: "1rem",
                },
              }}
            >
              {stTypes.innerMod == "emoji" ? (
                <button
                  className="bg-red-500 text-white w-full rounded-md font-bold font-sf h-[54px]"
                  onClick={() => {
                    if (!stTypes?.driverSelEmoji) {
                      info_toaster("Please select emoji");
                      return;
                    }
                    selectFeedback(0, "next1");
                  }}
                >
                  Next
                </button>
              ) : stTypes.innerMod == "comment" ? (
                <button
                  className="bg-red-500 font-sf text-white w-full rounded-md font-bold h-[54px]"
                  onClick={() => {
                    if (!stTypes?.drivercmt) {
                      info_toaster("Please add a comment");
                      return;
                    }
                    setModType("restFeedback");
                  }}
                >
                  Next
                </button>
              ) : stTypes.innerMod == "custom comment" ? (
                <button
                  className="bg-red-500 text-white w-full rounded-md font-bold font-sf h-[54px]"
                  onClick={() => {
                    if (!stTypes?.drivercmt) {
                      info_toaster("Please add a comment");
                      return;
                    }
                    setModType("restFeedback");
                  }}
                >
                  Next
                </button>
              ) : (
                ""
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : modType === "tip" ? (
        <Modal
          onClose={() => {
            setInfoModal(false);
          }}
          isOpen={infoModal}
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
            <div className="flex justify-between">
              <IoIosArrowRoundBack
                className="ml-3 mt-2 text-3xl rounded-full bg-[#F4F5FA] hover:bg-[#e5e5e5] focus:outline-none focus:shadow-none text-black p-1 w-[40px] h-[40px] text-[14px] absolute left-[5px] top-[8px] z-10 cursor-pointer duration-100"
                onClick={() => {
                  setModType("feedback");
                }}
              />
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
            </div>

            <ModalBody padding={0}>
              <div className="w-full px-5 font-sf h-[calc(100vh-200px)] overflow-auto py-16">
                <div className="">
                  <img className="mx-auto" src="/images/fox.png" alt="" />
                </div>
                <div>
                  <h4 className="font-bold text-2xl my-2 font-omnes text-theme-black-2">
                    Tip the courier
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Your tip will be paid the courier together with their
                    salary. Fomino doesn't deduct anything from the tip.{" "}
                  </p>
                </div>
                <div className="grid grid-cols-6 gap-x-2 my-5 [&>p]:py-1 [&>p]:px-2 [&>p]:text-sm [&>p]:border-2 [&>p]:rounded-full [&>p]:border-gray-300 [&>p]:text-center [&>p]:cursor-pointer">
                  <p
                    onClick={() => {
                      selectFeedback(1, "driverTip");
                    }}
                    className={
                      !stTypes.showCount && stTypes.driverTip == "1"
                        ? "  border-2 !border-green-500"
                        : ""
                    }
                  >
                    {data?.data?.currency} 1
                  </p>
                  <p
                    onClick={() => {
                      selectFeedback(2, "driverTip");
                    }}
                    className={
                      !stTypes.showCount && stTypes.driverTip == "2"
                        ? "  border-2 !border-green-500"
                        : ""
                    }
                  >
                    {data?.data?.currency} 2
                  </p>
                  <p
                    onClick={() => {
                      selectFeedback(3, "driverTip");
                    }}
                    className={
                      !stTypes.showCount && stTypes.driverTip == "3"
                        ? "  border-2 !border-green-500"
                        : ""
                    }
                  >
                    {data?.data?.currency} 3
                  </p>
                  <p
                    onClick={() => {
                      selectFeedback(4, "driverTip");
                    }}
                    className={
                      !stTypes.showCount && stTypes.driverTip == "4"
                        ? "  border-2 !border-green-500"
                        : ""
                    }
                  >
                    {data?.data?.currency} 4
                  </p>
                  <p
                    onClick={() => {
                      selectFeedback(5, "driverTip");
                    }}
                    className={
                      !stTypes.showCount && stTypes.driverTip == "5"
                        ? "  border-2 !border-green-500"
                        : ""
                    }
                  >
                    {data?.data?.currency} 5
                  </p>
                  <p
                    className={
                      stTypes.showCount && "border-2 !border-green-500"
                    }
                    onClick={() => {
                      setStTypes((prev) => ({
                        ...prev,
                        showCount: !prev.showCount,
                      }));
                    }}
                  >
                    other
                  </p>
                </div>
                {stTypes.showCount && (
                  <div className="border-2 border-green-500 rounded-lg w-full py-2 flex justify-between items-center h-[54px] px-2">
                    <CiCircleMinus
                      className="text-2xl text-green-500 cursor-pointer"
                      onClick={() =>
                        setStTypes((prevState) => ({
                          ...prevState,
                          driverTip: Math.max(prevState.driverTip - 1, 0),
                        }))
                      }
                    />
                    <input
                      type="text"
                      className="text-center outline-none"
                      onChange={(e) => {
                        setStTypes((prevState) => ({
                          ...prevState,
                          driverTip: e.target.value,
                        }));
                      }}
                      value={stTypes.driverTip}
                    />
                    <CiCirclePlus
                      className="text-2xl text-green-500 cursor-pointer"
                      onClick={() =>
                        setStTypes((prevState) => ({
                          ...prevState,
                          driverTip: Math.max(prevState.driverTip + 1, 0),
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter
              px={4}
              sx={{
                "@media screen and (max-width: 500px)": {
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: "white",
                  width: "100%",
                  paddingBottom: "1rem",
                },
              }}
            >
              <button
                className=" bg-red-500 text-white w-full cursor-pointer rounded-md font-bold font-sf h-[54px]"
                onClick={() => setModType("feedback")}
              >
                Next
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : modType === "restFeedback" ? (
        <Modal
          onClose={() => {
            setInfoModal(false);
          }}
          isOpen={infoModal}
          isCentered
          size="lg"
          motionPreset="slideInBottom"
          closeOnOverlayClick={false}
        >
          <ModalOverlay />
          <ModalContent
            borderRadius={"20px"}
            overflow={"hidden"}
            className=" modal-content-custom"
            sx={{
              "@media screen and (max-width: 500px)": {
                borderRadius: "20px",
                borderBottomRadius: 0,
                mb: 0,
                height: "calc(100vh - 18vh)",
              },
            }}
          >
            <div className="flex justify-between">
              {stTypes.innerMod === "comment" || modType == "restFeedback" ? (
                <IoIosArrowRoundBack
                  className="ml-3 mt-2 text-3xl rounded-full bg-[#F4F5FA] hover:bg-[#e5e5e5] focus:outline-none focus:shadow-none text-black p-1 w-[40px] h-[40px] text-[14px] absolute left-[5px] top-[8px] z-10 cursor-pointer duration-100"
                  onClick={() => {
                    setModType("feedback");
                    setStTypes({
                      ...stTypes,
                      innerMod: "comment",
                    });
                  }}
                />
              ) : (
                ""
              )}
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
            </div>
            <ModalHeader className="text-center font-switzer"></ModalHeader>

            <ModalBody padding={0}>
              <div className="font-sf h-[calc(100vh-200px)] overflow-auto space-y-2 mx-4 pt-16">
                <div className="flex justify-center items-center gap-x-2 py-4 [&>div]:rounded-full">
                  <div className="w-20 h-20 relative ">
                    <div className="w-20 h-20 border-2 border-red-500 rounded-full overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        src={`${
                          data?.data?.restaurantPhoto
                            ? BASE_URL + data?.data?.restaurantPhoto
                            : "/images/userIcon.jpeg"
                        }`}
                        alt=""
                      />
                    </div>

                    <span className="absolute bottom-0 right-[-5px] text-2xl">
                      {stTypes.resSelEmoji == "2"
                        ? "😫"
                        : stTypes.resSelEmoji == "4"
                        ? "☹️"
                        : stTypes.resSelEmoji == "6"
                        ? " 😑"
                        : stTypes.resSelEmoji == "8"
                        ? "😊"
                        : stTypes.resSelEmoji == "10"
                        ? "  😍"
                        : ""}
                    </span>
                  </div>
                  <div className="w-16 h-16 relative">
                    <div className="w-16 h-16 rounded-full relative overflow-hidden border-2 border-red-500">
                      <img
                        className="w-full h-full object-cover"
                        src={`${
                          data?.data?.driverDetails?.image
                            ? BASE_URL + data?.data?.driverDetails?.image
                            : "/images/userIcon.jpeg"
                        }`}
                        alt=""
                      />
                    </div>

                    <span className="absolute bottom-0 right-[-9px] text-2xl">
                      {stTypes.driverSelEmoji == "2"
                        ? "😫"
                        : stTypes.driverSelEmoji == "4"
                        ? "☹️"
                        : stTypes.driverSelEmoji == "6"
                        ? " 😑"
                        : stTypes.driverSelEmoji == "8"
                        ? "😊"
                        : stTypes.driverSelEmoji == "10"
                        ? "  😍"
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-3xl font-bold font-omnes text-theme-black-2">
                    How was the Food?
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Your feedback help us restaurant partners improve their
                    offering
                  </p>
                </div>

                <div className="px-10 py-5 place-items-center grid grid-cols-5 gap-x-2 [&>div]:cursor-pointer [&>div]:text-center [&>div>h4]:text-3xl">
                  <div onClick={() => selectFeedback(2, "resSelEmoji")}>
                    <h4>😫</h4>
                    <p
                      className={stTypes.resSelEmoji == 2 ? "text-red-500" : ""}
                    >
                      Horrible
                    </p>
                  </div>
                  <div onClick={() => selectFeedback(4, "resSelEmoji")}>
                    <h4>☹️</h4>
                    <p
                      className={stTypes.resSelEmoji == 4 ? "text-red-500" : ""}
                    >
                      Bad
                    </p>
                  </div>
                  <div onClick={() => selectFeedback(6, "resSelEmoji")}>
                    <h4>😑</h4>
                    <p
                      className={stTypes.resSelEmoji == 6 ? "text-red-500" : ""}
                    >
                      Okay
                    </p>
                  </div>
                  <div onClick={() => selectFeedback(8, "resSelEmoji")}>
                    <h4>😊</h4>
                    <p
                      className={stTypes.resSelEmoji == 8 ? "text-red-500" : ""}
                    >
                      Good
                    </p>
                  </div>
                  <div onClick={() => selectFeedback(10, "resSelEmoji")}>
                    <h4>😍</h4>
                    <p
                      className={
                        stTypes.resSelEmoji == 10 ? "text-red-500" : ""
                      }
                    >
                      Satisfied
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter
              px={4}
              sx={{
                "@media screen and (max-width: 500px)": {
                  position: "sticky", // Keeps footer in view at the bottom
                  bottom: 0,
                  backgroundColor: "white", // Match background to modal content
                  width: "100%",
                  paddingBottom: "1rem",
                },
              }}
            >
              <button
                className="bg-red-500 w-full text-white rounded-md font-bold font-sf h-[54px]"
                onClick={() => {
                  if (!stTypes?.resSelEmoji) {
                    info_toaster("Please select an emoji");
                    return;
                  }
                  setModType("review");
                }}
              >
                Next
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : modType === "review" ? (
        <Modal
          onClose={() => {
            setInfoModal(false);
          }}
          isOpen={infoModal}
          isCentered
          size="lg"
          motionPreset="slideInBottom"
        >
          <ModalOverlay />
          <ModalContent
            borderRadius={"20px"}
            overflow={"hidden"}
            className=" modal-content-custom"
            sx={{
              "@media screen and (max-width: 500px)": {
                borderRadius: "20px",
                borderBottomRadius: 0,
                mb: 0,
                height: "calc(100vh - 18vh)",
              },
            }}
          >
            <div className="flex justify-between">
              {stTypes.innerMod === "comment" ? (
                <IoIosArrowRoundBack
                  className="ml-3 mt-2 text-3xl rounded-full bg-[#F4F5FA] hover:bg-[#e5e5e5] focus:outline-none focus:shadow-none text-black p-1 w-[40px] h-[40px] text-[14px] absolute left-[5px] top-[8px] z-10 cursor-pointer duration-100"
                  onClick={() => {
                    setModType("restFeedback");
                    setStTypes({
                      ...stTypes,
                      innerMod: "comment",
                    });
                  }}
                />
              ) : stTypes.innerMod === "rest comment" ? (
                <IoIosArrowRoundBack
                  className="ml-3 mt-2 text-3xl rounded-full bg-[#F4F5FA] hover:bg-[#e5e5e5] focus:outline-none focus:shadow-none text-black p-1 w-[40px] h-[40px] text-[14px] absolute left-[5px] top-[8px] z-10 cursor-pointer duration-100"
                  onClick={() => {
                    setModType("restFeedback");
                    setStTypes({
                      ...stTypes,
                      innerMod: "emoji",
                    });
                  }}
                />
              ) : (
                ""
              )}
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
            </div>

            <ModalBody padding={0}>
              <div className="font-sf h-[calc(100vh-200px)] overflow-auto space-y-2 px-5 pt-16">
                <div className="flex justify-center items-center gap-x-2 py-4 [&>div]:rounded-full">
                  <div className="w-20 h-20 relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-500">
                      <img
                        className="w-full h-full object-cover"
                        src={`${
                          data?.data?.restaurantPhoto
                            ? BASE_URL + data?.data?.restaurantPhoto
                            : "/images/userIcon.jpeg"
                        }`}
                        alt=""
                      />
                    </div>

                    <span className="absolute bottom-0 right-[-5px] text-2xl">
                      {stTypes.resSelEmoji == "2"
                        ? "😫"
                        : stTypes.resSelEmoji == "4"
                        ? "☹️"
                        : stTypes.resSelEmoji == "6"
                        ? " 😑"
                        : stTypes.resSelEmoji == "8"
                        ? "😊"
                        : stTypes.resSelEmoji == "10"
                        ? "  😍"
                        : ""}
                    </span>
                  </div>
                  <div className="w-16 h-16 relative">
                    <div className="w-16 h-16 rounded-full relative overflow-hidden border-2 border-red-500">
                      <img
                        className="w-full h-full object-cover"
                        src={`${
                          data?.data?.driverDetails?.image
                            ? BASE_URL + data?.data?.driverDetails?.image
                            : "/images/userIcon.jpeg"
                        }`}
                        alt=""
                      />
                    </div>

                    <span className="absolute bottom-0 right-[-9px] text-2xl">
                      {stTypes.driverSelEmoji == "2"
                        ? "😫"
                        : stTypes.driverSelEmoji == "4"
                        ? "☹️"
                        : stTypes.driverSelEmoji == "6"
                        ? " 😑"
                        : stTypes.driverSelEmoji == "8"
                        ? "😊"
                        : stTypes.driverSelEmoji == "10"
                        ? "  😍"
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-3xl font-bold font-omnes text-theme-black-2">
                    {stTypes.innerMod === "emoji"
                      ? "How was the Food?"
                      : stTypes.resSelEmoji === 2
                      ? titles[0]
                      : stTypes.resSelEmoji === 4
                      ? titles[1]
                      : stTypes.resSelEmoji === 6
                      ? titles[2]
                      : stTypes.resSelEmoji === 8
                      ? titles[3]
                      : stTypes.resSelEmoji === 10
                      ? titles[4]
                      : ""}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {stTypes.innerMod === "emoji"
                      ? "Your feedback help us restaurant partners improve their offering"
                      : stTypes.resSelEmoji === 2
                      ? subtitles[0]
                      : stTypes.resSelEmoji === 4
                      ? subtitles[1]
                      : stTypes.resSelEmoji === 6
                      ? subtitles[2]
                      : stTypes.resSelEmoji === 8
                      ? subtitles[3]
                      : stTypes.resSelEmoji === 10
                      ? subtitles[4]
                      : ""}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex flex-col items-center px-5">
                    <div className="flex flex-wrap justify-center gap-2 my-10 [&>p]:text-sm [&>p]:px-4 [&>p]:py-1">
                      {(restaurantFeedbackTags[stTypes.resSelEmoji] || []).map(
                        (item, idx) => {
                          return (
                            <p
                              onClick={() => {
                                if (item?.includes("+")) {
                                  setStTypes({
                                    ...stTypes,
                                    innerMod: "rest comment",
                                    restaurantCmt: "",
                                  });
                                } else {
                                  setStTypes({
                                    ...stTypes,
                                    innerMod: "comment",
                                    restaurantCmt: item,
                                  });
                                }
                              }}
                              className={`${
                                (
                                  stTypes.innerMod === "rest comment"
                                    ? item.includes("+")
                                    : stTypes.restaurantCmt == item
                                )
                                  ? "bg-red-500 text-white"
                                  : "text-red-500"
                              } bg-red-100 text-red-500 rounded-full cursor-pointer`}
                              key={idx}
                            >
                              {item}
                            </p>
                          );
                        }
                      )}
                    </div>
                  </div>
                  {stTypes.innerMod === "rest comment" ? (
                    <div className="w-full">
                      <p className="font-semibold">Add a comment.</p>
                      <textarea
                        className="outline-none border-2 border-gray-300 rounded-lg w-full resize-none my-4 p-2 h-28"
                        placeholder="Write your message... "
                        name=""
                        id=""
                        onChange={(e) => {
                          selectFeedback(e.target.value, "restaurantCmt");
                        }}
                      ></textarea>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter
              px={4}
              sx={{
                "@media screen and (max-width: 500px)": {
                  position: "sticky", // Keeps footer in view at the bottom
                  bottom: 0,
                  backgroundColor: "white", // Match background to modal content
                  width: "100%",
                  paddingBottom: "1rem",
                },
              }}
            >
              <button
                className="bg-red-500 w-full text-white rounded-md font-bold font-sf h-[54px]"
                onClick={submitFeedback}
              >
                Submit Review
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : (
        ""
      )}
      {/* =======Modal End Here======== */}
      <section className="relative ">
        <Header home={true} />
        <div className="h-96 relative text-black hover:text-opacity-50 max-[500px]:h-[calc(100svh-210px)] md:pt-[70px] pt-14 bg-gray-100">
          <GoogleMap
            key={driverLocations?.id}
            zoom={10}
            center={
              driverId
                ? { lat: driverLocations?.lat, lng: driverLocations?.lng }
                : {
                    lat: (origin.lat + destination.lat) / 2,
                    lng: (origin.lng + destination.lng) / 2,
                  }
            }
            mapContainerStyle={{
              width: "100%",
              height: "100%",
            }}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            }}
            onLoad={(map) => {
              mapRef.current = map;
              // Add a small delay to ensure the map is fully initialized
              setTimeout(() => {
                calculateRoute();
              }, 100);
            }}
          >
            {driverLocations ? (
              <MarkerF
                position={{
                  lat: driverLocations?.lat,
                  lng: driverLocations?.lng,
                }}
                icon={{
                  url: "/images/driver/driver.png",
                  scaledSize: new window.google.maps.Size(45, 50),
                }}
              />
            ) : (
              <MarkerF
                position={origin}
                icon={{
                  url: "/images/restaurants/restaurant.png",
                  scaledSize: new window.google.maps.Size(45, 50),
                }}
              />
            )}

            <MarkerF
              position={destination}
              icon={{
                url: "/images/restaurants/home.png",
                scaledSize: new window.google.maps.Size(45, 50),
              }}
            />
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#09820f",
                    strokeWeight: 5,
                  },
                }}
              />
            )}
          </GoogleMap>

          <div className="max-[500px]:hidden absolute z-10 bottom-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </div>

        {/* screen for only Small devices */}

        <div className="bg-[#262626] w-full h-[260px] rounded-t-[35px] relative top-[-50px] hidden max-[500px]:block ">
          <div className="absolute top-[-50px] left-[50%] translate-x-[-50%] w-[100px] h-[100px] bg-[#262626] rounded-fullest">
            {localStorage.getItem("eta_text") ? (
              <CircularProgress
                value={showHistory[showHistory?.length - 1]?.progress}
                size={"100px"}
                color={
                  data?.data?.OrderStatus?.includes("Reject")
                    ? "red"
                    : data?.data?.orderMode?.name === "Scheduled"
                    ? "orange"
                    : "green"
                }
              >
                <CircularProgressLabel>
                  {lastEntry?.includes("Thanks for choosing us.") ? (
                    <FaCheck
                      className={`mx-auto ${
                        data?.data?.orderMode?.name === "Scheduled"
                          ? "text-orange-500"
                          : "text-green-700 "
                      } text-5xl`}
                    />
                  ) : data?.data?.OrderStatus?.includes("Reject") ? (
                    <div className="w-full flex flex-col items-center justify-center bg-green">
                      <IoIosClose className="text-red-500 text-6xl" />
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {localStorage.getItem("eta_text")
                          ? localStorage.getItem("eta_text")
                          : 0}
                      </p>
                      <p className="font-medium text-sm text-white">Min</p>
                    </div>
                  )}
                </CircularProgressLabel>
              </CircularProgress>
            ) : (
              <RotatingLoader />
            )}
          </div>

          <div className="text-white pt-16 pb-4 px-10 text-center font-sf">
            <h4 className="font-medium">
              {showHistory[showHistory?.length - 1]?.Title}
            </h4>
            <p className="text-zinc-400 mt-1 leading-5">
              {showHistory[showHistory?.length - 1]?.Message}
            </p>
          </div>

          <div className=" border-t-[1px] border-b-[1px] border-zinc-600 mt-4 py-4 flex justify-between items-center [&>div]:text-zinc-400 px-10">
            <div>
              {
                <FaRegRectangleList
                  size={25}
                  color={
                    showHistory?.some((title) =>
                      showHistory?.some((item) =>
                        item?.Title?.includes(
                          "Super! A human being has seen your order"
                        )
                      )
                    )
                      ? `orange`
                      : ""
                  }
                />
              }
            </div>
            <div
              className="flex-grow mx-4 h-1 bg-[length:8px_8px] bg-center bg-repeat-x"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #525252 20%, transparent 20%)",
              }}
            ></div>
            <div>
              <MdHotTub
                size={25}
                color={
                  showHistory.some((title) =>
                    showHistory.some((item) =>
                      item.Title.includes("Your order was confirmed!")
                    )
                  )
                    ? `orange`
                    : ""
                }
              />
            </div>
            <div
              className="flex-grow mx-4 h-1 bg-[length:8px_8px] bg-center bg-repeat-x"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #525252 20%, transparent 20%)",
              }}
            ></div>
            <div>
              <GiCardPickup
                size={25}
                color={
                  showHistory?.some((title) =>
                    showHistory?.some((item) =>
                      item.Title.includes("Done! Your order is ready now")
                    )
                  )
                    ? `orange`
                    : ""
                }
              />
            </div>
            <div
              className="flex-grow mx-4 h-1 bg-[length:8px_8px] bg-center bg-repeat-x"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #525252 20%, transparent 20%)",
              }}
            ></div>
            <div>
              <FaCheckCircle
                size={25}
                color={
                  showHistory?.some((title) =>
                    showHistory?.some((item) =>
                      item.Title.includes("Thanks for choosing us")
                    )
                  )
                    ? `orange`
                    : ""
                }
              />
            </div>
          </div>

          {driverId && (
            <div className="flex justify-between items-center bg-[#262626] w-full text-white mt-4 pb-4 px-5 font-sf">
              <div className="flex items-center gap-x-3">
                <img
                  className="w-12 h-12 rounded-full shrink-0 bg-red-400 object-cover"
                  src={BASE_URL + data?.data?.driverDetails?.image}
                  alt=""
                />{" "}
                <div className="font-sf [&>p]:text-gray-400 [&>p]:text-sm [&>p]:leading-4">
                  <h4>{data?.data?.driverDetails?.name}</h4>
                  <p>{data?.data?.driverDetails?.email}</p>
                </div>
              </div>

              <div className="flex gap-x-4 [&>div]:bg-white [&>div]:w-9 [&>div]:h-9 [&>div]:rounded-full [&>div]:text-[#262626] [&>div]:flex [&>div]:justify-center [&>div]:items-center">
                <div>
                  <FaPhone size={20} />
                </div>
                <div>
                  <IoChatbubbleEllipsesSharp size={25} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={`bg-white px-[30px] font-sf hidden max-[500px]:block ${
            driverId ? "mt-6" : "mt-[-20px]"
          }`}
        >
          <div className="[&>p]:text-gray-600 [&>p]:text-sm [&>p]:leading-4 [&>h4]:font-semibold">
            <h4 className="font-omnes text-theme-black-2">Delivering to:</h4>
            <p>{data?.data?.address}</p>
          </div>
          <div className="[&>p]:text-gray-600 [&>p]:text-sm [&>p]:leading-4 [&>h4]:font-semibold mt-4">
            <h4 className="font-omnes text-theme-black-2">
              {data?.data?.restaurantName}
            </h4>
            <p>Order# {data?.data?.orderNum}</p>
          </div>
          {data?.data?.items?.map((itm) => {
            return (
              <div className="flex items-center gap-x-3 my-4 relative">
                <img
                  className="w-14 h-12 rounded-md shrink-0 bg-red-400"
                  src={BASE_URL + itm?.image}
                  alt=""
                />{" "}
                <div className="font-sf [&>p]:text-gray-600 [&>p]:text-sm [&>p]:leading-4 [&>h4]:leading-5 mr-5">
                  <h4 className="font-omnes font-semibold text-theme-black-2">
                    {itm?.itemName}
                  </h4>
                  <p>{itm?.addOns?.map((ad) => ad?.name + ",")}</p>
                </div>
                <p className="absolute top-2 right-0 font-semibold font-omnes">
                  x{itm?.quantity}
                </p>
              </div>
            );
          })}
          <hr />
          <div className="flex justify-between items-center my-4">
            <p className="font-omnes font-semibold text-theme-black-2">Total</p>{" "}
            <p className="font-omnes text-theme-black-2 font-semibold">
              {data?.data?.currency} {data?.data?.total}
            </p>
          </div>
        </div>

        {/*small devices screen end here  */}

        <div className="w-full max-w-[1200px] mx-auto relative">
          <h3 className="font-omnes font-bold text-5xl md:text-6xl absolute z-10 left-7 -top-12 md:-top-16 max-[500px]:hidden">
            {data?.data?.restaurantName}
          </h3>

          <div className="relative text-gray-500 font-sf border-b-2 pt-10 pb-2 max-[500px]:hidden before:absolute before:content-[''] before:w-[99vw] before:h-[2px] before:bg-gray-200 before:left-1/2 before:-translate-x-[50%] before:-bottom-[2px]">
            <div className="px-[30px] mx-auto flex gap-x-16 pb-[10px]">
              <button
                onClick={() => {
                  setTab("status");
                }}
                className={`text-2xl font-medium relative ${
                  tab === "status"
                    ? 'text-[#40875D] before:absolute before:content-[""] before:w-[120px] before:h-[3px] before:bg-[#40875D] before:-bottom-[20px] before:-left-6 before:rounded-lg'
                    : ""
                }`}
              >
                Status
              </button>
              <button
                onClick={() => {
                  setTab("details");
                }}
                className={`text-2xl font-medium relative ${
                  tab === "details"
                    ? 'text-[#40875D] before:absolute before:content-[""] before:w-[120px] before:h-[3px] before:bg-[#40875D] before:-bottom-[20px] before:-left-6 before:rounded-lg'
                    : ""
                }`}
              >
                Details
              </button>
            </div>
          </div>
          <div className="w-full mx-auto px-1.5 font-switzer grid lg:grid-cols-3 gap-x-10 gap-y-5 my-16 max-[500px]:hidden">
            {tab === "status" ? (
              <>
                <div className="col-span-2">
                  <div className="space-y-2">
                    {showHistory?.map((elem, idx) => {
                      if (elem?.Title == "") return null;
                      return (
                        <div
                          className={`bg-white ${
                            idx === showHistory?.length - 1 &&
                            "border shadow-discoveryCardShadow rounded-lg"
                          } md:w-max md:pr-10`}
                        >
                          <div className="flex shrink items-center gap-x-4 max-sm:gap-x-3 px-[25px] py-5">
                            <div
                              className={`${
                                idx !== showHistory?.length - 1
                                  ? "border text-gray-500"
                                  : "bg-[#379465] text-white"
                              } rounded-fullest size-9 shrink-0 flex items-center justify-center`}
                            >
                              <span className="text-xl flex items-center justify-center">
                                {idx + 1}
                              </span>
                            </div>
                            <div>
                              <h6
                                className={`${
                                  idx !== showHistory?.length - 1
                                    ? "text-base text-gray-500"
                                    : "text-base font-bold text-theme-black-2"
                                }`}
                              >
                                {elem?.Title}
                              </h6>
                              <p className="text-black text-opacity-50">
                                {idx === showHistory?.length - 1 &&
                                  elem?.Message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {!his &&
                      selectedArray?.map((elem, idx) => {
                        if (!elem?.title) return null;

                        const existsInHistory = showHistory?.some(
                          (historyStatus) => historyStatus?.Title === elem.title
                        );

                        if (!existsInHistory) {
                          return (
                            <div key={`standard-${idx}`}>
                              <div className="flex items-center gap-x-4 px-[25px] max-sm:gap-x-3 py-3">
                                <div className="border text-gray-500 rounded-fullest size-9 shrink-0 flex items-center justify-center">
                                  <span className="text-xl flex items-center justify-center ">
                                    {idx + 1}
                                  </span>
                                </div>
                                <div>
                                  <h6 className="text-base text-gray-500">
                                    {elem.title}
                                  </h6>
                                  <p className="text-black text-opacity-50">
                                    {elem.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })}
                  </div>
                  <div className="text-theme-black-2 text-lg font-semibold mt-20 mx-7">
                    <h4 className="text-xl font-semibold">
                      Need help with your order?
                    </h4>
                    <div className="bg-white border rounded-lg w-4/5 max-sm:w-full my-6">
                      <div
                        onClick={() =>
                          (window.location.href =
                            "tel:" +
                            data?.data?.countryCode +
                            data?.data?.phoneNum)
                        }
                        className="flex items-center gap-x-4 py-5 px-6 cursor-pointer"
                      >
                        <div className="bg-[#EDECEC] text-white rounded-fullest size-9">
                          <span className="text-xl h-full flex items-center justify-center">
                            <MdMessage color="black" />
                          </span>
                        </div>
                        <div>
                          <h6 className="text-base text-theme-black-2 font-semibold">
                            Contact support!
                          </h6>
                          <p className="text-base font-normal text-theme-black-2 text-opacity-50">
                            If you need help with your order.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() =>
                        (window.location.href =
                          "tel:" +
                          data?.data?.countryCode +
                          data?.data?.phoneNum)
                      }
                      className="bg-white border rounded-lg w-4/5 max-sm:w-full"
                    >
                      <div className="flex items-center gap-x-4 py-5 px-6 cursor-pointer">
                        <div className="bg-[#EDECEC] text-white rounded-fullest size-9">
                          <span className="text-xl h-full flex items-center justify-center">
                            <FaCircleExclamation color="black" />
                          </span>
                        </div>
                        <div>
                          <h6 className="text-base text-theme-black-2 font-semibold">
                            Contact support!
                          </h6>
                          <p className="text-base font-normal text-theme-black-2 text-opacity-50">
                            If you need help with your order.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="font-sf relative z-20 ml-auto mr-7 lg:top-[-175px] rounded-full bg-white max-sm:translate-x-[50%]">
                  <div className="size-60 border-[20px] rounded-fullest">
                    <div className="flex items-center justify-center flex-col font-sf h-full">
                      {localStorage.getItem("eta_text") ? (
                        <CircularProgress
                          value={showHistory[showHistory?.length - 1]?.progress}
                          size={"240px"}
                          color={
                            data?.data?.OrderStatus?.includes("Reject")
                              ? "red"
                              : data?.data?.orderMode?.name === "Scheduled"
                              ? "orange"
                              : "green"
                          }
                        >
                          <CircularProgressLabel>
                            {lastEntry?.includes("Thanks for choosing us.") ||
                            data?.data?.OrderStatus?.includes("Delivered") ? (
                              <FaCheck
                                className={`mx-auto ${
                                  data?.data?.orderMode?.name === "Scheduled"
                                    ? "text-orange-500"
                                    : "text-green-700"
                                } text-5xl`}
                              />
                            ) : data?.data?.OrderStatus?.includes("Reject") ? (
                              <div className="w-full flex flex-col items-center justify-center bg-green">
                                <IoIosClose className="text-red-500 text-6xl" />
                                <p className="text-xs text-red-500">
                                  you were not <br /> charged
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-4xl font-bold text-theme-black-2">
                                  {timeLeft}
                                </p>
                                <p className="font-medium text-sm text-theme-black-2">
                                  Min
                                </p>
                              </div>
                            )}
                          </CircularProgressLabel>
                        </CircularProgress>
                      ) : (
                        <RotatingLoader />
                      )}
                    </div>
                  </div>
                  <p
                    onClick={generateLink}
                    className="text-[#379465] font-medium text-center my-3 cursor-pointer"
                  >
                    Share Tracking
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-2 font-sf mx-6">
                  <div className="flex justify-between gap-x-4">
                    <div>
                      <h4 className="text-4xl text-theme-black-2 font-bold font-omnes my-2">
                        {data?.data?.restaurantName}
                      </h4>
                      <h6 className="text-lg font-medium text-black text-opacity-60">
                        {data?.data?.restaurantAddress}
                      </h6>
                      <h6 className="text-lg font-medium text-black text-opacity-60">
                        {`${data?.data?.countryCode} ${data?.data?.phoneNum}`}
                      </h6>
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <button
                        onClick={() => {
                          setTimeout(() => {
                            const element =
                              document.querySelector(".setScroll");
                            if (element) {
                              element.scrollTo({ top: 0 });
                            }
                          }, 0);

                          setInfoModal(true);
                        }}
                        className="text-base font-medium text-[#40875D] bg-[#40875D24] rounded-lg px-5 py-2"
                      >
                        View Restaurant info
                      </button>
                      <button
                        onClick={() => orderAgain()}
                        className="text-base font-medium text-[#40875D] bg-[#40875D24] rounded-lg px-5 py-2"
                      >
                        Order again
                      </button>

                      {data?.data?.OrderStatus?.includes("Delivered") &&
                        (!data?.data?.driverRating ||
                          !data?.data?.restaurantRating) && (
                          <button
                            onClick={() => {
                              setModType("feedback");
                              setInfoModal(true);
                            }}
                            className="text-base font-medium text-[#40875D] bg-[#40875D24] rounded-lg px-5 py-2"
                          >
                            Give Your Feedback
                          </button>
                        )}
                    </div>
                  </div>
                  <div className="flex my-5">
                    <div>
                      <h6 className="text-lg font-medium text-black text-opacity-60">
                        Order placed: {convertDateFormat(data?.data?.createdAt)}
                      </h6>
                      <h6 className="text-lg font-medium text-black text-opacity-60">
                        Order ID: {data?.data?.orderNum}
                      </h6>
                      <h6 className="text-lg font-medium text-black text-opacity-60">
                        Delivered to: {data?.data?.address}
                      </h6>
                    </div>
                    <div className="flex h-max gap-x-2">
                      <button className="text-sm text-[#40875D] bg-[#40875D24] rounded-md px-2 py-1">
                        {data?.data?.deliveryType}
                      </button>
                      <button className="text-sm text-[#40875D] bg-[#40875D24] rounded-md px-2 py-1">
                        {data?.data?.OrderStatus}
                      </button>
                    </div>
                  </div>
                  <div className="font-sf">
                    <div className="my-10">
                      <h4 className="text-2xl text-theme-black-2 font-semibold font-omnes">
                        Items
                      </h4>
                      <hr className=" border-black my-2" />
                      <div className="px-2 py-5">
                        {data?.data?.items
                          ?.filter(
                            (ite) =>
                              !(ite?.quantity === 0 && ite?.status === true)
                          )
                          ?.map((ite, index) => {
                            const isInactive = ite?.status === false;

                            return (
                              <div key={index}>
                                <div className="flex justify-between">
                                  <p
                                    className={`text-black text-opacity-60 font-semibold capitalize ${
                                      isInactive ? "line-through" : ""
                                    }`}
                                  >
                                    {ite?.itemName}
                                  </p>
                                  <div className="flex justify-end gap-x-5">
                                    <p
                                      className={`text-black text-opacity-60 font-semibold ${
                                        isInactive ? "line-through" : ""
                                      }`}
                                    >
                                      {`${data?.data?.currency} ${parseFloat(
                                        ite?.itemPrice
                                      ).toFixed(2)}`}
                                    </p>
                                    <p
                                      className={`text-black text-opacity-60 font-semibold ${
                                        isInactive ? "line-through" : ""
                                      }`}
                                    >
                                      {`x${ite?.quantity}`}
                                    </p>
                                    <p
                                      className={`text-black text-opacity-60 font-semibold ${
                                        isInactive ? "line-through" : ""
                                      }`}
                                    >
                                      {`${data?.data?.currency} ${parseFloat(
                                        parseFloat(ite?.itemPrice) *
                                          parseFloat(ite?.quantity)
                                      ).toFixed(2)}`}
                                    </p>
                                  </div>
                                </div>

                                {ite?.addOns?.map((add, key) => (
                                  <div
                                    key={key}
                                    className="flex justify-between space-y-1"
                                  >
                                    <p
                                      className={`text-black text-opacity-60 text-sm font-normal capitalize ${
                                        isInactive ? "line-through" : ""
                                      }`}
                                    >
                                      {add?.name}
                                    </p>
                                    <div
                                      className={`justify-end gap-x-7 w-44 ${
                                        add?.price > 1 ? "flex" : "hidden"
                                      }`}
                                    >
                                      <p
                                        className={`text-black text-opacity-60 text-sm font-normal ${
                                          isInactive ? "line-through" : ""
                                        }`}
                                      >
                                        {`${add?.price}`}
                                      </p>
                                      <p
                                        className={`text-black text-opacity-60 text-sm font-normal ${
                                          isInactive ? "line-through" : ""
                                        }`}
                                      >
                                        {`x${add?.quantity}`}
                                      </p>
                                      <p
                                        className={`text-black text-opacity-60 text-sm font-normal ${
                                          isInactive ? "line-through" : ""
                                        }`}
                                      >
                                        {`+${parseFloat(
                                          parseFloat(add?.price) *
                                            parseInt(add?.quantity)
                                        ).toFixed(2)}`}
                                      </p>
                                    </div>
                                  </div>
                                ))}

                                <hr className="my-2" />
                              </div>
                            );
                          })}

                        <div className="flex justify-between items-center text-2xl font-semibold font-omnes text-theme-black-2">
                          <p>Subtotal:</p>
                          <p>{`${data?.data?.currency} ${data?.data?.subTotal}`}</p>
                        </div>
                        {data?.data?.deliveryType === "Delivery" && (
                          <div className="flex justify-between my-2">
                            <p className="text-black text-opacity-60 font-semibold">
                              Delivery Fee
                            </p>
                            <p className="text-black text-opacity-60 font-semibold">
                              {data?.data?.deliveryFee}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between my-2">
                          <p className="text-black text-opacity-60 font-semibold">
                            Service Fee
                          </p>
                          <p className="text-black text-opacity-60 font-semibold">
                            {data?.data?.serviceCharges}
                          </p>
                        </div>
                        <hr />
                        <div className="flex justify-between  items-center  h-20 border-b text-2xl font-semibold font-omnes text-theme-black-2">
                          <p>Total Sum</p>
                          <p>{`${data?.data?.currency} ${data?.data?.total}`}</p>
                        </div>
                      </div>
                    </div>
                    <div className="my-10">
                      <h4 className="text-2xl font-semibold font-omnes text-theme-black-2">
                        Payment details
                      </h4>
                      <hr className=" border-black mt-2" />
                      <div className="flex items-center  h-20 border-b">
                        <p className="text-black text-opacity-60 font-semibold w-72 whitespace-nowrap shrink-0">
                          Payment methods
                        </p>

                        <p className="text-black text-opacity-60 font-semibold">
                          {data?.data?.paymentMethod}
                        </p>
                      </div>

                      <div className="flex items-center h-20 border-b">
                        <p className="text-black text-opacity-60 font-semibold w-72 whitespace-nowrap shrink-0">
                          Charged amount
                        </p>
                        <p className="text-black text-opacity-60 font-semibold">
                          {`${data?.data?.currency} ${data?.data?.total}`}
                        </p>
                      </div>
                    </div>

                    <div className="my-10">
                      <h4 className="text-2xl font-semibold font-omnes text-theme-black-2">
                        Additional order info
                      </h4>
                      <hr className=" border-black mt-2" />
                      <div className="flex items-center h-20 border-b">
                        <p className="text-black text-opacity-60 font-semibold w-72 whitespace-nowrap shrink-0">
                          Order type
                        </p>
                        <p className="text-black text-opacity-60 font-semibold">
                          {data?.data?.deliveryType}
                        </p>
                      </div>
                      <div className="flex items-center h-20 border-b">
                        <p className="text-black text-opacity-60 font-semibold w-72 whitespace-nowrap shrink-0">
                          Comment for the driver
                        </p>
                        <p className="text-black text-opacity-60 font-semibold break-all">
                          {data?.data?.note !== ""
                            ? data?.data?.note
                            : "No Comment"}
                        </p>
                      </div>

                      <div className="flex items-center h-20 border-b">
                        <p className="text-black text-opacity-60 font-semibold w-72 whitespace-nowrap shrink-0">
                          Order Status
                        </p>
                        <p className="text-black text-opacity-60 font-semibold">
                          {data?.data?.OrderStatus}
                        </p>
                      </div>
                    </div>

                    <div className="my-10">
                      <h4 className="text-2xl font-semibold font-omnes text-theme-black-2">
                        Feedback
                      </h4>
                      <hr className=" border-black mt-2" />
                      <div
                        className="flex items-center h-20 border-b mt-3
                      "
                      >
                        <p className="text-black text-opacity-60 font-semibold w-72 whitespace-nowrap shrink-0">
                          Driver Rating
                        </p>
                        <div className="flex gap-6">
                          {emojiRatings.map((item) => (
                            <div
                              key={item.value}
                              className="flex flex-col items-center"
                            >
                              <div
                                className={`text-3xl cursor-pointer transition-transform ${
                                  selectedDriverValue === item.value
                                    ? "scale-110"
                                    : "grayscale opacity-50"
                                }`}
                                title={item.label}
                                onClick={() =>
                                  setStTypes((prev) => ({
                                    ...prev,
                                    driverSelEmoji: item.value,
                                  }))
                                }
                              >
                                {item.emoji}
                              </div>
                              <p
                                className={`text-xs mt-1 text-center font-medium ${
                                  selectedDriverValue === item.value
                                    ? "text-black"
                                    : "text-gray-400"
                                }`}
                              >
                                {item.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center h-20 border-b">
                        <p className="text-black text-opacity-60 font-semibold w-72 whitespace-nowrap shrink-0">
                          Comment for the driver
                        </p>
                        <p className="text-black text-opacity-60 font-semibold break-all">
                          {data?.data?.driverFeedBack?.comment !== ""
                            ? data?.data?.driverFeedBack?.comment
                            : "No Comment"}
                        </p>
                      </div>

                      <div className="flex items-center h-20 border-b">
                        <p className="text-black text-opacity-60 font-semibold w-72 whitespace-nowrap shrink-0">
                          Restaurant Rating
                        </p>
                        <div className="flex gap-6">
                          {emojiRatings.map((item) => (
                            <div
                              key={item.value}
                              className="flex flex-col items-center"
                            >
                              <div
                                className={`text-3xl cursor-pointer transition-transform ${
                                  selectedRestaurantValue === item.value
                                    ? "scale-110"
                                    : "grayscale opacity-50"
                                }`}
                                title={item.label}
                                onClick={() =>
                                  setStTypes((prev) => ({
                                    ...prev,
                                    resSelEmoji: item.value,
                                  }))
                                }
                              >
                                {item.emoji}
                              </div>
                              <p
                                className={`text-xs mt-1 text-center font-medium ${
                                  selectedRestaurantValue === item.value
                                    ? "text-black"
                                    : "text-gray-400"
                                }`}
                              >
                                {item.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center h-20 border-b">
                        <p className="text-black text-opacity-60 font-semibold w-72 whitespace-nowrap shrink-0">
                          Comment for the Restaurant
                        </p>
                        <p className="text-black text-opacity-60 font-semibold break-all">
                          {data?.data?.restaurantFeedBack?.comment !== ""
                            ? data?.data?.restaurantFeedBack?.comment
                            : "No Comment"}
                        </p>
                      </div>
                    </div>
                    <div className="my-10">
                      <div className="flex justify-between items-center">
                        <h4 className="text-2xl font-semibold font-omnes text-theme-black-2">
                          Fomino support
                        </h4>
                        <div>
                          <button
                            onClick={() =>
                              (window.location.href =
                                "tel:" +
                                data?.data?.countryCode +
                                data?.data?.phoneNum)
                            }
                            className="text-base font-semibold text-[#40875D] rounded-lg px-5 py-2"
                          >
                            Get help
                          </button>
                        </div>
                      </div>
                      <hr className=" border-black my-2" />
                      <p className="text-black text-opacity-60 font-semibold my-5">
                        If you need help with your order, please contact fomino
                        support on our website.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="font-sf relative z-20 ml-auto mr-7 lg:top-[-175px] rounded-full bg-white max-sm:translate-x-[50%]">
                  <div className="size-60 border-[20px] rounded-fullest border-#F4F4F4 ">
                    <div className="flex items-center justify-center flex-col font-sf h-full">
                      {localStorage.getItem("eta_text") ? (
                        <CircularProgress
                          value={showHistory[showHistory?.length - 1]?.progress}
                          size={"240px"}
                          color={
                            data?.data?.OrderStatus?.includes("Reject")
                              ? "red"
                              : data?.data?.orderMode?.name === "Scheduled"
                              ? "orange"
                              : "green"
                          }
                        >
                          <CircularProgressLabel>
                            {lastEntry?.includes("Thanks for choosing us.") ||
                            data?.data?.OrderStatus?.includes("Delivered") ? (
                              <FaCheck
                                className={`mx-auto ${
                                  data?.data?.orderMode?.name === "Scheduled"
                                    ? "text-orange-500"
                                    : "text-green-700"
                                } text-5xl`}
                              />
                            ) : data?.data?.OrderStatus?.includes("Reject") ? (
                              <div className="w-full flex flex-col items-center justify-center bg-green">
                                <IoIosClose className="text-red-500 text-6xl" />
                                <p className="text-xs text-red-500">
                                  you were not <br /> charged
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-4xl font-bold text-theme-black-2">
                                  {timeLeft}
                                </p>
                                <p className="font-medium text-sm text-theme-black-2">
                                  Min
                                </p>
                              </div>
                            )}
                          </CircularProgressLabel>
                        </CircularProgress>
                      ) : (
                        <RotatingLoader />
                      )}
                    </div>
                  </div>
                  <p
                    onClick={generateLink}
                    className="text-[#379465] font-medium text-center my-3 cursor-pointer"
                  >
                    Share Tracking
                  </p>
                </div>
              </>
            )}
          </div>
          <div
            className={`font-sf fixed top-0 left-0 w-full h-screen z-50 ${
              visible ? "opacity-1" : "opacity-0"
            }  pointer-events-none transition-all duration-500`}
          >
            <div className="bg-red-500 w-1/2 max-sm:w-full max-sm:h-full max-sm:rounded-none max-w-[700px] h-[calc(100vh-200px)] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-lg">
              <div className="w-full h-1/2 bg-green-500 rounded-fullest rotate-12 absolute bottom-[-150px] max-xl:bottom-[-100px] max-sm:bottom-[-120px] left-[-100px]"></div>
              <div
                style={{ "clip-path": "polygon(100% 0, 63% 100%, 100% 100%)" }}
                className="w-1/3 h-1/2 absolute bg-yellow-500 z-30 bottom-[-150px] max-xl:bottom-[-70px] max-sm:bottom-[-120px] right-[-5px]"
              ></div>
              <div>
                <img
                  className="w-40 mx-auto mt-[10%] max-xl:w-20"
                  src="/images/check1.gif"
                  alt=""
                />
                <p className="text-center text-white font-tt font-semibold text-xl mt-6 max-xl:text-sm">
                  Your order has been <br /> completed successfully
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </section>
    </>
  );
}
