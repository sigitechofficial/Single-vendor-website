import ReactCountryFlag from "react-country-flag";
import { GoChevronRight } from "react-icons/go";

export default function CountrySection(props) {
  return (
    <button
      key={props.key}
      onClick={props.onClick}
      className="group flex items-center justify-between px-3 py-[19px]  border border-[#e4e4e5] rounded hover:shadow-tabShadow duration-300"
    >
      <div className="flex items-center gap-x-3">
        <ReactCountryFlag
          countryCode={props.countryCode === "UK" ? "GB" : props.countryCode}
          className="text-2xl  rounded shadow-tabShadow !h-auto"
          svg
        />
        <div className="font-normal  text-base leading-[22px] font-sf group-hover:text-theme-red-2">
          {props.country}
        </div>
      </div>
      <GoChevronRight size={22} color="#202125" />
    </button>
  );
}
