const InfoCard = ({ image, heading, textItems, bgColor }) => {
  return (
    <div className={`p-6 pb-14 rounded-3xl ${bgColor} space-y-5`}>
      <div>
        <img
          src={image}
          alt="courier"
          className="h-[300px] rounded-xl w-full object-cover"
        />
      </div>
      <div className="space-y-4 text-center">
        <h4 className="font-omnes font-bold text-theme-black-2 text-2xl md:text-[32px] leading-10">
          {heading}
        </h4>
        <ul className="text-theme-black-2 text-opacity-60 text-center space-y-3 font-normal text-base">
          {textItems.map((item, index) => (
            <li key={index}>
              <span className="text-theme-black-2 text-opacity-50">✔</span>{" "}
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default InfoCard;
