import React, { useState, useRef } from "react";
import { FaArrowLeft, FaAngleDown, FaAngleUp } from "react-icons/fa";
import Header from "../../components/Header";

export default function Profile() {
  // State to manage which accordion is open
  const [openAccordion, setOpenAccordion] = useState(null);
  const contentRefs = useRef({});

  // Function to toggle the accordion
  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const getMaxHeight = (index) => {
    return openAccordion === index
      ? `${contentRefs.current[index].scrollHeight}px`
      : "0px";
  };

  return (
    <>
      <Header home={true} />
      <section className="relative top-[44px] py-10">
        <div className="w-[92%] lg:w-[94%] smallDesktop:w-[95%] xl:w-[90%] desktop:w-5/6 largeDesktop:w-[75%] extraLargeDesktop:w-[62.5%] mx-auto shadow-custom rounded-md p-6">
          <div className="space-y-0 md:space-y-4">
            {/* <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="w-8 h-8 bg-[#F0F1F5] rounded-full flex justify-center items-center hover:bg-theme-red hover:text-white duration-200"
              >
                <FaArrowLeft />
              </button>
            </div> */}

            <div className="py-5 lg:p-5 space-y-10">
              <h2 className="text-4xl font-switzer font-extrabold">Profile</h2>

              <div>
                <div className="border-b border-b-[#00000033] pb-3 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(1)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      How to change the name/surname in the account?
                    </span>
                    <span className="text-base lg:text-xl desktop:text-2xl">
                      {openAccordion === 1 ? <FaAngleUp /> : <FaAngleDown />}
                    </span>
                  </button>

                  <div
                    ref={(el) => (contentRefs.current[1] = el)}
                    style={{
                      maxHeight: getMaxHeight(1),
                    }}
                    className="transition-max-height duration-500 ease-in-out overflow-hidden space-y-1"
                  >
                    <ul className="list-decimal">
                      <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC]">
                        To change the name/surname on your account:
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        In the bottom right corner of the app, click "Profile"
                        (if you are using the website - click on your icon in
                        the top right corner)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click on your name
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click on your name and change it to the desired one (if
                        you are using the website - press "Settings" first)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Save the changes. 😊
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-b border-b-[#00000033] pt-4 pb-2 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(2)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      How to change your phone number in the account?
                    </span>
                    <span className="text-base lg:text-xl desktop:text-2xl">
                      {openAccordion === 2 ? <FaAngleUp /> : <FaAngleDown />}
                    </span>
                  </button>

                  <div
                    ref={(el) => (contentRefs.current[2] = el)}
                    style={{
                      maxHeight: getMaxHeight(2),
                    }}
                    className="transition-max-height duration-500 ease-in-out overflow-hidden space-y-1"
                  >
                    <ul className="list-decimal">
                      <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC]">
                        To change the name/surname on your account:
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        In the bottom right corner of the app, click "Profile"
                        (if you are using the website - click on your icon in
                        the top right corner)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click on your name
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click on your name and change it to the desired one (if
                        you are using the website - press "Settings" first)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Save the changes. 😊
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-b border-b-[#00000033] pt-4 pb-2 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(3)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      How to delete an account?
                    </span>
                    <span className="text-base lg:text-xl desktop:text-2xl">
                      {openAccordion === 3 ? <FaAngleUp /> : <FaAngleDown />}
                    </span>
                  </button>

                  <div
                    ref={(el) => (contentRefs.current[3] = el)}
                    style={{
                      maxHeight: getMaxHeight(3),
                    }}
                    className="transition-max-height duration-500 ease-in-out overflow-hidden space-y-1"
                  >
                    <ul className="list-decimal">
                      <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC]">
                        To change the name/surname on your account:
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        In the bottom right corner of the app, click "Profile"
                        (if you are using the website - click on your icon in
                        the top right corner)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click on your name
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click on your name and change it to the desired one (if
                        you are using the website - press "Settings" first)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Save the changes. 😊
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-b border-b-[#00000033] pt-4 pb-2 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(4)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      How to change an email address in the profile?
                    </span>
                    <span className="text-base lg:text-xl desktop:text-2xl">
                      {openAccordion === 4 ? <FaAngleUp /> : <FaAngleDown />}
                    </span>
                  </button>

                  <div
                    ref={(el) => (contentRefs.current[4] = el)}
                    style={{
                      maxHeight: getMaxHeight(4),
                    }}
                    className="transition-max-height duration-500 ease-in-out overflow-hidden space-y-1"
                  >
                    <ul className="list-decimal">
                      <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC]">
                        To change the name/surname on your account:
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        In the bottom right corner of the app, click "Profile"
                        (if you are using the website - click on your icon in
                        the top right corner)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click on your name
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click on your name and change it to the desired one (if
                        you are using the website - press "Settings" first)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Save the changes. 😊
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-b border-b-[#00000033] pt-4 pb-2 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(5)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      Chat with a person
                    </span>
                    <span className="text-base lg:text-xl desktop:text-2xl">
                      {openAccordion === 5 ? <FaAngleUp /> : <FaAngleDown />}
                    </span>
                  </button>

                  <div
                    ref={(el) => (contentRefs.current[5] = el)}
                    style={{
                      maxHeight: getMaxHeight(5),
                    }}
                    className="transition-max-height duration-500 ease-in-out overflow-hidden space-y-1"
                  >
                    <ul className="list-decimal">
                      <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC]">
                        To change the name/surname on your account:
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        In the bottom right corner of the app, click "Profile"
                        (if you are using the website - click on your icon in
                        the top right corner)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click on your name
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click on your name and change it to the desired one (if
                        you are using the website - press "Settings" first)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Save the changes. 😊
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
