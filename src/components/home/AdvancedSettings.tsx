import { useState } from "react";
import { Link } from "@tanstack/react-router";
import FormInput from "../ui/FormInput";

export default function AdvancedSettingsAccordion() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  return (
    <div className="my-10 border border-solid border-gray-1100 bg-gray-1300 rounded-[10px] md:pt-[27px] px-4 py-6 md:px-6 md:pb-6">
      <div>
        <button
          type="button"
          onClick={toggleAccordion}
          className="flex items-center justify-between w-full cursor-pointer"
        >
          <p className="text-black-1000 text-base font-medium font-inter">
            Advanced settings
          </p>
          <span
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <img src="/icons/down-arw2.svg" alt="Toggle" />
          </span>
        </button>

        {/* Accordion content */}
        {isOpen && (
          <div className="mt-5">
            {/* <div className="md:pb-10 pb-5">
              <div className="pt-6 pb-[18px]">
                <div className="flex items-center justify-between pb-2.5">
                  <p className="text-gray-1200 font-inter text-sm font-medium md:max-w-full max-w-[159px]">
                    Holder only mode (+1 SOL charge)
                  </p>
                  <p className="text-gray-1200 font-inter text-xs md:text-sm font-medium">
                    Min: 3 / Max: 10,000
                  </p>
                </div>

                <FormInput 
                id="adv"
                type="text"
                placeholder="Enter Collection key or first creator address"
                className="bg-white"
                />
            
              </div>
              <Link
                to="."
                className="text-black-1000 transition hover:bg-primary-color hover:border-primary-color font-medium text-sm font-inter inline-flex items-center justify-center h-8 border border-solid border-black-1000 rounded-full px-3.5 gap-2.5"
              >
                <span className="flex items-center justify-center w-6 h-6">
                  <img src="icons/plus.svg" alt="" />
                </span>
                Add another collection
              </Link>
            </div> */}

            <div className="grid lg:grid-cols-2 gap-[18px] pb-5 lg:pb-11">
              <div>
                <label
                  className="text-sm font-medium font-inter text-gray-1200 pb-2.5 block"
                >
                  Ticket limit per wallet
                </label>
                <FormInput placeholder="No Limit" className="bg-white" />
                <p className="md:text-sm text-xs font-medium font-inter text-black-1000 pt-2.5">
                  Users can purchase 40% of total tickets as standard
                </p>
              </div>
              <div>
                <label
                  className="text-sm font-medium font-inter text-gray-1200 pb-2.5 block"
                >
                  Number of winners
                </label>
                <FormInput type="number" placeholder="250" className="bg-white" />
                <p className="md:text-sm text-xs font-medium font-inter text-black-1000 pt-2.5">
                  eg. WL spots
                </p>
              </div>
            </div>

            <div className="border border-solid border-primary-color bg-primary-color/5 rounded-[10px] py-[15px] px-3.5 lg:px-[26px]">
              <p className="text-primary-color text-sm lg:text-lg font-medium font-inter">
                For raffles with multi-winners - you will need to use a
                placeholder. This placeholder NFT will not be sent to any
                winner. Contact us here to verify.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
