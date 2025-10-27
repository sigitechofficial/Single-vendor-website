import React, { useEffect, useState } from "react";

const getCountryCode = () => {
  const [location, setLocation] = useState({ countryCode: "", city: "" });

  const getLocationFromIP = async () => {
    // try {
    //   const response = await fetch("http://ip-api.com/json/");
    //   const data = await response.json();
    //   setLocation({
    //     countryCode: data.countryCode?.toLowerCase() || "",
    //     city: data.city || "",
    //   });
    // } catch (error) {
    //   console.error("Error fetching location data:", error);
    // }
  };

  useEffect(() => {
    getLocationFromIP();
  }, []);

  return location;
};

export default getCountryCode;
