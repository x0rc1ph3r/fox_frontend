import { Link } from "@tanstack/react-router";
import React, { useMemo } from "react";
import type { GumballBackendDataType } from "../../../types/backend/gumballTypes";
import { DynamicCounter } from "../common/DynamicCounter";
import { VerifiedTokens } from "@/utils/verifiedTokens";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToggleFavourite } from "../../../hooks/useToggleFavourite";
import { useQueryFavourites } from "../../../hooks/useQueryFavourites";

export interface GumballsCardCreatedProps {
  gumball: GumballBackendDataType;
  isFavorite?: boolean;
  className?: string;
}

export const GumballsCardCreated: React.FC<GumballsCardCreatedProps> = ({
  gumball,
  isFavorite = false,
  className,
}) => {
  const { publicKey } = useWallet();
  const { favouriteGumball } = useToggleFavourite(publicKey?.toString() || "");
  const { getFavouriteGumball } = useQueryFavourites(publicKey?.toString() || "");

  const {
    id,
    name = "Untitled Gumball",
    creatorAddress = "",
    endTime = new Date().toISOString(),
    totalTickets = 0,
    ticketsSold = 0,
    ticketPrice = "0",
    totalPrizeValue = "0",
    prizes = [],
    ticketMint,
    status,
  } = gumball || {};

  const favorite = useMemo(() => {
    if (!getFavouriteGumball.data || getFavouriteGumball.data.length === 0) return false;
    return getFavouriteGumball.data?.some((favourite) => favourite.id === id);
  }, [getFavouriteGumball.data, id]);

  const toggleFavorite = async () => {
    favouriteGumball.mutate({
      gumballId: id || 0,
    });
  };

  const remainingTickets = (totalTickets || 0) - (ticketsSold || 0);

  const mainImage = useMemo(() => {
    const prizeWithImage = prizes?.find((prize) => prize.image);
    return prizeWithImage?.image || "/images/gumballs/sol-img-frame.png";
  }, [prizes]);

  const evValue = useMemo(() => {
    const prizeVal = parseFloat(totalPrizeValue) || 0;
    const ticketPriceNum = parseFloat(ticketPrice) || 0;
    const maxProceeds = totalTickets * ticketPriceNum;
    if (maxProceeds === 0) return "0.00";
    return (prizeVal / maxProceeds).toFixed(2);
  }, [totalPrizeValue, totalTickets, ticketPrice]);

  const val = useMemo(() => {
    return parseFloat(totalPrizeValue) || 0;
  }, [totalPrizeValue]);

  const displayAddress = useMemo(() => {
    if (!creatorAddress) return "Unknown";
    return `${creatorAddress.slice(0, 4)}...${creatorAddress.slice(-4)}`;
  }, [creatorAddress]);

  const pricePerTicket = useMemo(() => {
    return parseFloat(ticketPrice) || 0;
  }, [ticketPrice]);

  const tokenDecimals = VerifiedTokens.find((token) => token.address === ticketMint)?.decimals || 0;
  const tokenSymbol = VerifiedTokens.find((token) => token.address === ticketMint)?.symbol || "SOL";

  return (
    <div className={`bg-white-1000 border border-gray-1100 rounded-2xl ${className || ''}`}>
      <div className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <img
            src="/images/placeholder-user.png"
            alt={displayAddress}
            className="w-10 h-10 rounded-full object-cover"
          />
          <h4 className="text-base font-semibold font-inter text-black-1000">
            {displayAddress}
          </h4>
        </div>
        <div className="relative inline-flex items-center justify-center">
          <img src="/images/home/polygon-shape.svg" alt="shape" />
          <p className="text-xs font-semibold font-inter text-white-1000 absolute z-10">
            T5
          </p>
        </div>
      </div>

      <div className="w-full flex items-center justify-center relative group">
        <img
          src={mainImage}
          alt={name}
          className="max-w-[250px] w-full border-y border-gray-1100 object-cover h-[250px]"
        />

        <div className="w-full h-full flex flex-col items-start justify-between p-4 absolute top-0 left-0">
          <div className="w-full h-full transition duration-300 group-hover:visible group-hover:opacity-100 invisible opacity-0 absolute left-0 p-4 top-0 flex flex-col items-start justify-between">
            <button
              onClick={toggleFavorite}
              className="bg-black/60 ml-auto cursor-pointer rounded-lg inline-flex items-center justify-center p-2.5"
            >
              {!favorite ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill="#F08409"
                  viewBox="0 0 256 256"
                >
                  <path d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill="#F08409"
                  viewBox="0 0 256 256"
                >
                  <path d="M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z" />
                </svg>
              )}
            </button>

            <Link
              to="/gumballs/create_gumballs/$id"
              params={{ id: id.toString() }}
              className="w-full transition duration-300 hover:opacity-90 flex items-center justify-center py-1.5 px-6 h-11 text-white font-semibold font-inter bg-primary-color rounded-full"
            >
              Gumball Studio
            </Link>
          </div>

          <div className="w-full h-full flex transition duration-300 group-hover:invisible group-hover:opacity-0 visible opacity-100 flex-col items-start justify-between">
            <DynamicCounter endsAt={new Date(endTime)} />

            <div className="w-full flex items-center gap-1.5">
              <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-black/60">
                <p className="text-xs font-semibold font-inter uppercase text-white">
                  EV : <span>{evValue}</span>
                </p>
              </div>

              <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-black/60">
                <p className="text-xs font-semibold font-inter uppercase text-white">
                  VAL : <span>{val / 10 ** tokenDecimals}</span>
                </p>
              </div>

              {status && (
                <div className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg ${
                  status === "ACTIVE" ? "bg-green-600" : 
                  status === "ENDED" ? "bg-red-600" : 
                  status === "CANCELLED" ? "bg-gray-600" : "bg-yellow-600"
                }`}>
                  <p className="text-xs font-semibold font-inter uppercase text-white">
                    {status}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col px-4 py-4 gap-5">
        <div className="w-full flex items-center gap-5 justify-between">
          <h3 className="md:text-2xl text-lg text-black-1000 font-bold font-inter">
            {name}
          </h3>
        </div>

        <div className="w-full flex flex-col items-center justify-between gap-1.5">
          <div className="w-full flex items-center justify-between gap-5">
            {totalTickets !== ticketsSold ? (
              <h4 className="md:text-base text-sm text-black-1000 font-inter font-semibold">
                {remainingTickets}/{totalTickets}
              </h4>
            ) : (
              <h4 className="text-base text-red-1000 font-semibold font-inter">
                SOLD OUT
              </h4>
            )}
            <h4 className="md:text-base text-sm text-black-1000 text-right font-inter font-semibold">
              <span>{pricePerTicket / 10 ** tokenDecimals}</span> {tokenSymbol}
            </h4>
          </div>
          <div className="w-full flex items-center justify-between gap-5">
            <h4 className="text-sm text-gray-1200 font-inter">
              Tickets remaining
            </h4>
            <h4 className="text-sm text-gray-1200 text-right font-inter">
              Price per spin
            </h4>
          </div>
        </div>

        <div className="w-full flex items-center justify-between gap-3 text-sm text-gray-1200 font-inter">
          <span>Sold: {ticketsSold}</span>
          <span>Prizes: {prizes.length}</span>
        </div>
      </div>
    </div>
  );
};

