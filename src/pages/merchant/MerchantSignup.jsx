import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import GetAPI from "../../utilities/GetAPI";
import FloatingLabelInput from "../../components/FloatingLabelInput";
import CountrySelect from "../../components/CountrySelect";
import en from "react-phone-number-input/locale/en";
import { CiCamera } from "react-icons/ci";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { Autocomplete } from "@react-google-maps/api";
import { PostAPI } from "../../utilities/PostAPI";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import { useNavigate } from "react-router-dom";

const MerchantSignup = () => {
  const navigate = useNavigate();
  const { data: countriesData } = GetAPI("users/getCountriesAndCities");
  const [country, setCountry] = useState({
    countries: null || "PK",
  });
  const [cities, setCities] = useState([]);
  const [mapCenter, setMapCenter] = useState({
    lat: 31.5204,
    lng: 74.3587,
  });
  const [backImage, setbackImage] = useState(null);
  const [frontImage, setFrontImage] = useState(null);

  const [formData, setFormData] = useState({
    address: "",
    country: "PK",
    firstName: "",
    lastName: "",
    email: "",
    phoneNum: "",
    countryCode: "+92",
    backImage: "",
    frontImage: "",
    zipCode: "",
    cityId: "",
    businessType: "",
    businessName: "",
    businessEmail: "",
    businessContact: "",
    description: "",
    password: "",
    confirmPassword: "",
    lat: "",
    lng: "",
  });

  const getCountries =
    countriesData?.data?.countries?.map((countr) => ({
      value: countr.id,
      label: countr.name,
      short: countr.shortName,
    })) || [];

  const handleCountryChange = (selectedCountry) => {
    const selectCountry =
      getCountries.find((country) => country.value === formData.country) ||
      null;
    setCountry({
      ...country,
      countries: selectCountry,
      selectedCountryShortName: selectedCountry.short,
    });
    setFormData({
      ...formData,
      country: selectedCountry.value,
      selectedCountryShortName: selectedCountry.short,
    });
    setMapCenter({
      lat: selectedCountry.lat || 25.276987,
      lng: selectedCountry.lng || 55.296249,
    });

    const filteredCities =
      countriesData?.data?.countries?.find(
        (countr) => countr.id === selectedCountry.value
      )?.cities || [];

    setCities(
      filteredCities.map((city) => ({
        value: city.id,
        label: city.name,
      }))
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File size exceeds 1MB. Please upload a smaller file.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setbackImage(imageUrl);
      setFormData({ ...formData, backImage: file });
    }
  };

  const handleFrontImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File size exceeds 1MB. Please upload a smaller file.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setFrontImage(imageUrl);
      setFormData({ ...formData, frontImage: file });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [deliveryAddress, setDeliveryAddress] = useState({
    id: "",
    lat: "",
    lng: "",
    building: "",
    city: "",
    state: "",
    streetAddress: "",
  });

  const countriesRestriction = {
    componentRestrictions: { country: [`${country.selectedCountryShortName}`] },
  };
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
    // Update the formData or deliveryAddress with lat, lng
    setFormData({
      ...formData,
      lat: latLng.lat, // Store latitude
      lng: latLng.lng, // Store longitude
      address: place?.formatted_address,
      city: place?.address_components[place?.address_components?.length - 3]
        ?.long_name,
      state:
        place?.address_components[place?.address_components?.length - 2]
          ?.long_name,
    });

    setDeliveryAddress({
      ...deliveryAddress,
      streetAddress: place?.formatted_address,
      city: place?.address_components[place?.address_components?.length - 3]
        ?.long_name,
      state:
        place?.address_components[place?.address_components?.length - 2]
          ?.long_name,
      building: place?.name,
      lat: latLng.lat,
      lng: latLng.lng,
    });

    return null;
  };

  const inputStyle =
    "font-sf w-full resize-none font-normal text-base text-theme-black-2 rounded-lg py-1.5 px-4 bg-white border border-theme-gray-12 placeholder:text-black placeholder:text-opacity-40 focus:outline-none focus:border focus:border-green-700 hover:border hover:border-green-700 hover:cursor-pointer";

  const registerMerchant = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("code", formData.countryCode);
    formDataToSend.append("phoneNum", formData.phoneNum);
    formDataToSend.append("deviceToken", "web");
    formDataToSend.append("logo", formData.frontImage);
    formDataToSend.append("coverImage", formData.backImage);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("zipCode", formData.zipCode);
    formDataToSend.append("businessType", formData.businessType);
    formDataToSend.append("businessName", formData.businessName);
    formDataToSend.append("businessPhone", formData.businessContact);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("confirmPassword", formData.confirmPassword);
    formDataToSend.append("lat", formData.lat);
    formDataToSend.append("lng", formData.lng);
    formDataToSend.append("cityName", formData.cityName);
    formDataToSend.append("businessEmail", formData.businessEmail);

    let res = await PostAPI("/retailer/signup", formDataToSend);
    if (res?.data?.status === "1") {
      success_toaster(res?.data?.message);
      navigate("/");
    } else {
      error_toaster(res?.data?.message);
    }
  };
  return (
    <div className="w-full pb-10 bg-merchant-signup bg-cover bg-center bg-fixed">
      <div className="flex justify-between items-center mx-auto pe-4 sm:pe-[30px] sticky top-0">
        <Link to={"/"} className={`bg-[#de2931] ps-4 sm:ps-[30px]`}>
          <div>
            <img
              src="/images/logo2.gif"
              alt="fomino"
              className="lg:w-[264px] w-24 md:h-[70px] h-16 object-contain lg:object-cover"
            />
          </div>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row justify-between mx-[4vw] lg:mx-[10vw] mt-10 gap-y-10">
        <div className="space-y-6 ">
          <p className="font-omnes font-semibold text-2xl text-theme-black-2">
            For businesses big and small
          </p>
          <h2 className="font-bold text-theme-black-2 text-[48px] lg:text-[64px] font-omnes lg:max-w-[400px] leading-[68px]">
            Let's grow together
          </h2>
        </div>
        <div className="max-w-full lg:max-w-[520px] bg-white w-full p-6 rounded-2xl space-y-4">
          <Select
            value={country?.countries}
            onChange={handleCountryChange}
            options={getCountries}
            inputId="countries"
            placeholder="Select Country"
            styles={{
              control: (base, state) => ({
                ...base,
                borderRadius: "8px",
                border: state.isFocused ? "1px solid green-700" : "",
                borderColor: state.isFocused ? "green-700" : "#e7e7e7",
                boxShadow: state.isFocused ? "0 0 0 1px green" : "none",
                padding: "0px 6px",
                "&:hover": {
                  borderColor: "green",
                  boxShadow: "0 0 0 0px green",
                  cursor: "pointer",
                },
              }),
            }}
            className="rounded-xl"
          />
          <input
            type="text"
            className={inputStyle}
            placeholder="Business type"
            name="businessType"
            value={formData.businessType}
            onChange={handleInputChange}
          />

          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={getAddress} // Call getAddress when the place is selected
            options={countriesRestriction}
          >
            <input
              type="text"
              className={inputStyle}
              placeholder="Street address"
              // Remove onChange handler since it's handled by Autocomplete
            />
          </Autocomplete>
          <div className="flex gap-x-4">
            <div className="flex-1">
              <input
                type="text"
                className={inputStyle}
                placeholder="Zip code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex-1">
              <Select
                value={cities.find((city) => city.value === formData.cityId)}
                onChange={(selectedCity) =>
                  setFormData({
                    ...formData,
                    cityName: selectedCity.label,
                  })
                }
                options={cities}
                inputId="cities"
                placeholder="City"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: "8px",
                    border: state.isFocused ? "1px solid green-700" : "",
                    borderColor: state.isFocused ? "green-700" : "#e7e7e7",
                    boxShadow: state.isFocused ? "0 0 0 1px green" : "none",
                    padding: "0px 6px",
                    "&:hover": {
                      borderColor: "green",
                      boxShadow: "0 0 0 0px green",
                      cursor: "pointer",
                    },
                  }),
                }}
                className="rounded-xl "
              />
            </div>
          </div>
          <div className="flex gap-x-4">
            <input
              type="text"
              className={inputStyle}
              placeholder="First name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              className={inputStyle}
              placeholder="Last name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex gap-x-4">
            <input
              type="text"
              className={inputStyle}
              placeholder="Business Name"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
            />
            <input
              type="number"
              className={inputStyle}
              placeholder="Business Contact"
              name="businessContact"
              value={formData.businessContact}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex gap-x-4">
            <input
              type="email"
              className={inputStyle}
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <input
              type="email"
              className={inputStyle}
              placeholder="Business Email"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex gap-x-4">
            <div className="flex-1">
              <CountrySelect
                labels={en}
                value={formData.countryCode || "+92"}
                onChange={(e) => setFormData({ ...formData, countryCode: e })}
                hideLabel={true}
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                className={inputStyle}
                placeholder="Phone number"
                name="phoneNum"
                value={formData.phoneNum}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="flex gap-x-4">
            <input
              type="password"
              className={inputStyle}
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <input
              type="password"
              className={inputStyle}
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
          <input
            type="text"
            className={inputStyle}
            placeholder="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
          <div className="flex gap-x-4">
            <div className="relative border w-full h-28 rounded-lg flex justify-center items-center">
              {frontImage ? (
                <img
                  src={frontImage}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <MdOutlineAddPhotoAlternate size={24} color="#626264" />
                  <p className="text-theme-black-2 text-opacity-65 text-sm font-medium">
                    Upload logo
                  </p>
                </div>
              )}
              <input
                type="file"
                className="absolute w-full h-full cursor-pointer opacity-0"
                onChange={handleFrontImageChange}
                accept="image/*"
              />
            </div>
            <div className="relative border w-full h-28 rounded-lg flex justify-center items-center">
              {backImage ? (
                <img
                  src={backImage}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <MdOutlineAddPhotoAlternate size={24} color="#626264" />
                  <p className="text-theme-black-2 text-opacity-65 text-sm font-medium">
                    Upload cover image
                  </p>
                </div>
              )}
              <input
                type="file"
                className="absolute w-full h-full cursor-pointer opacity-0"
                onChange={handleImageChange}
              />
            </div>
          </div>
          <p className="text-theme-black-2 text-opacity-65 text-sm font-sf">
            By clicking Get started, you agree to User Terms of Service. You
            must be 18 years or older to complete the form.
          </p>
          <button
            className="!mt-4 font-sf py-[14px] px-5 w-full font-bold text-base text-white bg-theme-red hover:bg-opacity-95 border border-theme-red rounded-lg"
            onClick={registerMerchant}
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantSignup;
