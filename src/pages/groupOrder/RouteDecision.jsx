import React, { useEffect } from "react";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";

const RouteDecision = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const countryCode = pathSegments[1];
    const groupId = JSON.parse(localStorage.getItem("groupData"))?.orderId;
    const resId = JSON.parse(localStorage.getItem("groupData"))?.restaurant?.id;
    if (groupId) {
      localStorage.setItem("resId",resId)
      navigate(`/pk/group-order/${groupId}/venue`);
    }
  }, []);
  return <Loader />;
};

export default RouteDecision;
