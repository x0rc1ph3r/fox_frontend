import React from 'react'
import DateSelector from '../ui/DateSelector';
import TimeSelector from '../ui/TimeSelector';
import DaysSelector from './DaysSelector';
import GumballPriceInput from './GumballPriceInput';
import { AdvancedSettings } from './AdvancedSettings';
import { AgreeCheckbox } from '../common/AgreeCheckbox';
import CreateTokenModel from './CreateTokenModel';
import { useGumballStore } from '../../../store/useGumballStore';
import { useCreateGumball } from '../../../hooks/useCreateGumball';
import toast from 'react-hot-toast';
import { useGumballAnchorProgram } from '../../../hooks/useGumballAnchorProgram';
import { VerifiedTokens } from '@/utils/verifiedTokens';
import { PublicKey } from '@solana/web3.js';

export const GumballSetup = () => {
    const { createGumball } = useCreateGumball();
    const { 
        name, 
        startType, 
        prizeCount, 
        ticketPrice, 
        isTicketSol, 
        ticketCurrency, 
        rent, 
        agreedToTerms,
        isCreatingGumball,
        isCreateTokenModalOpen,
        getStartTimestamp,
        getEndTimestamp,
    } = useGumballStore();
    
    const { 
        setName, 
        setStartType, 
        setPrizeCount,
        openCreateTokenModal,
        closeCreateTokenModal,
        setIsCreatingGumball,
        setAgreedToTerms,
        setStartDate,
        setStartTimeHour,
        setStartTimeMinute,
        setStartTimePeriod,
    } = useGumballStore();

    // Get start date/time state for scheduled start
    const {
        startDate,
        startTimeHour,
        startTimeMinute,
        startTimePeriod,
    } = useGumballStore();

    const tabs = [
        { name: "Start Immediately", type: "manual" as const },
        { name: "Schedule Start", type: "schedule" as const },
    ];


  return (
    <div className='w-full'>
           {/* <div className="flex items-center gap-5 border border-solid border-primary-color rounded-[10px] bg-primary-color/5 py-4 px-5">
            <span>
              <img src="/icons/icon1.png" className='min-w-[56px]' alt="" />
            </span>
            <div>
              <p className="md:text-lg text-base text-primary-color font-medium font-inter pb-1 leading-7">
                No holder benefits
              </p>
              <p className="md:text-lg text-sm font-medium text-black-1000 font-inter leading-7">
                Staking a fox will give you 50% off fees and featured auctions!
              </p>
            </div>
          </div> */}
          {/* <p className="text-base font-medium md:py-10 py-7 font-inter text-primary-color">
            Please link your twitter and discord in your profile or your raffles
            won't be shown.
          </p> */}
          <div className='w-full'>
            <form className='w-full'>
              <div className="pb-10">
                <label
                  htmlFor="name"
                  className="text-gray-1200 font-inter font-medium md:text-base text-sm block pb-2.5"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="text-black-1000 outline outline-gray-1100 focus:outline-primary-color  placeholder:text-gray-1200 md:text-base text-sm w-full font-inter px-5 h-12 rounded-lg font-medium"
                  placeholder="Name your Gumball"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isCreatingGumball}
                />
              </div>
              <div className="pb-10">
                <p className="md:text-base text-sm text-black-1000 font-inter font-medium pb-5">
                  When would you like the sale to start?
                </p>
                <ul className="grid grid-cols-2 md:gap-5 gap-3">
                  {tabs.map((tab, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => setStartType(tab.type)}
                        disabled={isCreatingGumball}
                        className={`border cursor-pointer border-solid w-full border-gray-1100 flex items-center justify-center rounded-lg px-5 h-12 md:text-base text-sm font-medium text-black-1000 font-inter ${startType === tab.type ? "border-primary-color bg-primary-color/5" : "bg-white"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {tab.name}
                      </button>
                    </li>
                  ))}
                </ul>

               <div className="w-full mt-10">
                {startType === "schedule" &&
                    <div className='pb-10 grid grid-cols-2 md:gap-5 gap-3'>
                      <div className="">
                        <DateSelector 
                          label='Start Date' 
                          value={startDate}
                          onChange={setStartDate}
                          minDate={new Date()}
                          disabled={isCreatingGumball}
                        /> 
                      </div>
                       <div className="">
                        <TimeSelector 
                          label='Start Time'
                          hour={startTimeHour}
                          minute={startTimeMinute}
                          period={startTimePeriod}
                          onTimeChange={(hour, minute, period) => {
                            setStartTimeHour(hour);
                            setStartTimeMinute(minute);
                            setStartTimePeriod(period);
                          }}
                          disabled={isCreatingGumball}
                          hasValue={!!startDate}
                        />
                      </div>
                    </div>}

                    <DaysSelector/>

                     <div className="md:pb-10 pb-8">
                      <div className="flex md:flex-nowrap flex-wrap items-start gap-5">
                        <div className="w-full">
                          <div className="flex items-center justify-between pb-2.5">
                            <p className="text-gray-1200 font-inter text-sm font-medium">
                              Prize count
                            </p>
                            <p className="text-gray-1200 font-inter text-sm font-medium">
                              Min: 3 / Max: 10,000
                            </p>
                          </div>
                          <input
                            id="count"
                            type="text"
                            className="text-black-1000 outline outline-gray-1100 focus:outline-primary-color placeholder:text-gray-1200 md:text-base text-sm w-full font-inter md:px-5 px-[14px] h-12 rounded-lg font-medium"
                            placeholder="Enter Count"
                            value={prizeCount}
                            onChange={(e) => setPrizeCount(e.target.value)}
                            disabled={isCreatingGumball}
                            min={3}
                            max={10000}
                          />
                          <p className="text-sm font-medium text-black-1000 pt-2.5 font-inter">
                            Rent: {rent} SOL
                          </p>
                        </div>
                        <GumballPriceInput/>
                      </div>
                    </div>
                    </div>

                    {/* <AdvancedSettings/> */}


                    <div className="flex-1">
                      <div className="md:mb-10 mb-5 grid md:grid-cols-2 gap-4">
                        <AgreeCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />
                        <button 
                          onClick={async (e) => {
                            e.preventDefault();
                            const endTime = getEndTimestamp();
                            
                            // For scheduled start, validate start date is selected
                            if (startType === "schedule") {
                              const startTime = getStartTimestamp();
                              if (!startTime) {
                                toast.error("Please select a start date and time");
                                return;
                              }
                            }
                            
                            if (!endTime) {
                              toast.error("Please select an end date and time");
                              return;
                            }
                            
                            // For immediate start, use current timestamp
                            const startTime = startType === "manual" 
                              ? Math.floor(Date.now() / 1000) 
                              : getStartTimestamp()!;
                            console.log("startTime", startTime);
                            console.log("endTime", endTime);
                            setIsCreatingGumball(true);
                            try {
                              await createGumball.mutateAsync({
                                name,
                                startTime,
                                endTime,
                                totalTickets: parseInt(prizeCount) || 0,
                                ticketPrice: parseFloat(ticketPrice) || 0,
                                isTicketSol:ticketCurrency.address==="So11111111111111111111111111111111111111112",
                                startGumball: startType === "manual",
                                ticketMint: new PublicKey(ticketCurrency.address),
                              });
                            } catch (error) {
                              toast.error("Failed to create gumball");
                              console.error(error);
                            } finally {
                              setIsCreatingGumball(false);
                            }
                            
                          }}
                          disabled={isCreatingGumball || !agreedToTerms}
                          className="cursor-pointer text-white font-semibold md:text-base text-sm leading-normal font-inter h-14 rounded-full inline-flex items-center justify-center w-full transition duration-500 hover:opacity-90 bg-linear-to-r from-neutral-800 via-neutral-500 to-neutral-800 hover:from-primary-color hover:via-primary-color hover:to-primary-color disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingGumball ? "Creating..." : "Create Gumball"}
                        </button>
                      </div>
                      <div className="bg-gray-1300 rounded-[20px] md:p-6 p-4 overflow-hidden">
                        <h4 className="text-primary-color font-bold text-xl leading-normal mb-6">Terms & Conditions</h4>
                        <ul>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-base leading-[160%]  w-6">1.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">When you add prizes to a Gumball, the prizes will be transferred from your wallet into an escrow wallet.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">2.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">You will be charged an up-front rent fee, in SOL, which will be taken in proportion to the number of prizes you choose to add to the Gumball, with a maximum rent fee of 0.72 SOL. The rent fee will be automatically refunded after the Gumball has been closed.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">3.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">FFF and TFF holders will get a 50% fee waiver for staking or sending foxes on missions prior to creating the Gumball and will be hosted on the "Featured" section of the home page.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">4.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">The prizes that do not get sold will be returned to you upon closing the Gumball.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">5.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">You can specify the amount of time a Gumball runs at the creation of the Gumball. Gumballs require a minimum 24 hour run time.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">6.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">You can end the Gumball machine early if the expected value is at least -90% based on remaining prizes or if it has been at least 10 hours since the last spin on that Gumball.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">7.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">FFF will take a total of 5% commission fee from the Gumball sales.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">8.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">To enable Holder-only, you will be charged 1 SOL per Gumball creation, withdrawn at the time of creation. More information about holder-only Gumballs is available on the create Gumball site.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">9.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">Scheduled Gumballs will start at the scheduled date and time even if not all prizes have been added.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">10.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">Gumballs CANNOT be edited once it has been launched. Gumballs cannot restart once it has been stopped.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">11.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">Once one Gumball has sold, the machine cannot be closed until the specified end date.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]  w-6">12.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">Gumball, its agents, directors, or officers shall not assume any liability or responsibility for your use of Gumball, promoting or marketing the Gumballs.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%] w-6">13.</span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter md:text-base text-sm leading-[160%]">Gumball currently does not support cNFTs, the program ID is:
                              <strong className="font-medium block">MGUMqztv7MHgoHBYWbvMyL3E3NJ4UHfTwgLJUQAbKGa</strong>
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
              </div>
            </form>
          </div>

          <CreateTokenModel isOpen={isCreateTokenModalOpen} onClose={closeCreateTokenModal} />
    </div>
  )
}
