/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect, Fragment, useMemo, use } from "react";
import { ticketTokens } from "@/utils/ticketTokens";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { AgreeCheckbox } from "@/components/common/AgreeCheckbox";
import TimeSelector from "@/components/ui/TimeSelector";
import FormInput from "@/components/ui/FormInput";
import DateSelector from "@/components/ui/DateSelector";
import { useCreateRaffleStore } from "store/createRaffleStore";
export const Route = createFileRoute("/auctions/create_auctions")({
  component: CreateAuctions,
});
import { useCreateAuction } from "../../../hooks/useCreateAuction";
import { Loader } from "lucide-react";
import { useGumballStore } from "store/useGumballStore";
import clsx from "clsx";
import { useFetchUserNfts } from "hooks/useFetchUserNfts";
import { useGetCollectionFP } from "hooks/useGetCollectionFP";

function CreateAuctions() {
  const { createAuction } = useCreateAuction();
  const {
    openVerifiedCollectionsModal,
    agreedToTerms,
    setAgreedToTerms,
    isVerifiedCollectionsModalOpen,
    closeVerifiedCollectionsModal,
    collectionSearchQuery,
    setCollectionSearchQuery,
    endDate,
    setEndDate,
    endTimeHour,
    endTimeMinute,
    endTimePeriod,
    selectedDuration,
    setEndTimeHour,
    setEndTimeMinute,
    setEndTimePeriod,
    applyDurationPreset,
    getEndTimestamp,
  } = useCreateRaffleStore();

  const {
    startDate,
    startTimeHour,
    startTimeMinute,
    startTimePeriod,
    startType,
    setStartDate,
    setStartType,
    setStartTimeHour,
    setStartTimeMinute,
    setStartTimePeriod,
    getStartTimestamp,
  } = useGumballStore();

  const { collectionFPs, collectionFPMap } = useGetCollectionFP();

  const [isCreatingAuction, setIsCreatingAuction] = useState(false);
  const [solBalance, setSolBalance] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const [basePrice, setBasePrice] = useState("");
  const [symbol, setSymbol] = useState("SOL");
  const [baseMint, setBaseMint] = useState("");
  const [bidIncrement, setBidIncrement] = useState("");
  const [timeExtension, setTimeExtension] = useState("");
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [nftData, setNftData] = useState<{
    mint: string;
    name: string;
    image: string;
    collectionName: string;
    floorPrice: number;
  } | null>(null);

  const handleSelect = (address: string, symbol: string) => {
    setSymbol(symbol);
    setBaseMint(address);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { name: "Start Immediately", type: "manual" as const },
    { name: "Schedule Start", type: "schedule" as const },
  ];

  const today = useMemo(() => new Date(), []);

  const handleTimeChange = (
    hour: string,
    minute: string,
    period: "AM" | "PM"
  ) => {
    setEndTimeHour(hour);
    setEndTimeMinute(minute);
    setEndTimePeriod(period);
  };

  const handleAuctionCreate = async () => {
    try {
      setIsCreatingAuction(true);

      await createAuction.mutateAsync({
        startImmediately: startType === "manual" ? true : false,
        startTime: getStartTimestamp()!,
        endTime: getEndTimestamp()!,
        baseBid: parseFloat(basePrice),
        bidMint: baseMint,
        isBidMintSol: symbol === "SOL" ? true : false,
        currency: symbol,
        minIncrement: parseInt(bidIncrement),
        prizeMint: nftData?.mint || "",
        timeExtension: parseInt(timeExtension),
        prizeName: nftData?.name || "",
        prizeImage: nftData?.image || "",
        collectionName: nftData?.collectionName || "",
        floorPrice: nftData?.floorPrice ?? 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingAuction(false);
    }
  };

  const [selectedNftId, setSelectedNftId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { userNfts, isLoading: isLoadingNfts } = useFetchUserNfts();

  // Mapping raw NFT data to a clean format
  const nfts = useMemo(() => {
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    return (userNfts || []).map((nft: any) => ({
      id: nft.id,
      name: nft.content.metadata.name,
      image: nft.content.links.image,
      floorPrice: collectionFPMap[nft.grouping[0].group_value],
      mint: nft.id,
    }));
  }, [userNfts, collectionFPMap]);

  // Filtered list based on search input
  const filteredNfts = useMemo(() => {
    if (!searchQuery.trim()) return nfts;
    const query = searchQuery.toLowerCase();
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    return nfts.filter((nft: any) => nft.name.toLowerCase().includes(query));
  }, [searchQuery, nfts]);

  // Toggle selection: if clicking the same one, deselect it
  const handleSelectNft = (id: string) => {
    setSelectedNftId((prevId) => (prevId === id ? null : id));
  };

  const handleAddPrizes = async () => {
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    const selectedNftData = nfts.find((nft: any) => nft.id === selectedNftId);

    if (!selectedNftData) return;

    // Constructed as a single object (or wrap in array if your API requires it)
    const prizeData = {
      mint: selectedNftData.mint,
      name: selectedNftData.name,
      image: selectedNftData.image,
      collectionName: collectionFPs[0]?.name || "",
      floorPrice: selectedNftData.floorPrice ?? 0,
    };

    console.log("prizeData", prizeData);

    setNftData(prizeData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedNftId(null);
    setSearchQuery("");
    setIsPrizeModalOpen(false);
  };

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
                </div>
              </div>
              <div className="lg:w-4/6 md:w-3/5 w-full">
                <div>
                  <div>
                    {/* <p className="text-primary-color text-base font-medium font-inter">
                      Please link your twitter and discord in your profile or
                      your raffles won't be shown.
                    </p> */}
                    <div className="w-full my-5 md:my-10">
                      <p className="md:text-base text-sm text-black-1000 font-inter font-medium pb-5">
                        When would you like the sale to start?
                      </p>
                      <ul className="grid grid-cols-2 md:gap-5 mb-5 gap-3">
                        {tabs.map((tab, index) => (
                          <li key={index}>
                            <button
                              type="button"
                              onClick={() => setStartType(tab.type)}
                              disabled={isCreatingAuction}
                              className={`border cursor-pointer border-solid w-full border-gray-1100 flex items-center justify-center rounded-lg px-5 h-12 md:text-base text-sm font-medium text-black-1000 font-inter ${
                                startType === tab.type
                                  ? "border-primary-color bg-primary-color/5"
                                  : "bg-white"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {tab.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                      {startType === "schedule" && (
                        <div className="pb-10 grid grid-cols-2 md:gap-5 gap-3">
                          <div className="">
                            <DateSelector
                              label="Start Date"
                              value={startDate}
                              onChange={setStartDate}
                              minDate={new Date()}
                              disabled={isCreatingAuction}
                            />
                          </div>
                          <div className="">
                            <TimeSelector
                              label="Start Time"
                              hour={startTimeHour}
                              minute={startTimeMinute}
                              period={startTimePeriod}
                              onTimeChange={(hour, minute, period) => {
                                setStartTimeHour(hour);
                                setStartTimeMinute(minute);
                                setStartTimePeriod(period);
                              }}
                              disabled={isCreatingAuction}
                            />
                          </div>
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="">
                          <DateSelector
                            label="Auction end date"
                            value={endDate}
                            onChange={setEndDate}
                            minDate={today}
                          />
                          {startType === "manual" && (
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
                          )}
                        </div>
                        <div className="">
                          <TimeSelector
                            label="End Time"
                            hour={endTimeHour}
                            minute={endTimeMinute}
                            period={endTimePeriod}
                            onTimeChange={handleTimeChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-5 lg:flex-row flex-col">
                      <div className="w-full">
                        <div className="flex items-center justify-between pb-2.5">
                          <p className="text-gray-1200 font-inter text-sm font-medium">
                            Reserve Price
                          </p>
                        </div>
                        <div className="relative">
                          <input
                            id="amount"
                            type="number"
                            value={basePrice}
                            onChange={(e) => {
                              setBasePrice(e.target.value);
                            }}
                            className="text-black-1000 focus:outline-0 bg-white focus:border-primary-color placeholder:text-gray-1200 text-base w-full font-inter px-5 h-12 border border-solid border-gray-1100 rounded-lg font-medium"
                            autoComplete="off"
                            placeholder="Enter Amount"
                          />
                          <div
                            ref={dropdownRef}
                            className="absolute z-20 top-1/2 right-5 -translate-y-1/2 bg-white border-l border-solid border-gray-1100"
                          >
                            <button
                              type="button"
                              className="flex items-center gap-1.5 px-3 cursor-pointer font-inter text-base font-medium text-black-1000 py-1"
                              onClick={toggleDropdown}
                            >
                              <p>{symbol}</p>
                              <span>
                                <img
                                  src="/icons/down-arw.svg"
                                  alt="toggle"
                                  className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                />
                              </span>
                            </button>

                            {isOpen && (
                              <ol className="absolute top-full right-0 w-full bg-white border border-gray-1100 rounded-md mt-3 z-10">
                                {ticketTokens.map((token) => (
                                  <li key={token.symbol}>
                                    <button
                                      type="button"
                                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                      onClick={() =>
                                        handleSelect(
                                          token.address,
                                          token.symbol
                                        )
                                      }
                                    >
                                      {token.symbol}
                                    </button>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-full">
                        <div className="flex items-center justify-between pb-2.5">
                          <p className="text-gray-1200 font-inter text-sm font-medium">
                            Bid Increment
                          </p>
                        </div>
                        <div className="relative">
                          <input
                            id="amount"
                            type="number"
                            value={bidIncrement}
                            onChange={(e) => {
                              setBidIncrement(e.target.value);
                            }}
                            className="text-black-1000 focus:outline-0 bg-white focus:border-primary-color placeholder:text-gray-1200 text-base w-full font-inter px-5 h-12 border border-solid border-gray-1100 rounded-lg font-medium"
                            autoComplete="off"
                            placeholder=""
                          />
                          <div className="absolute z-20 top-1/2 right-5 -translate-y-1/2 bg-white border-l border-solid border-gray-1100">
                            <div className="flex items-center gap-1.5 px-3 cursor-pointer font-inter text-base font-medium text-black-1000 py-1">
                              <p>{"%"}</p>
                            </div>
                          </div>
                        </div>
                        <ol className="flex items-center gap-4 pt-2.5 pb-10">
                          {(["5", "10", "20"] as const).map((duration) => (
                            <li key={duration} className="w-full">
                              <button
                                type="button"
                                onClick={() => setBidIncrement(duration)}
                                className={`rounded-[7px] cursor-pointer px-2.5 h-10 flex items-center justify-center text-sm font-semibold font-inter text-black-1000 w-full transition-colors ${
                                  bidIncrement === duration
                                    ? "bg-primary-color text-white"
                                    : "bg-gray-1300 hover:bg-gray-1100"
                                }`}
                              >
                                {duration}%
                              </button>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="w-full">
                        <div className="flex items-center justify-between pb-2.5">
                          <p className="text-gray-1200 font-inter text-sm font-medium">
                            Time extension period
                          </p>
                        </div>
                        <div className="relative">
                          <input
                            id="amount"
                            type="number"
                            value={timeExtension}
                            onChange={(e) => {
                              setTimeExtension(e.target.value);
                            }}
                            className="text-black-1000 focus:outline-0 bg-white focus:border-primary-color placeholder:text-gray-1200 text-base w-full font-inter px-5 h-12 border border-solid border-gray-1100 rounded-lg font-medium"
                            autoComplete="off"
                            placeholder=""
                          />
                          <div className="absolute z-20 top-1/2 right-5 -translate-y-1/2 bg-white border-l border-solid border-gray-1100">
                            <div className="flex items-center gap-1.5 px-3 cursor-pointer font-inter text-base font-medium text-black-1000 py-1">
                              <p>{"mins"}</p>
                            </div>
                          </div>
                        </div>
                        <ol className="flex items-center gap-4 pt-2.5 pb-10">
                          {(["5", "10", "15"] as const).map((duration) => (
                            <li key={duration} className="w-full">
                              <button
                                type="button"
                                onClick={() => setTimeExtension(duration)}
                                className={`rounded-[7px] cursor-pointer px-2.5 h-10 flex items-center justify-center text-sm font-semibold font-inter text-black-1000 w-full transition-colors ${
                                  timeExtension === duration
                                    ? "bg-primary-color text-white"
                                    : "bg-gray-1300 hover:bg-gray-1100"
                                }`}
                              >
                                {duration}
                              </button>
                            </li>
                          ))}
                        </ol>
                        <p className="text-sm font-medium text-black-1000 py-2.5 font-inter">
                          Your balance: {solBalance} SOL
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-10 grid xl:grid-cols-2 gap-5 md:gap-4">
                        <AgreeCheckbox
                          checked={agreedToTerms}
                          onChange={setAgreedToTerms}
                        />
                        <button
                          onClick={handleAuctionCreate}
                          disabled={!agreedToTerms || isCreatingAuction}
                          className={`text-white cursor-pointer font-semibold hover:from-primary-color hover:to-primary-color hover:via-primary-color text-sm md:text-base leading-normal font-inter h-11 md:h-14 rounded-full inline-flex items-center justify-center w-full transition duration-500 hover:opacity-90 bg-linear-to-r from-neutral-800 via-neutral-500 to-neutral-800 ${
                            !agreedToTerms || isCreatingAuction
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {isCreatingAuction ? (
                            <Loader className="w-6 h-6 animate-spin" />
                          ) : (
                            "Create Auction"
                          )}
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
                              When you add prizes to a Gumball, the prizes will
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
                              prizes you choose to add to the Gumball, with a
                              maximum rent fee of 0.72 SOL. The rent fee will be
                              automatically refunded after the Gumball has been
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
                              creating the Gumball and will be hosted on the
                              "Featured" section of the home page.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              4.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              The prizes that do not get sold will be returned
                              to you upon closing the Gumball.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              5.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              You can specify the amount of time a Gumball runs
                              at the creation of the Gumball. Gumballs require a
                              minimum 24 hour run time.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              6.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              You can end the Gumball machine early if the
                              expected value is at least -90% based on remaining
                              prizes or if it has been at least 10 hours since
                              the last spin on that Gumball.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              7.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              FFF will take a total of 5% commission fee from
                              the Gumball sales.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              8.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              To enable Holder-only, you will be charged 1 SOL
                              per Gumball creation, withdrawn at the time of
                              creation. More information about holder-only
                              Gumballs is available on the create Gumball site.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              9.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              Scheduled Gumballs will start at the scheduled
                              date and time even if not all prizes have been
                              added.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              10.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              Gumballs CANNOT be edited once it has been
                              launched. Gumballs cannot restart once it has been
                              stopped.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              11.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              Once one Gumball has sold, the machine cannot be
                              closed until the specified end date.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%]  w-6">
                              12.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              Gumball, its agents, directors, or officers shall
                              not assume any liability or responsibility for
                              your use of Gumball, promoting or marketing the
                              Gumballs.
                            </p>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="flex items-start justify-end text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] w-6">
                              13.
                            </span>
                            <p className="flex-1 w-full text-black-1000 font-medium font-inter text-sm md:text-base leading-[160%] break-all">
                              Gumball currently does not support cNFTs, the
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
                  <div className="grid md:grid-cols-2 px-5 gap-2.5 md:gap-10">
                    <div>
                      <ol>
                        <li className="md:pb-5 pb-2.5">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            Famous Fox Federation
                          </Link>
                        </li>
                        <li className="md:pb-5 pb-2.5">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            Famous Fox Dens
                          </Link>
                        </li>
                        <li className="md:pb-5 pb-2.5">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            0rphans
                          </Link>
                        </li>
                        <li className="md:pb-5 pb-2.5">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            AGE of SAM
                          </Link>
                        </li>
                        <li className="md:pb-5 pb-2.5">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            Aiternate - Entities
                          </Link>
                        </li>
                        <li className="md:block hidden">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            Alpha Pharaohs
                          </Link>
                        </li>
                      </ol>
                    </div>
                    <div className="md:block hidden">
                      <ol>
                        <li className="md:pb-5 pb-2.5">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            Transdimensional Fox Federation
                          </Link>
                        </li>
                        <li className="md:pb-5 pb-2.5">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            Famous Fox Friends & Foes
                          </Link>
                        </li>
                        <li className="md:pb-5 pb-2.5">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            ABC
                          </Link>
                        </li>
                        <li className="md:pb-5 pb-2.5">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            AGE of SAM PFP
                          </Link>
                        </li>
                        <li className="md:pb-5 pb-2.5">
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            Aiternate - Holotabs
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="."
                            className="rounded-lg hover:bg-gray-1300 h-10 md:h-12 px-3.5 md:px-5 flex items-center text-sm md:text-base font-medium font-inter text-black-1000 border border-solid border-gray-1100"
                          >
                            Alpha Wolves
                          </Link>
                        </li>
                      </ol>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

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
