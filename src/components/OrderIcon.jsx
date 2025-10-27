import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utilities/URL";
import { useUserOnGoingOrders } from "../hooks/useUserOnGoingOrders";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const OrderIcon = (props) => {
  const navigate = useNavigate();
  const [isOverDeleteTarget, setIsOverDeleteTarget] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const deleteTargetRef = useRef(null);
  const draggableRef = useRef(null);
  const userId = JSON.parse(localStorage.getItem("userId"));
  const { data } = useUserOnGoingOrders(userId);
  const queryClient = useQueryClient();

  // Filter non-group orders from the shared data
  const orders =
    data?.data?.ongoingOrders?.filter(
      (item) => item?.orderType?.type !== "Group"
    ) || [];

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = () => {
    if (!deleteTargetRef.current || !draggableRef.current) return;

    const deleteRect = deleteTargetRef.current.getBoundingClientRect();
    const draggableRect = draggableRef.current.getBoundingClientRect();

    const isOverDelete =
      draggableRect.right > deleteRect.left &&
      draggableRect.left < deleteRect.right &&
      draggableRect.bottom > deleteRect.top &&
      draggableRect.top < deleteRect.bottom;

    setIsOverDeleteTarget(isOverDelete);
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    if (!deleteTargetRef.current || !draggableRef.current) return;

    const deleteRect = deleteTargetRef.current.getBoundingClientRect();
    const draggableRect = draggableRef.current.getBoundingClientRect();

    const isOverDelete =
      draggableRect.right > deleteRect.left &&
      draggableRect.left < deleteRect.right &&
      draggableRect.bottom > deleteRect.top &&
      draggableRect.top < deleteRect.bottom;

    if (isOverDelete) {
      onOpen();
    }
  };

  //   useEffect(() => {
  //     if (
  //       data &&
  //       !window.location.href.includes("group-order") &&
  //       !window.location.href.includes("checkout")
  //     ) {
  //       setGroupOrderVisible(true);
  //     } else {
  //       setGroupOrderVisible(false);
  //     }
  //   }, [navigate, data]);

  const navigateToTimeline = async (orderId) => {
    try {
      // Use TanStack Query to fetch order details
      const orderDetails = await queryClient.fetchQuery({
        queryKey: ["order-details", orderId],
        queryFn: async () => {
          const config = {
            headers: {
              accessToken: localStorage.getItem("accessToken"),
            },
          };
          const response = await axios.get(
            `${BASE_URL}users/orderdetailsfood/${orderId}`,
            config
          );
          return response.data;
        },
      });

      if (orderDetails?.status === "1") {
        localStorage.setItem("orderId", orderDetails?.data?.id);
        localStorage.setItem("resId", orderDetails?.data?.restaurantId);
        localStorage.setItem("lat", orderDetails?.data?.dropOffLat);
        localStorage.setItem("lng", orderDetails?.data?.dropOffLng);
        localStorage.setItem(
          "eta_text",
          String(orderDetails?.data?.estTime).slice(0, 2)
        );
        localStorage.setItem("type", orderDetails?.data?.deliveryType);
        localStorage.setItem("mod", orderDetails?.data?.orderMode?.name);
        localStorage.setItem("statusHistory", JSON.stringify([]));

        localStorage.setItem(
          "activeResData",
          JSON.stringify({
            id: orderDetails?.data?.restaurantId,
            lat: orderDetails?.data?.restaurantLat,
            lng: orderDetails?.data?.restaurantLng,
          })
        );
        localStorage.setItem("connect", false);
        localStorage.setItem("his", true);

        navigate("/timeline", {
          state: { history: orderDetails?.data?.OrderStatus },
        });
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  return (
    <>
      {orders &&
        orders?.slice(0, 5).map((order, index) => (
          <motion.div
            key={order.id}
            ref={draggableRef}
            drag
            dragConstraints={props.containerRef}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            initial={{ x: 0, y: 0 }}
            animate={{ x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute cursor-pointer z-10"
            style={{
              right: "10px",
              ...props.style,
              top: `${180 + index * 60}px`,
            }}
          >
            <div
              title={order.restaurant.businessName}
              className="w-20 h-20 rounded-full bg-black flex items-center justify-center shadow-lg border-2 border-white overflow-hidden"
              onDoubleClick={() => navigateToTimeline(order.id)}
            >
              <img
                className="pointer-events-none w-full h-full object-cover"
                src={
                  order?.restaurant?.logo
                    ? BASE_URL + order?.restaurant?.logo
                    : "/images/logo-2.webp"
                }
                alt={order.restaurant.businessName}
              />
            </div>
          </motion.div>
        ))}
    </>
  );
};

export default OrderIcon;
