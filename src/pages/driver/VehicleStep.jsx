import React from "react";
import { GiScooter } from "react-icons/gi";
import CustomCheckbox from "../../components/CustomCheckbox";

const VehicleStep = ({
  formData,
  handleAgeConfirmation,
  handleVehicleSelection,
  subStep,
  handleWorkingHours,
  nextStep,
}) => {
  return (
    <div className="flex justify-center items-center space-y-4 flex-col">
      <h2 className="font-omnes text-[28px] font-semibold">
        We still have a few questions
      </h2>

      {subStep === 1 && (
        <>
          <h3 className="font-semibold text-lg font-omnes">
            Are you at least 18 years old?
          </h3>
          <div className="flex justify-between items-center w-full space-x-4 font-sf text-lg font-medium">
            <button
              className={`flex-1 border py-3 ${
                formData.ageConfirmation === "Yes"
                  ? "bg-theme-gray-2"
                  : "bg-white"
              }`}
              onClick={() => handleAgeConfirmation("Yes")}
            >
              Yes
            </button>
            <button
              className={`flex-1 border py-3 ${
                formData.ageConfirmation === "No"
                  ? "bg-theme-gray-2"
                  : "bg-white"
              }`}
              onClick={() => handleAgeConfirmation("No")}
            >
              No
            </button>
          </div>
        </>
      )}

      {subStep === 2 && formData.ageConfirmation === "Yes" && (
        <>
          <p className="font-omnes text-lg font-semibold">
            How many hours per week would you ideally like to work on average?
          </p>
          <div className="flex justify-between items-center w-full space-x-4 font-sf text-lg font-medium">
            <button
              className={`flex-1 border py-3 ${
                formData.workingHours === "10" ? "bg-theme-gray-2" : "bg-white"
              }`}
              onClick={() => handleWorkingHours("10")}
            >
              10 hours/week
            </button>
          </div>
        </>
      )}

      {subStep === 3 &&
        formData.workingHours &&
        formData.ageConfirmation === "Yes" && (
          <>
            <p className="font-omnes text-lg font-semibold">Vehicle</p>
            <p className="font-sf text-sm text-theme-black-2 text-center px-2">
              If you want to use your own bike, make sure it is roadworthy
              according to SVG. Your safety is our top priority. Your vehicle
              must be able to handle many journeys and give you the flexibility
              and power you need to transport deliveries.
            </p>
            <div className="flex justify-between items-center w-full space-x-4  text-lg font-semibold font-omnes ">
              <button
                className={`flex-1 flex justify-between items-center px-4 border py-3 ${
                  formData.vehicleSelection === "Bike"
                    ? "bg-theme-gray-2"
                    : "bg-white"
                }`}
                onClick={() => {
                  handleVehicleSelection("Bike");
                  nextStep();
                }}
              >
                <span>Own scooter</span>
                <GiScooter size={28} />
              </button>
            </div>
            <div className="flex gap-x-4  w-full !mt-7">
              <CustomCheckbox color="#de2d35" />
              <p className="text-sm font-sf font-light">
                I agree that a recruiter can contact me over WhatsApp to
                continue the application process.
              </p>
            </div>
          </>
        )}

      {subStep === 2 && formData.ageConfirmation === "No" && (
        <div className="flex gap-x-4">
          <CustomCheckbox color="#de2d35" />
          <p className="text-sm font-sf font-light">
            I agree that a recruiter can contact me over WhatsApp to continue
            the application process.
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleStep;
