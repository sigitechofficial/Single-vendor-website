import React, { useContext, useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import { IoBicycleSharp } from "react-icons/io5";
import { PiUsers } from "react-icons/pi";
import { CiMail } from "react-icons/ci";
import { BiX } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import GetAPI from "../../utilities/GetAPI";
import { PostAPI } from "../../utilities/PostAPI";
import {
  error_toaster,
  info_toaster,
  success_toaster,
} from "../../utilities/Toaster";
import { dataContext } from "../../utilities/ContextApi";
import getCountryCode from "../../utilities/getCountryCode";
import CrossIcon from "../../components/CrossIcon";
import FloatingLabelInput from "../../components/FloatingLabelInput";

export default function JoinGroupOrder() {
  const location = useLocation().search;
  const navigate = useNavigate();
  const orderId = new URLSearchParams(location).get("id");
  const { data } = GetAPI(`users/groupOrderDetailsGet/${orderId}`);
  const [guestData, setGuestData] = useState({ userId: "" });
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const formDataButton = useRef(null);
  const groupData = JSON.parse(localStorage.getItem("groupData"));
  const groupId = JSON.parse(localStorage.getItem("groupData"))?.orderId;
  // const countryCode = localStorage.getItem("countryShortName")?.toLowerCase();
  const { gData, setGData, groupDrawer, setGroupDrawer } =
    useContext(dataContext);
  // let countryCode = getCountryCode();

  const joinGroupFunc = async (e) => {
    if (!localStorage.getItem("userName")) {
      e.preventDefault();
      if (name === "") {
        info_toaster("Please enter Name");
      } else {
        if (guestData?.userId) {
          let res = await PostAPI("users/joinMember", {
            orderId: orderId,
            name: name,
            userId: guestData?.userId,
          });

          if (res?.data?.status === "1") {
            success_toaster(res?.data?.message);
            localStorage.setItem("resId", data?.data?.restaurant?.id);
            localStorage.setItem("groupOrder", JSON.stringify({}));
            localStorage.setItem("groupData", JSON.stringify(data?.data));
            navigate(`/pk/group-order/${groupId}/join`);
          } else {
            error_toaster(res?.data?.message);
          }
        }
      }
    } else {
      let res = await PostAPI("users/joinMember", {
        orderId: orderId,
        name: localStorage.getItem("userName")
          ? localStorage.getItem("userName")
          : "User",
        userId: parseInt(localStorage.getItem("userId")),
      });

      if (res?.data?.status === "1") {
        success_toaster(res?.data?.message);
        localStorage.setItem("resId", data?.data?.restaurant?.id);
        localStorage.setItem("groupOrder", JSON.stringify({}));
        localStorage.setItem("groupData", JSON.stringify(data?.data));
        navigate(`/pk/group-order/${groupId}/join`);
      } else if (
        res?.data?.message?.includes("Locked") ||
        res?.data?.message?.includes("locked")
      ) {
        error_toaster("Group is locked can't be joined right now.");
        navigate(`/pk`);
      } else {
        error_toaster(res?.data?.message);
      }
    }
  };

  const GuestAccount = async () => {
    if (localStorage.getItem("loginStatus")) return false;
    let res = await PostAPI("users/guestAccount", {
      name: name,
    });

    if (res?.data?.status === "1") {
      setGuestData(res?.data?.data);
      localStorage.setItem("userId", guestData?.userId);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("groupData")) {
      // const gLink = window.location.href;
      // localStorage.setItem("gLink", gLink);
      localStorage.setItem("resId", groupData?.restaurant?.id);
      navigate(`/pk/group-order/${groupId}/venue`);
    } else {
      const gLink = window.location.href;
      localStorage.setItem("gLink", gLink);
    }
  }, []);

  useEffect(() => {
    if (guestData && step === 2 && !localStorage.getItem("guestJoined")) {
      const btn = document.getElementById("btn");
      btn.click();
      localStorage.setItem("guestJoined", true);
    }
  }, [guestData]);

  return (
    <>
      <Header home={true} rest={false} />
      <section className="py-24 w-[92%] lg:w-[94%] smallDesktop:w-[95%] xl:w-[90%] desktop:w-5/6 largeDesktop:w-[75%] extraLargeDesktop:w-[62.5%] mx-auto">
        {step === 2 && (
          <div className="flex justify-end">
            <button onClick={() => setStep(1)}>
              <CrossIcon />
            </button>
          </div>
        )}
        <div className="mt-5  gap-8">
          {step === 1 ? (
            <div className="space-y-8">
              <div className="absolute top-[90px] right-8">
                <button onClick={() => window.history.back()}>
                  <CrossIcon />
                </button>
              </div>

              <div className="mt-1 grid lg:grid-cols-2 items-center lg:gap-44">
                <div className="pt-16  py-24  mx-auto  max-w-[1200px] px-[30px] order-2 lg:order-1">
                  <h3 className="font-bold text-4xl  font-omnes lg:leading-[45px]">
                    {`Welcome to ${data?.data?.groupName}`}
                  </h3>
                  <div className="font-switzer font-normal text-xl space-y-4 mt-6 mb-6">
                    <div className="flex gap-x-2">
                      <div className="flex justify-center items-center">
                        <CiMail size={24} />
                      </div>
                      <div>{`Order from ${data?.data?.hostebBy?.userName}`}</div>
                    </div>
                    <div className="flex gap-x-2">
                      <div className="flex justify-center items-center">
                        <IoBicycleSharp size={24} />
                      </div>
                      <div>
                        {`Delivery to ${data?.data?.dropOffAddress?.streetAddress}`}
                      </div>
                    </div>
                    <div className="flex gap-x-2">
                      <div className="flex justify-center items-center">
                        <PiUsers size={24} />
                      </div>
                      <div>
                        {data?.data?.participantList?.length === 1
                          ? "1 participant"
                          : `${data?.data?.participantList?.length} participants`}
                      </div>
                    </div>
                  </div>
                  <div className="font-sf space-y-2">
                    <button
                      onClick={() => {
                        localStorage.getItem("userName")
                          ? joinGroupFunc()
                          : setStep(2);
                        localStorage.removeItem("cartItems");
                      }}
                      // disabled={localStorage.getItem("loginStatus") ? false : true}
                      className={`py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white font-bold shadow-md text-base rounded-lg border border-theme-red font-sf${
                        localStorage.getItem("loginStatus")
                          ? "cursor-pointer"
                          : "cursor-pointer"
                      }`}
                    >
                      {localStorage.getItem("loginStatus")
                        ? "Join Order Together"
                        : "Join as Guest"}
                    </button>
                    {localStorage.getItem("loginStatus") ? (
                      <></>
                    ) : (
                      <button className="py-[14px] px-5 w-full    text-base rounded-lg   font-sf bg-theme-red bg-opacity-20 text-theme-red font-semibold border border-theme-red border-opacity-20">
                        Sign in
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-center items-center order-1 lg:order-2">
                  <img
                    src="/images/Say_hai__2.gif"
                    alt="group-order"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            <form onSubmit={joinGroupFunc} className="space-y-8">
              <h3 className="font-omnes font-bold text-5xl">
                Hello and great to see you!
              </h3>
              <div className="space-y-3 font-sf  ">
                <label
                  htmlFor="name"
                  className="font-omnes text-xl font-semibold"
                >
                  What's your name?
                </label>
                {/* <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter your name"
                  className="px-5 py-2.5 rounded focus:outline-none w-full border border-black border-opacity-20 font-normal text-base"
                /> */}

                <FloatingLabelInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter your name"
                />
              </div>
              <div className="font-sf">
                <button
                  type="submit"
                  ref={formDataButton}
                  id="btn"
                  className=" py-[14px] px-5 w-full bg-theme-red hover:bg-opacity-95 text-white font-bold shadow-md text-base rounded-lg border border-theme-red font-sf"
                  onClick={() => GuestAccount()}
                >
                  Continue
                </button>
              </div>
            </form>
          ) : (
            <></>
          )}
        </div>
      </section>
    </>
  );
}
