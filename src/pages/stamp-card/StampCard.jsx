import React, { useState } from "react";
import Header from "../../components/Header";
import Accordion from "../../components/Accordion";
import StampCardModal from "./StampCardModal";
import { info_toaster, success_toaster } from "../../utilities/Toaster";
import { PostAPI } from "../../utilities/PostAPI";
import { useLocation, useNavigate } from "react-router-dom";
import GetAPI from "../../utilities/GetAPI";
import { BASE_URL } from "../../utilities/URL";

const stampCard = () => {
  const location = useLocation();
  const { num } = location?.state || {};
  const [tab, setTab] = useState(num || 1);
  const navigate = useNavigate();
  const activeResData = JSON.parse(localStorage.getItem("activeResData"));
  
  const userId = parseInt(localStorage.getItem("userId"));
  const countryCode = localStorage.getItem("countryCode")?.toLowerCase();
  const cityName = localStorage.getItem("cityName")?.toLowerCase();
    const { data: bannerAndStampCard } = GetAPI(
      `users/userStampsAndBannersForWeb?restaurantId=${activeResData?.id}${
        userId ? `&userId=${userId}` : ""
      }`
    );
  const { data: stampCardHistory } = GetAPI(`users/stampCardHistory/${userId}`);

  console.log("🚀 ~ stampCard ~ stampCardHistory:", bannerAndStampCard)
  const sections = [
    {
      title: "Definitions",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      title: "Applicability",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      title: "Stamps and StampsCards Vouchers",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      title: "StampsCards Vouchers",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      title:
        "Duration, modification and termination of the StampCards Programme",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      title: "Other",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];

  const joinStampCard = async () => {
    let res = await PostAPI("users/joinStampCard", {
      userId,
      checkStatus: activeResData?.checkStamp ? false : true,
    });
    if (res?.data?.status === "1") {
      success_toaster(res?.data?.message);
      window.history.back();
    } else {
      info_toaster(res?.data?.message);
    }
  };

  return (
    <>
      <Header home={true} rest={false} />
      <div className="md:max-w-[80%] w-[92%] mx-auto pt-24">
        <h4 className="font-nunito font-extrabold text-2xl text-center">
          Stamp Cards
        </h4>
        <ul className="flex justify-between md:px-20 md:mt-10 mt-5 font-tt font-normal text-gray-500 text-sm md:text-lg [&>li]:cursor-pointer">
          <li
            className={
              tab === 1
                ? "font-bold text-sm md:text-xl underline underline-offset-8 duration-200 text-black"
                : ""
            }
            onClick={() => setTab(1)}
          >
            Your Stamp Cards
          </li>
          <li
            className={
              tab === 2
                ? "font-bold text-sm md:text-xl underline underline-offset-8 duration-200 text-black"
                : ""
            }
            onClick={() => setTab(2)}
          >
            How it works
          </li>
          <li
            className={
              tab === 3
                ? "font-bold text-sm md:text-xl underline underline-offset-8 duration-200 text-black"
                : ""
            }
            onClick={() => setTab(3)}
          >
            Terms & conditions
          </li>
        </ul>

        <div>
          {tab === 1 ? (
            <>
              <div className="mt-10 md:w-[92%] mx-auto">
                <p className="font-nunito sm:text-lg md:text-xl md:px-0 md:mt-20 md:text-center  md:w-[80%] md:mx-auto">
                  Welcome to your Stamp card overview! This is where we keep
                  your treasured stamp collection and ready to use vouchers.
                </p>
              </div>

              {stampCardHistory?.data?.stamps?.length>0 && !bannerAndStampCard?.data?.obj?.checkStamp ? (
                <>
                  <div className="w-full h-[20vh] md:h-[40vh]"></div>
                  <div className="font-nunito">
                    <h4 className=" font-extrabold text-3xl text-center">
                      Let's get started
                    </h4>
                    <p className="sm:text-lg text-center mt-4 md:text-xl">
                      Discover all your local places that use StampCards <br />{" "}
                      to start saviing!
                    </p>
                    <div
                      className="sm:w-1/2 mx-auto flex justify-center mt-10"
                      onClick={joinStampCard}
                    >
                      <button className="bg-theme-red w-full h-12 text-white rounded-[4px] px-4 font-tt shadow-btnInnerShadow md:text-lg">
                        Order & earn stamps
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-10 md:w-[92%] mx-auto pb-16">
                    <h4 className="font-tt font-semibold text-xl py-2 mt-10">
                      Your StampCard overview
                    </h4>
                    {/* card-- */}
                    <div className="space-y-5 mt-12">
                      {stampCardHistory?.data?.stamps?.length > 0 ? (
                        stampCardHistory?.data?.stamps?.map((item) => (
                          <div
                            onClick={() =>
                              navigate(
                                `/${countryCode}/${cityName}/restaurants/${item?.restaurantName.toLowerCase()}-res-${
                                  item?.restaurantId
                                }`
                              )
                            }
                            className="flex items-center py-4 px-6 gap-x-8 bg-gray-100 rounded-md max-w-[600px] mx-auto"
                          >
                            <div className="size-[120px] rounded-full overflow-hidden shrink-0">
                              <img
                                className="w-full h-full object-cover"
                                src={BASE_URL + item?.image}
                                alt="image"
                              />
                            </div>
                            <div className="w-[70%] space-y-3">
                              <h4 className="font-tt font-semibold text-xl">
                                {item?.restaurantName}
                              </h4>
                              <div className="flex gap-x-5 [&>img]:size-7">
                                {Array.from({
                                  length: Math.min(item?.orderCount, 5),
                                }).map((_, i) => (
                                  <img
                                    key={i}
                                    src="/images/stampCard/redbanner.png"
                                    alt="stamp"
                                  />
                                ))}

                                {Array.from({
                                  length: 5 - Math.min(item?.orderCount, 5),
                                }).map((_, i) => (
                                  <img
                                    key={`empty-${i}`}
                                    src="/images/stampCard/blackbanner.png"
                                    alt="empty"
                                  />
                                ))}
                              </div>
                              {item?.orderCount === 5 ? (
                                <>
                                  <button className="bg-theme-red h-12 font-semibold  text-white rounded-[4px] px-4 font-tt md:text-lg">
                                    Your{" "}
                                    {item?.currency?.currencyUnit.symbol || ""}{" "}
                                    {item?.value} voucher
                                  </button>

                                  <p className="text-gray-500 text-base  font-tt">
                                    Remaining: {item?.remainingPoints}
                                  </p>
                                  <p className="text-gray-500 text-base  font-tt">
                                    Vaild till: 29/11/2025
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-lg font-semibold">
                                    You're almost there!
                                  </p>
                                  <button className="text-theme-red font-bold text-xl font-tt">
                                    Order Now
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center font-semibold font-tt text-2xl pt-11">
                          No Stamp Cards!
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : tab === 2 ? (
            <>
              <div className="mt-20 pb-20">
                <div className="my-10 md:w-[92%] mx-auto">
                  <p className="font-nunito sm:text-lg md:text-xl md:px-0 md:mt-20 md:text-center  md:w-[80%] md:mx-auto">
                    Get rewarded for your loyalty. Start collecting stamps from
                    your favourite restaurants and unlock a tasty little
                    discounts on the way..
                  </p>

                  <h4 className="font-tt font-semibold text-2xl mt-12">
                    For Example
                  </h4>
                  <p className="font-tt font-semibold text-lg my-2">
                    Your Order
                  </p>
                  <p className="text-gray-500 font-tt mb-5 text-lg">
                    10% from each order
                  </p>

                  <div className="w-full h-28 md:h-36 flex gap-x-2 md:gap-x-5 items-center">
                    <div className="w-[65%] h-full bg-gray-100 rounded-md flex justify-around md:px-5 items-center [&>div]:text-center [&>div]:space-y-2 [&>div>p]:text-gray-500 font-tt py-5 max-md:[&>div>p]:text-sm max-md:[&>div>img]:w-6">
                      <div>
                        <p>1st</p>
                        <img
                          className="mx-auto"
                          src="/images/stampCard/bag1.png"
                          alt=""
                        />
                        <p>$4</p>
                      </div>
                      <p className="text-3xl font-bold">+</p>
                      <div>
                        <p>2nd</p>
                        <img
                          className="mx-auto"
                          src="/images/stampCard/bag2.png"
                          alt=""
                        />
                        <p>$5</p>
                      </div>
                      <p className="text-3xl font-bold">+</p>

                      <div>
                        <p>3rd</p>
                        <img
                          className="mx-auto"
                          src="/images/stampCard/bag3.png"
                          alt=""
                        />
                        <p>$4</p>
                      </div>
                      <p className="text-3xl font-bold">+</p>

                      <div>
                        <p>4rth</p>
                        <img
                          className="mx-auto"
                          src="/images/stampCard/bag4.png"
                          alt=""
                        />
                        <p>$4.50</p>
                      </div>
                      <p className="text-3xl font-bold">+</p>

                      <div>
                        <p>5th</p>
                        <img
                          className="mx-auto"
                          src="/images/stampCard/bag5.png"
                          alt=""
                        />
                        <p>$4</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold">=</p>
                    <div className="bg-gray-100 rounded-md px-2 w-[25%] md:w-[35%] h-full flex justify-center items-center flex-col">
                      <p className="text-sm md:text-lg font-tt text-center font-semibold">
                        Total discount for 6th order
                      </p>
                      <p className="text-xl text-theme-red font-bold">$21.00</p>
                    </div>
                  </div>

                  <h4 className="font-tt text-3xl font-extrabold my-10">
                    How does it work?
                  </h4>

                  <div className="grid grid-cols-2 gap-x-5 gap-y-20">
                    <div className="flex flex-col justify-center items-center text-center gap-2 font-tt [&>p]:text-lg">
                      <img
                        className="w-[150px]"
                        src="/images/stampCard/order.png"
                        alt=""
                      />
                      <h4 className="font-extrabold text-2xl my-5">Order</h4>
                      <p>
                        Collect a stamp every time you order from a <br />
                        participating restaurant.
                      </p>
                    </div>

                    <div className="flex flex-col justify-center items-center text-center gap-2 font-tt [&>p]:text-lg">
                      <img
                        className="w-[150px]"
                        src="/images/stampCard/earn.png"
                        alt=""
                      />
                      <h4 className="font-extrabold text-2xl my-5">Earn</h4>
                      <p>
                        Each stamp is worth 10% of your order’s value (exc. fees
                        and chargers) <br /> and will be saved on its own
                        StampCard.
                      </p>
                    </div>

                    <div className="flex flex-col justify-center items-center text-center gap-2 font-tt [&>p]:text-lg">
                      <img
                        className="w-[150px]"
                        src="/images/stampCard/collect.png"
                        alt=""
                      />
                      <h4 className="font-extrabold text-2xl my-5">Collect</h4>
                      <p>
                        Once you’ve collected five stamps from the same <br />{" "}
                        restaurant you’ll unlock a discount for your sixth
                        order.
                      </p>
                    </div>

                    <div className="flex flex-col justify-center items-center text-center gap-2 font-tt [&>p]:text-lg">
                      <img
                        className="w-[150px]"
                        src="/images/stampCard/rewarded.png"
                        alt=""
                      />
                      <h4 className="font-extrabold text-2xl my-5">
                        Get Rewarded
                      </h4>
                      <p>
                        Your discount is the total of your five saved stamps and{" "}
                        <br /> will be automatically applied when you place your
                        sixth order.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : tab === 3 ? (
            <>
              <div className="mt-20">
                <div className="my-10 md:w-[92%] mx-auto">
                  <p className="font-nunito sm:text-lg md:text-xl md:px-0 md:mt-20 md:text-center  md:w-[80%] md:mx-auto">
                    These terms and Conditions StampCards Customers apply to the
                    relationship between Takeaway.com and the Customer who
                    subscribed to the StampCards Programme.
                  </p>
                </div>

                <Accordion sections={sections} />
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default stampCard;
