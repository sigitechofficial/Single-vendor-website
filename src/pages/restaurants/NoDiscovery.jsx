import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NoDiscovery() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/discovery/restaurants");
  }, []);
}
