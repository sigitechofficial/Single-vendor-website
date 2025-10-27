import { FaArrowRightLong } from "react-icons/fa6";
import { FaArrowLeftLong } from "react-icons/fa6";

export const SampleNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div className={className} onClick={onClick}>
      <FaArrowRightLong
        size={20}
        color="#E13743"
        className="absolute top-1/2 right-2 transform -translate-y-1/2 "
      />
    </div>
  );
};

export const SamplePrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div className={className} onClick={onClick}>
      <FaArrowLeftLong
        size={20}
        color="#E13743"
        className="absolute top-1/2 right-2 transform -translate-y-1/2 "
      />
    </div>
  );
};
