import React, { useRef, useState } from "react";
import Header from "../../components/Header";
import { inputStyle } from "../../utilities/Input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { BiImageAdd } from "react-icons/bi";
import { MdOutlineModeEdit } from "react-icons/md";
import { loginAPI } from "../../utilities/PostAPI";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import { Autocomplete } from "@react-google-maps/api";
import GetAPI from "../../utilities/GetAPI";
import Select from "react-select";

export default function Signup() {
  const navigate = useNavigate();
  const { data } = GetAPI("retailer/getData");
  const zoneOptions = [];
  data?.data?.zones?.map((zone, index) => {
    return zoneOptions.push({
      value: zone?.id,
      label: zone?.name,
    });
  });
  const [loader, setLoader] = useState(false);
  const [step, setStep] = useState(1);
  const [retailer, setRetailer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "92",
    phoneNum: "",
    password: "",
    confirmPassword: "",
  });
  const [image, setImage] = useState({
    logo: null,
    logoKey: "",
    cover: null,
    coverKey: "",
  });
  const [business, setBusiness] = useState({
    businessType: "",
    businessName: "",
    businessEmail: "",
    businessCountryCode: "92",
    businessPhone: "",
    description: "",
    city: "",
    zip: "",
    zoneId: "",
  });
  const [mapData, setMapData] = useState({
    lat: "",
    lng: "",
    streetAddress: "",
  });
  const onChange = (e) => {
    setRetailer({ ...retailer, [e.target.name]: e.target.value });
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage((prevImage) => ({
      ...prevImage,
      [`${e.target.name}Key`]: file,
      [e.target.name]: file ? URL.createObjectURL(file) : null,
    }));
  };
  const onChange2 = (e) => {
    setBusiness({ ...business, [e.target.name]: e.target.value });
  };
  const autocompleteRef = useRef(null);
  const calculateRoute = () => {
    if (!autocompleteRef.current) {
      return;
    }
    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry || !place.geometry.location) {
      info_toaster("Please select an Address");
      return;
    }
    const latLng = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setMapData({
      ...mapData,
      lat: latLng.lat,
      lng: latLng.lng,
      streetAddress: place.name,
    });
  };
  const stepOneFunc = (e) => {
    e.preventDefault();
    if (retailer.firstName === "") {
      info_toaster("Please enter First Name");
    } else if (retailer.lastName === "") {
      info_toaster("Please enter Last Name");
    } else if (retailer.email === "") {
      info_toaster("Please enter Email");
    } else if (retailer.phoneNum === "") {
      info_toaster("Please enter Phone Number");
    } else if (retailer.password === "") {
      info_toaster("Please create Password");
    } else if (retailer.confirmPassword === "") {
      info_toaster("Please confirm Password");
    } else if (retailer.password !== retailer.confirmPassword) {
      info_toaster("Passwords do not match");
    } else {
      setStep(2);
    }
  };
  const stepThreeFunc = (e) => {
    e.preventDefault();
    if (image.logoKey === "") {
      info_toaster("Please upload Logo");
    } else if (image.coverKey === "") {
      info_toaster("Please upload Cover Image");
    } else {
      setStep(4);
    }
  };
  const retailerSignUpFunc = async (e) => {
    e.preventDefault();
    if (business.businessName === "") {
      info_toaster("Please enter Business Name");
    } else if (business.businessEmail === "") {
      info_toaster("Please enter Business Email");
    } else if (business.businessPhone === "") {
      info_toaster("Please enter Business Phone");
    } else if (business.description === "") {
      info_toaster("Please enter Business Description");
    } else if (mapData.streetAddress === "") {
      info_toaster("Please search an Address");
    } else if (business.city === "") {
      info_toaster("Please enter City");
    } else if (business.zip === "") {
      info_toaster("Please enter Zip Code");
    } else if (business.zoneId === "") {
      info_toaster("Please select your Zone");
    } else {
      setLoader(true);
      const formData = new FormData();
      formData.append("firstName", retailer.firstName);
      formData.append("lastName", retailer.lastName);
      formData.append("email", retailer.email);
      formData.append("CountryCode", retailer.countryCode);
      formData.append("phoneNum", retailer.phoneNum);
      formData.append("password", retailer.password);
      formData.append("confirmPassword", retailer.confirmPassword);
      formData.append("businessType", business.businessType);
      formData.append("businessName", business.businessName);
      formData.append("businessEmail", business.businessEmail);
      formData.append("code", business.businessCountryCode);
      formData.append("businessPhone", business.businessPhone);
      formData.append("description", business.description);
      formData.append("address", mapData.streetAddress);
      formData.append("city", business.city);
      formData.append("zipCode", business.zip);
      formData.append("deviceToken", "Dell i5");
      formData.append("logo", image.logoKey);
      formData.append("coverImage", image.coverKey);
      formData.append("lat", mapData.lat);
      formData.append("lng", mapData.lng);
      formData.append("zoneId", business.zoneId.value);
      let res = await loginAPI("retailer/signup", formData);
      if (res?.data?.status === "1") {
        success_toaster(res?.data?.message);
        navigate("/");
        setLoader(false);
      } else {
        error_toaster(res?.data?.message);
        setLoader(false);
      }
    }
  };
  return (
    <>
      {loader ? (
        <>
          <Header />
          <Loader />
        </>
      ) : step === 2 ? (
        <section className="min-h-screen grid md:grid-cols-2">
          <div className="bg-theme-green flex flex-col justify-center items-center md:gap-y-7 gap-y-4 py-5">
            <div>
              <img
                src="/images/retailer/restaurant.webp"
                alt="restaurant"
                className="lg:w-60 md:w-52 sm:w-44 w-36"
              />
            </div>
            <h2 className="font-semibold md:text-2xl text-xl text-center text-white">
              Open a Restaurant
            </h2>
            <p className="font-normal md:text-base text-sm text-white text-opacity-60 text-center lg:w-3/5 md:w-4/5 w-3/5">
              This is a sample text. Add more text to this paragraph. This is a
              sample text. Add more text to this paragraph
            </p>
            <button
              onClick={() => {
                setBusiness({ ...business, businessType: "restaurant" });
                setStep(3);
              }}
              className="py-2.5 px-8 bg-theme-green-2 text-white font-medium md:text-xl text-base rounded border border-theme-green-2 hover:bg-white hover:text-theme-green-2 hover:border-white"
            >
              Let's Start
            </button>
          </div>
          <div className="bg-theme-caramel flex flex-col justify-center items-center md:gap-y-7 gap-y-4 py-5">
            <div>
              <img
                src="/images/retailer/store.webp"
                alt="restaurant"
                className="lg:w-60 md:w-52 sm:w-44 w-36"
              />
            </div>
            <h2 className="font-semibold md:text-2xl text-xl text-center">
              Open a Store
            </h2>
            <p className="font-normal md:text-base text-sm text-black text-opacity-60 text-center lg:w-3/5 md:w-4/5 w-3/5">
              This is a sample text. Add more text to this paragraph. This is a
              sample text. Add more text to this paragraph
            </p>
            <button
              onClick={() => {
                setBusiness({ ...business, businessType: "store" });
                setStep(3);
              }}
              className="py-2.5 px-8 bg-theme-green-2 text-white font-medium md:text-xl text-base rounded border border-theme-green-2 hover:bg-black hover:text-white hover:border-black"
            >
              Let's Start
            </button>
          </div>
        </section>
      ) : (
        <>
          <Header home={true} />
          <section className="min-h-[calc(100vh-49.46px)] pt-28 flex flex-col justify-center items-center gap-y-10 py-10">
            <h2 className="font-bold sm:text-4xl text-3xl text-center px-5 font-omnes">
              {step === 1
                ? "Create Fomino Retailer Account"
                : "Business information"}
            </h2>
            <form
              onSubmit={
                step === 1
                  ? stepOneFunc
                  : step === 3
                  ? stepThreeFunc
                  : step === 4
                  ? retailerSignUpFunc
                  : ""
              }
              className="lg:w-2/5 sm:w-3/5 w-4/5 mx-auto grid grid-cols-2 sm:gap-x-5 gap-x-3 sm:gap-y-6 gap-y-5"
            >
              {step === 1 ? (
                <>
                  <div>
                    <input
                      value={retailer.firstName}
                      onChange={onChange}
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <input
                      value={retailer.lastName}
                      onChange={onChange}
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      className={inputStyle}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      value={retailer.email}
                      onChange={onChange}
                      type="email"
                      name="email"
                      placeholder="Email"
                      className={inputStyle}
                    />
                  </div>
                  <div className="col-span-2 flex gap-x-1">
                    <PhoneInput
                      inputStyle={{
                        display: "block",
                        width: "88px",
                        paddingTop: "22px",
                        paddingBottom: "22px",
                        background: "#F4F5FA",
                        color: "black",
                        border: "none",
                      }}
                      inputProps={{ id: "countryCode", name: "countryCode" }}
                      value={retailer.countryCode}
                      onChange={(e) =>
                        setRetailer({ ...retailer, countryCode: e })
                      }
                    />
                    <input
                      value={retailer.phoneNum}
                      onChange={onChange}
                      type="number"
                      name="phoneNum"
                      placeholder="Phone"
                      className={inputStyle}
                    />
                  </div>
                  <input
                    value={retailer.password}
                    onChange={onChange}
                    type="password"
                    name="password"
                    placeholder="Create Password"
                    className={inputStyle}
                  />
                  <input
                    value={retailer.confirmPassword}
                    onChange={onChange}
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className={inputStyle}
                  />
                  <div className="col-span-2">
                    <button
                      type="submit"
                      className="py-3 px-5 w-full bg-theme-green-2 text-white font-medium sm:text-xl text-lg border border-theme-green-2 rounded"
                    >
                      Sign up free
                    </button>
                  </div>
                </>
              ) : step === 3 ? (
                <>
                  <div className="col-span-2 my-5 space-y-3">
                    <div>
                      {image.logo ? (
                        <div className="relative bg-theme-gray-4 rounded-fullest mx-auto w-36 h-36 flex flex-col justify-center items-center gap-y-2">
                          <img
                            src={image.logo}
                            alt="Selected"
                            className="w-full h-full object-cover object-center rounded-fullest"
                          />
                          <label
                            htmlFor="logo"
                            className="absolute right-0 top-0 w-8 h-8 bg-white rounded-fullest flex justify-center items-center shadow-custom cursor-pointer"
                          >
                            <MdOutlineModeEdit size={24} />
                          </label>
                          <input
                            onChange={handleImageChange}
                            type="file"
                            name="logo"
                            id="logo"
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <>
                          <label
                            htmlFor="logo"
                            className="bg-theme-gray-4 rounded-fullest mx-auto w-36 h-36 flex flex-col justify-center items-center gap-y-2 cursor-pointer"
                          >
                            <BiImageAdd size={32} />
                            <span className="font-normal text-base text-black text-opacity-40">
                              Upload Logo
                            </span>
                          </label>
                          <input
                            onChange={handleImageChange}
                            type="file"
                            name="logo"
                            id="logo"
                            className="hidden"
                          />
                        </>
                      )}
                    </div>
                    <div>
                      {image.cover ? (
                        <div className="relative bg-theme-gray-4 mx-auto rounded-lg w-full h-48 flex flex-col justify-center items-center gap-y-2">
                          <img
                            src={image.cover}
                            alt="Selected"
                            className="w-full h-full object-cover object-center"
                          />
                          <label
                            htmlFor="cover"
                            className="absolute right-3 top-3 w-8 h-8 bg-white rounded-fullest flex justify-center items-center cursor-pointer"
                          >
                            <MdOutlineModeEdit size={24} />
                          </label>
                          <input
                            onChange={handleImageChange}
                            type="file"
                            name="cover"
                            id="cover"
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <>
                          <label
                            htmlFor="cover"
                            className="bg-theme-gray-4 mx-auto rounded-lg w-full h-48 flex flex-col justify-center items-center gap-y-2 cursor-pointer"
                          >
                            <BiImageAdd size={32} />
                            <span className="font-normal text-base text-black text-opacity-40">
                              Upload Cover Image
                            </span>
                            <span className="font-normal text-base text-black text-opacity-40">
                              (Img size 374 x 200)
                            </span>
                          </label>
                          <input
                            onChange={handleImageChange}
                            type="file"
                            name="cover"
                            id="cover"
                            className="hidden"
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-3">
                    <button
                      type="submit"
                      className="py-2.5 px-5 w-full bg-theme-green-2 text-white font-medium sm:text-xl text-lg border border-theme-green-2 rounded"
                    >
                      Next 2/3
                    </button>
                    {/* <button
                      type="button"
                      className="py-2.5 px-5 w-full bg-transparent text-theme-green-2 font-medium sm:text-xl text-lg border border-theme-green-2 rounded"
                    >
                      I'll do this later
                    </button> */}
                  </div>
                </>
              ) : step === 4 ? (
                <>
                  <div className="col-span-2">
                    <input
                      value={business.businessName}
                      onChange={onChange2}
                      type="text"
                      name="businessName"
                      placeholder="Business Name"
                      className={inputStyle}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      value={business.businessEmail}
                      onChange={onChange2}
                      type="email"
                      name="businessEmail"
                      placeholder="Business Email"
                      className={inputStyle}
                    />
                  </div>
                  <div className="col-span-2 flex gap-x-1">
                    <PhoneInput
                      inputStyle={{
                        display: "block",
                        width: "88px",
                        paddingTop: "22px",
                        paddingBottom: "22px",
                        background: "#F4F5FA",
                        color: "black",
                        border: "none",
                      }}
                      inputProps={{
                        id: "businessCountryCode",
                        name: "businessCountryCode",
                      }}
                      value={business.businessCountryCode}
                      onChange={(e) =>
                        setBusiness({ ...business, businessCountryCode: e })
                      }
                    />
                    <input
                      value={business.businessPhone}
                      onChange={onChange2}
                      type="number"
                      name="businessPhone"
                      placeholder="Business Phone"
                      className={inputStyle}
                    />
                  </div>
                  <div className="col-span-2">
                    <textarea
                      value={business.description}
                      onChange={onChange2}
                      name="description"
                      placeholder="Description"
                      className={inputStyle}
                      rows={5}
                    ></textarea>
                  </div>
                  <div className="col-span-2">
                    <Autocomplete
                      onLoad={(autocomplete) =>
                        (autocompleteRef.current = autocomplete)
                      }
                      onPlaceChanged={() => {
                        calculateRoute();
                      }}
                    >
                      <input
                        type="text"
                        className={inputStyle}
                        placeholder="Search Address"
                      />
                    </Autocomplete>
                  </div>
                  <div className="col-span-2">
                    <input
                      value={mapData.streetAddress}
                      onChange={(e) =>
                        setMapData({
                          ...mapData,
                          [e.target.name]: e.target.value,
                        })
                      }
                      type="text"
                      name="streetAddress"
                      placeholder="Street Address"
                      className={inputStyle}
                      readOnly={true}
                    />
                  </div>
                  <div>
                    <input
                      value={business.city}
                      onChange={onChange2}
                      type="text"
                      name="city"
                      placeholder="City"
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <input
                      value={business.zip}
                      onChange={onChange2}
                      type="text"
                      name="zip"
                      placeholder="ZIP"
                      className={inputStyle}
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={business.zoneId}
                      onChange={(e) => setBusiness({ ...business, zoneId: e })}
                      options={zoneOptions}
                      inputId="zoneId"
                      placeholder="Select your zone"
                      isClearable={true}
                    />
                  </div>
                  <div className="col-span-2">
                    <button className="py-2.5 px-5 w-full bg-theme-green-2 text-white font-medium sm:text-xl text-lg border border-theme-green-2 rounded">
                      Finish 3/3
                    </button>
                  </div>
                </>
              ) : (
                <></>
              )}
            </form>
          </section>
        </>
      )}
    </>
  );
}
