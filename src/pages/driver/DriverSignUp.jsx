import React, { useState } from "react";
import DriverHeader from "../../components/DriverHeader";
import Footer from "../../components/Footer";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import GetAPI from "../../utilities/GetAPI";
import { PostAPI } from "../../utilities/PostAPI";
import { BASE_URL } from "../../utilities/URL";

export default function DriverSignUp() {
  const { data } = GetAPI("driver/getvehicletype");
  const getServiceTypes = GetAPI("driver/getService");
  const [tab, setTab] = useState(1);
  const [loader, setLoader] = useState(false);
  const [visible, setVisible] = useState(false);
  const [stepOne, setStepOne] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "92",
    phoneNum: "",
    password: "",
    profile_image: "",
  });
  const [stepTwo, setStepTwo] = useState({
    make: "",
    model: "",
    year: "",
    registrationNum: "",
    color: "",
    vehicleTypeId: "",
    front: "",
    back: "",
    left: "",
    right: "",
    document_front: "",
    document_back: "",
    frontShow: null,
    backShow: null,
    leftShow: null,
    rightShow: null,
    document_frontShow: null,
    document_backShow: null,
    referalCode: "",
  });
  const [stepThree, setStepThree] = useState({
    licIssueDate: "",
    licExpiryDate: "",
    licNum: "",
    licFrontPhoto: "",
    licBackPhoto: "",
    licFrontPhotoShow: null,
    licBackPhotoShow: null,
    serviceTypeId: "",
  });
  const stepOneOnChange = (e) => {
    setStepOne({ ...stepOne, [e.target.name]: e.target.value });
  };
  const stepTwoOnChange = (e) => {
    setStepTwo({ ...stepTwo, [e.target.name]: e.target.value });
  };
  const stepThreeOnChange = (e) => {
    setStepThree({ ...stepThree, [e.target.name]: e.target.value });
  };
  const stepTwoImageChange = (e) => {
    const file = e.target.files[0];
    setStepTwo((prevImage) => ({
      ...prevImage,
      [e.target.name]: file,
      [`${e.target.name}Show`]: file ? URL.createObjectURL(file) : null,
    }));
  };
  const stepThreeImageChange = (e) => {
    const file = e.target.files[0];
    setStepThree((prevImage) => ({
      ...prevImage,
      [e.target.name]: file,
      [`${e.target.name}Show`]: file ? URL.createObjectURL(file) : null,
    }));
  };
  const vehicleTypes = [];
  const serviceTypes = [];
  data?.data?.vehicleTypeList?.map((veh, index) => {
    return vehicleTypes.push({
      value: veh?.id,
      label: (
        <div className="flex items-center gap-x-2">
          <img
            src={`${BASE_URL}${veh?.image}`}
            alt={`Vehicle-${index}`}
            className="w-10 h-10"
          />
          <div>{veh?.name}</div>
        </div>
      ),
    });
  });
  getServiceTypes?.data?.data?.map((ser) => {
    return serviceTypes.push({
      value: ser?.id,
      label: ser?.name,
    });
  });
  const stepOneFunc = async (e) => {
    e.preventDefault();
    if (stepOne.firstName === "") {
      info_toaster("Please enter First Name");
    } else if (stepOne.lastName === "") {
      info_toaster("Please enter Last Name");
    } else if (stepOne.email === "") {
      info_toaster("Please enter Email");
    } else if (stepOne.phoneNum === "") {
      info_toaster("Please enter Phone Number");
    } else if (stepOne.password === "") {
      info_toaster("Please create Password");
    } else if (stepOne.profile_image === "") {
      info_toaster("Please upload Profile Image");
    } else {
      setLoader(true);
      const formData = new FormData();
      formData.append("firstName", stepOne.firstName);
      formData.append("lastName", stepOne.lastName);
      formData.append("email", stepOne.email);
      formData.append("countryCode", stepOne.countryCode);
      formData.append("phoneNum", stepOne.phoneNum);
      formData.append("password", stepOne.password);
      formData.append("deviceToken", "Dell Laptop");
      formData.append("profile_image", stepOne.profile_image);
      let res = await PostAPI("driver/register/profile", formData);
      if (res?.data?.status === "1") {
        success_toaster(res?.data?.message);
        localStorage.setItem("driverId", res?.data?.data?.userId);
        setLoader(false);
        setTab(2);
        setStepOne({
          firstName: "",
          lastName: "",
          email: "",
          countryCode: "92",
          phoneNum: "",
          password: "",
          profile_image: "",
        });
      } else {
        error_toaster(res?.data?.message);
        setLoader(false);
      }
    }
  };
  const stepTwoFunc = async (e) => {
    e.preventDefault();
    if (stepTwo.make === "") {
      info_toaster("Please enter Vehicle Make");
    } else if (stepTwo.model === "") {
      info_toaster("Please enter Vehicle Model");
    } else if (stepTwo.year === "") {
      info_toaster("Please enter Registration year");
    } else if (stepTwo.registrationNum === "") {
      info_toaster("Please enter Registration Number");
    } else if (stepTwo.color === "") {
      info_toaster("Please enter Vehicle Color");
    } else if (stepTwo.front === "" || stepTwo.front === undefined) {
      info_toaster("Please upload Vehicle Front Picture");
    } else if (stepTwo.back === "" || stepTwo.back === undefined) {
      info_toaster("Please upload Vehicle Back Picture");
    } else if (stepTwo.left === "" || stepTwo.left === undefined) {
      info_toaster("Please upload Vehicle Left Picture");
    } else if (stepTwo.right === "" || stepTwo.right === undefined) {
      info_toaster("Please upload Vehicle Right Picture");
    } else if (
      stepTwo.document_front === "" ||
      stepTwo.document_front === undefined
    ) {
      info_toaster("Please upload Vehicle Document Front Picture");
    } else if (
      stepTwo.document_back === "" ||
      stepTwo.document_back === undefined
    ) {
      info_toaster("Please upload Vehicle Document Back Picture");
    } else if (stepTwo.vehicleTypeId === "") {
      info_toaster("Please select Vehicle Type");
    } else {
      setLoader(true);
      const formData = new FormData();
      formData.append("make", stepTwo.make);
      formData.append("model", stepTwo.model);
      formData.append("year", stepTwo.year);
      formData.append("registrationNum", stepTwo.registrationNum);
      formData.append("color", stepTwo.color);
      formData.append("userId", parseInt(localStorage.getItem("driverId")));
      formData.append("vehicleTypeId", stepTwo.vehicleTypeId.value);
      formData.append("front", stepTwo.front);
      formData.append("back", stepTwo.back);
      formData.append("left", stepTwo.left);
      formData.append("right", stepTwo.right);
      formData.append("document_front", stepTwo.document_front);
      formData.append("document_back", stepTwo.document_back);
      formData.append("referalCode", stepTwo.referalCode);
      let res = await PostAPI("driver/register/step2/profile", formData);
      if (res?.data?.status === "1") {
        success_toaster(res?.data?.message);
        setLoader(false);
        setTab(3);
        setStepTwo({
          make: "",
          model: "",
          year: "",
          registrationNum: "",
          color: "",
          vehicleTypeId: "",
          front: "",
          back: "",
          left: "",
          right: "",
          document_front: "",
          document_back: "",
          referalCode: "",
        });
      } else {
        error_toaster(res?.data?.message);
        setLoader(false);
      }
    }
  };
  const stepThreeFunc = async (e) => {
    e.preventDefault();
    if (stepThree.licNum === "") {
      info_toaster("Please enter License Number");
    } else if (stepThree.licIssueDate === "") {
      info_toaster("Please enter License Issue Date");
    } else if (stepThree.licExpiryDate === "") {
      info_toaster("Please enter License Expiry Date");
    } else if (stepThree.licFrontPhoto === "") {
      info_toaster("Please upload License Front Photo");
    } else if (stepThree.licBackPhoto === "") {
      info_toaster("Please upload License Back Photo");
    } else if (stepThree.serviceTypeId === "") {
      info_toaster("Please select Service Type");
    } else {
      setLoader(true);
      const formData = new FormData();
      formData.append("licIssueDate", stepThree.licIssueDate);
      formData.append("licExpiryDate", stepThree.licExpiryDate);
      formData.append("licNum", stepThree.licNum);
      formData.append("licFrontPhoto", stepThree.licFrontPhoto);
      formData.append("licBackPhoto", stepThree.licBackPhoto);
      formData.append("serviceTypeId", stepThree.serviceTypeId.value);
      formData.append("userId", parseInt(localStorage.getItem("driverId")));
      let res = await PostAPI("driver/register/step3/profile", formData);
      if (res?.data?.status === "1") {
        success_toaster(res?.data?.message);
        setLoader(false);
        setTab(1);
        setStepThree({
          licIssueDate: "",
          licExpiryDate: "",
          licNum: "",
          licFrontPhoto: "",
          licBackPhoto: "",
          serviceTypeId: "",
        });
        localStorage.removeItem("driverId");
      } else {
        error_toaster(res?.data?.message);
        setLoader(false);
      }
    }
  };
  const labelStyle = "font-medium sm:text-xl text-base";
  const inputStyle =
    "py-2.5 px-4 rounded font-light text-xl placeholder:text-black placeholder:text-opacity-60 border border-black border-opacity-10 focus:outline-none w-full";
  return (
    <>
      <DriverHeader />
      <section className="relative top-24">
        <div>
          <img src="/images/driver/hero.webp" alt="hero" className="w-full" />
        </div>
        <section className="2xl:w-4/5 w-11/12 mx-auto lg:pt-16 pt-12 lg:pb-32 pb-20">
          <div className="flex justify-center items-center gap-x-2 font-switzer">
            <div
              className={`${
                tab === 1 ? "bg-theme-red-2" : "bg-theme-black bg-opacity-40"
              } font-semibold text-2xl text-white w-10 h-10 flex justify-center items-center rounded-fullest`}
            >
              1
            </div>
            <div className="md:w-32 w-16 border border-black border-opacity-40"></div>
            <div
              className={`${
                tab === 2 ? "bg-theme-red-2" : "bg-theme-black bg-opacity-40"
              } font-semibold text-2xl text-white w-10 h-10 flex justify-center items-center rounded-fullest`}
            >
              2
            </div>
            <div className="md:w-32 w-16 border border-black border-opacity-40"></div>
            <div
              className={`${
                tab === 3 ? "bg-theme-red-2" : "bg-theme-black bg-opacity-40"
              } font-semibold text-2xl text-white w-10 h-10 flex justify-center items-center rounded-fullest`}
            >
              3
            </div>
          </div>
          {tab === 1 ? (
            <form
              onSubmit={stepOneFunc}
              className="xl:w-1/2 md:w-3/5 sm:w-4/5 mx-auto sm:mt-16 mt-8 space-y-10 font-sf"
            >
              <div className="space-y-2">
                <h2 className="font-semibold lg:text-5xl sm:text-4xl text-3xl">
                  Ready to become a <br /> Fomino <br /> courier partner?
                </h2>
                <p className="font-light lg:text-xl sm:text-lg text-base leading-tight">
                  Before we get you started as a Fomino courier partner, we just
                  need a few details from you. Fill out the quick application
                  below, and we'll get the ball rolling!
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-2 gap-y-5">
                <div className="space-y-1">
                  <label htmlFor="name" className={labelStyle}>
                    Name
                  </label>
                  <input
                    value={stepOne.firstName}
                    onChange={stepOneOnChange}
                    type="text"
                    name="firstName"
                    id="firstName"
                    placeholder="First Name"
                    className={inputStyle}
                  />
                </div>
                <div className="flex items-end">
                  <input
                    value={stepOne.lastName}
                    onChange={stepOneOnChange}
                    type="text"
                    name="lastName"
                    id="lastName"
                    placeholder="Last Name"
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="email" className={labelStyle}>
                    Email Address
                  </label>
                  <input
                    value={stepOne.email}
                    onChange={stepOneOnChange}
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className={labelStyle} htmlFor="phoneNum">
                    Phone Number
                  </label>
                  <div className="flex gap-x-1">
                    <PhoneInput
                      inputStyle={{
                        display: "block",
                        width: "88px",
                        paddingTop: "24px",
                        paddingBottom: "24px",
                        color: "black",
                        borderColor: "rgba(0, 0, 0, 0.1)",
                      }}
                      inputProps={{ id: "code", name: "code" }}
                      country="Panama"
                      value={stepOne.countryCode}
                      onChange={(e) =>
                        setStepOne({ ...stepOne, countryCode: e })
                      }
                    />
                    <input
                      value={stepOne.phoneNum}
                      onChange={stepOneOnChange}
                      type="number"
                      name="phoneNum"
                      id="phoneNum"
                      placeholder="Phone Number"
                      className={inputStyle}
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="password" className={labelStyle}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      value={stepOne.password}
                      onChange={stepOneOnChange}
                      type={visible ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder="Password"
                      className={inputStyle}
                    />
                    <button
                      onClick={() => setVisible(!visible)}
                      type="button"
                      className="text-black text-opacity-40 absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {visible ? (
                        <AiOutlineEye size={28} />
                      ) : (
                        <AiOutlineEyeInvisible size={28} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="profile_image" className={labelStyle}>
                    Profile Image
                  </label>
                  <input
                    onChange={(e) =>
                      setStepOne({
                        ...stepOne,
                        profile_image: e.target.files[0],
                      })
                    }
                    type="file"
                    name="profile_image"
                    id="profile_image"
                    className={inputStyle}
                  />
                </div>
                <div className="sm:col-span-2 flex gap-x-2 justify-start">
                  <div className="sm:pt-1">
                    <input
                      type="checkbox"
                      className="sm:min-w-[24px] min-w-[16px] sm:min-h-[24px] min-h-[16px]"
                    />
                  </div>
                  <p className="font-light sm:text-base text-sm leading-tight text-black text-opacity-90">
                    I have read and agree with the{" "}
                    <span className="text-theme-red-2">
                      User Terms of Service
                    </span>
                    , and I understand that my personal data will be processed
                    in accordance with{" "}
                    <span className="text-theme-red-2">
                      Fomino Courier Partner Privacy.
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loader ? true : false}
                  className="py-2.5 font-semibold text-lg text-white rounded bg-theme-red w-full border border-theme-red hover:bg-transparent hover:text-theme-red"
                >
                  Send Application
                </button>
              </div>
            </form>
          ) : tab === 2 ? (
            <form
              onSubmit={stepTwoFunc}
              className="xl:w-1/2 md:w-3/5 sm:w-4/5 mx-auto mt-16 space-y-10 font-sf"
            >
              <div className="space-y-2">
                <h2 className="font-semibold lg:text-5xl sm:text-4xl text-3xl">
                  Upload Your Vehicle Details
                </h2>
                <p className="font-light lg:text-xl sm:text-lg text-base leading-tight">
                  Before we get you started as a Fomino courier partner, we just
                  need a few details from you. Fill out the quick application
                  below, and we'll get the ball rolling!
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-2 gap-y-5">
                <div className="space-y-1">
                  <label htmlFor="vehicle" className={labelStyle}>
                    Vehicle Information
                  </label>
                  <input
                    value={stepTwo.make}
                    onChange={stepTwoOnChange}
                    type="text"
                    name="make"
                    id="make"
                    placeholder="Make"
                    className={inputStyle}
                  />
                </div>
                <div className="flex items-end">
                  <input
                    value={stepTwo.model}
                    onChange={stepTwoOnChange}
                    type="text"
                    name="model"
                    id="model"
                    placeholder="Model"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <input
                    value={stepTwo.year}
                    onChange={stepTwoOnChange}
                    type="text"
                    name="year"
                    id="year"
                    placeholder="Year"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <input
                    value={stepTwo.registrationNum}
                    onChange={stepTwoOnChange}
                    type="text"
                    name="registrationNum"
                    id="registrationNum"
                    placeholder="Registration Number"
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="color" className={labelStyle}>
                    Color
                  </label>
                  <input
                    value={stepTwo.color}
                    onChange={stepTwoOnChange}
                    type="text"
                    name="color"
                    id="color"
                    placeholder="Vehicle Color"
                    className={inputStyle}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <h4 className={labelStyle}>
                    Vehicle Images (front, back and sides)
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="front" className="space-y-1">
                        <h6>Front</h6>
                        <div className="w-full h-40 border border-black border-opacity-40 rounded-md flex flex-col justify-center items-center">
                          {stepTwo.frontShow ? (
                            <img
                              src={stepTwo.frontShow}
                              alt="vehicle-front"
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <>
                              <div className="relative">
                                <img
                                  src="/images/driver/vehicle.webp"
                                  alt="vehicle"
                                  className="w-[110px] h-[110px]"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                  <img
                                    src="/images/driver/camera.webp"
                                    alt="camera"
                                    className="w-9 h-9"
                                  />
                                </div>
                              </div>
                              <h6 className="font-medium text-xl text-black text-opacity-60">
                                Upload Picture
                              </h6>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        onChange={stepTwoImageChange}
                        type="file"
                        name="front"
                        id="front"
                        className="hidden"
                      />
                    </div>
                    <div>
                      <label htmlFor="back" className="space-y-1">
                        <h6>Back</h6>
                        <div className="w-full h-40 border border-black border-opacity-40 rounded-md flex flex-col justify-center items-center">
                          {stepTwo.backShow ? (
                            <img
                              src={stepTwo.backShow}
                              alt="vehicle-front"
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <>
                              <div className="relative">
                                <img
                                  src="/images/driver/vehicle.webp"
                                  alt="vehicle"
                                  className="w-[110px] h-[110px]"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                  <img
                                    src="/images/driver/camera.webp"
                                    alt="camera"
                                    className="w-9 h-9"
                                  />
                                </div>
                              </div>
                              <h6 className="font-medium text-xl text-black text-opacity-60">
                                Upload Picture
                              </h6>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        onChange={stepTwoImageChange}
                        type="file"
                        name="back"
                        id="back"
                        className="hidden"
                      />
                    </div>
                    <div>
                      <label htmlFor="left" className="space-y-1">
                        <h6>Left</h6>
                        <div className="w-full h-40 border border-black border-opacity-40 rounded-md flex flex-col justify-center items-center">
                          {stepTwo.leftShow ? (
                            <img
                              src={stepTwo.leftShow}
                              alt="vehicle-front"
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <>
                              <div className="relative">
                                <img
                                  src="/images/driver/vehicle.webp"
                                  alt="vehicle"
                                  className="w-[110px] h-[110px]"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                  <img
                                    src="/images/driver/camera.webp"
                                    alt="camera"
                                    className="w-9 h-9"
                                  />
                                </div>
                              </div>
                              <h6 className="font-medium text-xl text-black text-opacity-60">
                                Upload Picture
                              </h6>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        onChange={stepTwoImageChange}
                        type="file"
                        name="left"
                        id="left"
                        className="hidden"
                      />
                    </div>
                    <div>
                      <label htmlFor="right" className="space-y-1">
                        <h6>Right</h6>
                        <div className="w-full h-40 border border-black border-opacity-40 rounded-md flex flex-col justify-center items-center">
                          {stepTwo.rightShow ? (
                            <img
                              src={stepTwo.rightShow}
                              alt="vehicle-front"
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <>
                              <div className="relative">
                                <img
                                  src="/images/driver/vehicle.webp"
                                  alt="vehicle"
                                  className="w-[110px] h-[110px]"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                  <img
                                    src="/images/driver/camera.webp"
                                    alt="camera"
                                    className="w-9 h-9"
                                  />
                                </div>
                              </div>
                              <h6 className="font-medium text-xl text-black text-opacity-60">
                                Upload Picture
                              </h6>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        onChange={stepTwoImageChange}
                        type="file"
                        name="right"
                        id="right"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <h4 className={labelStyle}>Documents of Vehicles</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="document_front" className="space-y-1">
                        <h6>Front</h6>
                        <div className="w-full h-40 border border-black border-opacity-40 rounded-md flex flex-col justify-center items-center">
                          {stepTwo.document_frontShow ? (
                            <img
                              src={stepTwo.document_frontShow}
                              alt="vehicle-front"
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <>
                              <div className="relative">
                                <img
                                  src="/images/driver/document.webp"
                                  alt="vehicle"
                                  className="w-[82px] h-[95px]"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                  <img
                                    src="/images/driver/camera.webp"
                                    alt="camera"
                                    className="w-9 h-9"
                                  />
                                </div>
                              </div>
                              <h6 className="font-medium text-xl text-black text-opacity-60">
                                Upload Document
                              </h6>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        onChange={stepTwoImageChange}
                        type="file"
                        name="document_front"
                        id="document_front"
                        className="hidden"
                      />
                    </div>
                    <div>
                      <label htmlFor="document_back" className="space-y-1">
                        <h6>Back</h6>
                        <div className="w-full h-40 border border-black border-opacity-40 rounded-md flex flex-col justify-center items-center">
                          {stepTwo.document_backShow ? (
                            <img
                              src={stepTwo.document_backShow}
                              alt="vehicle-front"
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <>
                              <div className="relative">
                                <img
                                  src="/images/driver/document.webp"
                                  alt="vehicle"
                                  className="w-[82px] h-[95px]"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                  <img
                                    src="/images/driver/camera.webp"
                                    alt="camera"
                                    className="w-9 h-9"
                                  />
                                </div>
                              </div>
                              <h6 className="font-medium text-xl text-black text-opacity-60">
                                Upload Document
                              </h6>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        onChange={stepTwoImageChange}
                        type="file"
                        name="document_back"
                        id="document_back"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="vehicleTypeId" className={labelStyle}>
                    Vehicle Type
                  </label>
                  <Select
                    value={stepTwo.vehicleTypeId}
                    onChange={(e) =>
                      setStepTwo({ ...stepTwo, vehicleTypeId: e })
                    }
                    options={vehicleTypes}
                    inputId="vehicleTypeId"
                    placeholder="Select Vehicle Type"
                  />
                </div>
                {/* <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="referalCode" className={labelStyle}>
                    Referral Code
                  </label>
                  <input
                    value={stepTwo.referalCode}
                    onChange={stepTwoOnChange}
                    type="text"
                    name="referalCode"
                    id="referalCode"
                    placeholder="Referral Code"
                    className={inputStyle}
                  />
                </div> */}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loader ? true : false}
                  className="py-2.5 font-semibold text-lg text-white rounded bg-theme-red w-full border border-theme-red hover:bg-transparent hover:text-theme-red"
                >
                  Submit
                </button>
              </div>
            </form>
          ) : tab === 3 ? (
            <form
              onSubmit={stepThreeFunc}
              className="xl:w-1/2 md:w-3/5 sm:w-4/5 mx-auto mt-16 space-y-10 font-sf"
            >
              <div className="space-y-2">
                <h2 className="font-semibold lg:text-5xl sm:text-4xl text-3xl">
                  Upload Your License Details
                </h2>
                <p className="font-light lg:text-xl sm:text-lg text-base leading-tight">
                  Before we get you started as a Fomino courier partner, we just
                  need a few details from you. Fill out the quick application
                  below, and we'll get the ball rolling!
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-2 gap-y-5">
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="licNum" className={labelStyle}>
                    License Number
                  </label>
                  <input
                    value={stepThree.licNum}
                    onChange={stepThreeOnChange}
                    type="text"
                    name="licNum"
                    id="licNum"
                    placeholder="License Number"
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="licIssueDate" className={labelStyle}>
                    License Issue Date
                  </label>
                  <input
                    value={stepThree.licIssueDate}
                    onChange={stepThreeOnChange}
                    type="date"
                    name="licIssueDate"
                    id="licIssueDate"
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="licExpiryDate" className={labelStyle}>
                    License Expiry Date
                  </label>
                  <input
                    value={stepThree.licExpiryDate}
                    onChange={stepThreeOnChange}
                    type="date"
                    name="licExpiryDate"
                    id="licExpiryDate"
                    className={inputStyle}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <h4 className={labelStyle}>License Images (front, back)</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="licFrontPhoto" className="space-y-1">
                        <h6>Front</h6>
                        <div className="w-full h-40 border border-black border-opacity-40 rounded-md flex flex-col justify-center items-center">
                          {stepThree.licFrontPhotoShow ? (
                            <img
                              src={stepThree.licFrontPhotoShow}
                              alt="vehicle-front"
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <>
                              <div className="relative">
                                <img
                                  src="/images/driver/document.webp"
                                  alt="vehicle"
                                  className="w-[82px] h-[95px]"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                  <img
                                    src="/images/driver/camera.webp"
                                    alt="camera"
                                    className="w-9 h-9"
                                  />
                                </div>
                              </div>
                              <h6 className="font-medium text-xl text-black text-opacity-60">
                                Upload Document
                              </h6>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        onChange={stepThreeImageChange}
                        type="file"
                        name="licFrontPhoto"
                        id="licFrontPhoto"
                        className="hidden"
                      />
                    </div>
                    <div>
                      <label htmlFor="licBackPhoto" className="space-y-1">
                        <h6>Back</h6>
                        <div className="w-full h-40 border border-black border-opacity-40 rounded-md flex flex-col justify-center items-center">
                          {stepThree.licBackPhotoShow ? (
                            <img
                              src={stepThree.licBackPhotoShow}
                              alt="vehicle-front"
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <>
                              <div className="relative">
                                <img
                                  src="/images/driver/document.webp"
                                  alt="vehicle"
                                  className="w-[82px] h-[95px]"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                  <img
                                    src="/images/driver/camera.webp"
                                    alt="camera"
                                    className="w-9 h-9"
                                  />
                                </div>
                              </div>
                              <h6 className="font-medium text-xl text-black text-opacity-60">
                                Upload Document
                              </h6>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        onChange={stepThreeImageChange}
                        type="file"
                        name="licBackPhoto"
                        id="licBackPhoto"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="serviceTypeId" className={labelStyle}>
                    Service Type
                  </label>
                  <Select
                    value={stepThree.serviceTypeId}
                    onChange={(e) =>
                      setStepThree({ ...stepThree, serviceTypeId: e })
                    }
                    options={serviceTypes}
                    inputId="serviceTypeId"
                    placeholder="Select Service Type"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loader ? true : false}
                  className="py-2.5 font-semibold text-lg text-white rounded bg-theme-red w-full border border-theme-red hover:bg-transparent hover:text-theme-red"
                >
                  Submit
                </button>
              </div>
            </form>
          ) : (
            <></>
          )}
        </section>
        <Footer />
      </section>
    </>
  );
}
