import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (
      (["/", "/pk", "/driver-home"].includes(pathname) &&
        navigationType === "POP") ||
      ([
        "/dashboard",
        "/timeline",
        "/driver-home",
        "/driver-signup",
        "/merchant",
        "/privacy-policy",
      ].includes(pathname) &&
        navigationType === "PUSH")
    ) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
