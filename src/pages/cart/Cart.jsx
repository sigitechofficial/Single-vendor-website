import { useContext, useEffect, useRef, useState } from "react";
import {
  FaBriefcase,
  FaDoorOpen,
  FaMinus,
  FaPlus,
  FaWalking,
} from "react-icons/fa";
import {
  FaAngleRight,
  FaArrowLeftLong,
  FaCircleExclamation,
} from "react-icons/fa6";
import GetAPI from "../../utilities/GetAPI";
import Header from "../../components/Header";
import { RiDeleteBinLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { PostAPI } from "../../utilities/PostAPI";
import { IoIosArrowDown, IoIosArrowRoundBack, IoMdHome } from "react-icons/io";
import { MdInsertComment } from "react-icons/md";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useMediaQuery,
} from "@chakra-ui/react";
import {
  MdApartment,
  MdEditCalendar,
  MdLocationPin,
  MdOutlinePayment,
} from "react-icons/md";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import { DirectionsRenderer, GoogleMap, MarkerF } from "@react-google-maps/api";
import { BASE_URL } from "../../utilities/URL";
import { IoCard, IoClose, IoHome } from "react-icons/io5";
import Select from "react-select";
import { Autocomplete } from "@react-google-maps/api";
import { ImOffice } from "react-icons/im";
import { GrMapLocation } from "react-icons/gr";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Footer from "../../components/Footer";
import { formatPrice } from "../../utilities/priceConverter";
import Switch from "react-switch";
import { dataContext } from "../../utilities/ContextApi";
import { GiCardPickup } from "react-icons/gi";
import StampCardModal from "../stamp-card/StampCardModal";
import Loader, { RotatingLoader } from "../../components/Loader";
import CustomDeliveryIcon from "../../components/CustomDeliveryIcon";
import { AiOutlinePlus } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import CustomPlusbtn from "../../components/CustomPlusbtn";
import CustomMenubtn from "../../components/CustomMenubtn";
import FloatingLabelInput from "../../components/FloatingLabelInput";
import CustomRadioBtn from "../../components/CustomRadioBtn";
import findZoneByCoordinates from "../../utilities/FindZoneByLatLng";
import {
  getRestaurantOrderAvailability,
  determineButtonStates,
} from "../../utilities/orderConfiguration";
import { motion } from "framer-motion";
dayjs.extend(customParseFormat);

