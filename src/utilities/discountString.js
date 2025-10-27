// discountStrings.js

const generateDiscountString = (discountDetail) => {
  if (!discountDetail) return "";

  const {
    discountType,
    discountValue,
    minimumOrderValue,
    capMaxDiscount,
    discountProducts,
  } = discountDetail;

  let discountString = "";
  if (discountType === "flat") {
    discountString = `${discountValue}% off (upto ${capMaxDiscount} CHF) on orders over ${minimumOrderValue} CHF`;
  } else if (discountType === "percentage") {
    discountString = `${discountValue}% off on orders over ${minimumOrderValue} CHF`;
  }

  const details = [
    `${minimumOrderValue} CHF minimum order`,
    "For home delivery orders only",
    "This promotion does not apply to restricted items and some service-related fees.",
    "Cannot be combined with other promotions.",
  ];

  return {
    offer: discountString,
    details,
  };
};

const generateFreeDeliveryString = (freeDeliveryDetail) => {
  if (!freeDeliveryDetail) return "";

  const { radius } = freeDeliveryDetail;

  return {
    offer: `Free delivery within ${radius} km radius`,
    details: [
      "For home delivery orders only",
      "This promotion does not apply to restricted items and some service-related fees.",
      "Cannot be combined with other promotions.",
    ],
  };
};

const generateBogoString = (dealDetail) => {
  if (!dealDetail) return "";

  const { buyItemsQty, getItemsQty } = dealDetail;

  return {
    offer: `Buy ${buyItemsQty} item and get ${getItemsQty} item free!`,
    details: [
      "For home delivery orders only",
      "Offer is valid from Nov 25, 2024 until Dec 9, 2024 or until the maximum limit for promotions is reached whichever is earlier",
      "Cannot be combined with other promotions.",
    ],
  };
};

// Exporting all discount types as separate functions
export const discountStrings = {
  generateDiscountString,
  generateFreeDeliveryString,
  generateBogoString,
};
