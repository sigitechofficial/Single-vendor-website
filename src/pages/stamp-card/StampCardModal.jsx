import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";

const StampCardModal = ({ stampCardModal, setStampCardModal }) => {
  const navigate = useNavigate();
  return (
    <>
      <Modal
        onClose={() => {
          setStampCardModal(false);
        }}
        isOpen={stampCardModal}
        isCentered
        size="xl"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius={"20px"}
          maxW={["510px", "510px", "600px"]}
          className="modal-content-custom"
        >
          <div
            onClick={() => setStampCardModal(false)}
            className="absolute z-20 top-5 right-6 flex justify-center items-center text-end rounded-fullest cursor-pointer w-10 h-10 bg-theme-gray-17 hover:bg-theme-gray-16"
          >
            <IoClose size={30} />
          </div>
          <ModalHeader>
            <h5 className="font-omnes font-bold text-[28px] text-center">
              Stamp Cards
            </h5>
          </ModalHeader>
          <ModalBody padding={0}>
            <div className="font-sf font-semibold text-base max-h-[calc(100vh-200px)] h-auto overflow-auto pt-5 pb-3 px-6 space-y-4 [&>p]:cursor-pointer">
              <h4 className="text-xl font-omnes font-bold">How it works</h4>
              <p className="font-medium">
                Order 5 times from a participating restaurant to get a discount
                worth 10% of the last 5 order’s total spend.
              </p>
              <p className="font-medium">
                on your 6th order, your discount will be available to claim in
                your basket.
              </p>
              <h4 className="font-omnes text-xl font-bold">Example</h4>

              <div className="border-2 rounded-sm">
                <div className="flex justify-between items-center rounded-md px-3 h-28">
                  <div className="py-4 text-center w-[50%]">
                    <div className="flex gap-x-6">
                      <div>
                        <img
                          className="mx-auto"
                          src="/images/stampCard/bag.png"
                          alt=""
                        />
                      </div>
                      <div>
                        <img
                          className="mx-auto"
                          src="/images/stampCard/bag.png"
                          alt=""
                        />
                      </div>

                      <div>
                        <img
                          className="mx-auto"
                          src="/images/stampCard/bag.png"
                          alt=""
                        />
                      </div>

                      <div>
                        <img
                          className="mx-auto"
                          src="/images/stampCard/bag.png"
                          alt=""
                        />
                      </div>

                      <div>
                        <img
                          className="mx-auto"
                          src="/images/stampCard/bag.png"
                          alt=""
                        />
                      </div>
                    </div>
                    <p className="text-gray-500 font-normal">
                      Total spend on 5 orders
                    </p>
                  </div>
                  <p className="text-2xl font-bold">=</p>

                  <p className="font-sf font-black text-[20px] text-center">
                    CHF 60.00
                  </p>
                </div>
                <hr />
                <div className="flex justify-between items-center h-28 px-3">
                  <div className="w-[50%] flex gap-x-2 items-center">
                    <img src="/images/stampCard/bannerIcon.png" alt="" />
                    <p>6th order discount</p>
                  </div>
                  <p className="text-2xl font-bold">=</p>

                  <p className="font-sf font-black text-[20px] text-center">
                    CHF 6.00
                  </p>
                </div>
              </div>
              <p>
                you can only earn stamps and radeem rewards with online payment
                method.
              </p>
              <p
                className="underline underline-offset-4 text-center"
                onClick={() => {
                  navigate("/stamp-card", { state: { num: 3 } });
                }}
              >
                See Terms & Conditions
              </p>
            </div>
          </ModalBody>

          <ModalFooter>
            {/* <button
              onClick={() => {
                setStampCardModal(false);
              }}
              className="py-3 px-5 w-full bg-theme-red text-white font-switzer font-semibold text-base rounded border border-theme-red hover:bg-transparent hover:text-theme-red"
            >
              Done
            </button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StampCardModal;
