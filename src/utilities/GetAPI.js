import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "./URL";
import { info_toaster } from "./Toaster";

const GetAPI = (url) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const config = {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      };
      try {
        const res = await axios.get(BASE_URL + url, config);
        setData(res.data);
      } catch (err) {
        // info_toaster(err?.message || "Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  const reFetch = async () => {
    setIsLoading(true);
    const config = {
      headers: {
        accessToken: localStorage.getItem("accessToken"),
      },
    };
    try {
      const res = await axios.get(BASE_URL + url, config);
      setData(res.data);
    } catch (err) {
      //   info_toaster(err?.message || "Error refetching data");
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, reFetch, setData };
};

export default GetAPI;
