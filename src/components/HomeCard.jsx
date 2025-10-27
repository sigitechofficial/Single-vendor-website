import { useTranslation } from "react-i18next";

export default function HomeCard(props) {
  const { t, i18n } = useTranslation();
  return (
    <div className="bg-theme-gray font-sf">
      <div>
        <img
          src={`/images/sec5-img${props.img}.webp`}
          alt={props.alt}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="pb-12 pt-7 lg:px-8 px-3 flex flex-col items-center gap-y-4">
        <h5 className="font-semibold font-omnes text-2xl text-center leading-tight">
          {t(props.text)}
        </h5>
        <button
          onClick={props.apply}
          className="font-sf font-normal text-base  text-theme-red text-center border-b border-b-theme-red pb-1"
        >
          {t("Apply now")}
        </button>
      </div>
    </div>
  );
}
