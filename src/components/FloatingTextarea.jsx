import { useState } from "react";

const FloatingTextarea = ({ id, name, value, onChange, placeholder }) => {
  return (
    <div className="relative w-full font-sf font-normal text-base text-theme-black-2">
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        rows="5"
        className="rounded-lg py-3 px-4 peer block w-full pt-[22px] pb-1 text-sm resize-none bg-white border-2 focus:border-3 border-theme-gray-12 placeholder:text-theme-black-2 placeholder:text-opacity-40 focus:outline-none focus:border-2 focus:border-green-700 hover:border-2 hover:border-green-700 hover:cursor-pointer"
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-[6px] text-gray-400 text-xs transition-all peer-placeholder-shown:top-[16px] peer-placeholder-shown:text-sm peer-placeholder-shown:text-theme-black-2 peer-placeholder-shown:text-opacity-40 peer-focus:top-[7px] peer-focus:text-xs peer-focus:text-theme-green-2 pointer-events-none"
      >
        {placeholder}
      </label>
    </div>
  );
};

export default FloatingTextarea;
