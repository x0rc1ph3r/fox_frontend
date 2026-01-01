import { Link } from "@tanstack/react-router";
import React, { useMemo, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToggleFavourite } from "../../../hooks/useToggleFavourite";
import { useQueryFavourites } from "../../../hooks/useQueryFavourites";
import { VerifiedTokens } from "../../utils/verifiedTokens";

// Strictly matching the provided API object structure
export interface AuctionsCardProps {
  id: number;
  prizeName: string;
  prizeImage: string;
  collectionName: string;
  collectionVerified: boolean;
  createdBy: string;
  startsAt: Date;
  endsAt: Date;
  reservePrice: string;
  currency: string;
  className?: string;
  highestBidAmount: number;
  highestBidderWallet: string;
  status: string;
}

export const AuctionsCard: React.FC<AuctionsCardProps> = (props) => {
  const {
    id,
    prizeName,
    prizeImage,
    collectionName,
    collectionVerified,
    createdBy,
    // startsAt,
    // endsAt,
    reservePrice,
    currency,
    className,
    highestBidAmount,
    highestBidderWallet,
    status,
  } = props;

  const { publicKey } = useWallet();
  const { favouriteAuction } = useToggleFavourite(publicKey?.toString() || "");
  const { getFavouriteAuction } = useQueryFavourites(
    publicKey?.toString() || ""
  );

  // Calculate status based on system time
  const [computedStatus, setComputedStatus] = useState<
    "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED"
  >("UPCOMING");

  const currencyDecimals = useMemo(() => {
    return (
      VerifiedTokens.find((token) => token.symbol === currency)?.decimals ?? 0
    );
  }, [currency]);

  useEffect(() => {
    const calculateStatus = () => {
      if (status === "CANCELLED") setComputedStatus("CANCELLED");
      else if (status === "INITIALIZED") setComputedStatus("UPCOMING");
      else if (
        status === "COMPLETED_SUCCESSFULLY" ||
        status === "COMPLETED_FAILED"
      )
        setComputedStatus("COMPLETED");
      else setComputedStatus("LIVE");
    };

    calculateStatus();
    const interval = setInterval(calculateStatus, 1000); // Update every second for accuracy
    return () => clearInterval(interval);
  }, [status]);

  const favorite = useMemo(() => {
    if (!getFavouriteAuction.data) return false;
    return getFavouriteAuction.data.some((f) => f.id === id);
  }, [getFavouriteAuction.data, id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    favouriteAuction.mutate({ auctionId: id });
  };

  const shorten = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <div
      className={`bg-white-1000 border border-gray-1100 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
            <img
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${createdBy}`}
              alt="creator"
              className="w-full h-full"
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-black-1000 truncate max-w-[120px]">
              {collectionName}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium">
              By {shorten(createdBy)}
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <span
            className={`w-2 h-2 rounded-full ${
              computedStatus === "LIVE"
                ? "bg-green-500 animate-pulse"
                : computedStatus === "UPCOMING"
                  ? "bg-blue-500"
                  : "bg-red-500"
            }`}
          />
          <p className="text-[10px] font-bold text-black-1000 uppercase">
            {computedStatus}
          </p>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-full relative group">
        <img
          src={prizeImage}
          alt={prizeName}
          className="w-full border-y border-gray-1100 object-cover h-[339px]"
        />

        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          {/* Favorite Button (Visible on Hover) */}
          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={toggleFavorite}
              className="bg-black/60 cursor-pointer backdrop-blur-sm p-2.5 rounded-lg hover:scale-110 transition-transform"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 256 256"
                fill={favorite ? "#F08409" : "none"}
                stroke={favorite ? "#F08409" : "white"}
                strokeWidth="20"
              >
                <path d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40Z" />
              </svg>
            </button>
          </div>

          {/* View Link (Visible on Hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <Link
              to="/auctions/$id"
              params={{ id: id.toString() }}
              className="w-full flex items-center justify-center py-3 bg-primary-color text-white font-bold rounded-xl shadow-lg hover:brightness-110"
            >
              View Details
            </Link>
          </div>

          {/* Overlay Info (Hidden on Hover) */}
          <div className="group-hover:opacity-0 transition-opacity flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg">
                <p className="text-[10px] text-white/70 uppercase">Reserve</p>
                <p className="text-xs font-bold text-white">
                  {currencyDecimals > 0
                    ? parseInt(reservePrice) / Math.pow(10, currencyDecimals)
                    : parseInt(reservePrice)}{" "}
                  {currency}
                </p>
              </div>
              {/* <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg">
                  <p className="text-[10px] text-white/70 uppercase">Highest Bid</p>
                  <p className="text-xs font-bold text-white">⍜ {highestBidAmount / LAMPORTS_PER_SOL}</p>
               </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-black-1000 truncate leading-tight">
            {prizeName}
          </h3>
          {collectionVerified && (
            <img
              src="/icons/verified-icon.svg"
              alt="v"
              className="w-5 h-5 flex-shrink-0"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold">
              {computedStatus === "COMPLETED" ? "Winner" : "Leading Bidder"}
            </p>
            <p
              className={`text-sm font-semibold truncate ${computedStatus === "COMPLETED" ? "text-green-600" : "text-black-1000"}`}
            >
              {highestBidderWallet ? shorten(highestBidderWallet) : "No Bids"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold">
              Winning Bid
            </p>
            <p className="text-sm font-bold text-green-600">
              {currencyDecimals > 0
                ? highestBidAmount / Math.pow(10, currencyDecimals)
                : highestBidAmount}{" "}
              {currency}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
