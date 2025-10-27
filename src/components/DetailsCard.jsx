import { useState } from "react";
import { FaPlus } from "react-icons/fa6";

export default function DetailsCard(props) {
  const [isImageLoaded, setIsImageLoaded] = useState(true);
  return (
    <div
      onClick={props.addCart}
      className=" relative flex items-center rounded-2xl md:px-3 md:py-3 px-3 py-4 shadow-restaurantCardSahadow h-full w-full cursor-pointer space-x-3 transition-all duration-500 hover:scale-[1.03] hover:restaurantCardSahadowHover"
    >
      {/* <div className=" sm:w-[128px]  sm:h-[128px]  h-[92px] flex justify-center items-center rounded-2xl border-transparent">
        <span className="md:w-[124px] md:h-[124px] w-[100px] h-[100px] rounded-2xl ">
          <img
            src={props.img}
            alt="cutlery"
            className=" w-full h-full object-cover rounded-2xl"
          />
        </span>
      </div> */}

      {isImageLoaded && (
        <div className="sm:w-[128px] sm:h-[128px] h-[92px] flex justify-center items-center rounded-xl border-transparent">
          {props?.isUnlimited === false ? (
            props?.stock === 0 || props?.stock == null ? (
              <div className="bg-black px-2 py-1 absolute top-5 left-4 rounded-full text-white text-xs z-10">
                Unavailable
              </div>
            ) : props?.stock < 5 ? (
              <div className="bg-yellow-500 px-2 py-1 absolute top-4 left-3 rounded-full text-white text-xs z-10">
                {props?.stock} left
              </div>
            ) : null
          ) : null}
          <span className="md:w-[124px] md:h-[124px] w-[100px] h-[100px] rounded-xl">
            <img
              src={props.img}
              alt="cutlery"
              className="w-full h-full object-cover rounded-xl"
              onError={() => setIsImageLoaded(false)}
            />
          </span>
        </div>
      )}
      <div className="pl-2 ">
        <h3 className="font-sf font-semibold md:text-lg text-md text-start capitalize  text-ellipsis ellipsis ">
          {props.title}
        </h3>

        {props?.desc?.length > 0 && (
          <p className="capitalize h-[32px] max-h-[32px]  font-normal text-xs text-theme-gray-6 mt-1 w-4/5 text-start   ellipsis2">
            {props.desc}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 w-full">
          <div className="flex items-center gap-x-1">
            <span className="font-semibold md:text-base text-sm ">
              {props.currencyUnit}
              {props.price}
            </span>
          </div>
          <button className="absolute bottom-3 right-3 bg-black text-white rounded-fullest w-[40px] h-[40px] flex justify-center items-center border ">
            {props.qty ? props.qty : <FaPlus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
