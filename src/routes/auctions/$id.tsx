import { createFileRoute, Link } from "@tanstack/react-router";
import { Disclosure } from "@headlessui/react";
import { PrimaryLink } from "../../components/ui/PrimaryLink";
import { useState, useEffect, useMemo } from "react";
import { ParticipantsTable } from "../../components/auctions/ParticipantsTable";
import { TermsConditions } from "../../components/auctions/TermsConditions";
import { useAuctionById } from "hooks/useAuctionsQuery";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToggleFavourite } from "../../../hooks/useToggleFavourite";
import { useQueryFavourites } from "../../../hooks/useQueryFavourites";
import { useBidAuction } from "hooks/useBidAuction";
import { useCancelAuction } from "hooks/useCancelAuction";
import { VerifiedTokens } from "@/utils/verifiedTokens";

export const Route = createFileRoute("/auctions/$id")({
  component: AuctionDetails,
});

const shortenAddress = (addr: string) =>
  addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : "N/A";

function AuctionDetails() {
  const { id } = Route.useParams();
  const { data: auction, isLoading } = useAuctionById(id || "");
  const { publicKey } = useWallet();
  const { favouriteAuction } = useToggleFavourite(publicKey?.toString() || "");
  const { getFavouriteAuction } = useQueryFavourites(
    publicKey?.toString() || ""
  );
  const { bidAuction } = useBidAuction();
  const { cancelAuction } = useCancelAuction();
  const [isBiddingAuction, setIsBiddingAuction] = useState(false);
  const [bidAmountInput, setBidAmountInput] = useState<string>("");

  const isCreator = useMemo(() => {
    return publicKey && auction?.createdBy === publicKey.toString();
  }, [publicKey, auction?.createdBy]);

  const currencyDecimals = useMemo(() => {
    return (
      VerifiedTokens.find((token) => token.symbol === auction?.currency)
        ?.decimals ?? 0
    );
  }, [auction?.currency]);

  const [tabs, setTabs] = useState([
    { name: "Participants", active: true },
    { name: "Terms & Conditions", active: false },
  ]);

  // Status Calculation
  const [computedStatus, setComputedStatus] = useState<
    "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED"
  >("UPCOMING");
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });

  const showBidButton = !isCreator && computedStatus === "LIVE" && publicKey;
  const showCancelButton =
    isCreator &&
    computedStatus !== "COMPLETED" &&
    auction?.status !== "CANCELLED";

  useEffect(() => {
    if (!auction) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(auction.startsAt).getTime();
      const end = new Date(auction.endsAt).getTime();

      if (auction.status === "CANCELLED") setComputedStatus("CANCELLED");
      else if (auction.status === "INITIALIZED") setComputedStatus("UPCOMING");
      else if (
        auction.status === "COMPLETED_SUCCESSFULLY" ||
        auction.status === "COMPLETED_FAILED"
      )
        setComputedStatus("COMPLETED");
      else setComputedStatus("LIVE");

      // Calculate countdown for Live/Upcoming
      const target = now < start ? start : end;
      const distance = target - now;

      if (distance > 0) {
        const h = Math.floor(distance / (1000 * 60 * 60))
          .toString()
          .padStart(2, "0");
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          .toString()
          .padStart(2, "0");
        const s = Math.floor((distance % (1000 * 60)) / 1000)
          .toString()
          .padStart(2, "0");
        setTimeLeft({ h, m, s });
      } else {
        setTimeLeft({ h: "00", m: "00", s: "00" });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const isFavorite = useMemo(
    () => getFavouriteAuction.data?.some((f) => f.id === Number(id)),
    [getFavouriteAuction.data, id]
  );

  // Calculate the minimum allowed bid
  const minBidInSol = useMemo(() => {
    if (!auction) return 0;

    // Convert base values from lamports to SOL
    const reserveInSol =
      Number(auction.reservePrice ?? 0) / Math.pow(10, currencyDecimals);
    const highestBidInSol =
      Number(auction.highestBidAmount ?? 0) / Math.pow(10, currencyDecimals);

    if (!auction.hasAnyBid) {
      return reserveInSol;
    }

    const incrementFactor = 1 + (auction.bidIncrementPercent ?? 0) / 100;
    return highestBidInSol * incrementFactor;
  }, [auction]);

  // Handle Bid Submission
  const handlePlaceBid = async () => {
    const amount = Number(bidAmountInput);

    if (isNaN(amount) || amount < minBidInSol) {
      alert(`Minimum bid is ${minBidInSol.toFixed(4)} ${auction?.currency}`);
      return;
    }

    try {
      setIsBiddingAuction(true);
      await bidAuction.mutateAsync({
        auctionId: Number(id),
        bidAmount: Math.round(amount * Math.pow(10, currencyDecimals)), // Convert SOL to lamports
      });
      setBidAmountInput(""); // Clear input on success
    } catch (error) {
      console.error("Bid failed:", error);
    } finally {
      setIsBiddingAuction(false);
    }
  };

  const handleCancelAuction = async () => {
    try {
      setIsBiddingAuction(true);
      await cancelAuction.mutateAsync({
        auctionId: Number(id),
      });
    } catch (error) {
      console.error("Cancel failed:", error);
    } finally {
      setIsBiddingAuction(false);
    }
  };

  if (isLoading)
    return <div className="py-20 text-center">Loading Auction...</div>;
  if (!auction)
    return (
      <main className="py-20 text-center text-3xl font-bold text-red-500">
        Auction not found!
      </main>
    );

  return (
    <main>
      <div className="w-full py-5 md:py-10 max-w-[1440px] px-5 mx-auto">
        <Link
          to={"/auctions"}
          className="px-6 cursor-pointer transition duration-300 hover:opacity-80 inline-flex items-center gap-2 py-2.5 bg-gray-1400 rounded-full text-base font-semibold text-black-1000"
        >
          <img src="/icons/back-arw.svg" alt="" /> Back
        </Link>
      </div>

      <section className="w-full pb-20">
        <div className="w-full py-5 md:py-10 max-w-[1440px] px-5 mx-auto">
          <div className="w-full flex gap-6 md:gap-10 xl:flex-row flex-col">
            {/* LEFT COLUMN */}
            <div className="flex-1 max-w-full xl:max-w-[450px]">
              <img
                src={auction.prizeImage} // Fixed from prizeName
                className="w-full md:h-[450px] h-[361px] object-cover rounded-[24px] border border-gray-1100"
                alt={auction.prizeName}
              />

              {/* Creator Info */}
              <div className="w-full pb-7 pt-6 md:py-10 hidden md:flex items-center justify-between">
                <div className="flex items-center gap-3 2xl:gap-5">
                  <img
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${auction.createdBy}`}
                    className="w-12 h-12 rounded-full border bg-gray-100"
                    alt="avatar"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-black-1000 font-inter leading-none">
                      {shortenAddress(auction.createdBy)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Creator</p>
                  </div>
                </div>

                <ul className="flex items-center gap-4">
                  {auction.creator?.twitterId && (
                    <li>
                      <a
                        href={`https://x.com/${auction.creator.twitterId}`}
                        target="_blank"
                      >
                        <img
                          src="/icons/twitter-icon.svg"
                          className="w-6 h-6"
                          alt="twitter"
                        />
                      </a>
                    </li>
                  )}
                  <li>
                    <a
                      href={`https://solscan.io/account/${auction.createdBy}`}
                      target="_blank"
                    >
                      <img
                        src="/icons/mcp-server-icon.svg"
                        className="w-6 h-6"
                        alt="solana"
                      />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Traits / Details (Static placeholders as API returns null) */}
              <div className="w-full space-y-5 hidden md:block">
                <Disclosure
                  as="div"
                  className="w-full py-4 px-5 border border-gray-1100 rounded-[20px]"
                >
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex items-center justify-between w-full text-lg font-bold text-black-1000">
                        <span>Details</span>
                        <img
                          src="/icons/back-arw.svg"
                          className={`${open ? "-rotate-90" : "rotate-180"} w-4 transition-transform`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Mint</span>
                          <span className="font-mono">
                            {shortenAddress(auction.prizeMint)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Currency</span>
                          <span>{auction.currency}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Reserve Price</span>
                          <span>
                            {typeof auction.reservePrice === "string" &&
                            auction.reservePrice
                              ? parseInt(auction.reservePrice) /
                                Math.pow(10, currencyDecimals)
                              : "N/A"}{" "}
                            {auction.currency}
                          </span>
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex-1">
              <div className="w-full">
                <h4 className="text-sm text-primary-color font-inter font-medium uppercase tracking-wider">
                  {auction.collectionName} {auction.collectionVerified && "✓"}
                </h4>
                <h1 className="md:text-[32px] text-2xl font-inter md:mt-4 my-4 font-bold text-black-1000">
                  {auction.prizeName}
                </h1>

                <div className="flex items-center justify-between pb-6 border-b border-gray-1100">
                  <ul className="flex items-center gap-3">
                    <li className="px-3 py-1.5 bg-primary-color text-white rounded-lg text-xs font-bold">
                      RESERVE:{" "}
                      {typeof auction.reservePrice === "string" &&
                      auction.reservePrice
                        ? parseInt(auction.reservePrice) /
                          Math.pow(10, currencyDecimals)
                        : "N/A"}{" "}
                      {auction.currency}
                    </li>
                    <li className="px-3 py-1.5 bg-black/80 text-white rounded-lg text-xs font-bold">
                      MIN INCREMENT: {auction.bidIncrementPercent}%
                    </li>
                  </ul>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        favouriteAuction.mutate({ auctionId: Number(id) })
                      }
                      className={`p-2.5 cursor-pointer rounded-full border transition ${isFavorite ? "bg-primary-color border-primary-color" : "border-gray-300"}`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={isFavorite ? "white" : "none"}
                        stroke={isFavorite ? "white" : "black"}
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Auction Status Box */}
                <div className="mt-8 space-y-6">
                  <div className="w-full flex flex-col md:flex-row gap-6 p-6 border border-gray-1100 rounded-[24px] bg-gray-1300">
                    {/* Countdown and Bid Stats (Same as previous step) */}
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-gray-1200 font-medium">
                        {computedStatus === "UPCOMING"
                          ? "Starts In"
                          : computedStatus === "LIVE"
                            ? "Ending In"
                            : "Auction Ended"}
                      </p>
                      {computedStatus !== "CANCELLED" ? (
                        <div className="flex gap-2">
                          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm font-bold text-2xl">
                            {timeLeft.h}
                            <span className="text-xs ml-1 text-gray-400">
                              H
                            </span>
                          </div>
                          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm font-bold text-2xl">
                            {timeLeft.m}
                            <span className="text-xs ml-1 text-gray-400">
                              M
                            </span>
                          </div>
                          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm font-bold text-2xl">
                            {timeLeft.s}
                            <span className="text-xs ml-1 text-gray-400">
                              S
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 font-semibold px-2">
                          Auction Cancelled
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex justify-between md:border-l md:pl-8 border-gray-200">
                      <div>
                        <p className="text-sm text-gray-1200 font-medium">
                          Highest Bid
                        </p>
                        <h3 className="text-2xl font-bold text-primary-color">
                          {auction.highestBidAmount /
                            Math.pow(10, currencyDecimals)}{" "}
                          {auction.currency}
                        </h3>
                        <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
                          {auction.highestBidderWallet
                            ? shortenAddress(auction.highestBidderWallet)
                            : "No bids yet"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-1200 font-medium">
                          Status
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold mt-2 ${
                            computedStatus === "LIVE"
                              ? "bg-green-100 text-green-600 animate-pulse"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {computedStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="w-full grid grid-cols-1 gap-4">
                    {/* 1. Show Bid Button if Live and NOT the creator */}
                    {showBidButton && (
                      <>
                        <div className="space-y-4 p-6 border border-gray-1100 rounded-[24px] bg-white shadow-sm">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-black-1000 font-inter">
                              Enter Bid Amount ({auction.currency})
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.001"
                                value={bidAmountInput}
                                onChange={(e) =>
                                  setBidAmountInput(e.target.value)
                                }
                                placeholder={`Min. ${minBidInSol.toFixed(3)}`}
                                disabled={isBiddingAuction}
                                className="w-full px-5 py-4 bg-gray-1300 border border-gray-1100 rounded-xl outline-none focus:border-primary-color transition font-inter font-semibold"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                                {auction.currency}
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-500">
                              Your bid must be at least {minBidInSol.toFixed(4)}{" "}
                              {auction.currency}
                            </p>
                          </div>
                        </div>
                        <button
                          disabled={isBiddingAuction}
                          className="w-full py-4 cursor-pointer bg-primary-color text-white font-bold rounded-2xl hover:brightness-110 transition shadow-lg shadow-orange-200  disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-gray-400"
                          onClick={handlePlaceBid}
                        >
                          {isBiddingAuction ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing Bid...
                            </div>
                          ) : (
                            <>
                              Place a Bid (Min.{" "}
                              {!auction.hasAnyBid
                                ? typeof auction.reservePrice === "string" &&
                                  auction.reservePrice
                                  ? parseInt(auction.reservePrice) /
                                    Math.pow(10, currencyDecimals)
                                  : "N/A"
                                : (
                                    Number(
                                      auction.highestBidAmount /
                                        Math.pow(10, currencyDecimals)
                                    ) *
                                    (1 +
                                      (auction.bidIncrementPercent ?? 0) / 100)
                                  ).toFixed(3)}{" "}
                              {auction.currency})
                            </>
                          )}
                        </button>
                      </>
                    )}

                    {/* 2. Show Cancel Button ONLY if Creator */}
                    {showCancelButton && (
                      <button
                        disabled={isBiddingAuction}
                        className="w-full py-4 cursor-pointer bg-red-50 text-red-600 border border-red-200 font-bold rounded-2xl hover:bg-red-100 transition"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to cancel this auction?"
                            )
                          ) {
                            handleCancelAuction();
                          }
                        }}
                      >
                        {isBiddingAuction ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Cancelling Auction...
                          </div>
                        ) : (
                          "Cancel Auction"
                        )}
                      </button>
                    )}

                    {/* 3. Connect Wallet State if not logged in */}
                    {!publicKey && (
                      <div className="w-full p-6 text-center border border-dashed border-gray-400 rounded-2xl bg-white">
                        <p className="text-sm text-gray-600 mb-4">
                          You must be connected to interact with this auction.
                        </p>
                        <PrimaryLink link="" text="Select Wallet" />
                      </div>
                    )}
                  </div>

                  {/* Winner Display (Remains same as previous step) */}
                  {computedStatus === "COMPLETED" &&
                    auction.highestBidderWallet && (
                      <div className="w-full flex items-center justify-between p-5 rounded-2xl bg-primary-color text-white shadow-md">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <img
                              src="/icons/crown_svg.svg"
                              alt="winner"
                              className="w-8 h-8"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-80">
                              Auction Winner
                            </p>
                            <p className="font-bold text-lg">
                              {shortenAddress(auction.highestBidderWallet)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase opacity-80">
                            Sold For
                          </p>
                          <p className="text-xl font-black">
                            {auction.highestBidAmount /
                              Math.pow(10, currencyDecimals)}{" "}
                            {auction.currency}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Tabs Section */}
                  <div className="mt-10">
                    <div className="flex gap-4 overflow-x-auto pb-6">
                      {tabs.map((tab, i) => (
                        <button
                          key={tab.name}
                          onClick={() =>
                            setTabs(
                              tabs.map((t, idx) => ({
                                ...t,
                                active: i === idx,
                              }))
                            )
                          }
                          className={`px-6 py-2.5 cursor-pointer rounded-full text-sm font-bold transition ${tab.active ? "bg-primary-color text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4">
                      {tabs[0].active && (
                        <ParticipantsTable
                          bids={auction.bids || []}
                          currency={auction.currency}
                        />
                      )}
                      {tabs[1].active && <TermsConditions />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
