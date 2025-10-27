import { useState, useRef, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa"; // React Icon for Delete
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utilities/URL";
import getCountryCode from "../utilities/getCountryCode";
import { info_toaster, success_toaster } from "../utilities/Toaster";
import { PostAPI } from "../utilities/PostAPI";
import { useUserOnGoingOrders } from "../hooks/useUserOnGoingOrders";
import { dataContext } from "../utilities/ContextApi";
import socket from "../utilities/Socket";
const GroupIcon = (props) => {
  const navigate = useNavigate();
  const [groupList, setGroupList] = useState([]);
  const { gData, setGData } = useContext(dataContext);
  const [groupOrderVisible, setGroupOrderVisible] = useState(false);
  const [isOverDeleteTarget, setIsOverDeleteTarget] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const deleteTargetRef = useRef(null);
  const draggableRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const groupIcon = JSON.parse(localStorage.getItem("groupData"))?.groupIcon;
  const orderId =
    JSON.parse(localStorage.getItem("groupData"))?.orderId ||
    localStorage.getItem("orderId");
  const groupOrder = JSON.parse(localStorage.getItem("groupOrder"));
  const groupName = JSON.parse(localStorage.getItem("groupData"))?.groupName;
  const groupData = JSON.parse(localStorage.getItem("groupData"));
  const hostId = JSON.parse(localStorage.getItem("groupData"))?.hostebBy?.id;
  const hostedById = JSON.parse(localStorage.getItem("groupData"))?.hostedById;
  const userId = JSON.parse(localStorage.getItem("userId"));
  const { data, refetch: reFetch } = useUserOnGoingOrders(userId);
  // let groupList = data?.data?.ongoingOrders?.filter((item) => {
  //   return item?.orderType?.type === "Group";
  // });
  const gLink = `http://localhost:5173/group-order?id=${groupList?.[0]?.id}&hid=${userId}`;
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
  // Handle drag end to check if it should be deleted
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
  const confirmDeletion = () => {
    if (hostId == userId || hostedById == userId) {
      delGroup();
    } else {
      leaveGroup(orderId, userId);
    }
    setGroupOrderVisible(false);
    onClose();
  };
  // Handle cancellation of deletion
  const cancelDeletion = () => {
    onClose();
  };
  //delete group
  const delGroup = async () => {
    let res = await PostAPI("users/deleteGroup", {
      orderId: Number(orderId),
    });
    if (res?.data?.status === "1") {
      // info_toaster(res?.data?.message);
      setGData("");
      reFetch();
      localStorage.removeItem("groupData");
      localStorage.removeItem("groupOrder");
      localStorage.removeItem("gLink");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("hasJoinedGroup");
      localStorage.removeItem("guestJoined");
    } else {
      info_toaster(res?.data?.message);
    }
  };
  const leaveGroup = async (orderId, userId) => {
    let res = await PostAPI("users/leaveGroup", {
      orderId: parseFloat(orderId) || groupList?.[0]?.id,
      userId: parseFloat(userId),
    });
    if (res?.data?.status === "1") {
      setGData("");
      reFetch();
      localStorage.removeItem("groupData");
      localStorage.removeItem("groupOrder");
      localStorage.removeItem("gLink");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("orderId");
      localStorage.removeItem("hasJoinedGroup");
      localStorage.removeItem("guestJoined");
      navigate("/");
    } else {
      info_toaster(res?.data?.message);
    }
  };
  const gettingGroupDetails = async () => {
    let res = await PostAPI("users/groupOrderDetails", {
      orderId: groupList?.[0]?.id,
    });
    if (res?.data?.status === "1") {
      setGData(res?.data?.data);
      //   localStorage.setItem("groupData", JSON.stringify(res?.data?.data));
    }
  };
  const handleDeleteGroup = () => {
    reFetch();
  };
  useEffect(() => {
    const filtered = data?.data?.ongoingOrders?.filter(
      (item) =>
        item?.orderType?.type === "Group" &&
        item?.orderStatus?.name === "Create"
    );
    setGroupList(filtered || []);
    filtered?.length === 0 && setGroupOrderVisible(false);
  }, [data, navigate]);
  useEffect(() => {
    if (
      groupList?.length > 0 &&
      !window.location.href.includes("group-order") &&
      !window.location.href.includes("checkout")
    ) {
      // const glink = `http://localhost:5173/group-order?id=${groupList?.[0]?.id}&hid=${userId}`;
      // groupList?.[0]?.id &&
      //   localStorage.setItem("orderId", JSON.stringify(groupList?.[0]?.id));
      // localStorage.setItem("groupOrder", JSON.stringify({}));
      // localStorage.setItem("groupData", JSON.stringify({}));
      // groupList?.[0]?.restaurant?.id &&
      //   localStorage.setItem(
      //     "resId",
      //     JSON.stringify(groupList?.[0]?.restaurant?.id)
      //   );
      // glink && localStorage.setItem("gLink", glink);
      setGroupOrderVisible(true);
    } else {
      setGroupOrderVisible(false);
    }
    if (groupList?.length > 0) {
      gettingGroupDetails();
    } else {
      reFetch();
    }
    socket.on("deleteGroup", handleDeleteGroup);
    return () => {
      socket.off("deleteGroup", handleDeleteGroup);
    };
  }, [navigate, socket]);
  return (
    <>
      {groupOrderVisible && (
        <motion.div
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
          style={{ top: "10px", right: "10px", ...props.style }}
        >
          <div
            title={groupName}
            className="w-20 h-20 rounded-full bg-black flex items-center justify-center shadow-lg border-4 border-white"
            onDoubleClick={() => {
              localStorage.setItem("orderId", groupList?.[0]?.id);
              localStorage.setItem("gLink", gLink);
              localStorage.setItem("resId", gData?.restaurant?.id);
              navigate(`/pk/group-order/${groupList?.[0]?.id}/venue`);
            }}
          >
            <img
              className="pointer-events-none w-full h-full object-contain"
              src={
                !groupIcon || groupIcon.includes("undefined")
                  ? "/images/burger.webp"
                  : BASE_URL + groupIcon
              }
              alt=""
            />
          </div>
        </motion.div>
      )}
      <div
        ref={deleteTargetRef}
        className={`fixed z-50 bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center transition-transform duration-200 ${
          isOverDeleteTarget ? "scale-100 bg-red-600" : "scale-75 bg-red-500"
        }`}
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          display: isDragging ? "flex" : "none",
        }}
      >
        <FaTimes className="h-8 w-8 text-white" />
      </div>
      <Modal isOpen={isOpen} onClose={cancelDeletion} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {hostId == userId || hostedById == userId ? "Delete" : "Leave"}{" "}
            Group Order
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to{" "}
            {hostId == userId || hostedById == userId ? "Delete" : "Leave"} this
            group order?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={cancelDeletion}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDeletion}>
              {hostId == userId || hostedById == userId ? "Delete" : "Leave"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default GroupIcon;
