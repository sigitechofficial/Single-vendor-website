import { useState, useEffect, useRef } from "react";
import { GoPlus } from "react-icons/go";
import { RiSubtractFill } from "react-icons/ri";

export default function StoreCard(props) {
  const controlRef = useRef(null);
  const [qty, setQty] = useState(props.quantity || 0);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (controlRef.current && !controlRef.current.contains(event.target)) {
        setShowControls(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleButtonClick = (e) => {
    e.stopPropagation();

    const isUnavailable =
      props.isUnlimited === false && (props.stock === 0 || props.stock == null);
    if (isUnavailable) return;

    const hasAddOns =
      props.hasAddOns || (props.addOns && props.addOns.length > 0);

    if (hasAddOns) {
      props.addCart();
    } else {
      const newQty = qty === 0 ? 1 : qty;
      setQty(newQty);
      setShowControls(true);

      // 💥 Always add 1 to cart if first-time click and no add-ons
      if (qty === 0 && props.directAddToCart) {
        props.directAddToCart(1);
      }
    }
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    props.addCart();
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    console.log(qty, " card");
    // Prevent increment if item is unavailable
    const isUnavailable =
      props.isUnlimited === false && (props.stock === 0 || props.stock == null);

    if (isUnavailable) return;

    const hasAddOns =
      props.hasAddOns || (props.addOns && props.addOns.length > 0);

    if (hasAddOns) {
      props.addCart();
    } else {
      const newQuantity = qty + 1;
      setQty(newQuantity);
      if (props.directAddToCart) {
        props.directAddToCart(newQuantity);
      }
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (qty > 0) {
      const newQuantity = qty - 1;
      setQty(newQuantity);

      if (newQuantity === 0) {
        // Remove item from cart when quantity becomes 0
        if (props.directAddToCart) {
          props.directAddToCart(0); // Pass 0 to indicate removal
        }
      } else {
        // Update cart with new quantity
        if (props.directAddToCart) {
          props.directAddToCart(newQuantity);
        }
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer   rounded-xl shadow-restaurantCardSahadow h-[245px] hover:scale-[1.02] duration-200 "
    >
      <div className="bg-white rounded-lg relative">
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
        <div className="h-[153px] relative rounded-lg  bg-cover bg-center bg-no-repeat shadow-restaurantCardSahadow">
          <img
            src={props.image}
            alt=""
            className="w-full h-full object-cover rounded-t-xl"
          />
          <button
            onClick={handleButtonClick}
            className="absolute top-0 right-0 px-3  text-white transition-all duration-300 ease-in-out bg-black z-30   rounded-tr-xl rounded-bl-3xl  h-12 text-center flex justify-center items-center"
          >
            {showControls && qty > 0 && !props?.hasAddOns ? (
              <span
                ref={controlRef}
                className="flex items-center justify-between gap-3 w-28"
              >
                <button
                  onClick={handleDecrement}
                  className="w-6 h-6 bg-white rounded-fullest flex justify-center items-center"
                  disabled={qty === 0}
                >
                  <RiSubtractFill size={16} color="#E13743" />
                </button>
                <span className=" text-xl">{qty}</span>
                <button
                  onClick={handleIncrement}
                  className="w-6 h-6 bg-white rounded-fullest flex justify-center items-center"
                >
                  <GoPlus size={16} color="#E13743" />
                </button>
              </span>
            ) : (
              <div
                onClick={(e) => {
                  setShowControls(true);
                }}
              >
                {props.qty ? (
                  <p className="px-3 text-lg"> {props.qty}</p>
                ) : (
                  <GoPlus size={31} color="#ffff" />
                )}
              </div>
            )}
          </button>
          {props.isAdult === 1 && (
            <div className="absolute top-3 left-3 bg-[#FFF8EC] text-[#FEB328] text-xs py-1 px-2 rounded-xl">
              <span>18+</span>
            </div>
          )}
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center gap-x-1">
            <span className="font-normal text-sm text-theme-red-2">
              {props.currencyUnit}
              {props.discountPrice}
            </span>
            <span className="w-0.5 h-0.5 bg-black bg-opacity-60 rounded-full"></span>
            <del className="font-normal text-xs text-theme-gray-6">
              {props.currencyUnit}
              {props.originalPrice}
            </del>
          </div>
          <div className="font-medium text-base capitalize  pb-2 font-sf">
            {props.title}
          </div>
        </div>
      </div>
    </div>
  );
}
