/* eslint-disable @typescript-eslint/no-unused-vars */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment, useState, useMemo } from "react";
import { AgreeCheckbox } from "@/components/common/AgreeCheckbox";
import AdvancedSettingsAccordion from "@/components/home/AdvancedSettings";
import AmountInput from "@/components/home/AmountInput";
import TimeSelector from "@/components/ui/TimeSelector";
import FormInput from "@/components/ui/FormInput";
import DateSelector from "@/components/ui/DateSelector";
import CreateTokenModel from "@/components/gumballs/CreateTokenModel";

import { useRaffleAnchorProgram  } from "../../../hooks/useRaffleAnchorProgram";
import { useGetTokenPrice } from "../../../hooks/useGetTokenPrice";
import { useCreateRaffleStore } from "../../../store/createRaffleStore";
import TokenPrizeInput from "@/components/home/TokenPrizeInput";

export const Route = createFileRoute("/raffles/create_raffles")({
  component: CreateRaffles,
}); 
import { useCreateRaffle } from "../../../hooks/useCreateRaffle";

import { Loader } from "lucide-react";
import { useFetchUserNfts } from "hooks/useFetchUserNfts";
import { useGetCollectionFP } from "hooks/useGetCollectionFP";
import clsx from "clsx";
import { VerifiedNftCollections } from "@/utils/verifiedNftCollections";
import { VerifiedTokens } from "@/utils/verifiedTokens";

