import { useState, useEffect } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoBicycleSharp } from "react-icons/io5";
import BannerTicker from "./BannerTicker";
import { useTranslation } from "react-i18next";
import { FaRegSmile } from "react-icons/fa";
import CustomDeliveryIcon from "./CustomDeliveryIcon";
import { Skeleton } from "@chakra-ui/react";
import { LazyLoadImage } from "react-lazy-load-image-component"; // Import LazyLoadImage
import "react-lazy-load-image-component/src/effects/blur.css";

export default function RestaurantCard(props) {
  const [message, setMessage] = useState("");
  const [configurationMessage, setConfigurationMessage] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const determineMessage = () => {
      const { isClose_schedule_pickupOrders, isClose_schedule_deliveryOrders } =
        props?.getConfiguration?.isClosed || {};
      const {
        temporaryClose_pickupOrders,
        temporaryClose_schedule_pickupOrders,
        temporaryClose_schedule_deliveryOrders,
      } = props?.getConfiguration?.temporaryClosed || {};
      const {
        isRushMode_pickupOrders,
        isRushMode_deliveryOrders,
        isRushMode_schedule_pickupOrders,
        isRushMode_schedule_deliveryOrders,
      } = props?.getConfiguration?.isRushMode || {};

      const {
        isOpen_pickupOrders,
        isOpen_deliveryOrders,
        isOpen_schedule_pickupOrders,
        isOpen_schedule_deliveryOrders,
      } = props?.getConfiguration?.isOpen || {};

      const allTemporaryClosedFlagsFalse =
        !props.getConfiguration?.temporaryClosed?.temporaryClose_pickupOrders &&
        !props.getConfiguration?.temporaryClosed
          ?.temporaryClose_schedule_pickupOrders &&
        !props.getConfiguration?.temporaryClosed
          ?.temporaryClose_schedule_deliveryOrders;

      const convertToAmPm = (time24) => {
        const [hour, minute] = time24.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const adjustedHour = hour % 12 || 12;
        return `${adjustedHour}:${
          minute < 10 ? "0" + minute : minute
        } ${period}`;
      };

      if (!props.time || props.time.length === 0) {
        setMessage(t("Closed"));
      }

      if (!props.isOpen && !props.completelyClosed) {
        setMessage(t("Temporarily Closed"));

        if (
          temporaryClose_pickupOrders &&
          temporaryClose_schedule_pickupOrders &&
          temporaryClose_schedule_deliveryOrders
        ) {
          setConfigurationMessage("");
        } else if (
          temporaryClose_pickupOrders &&
          !temporaryClose_schedule_pickupOrders &&
          !temporaryClose_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup Only"));
        } else if (
          temporaryClose_schedule_pickupOrders &&
          !temporaryClose_pickupOrders &&
          !temporaryClose_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup for later"));
        } else if (
          temporaryClose_schedule_deliveryOrders &&
          !temporaryClose_pickupOrders &&
          !temporaryClose_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Delivery for later"));
        } else if (
          temporaryClose_pickupOrders &&
          temporaryClose_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup for now • Delivery for later"));
        } else if (
          temporaryClose_pickupOrders &&
          temporaryClose_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Pickup now or later"));
        } else if (
          !temporaryClose_pickupOrders &&
          !temporaryClose_schedule_pickupOrders &&
          !temporaryClose_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Offering no orders"));
        } else {
          setConfigurationMessage(t("• Schedule Order"));
        }
        return;
      }

      if (props.completelyClosed) {
        const currentTime = new Date();
        const currentDay = currentTime.getDay();
        const currentTimeString = currentTime.toTimeString().slice(0, 5);
        const schedule = props?.time;
        const todaySchedule = schedule.find(
          (day) => Number(day.day) === currentDay
        );
        const nextOpenDay =
          schedule
            .sort((a, b) => a.day - b.day)
            .find((day) => day.status && day.day > currentDay) ||
          schedule.find((day) => day.status);

        if (todaySchedule && todaySchedule.status) {
          if (currentTimeString < todaySchedule.startAt) {
            setMessage(
              `${t("Opens today at")} ${convertToAmPm(todaySchedule.startAt)}`
            );
          } else if (currentTimeString > todaySchedule.endAt.trim()) {
            if (nextOpenDay) {
              if (nextOpenDay.day === (currentDay + 1) % 7) {
                setMessage(
                  `${t("Opens tomorrow at")} ${convertToAmPm(
                    nextOpenDay.startAt
                  )}`
                );
              } else {
                setMessage(
                  `${t("Opens on")} ${nextOpenDay.name} ${t(
                    "at"
                  )} ${convertToAmPm(nextOpenDay.startAt)}`
                );
              }
            }
          } else {
            setMessage("");
          }
        } else if (nextOpenDay) {
          const nextOpenTime = convertToAmPm(nextOpenDay.startAt);
          if (nextOpenDay.day === (currentDay + 1) % 7) {
            setMessage(t(`Open tomorrow at ${nextOpenTime}`));
          } else {
            setMessage(t(`Open on ${nextOpenDay.name} at ${nextOpenTime}`));
          }
        } else {
          setMessage(t(`Closed`));
        }

        // Move this inside the block so it only runs if completelyClosed is true
        if (isClose_schedule_pickupOrders && isClose_schedule_deliveryOrders) {
          setConfigurationMessage(t("• Schedule Order"));
        } else if (isClose_schedule_pickupOrders) {
          setConfigurationMessage(t(`• Pickup for later`));
        } else if (isClose_schedule_deliveryOrders) {
          setConfigurationMessage(t(`• Delivery for later`));
        }
      }

      if (props.isRushMode && !props.completelyClosed) {
        setMessage(t("Rush Mode"));

        if (
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Schedule Orders"));
        }
        // When accepting only standard orders (no schedule orders)
        else if (
          isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(
            t("• Standard Orders • (No schedule order available)")
          );
        }
        // When accepting only standard pickup orders
        else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Pickup only"));
        }
        // When accepting only standard delivery orders
        else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Delivery only"));
        }
        // When accepting only schedule delivery orders
        else if (
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Schedule Delivery only"));
        }
        // When accepting only schedule pickup orders
        else if (
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Schedule Pickup only"));
        }
        // When accepting pickup now or later
        else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Pickup Now or Later"));
        }
        // When accepting pickup now and delivery for later
        else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Pickup Now • Delivery for Later"));
        }
        // When accepting pickup now and schedule for later
        else if (
          isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Pickup Now • Schedule for Later"));
        }
        // When accepting delivery now and schedule for later
        else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t(" • Delivery Now • Schedule for Later"));
        }
        // When accepting delivery now or later
        else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Delivery Now or Later"));
        }
        // When accepting delivery now and pickup for later
        else if (
          !isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("• Delivery Now • Pickup Later"));
        } else if (
          isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(
            t("• Pickup nor or later • Delivery for now")
          );
        } else if (
          isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(
            t("• Delivery nor or later , pickup for now")
          );
        } else if (
          !isRushMode_pickupOrders &&
          !isRushMode_deliveryOrders &&
          !isRushMode_schedule_deliveryOrders &&
          !isRushMode_schedule_pickupOrders
        ) {
          setConfigurationMessage(t("Offering no Orders"));
        } else if (
          isRushMode_pickupOrders &&
          isRushMode_deliveryOrders &&
          isRushMode_schedule_deliveryOrders &&
          isRushMode_schedule_pickupOrders
        ) {
          setMessage("");
          setConfigurationMessage(t("Rush Mode"));
        }
        // Default case
        else {
          setConfigurationMessage("");
        }
      }

      //   is resturant is open and it offer sceduale and pcikup orders only
      if (
        props?.isOpen &&
        !props?.isRushMode &&
        !props?.completeClosed &&
        props?.time?.length > 0
      ) {
        // setMessage("");

        if (
          isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage("");
        } else if (
          !isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Schedule Order"));
        } else if (
          isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Standard Order"));
        } else if (
          !isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(
            t("Delivery now or later • pickup for later")
          );
        } else if (
          isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup Only"));
        } else if (
          !isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("Delivery now  or later"));
        } else if (
          !isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("Delivery now • pickup for later"));
        } else if (
          !isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Delivery Only"));
        } else if (
          !isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Schedule Pickup"));
        } else if (
          !isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Schedule Delivery"));
        } else if (
          isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup now or later"));
        } else if (
          isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup now or schedule later"));
        } else if (
          isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("• Pickup now or schedule later"));
        } else if (
          isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(
            t("Pickup now or later • Delivery for later")
          );
        } else if (
          isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("standard orders •  schedule pickup only"));
        } else if (
          isOpen_pickupOrders &&
          isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage(t("standard orders •  schedule delivery "));
        } else if (
          !isOpen_pickupOrders &&
          !isOpen_deliveryOrders &&
          !isOpen_schedule_pickupOrders &&
          !isOpen_schedule_deliveryOrders
        ) {
          setConfigurationMessage("• Offering no Orders");
        }
      }
    };
    determineMessage();
  }, [props]);

  return (
    <>
      <button
        onClick={props.onClick}
        className={`rounded-lg relative bg-white w-full ${
          props.v === "search"
            ? "shadow-searchResCardShadow0 hover:shadow-discoveryCardShadow"
            : "shadow-discoveryCardShadow"
        } hover:scale-[1.02] duration-200 ${
          props.size === "sm"
            ? "h-[225px] sm:h-[240px] smallDesktop:h-[245px] desktop:h-[250px] largeDesktop:h-auto"
            : "h-[281px] sm:h-[260px] tablet:h-[312px] smallDesktop:h-[281px] desktop:h-[320px] largeDesktop:h-auto"
        }`}
      >
        <div
          className={`relative ${
            props.completelyClosed ||
            !props.isOpen ||
            (props.isRushMode &&
              !(
                props.getConfiguration?.isRushMode?.isRushMode_pickupOrders &&
                props.getConfiguration?.isRushMode?.isRushMode_deliveryOrders &&
                props.getConfiguration?.isRushMode
                  ?.isRushMode_schedule_pickupOrders &&
                props.getConfiguration?.isRushMode
                  ?.isRushMode_schedule_deliveryOrders
              ))
              ? "before:absolute before:w-full before:h-full before:rounded-t-lg before:bottom-0 before:left-0 before:bg-black before:bg-opacity-80"
              : props.isRushMode &&
                props.getConfiguration?.isRushMode?.isRushMode_pickupOrders &&
                props.getConfiguration?.isRushMode?.isRushMode_deliveryOrders &&
                props.getConfiguration?.isRushMode
                  ?.isRushMode_schedule_pickupOrders &&
                props.getConfiguration?.isRushMode
                  ?.isRushMode_schedule_deliveryOrders
              ? "before:absolute before:w-full before:h-[37px] before:bottom-0 before:left-0 before:bg-black before:bg-opacity-80"
              : !props.completelyClosed &&
                props.isOpen &&
                !props.isRushMode &&
                configurationMessage.length > 0
              ? "before:absolute before:w-full before:h-[37px] before:bottom-0 before:left-0 before:bg-black before:bg-opacity-80"
              : ""
          }`}
        >
          {props.completelyClosed && (
            <div className="text-white w-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2   py-1 rounded ">
              <p className=" font-sf  text-base"> {message}</p>
              <p className="font-sf  text-sm">{configurationMessage}</p>
            </div>
          )}
          {!props.isOpen && (
            <div className="text-white w-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2   py-1  ">
              <p className=" font-sf  text-base"> {message}</p>
              <p className="font-sf  text-sm">{configurationMessage}</p>
            </div>
          )}
          {props.isRushMode &&
            !(
              props.getConfiguration?.isRushMode?.isRushMode_pickupOrders &&
              props.getConfiguration?.isRushMode?.isRushMode_deliveryOrders &&
              props.getConfiguration?.isRushMode
                ?.isRushMode_schedule_pickupOrders &&
              props.getConfiguration?.isRushMode
                ?.isRushMode_schedule_deliveryOrders
            ) && (
              <div className="text-white w-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 py-1 rounded">
                <p className="font-sf text-base">{message}</p>
                <p className="font-sf text-sm">{configurationMessage}</p>
              </div>
            )}

          {((props?.isOpen &&
            !props.isRushMode &&
            !props?.completelyClosed &&
            configurationMessage.length > 0) ||
            (props.isRushMode &&
              props.getConfiguration?.isRushMode?.isRushMode_pickupOrders &&
              props.getConfiguration?.isRushMode?.isRushMode_deliveryOrders &&
              props.getConfiguration?.isRushMode
                ?.isRushMode_schedule_pickupOrders &&
              props.getConfiguration?.isRushMode
                ?.isRushMode_schedule_deliveryOrders &&
              configurationMessage.length > 0)) && (
            <div className="text-white w-full absolute bottom-[5px] left-3 py-1 rounded">
              <p className="font-sf text-sm text-start">
                {configurationMessage}
              </p>
            </div>
          )}
          <Skeleton
            isLoaded={props.loadingMap?.[props.id] === false}
            borderTopRadius="lg"
            width="100%"
            startColor="gray.300"
            endColor="gray.100"
            className={`w-full rounded-t-lg ${
              props.size === "sm"
                ? "h-[126px] sm:h-[138px] smallDesktop:h-[148px] desktop:h-[153px]"
                : "h-[179px] sm:h-[158px] tablet:h-[210px] smallDesktop:h-[175px] desktop:h-[206px] extraLargeDesktop:h-[206px] ultraLargeDesktop:h-[231px]"
            }`}
          >
            <img
              src={props.img}
              alt={`res-${props.title}`}
              effect="blur" // Apply the blur effect here
              onLoad={() => props.handleLoad?.(props.id)}
              className={`w-full object-cover rounded-t-lg ${
                props.size === "sm"
                  ? "h-[126px] sm:h-[138px] smallDesktop:h-[148px] desktop:h-[153px]"
                  : "h-[179px] sm:h-[158px] tablet:h-[210px] smallDesktop:h-[175px] desktop:h-[206px] extraLargeDesktop:h-[206px] ultraLargeDesktop:h-[231px]"
              }`}
              style={{
                display:
                  props.loadingMap?.[props.id] === false ? "block" : "none",
                filter: props.loadingMap?.[props.id] !== false ? 'blur(1.5px)' : 'blur(0px)',
                opacity: props.loadingMap?.[props.id] !== false ? 0.7 : 1,
                transition: 'filter 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </Skeleton>
          {/* <div className="flex absolute top-3 left-3 flex-wrap gap-2">
            {props?.restBanners?.length > 0 &&
              props.restBanners
                .slice(0, 3)
                .map((banner, index) => (
                  <BannerTicker
                    key={index}
                    banner={banner}
                    currency={props?.currency}
                    rating={props?.rating}
                  />
                ))}
          </div> */}
          {/* {props?.rating <= 0 && <BannerTicker banner={""} text="New" />} */}
        </div>
        <div
          className={`${
            props.logoWidth
          } absolute  right-7 border-2 border-white rounded-lg shadow-md ${
            props.size === "sm"
              ? "rounded-[4px] top-24 smallDesktop:top-[6rem] desktop:top-[7.4rem] largeDesktop:top-32"
              : "top-32 smallDesktop:top-36 desktop:top-44   largeDesktop:top-40 extraLargeDesktop:top-40 ultraLargeDesktop:top-48"
          }`}
        >
          <Skeleton
            isLoaded={props.loadingMap?.[`${props.id}-logo`] === false}
            borderRadius="md"
            height="100%"
            width="100%"
            startColor="gray.300"
            endColor="gray.100"
          >
            <img
              src={props.logo}
              alt={`logo-${props.logo}`}
              onLoad={() => props.handleLoad?.(`${props.id}-logo`)}
              className="w-full h-full rounded-md object-cover"
              style={{
                display:
                  props.loadingMap?.[`${props.id}-logo`] === false
                    ? "block"
                    : "none",
                filter: props.loadingMap?.[`${props.id}-logo`] !== false ? 'blur(1.5px)' : 'blur(0px)',
                opacity: props.loadingMap?.[`${props.id}-logo`] !== false ? 0.7 : 1,
                transition: 'filter 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </Skeleton>
        </div>
        <div className={`px-4 pt-2 ${props.size === "sm" ? "pb-2" : "pb-3"}`}>
          <h4 className="text-start font-medium text-theme-black-2 text-base capitalize font-sf ">
            {props.title}
          </h4>
          <div className="font-sf text-start font-light text-sm text-theme-black-2 text-opacity-70 capitalize ellipsis5">
            {props.desc || "\u00A0"}
          </div>
        </div>
        <div className="px-4 py-2 border-t border-dashed font-sf">
          <div className="flex items-center gap-x-2 text-black text-opacity-60 font-normal text-[13px] ">
            <div className="flex items-center gap-x-2">
              <CustomDeliveryIcon
                color={props.deliveryFee == 0 ? "#379465" : "#0009"}
                size="12"
              />
              <span
                className={`${
                  props.deliveryFee == 0
                    ? "text-theme-green-2"
                    : "text-black text-opacity-60"
                }`}
              >
                {props.deliveryFee} {props.currency}
              </span>
            </div>
            <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full"></div>
            <div>{props.deliveryTime} min</div>
            <div className="bg-black bg-opacity-60 h-1 w-1 rounded-full"></div>
            <div className="flex items-center gap-x-2">
              <FaRegSmile size={12} />

              <span className="leading-[24px]">{props.rating}</span>
            </div>
          </div>
        </div>
      </button>
    </>
  );
}