export default function Cart() {
  const { t, i18n } = useTranslation();
  const [sm] = useMediaQuery("(min-width: 640px)");
  const location = useLocation();
  const context = useContext(dataContext);
  const { gData, setGData, groupDrawer, setGroupDrawer } = context || {};
  const [fee, setFee] = useState("");
  const activeResData = JSON.parse(localStorage.getItem("activeResData"));
  const cartItems = JSON.parse(localStorage.getItem("cart"));
  const getFree = JSON.parse(localStorage.getItem("getFree")) || [];
  const groupIcon = JSON.parse(localStorage.getItem("groupData"))?.groupIcon;
  const orderId = JSON.parse(localStorage.getItem("groupData"))?.orderId;
  const groupOrder = JSON.parse(localStorage.getItem("groupOrder"));
  const groupName = JSON.parse(localStorage.getItem("groupData"))?.groupName;
  const groupData = JSON.parse(localStorage.getItem("groupData"));
  const hostId = JSON.parse(localStorage.getItem("groupData"))?.hostebBy?.id;
  const hostedById = JSON.parse(localStorage.getItem("groupData"))?.hostedById;
  const userId = JSON.parse(localStorage.getItem("userId"));
  const resId = JSON.parse(localStorage.getItem("resId"));
  const [directions, setDirections] = useState(null);
  const [priorityProduct, setPriorityProduct] = useState([]);
  const [allFreeProducts, setAllFreeProducts] = useState([]);
  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState("");
  const [choose, setChoose] = useState("");
  const [afterDiscount, setAfterDiscount] = useState(0);
  const [afterDisCombine, setAfterDisCombine] = useState(0);
  const [promotionMod, setPromotionMod] = useState(false);
  const [transformedData, setTransformedData] = useState("");
  const [stampCard, setStampCard] = useState(false);
  const [fominoCredits, setfominoCredits] = useState(false);
  const [selectedStampCard, setSelectedStampCard] = useState({});
  const [stampCardModal, setStampCardModal] = useState(false);
  const [feeWorks, setFeeWorks] = useState(false);
  const [inzone, setInzone] = useState("");
  const [offerType, setOfferType] = useState({
    offerType: "",
  });

  const { data: restaurantBanner } = GetAPI(
    `users/userStampsAndBannersForWeb?restaurantId=${resId}${
      userId ? `&userId=${userId}` : ""
    }`
  );

  // const combine = activeResData?.getConfiguration?.general?.combined;
  const combine = false;

  const findMatchedProducts = (cartItems, restaurantBanners) => {
    // Filter restaurantBanners based on the `how` key
    const filteredBanners = restaurantBanners?.filter((banner) => {
      const deliveryTypeName = banner.deliveryType?.name;
      if (deliveryData.how == 1 && deliveryTypeName == "Self-Pickup") {
        return false; // Exclude Pickup banners for Delivery mode
      }
      if (deliveryData.how == 2 && deliveryTypeName == "Delivery") {
        return false; // Exclude Delivery banners for Pickup mode
      }
      if (offerType?.offerType === "stampCard") {
        return false;
      }

      return true; // Include all others
    });

    const updatedCartItems = cartItems.map((cartItem) => {
      let allPromotionDetails = [];
      let updatedBannerDetails = { ...cartItem };

      // Calculate cart total for discount evaluation
      const cartTotal = cartItems.reduce((total, item) => {
        const addOnsTotal = item?.addOns?.reduce(
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
      const freeDeliveryPromotions = filteredBanners?.filter(
        (banner) =>
          banner.bannerType === "FreeDelivery" && banner.freeDeliveryDetail
      );

      freeDeliveryPromotions?.forEach((banner) => {
        const freeDeliveryDetail = banner.freeDeliveryDetail;
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
      const validDiscountPromotions = filteredBanners
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

      let bestDiscountPromotion = null;

      for (let i = 0; i < validDiscountPromotions?.length; i++) {
        const promotion = validDiscountPromotions[i];
        const discount = promotion.discountDetail;

        if (discount.allProducts) {
          bestDiscountPromotion = promotion;
          break;
        }

        const appliesToAny = cartItems.some((item) =>
          discount?.discountProducts?.some(
            (product) => product?.R_PLink?.id === item?.RPLinkId
          )
        );

        if (appliesToAny) {
          bestDiscountPromotion = promotion;
          break;
        }
      }

      // Filter and process BOGO promotions
      const bogoPromotions = filteredBanners
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
          const buyItemsQty = parseInt(bestBogoPromotion.deal?.buyItemsQty);
          const getItemsQty = parseInt(bestBogoPromotion.deal?.getItemsQty);
          let eligibleFreeItems = 0;

          if (
            !bestBogoPromotion.deal?.allProducts &&
            bestBogoPromotion.deal?.dealsProducts?.length
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
      filteredBanners?.forEach((banner) => {
        let promotionDetails = null;

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
          const allProducts = discountDetail?.allProducts;

          if (allProducts) {
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
          } else {
            const exist = discountDetail?.discountProducts?.some((item) => {
              return item?.R_PLink?.id === cartItem?.RPLinkId;
            });

            if (exist) {
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
            } else {
              if (discountDetail.discountType === "Percentage") {
                discountAmount = 0;
              } else if (discountDetail.discountType === "Flat") {
                discountAmount = 0;
              }
            }
          }

          if (!discountAmount) return;

          promotionDetails = {
            bannerType: "Discount",
            promotionScope: "all-product",
            discountType: discountDetail.discountType,
            discountValue: discountDetail.discountValue,
            minimumOrderValue: discountDetail.minimumOrderValue,
            capMaxDiscount: discountDetail.capMaxDiscount || null,
            restaurantBannerId: discountDetail?.restaurantBannerId,
            applied: discountAmount ? true : false,
            discountAmount,
          };

          // Calculate afterDiscount using Total and discountAmount
          const afterDiscount = discountAmount
            ? Math.max(cartItem.Total - discountAmount, 0)
            : null;

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

    return updatedCartItems?.filter((item) => item?.promotionDetails);
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
            quantity: addOn?.qty,
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
      // Find an existing item with the same base product (RPLinkId) and the same add-ons total
      const existingItem = uniqueItems?.find(
        (unique) =>
          unique?.RPLinkId === item?.RPLinkId &&
          unique?.addOns?.length === item?.addOns?.length &&
          unique?.addOns?.every(
            (uniqueAddOn, index) =>
              uniqueAddOn.name === item?.addOns[index]?.name &&
              uniqueAddOn.quantity === item?.addOns[index]?.quantity &&
              parseFloat(uniqueAddOn.total) ===
                parseFloat(item?.addOns[index]?.total)
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
  //   const { countryCode, city } = getCountryCode();
  const countryCode = localStorage.getItem("countryShortName");
  const city = localStorage.getItem("guestFormatAddress");
  const navigateTo = () => {
    let restaurantId = activeResData?.id;
    let businessName = activeResData?.name;
    let restType = activeResData?.restType;

    if (restType === "restaurant") {
      const slug = `${businessName
        .replace(/\s+/g, "-")
        .toLowerCase()}-res-${restaurantId}`;
      setTimeout(() => {
        navigate(
          `/${countryCode?.toLowerCase()}/${city?.toLowerCase()}/restaurants/${slug}`
        );
      }, 0);
    } else {
      const slug = `${businessName
        .replace(/\s+/g, "-")
        .toLowerCase()}-stores-${restaurantId}`;
      navigate(
        `/${countryCode?.toLowerCase()}/${city.toLowerCase()}/stores/${slug}`
      );
    }
  };
  const smallOrderFee = Number(localStorage.getItem("smallOrderFee") || "0");
  // const text = [
  //         {
  //           id: 152,
  //           title: "Discount 1",
  //           description: "guy ugu uhg",
  //           exDescription: null,
  //           image: null,
  //           days: null,
  //           startTime: null,
  //           endTime: null,
  //           dimension: "landscape",
  //           businessType: "1",
  //           bannerType: "Discount",
  //           offerType: "",
  //           startDate: "2024-12-25T00:00:00.000Z",
  //           endDate: "2025-02-28T00:00:00.000Z",
  //           isAdult: false,
  //           limit: 580,
  //           newCustomers: null,
  //           allCustomers: null,
  //           weeklySpends: null,
  //           status: true,
  //           createdAt: "2024-12-25T09:30:23.000Z",
  //           updatedAt: "2025-04-25T06:16:57.000Z",
  //           deliveryTypeId: 1,
  //           restaurantId: 56,
  //           deliveryType: {
  //             id: 1,
  //             name: "Delivery"
  //           },
  //           discountDetail: {
  //             id: 55,
  //             discountType: "Percentage",
  //             discountValue: "12",
  //             minimumOrderValue: 800,
  //             capMaxDiscount: 49,
  //             allProducts: null,
  //             createdAt: "2024-12-25T09:30:23.000Z",
  //             updatedAt: "2024-12-25T09:30:23.000Z",
  //             restaurantBannerId: 152,
  //             discountProducts: [{R_PLink:{id:712}}],
  //             excludeProducts: []
  //           },
  //           freeDeliveryDetail: null,
  //           deal: null
  //         },
  //         {
  //           id: 159,
  //           title: "bogo 1",
  //           description: "gym. gh gh hh hh hh",
  //           exDescription: null,
  //           image: null,
  //           days: null,
  //           startTime: null,
  //           endTime: null,
  //           dimension: "landscape",
  //           businessType: "1",
  //           bannerType: "BOGO",
  //           offerType: "",
  //           startDate: "2024-12-25T00:00:00.000Z",
  //           endDate: "2025-01-31T00:00:00.000Z",
  //           isAdult: false,
  //           limit: 580,
  //           newCustomers: null,
  //           allCustomers: null,
  //           weeklySpends: null,
  //           status: true,
  //           createdAt: "2024-12-25T09:40:16.000Z",
  //           updatedAt: "2024-12-25T09:40:16.000Z",
  //           deliveryTypeId: 1,
  //           restaurantId: 56,
  //           deliveryType: {
  //             id: 1,
  //             name: "Delivery"
  //           },
  //           discountDetail: null,
  //           freeDeliveryDetail: null,
  //           deal: {
  //             id: 36,
  //             buyItemsQty: "1",
  //             getItemsQty: "1",
  //             isAdult: null,
  //             allProducts: null,
  //             status: null,
  //             createdAt: "2024-12-25T09:40:16.000Z",
  //             updatedAt: "2024-12-25T09:40:16.000Z",
  //             restaurantBannerId: 159,
  //             dealsProducts: [{R_PLink :{id:712}}],
  //             dealsGetProducts: []
  //           }
  //         },
  //         {
  //           id: 226,
  //           title: "Free delivery ",
  //           description: "g GG GG g ",
  //           exDescription: null,
  //           image: "Public/Images/Driver/image-1745561678045-.jpg",
  //           days: null,
  //           startTime: null,
  //           endTime: null,
  //           dimension: "landscape",
  //           businessType: "1",
  //           bannerType: "FreeDelivery",
  //           offerType: "",
  //           startDate: "2025-04-25T00:00:00.000Z",
  //           endDate: "2025-04-26T00:00:00.000Z",
  //           isAdult: false,
  //           limit: 25,
  //           newCustomers: false,
  //           allCustomers: true,
  //           weeklySpends: "6.00",
  //           status: true,
  //           createdAt: "2025-04-25T06:14:38.000Z",
  //           updatedAt: "2025-04-25T06:14:38.000Z",
  //           deliveryTypeId: null,
  //           restaurantId: 56,
  //           deliveryType: null,
  //           discountDetail: null,
  //           freeDeliveryDetail: {
  //             id: 58,
  //             minimumOrderValue: 3,
  //             radius: 3,
  //             allProducts: true,
  //             createdAt: "2025-04-25T06:14:38.000Z",
  //             updatedAt: "2025-04-25T06:14:38.000Z",
  //             restaurantBannerId: 226,
  //             freeDeliveryProducts: [{R_PLink :{id:712}}],
  //             freeDeliveryExcludeProducts: [{R_PLink :{id:712}}]
  //           },
  //           deal: null
  //         }
  //       ]

  useEffect(() => {
    const transformed = transformData();

    if (cartItems?.length > 0) {
      const matchedProducts = findMatchedProducts(
        groupData ? transformed : cartItems,
        restaurantBanner?.data?.obj?.restaurantBanners ||
          activeResData?.restaurantBanners
      );

      const allFreeProducts = [];

      if (
        // matchedProducts?.length > 0 &&
        JSON.stringify(matchedProducts) !== JSON.stringify(priorityProduct)
      ) {
        setPriorityProduct(matchedProducts);
        setTransformedData(transformed);
        matchedProducts?.forEach((product) => {
          const bogoPromotions = product?.promotionDetails?.filter(
            (promotion) =>
              promotion?.bannerType === "BOGO" && promotion?.applied === true
          );

          if (bogoPromotions?.length > 0) {
            bogoPromotions.forEach((promotion) => {
              const freeProducts = product?.eligibleGetProducts[0];
              if (freeProducts) {
                allFreeProducts.push(freeProducts);
              }
            });
          }
        });

        // Store the best free products in state
        setAllFreeProducts(allFreeProducts);
        localStorage.setItem("getFree", JSON.stringify(allFreeProducts));
      }
    } else {
      localStorage.removeItem("getFree");
      setAllFreeProducts([]); // Clear the free products if the cart is empty

      gData ? "" : navigate("/");
    }
  }, [cartItems, restaurantBanner, priorityProduct]);

  const applySelectedPromotion = (
    availablePromotions,
    selectedPromotionType
  ) => {
    // Ensure valid selectedPromotionType (it should be one of 'BOGO', 'Discount', or 'FreeDelivery')
    if (!["BOGO", "Discount", "FreeDelivery"].includes(selectedPromotionType)) {
      throw new Error("Invalid promotion type provided.");
    }

    // Set applied to true for selected promotion type, and false for all others
    return availablePromotions.map((promotion) => {
      return {
        ...promotion,
        applied: promotion.bannerType === selectedPromotionType, // true if it matches the selected promotion type
      };
    });
  };

  const extractGlobalPromotions = (priorityProduct) => {
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
    globalPromotions.sort((a, b) => {
      return (
        (priorityOrder[a.bannerType] || Infinity) -
        (priorityOrder[b.bannerType] || Infinity)
      );
    });

    return globalPromotions;
  };
  const globalPromotions = extractGlobalPromotions(priorityProduct);

  const getTotalDiscount = (products, promotionType) => {
    let totalAfterDiscount = 0;

    products.forEach((product) => {
      product.promotionDetails?.forEach((promotion) => {
        if (
          promotionType === "Discount" &&
          promotion.bannerType === promotionType &&
          promotion.applied
        ) {
          totalAfterDiscount +=
            parseFloat(product.afterDiscount) ?? product.Total;
        }
      });
    });
    return totalAfterDiscount;
  };

  useEffect(() => {
    const totalDiscounted = getTotalDiscount(
      priorityProduct,
      selectedPromotion
    );

    setAfterDiscount(totalDiscounted);
    calculateRoute();
  }, [selectedPromotion, priorityProduct]);

  useEffect(() => {
    let totalDiscountCombine = 0;

    priorityProduct?.forEach((product) => {
      product.promotionDetails?.forEach((promotion) => {
        if (promotion?.bannerType === "Discount" && promotion.applied) {
          totalDiscountCombine += product?.Total - product.afterDiscount;
        }
      });
    });
    setAfterDisCombine(totalDiscountCombine);
  }, [priorityProduct]);

  // ========================Promotions End here=============================

  const [ready, setReady] = useState({
    show: 0,
    readyCount: 0,
    notReadyCount: 0,
  });
  const [group, setGroup] = useState({
    viewSelection: "",
    liShow: false,
    show: 0,
  });
  const getProfile = GetAPI(`users/getProfile/${userId}`);

  const [order, setOrder] = useState(() => {
    if (!cartItems || cartItems.length === 0) {
      return {
        orderId: null || JSON.parse(localStorage.getItem("groupData"))?.orderId,
        subTotal: 0,
        restaurantId: null || Number(localStorage.getItem("resId")),
        userId: null || Number(localStorage.getItem("userId")),
        voucherId: "",
        products: [],
        cutlery_data: [],
      };
    }

    const products = cartItems.map((item) => ({
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      RPLinkId: item.RPLinkId || null,
      name: item.name || "",
      image: item.image || "",
      addOns: item.addOns || [],
    }));

    // Calculate subtotal
    const currencySign = cartItems?.length > 0 ? cartItems[0].currencySign : "";

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

  function filterKeys(obj, keys) {
    const newObj = {};
    for (const key in obj) {
      if (!keys.includes(key)) {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }

  const navigate = useNavigate();

  const { data } = GetAPI("users/getCountriesAndCities");
  const dataAddress = GetAPI("users/alladdresses");

  let preAddress = dataAddress?.data?.data?.addressList?.find(
    (ele) =>
      ele.lat === localStorage.getItem("lat") &&
      ele.lng === localStorage.getItem("lng")
  );

  if (!preAddress && dataAddress?.data?.data?.addressList?.length > 0) {
    preAddress =
      dataAddress.data.data.addressList[
        dataAddress.data.data.addressList.length - 1
      ];
  }

  const [deliveryData, setDeliveryData] = useState({
    how: 1,
    where: 1,
    when: 1,
    howShow: false,
    whereShow: false,
    whenShow: false,
    schedule: "",
  });

  //   const [schedule, setSchedule] = useState({
  //     day: "",
  //     time: "",
  //     date: "",
  //   });

  const [schedule, setSchedule] = useState(() => {
    const day = localStorage.getItem("schedule_day");
    const time = localStorage.getItem("schedule_time");
    const date = localStorage.getItem("schedule_date");

    return {
      day: day ? JSON.parse(day) : "",
      time: time ? JSON.parse(time) : "",
      date: date || "",
    };
  });

  const [modal, setModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [modalScroll, setModalScroll] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [days, setDays] = useState([]);
  const [timeChunks, setTimeChunks] = useState([]);
  const [currentCoordinates, setCurrentCoordinates] = useState({
    lat: "",
    lng: "",
  });
  const [leaveAtDoor, setLeaveAtDoor] = useState(0);

  const handleLeaveAtDoor = () => {
    setLeaveAtDoor((prev) => (prev === 0 ? 1 : 0));
  };

  const [deliveryCharges, setDeliveryCharges] = useState({
    distance: "",
    distanceUnit: "",
    currencyUnit: "",
    packingFee: "",
    deliveryCharges: "",
    serviceCharges: "",
    VAT: "",
    updatedDeliveryCharges: null,
  });

  const [addressTab, setAddressTab] = useState(0);
  const [tip, setTip] = useState({
    tip: undefined,
    other: false,
  });
  const [isAbsolute, setIsAbsolute] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState({
    name: JSON.parse(localStorage.getItem("paymentMethod"))?.name || "",
    type: JSON.parse(localStorage.getItem("paymentMethod"))?.type || "",
  });

  const [paymentDetails, setpaymentDetails] = useState({
    cardNum: "4111111111111111",
    exp_month: "12",
    exp_year: "2025",
    cvc: "321",
    isCredit: "",
  });
  const [country, setCountry] = useState({
    // countries: {
    //   value: "",
    //   label: localStorage.getItem("countryName"),
    //   short: localStorage.getItem("countryShortName"),
    // },
    countries: null,
    selectedCountryShortName: localStorage.getItem("countryShortName"),
  });
  const [deliveryAddress, setDeliveryAddress] = useState({
    id: "",
    lat: "",
    lng: "",
    building: "",
    city: "",
    AddressType: "",
    locationType: "",
    state: "",
    streetAddress: "",
    zipCode: "",
    entrance: "",
    door: "",
    instructions: "",
    other: false,
  });

  const onChange = (e) => {
    setpaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleSelect = (name, type) => {
    setSelectedPayment({
      ...selectedPayment,
      name,
      type,
    });
    localStorage.setItem("paymentMethod", JSON.stringify({ name, type }));
  };

  const getCountries = [];
  data?.data?.countries?.map((countr, index) => {
    return getCountries.push({
      value: countr?.id,
      label: countr?.name,
      short: countr?.shortName,
    });
  });

  const closeAddressModal = () => {
    setAddressModal(false);
    setModalScroll(0);
    setAddressTab(0);
    setCountry({
      countries: {
        value: "",
        label: localStorage.getItem("countryName"),
        short: localStorage.getItem("countryShortName"),
      },
      selectedCountryShortName: localStorage.getItem("countryShortName"),
    });
    // setDeliveryAddress({
    //   id: "",
    //   lat: "",
    //   lng: "",
    //   building: "",
    //   city: "",
    //   AddressType: "",
    //   locationType: "",
    //   state: "",
    //   streetAddress: "",
    //   zipCode: "",
    //   entrance: "",
    //   door: "",
    //   instructions: "",
    // });
  };

  const handleModalScroll = (event) => {
    setModalScroll(event.target.scrollTop);
  };

  const normalizeTimeFormat = (time) => {
    return time.toLowerCase().replace("am", " AM").replace("pm", " PM");
  };

  const generateTimeChunks = (startTime, endTime, date) => {
    const currentDate = dayjs(date, "DD-MM-YYYY");
    const now = dayjs();
    const start = currentDate
      .hour(dayjs(normalizeTimeFormat(startTime.trim()), "h:mm").hour())
      .minute(dayjs(normalizeTimeFormat(startTime.trim()), "h:mm").minute())
      .second(0);
    const end = currentDate
      .hour(dayjs(normalizeTimeFormat(endTime.trim()), "h:mm").hour())
      .minute(dayjs(normalizeTimeFormat(endTime.trim()), "h:mm").minute())
      .second(0);
    let currentTime;
    if (currentDate.isSame(now, "day")) {
      const roundedMinutes = Math.ceil(now.minute() / 5) * 5;
      currentTime = now.minute(roundedMinutes).second(0);
      if (currentTime.isBefore(now)) {
        currentTime = currentTime.add(5, "minute");
      }
      if (currentTime.isBefore(start)) {
        currentTime = start;
      }
    } else {
      currentTime = start;
    }
    const times = [];
    let index = 1;
    let time = currentTime.isBefore(start) ? start : currentTime;
    while (time.isBefore(end) || time.isSame(end)) {
      times.push({ label: time.format("HH:mm"), value: index.toString() });
      time = time.add(5, "minute");
      index++;
    }
    if (time.isBefore(end.add(5, "minute"))) {
      times.push({ label: end.format("HH:mm"), value: index.toString() });
    }
    setTimeChunks(times);
  };

  function convertToISO(date, time) {
    const [day, month, year] = date.split("-");
    const [hours, minutes] = time.split(":");
    const dateTime = dayjs(
      `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`
    );
    const isoDate = dateTime.toISOString();
    return isoDate;
  }

  const checkCoupon = async () => {
    if (coupon === "") {
      info_toaster("Please enter Coupon Code");
    } else {
      let res = await PostAPI("users/applyvoucher", {
        code: coupon,
        userId: localStorage.getItem("userId"),
        restaurantId: localStorage.getItem("resId"),
      });
      if (res?.data?.status === "1") {
        success_toaster(res?.data?.message);
      } else {
        error_toaster(res?.data?.message);
      }
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (paymentDetails.cardNum === "") {
      info_toaster("Please Enter Card Num");
    } else if (paymentDetails.exp_month === "") {
      info_toaster("Please Enter Exp Month");
    } else if (paymentDetails.exp_year === "") {
      info_toaster("Please Enter Exp Year");
    } else if (paymentDetails.cvc === "") {
      info_toaster("Please Enter CVC");
    } else {
      setPaymentModal(false);
    }
  };

  const existingCartItems = JSON.parse(localStorage.getItem("cart")) || [];

  let totalPrice = existingCartItems?.reduce((accumulator, currentItem) => {
    const itemQuantity = currentItem.quantity;
    const itemUnitPrice = parseFloat(currentItem.unitPrice) || 0;
    const addonsTotal =
      currentItem?.addOns?.reduce((addonAccumulator, addon) => {
        return addonAccumulator + (addon?.total || 0) * (addon?.quantity || 1);
      }, 0) || 0;
    const itemTotalPrice = itemQuantity * (itemUnitPrice + addonsTotal);

    return accumulator + itemTotalPrice;
  }, 0);

  const usedPoints = stampCard
    ? Math.min(totalPrice, parseFloat(selectedStampCard?.value) || 0)
    : 0;
  let preTotalPrice = totalPrice;
  // Check if stampCard is true, and if so, apply the discount
  totalPrice = stampCard
    ? Math.max(0, totalPrice - (parseFloat(selectedStampCard?.value) || 0))
    : totalPrice;

  //For Group Item
  let totalReadySubTotal = gData?.participantList
    // ?.filter((participant) => participant.isReady)
    ?.reduce((sum, participant) => sum + participant?.subTotal, 0);

  const hostTotal = gData?.participantList
    ?.filter((participant) => {
      return (
        participant?.participantId == gData?.hostebBy?.id &&
        participant?.isReady
      );
    })
    ?.reduce((sum, participant) => {
      const subTotal = parseFloat(participant?.subTotal || 0);
      return sum + subTotal;
    }, 0);

  totalReadySubTotal = stampCard
    ? Math.max(
        0,
        totalReadySubTotal - (parseFloat(selectedStampCard?.value) || 0)
      )
    : totalReadySubTotal;

  //For Group Item  end
  const autocompleteRef = useRef(null);
  const getAddress = async () => {
    if (!autocompleteRef.current) {
      return null;
    }
    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry || !place.geometry.location) {
      info_toaster("Please search an address");
      return;
    }
    const latLng = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setDeliveryAddress({
      ...deliveryAddress,
      streetAddress: place?.formatted_address,
      city: place?.address_components[place?.address_components?.length - 3]
        ?.long_name,
      state:
        place?.address_components[place?.address_components?.length - 2]
          ?.long_name,
      building: place?.name,
      lat: latLng?.lat,
      lng: latLng?.lng,
    });
    setAddressTab(2);
    return null;
  };

  const calculateRoute = async () => {
    if (!deliveryAddress.lat || !deliveryAddress.lng) {
      return;
    }
    let radius = null;

    if (combine) {
      // Filter for FreeDelivery promotions with applied: true
      const freeDeliveryPromotions = priorityProduct
        .map((cartItem) => cartItem?.promotionDetails)
        .flat()
        .filter(
          (promo) =>
            promo?.bannerType === "FreeDelivery" && promo?.applied === true
        );
      // If a FreeDelivery promotion exists, get the radius from the first promotion
      if (freeDeliveryPromotions.length > 0) {
        radius = freeDeliveryPromotions[0]?.freeDeliveryDetail?.radius;
      }
    } else {
      const freeDeliveryPromotions = availablePromotions.find(
        (promo) =>
          promo?.bannerType === "FreeDelivery" && promo?.applied === true
      );

      radius = stampCard
        ? null
        : selectedPromotion === "FreeDelivery" &&
          freeDeliveryPromotions?.freeDeliveryDetail?.radius;
    }

    let res = await PostAPI("users/deliveryfee", {
      restaurantId: parseInt(localStorage.getItem("resId")),
      dropOffLat: parseFloat(deliveryAddress?.lat),
      dropOffLng: parseFloat(deliveryAddress?.lng),
      total: parseFloat(totalPrice),
      radius: radius !== null ? radius : "",
    });

    if (res?.data?.status === "1") {
      setDeliveryCharges({
        ...deliveryCharges,
        distance: res?.data?.data?.distance,
        distanceUnit: res?.data?.data?.distanceUnit,
        currencyUnit: res?.data?.data?.currencyUnit,
        packingFee: res?.data?.data?.packingFee,
        deliveryCharges: res?.data?.data?.deliveryCharges,
        serviceCharges: res?.data?.data?.serviceCharges,
        VAT: res?.data?.data?.VAT,
        updatedDeliveryCharges: res?.data?.data?.updatedDeliveryCharges,
      });
    } else {
      error_toaster(res?.data?.message);
    }
  };

  const handleAddAddress = async () => {
    if (deliveryAddress.entrance === "") {
      info_toaster("Please enter Entrance/Staircase");
    } else if (deliveryAddress.door === "") {
      info_toaster("Please enter Name/No on Door");
    } else if (deliveryAddress.AddressType === "") {
      info_toaster("Please select Address Label");
    } else {
      let res = await PostAPI("users/addaddress", {
        building: deliveryAddress.building,
        streetAddress: deliveryAddress?.streetAddress,
        city: deliveryAddress?.city,
        state: deliveryAddress?.state,
        zipCode: "",
        addressTypeId: "1",
        addressTypeText: deliveryAddress?.locationType,
        lat: deliveryAddress?.lat,
        lng: deliveryAddress?.lng,
        saveAddress: true,
        otherText: deliveryAddress?.instructions,
        nameOnDoor: deliveryAddress?.door,
        floor: "",
        entrance: deliveryAddress?.entrance,
        deliveryLocation: "",
        locationType: deliveryAddress?.locationType,
        AddressType: deliveryAddress?.AddressType,
        note: deliveryAddress?.instructions,
      });
      if (res?.data?.status === "1") {
        localStorage.setItem("lat", deliveryAddress?.lat);
        localStorage.setItem("lng", deliveryAddress?.lng);
        localStorage.setItem(
          "guestFormatAddress",
          `${deliveryAddress?.AddressType} (${deliveryAddress.building})`
        );

        setAddressTab(1);
        setAddressModal(false);
        success_toaster(res?.data?.message);
        dataAddress.reFetch();
      } else {
        error_toaster(res?.data?.message);
      }
    }
  };

  const createOrder = async (e) => {
    if (!localStorage.getItem("groupData")) {
      e.preventDefault();
      let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

      cartItems = cartItems?.map((item) => {
        if (String(item.RPLinkId).includes(".99")) {
          return {
            ...item,
            RPLinkId: parseInt(item.RPLinkId),
          };
        }
        return item;
      });

      if (!combine && selectedPromotion === "BOGO") {
        cartItems.push(...getFree);
      } else if (combine && getFree) {
        cartItems.push(...getFree);
      }
      if (deliveryData.how === 1 && deliveryAddress.id === "") {
        setDeliveryData({ ...deliveryData, how: 1 });
        localStorage.setItem("how", 1);
        setAddressModal(true);
      } else if (deliveryData.how === 1 && !activeResData?.driverAvailable) {
        info_toaster("Can't place delivery order driver unavailable");
      } else if (deliveryData.when === 2 && schedule.date === "") {
      } else if (deliveryData.how === 1 && inzone == false) {
        info_toaster("The address is outside of the delivery range.");
      } else if (deliveryData.when === 2 && schedule.date === "") {
        info_toaster("Please select Schedule Day");
      } else if (deliveryData.when === 2 && schedule.time === "") {
        info_toaster("Please select Schedule Time");
      } else if (!deliveryData?.when) {
        info_toaster("Please Add Delivery Type");
      } else if (selectedPayment?.name == "") {
        setPaymentModal(true);
        setFeeWorks(false);
      } else if (
        paymentDetails.cardNum === "" ||
        paymentDetails.exp_month === "" ||
        paymentDetails.exp_year === "" ||
        paymentDetails.cvc === ""
      ) {
        info_toaster("Please Enter Payment Details");
      } else {
        setDisabled(true);
        let freeItmprice = getFree?.reduce((sum, item) => {
          let totalPrice = item.Total ? parseFloat(item.Total) : 0;
          return sum + totalPrice;
        }, 0);

        const banIds = [];
        globalPromotions?.forEach((item) => {
          if (combine) {
            if (item?.bannerType === "FreeDelivery") {
              banIds.push({
                id: item?.freeDeliveryDetail?.restaurantBannerId,
                value: parseFloat(deliveryCharges?.deliveryCharges),
              });
            } else if (item?.bannerType === "BOGO") {
              banIds.push({
                id: item?.deal.restaurantBannerId,
                value: freeItmprice,
              });
            } else if (item?.bannerType === "Discount") {
              banIds.push({
                id: item?.restaurantBannerId,
                value:
                  totalPrice - parseFloat(afterDiscount || afterDisCombine),
              });
            }
          } else {
            if (
              selectedPromotion === "FreeDelivery" &&
              item?.bannerType === "FreeDelivery"
            ) {
              banIds.push({
                id: item?.freeDeliveryDetail?.restaurantBannerId,
                value: parseFloat(deliveryCharges?.deliveryCharges),
              });
            } else if (
              selectedPromotion === "BOGO" &&
              item?.bannerType === "BOGO"
            ) {
              banIds.push({
                id: item?.deal.restaurantBannerId,
                value: freeItmprice,
              });
            } else if (
              selectedPromotion === "Discount" &&
              item?.bannerType === "Discount"
            ) {
              banIds.push({
                id: item?.restaurantBannerId,
                value:
                  totalPrice - parseFloat(afterDiscount || afterDisCombine),
              });
            }
          }
        });

        let res = await PostAPI("users/addorder", {
          driverDeliveryFees: globalPromotions?.find(
            (item) => item?.bannerType === "FreeDelivery"
          )
            ? parseFloat(deliveryCharges?.deliveryCharges)
            : 0,
          paymentMethodName: selectedPayment?.name,
          scheduleDate:
            deliveryData.when === 1
              ? new Date().toISOString()
              : convertToISO(schedule.date, schedule.time.label),
          note: localStorage.getItem("note") ?? "",
          leaveOrderAt: 1,
          subTotal: combine
            ? afterDisCombine || totalPrice
            : afterDiscount || totalPrice,
          total:
            deliveryCharges?.deliveryCharges !== ""
              ? (combine
                  ? afterDisCombine || totalPrice
                  : afterDiscount || totalPrice) +
                parseInt(
                  deliveryCharges?.updatedDeliveryCharges !== null
                    ? deliveryCharges?.updatedDeliveryCharges
                    : deliveryData.how === 1
                    ? deliveryCharges?.deliveryCharges
                    : 0
                ) +
                parseInt(
                  deliveryData.how === 1
                    ? deliveryCharges?.serviceCharges
                    : activeResData?.service_charges
                ) +
                parseInt(deliveryCharges?.VAT) +
                parseInt(deliveryCharges?.packingFee) +
                (tip?.tip !== undefined ? tip?.tip : 0)
              : combine
              ? afterDisCombine ||
                totalPrice +
                  (deliveryData.how === 2
                    ? parseFloat(activeResData?.service_charges)
                    : 0)
              : afterDiscount ||
                totalPrice +
                  (deliveryData.how === 2
                    ? parseFloat(activeResData?.service_charges)
                    : 0),

          productsDiscount: 0,
          VAT: parseInt(deliveryCharges?.VAT),
          deliveryTypeId: deliveryData?.how,
          orderModeId: deliveryData?.when,
          paymentMethodId: selectedPayment?.name.includes("COD") ? 2 : 1,
          dropOffLat:
            deliveryData?.how === 1
              ? parseFloat(deliveryAddress?.lat)
              : currentCoordinates.lat || "31.5204",
          dropOffLng:
            deliveryData?.how === 1
              ? parseFloat(deliveryAddress?.lng)
              : currentCoordinates.lng || "74.3587",
          building: deliveryAddress?.building,
          streetAddress: deliveryAddress?.streetAddress,
          distance: parseFloat(deliveryCharges?.distance || 0),
          distanceUnit: deliveryCharges?.distanceUnit,
          restaurantId: parseInt(localStorage.getItem("resId")),
          userId: parseInt(localStorage.getItem("userId")),
          voucherId: "",
          orderType: 2,
          deliveryFees:
            deliveryCharges?.deliveryCharges !== ""
              ? deliveryCharges?.updatedDeliveryCharges !== null
                ? deliveryCharges?.updatedDeliveryCharges
                : parseInt(deliveryCharges?.deliveryCharges)
              : 0,
          serviceCharges:
            deliveryData?.how == "1"
              ? deliveryCharges?.serviceCharges !== ""
                ? parseInt(deliveryCharges?.serviceCharges)
                : 0
              : activeResData?.service_charges,
          tip: tip?.tip !== undefined ? tip?.tip : 0,
          products: cartItems.map((item) =>
            filterKeys(item, ["addOnsCat", "description", "currencySign"])
          ),
          cutlery_data: {
            cutleryId: 1,
            qty: 3,
          },
          bannerIds: banIds,
          isStampCard: stampCard ? true : false,
          pointsId: selectedStampCard?.id || null,
          stampCardId: restaurantBanner?.data?.obj?.stampCard?.stampCardId,
          stampPoints: usedPoints,
          bannerDiscount:
            combine == false
              ? selectedPromotion === "Discount"
                ? totalPrice - (afterDiscount || afterDisCombine)
                : selectedPromotion === "BOGO"
                ? freeItmprice
                : selectedPromotion === "freeDelivery" &&
                  deliveryCharges?.deliveryCharges
              : parseFloat(
                  globalPromotions?.some((itm) =>
                    itm?.bannerType?.includes("Discount")
                  )
                    ? totalPrice
                    : 0
                ) -
                parseFloat(afterDiscount || afterDisCombine) +
                parseFloat(freeItmprice) +
                parseFloat(
                  globalPromotions?.some((itm) =>
                    itm?.bannerType?.includes("FreeDelivery")
                  )
                    ? deliveryCharges?.deliveryCharges
                    : 0
                ),
          credits: parseFloat(localStorage.getItem("credits")),
        });

        if (res?.data?.status === "1") {
          if (localStorage.getItem("orderId") == res?.data?.data?.orderId) {
          } else {
            localStorage.setItem("statusHistory", JSON.stringify([]));
          }
          localStorage.setItem(
            "type",
            deliveryData?.how == 1 ? "Delivery" : "Self-Pickup"
          );
          localStorage.setItem(
            "mod",
            deliveryData?.when == 1 ? "Standard" : "Scheduled"
          );
          setGData("");
          localStorage.setItem("orderId", res?.data?.data?.orderId);
          localStorage.setItem("driverId", false);
          localStorage.setItem("connect", true);
          localStorage.setItem("his", false);
          localStorage.setItem("eta_text", "");
          localStorage.removeItem("refund");
          localStorage.removeItem("replace");
          localStorage.removeItem("credits");
          selectedPayment?.name.includes("COD")
            ? navigate("/timeline")
            : (window.location.href = `${BASE_URL}adyen/${res?.data?.data?.orderId}/${selectedPayment?.type}`);
        }

        const restaurantId = localStorage.getItem("resId");
        let cart = JSON.parse(localStorage.getItem("cartItem")) || {};
        // Remove the restaurant from the cart
        if (cart[`id_${restaurantId}`]) {
          delete cart[`id_${restaurantId}`];
          localStorage.setItem("cartItem", JSON.stringify(cart));
        } else {
          error_toaster(res?.data?.message);
          setDisabled(true);
        }
      }
    } else {
      // Validation checks for group order
      if (!selectedPayment?.name) {
        info_toaster("Please select Payment Method");
        return false;
      } else if (totalReadySubTotal < 0) {
        info_toaster("Please add items to place group order");
        return false;
      }

      // else if (
      //   gData?.participantList &&
      //   gData?.participantList?.some((participant) => !participant.isReady)
      // ) {
      //   info_toaster(
      //     "All participants must be ready before placing the group order"
      //   );
      //   return false;
      // }

      let updatedCartItems = [...transformedData];

      getFree && selectedPromotion == "BOGO" && !combine
        ? updatedCartItems.push(...getFree)
        : updatedCartItems;

      // Calculate order total for group order
      const orderTotal =
        fee?.deliveryCharges !== ""
          ? parseInt(fee?.deliveryCharges) +
            parseInt(fee?.serviceCharges) +
            parseInt(fee?.VAT) +
            parseInt(fee?.packingFee)
          : 0;

      if (!orderTotal) {
        error_toaster("Order total cannot be zero.");
        return false;
      }

      // Prepare group order data
      const groupOrderData = {
        paymentMethodName: selectedPayment?.name,
        orderId: order?.orderId,
        scheduleDate:
          deliveryData.when === 1
            ? new Date().toISOString()
            : convertToISO(schedule.date, schedule.time.label),
        note: deliveryAddress?.instructions || "",
        leaveOrderAt: leaveAtDoor,
        subTotal: combine
          ? afterDisCombine || totalReadySubTotal
          : afterDiscount || totalReadySubTotal,
        total:
          deliveryData?.how == 1
            ? (fee?.deliveryCharges !== ""
                ? (deliveryCharges?.deliveryCharges
                    ? deliveryCharges?.updatedDeliveryCharges !== null
                      ? parseInt(deliveryCharges.updatedDeliveryCharges)
                      : parseInt(deliveryCharges.deliveryCharges)
                    : 0) +
                  parseInt(fee?.serviceCharges) +
                  parseInt(fee?.VAT) +
                  parseInt(fee?.packingFee)
                : 0) +
              (combine
                ? afterDisCombine || totalReadySubTotal
                : afterDiscount || totalReadySubTotal)
            : combine
            ? afterDisCombine || totalReadySubTotal
            : afterDiscount || totalReadySubTotal,
        productsDiscount: 0,
        VAT: fee?.VAT,
        deliveryTypeId: deliveryData?.how
          ? deliveryData?.how
          : gData?.deliveryTypeId,
        orderModeId: deliveryData?.when
          ? deliveryData?.when
          : gData?.orderModeId,
        paymentMethodId: selectedPayment?.name.includes("COD") ? 2 : 1,
        dropOffLat: deliveryAddress?.lat
          ? deliveryAddress?.lat
          : gData?.dropOffAddress?.lat,
        dropOffLng: deliveryAddress?.lng
          ? deliveryAddress?.lng
          : gData?.dropOffAddress?.lng,
        building: deliveryAddress?.building ? deliveryAddress?.building : "",
        streetAddress: deliveryAddress?.streetAddress
          ? deliveryAddress?.streetAddress
          : gData?.dropOffAddress?.streetAddress,
        distance: gData?.distance,
        distanceUnit: fee?.distanceUnit,
        restaurantId: gData?.restaurant?.id,
        userId: gData?.hostebBy?.id,
        voucherId: "",
        orderType: 1,
        deliveryFees: fee?.deliveryCharges,
        serviceCharges: fee?.serviceCharges,
        products: updatedCartItems || order?.products,
        cutlery_data: [],
        isStampCard: stampCard ? true : false,
        pointsId: selectedStampCard?.id || null,
        stampCardId: restaurantBanner?.data?.obj?.stampCard?.stampCardId,
        stampPoints: usedPoints,
        isRefund: localStorage.getItem("refund") ? true : false,
        replace:
          localStorage.getItem("replace") == "." ||
          !localStorage.getItem("replace")
            ? null
            : localStorage.getItem("replace"),
        credits: localStorage.getItem("credits"),
      };

      // API call for group order
      const res = await PostAPI("users/placeGroupOrder", groupOrderData);

      if (res?.data?.status === "1") {
        if (localStorage.getItem("orderId") !== res?.data?.data?.orderId) {
          localStorage.setItem("statusHistory", JSON.stringify([]));
        }
        localStorage.setItem("orderId", res?.data?.data?.orderId);
        localStorage.setItem("connect", true);
        localStorage.setItem("his", false);
        localStorage.removeItem("refund");
        localStorage.removeItem("credits");
        localStorage.removeItem("replace");
        // selectedPayment?.name.includes("COD") ? navigate("/timeline") : "";
        navigate("/timeline");
        // (window.location.href = `${BASE_URL}adyen/${res?.data?.data?.orderId}/${selectedPayment?.type}`);
      } else {
        error_toaster(res?.data?.message);
      }
    }
  };

  const origin = {
    lat: parseFloat(activeResData?.lat),
    lng: parseFloat(activeResData?.lng),
  };

  const destination = {
    lat: parseFloat(localStorage.getItem("lat")),
    lng: parseFloat(localStorage.getItem("lng")),
  };

  const calculateRoute1 = () => {
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(origin);
          bounds.extend(destination);
          mapRef.current.fitBounds(bounds);
        } else {
          console.error(`Error fetching directions: ${result}`);
        }
      }
    );
  };

  const countriesRestriction = {
    componentRestrictions: { country: [`${country.selectedCountryShortName}`] },
  };

  const svgIcon =
    deliveryData.how === 1
      ? `<svg  xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="106" height="118" viewBox="0 0 106 118"><defs>
    <linearGradient id="c" x1="50%" x2="50%" y1="0%" y2="100%">
      <stop offset="0%" stopColor="#fff" stopOpacity=".12"></stop>
      <stop offset="100%" stopColor="#202125" stopOpacity=".12"></stop>
    </linearGradient>
    <circle id="b" cx="12" cy="12" r="8"></circle>
    <filter id="a" width="150%" height="162.5%" x="-25%" y="-25%" filterUnits="objectBoundingBox">
      <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
      <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="1"></feGaussianBlur>
      <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
      <feColorMatrix
        in="shadowBlurOuter1"
        result="shadowMatrixOuter1"
        values="0 0 0 0 0.125490196 0 0 0 0 0.129411765 0 0 0 0 0.145098039 0 0 0 0.24 0"
      ></feColorMatrix>
      <feOffset in="SourceAlpha" result="shadowOffsetOuter2"></feOffset>
      <feGaussianBlur in="shadowOffsetOuter2" result="shadowBlurOuter2" stdDeviation="1"></feGaussianBlur>
      <feComposite in="shadowBlurOuter2" in2="SourceAlpha" operator="out" result="shadowBlurOuter2"></feComposite>
      <feColorMatrix
        in="shadowBlurOuter2"
        result="shadowMatrixOuter2"
        values="0 0 0 0 0.125490196 0 0 0 0 0.129411765 0 0 0 0 0.145098039 0 0 0 0.12 0"
      ></feColorMatrix>
      <feMerge>
        <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
        <feMergeNode in="shadowMatrixOuter2"></feMergeNode>
      </feMerge>
    </filter>
    <filter id="d" width="115.7%" height="131.3%" x="-7.8%" y="-15.6%" filterUnits="objectBoundingBox">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2"></feGaussianBlur>
    </filter>
    <linearGradient id="g" x1="50%" x2="50%" y1="0%" y2="100%">
      <stop offset="0%" stopColor="black" stopOpacity=".12"></stop>
      <stop offset="100%" stopColor="black" stopOpacity="0"></stop>
    </linearGradient>
    <path id="f" d="M53.296 103.47c3.331 0 39.973-30.04 39.973-60.08 0-22.12-17.897-40.052-39.973-40.052S13.324 21.27 13.324 43.39c0 30.04 36.641 60.08 39.972 60.08z"></path>
    <filter id="e" width="110%" height="108%" x="-5%" y="-2%" filterUnits="objectBoundingBox">
      <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
      <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="1"></feGaussianBlur>
      <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
      <feColorMatrix
        in="shadowBlurOuter1"
        values="0 0 0 0 0.125490196 0 0 0 0 0.129411765 0 0 0 0 0.145098039 0 0 0 0.24 0"
      ></feColorMatrix>
    </filter>
    <path id="h" d="M33.31 66.755c18.397 0 33.31-14.944 33.31-33.378C66.62 14.944 51.707 0 33.31 0v33.377H0c0 18.434 14.913 33.378 33.31 33.378z"></path>
  </defs>
  <g fill="none" fillRule="evenodd">
    <g transform="translate(41.296 91.444)">
      <use fill="blue" filter="url(#a)" xlinkHref="#b"></use>
      <use fill="blue" xlinkHref="#b"></use>
      <circle cx="12" cy="12" r="7" fill="#009de0" stroke="white" strokeLinejoin="square" strokeWidth="1.5"></circle>
    </g>
    <path fill="lightGray" fillOpacity=".12" d="M53.296 100.132c3.193 0 38.307-11.515 38.307-23.03 0-8.48-17.15-15.354-38.307-15.354-21.156 0-38.306 6.874-38.306 15.353 0 11.516 35.114 23.03 38.306 23.03z" filter="url(#d)"></path>
    <use fill="white" filter="url(#e)" xlinkHref="#f"></use>
    <path fill="white" stroke="lightGray" strokeLinejoin="square" strokeWidth=".5" d="M53.296 103.22c2.094 0 12.87-9.07 21.045-18.687C85.945 70.883 93.02 56.602 93.02 43.39c0-21.982-17.785-39.802-39.723-39.802S13.574 21.408 13.574 43.39c0 13.212 7.074 27.494 18.678 41.143 8.175 9.617 18.95 18.686 21.044 18.686z"></path>
    <g transform="translate(19.986 10.013)">
      <g fill="none" strokeWidth="10">
        <circle cx="33" cy="33" r="32" stroke="lightGray" fill="var(--cb-color-bg)"></circle>
        <path
          d="M 49 60.712812921102035 A 32 32 0 0 0 33 1"
            stroke="rgba(0, 150, 0, 1)"
         strokeDasharray="83.77580409572782"
         strokeDashoffset="167.55160819145564"
        ></path>
      </g>
      <g>
        <text
          fill="black"
   style="font-family: 'Omnes', sans-serif; font-size: 25px; font-weight: bold;"

          transform="translate(0 14.124)"
        >
          <tspan x="18" y="20" textAnchor="middle">
       ${
         deliveryData.how === 1
           ? activeResData?.deliveryTime?.split(" ")[0]
           : activeResData?.pickupTime?.split(" ")[0]
       }
          </tspan>
        </text>
        <text
          fill="gray"
        style="font-family: 'Omnes', sans-serif; font-size: 14px; font-weight: semibold;"

          transform="translate(0 14.124)"
        >
          <tspan x="19.007" y="35.595">
            MIN
          </tspan>
        </text>
      </g>
    </g>
  </g>
 </svg>`
      : `<svg  xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="106" height="118" viewBox="0 0 106 118">
  <defs>
    <linearGradient id="c" x1="50%" x2="50%" y1="0%" y2="100%">
      <stop offset="0%" stopColor="#fff" stopOpacity=".12"></stop>
      <stop offset="100%" stopColor="#202125" stopOpacity=".12"></stop>
    </linearGradient>
    <circle id="b" cx="12" cy="12" r="8"></circle>
    <filter id="a" width="150%" height="162.5%" x="-25%" y="-25%" filterUnits="objectBoundingBox">
      <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
      <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="1"></feGaussianBlur>
      <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
      <feColorMatrix
        in="shadowBlurOuter1"
        result="shadowMatrixOuter1"
        values="0 0 0 0 0.125490196 0 0 0 0 0.129411765 0 0 0 0 0.145098039 0 0 0 0.24 0"
      ></feColorMatrix>
      <feOffset in="SourceAlpha" result="shadowOffsetOuter2"></feOffset>
      <feGaussianBlur in="shadowOffsetOuter2" result="shadowBlurOuter2" stdDeviation="1"></feGaussianBlur>
      <feComposite in="shadowBlurOuter2" in2="SourceAlpha" operator="out" result="shadowBlurOuter2"></feComposite>
      <feColorMatrix
        in="shadowBlurOuter2"
        result="shadowMatrixOuter2"
        values="0 0 0 0 0.125490196 0 0 0 0 0.129411765 0 0 0 0 0.145098039 0 0 0 0.12 0"
      ></feColorMatrix>
      <feMerge>
        <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
        <feMergeNode in="shadowMatrixOuter2"></feMergeNode>
      </feMerge>
    </filter>
    <filter id="d" width="115.7%" height="131.3%" x="-7.8%" y="-15.6%" filterUnits="objectBoundingBox">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2"></feGaussianBlur>
    </filter>
    <linearGradient id="g" x1="50%" x2="50%" y1="0%" y2="100%">
      <stop offset="0%" stopColor="black" stopOpacity=".12"></stop>
      <stop offset="100%" stopColor="black" stopOpacity="0"></stop>
    </linearGradient>
    <path id="f" d="M53.296 103.47c3.331 0 39.973-30.04 39.973-60.08 0-22.12-17.897-40.052-39.973-40.052S13.324 21.27 13.324 43.39c0 30.04 36.641 60.08 39.972 60.08z"></path>
    <filter id="e" width="110%" height="108%" x="-5%" y="-2%" filterUnits="objectBoundingBox">
      <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
      <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="1"></feGaussianBlur>
      <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
      <feColorMatrix
        in="shadowBlurOuter1"
        values="0 0 0 0 0.125490196 0 0 0 0 0.129411765 0 0 0 0 0.145098039 0 0 0 0.24 0"
      ></feColorMatrix>
    </filter>
    <path id="h" d="M33.31 66.755c18.397 0 33.31-14.944 33.31-33.378C66.62 14.944 51.707 0 33.31 0v33.377H0c0 18.434 14.913 33.378 33.31 33.378z"></path>
  </defs>
  <g fill="none" fillRule="evenodd">
    <g transform="translate(41.296 91.444)">
      <use fill="blue" filter="url(#a)" xlinkHref="#b"></use>
      <use fill="blue" xlinkHref="#b"></use>
      <circle cx="12" cy="12" r="10" fill="#00c04b" stroke="white" strokeLinejoin="square" strokeWidth="2"></circle>
    </g>
    <path fill="lightGray" fillOpacity=".12" d="M53.296 100.132c3.193 0 38.307-11.515 38.307-23.03 0-8.48-17.15-15.354-38.307-15.354-21.156 0-38.306 6.874-38.306 15.353 0 11.516 35.114 23.03 38.306 23.03z" filter="url(#d)"></path>
    <use fill="white" filter="url(#e)" xlinkHref="#f"></use>
    <path fill="white" stroke="lightGray" strokeLinejoin="square" strokeWidth=".5" d="M53.296 103.22c2.094 0 12.87-9.07 21.045-18.687C85.945 70.883 93.02 56.602 93.02 43.39c0-21.982-17.785-39.802-39.723-39.802S13.574 21.408 13.574 43.39c0 13.212 7.074 27.494 18.678 41.143 8.175 9.617 18.95 18.686 21.044 18.686z"></path>
    <g transform="translate(19.986 10.013)">
      <g fill="none" strokeWidth="10">
        <circle cx="33" cy="33" r="32" stroke="lightGray" fill="var(--cb-color-bg)"></circle>
        <path
          d="M 49 60.712812921102035 A 32 32 0 0 0 33 1"
            stroke="rgba(0, 150, 0, 1)"
         strokeDasharray="83.77580409572782"
         strokeDashoffset="167.55160819145564"
        ></path>
      </g>
      <g>
        <text
          fill="black"
   style="font-family: 'Omnes', sans-serif; font-size: 25px; font-weight: bold;"

          transform="translate(0 14.124)"
        >
          <tspan x="18" y="20" textAnchor="middle">
       ${
         deliveryData.how === 1
           ? activeResData?.deliveryTime?.split(" ")[0]
           : activeResData?.pickupTime?.split(" ")[0]
       }
          </tspan>
        </text>
        <text
          fill="gray"
        style="font-family: 'Omnes', sans-serif; font-size: 14px; font-weight: semibold;"

          transform="translate(0 14.124)"
        >
          <tspan x="19.007" y="35.595">
            MIN
          </tspan>
        </text>
      </g>
    </g>
  </g>
 </svg>`;
  const iconUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgIcon)}`;

  if (globalPromotions?.length > 0 && !choose && !selectedPromotion) {
    const banner = globalPromotions[0]?.bannerType;

    const updatedPromotions = applySelectedPromotion(globalPromotions, banner);
    setAvailablePromotions(updatedPromotions);
    setSelectedPromotion(banner);
    setChoose(banner);
  }

  const checkZone = async () => {
    const lat = deliveryAddress?.lat;
    const lng = deliveryAddress?.lng;
    const loc = { lat, lng };

    const response = await findZoneByCoordinates(
      activeResData?.coordinates,
      "cart",
      loc
    );
    setInzone(response);
  };

  useEffect(() => {
    if (
      !gData &&
      cartItems?.length === 0 &&
      !localStorage.getItem("groupData")
    ) {
      navigate("/");
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentCoordinates({
            ...currentCoordinates,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    const today = new Date();
    const dayNames = [];
    const getDayName = (date) => {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    };
    const getLabel = (index) => {
      if (index === 0) return "Today";
      if (index === 1) return "Tomorrow";
      return getDayName(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + index)
      );
    };
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      dayNames.push({
        value: getDayName(currentDate),
        label: getLabel(i),
      });
    }
    setDays(dayNames);

    if (localStorage.getItem("how") || localStorage.getItem("when")) {
      setDeliveryData({
        ...deliveryData,
        how: parseInt(localStorage.getItem("how"))
          ? parseInt(localStorage.getItem("how"))
          : 1,
        when: parseInt(localStorage.getItem("when")) || 1,
      });
    }
  }, []);

  useEffect(() => {
    if (preAddress && deliveryData.how === 1) {
      setDeliveryAddress({
        ...deliveryAddress,
        id: preAddress?.id,
        lat: preAddress?.lat,
        lng: preAddress?.lng,
        building: preAddress?.building,
        city: preAddress?.city,
        AddressType: preAddress?.AddressType,
        locationType: preAddress?.locationType,
        state: preAddress?.state,
        streetAddress: preAddress?.streetAddress,
        zipCode: preAddress?.zipCode,
        instructions: preAddress?.note,
      });
      calculateRoute();
    }
  }, [preAddress, deliveryData.how]);

  useEffect(() => {
    checkZone();
    const timeoutId = setTimeout(() => {
      calculateRoute();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [deliveryAddress?.lat]);

  //   useEffect(() => {
  //     if (changedItems) {
  //       setStockChange(true);
  //       console.log("****************** helo");
  //     }
  //     checkStock();
  //   }, []);

  const PayM = GetAPI("adyen/getPaymentMethods");

  const inputStyle =
    " font-sf w-full resize-none font-normal text-base text-theme-black-2 rounded-lg py-3 px-4 bg-white border-2 border-theme-gray-12 placeholder:text-black placeholder:text-opacity-40 focus:outline-none focus:border-2 focus:border-green-700 hover:border-2 hover:border-green-700 hover:cursor-pointer";

  const [currentPosition, setCurrentPosition] = useState({
    lat: 0,
    lng: 0,
  });
  const [hasPositionChanged, setHasPositionChanged] = useState(false);

  useEffect(() => {
    if (deliveryAddress?.lat && deliveryAddress?.lng) {
      setCurrentPosition({
        lat: deliveryAddress.lat,
        lng: deliveryAddress.lng,
      });
    }
  }, [deliveryAddress]);

  const handleDragEnd = () => {
    const newCenter = mapRef.current.getCenter();
    setCurrentPosition({
      lat: newCenter.lat(),
      lng: newCenter.lng(),
    });
    setHasPositionChanged(true);
  };
  const mapRef = useRef(null);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  //Not ready function call
  const notReady = async () => {
    let res = await PostAPI("users/notReady", {
      orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
      userId: Number(localStorage.getItem("userId")),
    });
    if (res?.data?.status === "1") {
      navigate(
        `/${countryCode ? countryCode : "pk"}/group-order/${
          groupData?.orderId
        }/join`,
        {
          state: { g: true },
        }
      );
    }
  };

  //Joining the group/Host
  const joinGroup = async () => {
    if (groupData || groupData?.orderId) {
      const res = await PostAPI("users/joinGroup", {
        orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
        subTotal: order?.subTotal,
        restaurantId: Number(localStorage.getItem("resId")),
        userId: Number(localStorage.getItem("userId")),
        voucherId: "",
        products: order?.products,
        cutlery_data: [],
      });

      if (res?.data?.status === "1") {
        localStorage.setItem("hasJoinedGroup", true);
      } else {
        error_toaster("group has not joined yet");
      }
    }
  };

  //Getting Group Details Here
  const groupDets = async () => {
    let res = await PostAPI("users/groupOrderDetails", {
      orderId: JSON.parse(localStorage.getItem("groupData"))?.orderId,
    });
    if (res?.data?.status === "1") {
      setGData(res?.data?.data);
    }
  };

  //handle stamp change function

  const handleStampChange = () => {
    setStampCard((prev) => (prev == true ? false : true));

    if (stampCard) {
      setOfferType({ ...offerType, offerType: "banner" });
    } else {
      setOfferType({ ...offerType, offerType: "stampCard" });
      setSelectedPromotion(null);
    }
  };

  const handleFominoCredits = () => {
    setfominoCredits((prev) => (prev == true ? false : true));
  };

  const clickMeRef = useRef();

  useEffect(() => {
    if (!localStorage.getItem("hasJoinedGroup") && clickMeRef.current) {
      clickMeRef.current.click();
    }

    groupDets();
    //fee
    if (gData) {
      const fee = async () => {
        let res = await PostAPI("users/deliveryfee", {
          restaurantId: Number(gData?.restaurant?.id),
          dropOffLat: gData?.dropOffAddress?.lat,
          dropOffLng: gData?.dropOffAddress?.lng,
          total: 0,
        });
        if (res?.data?.status === "1") {
          setFee(res?.data?.data);
        }
      };
      fee();
    }

    // Set the highest (first created) stamp card in state based on the createdAt key
    const firstCreatedStamp = restaurantBanner?.data?.obj?.stampCardPoints
      ?.filter((elem) => elem?.value != 0)
      ?.reduce(
        (earliest, current) => {
          const earliestCreatedAt = new Date(earliest.createdAt); // Convert to Date object
          const currentCreatedAt = new Date(current.createdAt); // Convert to Date object

          return currentCreatedAt < earliestCreatedAt ? current : earliest;
        },
        { createdAt: "9999-12-31T23:59:59Z" } // Default to a far future date, so any valid createdAt will be earlier
      );

    setSelectedStampCard(firstCreatedStamp);
  }, [restaurantBanner, clickMeRef.current]);

  const paymentMethods = [
    ...(PayM?.data?.data?.simplifiedPaymentMethods ?? []),
    ...(!!JSON.parse(localStorage.getItem("activeResData") || "null")
      ?.getConfiguration?.general?.cod &&
    !(PayM?.data?.data?.simplifiedPaymentMethods ?? []).some(
      (m) => (m?.type ?? "").toLowerCase() === "cod"
    )
      ? [{ name: "COD", type: "cod" }]
      : []),
  ];

  useEffect(() => {
    if (addressModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [addressModal]);

  const [availability, setAvailability] = useState({});
  const prevHowRef = useRef(null);
  const [buttonStates, setButtonStates] = useState({
    disableDelivery: true,
    disablePickup: true,
    disableStandard: true,
    disableSchedule: true,
  });
  useEffect(() => {
    if (!activeResData) return;

    const availability = getRestaurantOrderAvailability(activeResData);
    const disableDelivery = !(
      availability.canDeliverStandard || availability.canDeliverSchedule
    );
    const disablePickup = !(
      availability.canPickupStandard || availability.canPickupSchedule
    );

    const disableStandard =
      deliveryData.how === 1
        ? !availability.canDeliverStandard
        : !availability.canPickupStandard;

    const disableSchedule =
      deliveryData.how === 1
        ? !availability.canDeliverSchedule
        : !availability.canPickupSchedule;

    setAvailability(availability);
    setButtonStates({
      disableDelivery,
      disablePickup,
      disableStandard,
      disableSchedule,
    });
    const previousHow = prevHowRef.current;
    if (previousHow !== deliveryData.how && !disableStandard) {
      setDeliveryData((prev) => ({ ...prev, type: 1, when: 1 }));
      localStorage.setItem("when", "1");
    }
    prevHowRef.current = deliveryData.how;
    if (disableDelivery && !disablePickup && deliveryData.how === 1) {
      setDeliveryData((prev) => ({ ...prev, how: 2 }));
    }

    if (disableStandard && !disableSchedule && deliveryData.type === 1) {
      setDeliveryData((prev) => ({ ...prev, type: 2 }));
    }
    if (disableStandard && !disableSchedule && deliveryData.when === 1) {
      setDeliveryData((prev) => ({ ...prev, when: 2 }));
      localStorage.setItem("when", "2");
    }
  }, [deliveryData.how, deliveryData.when, deliveryData.type]);

  // Add loading state for context
  if (!context) {
    return <Loader />;
  }

  return PayM?.data?.length === 0 ? (
    <Loader />
  ) : (
    <>
      {/* <Modal
        onClose={() => {
          setModal(false);
          setDeliveryData({
            ...deliveryData,
            howShow: false,
            whereShow: false,
            whenShow: false,
          });
        }}
        isOpen={modal}
        isCentered
        size="xl"
        blockScrollOnMount={addressModal ? false : true}
      >
        <ModalOverlay />
        <ModalContent
         borderRadius="20px"
         maxW={["510px", "510px", "600px"]}
         className="modal-content-custom"
        >
          <ModalCloseButton />
          <ModalHeader>
            <h5 className="font-omnes font-black text-theme-black-2 text-[28px] text-center">
              Select order details
            </h5>
          </ModalHeader>
          <ModalBody padding={0}>
            <div className="font-sf max-h-[calc(100vh-200px)] h-auto overflow-auto pt-8 pb-3 space-y-7">
              {deliveryData.how === 1 && (
                <>
                  <div className="px-4">
                    <div className="space-y-5  ">
                      <h4 className="text-2xl text-theme-black-2 font-omnes font-black">
                        Where to?
                      </h4>
                      {dataAddress?.data?.data?.addressList
                        ?.filter(
                          (fil) =>
                            fil.AddressType &&
                            fil.AddressType.toString().length > 0
                        )
                        ?.map((addr, index) => (
                          <>
                            <div
                              key={index}
                              className="flex items-center gap-x-3"
                            >
                              <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 bg-theme-gray-4">
                                {addr?.AddressType === "Home" ? (
                                  <IoHome size={28} />
                                ) : addr?.AddressType === "Work" ? (
                                  <ImOffice size={24} />
                                ) : addr?.AddressType === "Other" ? (
                                  <MdEditCalendar size={24} />
                                ) : (
                                  <></>
                                )}
                              </button>
                              <div className="flex justify-between gap-x-5 items-center w-full">
                                <div>
                                  <p className="text-lg font-semibold">
                                    {addr?.AddressType}
                                  </p>
                                  <div className="text-xs font-medium text-black text-opacity-40">
                                    {`${addr?.building}, ${addr?.streetAddress}`}
                                  </div>
                                </div>
                                {addr?.lat !== localStorage.getItem("lat") &&
                                addr?.lng !== localStorage.getItem("lng") ? (
                                  <button
                                    onClick={() => {
                                      localStorage.setItem("lat", addr?.lat);
                                      localStorage.setItem("lng", addr?.lng);
                                      localStorage.setItem(
                                        "guestFormatAddress",
                                        `${addr?.AddressType} (${addr?.building})`
                                      );
                                      navigate(
                                        `${location.pathname}/${location.search}`
                                      );
                                      setAddressModal(false);
                                      calculateRoute();
                                    }}
                                    className=" bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-2 px-4 font-semibold"
                                  >
                                    Choose
                                  </button>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                            <hr className="max-w-[30.4rem] ms-auto" />
                          </>
                        ))}
                    </div>

                    <div className="font-medium text-xl text-theme-black-2 font-omnes my-4">
                      <button
                        onClick={() => {
                          setAddressModal(true);
                          setHasPositionChanged(false);
                          setDeliveryAddress({
                            id: "",
                            lat: "",
                            lng: "",
                            building: "",
                            city: "",
                            AddressType: "",
                            locationType: "",
                            state: "",
                            streetAddress: "",
                            zipCode: "",
                            entrance: "",
                            door: "",
                            instructions: "",
                            other: false,
                          });
                        }}
                        className="flex items-center gap-x-3"
                      >
                        <FaPlus size={20} />
                        <span>Add new addressss</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ModalBody>

          <ModalFooter px={4}>
            <button
              onClick={() => setModal(false)}
              className="h-[54px] w-full bg-theme-red text-white font-sf font-semibold text-base rounded-lg border border-theme-red"
            >
              Done
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}

      <Modal
        onClose={closeAddressModal}
        isOpen={addressModal}
        isCentered
        className="modal-custom"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          maxW={["510px", "510px", "600px"]}
          className="modal-content-custom"
        >
          <ModalHeader
            px={4}
            boxShadow={
              modalScroll > 10 ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none"
            }
          >
            <div className="flex justify-between">
              <button
                onClick={() => {
                  if (addressTab === 1) {
                    setAddressTab(0);
                  } else if (addressTab === 2) {
                    setAddressTab(1);
                  } else if (addressTab === 3) {
                    setAddressTab(2);
                  } else if (addressTab === 4) {
                    setAddressTab(3);
                  }
                  setHasPositionChanged(false);
                }}
                className={`flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16 ${
                  addressTab === 0 ? "invisible" : "visible"
                }`}
              >
                <FaArrowLeftLong size={20} />
              </button>
              <motion.div
                className="text-base font-medium text-center pt-2 capitalize text-ellipsis ellipsis4 text-theme-black-2"
                initial={{ opacity: 1, y: "-1rem" }} // Start from above and invisible
                animate={{
                  opacity: modalScroll > 10 ? 1 : 0, // Fade out on scroll down, fade in on scroll up
                  y: modalScroll > 10 ? 0 : "-1rem", // Move up on scroll down, move to center on scroll up
                }}
                transition={{
                  duration: 0.2, // Adjust the transition speed
                  delay: 0, // Add a delay of 0.2 seconds
                }}
              >
                {addressTab === 4
                  ? `${deliveryAddress.building}`
                  : addressTab === 0
                  ? t("Where to?")
                  : t("Add New Address")}
              </motion.div>
              <div
                onClick={closeAddressModal}
                className="flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
              >
                <IoClose size={30} />
              </div>
            </div>
          </ModalHeader>
          <ModalBody padding={0}>
            <div
              onScroll={handleModalScroll}
              className="max-h-[calc(100vh-200px)] h-auto overflow-auto setScroll"
            >
              {addressTab === 0 ? (
                <div className="px-4">
                  <div className="space-y-5  ">
                    <h4 className="text-3xl text-theme-black-2 font-omnes font-bold ">
                      {t("Where to?")}
                    </h4>
                    {dataAddress?.data?.data?.addressList
                      ?.filter(
                        (fil) =>
                          fil.AddressType &&
                          fil.AddressType?.toString().length > 0
                      )
                      ?.map((addr, index) => (
                        <>
                          <div
                            key={index}
                            className="flex items-center gap-x-3"
                          >
                            <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 ">
                              {addr?.AddressType === "Home" ? (
                                <IoHome
                                  size={28}
                                  className={`${
                                    addr?.lat === localStorage.getItem("lat") &&
                                    addr?.lng === localStorage.getItem("lng")
                                      ? "text-theme-green-2"
                                      : "text-theme-black-2"
                                  }`}
                                />
                              ) : addr?.AddressType === "Work" ? (
                                <ImOffice
                                  size={24}
                                  className={`${
                                    addr?.lat === localStorage.getItem("lat") &&
                                    addr?.lng === localStorage.getItem("lng")
                                      ? "text-theme-green-2"
                                      : "text-theme-black-2"
                                  }`}
                                />
                              ) : addr?.AddressType === "Other" ? (
                                <MdEditCalendar
                                  size={24}
                                  className={`${
                                    addr?.lat === localStorage.getItem("lat") &&
                                    addr?.lng === localStorage.getItem("lng")
                                      ? "text-theme-green-2"
                                      : "text-theme-black-2"
                                  }`}
                                />
                              ) : (
                                <></>
                              )}
                            </button>
                            <div className="flex justify-between gap-x-5 items-center w-full">
                              <div>
                                <p
                                  className={`text-base font-medium font-sf text-theme-black-2 ${
                                    addr?.lat === localStorage.getItem("lat") &&
                                    addr?.lng === localStorage.getItem("lng")
                                      ? "text-theme-green-2"
                                      : "text-theme-black-2"
                                  }`}
                                >
                                  {addr?.AddressType}
                                </p>
                                <div className="text-sm font-normal text-black text-opacity-40 font-sf ellipsis6">
                                  {`${addr?.building}, ${addr?.streetAddress}`}
                                </div>
                              </div>
                              {addr?.lat !== localStorage.getItem("lat") &&
                              addr?.lng !== localStorage.getItem("lng") ? (
                                <button
                                  onClick={() => {
                                    localStorage.setItem("lat", addr?.lat);
                                    localStorage.setItem("lng", addr?.lng);
                                    localStorage.setItem(
                                      "guestFormatAddress",
                                      `${addr?.AddressType} (${addr?.building})`
                                    );
                                    navigate(
                                      `${location.pathname}/${location.search}`
                                    );
                                    setAddressModal(false);
                                  }}
                                  className=" bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-2 px-4 font-semibold"
                                >
                                  {t("Choose")}
                                </button>
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                          <hr className="max-w-[31.7rem] ms-auto" />
                        </>
                      ))}
                  </div>

                  <div className="font-medium text-base text-theme-black-2  font-sf my-5 px-4">
                    <button
                      onClick={() => {
                        const element = document.querySelector(".setScroll");
                        if (element) {
                          element.scrollTo({ top: 0 });
                        }

                        setAddressTab(1);
                      }}
                      className="flex items-center gap-x-7"
                    >
                      <CustomPlusbtn color="#202125" />
                      <span>{t("Add new address")}</span>
                    </button>
                  </div>
                  <hr className="max-w-[31.7rem] ms-auto" />
                  <div className="font-medium text-base text-theme-black-2  font-sf my-5 px-4">
                    <button
                      onClick={() => setAddressTab(1)}
                      className="flex items-center gap-x-7"
                    >
                      <CustomMenubtn color="#202125" />

                      <span>{t("Browse all fomino cities")}</span>
                    </button>
                  </div>
                </div>
              ) : addressTab === 1 ? (
                <div className="px-4">
                  <div className="space-y-2">
                    <h4 className="capitalize text-3xl text-theme-black-2  font-omnes font-bold mb-5">
                      {t("Add New Address")}
                    </h4>
                    <Select
                      value={country?.countries || null}
                      onChange={(e) => {
                        setCountry({
                          ...country,
                          countries: e,
                          selectedCountryShortName: e.short,
                        });
                      }}
                      options={getCountries}
                      inputId="countries"
                      placeholder="Country"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: "8px",
                          border: state.isFocused
                            ? "2px solid green-700"
                            : "2px solid #E4E4E5",
                          borderColor: state.isFocused
                            ? "green-700"
                            : "#E4E4E5",
                          boxShadow: state.isFocused
                            ? "0 0 0 1px green"
                            : "none",
                          padding: "6px 6px",
                          "&:hover": {
                            borderColor: "green",

                            cursor: "pointer",
                          },
                        }),
                      }}
                      className="rounded-xl font-sf"
                    />
                    <Autocomplete
                      onLoad={(autocomplete) =>
                        (autocompleteRef.current = autocomplete)
                      }
                      options={countriesRestriction}
                    >
                      <input type="text" className={inputStyle} />
                    </Autocomplete>
                  </div>
                  <div>
                    <button
                      className="font-sf font-semibold mt-2 my-5 py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red "
                      onClick={() => getAddress()}
                    >
                      {t("Continue")}
                    </button>
                  </div>
                  <div className=" md:h-[470px] ">
                    <img
                      className="w-2/3 mx-auto  object-cover"
                      src="/images/address.gif"
                      alt="address"
                    />
                  </div>
                </div>
              ) : addressTab === 2 ? (
                <div className="px-4">
                  <div className="space-y-5">
                    <div>
                      <h4 className="capitalize text-3xl text-theme-black-2 font-bold font-omnes  mb-5">
                        What kind of location is this?
                      </h4>
                      <p className="text-base font-sf font-normal text-theme-black-2 text-opacity-60">
                        Help us find you faster by identifying the type of
                        location this is.
                      </p>
                    </div>
                    <div className="flex items-center gap-x-3 font-sf">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 ">
                        <IoHome size={28} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base font-medium text-theme-black-2">
                          House
                        </p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "House",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-medium font-sf"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-3">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0 ">
                        <MdApartment size={28} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base font-medium text-theme-black-2">
                          Apartment
                        </p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "Apartment",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-medium"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-3">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0">
                        <ImOffice size={24} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base font-medium text-theme-black-2">
                          Office
                        </p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "Office",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-medium"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-x-3">
                      <button className="flex justify-center items-center text-end rounded-fullest w-12 h-12 flex-shrink-0">
                        <MdEditCalendar size={24} />
                      </button>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base font-medium text-theme-black-2">
                          Others
                        </p>
                        <button
                          onClick={() => {
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: "Others",
                            });
                            setAddressTab(3);
                          }}
                          className="text-[#379465] flex justify-center items-center text-end rounded-md py-2 px-4 bg-[#37946524] font-medium"
                        >
                          {t("Choose")}
                        </button>
                      </div>
                    </div>
                    <hr />
                  </div>
                </div>
              ) : addressTab === 3 ? (
                <div className="px-4">
                  <div className="space-y-5">
                    <div>
                      <h4 className="capitalize text-3xl text-black font-bold font-omnes mb-4 ">
                        Address details
                      </h4>
                      <p className="text-base font-sf font-normal text-theme-black-2 text-opacity-60 ">
                        Giving exact address details helps us deliver your order
                        faster.
                      </p>
                    </div>
                    <div>
                      <h4 className="capitalize text-xl text-theme-black-2 font-semibold font-omnes mb-3">
                        Address
                      </h4>
                      <p className="text-base font-medium text-theme-black-2 mb-2">
                        {`${deliveryAddress.building} `}
                      </p>
                      <p className="text-sm font-normal text-theme-black-2 text-opacity-60">
                        {`${deliveryAddress.streetAddress}`}
                      </p>
                    </div>
                    <div className="space-y-2 font-sf text-theme-black-2">
                      <div>
                        <select
                          value={deliveryAddress.locationType}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              locationType: e.target.value,
                            })
                          }
                          className={inputStyle}
                        >
                          <option value="House">House</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Office">Office</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>

                      <div>
                        <input
                          value={deliveryAddress?.entrance}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              entrance: e.target.value,
                            })
                          }
                          type="text"
                          placeholder="Entrance / Staircase"
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <input
                          value={deliveryAddress?.door}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              door: e.target.value,
                            })
                          }
                          type="text"
                          placeholder="Name / No on Door"
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <input
                          value={deliveryAddress?.instructions}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              instructions: e.target.value,
                            })
                          }
                          type="text"
                          placeholder="Other instructions for the courier"
                          className={inputStyle}
                        />
                        <p className="text-xs text-black text-opacity-50 ml-3 mt-2">
                          Optional
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="capitalize text-xl text-theme-black-2 font-semibold font-omnes mb-3">
                        Address location
                      </h4>
                      <p className="text-base font-normal text-theme-black-2 text-opacity-50">
                        Pinpointing your exact location on the map helps us find
                        you fast.
                      </p>
                    </div>
                    {hasPositionChanged && (
                      <div className="h-36 rest-footer overflow-hidden sm:rounded-b-[20px] md:rounded-lg relative">
                        <GoogleMap
                          zoom={14}
                          center={currentPosition}
                          mapContainerStyle={{
                            width: "100%",
                            height: "100%",
                          }}
                          options={{
                            disableDefaultUI: true,
                            draggable: false,
                            scrollwheel: false,
                            disableDoubleClickZoom: true,
                            zoomControl: false,
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              zIndex: 1,
                            }}
                            className="customMarkF"
                          >
                            <img
                              src="/images/pin-location.svg"
                              alt="Fixed Marker"
                            />
                          </div>
                        </GoogleMap>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setAddressTab(4);
                      }}
                      className="font-sf flex items-center justify-center gap-x-3 text-[#E13743] bg-theme-red-2 bg-opacity-15  font-medium w-full rounded-lg px-3 py-[15px]"
                    >
                      <GrMapLocation />
                      {hasPositionChanged
                        ? "Edit tmeeting point on the map"
                        : "Add a meeting point on the map"}
                    </button>
                    <div className="space-y-1">
                      <h4 className="capitalize text-xl text-theme-black-2 font-semibold font-omnes ">
                        Address label
                      </h4>
                      <p className="text-base font-normal text-theme-black-2 text-opacity-50">
                        Labelling addresses helps you to choose between them.
                      </p>
                      <div className="pt-3 grid grid-cols-3 gap-3 font-sf">
                        <button
                          onClick={() =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              AddressType: "Home",
                              other: false,
                            })
                          }
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded border ${
                            deliveryAddress.AddressType === "Home"
                              ? "border-green-700 text-green-700"
                              : "border-black border-opacity-20 text-black text-opacity-60"
                          }`}
                        >
                          <IoHome size={24} />
                          <span className="font-normal text-xl">Home</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              AddressType: "Work",
                              other: false,
                            })
                          }
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded border ${
                            deliveryAddress.AddressType === "Work"
                              ? "border-green-700 text-green-700"
                              : "border-black border-opacity-20 text-black text-opacity-60"
                          }`}
                        >
                          <FaBriefcase size={24} />
                          <span className="font-normal text-xl">Work</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              AddressType: "Other",
                              other: true,
                            })
                          }
                          className={`text-black flex flex-col justify-between items-center gap-y-3 px-5 py-7 rounded border ${
                            deliveryAddress.AddressType === "Other"
                              ? "border-green-700 text-green-700"
                              : "border-black border-opacity-20 text-black text-opacity-60"
                          }`}
                        >
                          <MdLocationPin size={24} />
                          <span className="font-normal text-xl">Other</span>
                        </button>
                      </div>
                      {deliveryAddress.other ? (
                        <div className="pt-2">
                          <input
                            value={deliveryAddress?.AddressType}
                            onChange={(e) =>
                              setDeliveryAddress({
                                ...deliveryAddress,
                                AddressType: e.target.value,
                              })
                            }
                            type="text"
                            placeholder="Name"
                            className={inputStyle}
                          />
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      className="font-sf font-semibold my-5 py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white  shadow-md text-base rounded-lg border border-theme-red "
                      onClick={handleAddAddress}
                    >
                      Save address
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-[calc(100vh-400px)] rest-footer overflow-hidden sm:rounded-b-[20px] md:rounded-b-[20px] relative">
                  <GoogleMap
                    zoom={14}
                    center={currentPosition}
                    mapContainerStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                    options={{
                      disableDefaultUI: true,
                    }}
                    onDragEnd={handleDragEnd}
                    onLoad={handleMapLoad}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                      }}
                      className="customMarkF"
                    >
                      <img src="/images/pin-location.svg" alt="Fixed Marker" />
                    </div>
                  </GoogleMap>
                  <button
                    className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[95%] font-semibold text-base py-4 px-5 bg-theme-red text-white rounded"
                    onClick={() => {
                      setAddressTab(3);
                    }}
                  >
                    {t("Continue")}
                  </button>
                </div>
              )}
            </div>
          </ModalBody>

          {addressTab !== 4 && <ModalFooter></ModalFooter>}
        </ModalContent>
      </Modal>

      <Modal
        onClose={() => {
          setPaymentModal(false);
        }}
        isOpen={paymentModal}
        isCentered
        size={feeWorks ? "xl" : "lg"}
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="20px"
          // maxW={["510px", "510px", "600px"]}
          className="modal-content-custom"
        >
          <ModalHeader px={4} ml="auto">
            <div
              onClick={() => {
                setPaymentModal(false);
              }}
              className="flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
            >
              <IoClose size={30} />
            </div>
          </ModalHeader>

          <form onSubmit={handlePayment}>
            <ModalBody padding={0}>
              <div className="font-sf px-4 max-h-[calc(100vh-200px)] h-auto overflow-auto">
                {feeWorks ? (
                  <div className="font-sf">
                    <h4 className="text-[28px] font-bold text-theme-black-2 font-omnes ">
                      How fees work
                    </h4>
                    <div className="py-3">
                      <h6 className="text-base font-semibold pb-1.5">
                        Delivery
                      </h6>
                      <p>
                        We calculate your delivery fee based on the distance
                        between you and the venue. This venue is{" "}
                        {deliveryCharges?.distance} km away, so your delivery
                        fee is {deliveryCharges?.currencyUnit}{" "}
                        {deliveryCharges?.deliveryCharges}.
                      </p>
                    </div>
                    <div className="py-3">
                      <h6 className="text-base font-semibold pb-1.5">
                        Small order fee
                      </h6>
                      <p>
                        We only add a small order surcharge if your order
                        subtotal is less than the{" "}
                        {activeResData?.minOrderAmount}.
                      </p>
                    </div>
                    <div className="py-3">
                      <h6 className="text-base font-semibold pb-1.5">
                        Service fee
                      </h6>
                      <p>
                        The service fee helps us ensure the quality of the
                        Fomino platform, enabling us to enhance our service with
                        new features, provide high-quality customer support, and
                        cover essential costs like technology development. The
                        service fee is {deliveryCharges?.currencyUnit}{" "}
                        {deliveryCharges?.serviceCharges}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="text-3xl text-theme-black-2 font-omnes font-bold mt-3 mb-6">
                      Payment methods
                    </h4>

                    <div className="">
                      {paymentMethods.map((itm) => (
                        <div
                          className={`py-2 cursor-pointer h-[76px] border-b flex items-center w-full`}
                          onClick={() => {
                            handleSelect(itm?.name, itm.type);
                            setPaymentModal(false);
                          }}
                        >
                          <div className="flex items-center gap-3 justify-between w-full">
                            <div className="flex items-center gap-x-4">
                              <img
                                src={`${
                                  itm?.name.includes("Cards")
                                    ? "/images/credit-card.webp"
                                    : itm?.name.includes("Apple")
                                    ? "/images/epay.webp"
                                    : itm?.name.includes("Google")
                                    ? "/images/gpay.webp"
                                    : itm?.name.includes("COD")
                                    ? "/images/cashPay.png"
                                    : ""
                                }`}
                                alt="payment-card"
                                className="w-9 h-9 object-contain"
                              />
                              <span className="text-base font-sf font-medium text-theme-black-2">
                                {itm?.name}
                              </span>
                            </div>

                            {selectedPayment.name !== itm?.name && (
                              <button className=" bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-2 px-4 font-semibold">
                                Choose
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter px="4"></ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Header
        home={true}
        cart={true}
        rest={false}
        groupDrawer={groupDrawer}
        setGroupDrawer={setGroupDrawer}
        gData={gData}
      />
      <section className="bg-theme-green font-sf">
        <div className="h-96 relative text-black hover:text-opacity-50 md:pt-[70px] pt-14">
          <div className="lg:hidden absolute z-10 bottom-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>

          <GoogleMap
            key={`${deliveryData?.how}-${deliveryAddress?.lat}-${deliveryAddress?.lng}`}
            zoom={deliveryData?.how === 1 ? 12 : 16}
            center={
              deliveryData?.how === 1
                ? {
                    lat: (origin.lat + destination.lat) / 2,
                    lng: (origin.lng + destination.lng) / 2,
                  }
                : origin
            }
            mapContainerStyle={{
              width: "100%",
              height: "100%",
            }}
            options={{
              disableDefaultUI: true,
            }}
            onLoad={(map) => {
              mapRef.current = map;
              calculateRoute1();
            }}
          >
            <MarkerF
              position={origin}
              icon={{
                url:
                  deliveryData.how === 1
                    ? "/images/restaurants/greenDot.svg"
                    : iconUrl,
                scaledSize: new window.google.maps.Size(
                  deliveryData.how === 1 ? 25 : 100,
                  deliveryData.how === 1 ? 30 : 100
                ),
              }}
            />

            {deliveryData.how === 1 && (
              <MarkerF
                position={destination}
                icon={{
                  url: iconUrl,
                  scaledSize: new window.google.maps.Size(100, 100),
                }}
              />
            )}

            {directionsResponse && deliveryData?.how == 1 && (
              <DirectionsRenderer
                directions={directionsResponse}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#09820f",
                    strokeWeight: 5,
                  },
                }}
              />
            )}
          </GoogleMap>

          <div className="max-w-[1200px] px-[30px] mx-auto -mt-20 md:-mt-48 z-40 relative pointer-events-none">
            <div
              onClick={() => {
                window.history.back();
              }}
              className="absolute left-5 -top-56 md:-top-28 z-10 flex items-center gap-x-2 "
            >
              <IoIosArrowRoundBack className="ml-3 mt-2 text-3xl rounded-full bg-[#F4F5FA] hover:bg-[#e5e5e5] focus:outline-none focus:shadow-none text-black p-1 w-[40px] h-[40px] text-[14px] cursor-pointer duration-100 pointer-events-auto" />
              <p className="text-xl font-bold font-sf mt-2 pointer-events-auto">
                Back
              </p>
            </div>
            <div className="font-omnes">
              <h3 className="text-4xl md:text-6xl font-bold">Checkout</h3>
              <p className="text-xl md:text-3xl font-semibold">
                {activeResData?.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] px-4 sm:px-[30px] xl:pr-11 grid grid-cols-1 lg:grid-cols-5 lg:gap-x-[10%] gap-y-5  mx-auto mt-10 mb-32 font-sf">
        <div className="lg:max-w-[570px] lg:col-span-3">
          <div className="space-y-3">
            <div className="h-12 p-1 rounded-[6.25rem] bg-deliveryPickupBtn grid grid-cols-2 mb-6">
              <button
                onClick={() => {
                  setDeliveryData({ ...deliveryData, how: 1 });
                  localStorage.setItem("how", 1);
                }}
                disabled={buttonStates.disableDelivery}
                // className={`font-medium text-base flex items-center justify-center gap-x-2 rounded-[6.25rem] ${
                //   deliveryData.how === 1
                //     ? "bg-white"
                //     : "bg-transparent text-[#202125a3]"
                // }`}
                className={`py-2 px-5 font-bold text-base flex items-center justify-center gap-x-2 rounded-full text-theme-black-2 ${
                  deliveryData.how === 1 ? "bg-white" : "bg-transparent"
                } ${
                  buttonStates.disableDelivery
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <CustomDeliveryIcon
                  size={20}
                  color={deliveryData.how === 2 && "#202125a3"}
                />
                <span className={deliveryData.how === 1 && "font-bold"}>
                  Delivery
                </span>
              </button>
              <button
                onClick={() => {
                  setDeliveryData({ ...deliveryData, how: 2 });
                  localStorage.setItem("how", 2);
                }}
                disabled={buttonStates.disablePickup}
                className={`py-2 px-5 font-bold text-base flex items-center justify-center gap-x-2 rounded-full text-theme-black-2 ${
                  deliveryData.how === 2 ? "bg-white" : "bg-transparent"
                } ${
                  buttonStates.disablePickup
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <FaWalking size={20} />
                <span className={deliveryData.how === 2 && "font-bold"}>
                  Pickup
                </span>
              </button>
            </div>
            {/* =======Group card======== */}
            {localStorage.getItem("groupOrder") && (
              <div
                className=" relative flex gap-x-3 items-center font-sf  bg-white rounded-lg border-2 border-checkoutGrayBorder px-4 py-5 !mb-10 !mt-10 cursor-pointer"
                onClick={() => setGroupDrawer(!groupDrawer)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {/* <img
                    className="w-full h-full object-cover"
                    src={
                      BASE_URL +
                        JSON.parse(localStorage.getItem("groupData"))
                          ?.groupIcon || "/images/userIcon.jpeg"
                    }
                    alt=""
                  /> */}
                  <img
                    className="w-full h-full object-cover"
                    src={"/images/burger.webp"}
                    alt=""
                  />
                </div>
                <div>
                  <h4 className="text-base font-semibold font-sf">
                    {JSON.parse(localStorage.getItem("groupData"))?.groupName}
                  </h4>
                  <p className="text-sm font-light text-gray-500">
                    {gData?.participantList?.length} participant &bull; click to
                    manage
                  </p>
                </div>
                <div className="text-theme-green-2 text-xl absolute  right-5 top-[50%] translate-y-[-50%]">
                  <button>
                    <FaAngleRight />
                  </button>
                </div>
              </div>
            )}

            {deliveryData.how === 1 && (
              <>
                <div className="w-full flex justify-between items-center p-4 cursor-pointer !my-4 !mb-12 rounded-lg border-2 border-checkoutGrayBorder">
                  <div className="flex items-center gap-x-4 p-2">
                    <CustomDeliveryIcon size={20} />
                    <div className=" font-sf">
                      <h4 className="leading-6 text-base font-semibold">
                        Delivery in approximately{" "}
                        <span className="text-gray-400">
                          {activeResData?.deliveryTime}
                        </span>{" "}
                        {activeResData?.dropOffAddress?.streetAddress}
                      </h4>
                    </div>
                  </div>
                </div>

                {inzone == false && (
                  <div className="flex gap-x-2 items-center p-4 bg-[#ffefee] rounded-lg [&>p]:text-sm !mb-10">
                    <FaCircleExclamation className="text-[#f93a25]" size="16" />
                    <p>The address is outside of the delivery range. </p>
                  </div>
                )}

                <div className="">
                  <h1 className="font-semibold text-xl sm:text-[1.75rem] font-omnes">
                    Delivery location
                  </h1>
                </div>
              </>
            )}

            {deliveryData.how === 2 && (
              <>
                <div className="w-full flex justify-between items-center p-4 cursor-pointer !my-4  !mb-12 rounded-lg border-2 border-checkoutGrayBorder">
                  <div className="flex items-center gap-x-4 p-2">
                    <GiCardPickup size={24} />
                    <div className=" font-sf">
                      <h4 className="leading-6 text-base font-semibold">
                        Pickup in approximately{" "}
                        <span className="text-gray-400">
                          {activeResData?.pickupTime}
                        </span>{" "}
                        {activeResData?.dropOffAddress?.streetAddress}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="">
                  <h1 className="font-semibold text-xl sm:text-[1.75rem] font-omnes">
                    Pickup location
                  </h1>
                </div>
              </>
            )}
          </div>
          <div className="bg-white rounded-lg border-2 border-checkoutGrayBorder  my-4 mb-12">
            <div className="flex items-center justify-between gap-x-2 px-5 py-5">
              <div className="flex items-center gap-x-3">
                <span>
                  <IoMdHome size={24} />
                </span>
                <div>
                  <div className="text-base font-semibold">
                    {deliveryData.how === 1 ? (
                      deliveryAddress?.id !== "" ? (
                        <span className="font-semibold">
                          {`${deliveryAddress?.AddressType || "Home"}`}:{" "}
                          <span className="text-gray-400 font-light">
                            {" "}
                            {`${deliveryAddress.streetAddress}`}{" "}
                          </span>
                        </span>
                      ) : (
                        "Please add a delivery address"
                      )
                    ) : (
                      <>
                        <span className="font-semibold">
                          {" "}
                          {` ${activeResData.location}`}
                        </span>{" "}
                        <span className="ms-2 text-gray-500">{`${deliveryCharges.distance} ${deliveryCharges.distanceUnit}`}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {deliveryData.how === 1 && (
                <div className="bg-[#40875D24] text-theme-green-2 font-semibold font-sf rounded-md px-3 py-1">
                  <button onClick={() => setAddressModal(true)}>Change</button>
                </div>
              )}
            </div>

            {deliveryData.how === 1 && (
              <>
                <hr className="mx-5 " />
                <div className="flex items-center justify-between gap-x-2 px-5 py-5">
                  <div className="flex items-center gap-x-3">
                    <span>
                      <FaDoorOpen size={24} />
                    </span>
                    <div>
                      <div className="text-base font-semibold">
                        Leave order at the door
                      </div>
                    </div>
                  </div>
                  <Switch
                    onChange={handleLeaveAtDoor}
                    checked={leaveAtDoor}
                    onColor="#379465"
                    offColor="#d9d9d9"
                    checkedIcon={false}
                    uncheckedIcon={false}
                    height={29}
                    width={52}
                    handleDiameter={23}
                  />
                </div>

                <div>
                  <hr className="mx-5" />
                  <div className="relative w-full group">
                    <div className="font-sf font-normal text-base text-theme-black-2 flex items-center gap-3 px-5 py-[5px] duration-300 border-2 border-white hover:border-theme-green-2 focus-within:border-theme-green-2 rounded-lg">
                      <MdInsertComment size={24} />
                      <div className="relative w-full">
                        <input
                          type="text"
                          id="courier-note"
                          className={`w-full h-full py-5 pt-7 pb-2 focus:outline-none bg-transparent peer ${
                            deliveryAddress?.instructions
                              ? "placeholder-transparent"
                              : ""
                          }`}
                          value={deliveryAddress?.instructions}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              instructions: e.target.value,
                            })
                          }
                        />
                        <label
                          htmlFor="courier-note"
                          className={`absolute left-0 top-4 text-gray-400 transition-all ${
                            deliveryAddress?.instructions
                              ? "top-[5px] text-[13px] peer-focus:text-theme-green-2"
                              : "peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-500 peer-focus:top-[7px] peer-focus:text-[13px] peer-focus:text-theme-green-2"
                          }`}
                        >
                          Add note for the courier
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {deliveryData.how === 1 && (
            <>
              <div className="space-y-6">
                <h1 className="font-semibold text-xl sm:text-[1.75rem] font-omnes ">
                  Delivery Time
                </h1>
              </div>
            </>
          )}

          {deliveryData.how === 2 && (
            <>
              <div className="space-y-6">
                <h1 className="font-semibold text-xl sm:text-[1.75rem] font-omnes ">
                  Pickup Time
                </h1>
              </div>
            </>
          )}
          <div
            className={`flex items-center space-x-4 px-4 py-3 mt-4 border-2 rounded-lg ${
              deliveryData.when === 1 && "border-theme-green-2"
            }`}
          >
            {/* <input
              onChange={() =>
                setDeliveryData({
                  ...deliveryData,
                  when: 1,
                  whenShow: false,
                  schedule: "",
                })
              }
              type="radio"
              id="when-asap"
              name="when"
              checked={deliveryData.when === 1}
              className="custom-radio "
            /> */}
            <CustomRadioBtn
              onChange={() =>
                setDeliveryData({
                  ...deliveryData,
                  when: 1,
                  whenShow: false,
                  schedule: "",
                })
              }
              type="radio"
              id="when-asap"
              name="when"
              checked={deliveryData.when === 1}
              disabled={buttonStates.disableStandard}
            />

            <label
              htmlFor="when-asap"
              className={`w-full cursor-pointer flex items-center space-x-4 ${
                buttonStates.disableStandard ? "text-gray-400" : ""
              }`}
            >
              <div>
                <label className="font-sf font-semibold text-base">
                  Standard
                </label>
                <p className="text-sm font-light text-checkoutTextColor/65">
                  {deliveryData.how === 1
                    ? activeResData?.deliveryTime?.split(" ")[0] +
                      "-" +
                      (parseInt(activeResData?.deliveryTime) + 10)
                    : activeResData?.pickupTime?.split(" ")[0] +
                      "-" +
                      (parseInt(activeResData?.pickupTime) + 10)}{" "}
                  min
                </p>
              </div>
            </label>
          </div>

          <div
            className={`flex items-center space-x-4 px-4 py-3 mt-2 border-2 rounded-lg ${
              deliveryData.when === 2 ? "border-theme-green-2" : ""
            } ${
              buttonStates.disableSchedule
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            <CustomRadioBtn
              onChange={() =>
                setDeliveryData({
                  ...deliveryData,
                  when: 2,
                })
              }
              type="radio"
              id="when-later"
              name="when"
              checked={deliveryData.when === 2}
              className="custom-radio "
              disabled={buttonStates.disableSchedule}
            />

            <label
              htmlFor="when-later"
              className={`w-full cursor-pointer flex items-center space-x-4 ${
                buttonStates.disableSchedule ? "text-gray-400" : ""
              }`}
            >
              <div>
                <label className="font-sf font-semibold text-base">
                  Schedule
                </label>
                <p className="text-sm font-light text-checkoutTextColor/65">
                  Choose a delivery time
                </p>
              </div>
            </label>
          </div>

          {deliveryData.when === 2 && (
            <div className="flex  justify-between space-x-7 my-3">
              <Select
                value={schedule.day}
                onChange={(e) => {
                  const day = JSON.parse(
                    localStorage.getItem("activeResData")
                  ).times.find((ele) => ele.name === e.value.toLowerCase());
                  generateTimeChunks(day.startAt, day.endAt, day.date);
                  setSchedule({
                    ...schedule,
                    day: e,
                    date: day.date,
                  });
                }}
                isClearable={true}
                isDisabled={deliveryData.when === 1 ? true : false}
                options={days}
                placeholder="Select day"
                className="rounded-xl font-sf w-full"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: "8px",

                    border: state.isFocused
                      ? "2px solid green-700"
                      : "2px solid #E4E4E5",
                    borderColor: state.isFocused ? "green-700" : "#E4E4E5",
                    boxShadow: state.isFocused ? "0 0 0 1px green" : "none",
                    padding: "6px 6px",
                    "&:hover": {
                      borderColor: "green",

                      cursor: "pointer",
                    },
                  }),
                }}
              />
              <Select
                value={schedule.time}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    time: e,
                  })
                }
                isClearable={true}
                isDisabled={deliveryData.when === 1 ? true : false}
                options={timeChunks}
                placeholder="Select time"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: "8px",
                    border: state.isFocused
                      ? "2px solid green-700"
                      : "2px solid #E4E4E5",
                    borderColor: state.isFocused ? "green-700" : "#E4E4E5",
                    boxShadow: state.isFocused ? "0 0 0 1px green" : "none",
                    padding: "6px 6px",
                    "&:hover": {
                      borderColor: "green",

                      cursor: "pointer",
                    },
                  }),
                }}
                className="rounded-xl font-sf w-full"
              />
            </div>
          )}

          <div className="flex items-center font-semibold text-xl md:text-2xl gap-x-2 mt-12 mb-8">
            {!groupData && (
              <>
                {/* <FaDoorOpen /> */}
                <h3 className="font-semibold text-xl sm:text-[1.75rem] font-omnes ">
                  Selected items
                </h3>
              </>
            )}
          </div>
          {!groupData && (
            <div className="bg-white rounded-lg my-4 space-y-3">
              {existingCartItems?.map((cart, index) => {
                const matchedPromotion = priorityProduct.find(
                  (cartItem) =>
                    cartItem.RPLinkId === cart.RPLinkId &&
                    cartItem.promotionDetails?.some(
                      (promo) => promo.bannerType === "Discount"
                    )
                );

                // Extract the discounted price if a match is found
                const discountedPrice = matchedPromotion
                  ? matchedPromotion?.afterDiscount ?? cart.Total
                  : null;

                return (
                  <div key={index} className="flex justify-between gap-x-2">
                    <div className="flex gap-x-5">
                      <div className="border-2  border-gray-100 rounded-xl sm:w-28 sm:h-20 w-6 h-6 ">
                        <img
                          className="w-full h-full object-cover rounded-md"
                          src={`${BASE_URL}${cart?.image}`}
                          alt={cart?.name}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-x-3 my-1">
                          <h5>
                            <span className="text-theme-green-2">
                              {cart?.quantity}x
                            </span>{" "}
                            <b className="font-medium">{cart?.name}</b>
                          </h5>
                        </div>
                        <div className="capitalize text-sm font-normal text-black text-opacity-60">
                          <ul>
                            {cart?.addOnsCat && cart?.addOnsCat?.length > 0
                              ? cart?.addOnsCat
                                  ?.filter(
                                    (ele) =>
                                      ele?.id ===
                                      cart?.addOns?.find(
                                        (fil) => fil?.collectionId === ele?.id
                                      )?.collectionId
                                  )
                                  ?.map((cat, key) => (
                                    <li key={key}>
                                      <span>{cat?.name}: </span>
                                      <br />
                                      {cart?.addOns
                                        ?.filter(
                                          (fil) => fil?.collectionId === cat?.id
                                        )
                                        ?.map((add, addKey) => (
                                          <div
                                            key={addKey}
                                            className="ml-2 mt-1"
                                          >
                                            {`${add?.quantity}x ${add?.name} ${
                                              add?.total > 0
                                                ? `(${add?.total}.00)`
                                                : ""
                                            }`}
                                          </div>
                                        ))}
                                    </li>
                                  ))
                              : cart?.addOns?.map((add, addKey) => (
                                  <li key={addKey}>
                                    <div className="ml-2 mt-1">
                                      {`${add?.quantity}x ${add?.name} ${
                                        add?.total > 0
                                          ? `(${add?.total}.00)`
                                          : ""
                                      }`}
                                    </div>
                                  </li>
                                ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {combine ? (
                      <div className="font-semibold text-base text-theme-green-2">
                        <span
                          className={
                            discountedPrice || discountedPrice === 0
                              ? "line-through text-gray-400"
                              : ""
                          }
                        >
                          {formatPrice(
                            (cart?.unitPrice +
                              cart?.addOns?.reduce((accumulator, ele) => {
                                return (
                                  accumulator +
                                  (ele?.total || 0) * (ele?.quantity || 1)
                                );
                              }, 0)) *
                              cart?.quantity
                          )}
                        </span>{" "}
                        {discountedPrice !== null && (
                          <span>{formatPrice(discountedPrice)}</span>
                        )}
                        {activeResData?.currencyUnit}
                      </div>
                    ) : !combine &&
                      availablePromotions
                        .filter((promotion) => promotion.applied === true)
                        .some(
                          (promotion) => promotion.bannerType === "Discount"
                        ) ? (
                      <div className="font-semibold text-base text-theme-green-2">
                        <span
                          className={
                            discountedPrice || discountedPrice === 0
                              ? "line-through text-gray-400"
                              : ""
                          }
                        >
                          {formatPrice(
                            (cart?.unitPrice +
                              cart?.addOns?.reduce((accumulator, ele) => {
                                return (
                                  accumulator +
                                  (ele?.total || 0) * (ele?.quantity || 1)
                                );
                              }, 0)) *
                              cart?.quantity
                          )}
                        </span>{" "}
                        {discountedPrice !== null && (
                          <span>{formatPrice(discountedPrice)}</span>
                        )}
                        {activeResData?.currencyUnit}
                      </div>
                    ) : (
                      <div className="font-semibold text-base text-theme-green-2">
                        <span>
                          {formatPrice(
                            (cart?.unitPrice +
                              cart?.addOns?.reduce((accumulator, ele) => {
                                return (
                                  accumulator +
                                  (ele?.total || 0) * (ele?.quantity || 1)
                                );
                              }, 0)) *
                              cart?.quantity
                          )}
                        </span>{" "}
                        {activeResData?.currencyUnit}
                      </div>
                    )}
                  </div>
                );
              })}

              {combine
                ? getFree?.map((cart, index) => {
                    return (
                      <div key={index} className="flex justify-between gap-x-2">
                        <div className="flex gap-x-5">
                          <div className="border-2  border-gray-100 rounded-xl sm:w-28 sm:h-20 w-6 h-6 ">
                            <img
                              className="w-full h-full object-cover rounded-md"
                              src={`${BASE_URL}${cart?.image}`}
                              alt={cart?.name}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-x-3 my-1">
                              <h5>
                                <span className="text-theme-green-2">
                                  {cart?.quantity}x
                                </span>{" "}
                                <b className="capitalize">{cart?.name}</b>
                              </h5>
                            </div>
                            <div className="capitalize text-sm font-normal text-black text-opacity-60">
                              <ul>
                                {cart?.addOnsCat
                                  ?.filter(
                                    (ele) =>
                                      ele?.id ===
                                      cart?.addOns?.find(
                                        (fil) => fil?.collectionId === ele?.id
                                      )?.collectionId
                                  )
                                  ?.map((cat, key) => (
                                    <li key={key}>
                                      <span>{cat?.name}: </span>
                                      <br />
                                      {cart?.addOns
                                        ?.filter(
                                          (fil) => fil?.collectionId === cat?.id
                                        )
                                        ?.map((add, addKey) => (
                                          <div key={addKey} className="ml-2">
                                            {`${add?.quantity}x ${add?.name} ${
                                              add?.total > 0
                                                ? `(${add?.total}.00)`
                                                : ""
                                            }`}
                                          </div>
                                        ))}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-base text-theme-green-2 line-through">
                            {formatPrice(
                              (cart?.unitPrice +
                                cart?.addOns?.reduce((accumulator, ele) => {
                                  return (
                                    accumulator +
                                    (ele?.total || 0) * (ele?.quantity || 1)
                                  );
                                }, 0)) *
                                cart?.quantity
                            )}
                            {activeResData?.currencyUnit}
                          </div>
                          <p className="text-theme-green-2 border-green-500 border rounded-md text-center">
                            Free
                          </p>
                        </div>
                      </div>
                    );
                  })
                : availablePromotions
                    .filter((promotion) => promotion.applied === true)
                    .some((promotion) => promotion.bannerType === "BOGO") &&
                  getFree?.map((cart, index) => {
                    return (
                      <div key={index} className="flex justify-between gap-x-2">
                        <div className="flex gap-x-5">
                          <div className="border-2  border-gray-100 rounded-xl sm:w-28 sm:h-20 w-6 h-6 ">
                            <img
                              className="w-full h-full object-cover rounded-md"
                              src={`${BASE_URL}${cart?.image}`}
                              alt={cart?.name}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-x-3 my-1">
                              <h5>
                                <span className="text-theme-green-2">
                                  {cart?.quantity}x
                                </span>{" "}
                                <b className="capitalize">{cart?.name}</b>
                              </h5>
                            </div>
                            <div className="capitalize text-sm font-normal text-black text-opacity-60">
                              <ul>
                                {cart?.addOnsCat
                                  ?.filter(
                                    (ele) =>
                                      ele?.id ===
                                      cart?.addOns?.find(
                                        (fil) => fil?.collectionId === ele?.id
                                      )?.collectionId
                                  )
                                  ?.map((cat, key) => (
                                    <li key={key}>
                                      <span>{cat?.name}: </span>
                                      <br />
                                      {cart?.addOns
                                        ?.filter(
                                          (fil) => fil?.collectionId === cat?.id
                                        )
                                        ?.map((add, addKey) => (
                                          <div key={addKey} className="ml-2">
                                            {`${add?.quantity}x ${add?.name} ${
                                              add?.total > 0
                                                ? `(${add?.total}.00)`
                                                : ""
                                            }`}
                                          </div>
                                        ))}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-base text-theme-green-2 line-through">
                            {formatPrice(
                              (cart?.unitPrice +
                                cart?.addOns?.reduce((accumulator, ele) => {
                                  return (
                                    accumulator +
                                    (ele?.total || 0) * (ele?.quantity || 1)
                                  );
                                }, 0)) *
                                cart?.quantity
                            )}
                            {activeResData?.currencyUnit}
                          </div>
                          <p className="text-theme-green-2 border-green-500 border rounded-md text-center">
                            Free
                          </p>
                        </div>
                      </div>
                    );
                  })}
            </div>
          )}

          <div
            className="flex items-center gap-x-2 mt-10 mb-16 cursor-pointer"
            onClick={navigateTo}
          >
            <AiOutlinePlus size={18} />
            <span className="text-sm font-medium">Add more items</span>
          </div>

          {groupData && (
            <div className="w-full text-right">
              <button
                className="bg-[#40875D24] text-theme-green-2 font-semibold rounded-md px-3 py-1 ml-auto"
                onClick={() => {
                  notReady();
                  localStorage.removeItem("hasJoinedGroup");
                  // window.history.back();
                }}
              >
                Edit
              </button>
            </div>
          )}

          {groupData && (
            <div className="flex justify-between items-center">
              <h4 className="text-xl md:text-[28px]  font-omnes font-semibold">
                Participants
              </h4>
              <div className="flex gap-x-2 w-[200px] [&>p]:cursor-pointer [&>p]:text-center my-8 border-b [&>p]:pb-2">
                <p
                  className={`hover:text-red-500 w-1/2 ${
                    ready.show == 0 && "border-b-red-500 border-b-2"
                  }`}
                  onClick={() => setReady({ ...ready, show: 0 })}
                >
                  Not Ready:{" "}
                  {
                    gData?.participantList?.filter(
                      (participant) => !participant.isReady
                    )?.length
                  }
                </p>
                <p
                  className={`hover:text-red-500 w-1/2 ${
                    ready.show == 1 && "border-b-red-500 border-b-2"
                  }`}
                  onClick={() => setReady({ ...ready, show: 1 })}
                >
                  Ready:{" "}
                  {
                    gData?.participantList?.filter(
                      (participant) => participant.isReady
                    )?.length
                  }
                </p>
              </div>
            </div>
          )}

          {groupData && (
            <div className="shadow-restaurantCardSahadow px-4 py-8 rounded-lg">
              {ready?.show === 0 ? (
                <div className="space-y-3">
                  {gData &&
                    gData?.participantList?.map((participant, idx) => {
                      if (participant?.isReady === false) {
                        return (
                          <>
                            <div
                              key={idx}
                              onClick={() =>
                                setGroup((prev) => ({
                                  ...prev,
                                  viewSelection: participant?.participantId,
                                  liShow: !prev.liShow,
                                }))
                              }
                              className="flex gap-x-2 items-center w-full relative"
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden">
                                <img
                                  className="w-full h-full object-cover"
                                  src="/images/userIcon.jpeg"
                                  alt="user image"
                                />
                              </div>
                              <div className="font-sf w-full relative">
                                <h4 className="text-lg">
                                  {participant?.participantName}
                                  {gData?.hostebBy?.id ==
                                  participant?.participantId ? (
                                    <sup className="bg-black text-white rounded-md p-1 ml-4">
                                      Host
                                    </sup>
                                  ) : (
                                    <div>
                                      {gData?.hostebBy?.id ==
                                        localStorage.getItem("userId") && (
                                        <div
                                          className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center p-2 absolute right-0 top-0 cursor-pointer"
                                          onClick={() =>
                                            removeMember(
                                              gData?.orderId,
                                              participant?.participantId
                                            )
                                          }
                                        >
                                          <RiDeleteBinLine />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </h4>

                                <p className="text-sm font-light text-gray-500 flex gap-x-5 cursor-pointer">
                                  Choosing items &bull;{" "}
                                  {participant?.items?.length} items{" "}
                                  {participant?.items?.length > 0 && (
                                    <IoIosArrowDown
                                      className={`${
                                        participant?.participantId ===
                                          group?.viewSelection && group.liShow
                                          ? "rotate-180"
                                          : ""
                                      }`}
                                    />
                                  )}
                                </p>
                                <div className="absolute top-1 right-10 text-green-700">
                                  {participant?.subTotal}{" "}
                                  {gData?.currencyDetails?.symbol}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {participant?.items?.map((el, idx) => {
                                return (
                                  <div
                                    key={idx}
                                    className={`${
                                      participant?.participantId ==
                                        group?.viewSelection && group?.liShow
                                        ? ""
                                        : "h-0 overflow-hidden"
                                    }`}
                                  >
                                    <div className="flex gap-x-3 items-center pl-5">
                                      <img
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={BASE_URL + el?.productName?.image}
                                        alt=""
                                      />{" "}
                                      {el?.qty}x {el?.productName?.name}
                                    </div>
                                    <div className="pl-20 text-gray-500">
                                      {el?.addOns?.map((addon, k) => (
                                        <div>
                                          {addon?.qty +
                                            "x" +
                                            addon?.addOn?.name +
                                            ` (${addon?.total})`}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      }
                    })}
                </div>
              ) : (
                <div className="space-y-3">
                  {gData &&
                    gData?.participantList?.map((participant, idx) => {
                      if (participant?.isReady === true) {
                        return (
                          <>
                            <div
                              key={idx}
                              className="flex gap-x-2 items-center w-full"
                              onClick={() =>
                                setGroup((prev) => ({
                                  ...prev,
                                  viewSelection: participant?.participantId,
                                  liShow: !prev.liShow,
                                }))
                              }
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden">
                                <img
                                  className="w-full h-full object-cover"
                                  src="/images/userIcon.jpeg"
                                  alt="user image"
                                />
                              </div>
                              <div className="font-sf w-full relative">
                                <h4 className="text-lg">
                                  {participant?.participantName}
                                  {gData?.hostebBy?.id ==
                                  participant?.participantId ? (
                                    <sup className="bg-black text-white rounded-md p-1 ml-4">
                                      Host
                                    </sup>
                                  ) : (
                                    <div>
                                      {gData?.hostebBy?.id ==
                                        localStorage.getItem("userId") && (
                                        <div
                                          className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center p-2 absolute right-0 top-0 cursor-pointer"
                                          onClick={() =>
                                            removeMember(
                                              gData?.orderId,
                                              participant?.participantId
                                            )
                                          }
                                        >
                                          <RiDeleteBinLine />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </h4>
                                <p className="text-sm font-light text-gray-500 flex gap-x-5 cursor-pointer">
                                  Choosing items &bull;{" "}
                                  {participant?.items?.length} items{" "}
                                  {participant?.items?.length > 0 && (
                                    <IoIosArrowDown
                                      className={`${
                                        participant?.participantId ===
                                          group?.viewSelection && group.liShow
                                          ? "rotate-180"
                                          : ""
                                      }`}
                                    />
                                  )}
                                </p>
                                <div className="absolute top-1 right-10 text-green-700">
                                  {participant?.subTotal}{" "}
                                  {gData?.currencyDetails?.symbol}
                                </div>
                              </div>
                            </div>
                            {/* down arrow items show*/}
                            <div className={group?.liShow ? `space-y-2` : ""}>
                              {participant?.items?.map((el, i) => {
                                return (
                                  <div
                                    key={i}
                                    className={` ${
                                      participant?.participantId ==
                                        group?.viewSelection && group?.liShow
                                        ? ""
                                        : "h-0 overflow-hidden"
                                    }`}
                                  >
                                    <div className="flex gap-x-3 items-center pl-5">
                                      <img
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={BASE_URL + el?.productName?.image}
                                        alt=""
                                      />{" "}
                                      {el?.qty}x {el?.productName?.name}
                                    </div>

                                    <div className="pl-20 text-gray-500">
                                      {el?.addOns?.map((addon, k) => (
                                        <div>
                                          {addon?.qty +
                                            "x" +
                                            addon?.addOn?.name +
                                            ` (${addon?.total})`}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      }
                    })}
                </div>
              )}
            </div>
          )}

          {groupData &&
            (combine ? getFree?.length > 0 : selectedPromotion === "BOGO") && (
              <>
                <h4 className="text-xl md:text-2xl  font-tt-norms font-black my-6">
                  Free Items
                </h4>

                <div className="shadow-restaurantCardSahadow px-4 py-8 rounded-lg">
                  {combine
                    ? getFree?.map((cart, index) => {
                        return (
                          <div
                            key={index}
                            className="flex justify-between gap-x-2"
                          >
                            <div className="flex gap-x-5">
                              <div className="border-2  border-gray-100 rounded-xl sm:w-28 sm:h-20 w-6 h-6 ">
                                <img
                                  className="w-full h-full object-cover rounded-md"
                                  src={`${BASE_URL}${cart?.image}`}
                                  alt={cart?.name}
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-x-3 my-1">
                                  <h5>
                                    <span className="text-theme-green-2">
                                      {cart?.quantity}x
                                    </span>{" "}
                                    <b className="capitalize">{cart?.name}</b>
                                  </h5>
                                </div>
                                <div className="capitalize text-sm font-normal text-black text-opacity-60">
                                  <ul>
                                    {cart?.addOns?.map((add, addKey) => (
                                      <li key={addKey} className="ml-2">
                                        {`${add?.quantity}x ${add?.name} ${
                                          add?.total > 0
                                            ? `(${add?.total}.00)`
                                            : ""
                                        }`}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-base text-theme-green-2 line-through">
                                {formatPrice(
                                  (cart?.unitPrice +
                                    cart?.addOns?.reduce((accumulator, ele) => {
                                      return (
                                        accumulator +
                                        (ele?.total || 0) * (ele?.quantity || 1)
                                      );
                                    }, 0)) *
                                    cart?.quantity
                                )}
                                {activeResData?.currencyUnit}
                              </div>
                              <p className="text-theme-green-2 border-green-500 border rounded-md text-center">
                                Free
                              </p>
                            </div>
                          </div>
                        );
                      })
                    : availablePromotions
                        .filter((promotion) => promotion.applied === true)
                        .some((promotion) => promotion.bannerType === "BOGO") &&
                      getFree?.map((cart, index) => {
                        return (
                          <div
                            key={index}
                            className="flex justify-between gap-x-2"
                          >
                            <div className="flex gap-x-5">
                              <div className="border-2  border-gray-100 rounded-xl sm:w-28 sm:h-20 w-6 h-6 ">
                                <img
                                  className="w-full h-full object-cover rounded-md"
                                  src={`${BASE_URL}${cart?.image}`}
                                  alt={cart?.name}
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-x-3 my-1">
                                  <h5>
                                    <span className="text-theme-green-2">
                                      {cart?.quantity}x
                                    </span>{" "}
                                    <b className="capitalize">{cart?.name}</b>
                                  </h5>
                                </div>
                                <div className="capitalize text-sm font-normal text-black text-opacity-60">
                                  <ul>
                                    {cart?.addOns?.map((add, addKey) => (
                                      <li key={addKey} className="ml-2">
                                        {`${add?.quantity}x ${add?.name} ${
                                          add?.total > 0
                                            ? `(${add?.total}.00)`
                                            : ""
                                        }`}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-base text-theme-green-2 line-through">
                                {formatPrice(
                                  (cart?.unitPrice +
                                    cart?.addOns?.reduce((accumulator, ele) => {
                                      return (
                                        accumulator +
                                        (ele?.total || 0) * (ele?.quantity || 1)
                                      );
                                    }, 0)) *
                                    cart?.quantity
                                )}
                                {activeResData?.currencyUnit}
                              </div>
                              <p className="text-theme-green-2 border-green-500 border rounded-md text-center">
                                Free
                              </p>
                            </div>
                          </div>
                        );
                      })}
                </div>
              </>
            )}

          {/* ============Payment Method start============= */}

          <div className="flex items-center gap-x-2 mt-10 mb-8">
            {/* <MdOutlinePayment size={24} className="text-2xl" /> */}
            <h3 className="font-semibold text-xl sm:text-[1.75rem] font-omnes ">
              Payment Method
            </h3>
          </div>
          <div className="bg-white rounded-lg p-5 my-4 border cursor-pointer duration-200 hover:shadow-discoveryCardShadow">
            {selectedPayment?.name ? (
              <div
                className="flex items-center gap-3 justify-between"
                onClick={() => {
                  setPaymentModal(true);
                  setFeeWorks(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-between gap-x-4 w-full text-lg cursor-pointer"
                    onClick={() => {
                      setPaymentModal(true);
                      setFeeWorks(false);
                    }}
                  >
                    <img
                      src={`${
                        selectedPayment?.name.includes("Cards")
                          ? "/images/credit-card.webp"
                          : selectedPayment?.name.includes("Apple")
                          ? "/images/epay.webp"
                          : selectedPayment?.name.includes("Google")
                          ? "/images/gpay.webp"
                          : selectedPayment?.name.includes("COD")
                          ? "/images/cashPay.png"
                          : ""
                      }`}
                      alt="payment-card"
                      className="w-9 h-9 object-contain"
                    />

                    <div>
                      <p className="text-theme-green-2 text-base">
                        {selectedPayment?.name}
                      </p>
                      <p className="text-sm text-checkoutTextColor/65">
                        The choosen payment method will be charged
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-theme-black-2 text-xl">
                  <button>
                    <FaAngleRight color="black" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-between w-full text-lg cursor-pointer"
                onClick={() => {
                  setFeeWorks(false);
                  setPaymentModal(true);
                }}
              >
                <div className="flex items-center gap-x-4">
                  <IoCard size={24} />

                  <div className="space-y-[0.9px]">
                    <p className="text-theme-green-2 text-base">
                      Choose a payment method
                    </p>
                    <p className="text-sm text-checkoutTextColor/65">
                      Please add a payment method to continue with your order
                    </p>
                  </div>
                </div>
                <div className="text-theme-black-2 text-xl">
                  <button>
                    <FaAngleRight color="black" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =====Stamp card======= */}

          {selectedStampCard?.value > 0 && (
            <div className="mt-10 pb-5">
              <div className="flex justify-between items-center border rounded-md px-4 py-3 cursor-pointer mt-5 hover:shadow-discoveryCardShadow">
                <div className="flex items-center gap-x-2">
                  <img
                    className="w-8"
                    src="/images/stampCard/bannerIcon.png"
                    alt=""
                  />
                  <div className="">
                    <p className="text-lg font-medium">Use StampCard Points</p>
                    <p className="text-sm text-gray-500">
                      {selectedStampCard.value +
                        " " +
                        activeResData?.currencyUnit}
                    </p>
                  </div>
                </div>{" "}
                <Switch
                  onChange={handleStampChange}
                  checked={stampCard}
                  onColor="#379465"
                  offColor="#d9d9d9"
                  checkedIcon={false}
                  uncheckedIcon={false}
                  height={29}
                  width={52}
                  handleDiameter={23}
                />
              </div>
            </div>
          )}

          {/* =====Fomino points======= */}

          {getProfile?.data?.data?.creditPoints > 0 && (
            <div className=" pb-5">
              <div className="flex justify-between items-center border rounded-md px-4 py-3 cursor-pointer mt-5 hover:shadow-discoveryCardShadow">
                <div className="flex items-center gap-x-2">
                  <img
                    className="w-8"
                    src="/images/restaurants/fominopoints.png"
                    alt=""
                  />
                  <div className="">
                    <p className="text-lg font-medium">Use Fomino credits</p>
                    <p className="text-sm text-gray-500">
                      {getProfile?.data?.data?.creditPoints +
                        " " +
                        activeResData?.currencyUnit}
                    </p>
                  </div>
                </div>{" "}
                <Switch
                  onChange={handleFominoCredits}
                  checked={fominoCredits}
                  onColor="#379465"
                  offColor="#d9d9d9"
                  checkedIcon={false}
                  uncheckedIcon={false}
                  height={29}
                  width={52}
                  handleDiameter={23}
                />
              </div>
            </div>
          )}

          {deliveryData.how === 1 && (
            <>
              <div className="flex items-center gap-x-2 mt-10 mb-8">
                <h3 className="font-semibold text-xl sm:text-[1.75rem] font-omnes ">
                  Tip the courier
                </h3>
              </div>
              <div className="bg-white rounded-lg border p-5 my-4">
                <div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-light text-checkoutTextColor/65 max-w-[70%]">
                      They'll get 100% of your tip after the delivery.
                    </p>
                    <p className="text-sm font-light text-checkoutTextColor/65 whitespace-nowrap">
                      {activeResData?.currencyUnit}{" "}
                      {formatPrice(tip?.tip) || "0.00"}
                    </p>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mt-5 cursor-pointer ">
                    <button
                      onClick={() => setTip({ ...tip, other: false, tip: 0 })}
                      className={`h-8 font-medium text-sm text-black text-opacity-80 border-2 sm:px-5 rounded-full w-full hover:bg-theme-red hover:bg-opacity-20 hover:border-theme-red ${
                        tip.tip === 0
                          ? "border-theme-red"
                          : "border-checkoutGrayBorder text-checkoutTextColor/60"
                      }`}
                    >
                      0 CHF
                    </button>
                    <button
                      onClick={() => setTip({ ...tip, other: false, tip: 1 })}
                      className={`h-8 font-medium text-sm text-black text-opacity-80 border-2 sm:px-5 rounded-full w-full hover:bg-theme-red hover:bg-opacity-20 hover:border-theme-red ${
                        tip.tip === 1
                          ? "border-theme-red"
                          : "border-checkoutGrayBorder text-checkoutTextColor/60"
                      }`}
                    >
                      1 CHF
                    </button>
                    <button
                      onClick={() => setTip({ ...tip, other: false, tip: 2 })}
                      className={`h-8 font-medium text-sm text-black text-opacity-80 border-2 sm:px-5 rounded-full w-full hover:bg-theme-red hover:bg-opacity-20 hover:border-theme-red ${
                        tip.tip === 2
                          ? "border-theme-red"
                          : "border-checkoutGrayBorder text-checkoutTextColor/60"
                      }`}
                    >
                      2 CHF
                    </button>
                    <button
                      onClick={() => setTip({ ...tip, other: false, tip: 5 })}
                      className={`h-8 font-medium text-sm text-black text-opacity-80 border-2 sm:px-5 rounded-full w-full hover:bg-theme-red hover:bg-opacity-20 hover:border-theme-red ${
                        tip.tip === 5
                          ? "border-theme-red"
                          : "border-checkoutGrayBorder text-checkoutTextColor/60"
                      }`}
                    >
                      5 CHF
                    </button>
                    <button
                      onClick={() => setTip({ ...tip, other: true, tip: 10 })}
                      className={`h-8 font-medium text-sm text-black text-opacity-80 border-2 sm:px-5 rounded-full w-full hover:bg-theme-red hover:bg-opacity-20 hover:border-theme-red ${
                        tip.other
                          ? "border-theme-red"
                          : "border-checkoutGrayBorder text-checkoutTextColor/60"
                      }`}
                    >
                      Other
                    </button>
                  </div>
                  {tip.other && (
                    <div className="relative mt-4">
                      <input
                        value={tip.tip}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^[1-9]\d*$/.test(value)) {
                            setTip({ ...tip, tip: value });
                          }
                        }}
                        type="text"
                        min={1}
                        className="py-3 px-5 w-full rounded-lg font-normal text-base text-center border-2 border-checkoutGrayBorder focus:outline-theme-red"
                      />
                      <button
                        onClick={() => setTip({ ...tip, tip: tip.tip - 1 })}
                        disabled={tip.tip === 1 ? true : false}
                        className={`p-1 rounded-full hover:bg-opacity-40 absolute top-1/2 left-5 -translate-y-1/2 ${
                          tip.tip === 1
                            ? "text-black bg-black bg-opacity-20 cursor-not-allowed"
                            : "text-theme-red bg-theme-red bg-opacity-20"
                        }`}
                      >
                        <FaMinus size={12} />
                      </button>
                      <button
                        onClick={() => setTip({ ...tip, tip: tip.tip + 1 })}
                        className={`p-1 rounded-full hover:bg-opacity-40 absolute top-1/2 right-5 -translate-y-1/2 text-theme-red bg-theme-red bg-opacity-20
                    }`}
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* =====Redeem code======= */}

              <div className="flex items-center gap-x-2 mt-10 pb-5">
                <h3 className="font-semibold text-xl sm:text-[1.75rem] font-omnes ">
                  Redeem code
                </h3>
              </div>
              <div className="">
                <p className="text-sm font-light text-checkoutTextColor mb-4">
                  If you have a Fomino gift card or promo code, enter it below
                  to claim your benefits.
                </p>

                <div className="flex gap-x-4">
                  <FloatingLabelInput
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter code..."
                  />
                  <button
                    onClick={checkCoupon}
                    className="text-base text-center font-bold bg-theme-red rounded-lg h-[54px] text-white min-w-[115px] w-[40%] whitespace-nowrap"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <div
          className={`bg-white rounded-2xl relative xl:min-w-[399px] w-full lg:shadow-checkoutBoxShadow lg:p-6 lg:col-span-2 h-max space-y-6 lg:sticky lg:top-40 lg:right-7 lg:-mt-32`}
        >
          <div className="flex flex-col text-xl md:text-2xl">
            <h3 className="font-semibold font-omnes">Prices in CHF</h3>
            <p className="text-sm font-light text-checkoutTextColor/65 pb-6">
              incl. taxes (if applicable)
            </p>
            <p
              onClick={() => {
                setFeeWorks(true);
                setPaymentModal(true);
              }}
              className="text-base font-normal text-theme-red-2 cursor-pointer"
            >
              How fees work
            </p>
          </div>
          <div className="space-y-2.5 my-4">
            <div className="flex items-center justify-between gap-x-2">
              <h5 className="text-base text-checkoutTextColor">
                Items subtotal
              </h5>
              <h6>
                {groupData ? (
                  combine ? (
                    <div>
                      <span
                        className={
                          afterDisCombine > 0
                            ? "line-through text-gray-500"
                            : ""
                        }
                      >
                        {formatPrice(totalReadySubTotal)}{" "}
                      </span>
                      {afterDisCombine > 0 && formatPrice(afterDisCombine)}{" "}
                      {activeResData?.currencyUnit}
                    </div>
                  ) : (
                    <div>
                      <span
                        className={
                          afterDiscount > 0 ? "line-through text-gray-500" : ""
                        }
                      >
                        {formatPrice(totalReadySubTotal)}{" "}
                      </span>
                      {afterDiscount > 0 && formatPrice(afterDiscount)}{" "}
                      {activeResData?.currencyUnit}
                    </div>
                  )
                ) : //group order subtotal end here with combine true and false
                !combine ? (
                  <div>
                    <span
                      className={
                        afterDiscount > 0 ? "line-through text-gray-500" : ""
                      }
                    >
                      <span className="line-through text-gray-500">
                        {stampCard && preTotalPrice}
                      </span>{" "}
                      {formatPrice(totalPrice)}
                    </span>{" "}
                    {afterDiscount > 0 &&
                      formatPrice(totalPrice - afterDisCombine)}{" "}
                    {activeResData?.currencyUnit}
                  </div>
                ) : (
                  <div>
                    <span
                      className={
                        afterDisCombine > 0 ? "line-through text-gray-500" : ""
                      }
                    >
                      {formatPrice(totalPrice)}
                    </span>{" "}
                    {afterDisCombine > 0 &&
                      formatPrice(totalPrice - afterDisCombine)}{" "}
                    {activeResData?.currencyUnit}
                  </div>
                )}
              </h6>
            </div>
            {deliveryData.how === 1 && (
              <>
                <div className="flex items-center justify-between gap-x-2">
                  <h5 className="text-base md:text-md text-checkoutTextColor">
                    Service Fee
                  </h5>
                  <h6>
                    {deliveryCharges?.serviceCharges
                      ? parseFloat(deliveryCharges?.serviceCharges).toFixed(2)
                      : 0}{" "}
                    {deliveryCharges?.currencyUnit}
                  </h6>
                </div>
                <div className="flex items-center justify-between gap-x-2">
                  <h5 className="text-base md:text-md text-checkoutTextColor">
                    Delivery Fee ({deliveryCharges?.distance} km)
                  </h5>

                  <h6 className="flex gap-x-2">
                    {deliveryCharges?.updatedDeliveryCharges !== null ? (
                      <>
                        <span className="line-through">
                          {" "}
                          {parseFloat(
                            deliveryCharges?.deliveryCharges || 0
                          ).toFixed(2)}
                        </span>{" "}
                        <p>
                          {parseFloat(
                            deliveryCharges?.updatedDeliveryCharges || 0
                          )}
                        </p>
                      </>
                    ) : (
                      parseFloat(deliveryCharges?.deliveryCharges || 0).toFixed(
                        2
                      )
                    )}{" "}
                    {deliveryCharges?.currencyUnit}
                  </h6>
                </div>

                {activeResData?.smallOrderFee &&
                  order?.subTotal < activeResData?.minOrderAmount && (
                    <div className="flex items-center justify-between gap-x-2">
                      <h5 className="text-base md:text-md text-checkoutTextColor">
                        Small order fee
                      </h5>{" "}
                      <h6 className="flex gap-x-2">
                        {(
                          activeResData?.minOrderAmount - order?.subTotal
                        ).toFixed(2)}{" "}
                        {activeResData?.currencyUnit}
                      </h6>
                    </div>
                  )}

                {stampCard && (
                  <div className="flex items-center justify-between gap-x-2 md:text-md text-checkoutTextColor">
                    <h5 className="">StampCard points</h5>

                    <h6 className="flex gap-x-2">
                      -{usedPoints}
                      {deliveryCharges?.currencyUnit}
                    </h6>
                  </div>
                )}
                {tip?.tip >= 1 && (
                  <div className="flex items-center justify-between gap-x-2">
                    <h5 className="text-base md:text-md text-checkoutTextColor">
                      Tip the courier
                    </h5>
                    <h6>
                      {tip?.tip ? parseFloat(tip?.tip).toFixed(2) : 0}{" "}
                      {activeResData?.currencyUnit}
                    </h6>
                  </div>
                )}
              </>
            )}

            {stampCard && deliveryData.how === 2 && (
              <div className="flex items-center justify-between gap-x-2">
                <h5 className="text-base md:text-lg font-semibold text-checkoutTextColor text-opacity-50">
                  StampCard points
                </h5>

                <h6 className="flex gap-x-2">
                  -{usedPoints}
                  {deliveryCharges?.currencyUnit}
                </h6>
              </div>
            )}

            {fominoCredits && (
              <div className="flex items-center justify-between gap-x-2 md:text-md text-checkoutTextColor">
                <h5 className="">Credits</h5>

                <h6 className="flex gap-x-2">
                  -{localStorage.getItem("credits") || 0}{" "}
                  {deliveryCharges?.currencyUnit}
                </h6>
              </div>
            )}

            {deliveryData.how === 2 && (
              <div className="flex items-center justify-between gap-x-2">
                <h5 className="text-base md:text-md text-checkoutTextColor">
                  Service Fee
                </h5>
                <h6>
                  {activeResData?.service_charges
                    ? parseFloat(activeResData?.service_charges).toFixed(2)
                    : 0}{" "}
                  {deliveryCharges?.currencyUnit}
                </h6>
              </div>
            )}
            {activeResData?.smallOrderFee &&
              deliveryData.how === 2 &&
              order?.subTotal < activeResData?.minOrderAmount && (
                <div className="flex items-center justify-between gap-x-2">
                  <h5 className="text-base md:text-md text-checkoutTextColor">
                    Small order fee
                  </h5>{" "}
                  <h6 className="flex gap-x-2">
                    {(activeResData?.minOrderAmount - order?.subTotal).toFixed(
                      2
                    )}{" "}
                    {activeResData?.currencyUnit}
                  </h6>
                </div>
              )}
            <div className="flex items-center justify-between gap-x-2 pb-4">
              <h5 className="font-semibold text-checkoutTextColor text-base">
                Total
              </h5>
              <h6 className="font-semibold text-checkoutTextColor text-base">
                {groupData ? (
                  <>
                    {" "}
                    {deliveryData?.how == 1
                      ? (() => {
                          let totalCharges = parseFloat(
                            (combine
                              ? afterDisCombine || totalReadySubTotal
                              : afterDiscount || totalReadySubTotal) +
                              (deliveryCharges?.deliveryCharges
                                ? deliveryCharges?.updatedDeliveryCharges !==
                                  null
                                  ? parseInt(
                                      deliveryCharges.updatedDeliveryCharges
                                    )
                                  : parseInt(deliveryCharges.deliveryCharges)
                                : 0) +
                              (deliveryCharges?.serviceCharges
                                ? parseInt(deliveryCharges.serviceCharges)
                                : 0) +
                              (deliveryCharges?.packingFee
                                ? parseInt(deliveryCharges.packingFee)
                                : 0) +
                              (tip?.tip >= 1 ? parseInt(tip.tip) : 0)
                          ).toFixed(2);

                          // Points deduction logic
                          const points = Number(
                            getProfile?.data?.data?.creditPoints
                          );

                          let used = 0;
                          if (fominoCredits && points <= totalCharges) {
                            used = points;
                          } else if (fominoCredits) {
                            used = totalCharges;
                          }

                          localStorage.setItem("credits", used);
                          const finalTotal = totalCharges - used;
                          return finalTotal?.toFixed(2);
                        })()
                      : (() => {
                          let totalCharge = parseFloat(
                            combine
                              ? afterDisCombine || totalReadySubTotal
                              : (afterDiscount || totalReadySubTotal) +
                                  (parseFloat(activeResData?.service_charges) ||
                                    0) +
                                  (parseFloat(deliveryCharges?.packingFee) || 0)
                          )?.toFixed(2);

                          // Points deduction logic
                          const points = Number(
                            getProfile?.data?.data?.creditPoints
                          );

                          let used = 0;
                          if (fominoCredits && points <= totalCharge) {
                            used = points;
                          } else if (fominoCredits) {
                            used = totalCharge;
                          }

                          localStorage.setItem("credits", used);
                          const finalTotal = totalCharge - used;
                          return finalTotal?.toFixed(2);
                        })()}{" "}
                  </>
                ) : deliveryData?.how === 1 ? (
                  (() => {
                    const totalCharges = parseFloat(
                      (
                        (combine
                          ? totalPrice - afterDisCombine
                          : totalPrice - afterDisCombine) +
                        smallOrderFee +
                        (deliveryCharges?.deliveryCharges
                          ? deliveryCharges?.updatedDeliveryCharges !== null
                            ? parseInt(deliveryCharges.updatedDeliveryCharges)
                            : parseInt(deliveryCharges.deliveryCharges)
                          : 0) +
                        (deliveryCharges?.serviceCharges
                          ? parseInt(deliveryCharges.serviceCharges)
                          : 0) +
                        (deliveryCharges?.packingFee
                          ? parseInt(deliveryCharges.packingFee)
                          : 0) +
                        (tip?.tip >= 1 ? parseInt(tip.tip) : 0)
                      ).toFixed(2)
                    ).toFixed(2);

                    // Points deduction logic
                    const points = Number(getProfile?.data?.data?.creditPoints);

                    let used = 0;
                    if (fominoCredits && points <= totalCharges) {
                      used = points;
                    } else if (fominoCredits) {
                      used = totalCharges;
                    }

                    localStorage.setItem("credits", used);
                    const finalTotal = totalCharges - used;
                    return finalTotal?.toFixed(2);
                  })()
                ) : (
                  (() => {
                    let totalCharges = parseFloat(
                      combine
                        ? afterDisCombine || totalPrice
                        : afterDiscount || totalPrice
                    ).toFixed(2);

                    // Points deduction logic
                    const points = Number(getProfile?.data?.data?.creditPoints);

                    let used = 0;
                    if (fominoCredits && points <= totalCharges) {
                      used = points;
                    } else if (fominoCredits) {
                      used = totalCharges;
                    }
                    localStorage.setItem("credits", used);

                    const finalTotal =
                      parseInt(activeResData?.service_charges || 0) +
                      smallOrderFee +
                      parseFloat(totalCharges) -
                      parseFloat(used);
                    return finalTotal?.toFixed(2);
                  })()
                )}{" "}
                {activeResData?.currencyUnit}
              </h6>
            </div>

            <div className="border-dashed border" />
          </div>
          {globalPromotions?.length > 0 && (
            <div
              className={`font-semibold  ${
                globalPromotions?.length > 0 ? "!mb-[-20px]" : "!mb-[-30px]"
              }`}
            >
              {combine ? (
                <p className=" text-base font-normal text-theme-black-2">
                  {offerType.offerType == "stampCard" ? (
                    "Note: This offer will only apply to subtotal"
                  ) : (
                    <div className="flex justify-between items-center">
                      <p>Applied offers</p>

                      <p className="font-semibold text-checkoutTextColor text-base">
                        -{" "}
                        {(
                          parseFloat(
                            priorityProduct?.reduce(
                              (sum, item) => sum + item.Total,
                              0
                            )
                          ) -
                          parseFloat(afterDiscount || afterDisCombine) +
                          getFree
                            ?.map(
                              (cart) =>
                                (parseFloat(cart?.unitPrice) +
                                  cart?.addOns?.reduce((accumulator, ele) => {
                                    return (
                                      parseFloat(accumulator) +
                                      (parseFloat(ele?.total) || 0) *
                                        (parseFloat(ele?.quantity) || 1)
                                    );
                                  }, 0)) *
                                parseFloat(cart?.quantity)
                            )
                            .reduce(
                              (acc, currentValue) => acc + currentValue,
                              0
                            ) +
                          parseFloat(
                            globalPromotions?.some((itm) =>
                              itm?.bannerType?.includes("FreeDelivery")
                            )
                              ? deliveryCharges?.deliveryCharges
                              : 0
                          )
                        ).toFixed(2)}
                        <span> {activeResData?.currencyUnit}</span>
                      </p>
                    </div>
                  )}
                </p>
              ) : (
                <p
                  title="Click here"
                  className="py-t cursor-pointer"
                  onClick={() => {
                    if (!combine && !(offerType.offerType === "stampCard")) {
                      setPromotionMod(true);
                    }
                  }}
                >
                  {selectedPromotion ? (
                    <>
                      <div className="flex justify-between">
                        <p className="text-base font-normal text-theme-black-2">
                          Applied offer
                        </p>

                        <p>
                          {" "}
                          -{" "}
                          {combine == false && selectedPromotion === "Discount"
                            ? (
                                totalPrice - (afterDiscount || afterDisCombine)
                              ).toFixed(2)
                            : selectedPromotion === "BOGO"
                            ? getFree
                                ?.map(
                                  (cart) =>
                                    (parseFloat(cart?.unitPrice) +
                                      cart?.addOns?.reduce(
                                        (accumulator, ele) => {
                                          return (
                                            parseFloat(accumulator) +
                                            (parseFloat(ele?.total) || 0) *
                                              (parseFloat(ele?.quantity) || 1)
                                          );
                                        },
                                        0
                                      )) *
                                    parseFloat(cart?.quantity)
                                )
                                .reduce(
                                  (acc, currentValue) => acc + currentValue,
                                  0
                                )
                            : selectedPromotion === "FreeDelivery" &&
                              deliveryCharges?.deliveryCharges}{" "}
                          <span>{activeResData?.currencyUnit}</span>
                        </p>
                      </div>
                      <div className="w-full flex items-center justify-between gap-x-3 [&>p]:line-clamp-2 [&>p]:text-sm [&>p]:py-1.5">
                        {availablePromotions?.length > 0 &&
                          availablePromotions?.map((elem) => {
                            return (
                              !combine && (
                                <>
                                  {elem?.bannerType === "BOGO" &&
                                    elem?.applied && (
                                      <p
                                        key={elem.id}
                                        className={
                                          selectedPromotion === "BOGO" &&
                                          " text-sm font-normal text-checkoutTextColor/65"
                                        }
                                      >
                                        Buy {elem?.deal?.buyItemsQty} get{" "}
                                        {elem?.deal?.getItemsQty} free
                                      </p>
                                    )}
                                  {elem?.bannerType === "Discount" &&
                                    elem?.applied && (
                                      <p
                                        key={elem.id}
                                        className={
                                          selectedPromotion === "Discount" &&
                                          " text-sm font-normal text-checkoutTextColor/65"
                                        }
                                      >
                                        {`${elem?.discountType} ${
                                          elem?.discountValue
                                        } ${
                                          elem?.discountType === "Percentage"
                                            ? "%"
                                            : ""
                                        } off ${
                                          elem?.capMaxDiscount
                                            ? "max" + " " + elem?.capMaxDiscount
                                            : ""
                                        } on order above ${
                                          elem?.minimumOrderValue
                                        } ${activeResData?.currencyUnit}`}
                                      </p>
                                    )}
                                  {elem?.bannerType === "FreeDelivery" &&
                                    elem?.applied &&
                                    deliveryData.how == 1 && (
                                      <p
                                        className={
                                          selectedPromotion ===
                                            "FreeDelivery" &&
                                          `${
                                            deliveryCharges?.updatedDeliveryCharges ==
                                              0 &&
                                            selectedPromotion === "FreeDelivery"
                                              ? " text-theme-green-2"
                                              : ""
                                          } rounded-md duration-200`
                                        }
                                      >
                                        Free Delivery{" "}
                                        {deliveryCharges?.updatedDeliveryCharges !==
                                          0 &&
                                          selectedPromotion ===
                                            "FreeDelivery" && (
                                            <span className="text-red-500 text-xs">
                                              Outside Radius
                                            </span>
                                          )}
                                      </p>
                                    )}
                                </>
                              )
                            );
                          })}{" "}
                        <span className="text-theme-green-2 h-max text-xs">
                          Change
                        </span>{" "}
                      </div>
                    </>
                  ) : (
                    <p className="text-theme-green-2">
                      {offerType.offerType == "stampCard"
                        ? "Note: This offer will only apply to subtotal"
                        : globalPromotions?.length > 0 &&
                          "Available Promotions"}{" "}
                    </p>
                  )}
                </p>
              )}

              <div className="py-2 font-normal [&>p]:cursor-pointer [&>p]:text-sm  [&>p]:text-checkoutTextColor/65">
                {globalPromotions?.map((elem) => {
                  return (
                    combine && (
                      <>
                        {elem?.bannerType === "BOGO" && (
                          <p key={elem.id}>
                            Buy {elem?.deal?.buyItemsQty} get{" "}
                            {elem?.deal?.getItemsQty} free
                          </p>
                        )}
                        {elem?.bannerType === "Discount" && (
                          <p key={elem.id}>
                            {`${elem?.discountType} ${elem?.discountValue} ${
                              elem?.discountType === "Percentage" ? "%" : ""
                            } off ${
                              elem?.capMaxDiscount
                                ? "max" + elem?.capMaxDiscount
                                : ""
                            } on order above ${elem?.minimumOrderValue} ${
                              activeResData?.currencyUnit
                            }`}
                          </p>
                        )}
                        {elem?.bannerType === "FreeDelivery" &&
                          deliveryData.how == 1 && (
                            <p>
                              Free Delivery on order above{" "}
                              {elem?.freeDeliveryDetail?.minimumOrderValue +
                                " " +
                                activeResData?.currencyUnit}
                            </p>
                          )}
                      </>
                    )
                  );
                })}

                {!combine && (
                  <Modal
                    onClose={() => {
                      setPromotionMod(false);
                    }}
                    isOpen={promotionMod}
                    isCentered
                    size="lg"
                  >
                    <ModalOverlay />
                    <ModalContent
                      borderRadius={"20px"}
                      className="modal-content-custom"
                    >
                      <ModalHeader px={4} ml="auto">
                        <div
                          onClick={() => {
                            setPromotionMod(false);
                          }}
                          className="flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10  bg-theme-gray-17 hover:bg-theme-gray-16"
                        >
                          <IoClose size={30} />
                        </div>
                      </ModalHeader>
                      <ModalBody padding={0}>
                        <div className="font-sf font-medium text-base max-h-[calc(100vh-200px)] h-auto overflow-auto px-4  [&>p]:cursor-pointer [&>p]:h-[76px] [&>p]:border-b [&>p]:flex [&>p]:items-center [&>p]:justify-between mb-10">
                          <h5 className="text-3xl text-theme-black-2 font-omnes font-bold mt-3 mb-6">
                            Available Promotions
                          </h5>

                          {globalPromotions?.length > 0
                            ? globalPromotions?.map((elem, idx) => {
                                return (
                                  <>
                                    {elem?.bannerType === "BOGO" && (
                                      <p
                                        key={elem.id}
                                        onClick={() => {
                                          setChoose("BOGO");
                                          // const updatedPromotions =
                                          //   applySelectedPromotion(
                                          //     globalPromotions,
                                          //     "BOGO"
                                          //   );
                                          // setAvailablePromotions(
                                          //   updatedPromotions
                                          // );
                                        }}
                                        className={
                                          choose == "BOGO" &&
                                          "text-theme-green-2"
                                        }
                                      >
                                        Buy {elem?.deal?.buyItemsQty} get{" "}
                                        {elem?.deal?.getItemsQty} free
                                        {choose !== "BOGO" && (
                                          <button className=" bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-2 px-4 font-semibold outline-none">
                                            {t("Choose")}
                                          </button>
                                        )}
                                      </p>
                                    )}
                                    {elem?.bannerType === "Discount" && (
                                      <p
                                        key={elem.id}
                                        onClick={() => {
                                          setChoose("Discount");
                                          // const updatedPromotions =
                                          //   applySelectedPromotion(
                                          //     globalPromotions,
                                          //     "Discount"
                                          //   );
                                          // setAvailablePromotions(
                                          //   updatedPromotions
                                          // );
                                        }}
                                        className={
                                          choose == "Discount" &&
                                          "text-theme-green-2"
                                        }
                                      >
                                        {`${elem?.discountType} ${
                                          elem?.discountValue
                                        } ${
                                          elem?.discountType === "Percentage"
                                            ? "%"
                                            : ""
                                        } off ${
                                          elem?.capMaxDiscount
                                            ? "max" + " " + elem?.capMaxDiscount
                                            : ""
                                        } on order above ${
                                          elem?.minimumOrderValue
                                        } ${activeResData?.currencyUnit}`}

                                        {choose !== "Discount" && (
                                          <button className=" bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-2 px-4 font-semibold outline-none">
                                            {t("Choose")}
                                          </button>
                                        )}
                                      </p>
                                    )}
                                    {elem?.bannerType === "FreeDelivery" &&
                                      deliveryData.how == 1 && (
                                        <p
                                          onClick={() => {
                                            setChoose("FreeDelivery");
                                            // const updatedPromotions =
                                            //   applySelectedPromotion(
                                            //     globalPromotions,
                                            //     "FreeDelivery"
                                            //   );
                                            // setAvailablePromotions(
                                            //   updatedPromotions
                                            // );
                                          }}
                                          className={
                                            choose == "FreeDelivery" &&
                                            "text-theme-green-2"
                                          }
                                        >
                                          Free Delivery{" "}
                                          {choose !== "FreeDelivery" && (
                                            <button className=" bg-[#37946524] text-[#379465] bg-opacity-20 flex justify-center items-center text-end rounded-md py-2 px-4 font-semibold outline-none">
                                              {t("Choose")}
                                            </button>
                                          )}
                                          {deliveryCharges?.updatedDeliveryCharges !==
                                            0 &&
                                            choose === "FreeDelivery" && (
                                              <span className="text-yellow-300 text-xs">
                                                Outside Radius
                                              </span>
                                            )}
                                        </p>
                                      )}
                                  </>
                                );
                              })
                            : "No Promotion Available!"}
                        </div>
                      </ModalBody>

                      <ModalFooter px={4}>
                        <button
                          onClick={() => {
                            const updatedPromotions = applySelectedPromotion(
                              globalPromotions,
                              choose
                            );
                            setAvailablePromotions(updatedPromotions);
                            setSelectedPromotion(choose);
                            setPromotionMod(false);
                          }}
                          className="h-[54px] w-full bg-black text-white font-sf font-semibold text-base rounded-lg outline-none"
                        >
                          Apply
                        </button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                )}
              </div>
            </div>
          )}
          <div>
            <button
              disabled={disabled ? true : false}
              onClick={createOrder}
              className="bg-black w-full text-base font-bold text-white rounded-md h-[54px] flex justify-center items-center gap-x-2"
            >
              {deliveryData?.how === 1 && !deliveryAddress?.lat
                ? "Add Delivery Address"
                : !deliveryData?.when
                ? "Add Delivery Type"
                : deliveryData.when === 2 && schedule.time === ""
                ? "Add Schedule Time"
                : selectedPayment?.name == ""
                ? "Select Payment Method"
                : "Place Order"}
              {disabled && <RotatingLoader w="30" h="30" />}
            </button>
          </div>
        </div>
      </section>

      <button
        ref={clickMeRef}
        className="clickMe hidden"
        onClick={() => joinGroup()}
      >
        Click Me
      </button>

      <StampCardModal
        stampCardModal={stampCardModal}
        setStampCardModal={setStampCardModal}
      />
      <Footer />
    </>
  );
}
