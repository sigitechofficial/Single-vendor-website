import { useState, useEffect } from "react";
import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input/input";
import { RiArrowDropDownLine } from "react-icons/ri";

const CountrySelect = ({ value, onChange, hideLabel, labels, ...rest }) => {
  const selectClassNames =
    "me-1 w-[190px] font-sf w-full font-normal text-base text-theme-black-2 rounded-lg py-3 ps-3 px-4 bg-white border-2 border-theme-gray-12 placeholder:text-black placeholder:text-opacity-40 focus:outline-none focus:border-2 focus:border-green-700 hover:border-2 hover:border-green-700 hover:cursor-pointer custom-select";

  const selectClassNamesAdjusted = hideLabel
    ? selectClassNames
        .replace("py-3", "py-1.5")
        .replace("border-2", "border")
        .replace("focus:border-2", "focus:border")
        .replace("hover:border-2", "hover:border")
    : selectClassNames;

  // value here is ISO country code e.g. "PK"
  const [selectedCountry, setSelectedCountry] = useState(value || "PK");

  useEffect(() => {
    setSelectedCountry(value || "PK");
  }, [value]);

  const handleChange = (event) => {
    const isoCode = event.target.value; // e.g. "PK"
    setSelectedCountry(isoCode);
    onChange(isoCode); // pass ISO code onChange
  };

  return (
    <div style={{ position: "relative" }}>
      {!hideLabel && (
        <span className="font-semibold absolute left-[14px] top-[6px]  text-xs transition-all peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-base peer-placeholder-shown:text-theme-black-2 peer-placeholder-shown:text-opacity-40 peer-focus:top-[7px] peer-focus:text-xs text-theme-green-2">
          Country
        </span>
      )}
      <select
        {...rest}
        value={selectedCountry}
        onChange={handleChange}
        className={selectClassNamesAdjusted}
        style={{
          appearance: "none",
          paddingRight: "30px",
          paddingTop: hideLabel ? "6px" : "22px",
          paddingBottom: "6px",
        }}
      >
        {getCountries().map((country) => (
          <option key={country} value={country}>
            {labels[country]} +{getCountryCallingCode(country)}
          </option>
        ))}
      </select>

      <RiArrowDropDownLine
        size={30}
        style={{
          position: "absolute",
          right: "10px",
          top: hideLabel ? "43%" : "50%",
          transform: "translateY(-30%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default CountrySelect;
