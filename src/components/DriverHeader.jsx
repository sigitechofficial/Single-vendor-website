import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoMenu } from "react-icons/io5";

export default function DriverHeader(props) {
  const [dropdown, setDropdown] = useState(false);
  const [isAbsolute, setIsAbsolute] = useState(false);
  const handleScroll = () => {
    if (window.scrollY > 200) {
      setIsAbsolute(true);
    } else {
      setIsAbsolute(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };
  return (
    <>
      <header
        className={`z-20 font-switzer ${
          isAbsolute
            ? "nav-css sticky top-0 left-0 z-[9999] bg-[#ffffffa3] backdrop-blur-[0.5rem] shadow-driverHeaderShadow"
            : "absolute w-full top-0 "
        }`}
      >
        <div className="z-20  font-sf   max-w-[1200px] w-full  mx-auto  ">
          <div
            className={`flex justify-between items-center mx-auto before-bg2 relative pe-4 sm:pe-[30px]  `}
          >
            <Link
              to={"/"}
              onClick={handleLogoClick}
              className={`bg-[#de2931] ps-4 sm:ps-[30px]`}
            >
              <div className=" ">
                <img
                  src="/images/logo2.gif"
                  alt="fomino"
                  className="lg:w-[264px] w-24  md:h-[70px] h-16 object-contain lg:object-cover"
                />
              </div>
            </Link>
            <nav
              className={`${
                dropdown ? "flex" : "hidden"
              }  left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:left-0 lg:transform-none lg:flex lg:flex-row flex-col lg:items-center lg:justify-center lg:static absolute  gap-x-5 gap-y-3 lg:w-full w-11/12 mx-auto font-medium text-sm lg:text-theme-black-2 text-black lg:bg-transparent lg:bg-opacity-100 bg-white  sm:top-32 top-32 lg:py-0 lg:px-0 lg:rounded-none py-3 px-3 lg:border-none border rounded-xl lg:shadow-none shadow-courierContainerShadow`}
            >
              <Link
                to={"/driver-home"}
                className="bg-white hover:bg-gray-200 px-2 py-1 rounded-full lg:bg-transparent lg:hover:bg-transparent"
              >
                For couriers
              </Link>
              <Link
                to={"/merchant"}
                className="bg-white hover:bg-gray-200 px-2 py-1 rounded-full lg:bg-transparent lg:hover:bg-transparent"
              >
                For restaurants
              </Link>
            </nav>
            <div className="flex items-center justify-center gap-x-4 lg:hidden ">
              {/* <p className="font-semibold text-theme-black-2 text-sm font-sf">
                For couriers
              </p> */}
              <button
                onClick={() => setDropdown(!dropdown)}
                className={`  lg:hidden inline}`}
              >
                <IoMenu size={34} />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
