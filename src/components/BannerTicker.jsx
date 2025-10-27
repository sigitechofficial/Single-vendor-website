import { RiDiscountPercentFill } from "react-icons/ri";
import { useTranslation } from "react-i18next";

const BannerTicker = ({ banner, currency, rating }) => {
  const { t, i18n } = useTranslation();
  let tickerMessage = "";
  if (banner.bannerType === "Discount") {
    const { discountDetail } = banner;
    const discountType =
      discountDetail?.discountType === "flat"
        ? t("Flat Discount")
        : t("Percentage Discount");
    const discountAmount = discountDetail?.discountValue;
    const minimumOrderSpend = discountDetail?.minimumOrderValue;
    const capSizeAmount = discountDetail?.capMaxDiscount;

    // Construct the ticker message step by step
    if (discountAmount && minimumOrderSpend) {
      tickerMessage = `${currency} ${discountAmount} ${t("off")}`;

      if (minimumOrderSpend) {
        tickerMessage += ` ${t("above")} ${currency} ${minimumOrderSpend}`;
      }
      // Add cap size information only if capMaxDiscount exists
      if (capSizeAmount) {
        tickerMessage += ` (${t("up to")} ${currency} ${capSizeAmount})`;
      }
    }
  }
  if (banner.bannerType === "FreeDelivery") {
    tickerMessage = t("Free Delivery");
  }
  if (banner.bannerType === "BOGO") {
    tickerMessage = `${t("Buy")} ${banner?.deal?.buyItemsQty} ${t("get")} ${
      banner?.deal?.getItemsQty
    } ${t("free")}`;
  }

  return (
    <>
      <div className="flex bg-white justify-center items-center gap-1 shadow-restaurantCardSahadow rounded-full text-[13px] py-1 px-2">
        <RiDiscountPercentFill fill="red" /> {tickerMessage && tickerMessage}
      </div>
    </>
  );
};

export default BannerTicker;
