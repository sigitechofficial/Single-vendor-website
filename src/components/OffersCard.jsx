import { useState } from "react";
import { Skeleton } from "@chakra-ui/react";
import { FaRegArrowAltCircleRight } from "react-icons/fa";

const OffersCard = ({ id, image, title, description, onClick, bannerType }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const getImageByBannerType = (type) => {
    switch (type) {
      case "FreeDelivery":
        return "/images/freeDelivery.png";
      case "Discount":
        return "/images/discountlogo.png";
      case "BOGO":
        return "/images/bogo.png";
      default:
        return "/images/default.png"; // fallback image
    }
  };

  const bannerImage = getImageByBannerType(bannerType);
  return (
    <button
      onClick={onClick}
      className="rounded-xl relative w-full  hover:scale-[1.02] duration-200  space-x-3 flex  items-center px-8 py-4 bg-theme-red-2 bg-opacity-10 bef-circle"
    >
      <img src={bannerImage} alt="" className="w-14 h-14" />
      <div className="text-start space-y-1 font-sf">
        <h3 className=" font-semibold capitalize font-sf text-theme-black-2 text-sm">
          {title}
        </h3>
        <div className="text-theme-red-2 text-xs font-semibold flex items-center w-full ">
          <p className="pe-2"> Show details</p>
          <FaRegArrowAltCircleRight size={14} />
        </div>
      </div>
    </button>
    // <button
    //   onClick={onClick}
    //   className="rounded-lg relative bg-white w-full  hover:scale-[1.02] duration-200  p-2 flex flex-col space-y-3"
    // >
    //   <div className="w-full h-36 rounded-lg">
    //     <Skeleton
    //       isLoaded={isLoaded}
    //       borderRadius="lg"
    //       height="100%"
    //       startColor="gray.300"
    //       endColor="gray.100"
    //     >
    //       <img
    //         id={`offer-img-${id}`} // optionally use id in the DOM
    //         src={image}
    //         alt={title}
    //         className="w-full h-36 rounded-lg object-cover"
    //         onLoad={() => setIsLoaded(true)}
    //         style={{ display: isLoaded ? "block" : "none" }}
    //       />
    //     </Skeleton>
    //   </div>

    //   <div className="text-start space-y-1 font-sf">
    //     <h3 className=" font-semibold">{title}</h3>
    //   </div>
    // </button>
  );
};

export default OffersCard;
