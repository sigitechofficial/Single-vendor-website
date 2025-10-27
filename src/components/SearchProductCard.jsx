import { BASE_URL } from "../utilities/URL";
import CustomDeliveryIcon from "./CustomDeliveryIcon";
import {
  BsEmojiExpressionless,
  BsEmojiSmile,
  BsEmojiTear,
} from "react-icons/bs";
import { CiFaceSmile } from "react-icons/ci";
import { TfiFaceSad } from "react-icons/tfi";

const SearchProductCard = (props) => {
  const getRatingEmoji = (rating) => {
    if (rating <= 1) return <BsEmojiTear size={14} />;
    if (rating <= 3) return <TfiFaceSad size={14} />;
    if (rating <= 5) return <BsEmojiExpressionless size={14} />;
    if (rating <= 7) return <CiFaceSmile size={14} />;
    if (rating <= 9) return <BsEmojiSmile size={14} />;
    return "😍";
  };
  return (
    <div
      onClick={props.onClick}
      className={`rounded-lg relative bg-white w-full shadow-searchResCardShadow0 hover:shadow-discoveryCardShadow hover:scale-[1.02] duration-200 cursor-pointer font-sf`}
    >
      <img
        className={`w-full object-cover rounded-t-lg ${
          props.size === "sm"
            ? "max-h-[144px] smallDesktop:max-h-[140px] desktop:max-h-[154px] largeDesktop:max-h-[165px]"
            : "max-h-[150px] smallDesktop:max-h-[175px] desktop:max-h-[215px] largeDesktop:max-h-[230px]"
        }`}
        src={BASE_URL + props.image}
        alt="image"
      />
      <div className="px-4 py-3 font-sf flex items-center">
        <div className="">
          <h4 className="text-sm font-medium line-clamp-1 text-red-600">
            CHF {props.all}
          </h4>
          <h4 className="text-base font-medium line-clamp-1">
            {props.productName}
          </h4>
          {/* <p className="text-start font-normal text-sm text-black text-opacity-60 capitalize line-clamp-1">
            {props.text || "."}
          </p> */}
        </div>
      </div>
      <div className="border-t border-dashed px-4 py-3 text-sm font-sf ">
        <p className="text-xs text-gray-500">{props?.resName}</p>
        <div className="flex gap-x-1 items-center">
          <CustomDeliveryIcon color="#0009" size="12" />

          <p className="text-gray-500 font-sf text-xs line-clamp-1 w-full flex gap-x-1 items-center">
            <p>{props.deliveryFee}</p>
            <p className="bg-black bg-opacity-60 size-[2px] rounded-full"></p>
            <p>{props.subtext}</p>{" "}
            {props?.rating && getRatingEmoji(props?.rating)}{" "}
            <p className="max-sm:hidden">{props.rating}</p>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchProductCard;
