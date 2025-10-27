import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import { FcGoogle } from "react-icons/fc";
import { FaAngleRight } from "react-icons/fa6";
import { FaApple } from "react-icons/fa";
import GetAPI from "../../utilities/GetAPI";

export default function Payment() {
  const location = useLocation();
  const paymentMethod = location?.state?.paymentMethod;
  console.log("🚀 ~ Payment ~ paymentMethod:", paymentMethod);

  return (
    <section className="relative">
      <Header home={false} rest={true} />
      <section
        className={`relative space-y-12 font-sf w-11/12 lg:w-1/2 xl:w-1/3 2xl:w-1/4 mx-auto`}
      >
        {paymentMethod.name === "Apple Pay" ? (
          <div className="flex flex-col pt-32 2xl:pt-36 pb-10 space-y-6">
            <div className="flex items-center gap-4 border-b-2 pb-3">
              <span>
                <FaApple size={36} color="black" />
              </span>
              <h2 className="text-3xl lg:text-4xl font-semibold font-switzer text-black">
                Pay
              </h2>
            </div>

            <div>
              <img
                src="/images/apple-pay.webp"
                alt="apple-pay"
                className="w-80 h-80 mx-auto"
              />
            </div>

            <div className="space-y-4 ">
              <h2 className="text-2xl lg:text-3xl font-switzer font-semibold text-center">
                Scan Code with IPhone
              </h2>
              <p className="text-xl text-center">
                Use the Camera app to continue your Apple Pay Purchase on your
                IPhone
              </p>
            </div>
          </div>
        ) : paymentMethod.name === "Credit en Debit card" ? (
          <div className="flex flex-col pt-32 2xl:pt-36 pb-10 space-y-6">
            <div className="space-y-3">
              <h2 className="text-4xl lg:text-5xl 2xl:text-6xl font-black font-tt text-black">
                Card Payment
              </h2>
              <p className="text-lg font-switzer font-normal">
                Order no. R716gtr
              </p>
            </div>

            <div className="border border-black rounded-xl py-6 px-4 w-full space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/credit-card.webp"
                    alt="card"
                    className="w-8 h-8 2xl:w-10 2xl:h-10 object-contain"
                  />
                  <span className="text-2xl 2xl:text-3xl font-semibold font-switzer">
                    Add new
                  </span>
                </div>

                <div>All fields are mandatory unless otherwise indicates. </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="number" className="font-switzer font-medium">
                    Card number
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      name="number"
                      placeholder="1234 5678 9012 3456"
                      className="border rounded-lg p-2.5 outline-none w-full"
                    />
                    <img
                      src="/images/credit-card.webp"
                      alt="card"
                      className="w-6 h-6 object-contain absolute top-2.5 right-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="expiry" className="font-switzer font-medium">
                    Expiry date
                  </label>

                  <div className="relative">
                    <input
                      type="date"
                      name="expiry"
                      placeholder="1234 5678 9012 3456"
                      className="border rounded-lg p-2.5 outline-none w-full"
                    />
                    <img
                      src="/images/credit-card.webp"
                      alt="card"
                      className="w-6 h-6 object-contain absolute top-2.5 right-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="code" className="font-switzer font-medium">
                    Security code
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      name="code"
                      placeholder="1234"
                      className="border rounded-lg p-2.5 outline-none w-full"
                    />
                    <img
                      src="/images/credit-card.webp"
                      alt="card"
                      className="w-6 h-6 object-contain absolute top-2.5 right-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="name" className="font-switzer font-medium">
                    Card holder name
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      placeholder="Ahsan Munir"
                      className="border rounded-lg p-2.5 outline-none w-full"
                    />
                    <img
                      src="/images/credit-card.webp"
                      alt="card"
                      className="w-6 h-6 object-contain absolute top-2.5 right-2.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                name="save"
                id="save"
                className="w-[20px] h-[20px] appearance-none border-2 border-black rounded-sm checked:bg-blue-500 checked:border-transparent relative checked:after:content-['✔'] checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-white checked:after:text-xs"
              />
              <label htmlFor="save" className="text-sm font-switzer">
                Save this payment method for next use
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="bg-[#E13743] text-white text-lg rounded-sm border border-[#E13743] py-2 px-5 w-full hover:bg-transparent hover:text-[#E13743] font-semibold"
              >
                Pay
              </button>
            </div>
          </div>
        ) : paymentMethod === "Google Pay" ? (
          <div className="flex flex-col pt-32 2xl:pt-36 pb-10 space-y-6">
            <div className="flex items-center gap-4 border-b-2 pb-3">
              <span>
                <FcGoogle size={36} />
              </span>
              <h2 className="text-3xl lg:text-4xl font-semibold font-switzer text-black">
                Pay
              </h2>
            </div>

            <div className="flex flex-col justify-center items-center gap-3">
              <h2 className="text-2xl lg:text-[28px] font-switzern text-center">
                Complete your purchase
              </h2>

              <button className="border px-10 py-2 rounded-full flex justify-center items-center gap-4">
                <span className="text-white bg-[#E1374366] rounded-full p-1.5 text-sm">
                  AN
                </span>
                <span>Ayeshanahee99@gmail.com</span>
                <span>
                  <FaAngleRight />
                </span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="number" className="font-switzer font-medium">
                Card number
              </label>

              <div className="border border-black border-opacity-20 rounded-lg py-2 px-3 cursor-pointer">
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/credit-card.webp"
                      alt="payment-card"
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-lg font-switzer font-medium text-black text-opacity-60">
                      Visa **** 9794
                    </span>
                  </div>
                  <span>
                    <FaAngleRight />
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="save"
                id="save"
                className="w-[20px] h-[20px] appearance-none border-2 border-black rounded-sm checked:bg-blue-500 checked:border-transparent relative checked:after:content-['✔'] checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-white checked:after:text-xs"
              />
              <label htmlFor="save" className="text-sm font-switzer">
                Get Google Pay emails with exclusive offers, tips, and
                invitations to give feedback
              </label>
            </div>

            <div className="flex justify-between items-center font-switzer text-xl font-semibold">
              <span>Pay</span>
              <span>CHF 20.00</span>
            </div>

            <div>
              <button
                type="submit"
                className="bg-[#E13743] text-white text-lg rounded-sm border border-[#E13743] py-2 px-5 w-full hover:bg-transparent hover:text-[#E13743] font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <></>
        )}
      </section>
    </section>
  );
}
