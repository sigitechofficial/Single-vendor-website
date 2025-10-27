import { BASE_URL } from "../utilities/URL";
import { FaBicycle } from "react-icons/fa";
import { BsEmojiSmileFill } from "react-icons/bs";
import CustomDeliveryIcon from "./CustomDeliveryIcon";
import { FaRegSmile } from "react-icons/fa";

const RecentOrderCard = (props) => {
  console.log("props", props);
  return (
    <div className="flex space-x-4 cursor-pointer">
      <div className="w-20 h-20 border rounded">
        <img
          src={`${BASE_URL}${props.data?.restaurant?.logo}`}
          alt="recent order"
          className="w-full h-full rounded-md object-cover "
        />
      </div>
      <div className="flex flex-col">
        <h3 className="font-omnes font-bold text-sm">
          {props.data?.restaurant?.businessName}
        </h3>
        <p className="font-sf text-xs  font-medium mt-1 ellipsis6 ">
          {props.data?.restaurant?.description}
        </p>
        <div className="   font-sf">
          <div className="flex items-center gap-x-2 text-black text-opacity-60 font-normal text-xs mt-2">
            <div className="flex items-center gap-x-2">
              <CustomDeliveryIcon
                color={props.deliveryFee == 0 ? "#379465" : "#0009"}
                size="12"
              />
              <span>{props.data?.restaurant?.deliveryCharge} &euro;</span>
            </div>
            <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full"></div>
            <div>{props.data?.restaurant?.approxDeliveryTime} min</div>
            <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full"></div>
            <div className="flex items-center gap-x-2">
              <FaRegSmile size={12} />
              <span>{props.data?.restaurant?.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentOrderCard;
