// Function to apply deal to the cart items
export const applyDealToCart = (activeResData, existingCartItems) => {
  activeResData?.data?.restaurantBanners.forEach((banner) => {
    const dealType = banner.bannerType; // Can be 'Discount', 'BOGO', or 'FreeDelivery'

    const bannerProducts = [
      ...(banner.discountDetail?.discountProducts || []),
      ...(banner.deal?.dealsProducts || []),
      ...(banner.freeDeliveryDetail?.freeDeliveryProducts || []),
    ];

    bannerProducts.forEach((bannerProduct) => {
      const bannerProductId = bannerProduct.R_PLink.id;

      existingCartItems.forEach((cartItem) => {
        if (cartItem.RPLinkId === bannerProductId) {
          switch (dealType) {
            case "Discount":
              applyDiscount(cartItem, banner.discountDetail);
              break;
            case "BOGO":
              applyBOGO(cartItem, banner.deal);
              break;
            case "FreeDelivery":    
              applyFreeDelivery(cartItem, banner.freeDeliveryDetail);
              break;
            default:
              break;
          }
        }
      });
    });
  });
};

// Apply discount to the cart item
const applyDiscount = (cartItem, discountDetail) => {
  const discountValue = parseFloat(discountDetail.discountValue) || 0;
  const minOrderValue = parseFloat(discountDetail.minimumOrderValue) || 0;

  if (cartItem.unitPrice >= minOrderValue) {
    cartItem.unitPrice -= discountValue; // Apply discount
    console.log(`Applied discount of ${discountValue} to ${cartItem.name}`);
  }
};

// Apply BOGO deal to the cart item
const applyBOGO = (cartItem, deal) => {
  const buyQty = parseInt(deal.buyItemsQty, 10) || 1;
  const getQty = parseInt(deal.getItemsQty, 10) || 1;

  if (cartItem.quantity >= buyQty) {
    const freeItems = Math.floor(cartItem.quantity / buyQty) * getQty;
    cartItem.quantity += freeItems; // Add free items
    console.log(`Applied BOGO: Get ${freeItems} free for ${cartItem.name}`);
  }
};

// Apply free delivery deal to the cart item
const applyFreeDelivery = (cartItem, freeDeliveryDetail) => {
  const minOrderValue = parseFloat(freeDeliveryDetail.minimumOrderValue) || 0;

  if (cartItem.unitPrice >= minOrderValue) {
    cartItem.deliveryFee = 0; // Set delivery fee to 0 for free delivery
    console.log(`Applied free delivery to ${cartItem.name}`);
  }
};
