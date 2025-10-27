import {
  GoogleMap,
  MarkerF,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import React, { useEffect, useRef, useState } from "react";
import GetAPI from "../../utilities/GetAPI";
import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import Timer from "../../components/Timer";
import { RotatingLoader } from "../../components/Loader";
import { Link, useSearchParams } from "react-router-dom";
import { getDriverLocation } from "../../firebase/firebaseDatabase";
import { IoMdClose } from "react-icons/io";
import socket from "../../utilities/Socket";
import dayjs from "dayjs";

const ShareTracking = () => {
  const [searchParams] = useSearchParams();
  const [id, userId] = searchParams.get("id").split("-");
  const { data, reFetch } = GetAPI(`users/orderdetailsfood/${id}`);

  const [driverLocations, setDriverLocations] = useState("");
  const mapRef = useRef();
  const [directions, setDirections] = useState(null);
  const driverId = data?.data?.driverDetails?.driverId;
  let statusHistory = JSON.parse(localStorage.getItem("statusHistory"));
  const [status, setStatus] = useState("");

  const origin = {
    lat: parseFloat(data?.data?.restaurantLat) || 0,
    lng: parseFloat(data?.data?.restaurantLng) || 0,
  };

  const destination = {
    lat: parseFloat(data?.data?.dropOffLat) || 0,
    lng: parseFloat(data?.data?.dropOffLng) || 0,
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
      message: `Estimated time until it’s ready: [eta_text] mins`,
    },
    {
      title: "Done! Your order is ready and being delivered now.",
      message: `Estimated time until it’s ready: [eta_text] mins`,
    },
    {
      title: "Done! Your order is ready and being delivered now.",
      message: `Estimated time until it’s ready: [eta_text] mins`,
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
    if (!data?.data?.deliveryType || !data?.data?.orderMode?.name) return [];

    if (
      data?.data?.deliveryType === "Delivery" &&
      data?.data?.orderMode?.name === "Standard"
    )
      return DeliveryStandard;
    if (
      data?.data?.deliveryType === "Delivery" &&
      data?.data?.orderMode?.name === "Scheduled"
    )
      return DeliverySchedule;
    if (
      data?.data?.deliveryType === "Self-Pickup" &&
      data?.data?.orderMode?.name === "Standard"
    )
      return SelfPickupStandard;
    if (
      data?.data?.deliveryType === "Self-Pickup" &&
      data?.data?.orderMode?.name === "Scheduled"
    )
      return SelfPickupSchedule;
    return [];
  })();

  const statusText = (status) => {
    let str = {
      Title: "That’s it, we’ve got your order!",
      Message:
        "Kick back and relax - we’ll let you know when the restaurant gets to it!",
      progress: 10,
    };

    if (data?.data?.deliveryType === "Delivery") {
      if (data?.data?.orderMode?.name === "Standard") {
        //Delivery Standard
        if (status === "placeOrder" || status === "Placed") {
          str = {
            Title: "That’s it, we’ve got your order!",
            Message:
              "Kick back and relax - we’ll let you know when the restaurant gets to it!",
            progress: 10,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "Seen") {
          str = {
            Title: "Super! A human being has seen your order.",
            Message: "You should get the final confirmation any minute now!",
            progress: 20,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "acceptOrder" || status === "Accepted") {
          str = {
            Title: "Your order was confirmed!",
            Message: `All good to go! Your order will be delivered on ${localStorage.getItem(
              "orderScheduledDate"
            )} at ${localStorage.getItem("eta_text")} min`,
            progress: 30,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "Rejected" || status === "Reject") {
          str = {
            Title: "Order Rejected",
            Message: `Your order was rejected by restaurant! `,
            progress: 100,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (
          status == "acceptOrderByDriver" ||
          status === "Accepted" ||
          status === "Preparing"
        ) {
          str = {
            Title: "Almost there! Your order is now being prepared.",
            Message: `Almost there! Your order is now being prepared.`,
            progress: 40,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
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
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "foodPickedUp" || status === "Food Pickedup") {
          str = {
            Title: "Done! Your order is ready now.",
            Message: "",
            progress: 75,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "delivered" || status === "Delivered") {
          str = {
            Title: "",
            Message: "Thanks for choosing us.",
            progress: 100,
          };
        }
        localStorage.setItem("statusHistory", JSON.stringify(str));
      } else if (data?.data?.orderMode?.name === "Scheduled") {
        //Delivery Schedule
        if (status == "placeOrder" || status === "Placed") {
          str = {
            Title: "That’s it, we've got your order!",
            Message:
              "Kick back and relax - we’ll let you know when the restaurant gets to it!",
            progress: 10,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status == "Seen" || status === "Seen") {
          str = {
            Title: "Super! A human being has seen your order.",
            Message: "You should get the final confirmation any minute now!",
            progress: 20,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "acceptScheduleOrder" || status === "Accepted") {
          str = {
            Title: "Super! A human being has seen your order.",
            Message: "You should get the final confirmation any minute now!",
            progress: 30,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "scheduleOrder_to_Outgoing") {
          str = {
            Title: "Your order was confirmed!",
            Message: `All good to go! Your order will be delivered on ${localStorage.getItem(
              "orderScheduledDate"
            )} at ${localStorage.getItem("eta_text")} min`,
            progress: 40,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "Rejected" || status === "Reject") {
          str = {
            Title: "Order Rejected",
            Message: `Your order was rejected by restaurant! `,
            progress: 100,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "acceptOrderByDriver" || status === "Accepted") {
          str = {
            Title: "Almost there! Your order is now being prepared.",
            Message: `Estimated time until it’s ready: ${localStorage.getItem(
              "eta_text"
            )} mins`,
            progress: 50,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (
          status === "readyForPickup" ||
          status === "Ready for delivery"
        ) {
          str = {
            Title: "Done! Your order is ready and being delivered now.",
            Message: `Estimated time until it’s ready: ${localStorage.getItem(
              "eta_text"
            )} mins`,
            progress: 75,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "foodPickedUp" || status === "Food Pickedup") {
          str = {
            Title: "Done! Your order is ready and being delivered now.",
            Message: `Estimated time until it’s ready: ${localStorage.getItem(
              "eta_text"
            )} mins`,
            progress: 85,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "delivered" || status === "Delivered") {
          str = {
            Title: "Thanks for choosing us.",
            Message: "",
            progress: 100,
          };
        }
      }
      localStorage.setItem("statusHistory", JSON.stringify(str));
    } else if (data?.data?.deliveryType == "Self-Pickup") {
      //Self-Pickup Standard
      if (data?.data?.orderMode?.name == "Standard") {
        if (status === "placeOrder" || status === "Placed") {
          str = {
            Title: "That’s it, we've got your order!",
            Message:
              "Kick back and relax - we’ll let you know when the restaurant gets to it!",
            progress: 10,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "Seen" || status === "Seen") {
          str = {
            Title: "Super! A human being has seen your order.",
            Message: "You should get the final confirmation any minute now!",
            progress: 30,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "acceptOrder" || status === "Accepted") {
          str = {
            Title: "Your order was confirmed!",
            Message: `All good to go! Your order will be delivered on ${localStorage.getItem(
              "orderScheduledDate"
            )} at ${localStorage.getItem("eta_text")} min`,
            progress: 50,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "Rejected" || status === "Reject") {
          str = {
            Title: "Order Rejected",
            Message: `Your order was rejected by restaurant! `,
            progress: 100,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
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
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "restaurantDelivered" || status === "Delivered") {
          str = {
            Title: "Thanks for choosing us.",
            Message: "Thanks for choosing us.",
            progress: 100,
          };
        }
        localStorage.setItem("statusHistory", JSON.stringify(str));
      } else if (data?.data?.orderMode?.name === "Scheduled") {
        //Self-Pickup Schedule
        if (status === "placeOrder" || status === "Placed") {
          str = {
            Title: "That’s it, we've got your order!",
            Message:
              "Kick back and relax - we’ll let you know when the restaurant gets to it!",
            progress: 10,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "Seen" || status === "Seen") {
          str = {
            Title: "Super! A human being has seen your order.",
            Message: "You should get the final confirmation any minute now!",
            progress: 30,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "acceptScheduleOrder" || status === "Accepted") {
          str = {
            Title: "Your order was confirmed!",
            Message: `All good to go! Your order will be delivered on ${localStorage.getItem(
              "orderScheduledDate"
            )} at ${localStorage.getItem("eta_text")} min`,
            progress: 50,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "Rejected" || status === "Reject") {
          str = {
            Title: "Order Rejected",
            Message: `Your order was rejected by restaurant! `,
            progress: 100,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "scheduleOrder_to_Outgoing") {
          str = {
            Title: "Almost there! Your order is now being prepared.",
            Message: `Estimated time until it’s ready: ${localStorage.getItem(
              "eta_text"
            )} mins`,
            progress: 60,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
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
          localStorage.setItem("statusHistory", JSON.stringify(str));
        } else if (status === "restaurantDelivered" || status === "Delivered") {
          str = {
            Title: "",
            Message: "Thanks for choosing us.",
            progress: 100,
          };
          localStorage.setItem("statusHistory", JSON.stringify(str));
        }
      }
    }
    setStatus(str);
  };

  const handleConnect = () => {
    console.log("Connected");
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

  //get driver location from firebase
  useEffect(() => {
    const subscribe = getDriverLocation((dr) => {
      if (dr) {
        setDriverLocations(dr[driverId]);
      }
    });

    return () => subscribe();
  }, [driverId]);

  let orderStatus = data?.data?.OrderStatus;

  useEffect(() => {
    if (orderStatus) {
      statusText(orderStatus);
    }

    // calculateRoute()
  }, [data]);

  useEffect(() => {
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
      console.log(res, "socket placeOrder");
      statusText("placeOrder");
    });

    socket.on("addPreparingTimeForOrder", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket addPreparingTimeForOrder");
    });

    socket.on("orderSeen", (data) => {
      let res = JSON.parse(data);
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
      localStorage.setItem("eta_text", res?.data?.eta_text);
      localStorage.setItem("eta_minutes", res?.data?.eta_text);
      statusText("acceptOrder");
    });

    socket.on("acceptScheduleOrder", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket acceptScheduleOrder");
      localStorage.setItem("eta_text", res?.data?.eta_text);
      statusText("acceptScheduleOrder");
    });

    socket.on("scheduleOrder_to_Outgoing", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket scheduleOrder_to_Outgoing");
      localStorage.setItem("eta_text", res?.data?.eta_text);
      statusText("scheduleOrder_to_Outgoing");
    });

    socket.on("groupOrder", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket groupOrder");
    });

    socket.on("acceptOrderByDriver", (data) => {
      let res = JSON.parse(data);
      z;
      console.log(res, "socket acceptOrderByDriver");
      statusText("acceptOrderByDriver");
      localStorage.setItem("driverId", res?.driverId);
      localStorage.setItem("eta_text", res?.eta_text);
    });

    socket.on("foodPickedUp", (data) => {
      let res = JSON.parse(data);
      console.log(res, "foodPickedUp");
      localStorage.setItem("eta_text", res?.eta_text);
      statusText("foodPickedUp");
      // getDriverTracking();
    });

    socket.on("delivered", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket delivered");
      statusText("delivered");
    });

    socket.on("restaurantDelivered", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket restaurantDelivered");
      statusText("restaurantDelivered");
    });

    socket.on("rejectOrder", (data) => {
      let res = JSON.parse(data);
      console.log(res, "socket rejectOrder");
      statusText("Rejected");
    });

    socket.on("readyForPickup", (data) => {
      let res = JSON.parse(data);
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

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("placeOrder");
      socket.off("acceptOrder");
    };
  }, [socket]);

  return (
    <div className="pb-52">
      <section className="bg-theme-green relative">
        <div className="absolute z-10 bottom-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        <div className="h-96 relative text-black hover:text-opacity-50">
          <GoogleMap
            key={data || driverLocations?.id}
            zoom={11}
            center={
              driverId
                ? {
                    lat: parseFloat(driverLocations?.lat),
                    lng: parseFloat(driverLocations?.lng),
                  }
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
            }}
            onLoad={(map) => {
              mapRef.current = map;
              calculateRoute();
            }}
          >
            <MarkerF
              position={origin}
              icon={{
                url: "/images/restaurants/restaurant.png",
                scaledSize: new window.google.maps.Size(45, 50),
              }}
            />

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

          <div className="w-[92%] lg:w-[94%] xl:w-[90%] smallDesktop:w-[95%] desktop:w-5/6 largeDesktop:w-[75%] extraLargeDesktop:w-[62.5%] mx-auto -mt-40 z-40 relative">
            <Link to="/">
              <img
                className="absolute top-[-210px] sm:top-[-200px] w-32 sm:w-48"
                src="/images/logo2.gif"
                alt=""
              />
            </Link>

            <h3 className="text-5xl md:text-6xl font-bold font-omnes pt-12 sm:pt-20">
              {data?.data?.restaurantName}
            </h3>
          </div>
        </div>
      </section>

      <div className="w-[92%] lg:w-[94%] xl:w-[90%] smallDesktop:w-[95%] desktop:w-5/6 largeDesktop:w-[75%] extraLargeDesktop:w-[62.5%] mx-auto mt-14 flex justify-between relative">
        <div className="max-sm:mt-10">
          <h6 className="text-3xl md:text-4xl font-bold font-omnes md:max-w-[80%]">
            {statusHistory?.Message}
          </h6>
          <p className="text-black text-lg font-nunito font-semibold mt-3">
            {statusHistory?.Title}
          </p>
        </div>

        {/* Timer show */}
        <div className="absolute max-sm:left-1/2 max-sm:-translate-x-1/2 sm:relative z-20 -mt-28 sm:-mt-[130px] md:top-[-45px]">
          <div className="size-[130px] sm:size-[170px] md:size-[250px] border-[20px] rounded-fullest bg-white">
            <div className="flex items-center justify-center flex-col font-sf h-full">
              {data?.data?.estTime ? (
                <CircularProgress
                  value={statusHistory?.progress}
                  size={
                    window.innerWidth >= "768"
                      ? "250px"
                      : window.innerWidth >= "640"
                      ? "170px"
                      : "130px"
                  }
                  color={
                    orderStatus?.includes("Reject")
                      ? "red"
                      : data?.data?.orderMode?.name === "Scheduled"
                      ? "orange"
                      : "green"
                  }
                >
                  <CircularProgressLabel>
                    {orderStatus?.includes("Delivered") ? (
                      <FaCheck
                        className={`mx-auto ${
                          data?.data?.orderMode?.name === "Scheduled"
                            ? "text-orange-500"
                            : "text-green-700 "
                        } text-5xl`}
                      />
                    ) : orderStatus?.includes("Reject") ? (
                      <div className="">
                        <IoMdClose className="mx-auto" color="red" />
                        <p className="text-red-500 text-sm">Rejected</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl sm:text-4xl font-bold">
                          {data?.data?.estTime.split(" ")[0]}
                        </p>
                        <p className="font-medium text-xs sm:text-sm">Min</p>
                      </div>
                    )}
                  </CircularProgressLabel>
                </CircularProgress>
              ) : (
                <RotatingLoader />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareTracking;
