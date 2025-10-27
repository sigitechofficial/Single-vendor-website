import React, { createContext, useEffect, useState } from "react";
import { PostAPI } from "./PostAPI";
import { info_toaster } from "./Toaster";

export const dataContext = createContext();

export const DataProvider = ({ children }) => {
  const [gData, setGData] = useState("");
  const [groupDrawer, setGroupDrawer] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [pending, setPending] = useState("recent");
  const [searchResult, setSearchResult] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [headerDrawer, setHeaderDrawer] = useState(false);
  const [headerSearch, setHeaderSearch] = useState({
    isOpen: false,
    openFilter: false,
  });
  const [deleteProductId, setDeleteProductId] = useState("");

  const delGroup = async () => {
    let res = await PostAPI("users/deleteGroup", {
      orderId: Number(gData?.orderId),
    });
    if (res?.data?.status === "1") {
      // info_toaster(res?.data?.message);
      setGData("");
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
      orderId: parseFloat(gData?.orderId),
      userId: parseFloat(localStorage.getItem("userId")),
    });
    if (res?.data?.status === "1") {
      setGData("");
      localStorage.removeItem("groupData");
      localStorage.removeItem("groupOrder");
      localStorage.removeItem("gLink");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("orderId");
      localStorage.removeItem("hasJoinedGroup");
      localStorage.removeItem("guestJoined");
    } else {
      info_toaster(res?.data?.message);
    }
  };

  return (
    <dataContext.Provider
      value={{
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
        delGroup,
        leaveGroup,
      }}
    >
      {children}
    </dataContext.Provider>
  );
};
