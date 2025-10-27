import React, { useState } from "react";
import FloatingLabelInput from "../../components/FloatingLabelInput";
import CountrySelect from "../../components/CountrySelect";
import en from "react-phone-number-input/locale/en";
import CustomCheckbox from "../../components/CustomCheckbox";
import { inputStyle } from "../../utilities/Input";
import { CiCamera } from "react-icons/ci";

const AboutStep = ({
  formData,
  handleChange,
  subStep,
  handlePhoneNumberChange,
  setFormData,
  handleReferalId,
  setCurrentStep,
}) => {
  const [backImage, setbackImage] = useState(null);
  const [frontImage, setFrontImage] = useState(null);

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

  const handleLicenseIssueDateChange = (event) => {
    const issueDate = event.target.value;
    setFormData({ ...formData, licenseIssueDate: issueDate });
  };

  const handleLicenseExpiryDateChange = (event) => {
    const expiryDate = event.target.value;
    setFormData({ ...formData, licenseExpiryDate: expiryDate });
  };
  return (
    <div className="space-y-4">
      <div className="px-4 py-3 bg-theme-gray-3 rounded-lg space-y-2 !mb-8">
        <h2 className="font-omnes text-[28px] text-theme-black-2 font-semibold">
          <span className="text-theme-red-2">Basel</span> is a good choice!
        </h2>
        <p>
          Do you want to work somewhere else?{" "}
          <button
            className="text-theme-red-2"
            onClick={() => setCurrentStep(0)}
          >
            Edit
          </button>
        </p>
      </div>

      {subStep === 1 && (
        <>
          <h2 className="font-omnes text-[28px] text-theme-black-2 font-semibold">
            What’s your name?
          </h2>

          <FloatingLabelInput
            id="firstName"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
          />
          <FloatingLabelInput
            id="lastName"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
          />
        </>
      )}

      {subStep === 2 && (
        <>
          <h2 className="font-omnes text-[28px] text-theme-black-2 font-semibold !mb-7">
            Hello {formData.firstName} {formData.lastName}, what are your
            contact details?
          </h2>

          {/* Email Input */}
          <FloatingLabelInput
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />

          <div className="flex gap-x-2 ">
            <CountrySelect
              labels={en}
              value={formData.countryCode || "+92"}
              onChange={(e) =>
                setFormData({ ...formData, countryCode: e.value })
              }
            />

            <FloatingLabelInput
              id="phoneNum"
              type="number"
              name="phoneNum"
              value={formData.phoneNum}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              placeholder="Phone Number"
            />
          </div>
          <FloatingLabelInput
            id="zipCode"
            type="number"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="zip code"
          />
          <p className="!mt-10 font-sf font-medium text-base text-theme-black-2">
            For more information about how we handle your data, please see our
            <button className="text-theme-red-2 ms-2"> privacy policy</button>
          </p>
          <div className="flex items-center gap-x-2">
            <CustomCheckbox color="#de2d35" />
            <p className="font-sf text-sm font-light">
              I agree that my data will be used for future job offers and stored
              for a period of twelve months.
            </p>
          </div>
        </>
      )}
      {subStep === 3 && (
        <>
          <h2 className="font-omnes text-[28px] text-theme-black-2 font-semibold !mb-4">
            We’ll also need to your license Details ?
          </h2>
          <div className="flex gap-x-4 justify-center items-center">
            <div className="flex-1 space-y-4">
              <h3 className="font-omnes text-lg text-theme-black-2 font-semibold">
                License Issue date
              </h3>
              <input
                type="date"
                className={inputStyle}
                value={formData.licenseIssueDate || ""}
                onChange={handleLicenseIssueDateChange}
              />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="font-omnes text-lg text-theme-black-2 font-semibold">
                License expiry date
              </h3>
              <input
                type="date"
                className={inputStyle}
                value={formData.licenseExpiryDate || ""}
                onChange={handleLicenseExpiryDateChange}
              />
            </div>
          </div>
          <div className="flex gap-x-4 justify-center items-center">
            <div className="flex-1 space-y-4">
              <h3 className="font-omnes text-lg text-theme-black-2 font-semibold">
                License <span className="font-normal"> (front Image)</span>
              </h3>
              <div className="relative border-2 w-full h-44 rounded-lg bg-input-background  bg-center bg-no-repeat  bg-[length:200px_200px] flex justify-center items-center">
                {frontImage ? (
                  <img
                    src={frontImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover rounded-lg"
                    accept="image/*"
                  />
                ) : (
                  <div className="rounded-full bg-theme-red-2 w-12 h-12 flex justify-center items-center text-white">
                    <CiCamera size={24} />
                  </div>
                )}
                <input
                  type="file"
                  className="absolute w-full h-full cursor-pointer opacity-0"
                  onChange={handleFrontImageChange}
                  accept="image/*"
                />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="font-omnes text-lg text-theme-black-2 font-semibold">
                License <span className="font-normal">(Back Image)</span>
              </h3>

              <div className="relative border-2 w-full h-44 rounded-lg bg-input-background bg-center bg-no-repeat bg-[length:200px_200px] flex justify-center items-center">
                {backImage ? (
                  <img
                    src={backImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="rounded-full bg-theme-red-2 w-12 h-12 flex justify-center items-center text-white">
                    <CiCamera size={24} />
                  </div>
                )}
                <input
                  type="file"
                  className="absolute w-full h-full cursor-pointer opacity-0"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {subStep === 4 && (
        <>
          <h2 className="font-omnes text-[28px] text-theme-black-2 font-semibold !mb-4">
            We still have a few questions
          </h2>
          <p className="font-sf text-sm text-theme-black-2 text-opacity-65">
            *I If yes, please be sure to enter the referral ID.
          </p>

          <FloatingLabelInput
            id="referal"
            type="text"
            name="refaralCode"
            value={formData.referalId}
            onChange={handleReferalId}
            placeholder="Referral ID"
          />

          <div className="flex items-center gap-x-2">
            <CustomCheckbox
              id="dataConsent"
              name="dataConsent"
              checked={formData.dataConsent}
              onChange={() =>
                setFormData({ ...formData, dataConsent: !formData.dataConsent })
              }
              color="#de2d35"
            />
            <p className="font-sf text-sm font-light">
              I have read and agree to the{" "}
              <button className="text-theme-red-2">
                {" "}
                terms and conditions of the referral program.
              </button>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AboutStep;