function CreateRaffles() {
  const {
    isVerifiedCollectionsModalOpen,
    isCreateTokenModalOpen,
    userVerifiedTokens,
    tokenPrizeMint,
    setTokenPrizeMint,
    nftPrizeMint,
    setNftPrizeMint,
    floor,
    setFloor,
    nftPrizeName,
    setNftPrizeName,
    openVerifiedCollectionsModal,
    closeVerifiedCollectionsModal,
    openCreateTokenModal,
    closeCreateTokenModal,

    endDate,
    setEndDate,
    endTimeHour,
    endTimeMinute,
    endTimePeriod,
    setEndTimeHour,
    setEndTimeMinute,
    setEndTimePeriod,
    selectedDuration,
    applyDurationPreset,

    supply,
    setSupply,

    tokenPrizeAmount,
    ttv,
    val,
    percentage,
    rent,
    nftCollection,
    setNftCollection,
    agreedToTerms,
    isCreatingRaffle,
    setAgreedToTerms,

    collectionSearchQuery,
    setCollectionSearchQuery,

    tokenSearchQuery,
    setTokenSearchQuery,
    isVerifiedTokensModalOpen,
    openVerifiedTokensModal,
    closeVerifiedTokensModal,

    prizeImage,
    setPrizeImage,
    ticketPricePerSol,
    prizeType,
    setPrizeType,

    getComputedTTV,
    getComputedRent,
    setIsCreatingRaffle,
    setNumberOfWinners,
  } = useCreateRaffleStore();

  const {createRaffle} = useCreateRaffle();
  const { getRaffleConfig } = useRaffleAnchorProgram();
  const { data: raffleConfig, isLoading: isLoadingRaffleConfig, isError: isErrorRaffleConfig } = getRaffleConfig;
  const { collectionFPs, collectionFPMap } = useGetCollectionFP();
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
    const [nftData, setNftData] = useState<{
      mint: string;
      name: string;
      image: string;
      collectionName: string;
      floorPrice: number;
      collectionAddress: string;
    } | null>(null);


  const today = useMemo(() => new Date(), []);

  const handleTimeChange = (hour: string, minute: string, period: "AM" | "PM") => {
    setEndTimeHour(hour);
    setEndTimeMinute(minute);
    setEndTimePeriod(period);
  };

  const creationFee = useMemo(() => {
    if (isLoadingRaffleConfig || isErrorRaffleConfig) return 0;
    return raffleConfig?.creationFeeLamports.toNumber() ?? 0;
  }, [raffleConfig, isLoadingRaffleConfig, isErrorRaffleConfig]);

  const [selectedNftId, setSelectedNftId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
  
    const { userNfts, isLoading: isLoadingNfts } = useFetchUserNfts();
  
    const nfts = useMemo(() => {
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      return (userNfts || []).map((nft: any) => ({
        id: nft.id,
        name: nft.content.metadata.name,
        image: nft.content.links.image,
        floorPrice: collectionFPMap[nft.grouping[0].group_value],
        collectionName: VerifiedNftCollections.find((collection) => collection.address === nft.grouping[0].group_value)?.name || "",
        mint: nft.id,
        collectionAddress: nft.grouping[0].group_value,
      }));
    }, [userNfts, collectionFPMap]);
  
  const filteredNfts = useMemo(() => {
    if (!searchQuery.trim()) return nfts;
    const query = searchQuery.toLowerCase();
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    return nfts.filter((nft: any) => nft.name.toLowerCase().includes(query));
  }, [searchQuery, nfts]);

  const filteredVerifiedCollections = useMemo(() => {
    if (!collectionSearchQuery.trim()) return VerifiedNftCollections;
    const query = collectionSearchQuery.toLowerCase();
    return VerifiedNftCollections.filter((collection) =>
      collection.name.toLowerCase().includes(query)
    );
  }, [collectionSearchQuery]);

  const filteredVerifiedTokens = useMemo(() => {
    if (!tokenSearchQuery.trim()) return VerifiedTokens;
    const query = tokenSearchQuery.toLowerCase();
    return VerifiedTokens.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query)
    );
  }, [tokenSearchQuery]);
  
    const handleSelectNft = (id: string) => {
      setSelectedNftId((prevId) => (prevId === id ? null : id));
    };
  
    const handleAddPrizes = async () => {
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      const selectedNftData = nfts.find((nft: any) => nft.id === selectedNftId);
  
      if (!selectedNftData) return;
      console.log("selectedNftData", selectedNftData);
      const prizeData = {
        mint: selectedNftData.mint,
        name: selectedNftData.name,
        image: selectedNftData.image,
        collectionName: selectedNftData.collectionName,
        floorPrice: selectedNftData.floorPrice ?? 0,
        collectionAddress: selectedNftData.collectionAddress,
      };
  
      setPrizeType("nft");
      setNftData(prizeData);
      setNftPrizeMint(selectedNftData.mint);
      setNftPrizeName(selectedNftData.name);
      setPrizeImage(selectedNftData.image);
      setNftCollection(selectedNftData.collectionAddress);
      setFloor((selectedNftData.floorPrice ?? 0).toString());
      setNumberOfWinners("1");
      handleClose();
    };
  
    const handleClose = () => {
      setSelectedNftId(null);
      setSearchQuery("");
      setIsPrizeModalOpen(false);
    };

    const isDateInvalid = useMemo(() => {
      if (!endDate) return false;
      return endDate < today || endDate > new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    }, [endDate, today]);

    const isInvalidSupply = useMemo(() => {
      if (!supply) return false;
      return parseInt(supply) < 3 || parseInt(supply) > 10000;
    }, [supply]);
  
  return (
    <div>
      <section className="pt-10 pb-[122px]">
        <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10">
          <div>
            <Link
              to={"/"}
              className="bg-gray-1400 mb-10 rounded-[80px] inline-flex h-10 md:h-[49px] justify-center items-center pl-5 pr-3.5 md:px-6 gap-2 md:gap-2.5  md:text-base text-sm font-semibold text-black-1000 font-inter"
            >
              <span>
                <img src="/icons/back-arw.svg" alt="" />
              </span>
              Back
            </Link>
            <div className="flex items-start md:flex-row flex-col gap-[42px] md:gap-5 lg:gap-10">
              <div className="lg:w-2/6 md:w-2/5 w-full">
                <div className="flex items-start gap-10 pb-5">
                  <div className="w-full">
                    {!nftData ? (
                      <div className="relative border border-solid border-gray-1100 h-[361px] lg:h-[450px] bg-gray-1300 rounded-[20px] flex items-center justify-center flex-col">
                        <h4 className="font-inter mb-5 lg:mb-6 font-bold lg:text-2xl text-lg text-black-1000/30">
                          Add an NFT prize
                        </h4>
                        <button
                          onClick={() => setIsPrizeModalOpen(true)}
                          className="text-white cursor-pointer hover:from-primary-color hover:via-primary-color hover:to-primary-color font-semibold text-sm lg:text-base leading-normal font-inter h-10 lg:h-11 rounded-full inline-flex items-center justify-center px-5 lg:px-[26px] transition duration-500 hover:opacity-90 bg-linear-to-r from-neutral-800 via-neutral-500 to-neutral-800 gap-2"
                        >
                          + Add
                        </button>
                      </div>
                    ) : (
                      <div className="relative border border-solid border-gray-1100 h-[361px] lg:h-[450px] bg-gray-1300 rounded-[20px] flex items-center justify-center flex-col overflow-hidden">
                        <button
                          onClick={() => setIsPrizeModalOpen(true)}
                          className="cursor-pointer absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm flex items-center gap-2 px-3 py-1.5 text-xs font-semibold"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>

                        <img
                          src={nftData.image}
                          alt={nftData.name}
                          className="w-full h-full object-cover rounded-[20px]"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-10">
                          <p className="text-white font-inter font-bold text-lg lg:text-xl truncate">
                            {nftData.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={openVerifiedCollectionsModal}
                    className="flex w-full cursor-pointer items-center justify-between border border-solid border-gray-1100 rounded-[20px] h-[60px] px-5"
                  >
                    <p className="text-black-1000 xl:text-lg text-base font-medium font-inter">
                      View all verified collections
                    </p>
                    <span>
                      <img src="icons/right-arw.svg" alt="" />
                    </span>
                    
                  </button>
                  {nftPrizeMint && (
                  <div className="flex items-center justify-end gap-3">
                  {nftPrizeMint && (
                      <p className="text-xs  text-white bg-primary-color text-center font-inter border rounded-md px-2 py-1 my-3">
                        FP: {parseFloat(floor)/10**9}
                      </p>
                    )}
                    {(nftPrizeMint && ttv>0) && (
                      <p className="text-xs  text-black-1000 text-center font-inter border rounded-md px-2 py-1 my-3">
                        TTV: {ttv}
                      </p>
                    )}
                    {(percentage && ttv>0) && (
                      <p className="text-xs  text-black-1000 text-center font-inter border rounded-md px-2 py-1 my-3">
                        {(ttv-(parseFloat(floor)/10**9)>0) ? '+' : ''}
                        {percentage}%
                      </p>
                    )}
                    
                    </div>)}
                  <p className="md:text-2xl text-xl font-bold font-inter text-black-1000/30 pt-[22px] pb-[31px] md:pt-10 md:pb-7 text-center">
                    or
                  </p>
                  <div className={`bg-gray-1300 px-4 md:px-5 py-6 rounded-[20px] mb-5 ${prizeType === "nft" ? "opacity-50 pointer-events-none" : ""}`}>
                    <p className="md:text-xl text-base font-inter font-bold text-primary-color pb-6">
                      Add a token prize
                    </p>
                    <label
                      htmlFor="tokenAmount"
                      className="text-gray-1200 font-medium text-sm font-inter block pb-2.5"
                    >
                      Raffle tokens
                    </label>
                    <TokenPrizeInput />
                    {prizeType === "nft" && (
                      <p className="text-xs text-gray-500 font-inter mt-2">
                        Token prizes are disabled when an NFT prize is selected.
                      </p>
                    )}
                  </div>
                  <div className="w-full flex justify-end gap-2">
                  {userVerifiedTokens?.length != 0 ?(
                  <>
                  
                  {tokenPrizeAmount && (    
                    <p className="text-xs text-black-1000 font-inter border rounded-md px-2 py-1 mb-5">
                      VAL: {val}
                    </p>
                  )}
                  {(ttv && ttv>0 && !nftPrizeMint) ? (
                    <p className="text-xs text-black-1000 font-inter border rounded-md px-2 py-1 mb-5">
                      TTV: {ttv} 
                    </p>
                  ) : (
                    <></>
                  )}
                  {(ttv && tokenPrizeAmount && ttv>0) ? (
                    <p className="text-xs font-inter bg-primary-color text-white border rounded-md px-2 py-1 mb-5">
                       {(ttv-parseFloat(tokenPrizeAmount)>0) ? '+' : ''}
                       {percentage}%
                    </p>
                  ) : (
                    <></>
                  )}
                  </>
                  ) : (
                    <p className="text-xs text-red-500 font-inter px-2 py-1 mb-5 w-full text-left">
                      No verified tokens found in user's wallet.
                    </p>
                  )}
                  </div>
                  <button
                    type="button"
                    onClick={openVerifiedTokensModal}
                    className="flex w-full cursor-pointer items-center justify-between border border-solid border-gray-1100 rounded-[20px] h-[54px] md:h-[60px] px-5"
                  >
                    <p className="text-black-1000 xl:text-lg text-base font-medium font-inter">
                      View all prize tokens
                    </p>
                    <span>
                      <img src="icons/right-arw.svg" alt="" />
                    </span>
                  </button>
                </div>
              </div>
              <div className="lg:w-4/6 md:w-3/5 w-full">
                <div>
                  <div>
                    
                    <div className="w-full my-5 md:my-10">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="">
                          <DateSelector
                            label="Raffle end date"
                            value={endDate}
                            onChange={setEndDate}
                            minDate={today}
                            maxDate={new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)}
                            limit="1h-7d"
                            className={isDateInvalid ? "border-red-500" : ""}
                          />
                          <ol className="flex items-center gap-4 pt-2.5">
                            {(["24hr", "36hr", "48hr"] as const).map(
                              (duration) => (
                                <li key={duration} className="w-full">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      applyDurationPreset(duration)
                                    }
                                    className={`rounded-[7px] cursor-pointer px-2.5 h-10 flex items-center justify-center text-sm font-semibold font-inter text-black-1000 w-full transition-colors ${
                                      selectedDuration === duration
                                        ? "bg-primary-color text-white"
                                        : "bg-gray-1300 hover:bg-gray-1100"
                                    }`}
                                  >
                                    {duration}
                                  </button>
                                </li>
                              )
                            )}
                          </ol>
                        </div>
                        <div className="">
                          <TimeSelector
                            label="End Time"
                            hour={endTimeHour}
                            minute={endTimeMinute}
                            period={endTimePeriod}
                            onTimeChange={handleTimeChange}
                            hasValue={!!endDate}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-5 lg:flex-row flex-col">
                      <div className="w-full">
                        <div className="flex items-center justify-between pb-2.5">
                          <p className="text-gray-1200 font-inter text-sm font-medium">
                            Supply
                          </p>
                          <p className="text-gray-1200 font-inter text-sm font-medium">
                            Min: 3 / Max: 10,000
                          </p>
                        </div>
                        <FormInput
                          type="number"
                          placeholder="Enter Count"
                          id="count"
                          value={supply}
                          onChange={(e) => {
                            setSupply(e.target.value);
                            getComputedTTV();
                            getComputedRent();
                          }}
                          min={3}
                          max={10000}
                          className={isInvalidSupply ? "border border-red-500" : ""}
                        />

                        <p className="text-sm font-medium text-black-1000 pt-2.5 font-inter">
                          Rent: {rent.toFixed(4)} SOL
                        </p>
                      </div>
                      <div className="w-full">
                        <div className="flex items-center justify-between pb-2.5">
                          <p className="text-gray-1200 font-inter text-sm font-medium">
                            Ticket Price
                          </p>
                        </div>
                        <AmountInput />

                        <p className="text-sm font-medium text-black-1000 pt-2.5 font-inter">
                          TTV: {ttv} SOL
                        </p>
                      </div>
                    </div>
                    <AdvancedSettingsAccordion />
                    <div className="flex justify-around">
                    <p className="text-sm font-medium text-black-1000 pb-2.5 font-inter">
                      Creation Fee: {creationFee / 1e9} SOL
                    </p>
                    <p className="text-sm font-medium text-black-1000 pb-2.5 font-inter">
                      Total Fee: {(creationFee / 1e9) + rent} SOL
                    </p>
                    </div>

                    <div>
                      <div className="mb-10 grid xl:grid-cols-2 gap-5 md:gap-4">
                        <AgreeCheckbox
                          checked={agreedToTerms}
                          onChange={setAgreedToTerms}
                        />
                        <button
                          onClick={() => {
                            setIsCreatingRaffle(true);
                            createRaffle.mutate();
                          }}
                          disabled={!agreedToTerms || isCreatingRaffle}
                          className={`text-white cursor-pointer font-semibold hover:from-primary-color hover:to-primary-color hover:via-primary-color text-sm md:text-base leading-normal font-inter h-11 md:h-14 rounded-full inline-flex items-center justify-center w-full transition duration-500 hover:opacity-90 bg-linear-to-r from-neutral-800 via-neutral-500 to-neutral-800 ${
                            !agreedToTerms || isCreatingRaffle
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {isCreatingRaffle ? <Loader className="w-6 h-6 animate-spin" /> : "Create Raffle"}
                        </button>
                      </div>
                      <div className="bg-gray-1300 rounded-[20px] md:p-6 px-4 py-5">
                        <h4 className="text-primary-color font-bold text-base md:text-xl leading-normal mb-6">
                          Terms & Conditions
                        </h4>
                        <ul>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              1.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              When you add prizes to a Raffle, the prizes will
                              be transferred from your wallet into an escrow
                              wallet.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              2.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              You will be charged an up-front rent fee, in SOL,
                              which will be taken in proportion to the number of
                              prizes you choose to add to the Raffle, with a
                              maximum rent fee of 0.72 SOL. The rent fee will be
                              automatically refunded after the Raffle has been
                              closed.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              3.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              FFF and TFF holders will get a 50% fee waiver for
                              staking or sending foxes on missions prior to
                              creating the Raffle and will be hosted on the
                              "Featured" section of the home page.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              4.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              The prizes that do not get sold will be returned
                              to you upon closing the Raffle.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              5.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              You can specify the amount of time a Raffle runs
                              at the creation of the Raffle. Raffles require a
                              minimum 24 hour run time.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              6.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              You can end the Raffle machine early if the
                              expected value is at least -90% based on remaining
                              prizes or if it has been at least 10 hours since
                              the last spin on that Raffle.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              7.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              FFF will take a total of 5% commission fee from
                              the Raffle sales.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              8.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              To enable Holder-only, you will be charged 1 SOL
                              per Raffle creation, withdrawn at the time of
                              creation. More information about holder-only
                              Raffles is available on the create Raffle site.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              9.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              Scheduled Raffles will start at the scheduled
                              date and time even if not all prizes have been
                              added.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              10.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              Raffles CANNOT be edited once it has been
                              launched. Raffles cannot restart once it has been
                              stopped.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              11.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              Once one Raffle has sold, the machine cannot be
                              closed until the specified end date.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              12.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              Raffle, its agents, directors, or officers shall
                              not assume any liability or responsibility for
                              your use of Raffle, promoting or marketing the
                              Raffles.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] w-6">
                              13.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              Raffle currently does not support cNFTs, the
                              program ID is:
                              <strong className="font-medium block">
                                MGUMqztv7MHgoHBYWbvMyL3E3NJ4UHfTwgLJUQAbKGa
                              </strong>
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Collections Modal */}
      <Transition appear show={isVerifiedCollectionsModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeVerifiedCollectionsModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="max-w-[962px] relative w-full transform overflow-hidden pt-5 pb-6 md:pb-[89px] rounded-[20px] bg-white text-left align-middle shadow-xl transition-all">
                  <div className="flex md:gap-0 gap-5 md:items-center md:flex-row flex-col justify-between px-5 pb-5 md:pb-7 mb-7 border-b border-solid border-gray-1100">
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-black-1000 pb-3.5"
                      >
                        Verified Collections
                      </Dialog.Title>
                      <p className="text-sm font-medium font-inter text-black-1000">
                        <Link to="." className=" text-primary-color">
                          Contact us
                        </Link>{" "}
                        to get your NFT verified
                      </p>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="relative md:w-auto w-full">
                        <FormInput
                          className="h-10 pl-[46px] rounded-[80px]"
                          placeholder="Search"
                          value={collectionSearchQuery}
                          onChange={(e) =>
                            setCollectionSearchQuery(e.target.value)
                          }
                        />
                        <span className="absolute top-1/2 left-3 -translate-y-1/2">
                          <img src="icons/search-icon.svg" alt="" />
                        </span>
                      </div>
                      <button
                        type="button"
                        className="inline-flex cursor-pointer justify-center md:static absolute top-[25px] right-4 border border-transparent focus:outline-none focus-visible:ring-0"
                        onClick={closeVerifiedCollectionsModal}
                      >
                        <img src="icons/cross-icon.svg" alt="" />
                      </button>
                    </div>
                  </div>
                  <div className="grid px-5 gap-2.5 grid-cols-1 md:gap-10 max-h-[50vh] overflow-y-auto">
                    <div>
                      <ol className="grid grid-cols-1 gap-2.5 place-items-center">
                        {filteredVerifiedCollections.length === 0 ? (
                          <li className="py-10 text-gray-500 font-medium">
                            No collections found
                          </li>
                        ) : (
                          filteredVerifiedCollections.map((collection) => (
                            <li key={collection.address} className="md:pb-5 pb-2.5">
                              <Link
                                to="."
                                className="rounded-lg text-center w-[200px] justify-center hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                              >
                                {collection.name}
                              </Link>
                            </li>
                          ))
                        )}
                      </ol>
                    </div>
                    
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Verified Tokens Modal */}
      <Transition appear show={isVerifiedTokensModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeVerifiedTokensModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="max-w-[962px] relative w-full transform overflow-hidden pt-5 pb-6 md:pb-[89px] rounded-[20px] bg-white text-left align-middle shadow-xl transition-all">
                  <div className="flex md:gap-0 gap-5 md:items-center md:flex-row flex-col justify-between px-5 pb-5 md:pb-7 mb-7 border-b border-solid border-gray-1100">
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-black-1000 pb-3.5"
                      >
                        Verified Tokens
                      </Dialog.Title>
                      <p className="text-sm font-medium font-inter text-black-1000">
                        These are the tokens available for raffle prizes
                      </p>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="relative md:w-auto w-full">
                        <FormInput
                          className="h-10 pl-[46px] rounded-[80px]"
                          placeholder="Search tokens"
                          value={tokenSearchQuery}
                          onChange={(e) => setTokenSearchQuery(e.target.value)}
                        />
                        <span className="absolute top-1/2 left-3 -translate-y-1/2">
                          <img src="icons/search-icon.svg" alt="" />
                        </span>
                      </div>
                      <button
                        type="button"
                        className="inline-flex cursor-pointer justify-center md:static absolute top-[25px] right-4 border border-transparent focus:outline-none focus-visible:ring-0"
                        onClick={closeVerifiedTokensModal}
                      >
                        <img src="icons/cross-icon.svg" alt="" />
                      </button>
                    </div>
                  </div>
                  <div className="grid px-5 gap-2.5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-h-[50vh] overflow-y-auto">
                    {filteredVerifiedTokens.length === 0 ? (
                      <div className="col-span-full py-10 text-center text-gray-500 font-medium">
                        No tokens found
                      </div>
                    ) : (
                      filteredVerifiedTokens.map((token) => (
                        <div
                          key={token.address}
                          className="flex items-center gap-4 p-4 rounded-xl border border-solid border-gray-1100 hover:bg-gray-1300 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={token.image}
                              alt={token.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/icons/token-placeholder.png";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-black-1000 truncate">
                              {token.symbol}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {token.name}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <CreateTokenModel
        isOpen={isCreateTokenModalOpen}
        onClose={closeCreateTokenModal}
      />

      <Dialog
              open={isPrizeModalOpen}
              as="div"
              className="relative z-50 focus:outline-none"
              onClose={handleClose}
            >
              <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/70">
                <div className="flex min-h-full items-center justify-center p-4">
                  <DialogPanel
                    transition
                    className="w-full max-w-[800px] rounded-2xl bg-white border-2 border-primary-color/40 shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
                  >
                    {/* Header Close Button */}
                    <div className="flex items-center justify-end px-6 pt-6 pb-2">
                      <button
                        onClick={handleClose}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-100 cursor-pointer hover:bg-gray-100 transition duration-300"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M2 2L14 14M2 14L14 2"
                            stroke="#000"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
      
                    {/* Search Input */}
                    <div className="px-6 pb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                                stroke="#000"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search NFT name"
                            className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-primary-color/50 bg-transparent text-black-1000 placeholder:text-black-1000/50 font-medium focus:outline-none focus:border-primary-color transition"
                          />
                        </div>
                      </div>
                    </div>
      
                    {/* Table Header */}
                    <div className="px-11 pb-3">
                      <div className="grid grid-cols-[50px_1fr_150px] gap-4 text-left">
                        <span className="text-sm font-semibold text-gray-400">
                          NFT
                        </span>
                        <span className="text-sm font-semibold text-gray-400">
                          Title
                        </span>
                        <span className="text-sm font-semibold text-gray-400">
                          Floor Price
                        </span>
                      </div>
                    </div>
      
                    {/* List Body */}
                    <div className="px-6 pb-6 min-h-[40vh] max-h-[50vh] overflow-y-auto">
                      {isLoadingNfts ? (
                        <div className="flex items-center justify-center h-40">
                          <p className="text-gray-400 animate-pulse">
                            Loading items...
                          </p>
                        </div>
                      ) : filteredNfts.length === 0 ? (
                        <div className="flex items-center justify-center h-40">
                          <p className="text-xl font-semibold text-gray-400">
                            No NFTs found
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {filteredNfts.map((nft: any) => {
                            const isSelected = selectedNftId === nft.id;
                            return (
                              <div
                                key={nft.id}
                                onClick={() => handleSelectNft(nft.id)}
                                className={clsx(
                                  "relative grid grid-cols-[50px_1fr_150px] gap-4 items-center p-4 rounded-xl cursor-pointer transition duration-200",
                                  isSelected
                                    ? "bg-primary-color/10 border-2 border-primary-color"
                                    : "bg-white border-2 border-gray-50 hover:bg-gray-50"
                                )}
                              >
                                <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src={nft.image}
                                    alt={nft.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "/images/placeholder-nft.png";
                                    }}
                                  />
                                </div>
      
                                <div className="font-medium text-black truncate">
                                  {nft.name}
                                </div>
      
                                <div className="font-semibold text-black">
                                  {nft.floorPrice?.toFixed(2) ?? "0.00"} SOL
                                </div>
      
                                {isSelected && (
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                      <svg
                                        width="14"
                                        height="10"
                                        viewBox="0 0 14 10"
                                        fill="none"
                                      >
                                        <path
                                          d="M1 5L5 9L13 1"
                                          stroke="white"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
      
                    {/* Footer Action */}
                    <div className="px-6 py-5 border-t flex items-center justify-between flex-col border-gray-100">
                      <button
                        onClick={handleAddPrizes}
                        disabled={!selectedNftId}
                        className={clsx(
                          "w-[50%] h-14 rounded-full font-semibold text-lg transition duration-300",
                          selectedNftId
                            ? "bg-primary-color text-white hover:shadow-lg cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                      >
                        Confirm NFT
                      </button>
                    </div>
                  </DialogPanel>
                </div>
              </div>
            </Dialog>
    </div>
  );
}
