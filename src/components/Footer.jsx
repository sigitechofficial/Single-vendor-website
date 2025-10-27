import { LiaAngleDownSolid } from "react-icons/lia";
import { ImEyeBlocked } from "react-icons/im";
import { MdOutlineLanguage } from "react-icons/md";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

export default function Footer(props) {
  const [accordion, setAccordion] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 840);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleActive = (accordionName) => {
    if (accordion.includes(accordionName)) {
      setAccordion(accordion.filter((name) => name !== accordionName));
    } else {
      setAccordion([...accordion, accordionName]);
    }
  };

  const isDropdownActive = (accordionName) => {
    return accordion.includes(accordionName);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 840);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <footer className="bg-[#141414] tablet:pt-20 pt-8 sm:pb-6 pb-4 text-white font-sf">
      <div
        className={`grid tablet:grid-cols-4 xl:grid-cols-6 gap-5  ${
          props.width
            ? props.width
            : "w-[92%] lg:w-[94%] smallDesktop:w-[95%] xl:w-[90%] desktop:w-5/6 largeDesktop:w-[75%] extraLargeDesktop:w-[62.5%]"
        } mx-auto pb-8`}
      >
        <div className="space-y-4">
          <Link to={"/"}>
            <img
              src="/images/logo-white.webp"
              alt="logo-white"
              className="w-40"
            />
          </Link>
          <div className=" space-y-0 tablet:space-y-3 flex items-center gap-2 tablet:block  pt-5">
            <img
              src="/images/appleButton.svg"
              alt="google-play"
              className="w-[120px] h-[40px]"
            />
            <img
              src="/images/googleP.png"
              alt="google-play"
              className="w-[120px] h-[40px]"
            />
          </div>
        </div>

        <div className="tablet:space-y-5">
          <div
            className="flex items-center justify-between tablet:cursor-pointer"
            onClick={() => isMobile && handleActive("Partner")}
          >
            <h5
              className="font-semibold text-base  text-white 
          tablet:text-[#FFFFFF99]"
            >
              {t("Partner with Fomino")}
            </h5>
            <div
              className={`block tablet:hidden ${
                isDropdownActive("Partner")
                  ? "rotate-180 duration-200"
                  : "rotate-0 duration-200"
              }`}
            >
              <LiaAngleDownSolid />
            </div>
          </div>
          <ul
            className={`dropDown ${
              isDropdownActive("Partner") ? "dropDownActive" : ""
            } relative top-0 left-0 duration-200 space-y-2 font-light text-sm tablet:text-base`}
          >
            <li>{t("For couriers")}</li>
            <li>{t("For restaurants")}</li>
            <li>{t("For business")}</li>
          </ul>
        </div>

        <div className="tablet:space-y-5">
          <div
            className="flex items-center justify-between tablet:cursor-pointer"
            onClick={() => isMobile && handleActive("Company")}
          >
            <h5
              className="font-semibold text-base text-white 
          tablet:text-[#FFFFFF99]"
            >
              {t("Company")}
            </h5>
            <div
              className={`block tablet:hidden ${
                isDropdownActive("Company")
                  ? "rotate-180 duration-200"
                  : "rotate-0 duration-200"
              }`}
            >
              <LiaAngleDownSolid />
            </div>
          </div>
          <ul
            className={`dropDown ${
              isDropdownActive("Company") ? "dropDownActive" : ""
            } relative top-0 left-0 duration-200 space-y-2 font-light text-sm tablet:text-base`}
          >
            <li>{t("About us")}</li>
            <li>{t("What we stand for")}</li>
            <li>{t("Jobs")}</li>
            <li>{t("Sustainability")}</li>
            <li>{t("Security")}</li>
            <li>{t("Investors")}</li>
          </ul>
        </div>

        <div className="tablet:space-y-5">
          <div
            className="flex items-center justify-between tablet:cursor-pointer"
            onClick={() => isMobile && handleActive("Products")}
          >
            <h5
              className="font-semibold text-base text-white 
          tablet:text-[#FFFFFF99]"
            >
              {t("Products")}
            </h5>
            <div
              className={`block tablet:hidden ${
                isDropdownActive("Products")
                  ? "rotate-180 duration-200"
                  : "rotate-0 duration-200"
              }`}
            >
              <LiaAngleDownSolid />
            </div>
          </div>
          <ul
            className={`dropDown ${
              isDropdownActive("Products") ? "dropDownActive" : ""
            } relative top-0 left-0 duration-200 space-y-2 font-light text-sm tablet:text-base`}
          >
            <li>{t("Fomino Drive")}</li>
            <li>{t("Fomino Market")}</li>
            <li>{t("Fomino +")}</li>
            <li>{t("Fomini for Work")}</li>
            <li>{t("Fomino Ads")}</li>
          </ul>
        </div>

        <div className="tablet:space-y-5">
          <div
            className="flex items-center justify-between tablet:cursor-pointer"
            onClick={() => isMobile && handleActive("Links")}
          >
            <h5
              className="font-semibold text-base  text-white 
          tablet:text-[#FFFFFF99]"
            >
              {t("Useful links")}
            </h5>
            <div
              className={`block tablet:hidden ${
                isDropdownActive("Links")
                  ? "rotate-180 duration-200"
                  : "rotate-0 duration-200"
              }`}
            >
              <LiaAngleDownSolid />
            </div>
          </div>
          <ul
            className={`dropDown ${
              isDropdownActive("Links") ? "dropDownActive" : ""
            } relative top-0 left-0 duration-200 space-y-2 font-light text-sm tablet:text-base`}
          >
            <li>{t("Support")}</li>
            <li>{t("Media")}</li>
            <li>{t("Contact")}</li>
            <li>{t("Speak up")}</li>
            <li>{t("Promo codes")}</li>
            <li>{t("Developers")}</li>
          </ul>
        </div>

        <div className="tablet:space-y-5">
          <div
            className="flex items-center justify-between tablet:cursor-pointer"
            onClick={() => isMobile && handleActive("Follow")}
          >
            <h5
              className="font-semibold text-base  text-white 
          tablet:text-[#FFFFFF99]"
            >
              {t("Follow us")}
            </h5>
            <div
              className={`block tablet:hidden ${
                isDropdownActive("Follow")
                  ? "rotate-180 duration-200"
                  : "rotate-0 duration-200"
              }`}
            >
              <LiaAngleDownSolid />
            </div>
          </div>
          <ul
            className={`dropDown ${
              isDropdownActive("Follow") ? "dropDownActive" : ""
            } relative top-0 left-0 duration-200 space-y-2 font-light text-sm tablet:text-base`}
          >
            <li>Fomino blog</li>
            <li> {t("Engineering blog")}</li>
            <li>Instagram</li>
            <li>Facebook</li>
            <li>Twitter</li>
            <li>LinkedIn</li>
            <li>{t("Fomino Life")}</li>
          </ul>
        </div>
      </div>

      <div
        className={`flex md:flex-row flex-col justify-between items-center ${
          props.width
            ? props.width
            : "w-[92%] desktop:w-5/6 largeDesktop:w-[75%] extraLargeDesktop:w-[62.5%]"
        } mx-auto gap-3`}
      >
        <div className="flex items-center  mb-3 w-full gap-x-4">
          <div className="flex items-center gap-x-2">
            <MdOutlineLanguage size={16} />
            <div className="font-normal text-sm">English</div>
          </div>
          <div className="flex items-center gap-x-2">
            <ImEyeBlocked size={16} />
            <div className="font-normal text-sm">{t("Accessibility")}</div>
          </div>
        </div>
        <div className="flex items-center gap-x-4 font-normal text-sm text-white   w-full flex-wrap gap-2">
          <div>{t("Accessibility Statement")}</div>
          <div
            onClick={() => navigate("/terms-conditions")}
            className="cursor-pointer"
          >
            {t("Terms & Conditions")}
          </div>
          <div
            onClick={() => navigate("/privacy-policy")}
            className="cursor-pointer"
          >
            {t("Privacy Policy")}
          </div>
          <div className="sm:ms-7">&copy; {t("Fomino 2023")}</div>
        </div>
      </div>
    </footer>
  );
}
