import React, { useState } from "react";
import { Line } from "rc-progress";
import LocationStep from "./LocationStep";
import Requirements from "./Requirements";
import ReadyStep from "./ReadyStep";
import VehicleStep from "./VehicleStep";
import AboutStep from "./AboutStep";
import { motion, AnimatePresence } from "framer-motion";
import { PostAPI } from "../../utilities/PostAPI";
import Footer from "../../components/Footer";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import DriverHeader from "../../components/DriverHeader";

const BecomeCourierSteps = ({ totalSteps = 5 }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [subStep, setSubStep] = useState(1);
  const percent = (currentStep / (totalSteps - 1)) * 100;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: "",
    country: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNum: "",
    countryCode: "+92",
    referalId: "",
    ageConfirmation: "",
    vehicleSelection: "",
    workingHours: "",
    backImage: "",
    frontImage: "",
    licenseIssueDate: "",
    licenseExpiryDate: "",
    zipCode: "",
    zoneId: null,
    cityId: null,
  });
  console.log("form data", formData);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handlePhoneNumberChange = (value) => {
    setFormData({ ...formData, phoneNum: value });
  };
  const handleReferalId = (e) => {
    setFormData({ ...formData, referalId: e.target.value });
  };
  const handleAgeConfirmation = (value) => {
    setFormData({ ...formData, ageConfirmation: value });
  };
  const handleVehicleSelection = (value) => {
    setFormData({ ...formData, vehicleSelection: value });
  };
  const handleWorkingHours = (value) => {
    setFormData({ ...formData, workingHours: value });
  };
  const nextStep = () => {
    if (currentStep === 2) {
      if (subStep < 4) {
        setSubStep(subStep + 1);
        return;
      }
    }

    if (currentStep === 3) {
      if (subStep < 3) {
        setSubStep(subStep + 1);
        return;
      }
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      setSubStep(1);
    }
  };

  const prevStep = () => {
    if (currentStep === 2 && subStep > 1) {
      setSubStep(subStep - 1);
      return;
    }
    if (currentStep === 3 && subStep > 1) {
      setSubStep(subStep - 1);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setSubStep(1);
    }
  };

  const isContinueDisabled = () => {
    if (currentStep === 0) {
      return !(formData.zoneId && formData.cityId);
    }
    if (currentStep === 2 && subStep === 2) {
      return !(formData.email && formData.phoneNum && formData.zipCode);
    }
    if (currentStep === 3 && subStep === 1) {
      return !formData.ageConfirmation;
    }
    if (currentStep === 3 && subStep === 2) {
      return !formData.workingHours;
    }
    if (currentStep === 3 && subStep === 3) {
      return !formData.vehicleSelection;
    }
    if (currentStep === 2 && subStep === 3) {
      return !(
        formData.licenseIssueDate &&
        formData.licenseExpiryDate &&
        formData.frontImage &&
        formData.backImage
      );
    }
    if (currentStep === 2) {
      return !(formData.firstName && formData.lastName);
    }

    return false;
  };
  const steps = [
    {
      label: "Location",
      component: <LocationStep setFormData={setFormData} formData={formData} />,
    },
    { label: "What You Need", component: <Requirements /> },
    {
      label: "About You",
      component: (
        <AboutStep
          formData={formData}
          handleChange={handleChange}
          handlePhoneNumberChange={handlePhoneNumberChange}
          handleReferalId={handleReferalId}
          setFormData={setFormData}
          subStep={subStep}
          setCurrentStep={setCurrentStep}
        />
      ),
    },
    {
      label: "Vehicle",
      component: (
        <VehicleStep
          formData={formData}
          handleAgeConfirmation={handleAgeConfirmation}
          handleVehicleSelection={handleVehicleSelection} // Passing the handler for vehicle selection
          subStep={subStep} // Pass substep state
          handleWorkingHours={handleWorkingHours}
        />
      ),
    },
    {
      label: "Ready",
      component: (
        <ReadyStep
          formData={formData}
          setFormData={setFormData}
          setCurrentStep={setCurrentStep}
          setSubStep={setSubStep}
        />
      ),
    },
  ];

  const registerCourier = async (e) => {
    console.log("registering courier");
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("countryCode", formData.countryCode);
    formDataToSend.append("phoneNum", formData.phoneNum);
    formDataToSend.append("deviceToken", "web");
    formDataToSend.append("licFrontPhoto", formData.frontImage);
    formDataToSend.append("licBackPhoto", formData.backImage);
    formDataToSend.append("licenseIssueDate", formData.licenseIssueDate);
    formDataToSend.append("licenseExpiryDate", formData.licenseExpiryDate);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("zipCode", formData.zipCode);
    formDataToSend.append("vehicleType", formData.vehicleSelection);
    formDataToSend.append("workingHours", formData.workingHours);
    formDataToSend.append("ageConfirmation", formData.ageConfirmation);
    formDataToSend.append("referalId", formData.referalId);
    formDataToSend.append("zoneId", formData.zoneId);
    formDataToSend.append("cityId", formData.cityId);

    let res = await PostAPI("driver/addDriverFromWebsite", formDataToSend);
    if (res?.data?.status === "1") {
      success_toaster(res?.data?.message);
      navigate("/");
    } else {
      error_toaster(res?.data?.message);
    }
  };
  return (
    <>
      {/* <Header home={true} rest={false} /> */}
      <DriverHeader />
      <section className="font-sf mb-40 ">
        <div className="flex flex-col">
          <div className="py-8 pt-8"></div>
          <img
            src="/images/driver/hero.webp"
            alt="hero"
            className="w-full  object-cover"
          />
        </div>

        <div className="max-w-[800px] mx-auto mt-14  px-4 lg:px-0">
          <Line
            percent={percent}
            strokeWidth=".7"
            strokeColor="#DE2D35"
            trailColor="#D9D9D980"
            strokeLinecap="round"
          />
          <div className="flex justify-between mt-4">
            {[...Array(totalSteps)].map((_, index) => (
              <div
                key={index}
                className={`space-y-3 flex flex-col items-start lg:block ${
                  currentStep === index ? "block" : "hidden lg:block"
                }`}
              >
                <div className="text-center flex  justify-center gap-x-3 items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold 
                border transition-all duration-300
                ${
                  index < currentStep
                    ? "border-theme-red-2 text-theme-red-2"
                    : index === currentStep
                    ? "bg-theme-red-2 text-white border-red-2"
                    : "bg-white text-gray-500 border-gray-400"
                }`}
                  >
                    {index < currentStep ? "✓" : index + 1}
                  </div>
                  <div className="font-sf text-theme-black-2 text-base font-semibold">
                    Step
                  </div>
                </div>

                <p className="text-center font-sf text-theme-black-2 text-sm">
                  {steps[index].label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 lg:mt-20 px-4 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {steps[currentStep].component}
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <div className="mt-5 flex gap-3 justify-between w-full px-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 w-[230px] text-lg
      ${
        currentStep === 0
          ? "border border-theme-black-2  cursor-not-allowed"
          : "border border-theme-black-2  "
      }`}
              >
                Back
              </button>

              {currentStep !== totalSteps - 1 && (
                <button
                  onClick={nextStep}
                  disabled={
                    currentStep === totalSteps - 1 || isContinueDisabled()
                  }
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 w-[230px] text-lg
      ${
        currentStep === totalSteps - 1 || isContinueDisabled()
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-theme-red-2 text-white hover:bg-theme-red-2"
      }`}
                >
                  Continue
                </button>
              )}
              {currentStep === totalSteps - 1 && (
                <button
                  onClick={registerCourier}
                  className="px-4 py-3 rounded-lg font-medium transition-all duration-300 w-[230px] text-lg bg-theme-red-2 text-white hover:bg-theme-red-2"
                >
                  finish up!
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default BecomeCourierSteps;
