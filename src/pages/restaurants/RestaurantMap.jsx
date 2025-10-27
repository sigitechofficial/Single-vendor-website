import { useEffect, useRef, useState, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  InfoWindowF,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { useParams, useNavigate } from "react-router-dom";

import GetAPI from "../../utilities/GetAPI";
import { BASE_URL } from "../../utilities/URL";
import { googleApiKey } from "../../utilities/URL";
import { getRestaurantStatus } from "../../utilities/restuarantTimeMessage";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SwiperRestaurantCard from "../../components/SwiperRestaurantCard";
import { useMediaQuery } from "@chakra-ui/react";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaArrowLeftLong } from "react-icons/fa6";

const RestaurantMap = () => {
  const navigate = useNavigate();
  const { countryCode, cityName } = useParams();
  const mapRef = useRef(null);
  const swiperRef = useRef(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedSwiperIndex, setSelectedSwiperIndex] = useState(0);
  const [center, setCenter] = useState({ lat: 31.5204, lng: 74.3587 });
  const [zoom, setZoom] = useState(12);
  const [searchBox, setSearchBox] = useState(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [xl] = useMediaQuery("(min-width: 1280px)");
  const [lg] = useMediaQuery("(min-width: 1024px)");
  const [md] = useMediaQuery("(min-width: 768px)");

  // Get user location and restaurant data
  let lat, lng;
  if (cityName && cityName.startsWith("lat=") && cityName.includes("&lng=")) {
    const [latPart, lngPart] = cityName.split("&");
    lat = latPart.split("=")[1];
    lng = lngPart.split("=")[1];
  }

  const apiUrl =
    lat && lng
      ? `users/home3?lat=${lat}&lng=${lng}`
      : `users/home3?cityName=${cityName}`;

  const { data } = GetAPI(apiUrl);

  // Google Maps API loading
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleApiKey,
    libraries: ["places"],
  });

  // Set center based on user location or restaurant data
  useEffect(() => {
    if (lat && lng) {
      setCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
    } else if (data?.data?.restaurantList?.restaurantList?.length > 0) {
      const firstRestaurant = data.data.restaurantList.restaurantList[0];
      if (firstRestaurant.lat && firstRestaurant.lng) {
        setCenter({
          lat: parseFloat(firstRestaurant.lat),
          lng: parseFloat(firstRestaurant.lng),
        });
      }
    }
  }, [data, lat, lng]);

  // Map load handler
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;

    // Add a small delay to ensure the map is fully initialized
    setTimeout(() => {
      if (window.google && window.google.maps) {
        window.google.maps.event.trigger(map, "resize");
      }
    }, 100);
  }, []);

  // Handle marker click
  const handleMarkerClick = (restaurant, index) => {
    setSelectedRestaurant(restaurant);
    setSelectedSwiperIndex(index);

    // Smoothly navigate to the restaurant location
    if (mapRef.current) {
      const position = {
        lat: parseFloat(restaurant.lat),
        lng: parseFloat(restaurant.lng),
      };

      mapRef.current.panTo(position);
      setZoom(15);
    }

    // Update Swiper to show the corresponding card
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(index, 300);
    }
  };

  // Handle Swiper slide change
  const handleSwiperSlideChange = (swiper) => {
    const activeIndex = swiper.activeIndex;
    const allVenues = [
      ...(data?.data?.restaurantList?.restaurantList || []),
      ...(data?.data?.storeList?.storeList || []),
    ];
    const activeRestaurant = allVenues[activeIndex];

    if (activeRestaurant && !isMapInteracting) {
      setSelectedRestaurant(activeRestaurant);
      setSelectedSwiperIndex(activeIndex);

      // Smoothly navigate to the restaurant location
      if (mapRef.current) {
        const position = {
          lat: parseFloat(activeRestaurant.lat),
          lng: parseFloat(activeRestaurant.lng),
        };

        mapRef.current.panTo(position);
        setZoom(15);
      }
    }
  };

  // Handle info window close
  const handleInfoWindowClose = () => {
    setSelectedRestaurant(null);
  };

  // Navigate to restaurant details
  const navigateToRestaurant = (restaurant) => {
    const businessType = restaurant.businessType || "res";
    const slug =
      restaurant.businessName?.toLowerCase().replace(/\s+/g, "-") ||
      "restaurant";

    navigate(
      `/${countryCode}/${cityName}/${
        businessType === "store" ? "stores" : "restaurants"
      }/${slug}?id=${restaurant.id}&mcId=${restaurant.mcId}&res=${
        restaurant.id
      }`
    );
  };

  // Get restaurant status
  const getRestaurantStatusInfo = (restaurant) => {
    const status = getRestaurantStatus(restaurant);
    return status.message || "Open";
  };

  // Loading state
  if (!isLoaded) {
    return (
      <section className="relative">
        <div className="overflow-hidden rounded-lg h-[calc(100vh-120px)] relative text-black hover:text-opacity-50 max-[500px]:h-[calc(100svh-210px)] md:pt-[70px] pt-14 bg-gray-100"></div>
      </section>
    );
  }

  // Error state
  if (loadError) {
    return (
      <section className="relative">
        <div className="overflow-hidden rounded-lg h-[calc(100vh-120px)] relative text-black hover:text-opacity-50 max-[500px]:h-[calc(100svh-210px)] md:pt-[70px] pt-14 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">Error loading map</div>
            <div className="text-gray-600">Please try refreshing the page</div>
          </div>
        </div>
      </section>
    );
  }

  const restaurants = data?.data?.restaurantList?.restaurantList || [];
  const stores = data?.data?.storeList?.storeList || [];
  const allVenues = [...restaurants, ...stores];

  const onLoadSearchBox = (ref) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCenter({ lat, lng });
        setZoom(14);
      }
    }
  };

  return (
    <>
      <style>
        {`
          .gm-style .gm-style-iw-c {
            padding: 0 !important;
          }
          .gm-style .gm-style-iw-d {
            overflow: hidden !important;
          }
          .gm-style .gm-style-iw-t::after {
            display: none !important;
          }
          .gm-style .gm-style-iw-tc::after {
            display: none !important;
          }
          .gm-style .gm-style-iw-t::before {
            display: none !important;
          }
          .gm-style .gm-style-iw-tc::before {
            display: none !important;
          }
          .gm-style .gm-style-iw-c button[title="Close"] {
            display: none !important;
          }
          .gm-style .gm-style-iw-c .gm-style-iw-d button {
            display: none !important;
          }
        `}
      </style>
      <section className="relative overflow-hidden rounded-lg">
        <div className="h-[calc(100vh-200px)] relative text-black hover:text-opacity-50">
          {/* Search Box Overlay */}
          <div className="absolute top-2 right-16 z-20 w-[80%] md:w-[400px]">
            <StandaloneSearchBox
              onLoad={onLoadSearchBox}
              onPlacesChanged={onPlacesChanged}
            >
              <input
                type="text"
                placeholder="Search restaurants or places..."
                className="w-full p-2.5 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </StandaloneSearchBox>
          </div>

          <GoogleMap
            zoom={zoom}
            center={center}
            mapContainerStyle={{
              width: "100%",
              height: "100%",
            }}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: true,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            }}
            onLoad={onMapLoad}
            onDragStart={() => setIsMapInteracting(true)}
            onDragEnd={() => setIsMapInteracting(false)}
            onZoomChanged={() => setIsMapInteracting(false)}
          >
            {/* User location marker */}
            {lat && lng && (
              <MarkerF
                position={{ lat: parseFloat(lat), lng: parseFloat(lng) }}
                icon={{
                  url: "/images/pin-location.svg",
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
                title="Your Location"
              />
            )}

            {/* Restaurant markers */}
            {allVenues.map((venue, index) => {
              // Check status (works for both restaurants & stores)
              const statusMessage = getRestaurantStatusInfo(venue);
              const isOpen = statusMessage.includes("Open");
              const isTemporaryClosed =
                statusMessage.includes("Temporarily Closed");

              // Decide icon
              let iconUrl = "";
              if (isOpen) {
                iconUrl = "/images/activeRes.png";
              } else if (isTemporaryClosed) {
                iconUrl = "/images/closedRes.png";
              }

              return (
                <MarkerF
                  key={`${venue.id}-${index}`}
                  position={{
                    lat: parseFloat(venue.lat),
                    lng: parseFloat(venue.lng),
                  }}
                  icon={{
                    url: iconUrl,
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                  title={venue.businessName}
                  onClick={() => handleMarkerClick(venue, index)}
                />
              );
            })}

            {/* Info Window */}
            {selectedRestaurant && (
              <InfoWindowF
                position={{
                  lat: parseFloat(selectedRestaurant.lat),
                  lng: parseFloat(selectedRestaurant.lng),
                }}
                options={{
                  closeBoxURL: "",
                  enableCloseButton: false,
                  disableAutoPan: false,
                  pixelOffset: new window.google.maps.Size(0, -30),
                }}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="max-w-xs p-2">
                  <div className="flex items-start space-x-3">
                    <div
                      className="flex-shrink-0"
                      onClick={() => navigateToRestaurant(selectedRestaurant)}
                    >
                      <img
                        src={`${BASE_URL}${selectedRestaurant.logo}`}
                        alt={selectedRestaurant.businessName}
                        className="w-14 h-14 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = "/images/restaurants/restaurant.png";
                        }}
                      />
                    </div>
                  </div>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>

          {/* Restaurant Swiper Overlay */}
          {allVenues.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              {/* <div className="swiper-container  "> */}
              <div className="swiper-container  ">
                <Swiper
                  ref={swiperRef}
                  spaceBetween={26}
                  slidesPerView={xl ? 3 : lg ? 3.1 : md ? 2.1 : 1.4}
                  navigation={{
                    nextEl: ".custom-swiper-button-next",
                    prevEl: ".custom-swiper-button-prev",
                  }}
                  modules={[Navigation]}
                  className="[&>div>div>button]:shadow-discoveryCardShadow pb-4 pt-1 ps-1"
                  onSlideChange={handleSwiperSlideChange}
                >
                  {allVenues.map((venue, index) => (
                    <SwiperSlide key={`${venue.id}-${index}`}>
                      <div>
                        <SwiperRestaurantCard
                          id={venue.id}
                          img={`${BASE_URL}${venue.image}`}
                          logo={`${BASE_URL}${venue.logo}`}
                          title={venue.businessName}
                          desc={venue.description}
                          price={venue.deliveryFee}
                          currency={venue.units?.currencyUnit?.symbol}
                          deliveryTime={venue.deliveryTime}
                          deliveryFee={venue.deliveryFee}
                          rating={venue.rating}
                          isOpen={venue.isOpen}
                          isRushMode={venue.isRushMode}
                          openingTime={venue.openingTime}
                          closingTime={venue.closingTime}
                          completelyClosed={venue.completelyClosed}
                          getConfiguration={venue.getConfiguration}
                          restBanners={venue.restBanners}
                          time={venue.time}
                          isSelected={selectedSwiperIndex === index}
                          onClick={() => {
                            handleMarkerClick(venue, index);
                          }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation Buttons */}

                {/* <div className="swiper-btns hidden md:block">
                  <div className="custom-swiper-button-prev ">
                    <FaArrowLeftLong
                      size={20}
                      color="#E13743"
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 text-black"
                    />
                  </div>
                  <div className="custom-swiper-button-next">
                    <FaArrowRightLong
                      size={20}
                      color="#E13743"
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 text-black"
                    />
                  </div>
                </div> */}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default RestaurantMap;
