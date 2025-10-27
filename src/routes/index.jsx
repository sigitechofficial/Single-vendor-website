import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import Loader from "../components/Loader";

const Cart = lazy(() => import("../pages/cart/Cart"));
const Timeline = lazy(() => import("../pages/cart/Timeline"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const Driver = lazy(() => import("../pages/driver/Driver"));
const DriverSignUp = lazy(() => import("../pages/driver/DriverSignUp"));
const BecomeCourierSteps = lazy(() =>
  import("../pages/driver/BecomeCourierSteps")
);
const NoPage = lazy(() => import("../pages/errors/NoPage"));
const GroupOrder = lazy(() => import("../pages/groupOrder/GroupOrder"));
const Home = lazy(() => import("../pages/home/Home"));
const RestaurantDetails = lazy(() =>
  import("../pages/restaurants/RestaurantDetails")
);
const Discovery = lazy(() => import("../pages/restaurants/Discovery"));
const NoDiscovery = lazy(() => import("../pages/restaurants/NoDiscovery"));
const StoreDetails = lazy(() => import("../pages/restaurants/StoreDetails"));
const Signup = lazy(() => import("../pages/retailer/Signup"));
const Wishlist = lazy(() => import("../pages/wishlist/Wishlist"));
const JoinGroupOrder = lazy(() => import("../pages/groupOrder/JoinGroupOrder"));
const Orders = lazy(() => import("../pages/support/Orders"));
const Profile = lazy(() => import("../pages/support/Profile"));
const Promotion = lazy(() => import("../pages/support/Promotion"));
const Payments = lazy(() => import("../pages/support/Payments"));
const RestaurantDetailsForApp = lazy(() =>
  import("../pages/restaurants/RestaurantDetailsForApp")
);
const Payment = lazy(() => import("../pages/payment/Payment"));
const DiscoveryByCuisine = lazy(() =>
  import("../pages/restaurants/DiscoveryByCusine")
);
const AllDone = lazy(() => import("../pages/groupOrder/AllDone"));
const GroupRestaurantDetails = lazy(() =>
  import("../pages/groupOrder/RestaurantDetails")
);
const RouteDecision = lazy(() => import("../pages/groupOrder/RouteDecision"));
const GroupCheckout = lazy(() => import("../pages/groupOrder/GroupCheckout"));
const OfferBannerDetails = lazy(() =>
  import("../pages/restaurants/OfferBannerDetails")
);
const StampCard = lazy(() => import("../pages/stamp-card/StampCard"));
const ShareTracking = lazy(() => import("../pages/cart/ShareTracking"));
const SearchResults = lazy(() =>
  import("../pages/search-results/SearchResults")
);
const Merchant = lazy(() => import("../pages/merchant/Merchant"));
const MerchantSignup = lazy(() => import("../pages/merchant/MerchantSignup"));
const PrivacyPolicy = lazy(() => import("../pages/support/PrivacyPolicy"));
const TermsConditions = lazy(() => import("../pages/support/TermsConditions"));
const PopularVenue = lazy(() => import("../pages/restaurants/PopularVenue"));
const RestaurantMap = lazy(() => import("../pages/restaurants/RestaurantMap"));

const activeResData = JSON.parse(localStorage.getItem("activeResData")) || [];

const CustomRoutes = [
  {
    path: "/.well-known/assetlinks.json",
    element: (
      <Suspense fallback={<Loader />}>
        <Navigate to="/.well-known/assetlinks.json" replace />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<Loader />}>
        <Discovery />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <Suspense fallback={<Loader />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode",
    element: (
      <Suspense fallback={<Loader />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/:cityName/:tab",
    element: (
      <Suspense fallback={<Loader />}>
        <Discovery />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/:cityName/:tab/hot-this-week-venues",
    element: (
      <Suspense fallback={<Loader />}>
        <PopularVenue />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/:cityName/:tab/map",
    element: (
      <Suspense fallback={<Loader />}>
        <RestaurantMap />
      </Suspense>
    ),
  },
  {
    path: "/discovery",
    element: (
      <Suspense fallback={<Loader />}>
        <NoDiscovery />
      </Suspense>
    ),
  },
  {
    path: "/checkout",
    element: (
      <Suspense fallback={<Loader />}>
        <Cart />
      </Suspense>
    ),
  },
  {
    path: "/payment",
    element: (
      <Suspense fallback={<Loader />}>
        <Payment />
      </Suspense>
    ),
  },
  {
    path: "/favourites",
    element: (
      <Suspense fallback={<Loader />}>
        <Wishlist />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/:cityName/restaurants/:slug/:produtInfo?",
    element: (
      <Suspense fallback={<Loader />}>
        <RestaurantDetails />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/:cityName/:tab/cuisine/:cuisine_name/:cuisineId",
    element: (
      <Suspense fallback={<Loader />}>
        <DiscoveryByCuisine />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/:cityName/offer/:offer_name/:bannerId",
    element: (
      <Suspense fallback={<Loader />}>
        <OfferBannerDetails />
      </Suspense>
    ),
  },
  {
    path: "/details/:resId",
    element: (
      <Suspense fallback={<Loader />}>
        <RestaurantDetailsForApp />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/:cityName/stores/:slug/:produtInfo?",
    element: (
      <Suspense fallback={<Loader />}>
        <StoreDetails />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/:cityName/restaurants/:slug/group-order",
    element: (
      <Suspense fallback={<Loader />}>
        <GroupOrder />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/:cityName/stores/:slug/group-order",
    element: (
      <Suspense fallback={<Loader />}>
        <GroupOrder />
      </Suspense>
    ),
  },
  {
    path: "/group-order",
    element: (
      <Suspense fallback={<Loader />}>
        <JoinGroupOrder />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/group-order/:groupId/:page/:produtInfo?",
    element: (
      <Suspense fallback={<Loader />}>
        {/* {activeResData?.restType === "store" ? (
          <StoreDetails />
        ) : ( */}
        <GroupRestaurantDetails />
        {/* )} */}
      </Suspense>
    ),
  },
  {
    path: "/group-order-checkout",
    element: (
      <Suspense fallback={<Loader />}>
        <GroupCheckout />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/group-order/:groupId/join",
    element: (
      <Suspense fallback={<Loader />}>
        <RouteDecision />
      </Suspense>
    ),
  },
  {
    path: "/retailer-signup",
    element: (
      <Suspense fallback={<Loader />}>
        <Signup />
      </Suspense>
    ),
  },
  {
    path: "/driver-home",
    element: (
      <Suspense fallback={<Loader />}>
        <Driver />
      </Suspense>
    ),
  },
  {
    path: "/merchant-signup",
    element: (
      <Suspense fallback={<Loader />}>
        <MerchantSignup />
      </Suspense>
    ),
  },
  {
    path: "/driver-signup",
    element: (
      <Suspense fallback={<Loader />}>
        <BecomeCourierSteps />
      </Suspense>
    ),
  },
  {
    path: "/merchant",
    element: (
      <Suspense fallback={<Loader />}>
        <Merchant />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<Loader />}>
        <Dashboard />
      </Suspense>
    ),
  },
  {
    path: "/timeline",
    element: (
      <Suspense fallback={<Loader />}>
        <Timeline />
      </Suspense>
    ),
  },
  {
    path: "/support/orders",
    element: (
      <Suspense fallback={<Loader />}>
        <Orders />
      </Suspense>
    ),
  },
  {
    path: "/support/profile",
    element: (
      <Suspense fallback={<Loader />}>
        <Profile />
      </Suspense>
    ),
  },
  {
    path: "/support/promotions & gifts",
    element: (
      <Suspense fallback={<Loader />}>
        <Promotion />
      </Suspense>
    ),
  },
  {
    path: "/support/bills & payments",
    element: (
      <Suspense fallback={<Loader />}>
        <Payments />
      </Suspense>
    ),
  },
  {
    path: "/:countryCode/group-order/:groupId/lobby",
    element: (
      <Suspense fallback={<Loader />}>
        <AllDone />
      </Suspense>
    ),
  },
  {
    path: "/stamp-card",
    element: (
      <Suspense fallback={<Loader />}>
        <StampCard />
      </Suspense>
    ),
  },
  {
    path: "/tracking",
    element: (
      <Suspense fallback={<Loader />}>
        <ShareTracking />
      </Suspense>
    ),
  },
  {
    path: "/search-results/:type?",
    element: (
      <Suspense fallback={<Loader />}>
        <SearchResults />
      </Suspense>
    ),
  },
  {
    path: "/privacy-policy",
    element: (
      <Suspense fallback={<Loader />}>
        <PrivacyPolicy />
      </Suspense>
    ),
  },
  {
    path: "/terms-conditions",
    element: (
      <Suspense fallback={<Loader />}>
        <TermsConditions />
      </Suspense>
    ),
  },
];

export default CustomRoutes;
