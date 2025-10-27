import React from "react";
import { MdOutlineEdit } from "react-icons/md";

const ReadyStep = ({ formData, setCurrentStep, setSubStep }) => {
  return (
    <div className="space-y-4">
      <h2 className="font-omnes text-[28px] font-semibold text-center">
        All right
      </h2>
      <p className="font-sf text-sm text-theme-black-2 text-opacity-80">
        Before we process your application, please check the following points.
      </p>

      <div className="px-4 py-5 bg-[#EFEDEA] space-y-4 font-sf">
        <div className="flex justify-between">
          <h3 className="font-omnes font-semibold text-theme-black-2">
            Location
          </h3>
          <button
            className="flex items-center gap-1 font-sf "
            onClick={() => setCurrentStep(0)}
          >
            <MdOutlineEdit size={18} /> Edit
          </button>
        </div>

        <div className="flex flex-col">
          <p>City</p>
          <p className="font-semibold">{formData.address}</p>
        </div>
      </div>

      <div className="px-4 py-5 bg-[#EFEDEA] space-y-4 font-sf">
        <div className="flex justify-between">
          <h3 className="font-omnes font-semibold text-theme-black-2">
            About you
          </h3>
          <button
            className="flex items-center gap-1 font-sf "
            onClick={() => setCurrentStep(2)}
          >
            <MdOutlineEdit size={18} /> Edit
          </button>
        </div>
        <div className="flex space-y-4 flex-col">
          <div>
            <p className="font-sf text-theme-black-2">name</p>
            <p className="font-sf text-theme-black-2 font-semibold">
              {formData.firstName} {formData.lastName}{" "}
            </p>
          </div>

          <div>
            <p className="font-sf text-theme-black-2">Phone number</p>
            <p className="font-sf text-theme-black-2 font-semibold">
              {formData.phoneNum}{" "}
            </p>
          </div>
          <div>
            <p className="font-sf text-theme-black-2">E-mail</p>
            <p className="font-sf text-theme-black-2 font-semibold">
              {formData.email}{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyStep;
