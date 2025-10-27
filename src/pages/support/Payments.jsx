import React, { useState, useRef } from "react";
import { FaArrowLeft, FaAngleDown, FaAngleUp } from "react-icons/fa";
import Header from "../../components/Header";

export default function Payments() {
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
              <h2 className="text-4xl font-switzer font-extrabold">
                Bills and payments
              </h2>

              <div>
                <div className="border-b border-b-[#00000033] pb-3 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(1)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      How to get an invoice?
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
                        To receive an invoice:
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        In the bottom right corner of the app, click "Profile"
                        (if you are using the website - click on your icon and
                        name in the top right corner)
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Choose the "Order History" section
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Select the order for which you want to receive an
                        invoice
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click "Request VAT receipt"
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Fill in the required information and submit the request.
                        😊
                      </li>
                    </ul>

                    <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC] max-w-3xl">
                      You can only submit an invoice request once, so please
                      make sure that the data you have entered is correct before
                      confirming the request.
                    </div>
                  </div>
                </div>

                <div className="border-b border-b-[#00000033] pt-4 pb-2 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(2)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      How is preparation time calculated?
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
                        Preparation time is calculated based on the average time
                        it takes the restaurant to prepare the order.
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Select a restaurant/store.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click the "More info" button under the name of the
                        restaurant/shop.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        You will see a map that shows the border where we
                        deliver from a specific restaurant or store. 💪
                      </li>
                    </ul>

                    <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC] max-w-3xl">
                      If you want to see all the restaurants and shops from
                      which Wolt delivers to your given address, select
                      "Restaurants" or "Stores" at the bottom of the app and
                      enter the delivery address at the top, then the app will
                      automatically filter out all the places you can order
                      from. 👌
                    </div>
                  </div>
                </div>

                <div className="border-b border-b-[#00000033] pt-4 pb-2 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(3)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      Why does the app say "The courier is currently delivering
                      earlier orders"?
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
                        Preparation time is calculated based on the average time
                        it takes the restaurant to prepare the order.
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Select a restaurant/store.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click the "More info" button under the name of the
                        restaurant/shop.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        You will see a map that shows the border where we
                        deliver from a specific restaurant or store. 💪
                      </li>
                    </ul>

                    <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC] max-w-3xl">
                      If you want to see all the restaurants and shops from
                      which Wolt delivers to your given address, select
                      "Restaurants" or "Stores" at the bottom of the app and
                      enter the delivery address at the top, then the app will
                      automatically filter out all the places you can order
                      from. 👌
                    </div>
                  </div>
                </div>

                <div className="border-b border-b-[#00000033] pt-4 pb-2 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(4)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      How to cancel an order?
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
                        Preparation time is calculated based on the average time
                        it takes the restaurant to prepare the order.
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Select a restaurant/store.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click the "More info" button under the name of the
                        restaurant/shop.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        You will see a map that shows the border where we
                        deliver from a specific restaurant or store. 💪
                      </li>
                    </ul>

                    <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC] max-w-3xl">
                      If you want to see all the restaurants and shops from
                      which Wolt delivers to your given address, select
                      "Restaurants" or "Stores" at the bottom of the app and
                      enter the delivery address at the top, then the app will
                      automatically filter out all the places you can order
                      from. 👌
                    </div>
                  </div>
                </div>

                <div className="border-b border-b-[#00000033] pt-4 pb-2 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(5)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      How to place an order?
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
                        Preparation time is calculated based on the average time
                        it takes the restaurant to prepare the order.
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Select a restaurant/store.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click the "More info" button under the name of the
                        restaurant/shop.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        You will see a map that shows the border where we
                        deliver from a specific restaurant or store. 💪
                      </li>
                    </ul>

                    <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC] max-w-3xl">
                      If you want to see all the restaurants and shops from
                      which Wolt delivers to your given address, select
                      "Restaurants" or "Stores" at the bottom of the app and
                      enter the delivery address at the top, then the app will
                      automatically filter out all the places you can order
                      from. 👌
                    </div>
                  </div>
                </div>

                <div className="border-b border-b-[#00000033] pt-4 pb-2 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(6)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      How can I add a tip for the courier?
                    </span>
                    <span className="text-base lg:text-xl desktop:text-2xl">
                      {openAccordion === 6 ? <FaAngleUp /> : <FaAngleDown />}
                    </span>
                  </button>

                  <div
                    ref={(el) => (contentRefs.current[6] = el)}
                    style={{
                      maxHeight: getMaxHeight(6),
                    }}
                    className="transition-max-height duration-500 ease-in-out overflow-hidden space-y-1"
                  >
                    <ul className="list-decimal">
                      <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC]">
                        Preparation time is calculated based on the average time
                        it takes the restaurant to prepare the order.
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Select a restaurant/store.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click the "More info" button under the name of the
                        restaurant/shop.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        You will see a map that shows the border where we
                        deliver from a specific restaurant or store. 💪
                      </li>
                    </ul>

                    <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC] max-w-3xl">
                      If you want to see all the restaurants and shops from
                      which Wolt delivers to your given address, select
                      "Restaurants" or "Stores" at the bottom of the app and
                      enter the delivery address at the top, then the app will
                      automatically filter out all the places you can order
                      from. 👌
                    </div>
                  </div>
                </div>

                <div className="border-b border-b-[#00000033] pt-4 pb-2 space-y-2">
                  <button
                    className="w-full flex items-center justify-between"
                    onClick={() => toggleAccordion(7)}
                  >
                    <span className="text-base lg:text-xl text-start desktop:text-2xl font-switzer font-medium">
                      Chat with a person
                    </span>
                    <span className="text-base lg:text-xl desktop:text-2xl">
                      {openAccordion === 7 ? <FaAngleUp /> : <FaAngleDown />}
                    </span>
                  </button>

                  <div
                    ref={(el) => (contentRefs.current[7] = el)}
                    style={{
                      maxHeight: getMaxHeight(7),
                    }}
                    className="transition-max-height duration-500 ease-in-out overflow-hidden space-y-1"
                  >
                    <ul className="list-decimal">
                      <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC]">
                        Preparation time is calculated based on the average time
                        it takes the restaurant to prepare the order.
                      </div>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Select a restaurant/store.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        Click the "More info" button under the name of the
                        restaurant/shop.
                      </li>
                      <li className="text-sm lg:text-base ml-6 font-switzer font-medium text-[#000000CC]">
                        You will see a map that shows the border where we
                        deliver from a specific restaurant or store. 💪
                      </li>
                    </ul>

                    <div className="text-sm lg:text-base font-switzer font-medium text-[#000000CC] max-w-3xl">
                      If you want to see all the restaurants and shops from
                      which Wolt delivers to your given address, select
                      "Restaurants" or "Stores" at the bottom of the app and
                      enter the delivery address at the top, then the app will
                      automatically filter out all the places you can order
                      from. 👌
                    </div>
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
