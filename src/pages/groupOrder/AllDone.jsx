import React, { useContext, useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import { GrNext } from "react-icons/gr";
import { PiPersonSimpleBike } from "react-icons/pi";
import { IoChatboxOutline } from "react-icons/io5";
import { PostAPI } from "../../utilities/PostAPI";
import { BASE_URL } from "../../utilities/URL";
import { useNavigate } from "react-router-dom";
import { dataContext } from "../../utilities/ContextApi";
import Loader from "../../components/Loader";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import CustomDeliveryIcon from "../../components/CustomDeliveryIcon";

const AllDone = () => {
  const navigate = useNavigate();
  const activeResData = JSON.parse(localStorage.getItem("activeResData"));
  const combine = activeResData?.getConfiguration?.general?.combined;
  const groupId = JSON.parse(localStorage.getItem("groupData"))?.orderId;
  const countryCode = localStorage.getItem("countryShortName")?.toLowerCase();
  const { gData, setGData, groupDrawer, setGroupDrawer } =
    useContext(dataContext);
  const [group, setGroup] = useState("");
  const [joinGroup, setJoinGroup] = useState("");
  const resId = localStorage.getItem("resId");
  const cartData = JSON.parse(localStorage.getItem("cartItem")) || {};
  const cartItems = cartData[`id_${resId}`] || [];
  const [order, setOrder] = useState(() => {
    if (!cartItems || cartItems?.length === 0) {
      return {
        orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
        subTotal: 0,
        restaurantId: Number(localStorage.getItem("resId")),
        userId: Number(localStorage.getItem("userId")),
        voucherId: "",
        products: [],
        cutlery_data: [],
      };
    }

    const products = cartItems?.map((item) => ({
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      RPLinkId: item.RPLinkId || null,
      name: item.name || "",
      image: item.image || "",
      addOns: item.addOns || [],
    }));

    // Calculate subtotal
    const currencySign = activeResData?.currencyUnit;

    const subTotal = cartItems
      .reduce((accumulator, currentItem) => {
        const itemQuantity = currentItem.quantity;
        const itemUnitPrice = parseFloat(currentItem.unitPrice) || 0;
        const addonsTotal =
          currentItem?.addOns?.reduce((addonAccumulator, addon) => {
            return (
              addonAccumulator + (addon?.total || 0) * (addon?.quantity || 1)
            );
          }, 0) || 0;
        const itemTotalPrice = itemQuantity * (itemUnitPrice + addonsTotal);

        return accumulator + itemTotalPrice;
      }, 0)
      .toFixed(2);

    return {
      orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
      subTotal: Number(subTotal),
      restaurantId: Number(localStorage.getItem("resId")),
      userId: Number(localStorage.getItem("userId")),
      voucherId: "",
      products: products,
      cutlery_data: [],
    };
  });

  const [formattedData, setFormattedData] = useState("");
  const [promotions, setPromotions] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  //Joining the group
  const joinGroupFunction = async () => {
    let res = await PostAPI("users/joinGroup", order);
    if (res?.data?.status === "1") {
      setJoinGroup(res?.data?.data);
      localStorage.setItem("hasJoinedGroup", true);
    }
  };

  const notReady = async () => {
    let res = await PostAPI("users/notReady", {
      orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
      userId: Number(localStorage.getItem("userId")),
    });

    navigate(`/${countryCode}/group-order/${groupId}/join`, {
      state: { g: true },
    });
  };

  //Format Data for Group participants
  function transformData() {
    const transformed = [];

    gData?.participantList?.forEach((participant) => {
      participant?.items?.forEach((item) => {
        const transformedItem = {
          RPLinkId: item?.productName?.id || null,
          addOns: item?.addOns.map((addOn) => ({
            total: addOn?.total || "0.00",
            quantity: addOn?.quantity || 1,
            collectionId: addOn?.collectionId || null,
            addOnId: addOn?.id || null,
            name: addOn?.addOn?.name || "Unknown",
          })),
          addOnsCat: item?.addOnsCat || [],
          currencySign: gData?.currencyDetails?.symbol,
          description:
            item?.productName?.description || "No description provided",
          image: item?.productName?.image || "No image available",
          name: item?.productName?.name || "Unnamed Product",
          quantity: item?.qty || 1,
          resId: gData.restaurant.id || null,
          unitPrice: parseInt(item?.productName?.originalPrice) || "0.00",
        };

        transformed.push(transformedItem);
      });
    });

    return removeRedundantItems(transformed);
  }

  function removeRedundantItems(items) {
    const uniqueItems = [];

    items?.forEach((item) => {
      const addOnsTotal = item?.addOns?.reduce(
        (total, addOn) =>
          total + (parseFloat(addOn.total) * addOn.quantity || 0),
        0
      );
      const existingItem = uniqueItems?.find(
        (unique) =>
          unique?.RPLinkId === item?.RPLinkId &&
          addOnsTotal ===
            item?.addOns?.reduce(
              (total, addOn) =>
                total + (parseFloat(addOn.total) * addOn.quantity || 0),
              0
            )
      );

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        uniqueItems.push(item);
      }
    });

    return uniqueItems;
  }

  //Banner implementation function
  const findMatchedProducts = (cartItems, restaurantBanners) => {
    const updatedCartItems = cartItems.map((cartItem) => {
      let allPromotionDetails = [];
      let updatedBannerDetails = { ...cartItem };

      // Calculate cart total for discount evaluation
      const cartTotal = cartItems.reduce((total, item) => {
        const addOnsTotal = item.addOns.reduce(
          (sum, addOn) => sum + parseFloat(addOn.total) * item.quantity,
          0
        );
        return total + item.unitPrice * item.quantity + addOnsTotal;
      }, 0);

      // Calculate Total for the current cart item
      const Total =
        (cartItem.unitPrice +
          (cartItem?.addOns?.reduce(
            (addonAccumulator, addon) =>
              addonAccumulator + (addon?.total || 0) * (addon?.quantity || 1),
            0
          ) || 0)) *
        cartItem.quantity;

      cartItem.Total = Total; // Assign Total to cartItem

      // Handle FreeDelivery banners
      const freeDeliveryPromotions = restaurantBanners?.filter(
        (banner) =>
          banner.bannerType === "FreeDelivery" && banner.freeDeliveryDetail
      );

      freeDeliveryPromotions?.forEach((banner) => {
        const freeDeliveryDetail = banner?.freeDeliveryDetail;
        let promotionDetails = null;

        if (freeDeliveryDetail.allProducts) {
          // Cart-wide application
          if (cartTotal >= freeDeliveryDetail.minimumOrderValue) {
            promotionDetails = {
              bannerType: "FreeDelivery",
              promotionScope: "cart-wise",
              applied: true,
              freeDeliveryDetail,
            };
          }
        } else {
          // Product-specific application when allProducts is null
          const isEligibleProduct =
            freeDeliveryDetail.freeDeliveryProducts.some(
              (product) => product?.R_PLink?.id === cartItem.RPLinkId
            );

          const notEligibleProduct =
            freeDeliveryDetail.freeDeliveryProducts.some(
              (product) => product?.R_PLink?.id !== cartItem.RPLinkId
            );

          if (
            isEligibleProduct &&
            !notEligibleProduct &&
            cartTotal >= freeDeliveryDetail.minimumOrderValue
          ) {
            promotionDetails = {
              bannerType: "FreeDelivery",
              promotionScope: "product-wise",
              applied: true,
              freeDeliveryDetail,
            };
          }
        }

        if (promotionDetails) {
          allPromotionDetails.push(promotionDetails);
        }
      });

      // Filter valid discount promotions
      const validDiscountPromotions = restaurantBanners
        ?.filter((banner) => banner.discountDetail)
        ?.filter(
          (banner) => cartTotal >= banner.discountDetail.minimumOrderValue
        );

      // Select the best discount promotion
      validDiscountPromotions?.sort((a, b) => {
        const discountA =
          a.discountDetail.discountType === "Flat"
            ? parseFloat(a.discountDetail.discountValue)
            : Math.min(
                cartTotal * (a.discountDetail.discountValue / 100),
                a.discountDetail.capMaxDiscount || Infinity
              );

        const discountB =
          b.discountDetail.discountType === "Flat"
            ? parseFloat(b.discountDetail.discountValue)
            : Math.min(
                cartTotal * (b.discountDetail.discountValue / 100),
                b.discountDetail.capMaxDiscount || Infinity
              );

        if (discountA === discountB) {
          const diffA = Math.abs(
            cartTotal - a.discountDetail.minimumOrderValue
          );
          const diffB = Math.abs(
            cartTotal - b.discountDetail.minimumOrderValue
          );
          return diffA - diffB;
        }

        return discountB - discountA;
      });

      const bestDiscountPromotion =
        validDiscountPromotions?.length > 0 ? validDiscountPromotions[0] : null;

      // Filter and process BOGO promotions
      const bogoPromotions = restaurantBanners
        ?.filter(
          (banner) => banner?.deal?.buyItemsQty && banner?.deal?.getItemsQty
        )
        .map((banner) => {
          const deal = banner?.deal;
          const buyItemsQty = parseInt(deal?.buyItemsQty);
          const getItemsQty = parseInt(deal?.getItemsQty);
          const allProducts = deal?.allProducts || false;

          if (buyItemsQty > 0) {
            let totalEligibleFreeItems = 0;

            // Calculate eligible free items across all cart items for this promotion
            cartItems.forEach((item) => {
              let eligibleFreeItems = 0;

              if (!allProducts && deal?.dealsProducts?.length) {
                // Check if the cartItem is in dealsProducts
                const isEligibleProduct = deal.dealsProducts.some(
                  (product) => product.R_PLink?.id === item.RPLinkId
                );
                if (isEligibleProduct) {
                  eligibleFreeItems =
                    Math.floor(item.quantity / buyItemsQty) * getItemsQty;
                }
              } else if (allProducts) {
                eligibleFreeItems =
                  Math.floor(item.quantity / buyItemsQty) * getItemsQty;
              }

              totalEligibleFreeItems += eligibleFreeItems;
            });

            return {
              banner,
              totalEligibleFreeItems,
              deal,
            };
          }
          return null;
        })
        .filter((bogo) => bogo !== null);

      // Sort BOGO promotions based on total eligible free items (higher is better)
      const bestBogoPromotion = bogoPromotions?.sort((a, b) => {
        return b.totalEligibleFreeItems - a.totalEligibleFreeItems;
      })[0];

      if (bestBogoPromotion) {
        // Apply best BOGO promotion to all cart items
        cartItems.forEach((item) => {
          const buyItemsQty = parseInt(bestBogoPromotion?.deal?.buyItemsQty);
          const getItemsQty = parseInt(bestBogoPromotion?.deal?.getItemsQty);
          let eligibleFreeItems = 0;

          if (
            !bestBogoPromotion?.deal?.allProducts &&
            bestBogoPromotion?.deal?.dealsProducts?.length
          ) {
            // Apply promotion only if item is in the dealsProducts list
            const isEligibleProduct = bestBogoPromotion.deal.dealsProducts.some(
              (product) => product.R_PLink?.id === item.RPLinkId
            );
            if (isEligibleProduct) {
              eligibleFreeItems =
                Math.floor(item.quantity / buyItemsQty) * getItemsQty;
            }
          } else if (bestBogoPromotion.deal?.allProducts) {
            eligibleFreeItems =
              Math.floor(item.quantity / buyItemsQty) * getItemsQty;
          }

          // Filter out items with 0 quantity in eligibleGetProducts
          const eligibleGetProducts = bestBogoPromotion.deal?.dealsGetProducts
            ?.length
            ? bestBogoPromotion.deal.dealsGetProducts
                .map((product) => ({
                  ...product,
                  quantity: Math.min(getItemsQty, eligibleFreeItems),
                }))
                .filter((product) => product.quantity > 0) // Only include products with quantity > 0
            : [{ ...item, quantity: eligibleFreeItems }].filter(
                (product) => product.quantity > 0
              ); // Only include products with quantity > 0

          item.eligibleFreeItems = eligibleFreeItems;
          item.eligibleGetProducts = eligibleGetProducts;
        });
      }

      // Evaluate promotions for the current product
      restaurantBanners?.forEach((banner) => {
        let promotionDetails = null;

        // Add the best BOGO promotion
        // Apply the best BOGO promotion if it's the one selected
        if (
          banner === bestBogoPromotion?.banner &&
          bestBogoPromotion.totalEligibleFreeItems > 0
        ) {
          promotionDetails = {
            bannerType: "BOGO",
            promotionScope: bestBogoPromotion.deal?.allProducts
              ? "all-product"
              : "product-wise",
            deal: {
              ...bestBogoPromotion.deal,
              dealsGetProducts: bestBogoPromotion.eligibleGetProducts,
              getQuantity: bestBogoPromotion.totalEligibleFreeItems,
            },
            applied: true,
          };
        }

        // Add the best discount promotion
        if (banner === bestDiscountPromotion) {
          const discountDetail = bestDiscountPromotion.discountDetail;
          let discountAmount = 0;

          if (discountDetail.discountType === "Percentage") {
            discountAmount =
              cartItem.Total * (discountDetail.discountValue / 100);
            if (discountDetail.capMaxDiscount) {
              discountAmount = Math.min(
                discountAmount,
                discountDetail.capMaxDiscount
              );
            }
          } else if (discountDetail.discountType === "Flat") {
            discountAmount = parseFloat(discountDetail.discountValue);
          }

          promotionDetails = {
            bannerType: "Discount",
            promotionScope: "all-product",
            discountType: discountDetail.discountType,
            discountValue: discountDetail.discountValue,
            minimumOrderValue: discountDetail.minimumOrderValue,
            capMaxDiscount: discountDetail.capMaxDiscount || null,
            applied: true,
            discountAmount,
          };

          // Calculate afterDiscount using Total and discountAmount
          const afterDiscount = Math.max(cartItem.Total - discountAmount, 0);

          updatedBannerDetails = { ...updatedBannerDetails, afterDiscount };
        }

        if (promotionDetails) {
          allPromotionDetails.push(promotionDetails);
          updatedBannerDetails = {
            ...updatedBannerDetails,
            bannerDetails: banner,
          };
        }
      });

      if (allPromotionDetails.length > 0) {
        const sortedPromotions = allPromotionDetails.sort((a, b) => {
          const priority = { BOGO: 1, Discount: 2, FreeDelivery: 3 };
          return priority[a.bannerType] - priority[b.bannerType];
        });

        const Total =
          (cartItem.unitPrice +
            (cartItem?.addOns?.reduce(
              (addonAccumulator, addon) =>
                addonAccumulator + (addon?.total || 0) * (addon?.quantity || 1),
              0
            ) || 0)) *
          cartItem.quantity;

        return {
          ...cartItem,
          promotionDetails: sortedPromotions,
          Total,
          afterDiscount: updatedBannerDetails.afterDiscount,
          bannersWithAppliedTrue: allPromotionDetails.filter(
            (promotion) => promotion.applied === true
          ),
        };
      }

      return cartItem;
    });

    return updatedCartItems;
  };

  const extractGlobalPromotions = (priorityProduct) => {
    if (!priorityProduct) {
      return false;
    }
    const globalPromotions = [];
    const seenBannerTypes = new Set();
    // Extract promotions without duplicates
    priorityProduct?.forEach((product) => {
      product?.promotionDetails?.forEach((promotion) => {
        if (promotion?.applied && !seenBannerTypes?.has(promotion.bannerType)) {
          seenBannerTypes.add(promotion.bannerType);
          globalPromotions.push(promotion);
        }
      });
    });

    // Define priority order
    const priorityOrder = { BOGO: 1, Discount: 2, FreeDelivery: 3 };

    // Sort by priority
    globalPromotions?.sort((a, b) => {
      return (
        (priorityOrder[a.bannerType] || Infinity) -
        (priorityOrder[b.bannerType] || Infinity)
      );
    });

    return globalPromotions;
  };
  const globalPromotions = extractGlobalPromotions(promotions);

  //Getting group details here
  const groupDets = async () => {
    let res = await PostAPI("users/groupOrderDetails", {
      orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
    });

    if (res?.data?.status === "1") {
      setGroup(res?.data?.data);
      setGData(res?.data?.data);
    }
  };

  useEffect(() => {
    const clickMe = document.querySelector(".clickMe");
    if (!localStorage.getItem("hasJoinedGroup") && clickMe) {
      clickMe.click();
    }
  }, []);

  useEffect(() => {
    groupDets();
  }, [joinGroup]);

  useEffect(() => {
    const transformed = transformData();
    setFormattedData(transformed);
    const matchedProducts = findMatchedProducts(
      transformed,
      activeResData?.restaurantBanners
    );
    setPromotions(matchedProducts);
  }, [gData]);

  return (
    <div className="w-full">
      <Header home={true} rest={false} gData={group} />
      <div className="pt-16  py-24  mx-auto  max-w-[1200px] px-[30px] flex justify-between ">
        <div className="lg:w-[500px]">
          <h2 className="font-bold font-omnes mt-14 text-4xl">All Done</h2>
          <p className="text-md mt-3 font-sf text-base text-theme-black-2 font-light">
            Your host will complete the order and pay for it. in the meantime,
            just relax and wait for the order to arrive!
          </p>
          <div
            className="w-full border border-gray-200 flex justify-between items-center mt-[10%] px-4 py-4 cursor-pointer rounded-lg"
            onClick={() => setGroupDrawer(!groupDrawer)}
          >
            <div className="flex items-center gap-x-2">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  className="w-full h-full object-contain -rotate-12"
                  src={
                    group?.groupIcon && !group?.groupIcon.includes("undefined")
                      ? BASE_URL + group?.groupIcon
                      : "/images/burger.webp"
                  }
                  alt="gorup image"
                />
              </div>
              <div className=" font-sf">
                <h4 className="text-base font-light text-theme-black-2 font-sf">
                  {group?.groupName}
                </h4>
                <p className="text-base text-theme-black-2 text-opacity-65 font-light">
                  {group?.participantList?.length} participant
                </p>
              </div>
            </div>
            <GrNext />
          </div>

          <div className="w-full border border-gray-200 flex justify-between items-center px-6 py-6 mt-2 rounded-lg">
            <div className="flex items-center gap-x-4">
              <CustomDeliveryIcon size="24" />
              <div className=" font-sf">
                <h4 className="text-base leading-6">
                  Delivery{" "}
                  <span className="text-gray-500">
                    in {group?.restaurant?.approxDeliveryTime}-
                    {group?.restaurant?.approxDeliveryTime + 5} min to
                  </span>{" "}
                  {group?.dropOffAddress?.streetAddress}
                </h4>
              </div>
            </div>
          </div>

          {globalPromotions?.length > 0 && (
            <div
              onClick={onOpen}
              className="bg-red-100 text-red-500 border border-gray-200 py-5 mt-4 p-4 [&>h4]:font-bold [&>h4]:text-2xl [&>div]:font-bold [&>div]:text-sm cursor-pointer"
            >
              <h4>Available Promotions</h4>
              {globalPromotions?.map((item) => {
                return (
                  <>
                    {item?.bannerType === "BOGO" && (
                      <div>
                        Buy {item?.deal?.buyItemsQty} get{" "}
                        {item?.deal?.getItemsQty} free
                      </div>
                    )}
                    {item?.bannerType === "Discount" && (
                      <div>
                        {item?.discountType === "Percentage"
                          ? item?.discountValue + "%"
                          : item?.discountAmount +
                            " " +
                            activeResData?.currencyUnit}{" "}
                        off max(
                        {item?.capMaxDiscount +
                          " " +
                          activeResData?.currencyUnit}
                        ) on order above{" "}
                        {item?.minimumOrderValue +
                          " " +
                          activeResData?.currencyUnit}
                      </div>
                    )}
                    {item?.bannerType === "FreeDelivery" && (
                      <div>Free Delivery</div>
                    )}
                  </>
                );
              })}
            </div>
          )}

          <div className="font-sf flex justify-between items-center py-8 pb-4 font-semibold">
            <p className="text-2xl font-semibold text-theme-black-2 font-omnes ">
              Your order
            </p>
            <button
              className="bg-red-100 rounded-md px-4 py-2 text-red-500  font-sf font-semibold"
              onClick={() => {
                notReady();
                localStorage.removeItem("hasJoinedGroup");
              }}
            >
              Edit
            </button>
          </div>

          <div className="border-gray-200 border-t border-b py-5 font-sf">
            {group?.participantList?.map((p, i) => {
              if (p?.participantId == localStorage.getItem("userId")) {
                return p?.items?.map((item, j) => (
                  <div className="w-full flex justify-between">
                    <div>
                      <p className="text-base text-theme-red-2 font-bold">
                        {item?.qty}x{" "}
                      </p>
                    </div>
                    <div className="flex-1 pl-2">
                      <p className="font-semibold text-base text-theme-black-2">
                        {item?.productName?.name?.toLowerCase() + ","}
                      </p>
                      <div className="space-x-2 text-theme-black-2 text-opacity-65 text-sm">
                        {item?.addOns?.map((addon, k) => (
                          <div>
                            {addon?.qty +
                              "x " +
                              addon?.addOn?.name +
                              ` (${addon?.total})`}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-base text-theme-red-2 ">
                        {parseFloat(item?.productName?.originalPrice) +
                          item?.addOns?.reduce(
                            (sum, item) => sum + parseFloat(item.total),
                            0
                          )}{" "}
                        {group?.currencyDetails?.symbol}
                      </p>
                    </div>
                  </div>
                ));
              }
            })}

            {/* <p>
              1x <span className="text-yellow-300 text-2xl">&#9733;</span>
            </p>
            <div className="font-bold text-lg">
              {group?.participantList?.map((p, i) => {
                if (p?.participantId == localStorage.getItem("userId")) {
                  return p?.items?.map((item, j) => (
                    <p>{item?.productName?.name?.toLowerCase() + ","}</p>
                  ));
                }
              })}
            </div>
            <p className="font-bold text-lg">
              {group?.participantList?.map((p, i) => {
                if (p?.participantId == localStorage.getItem("userId")) {
                  return p?.subTotal + " " + group?.currencyDetails?.symbol;
                }
              })}
            </p> */}
          </div>

          <div className="flex justify-between items-center  py-5 pb-0">
            <h4 className="font-omnes font-semibold text-2xl">Total Sum</h4>
            <h4 className="font-omnes font-semibold text-2xl">
              {/* {group?.currencyDetails?.symbol}{" "}
              {group?.participantList?.map((p, i) => {
                if (p?.participantId == localStorage.getItem("userId")) {
                  return p?.subTotal;
                }
              })} */}
              {order?.subTotal} {group?.currencyDetails?.symbol}
            </h4>
          </div>

          <div className="w-full border border-gray-200 flex justify-between items-center my-[10%] p-5 cursor-pointer rounded-lg">
            <div className="flex items-center gap-x-4">
              <IoChatboxOutline className="text-gray-600" size={30} />

              <div className=" font-sf">
                <h4 className="text-lg text-red-500">
                  comment for the restaurant
                </h4>
              </div>
            </div>
            <GrNext />
          </div>
        </div>

        <div className=" pt-16  py-24 flex-1 hidden md:flex flex-col items-center px-10 ">
          <img
            src="/images/joinGroup.webp"
            alt=""
            className="w-full h-full object-contain"
          />
          <img src="/images/coin.png" alt="" className="w-28 mt-3" />
          <div className="px-14">
            <h2 className="text-[28px] font-omnes text-center font-bold mt-4">
              Create your Wolt account and get a small gift from us
            </h2>
            <p
              className="text-base font-sf font-light text-center mt-4
            "
            >
              Create an account to see past orders and to easily join and create
              groups. If you're new to Fomino, we'll give you and you a small
              gift!
            </p>
          </div>
        </div>
      </div>

      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Promotion Information</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody className="text-md font-semibold font-nunito">
            You’re currently viewing a special promotion! Please note that only
            the host is able to select promotions for the group. As a
            participant, you can add items to your cart, but the host will
            choose which promotions to apply.
          </AlertDialogBody>
          <AlertDialogFooter>
            <button
              ref={cancelRef}
              onClick={onClose}
              className="bg-red-100 rounded-md px-4 py-1 text-red-500 font-normal outline-none"
            >
              OK
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <button className="clickMe hidden" onClick={() => joinGroupFunction()}>
        Click Me
      </button>
    </div>
  );
};

export default AllDone;
