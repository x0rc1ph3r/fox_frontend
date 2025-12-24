// import { Link } from "@tanstack/react-router";
// import React, { useState } from "react";

// export interface CryptoCardProps {
//   id: number;
//   userName: string;
//   userAvatar: string;
//   tokenSymbol: string;
// ProfileLink?: string;
// isFavorite?: boolean;
//   MainImage: string;
//   countdown: { hours: number; minutes: number; seconds: number };
//   val: number;
//   coins: number;
//   ttv: number;
//   growthPercent: number;
//   verified?: boolean;
//   totalTickets: number;
//   soldTickets: number;
//   pricePerTicket: number;
//   className?: string;
//   Url?: string;
// }

// export const CryptoCard: React.FC<CryptoCardProps> = ({
//   id,
//   userName,
//   userAvatar,
//   isFavorite = false,
//   tokenSymbol,
//   MainImage,
//   countdown,
//   val,
//   coins,
//   ttv,
//   growthPercent,
//   verified = false,
//   totalTickets,
//   soldTickets,
//   pricePerTicket,
//   className,
//   Url = "#",
// }) => {
//   const remainingTickets = totalTickets - soldTickets;
//      const [favorite, setFavorite] = useState(isFavorite);
//     const toggleFavorite = () => {
//     setFavorite(!favorite);
//   };

//   return (
//       <div className={`bg-white-1000 border border-gray-1100 rounded-2xl ${className}`}>
//           {/* Head */}
//         <div className="w-full flex items-center justify-between p-4">
//           <div className="flex items-center gap-4">
//             <img
//               src={userAvatar}
//               alt={userName}
//               className="w-10 h-10 rounded-full object-cover"
//             />
//             <h4 className="md:text-base text-sm font-semibold font-inter text-black-1000">
//               {userName}
//             </h4>
//           </div>
//           <div className="relative inline-flex items-center justify-center">
//             <img src="/images/home/polygon-shape.svg" alt={'shape'} />
//             <p className="md:text-xs text-[10px] font-semibold font-inter text-white-1000 absolute z-10">
//               T5
//             </p>
//           </div>
//         </div>
        
//         <div className="w-full relative group">
//           <img
//             src={MainImage}
//             alt="featured-card"
//             className="w-full border-y border-gray-1100 object-cover md:h-[339px] h-[306px]"
//           />

//           <div className="w-full h-full flex flex-col items-start justify-between py-4 px-3.5 md:px-1 xl:p-4 absolute top-0 left-0">
//             <div className="w-full h-full transition duration-300 group-hover:visible group-hover:opacity-100 invisible opacity-0 absolute left-0 p-4 top-0 flex flex-col items-start justify-between">
//               <button onClick={toggleFavorite} className="bg-black/60 ml-auto cursor-pointer rounded-lg inline-flex items-center justify-center p-2.5">
//               {!favorite ? 
//              <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width={24}
//               height={24}
//               fill="#F08409"
//               viewBox="0 0 256 256"
//                >
//               <path d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z" />
//             </svg>

//                  :
//                 <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width={24}
//               height={24}
//               fill="#F08409"
//               viewBox="0 0 256 256"
//             >
//               <path d="M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z" />
//             </svg>
//               }

//               </button>

//                <Link to="/raffles/$id"
//                params={{ id: id.toString() }} className="w-full transition duration-300 hover:opacity-90 flex items-center justify-center py-1.5 px-6 h-11 text-white font-semibold font-inter bg-primary-color rounded-full">
//                View raffle
//               </Link>

//             </div>

//            <div className="w-full  h-full flex transition duration-300 group-hover:invisible group-hover:opacity-0 visible opacity-100 flex-col items-start justify-between">
//             <div className="w-full flex items-center justify-end">
//               <div className="inline-flex items-center justify-center px-2.5 md:py-2 py-1.5 divide-x divide-white/30 rounded-lg bg-black/60 border border-white/30">
//                 <p className="text-xs font-semibold font-inter uppercase text-white pr-1.5">
//                   {countdown.hours}H
//                 </p>
//                 <p className="text-xs font-semibold font-inter uppercase text-white px-1.5">
//                   {countdown.minutes}M
//                 </p>
//                 <p className="text-xs font-semibold font-inter uppercase text-white pl-1.5">
//                   {countdown.seconds}S
//                 </p>
//               </div>
//             </div>

//             <div className="w-full flex items-center justify-between">
//               <div className="inline-flex items-center justify-center px-[7px] xl:px-2.5 py-1 rounded-lg bg-black/60">
//                 <p className="text-xs font-semibold font-inter uppercase text-white">
//                   VAL : <span>{val}</span>
//                 </p>
//               </div>

//               <div className="flex items-center gap-[5px]">
//                 <div className="inline-flex items-center justify-center px-[7px] xl:px-2.5 py-1 rounded-lg bg-black/60">
//                   <p className="text-xs font-semibold font-inter uppercase text-white">
//                     TTV : <span>{ttv}</span>
//                   </p>
//                 </div>
//                 <div className="inline-flex items-center justify-center px-[7px] xl:px-2.5 py-1 rounded-lg bg-black/60">
//                   <p className="text-xs font-semibold font-inter uppercase text-white">
//                     +{growthPercent}%
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//           </div>
//         </div>

//          <div className="w-full flex flex-col px-4 py-4 gap-5 md:gap-7">
//         <div className="w-full flex items-center gap-5 justify-between">
//           <h3 className="md:text-2xl text-xl text-black-1000 font-bold font-inter">
//             <span>{coins}</span> {tokenSymbol}
//           </h3>

//           {verified && (
//             <div className="inline-flex gap-2.5 items-center">
//               <img
//                 src="/icons/verified-icon.svg"
//                 alt="verified"
//                 className="w-5 h-5"
//               />
//               <p className="text-sm text-black-1000 font-semibold font-inter">
//                 Verified
//               </p>
//             </div>
//           )}
//         </div>

//         <div className="w-full flex flex-col items-center justify-between gap-1.5">
//           <div className="w-full flex items-center justify-between gap-5">
//             {totalTickets !== soldTickets ? (
//               <h4 className="md:text-base text-sm text-black-1000 font-inter font-semibold">
//                 {remainingTickets}/{totalTickets}
//               </h4>
//             ) : (
//               <h4 className="text-base text-red-1000 font-semibold font-inter">
//                 SOLD OUT
//               </h4>
//             )}
//             <h4 className="md:text-base text-sm text-black-1000 text-right font-inter font-semibold">
//               <span>{pricePerTicket}</span> SOL
//             </h4>
//           </div>
//           <div className="w-full flex items-center justify-between gap-5">
//             <h4 className="md:text-sm text-xs text-gray-1200 font-inter">
//               Tickets remaining
//             </h4>
//             <h4 className="md:text-sm text-xs text-gray-1200 text-right font-inter">
//               Price per ticket
//             </h4>
//           </div>
//         </div>

//         <Link
//           to={Url}
//           className="w-full transition duration-500 bg-linear-to-r hover:from-primary-color hover:via-primary-color hover:to-primary-color from-neutral-800 via-neutral-500 to-neutral-800 rounded-full h-10 md:h-12 flex items-center justify-center text-white text-sm md:text-base font-semibold font-inter text-center"
//         >
//           <span>Select Wallet</span>
//         </Link>
//       </div>
//       </div>
//   );
// };

import { VerifiedTokens } from "@/utils/verifiedTokens";
import { Link } from "@tanstack/react-router";
import React, { useState, useMemo } from "react";
import type { RaffleTypeBackend } from "types/backend/raffleTypes";
import { DynamicCounter } from "./DynamicCounter";
import { useBuyRaffleTicket } from "../../../hooks/useBuyRaffleTicket";
import { useBuyRaffleTicketStore } from "store/buyraffleticketstore";

export interface CryptoCardProps {
  raffle: RaffleTypeBackend;
  soldTickets: number;
  userAvatar?: string;
  userName?: string;
  isFavorite?: boolean;
  className?: string;
  category?: string;
  rafflesType?: string;
}

export const CryptoCard: React.FC<CryptoCardProps> = ({
  raffle,
  soldTickets,
  userAvatar = "/icons/user-avatar.png",
  isFavorite = false,
  className,
  category = "General",
  rafflesType = "All Raffles",
}) => {
  const { buyTicket } = useBuyRaffleTicket();
  const { ticketQuantityById, setTicketQuantityById, getTicketQuantityById, updateTicketQuantityById } = useBuyRaffleTicketStore();
  const remainingTickets = raffle.ticketSupply - soldTickets;
  console.log("remainingTickets",remainingTickets);
  const [favorite, setFavorite] = useState(isFavorite);
  
  const toggleFavorite = () => {
    setFavorite(!favorite);
  };
  console.log("ticketQuantityById",ticketQuantityById);
  const MAX = raffle.maxEntries;

  const decrease = () => {
    const previousQuantity = getTicketQuantityById(raffle.id || 0);
    updateTicketQuantityById(raffle.id || 0, Math.max(1, previousQuantity - 1));
    if(previousQuantity === 1){
      updateTicketQuantityById(raffle.id || 0, 1);
    }
  };

  const increase = () => {
    const previousQuantity = getTicketQuantityById(raffle.id || 0);
    updateTicketQuantityById(raffle.id || 0, Math.min(MAX, previousQuantity + 1));
    if(previousQuantity === MAX){
      updateTicketQuantityById(raffle.id || 0, MAX);
    }
  };

  // Calculate countdown from endsAt date
  

  const totalCost = getTicketQuantityById(raffle.id || 0) * raffle.ticketPrice;

  return (
    <div
      className={`bg-white-1000 border border-gray-1100 rounded-2xl ${className}`}
    >
      {<p className="text-sm hidden text-black">{category}</p>}
      {rafflesType === "created" ? (
        <p className="text-sm hidden text-black">Raffles Created</p>
      ) : (
        <p className="text-sm hidden text-black">Raffles Purchased</p>
      )}

      <div className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <img
            src={userAvatar}
            alt={raffle.createdBy}
            className="w-10 h-10 rounded-full object-cover"
          />
          <h4 className="text-base font-semibold font-inter text-black-1000">
            {raffle.createdBy.slice(0, 6)}...{raffle.createdBy.slice(-4)}
          </h4>
        </div>
        <div className="relative inline-flex items-center justify-center">
          <img src="/images/home/polygon-shape.svg" alt={"shape"} />
          <p className="text-xs font-semibold font-inter text-white-1000 absolute z-10">
            T5
          </p>
        </div>
      </div>

      <div className="w-full relative group flex items-center justify-center">
        <img
          src={raffle.prizeData.image}
          alt={raffle.prizeData.name}
          className="w-50 object-contain h-50 rounded-full"
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
              to="/raffles/$id"
              params={{ id: raffle.id?.toString() || "" }}
              className="w-full transition duration-300 hover:opacity-90 flex items-center justify-center py-1.5 px-6 h-11 text-white font-semibold font-inter bg-primary-color rounded-full"
            >
              View raffle
            </Link>
          </div>
          <div className="w-full h-full flex transition duration-300 group-hover:invisible group-hover:opacity-0 visible opacity-100 flex-col items-start justify-between">
            
          <DynamicCounter endsAt={raffle.endsAt} />

            <div className="w-full flex items-center justify-between">
              <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-black/60">
                <p className="text-xs font-semibold font-inter uppercase text-white">
                  VAL : <span>{raffle.val || 0}</span>
                </p>
              </div>

              <div className="flex items-center gap-[5px]">
                <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-black/60">
                  <p className="text-xs font-semibold font-inter uppercase text-white">
                    TTV : <span>{raffle.ttv}</span>
                  </p>
                </div>
                <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-black/60">
                  <p className="text-xs font-semibold font-inter uppercase text-white">
                    +{raffle.roi}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col px-4 py-4 gap-7">
        <div className="w-full flex items-center gap-5 justify-between">
          <h3 className="text-2xl text-black-1000 font-bold font-inter">
            <span>{raffle.val || 1}</span> {raffle.prizeData.symbol}
          </h3>

          {raffle.prizeData.verified && (
            <div className="inline-flex gap-2.5 items-center">
              <img
                src="/icons/verified-icon.svg"
                alt="verified"
                className="w-5 h-5"
              />
              <p className="text-sm text-black-1000 font-semibold font-inter">
                Verified
              </p>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col items-center justify-between gap-1.5">
          <div className="w-full flex items-center justify-between gap-5">
            {raffle.ticketSupply !== soldTickets ? (
              <h4 className="text-base text-black-1000 font-inter font-semibold">
                {soldTickets}/{raffle.ticketSupply}
              </h4>
            ) : (
              <h4 className="text-base text-red-1000 font-semibold font-inter">
                SOLD OUT
              </h4>
            )}
            <h4 className="text-base text-black-1000 text-right font-inter font-semibold">
              <span>{raffle.ticketPrice/10**(VerifiedTokens.find((token) => token.address === raffle.ticketTokenAddress)?.decimals || 0)}</span> SOL
            </h4>
          </div>
          <div className="w-full flex items-center justify-between gap-5">
            <h4 className="text-sm text-gray-1200 font-inter">
              Tickets remaining
            </h4>
            <h4 className="text-sm text-gray-1200 text-right font-inter">
              Price per ticket
            </h4>
          </div>
        </div>

        {rafflesType === "All Raffles" && (
          <div className="w-full flex items-center sm:flex-row flex-col justify-between gap-4">
          <div className="flex flex-1 items-center justify-between py-2 px-3 border border-gray-1100 rounded-full">
            <button
              onClick={decrease}
              className="min-w-8 h-8 cursor-pointer rounded-lg bg-primary-color text-white flex items-center justify-center"
            >
              <svg
                width={15}
                height={2}
                viewBox="0 0 15 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.799805 0.799988H14.1331"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <input
              value={getTicketQuantityById(raffle.id || 0)}
              onChange={(e) =>
                updateTicketQuantityById(raffle.id || 0,
                  Math.min(MAX, Math.max(1, Number(e.target.value)))
                )
              }
              className="outline-0 w-full text-center font-bold font-inter text-black-1000"
              type="number"
              name="quantity"
              id="quantity"
            />

            <button
              onClick={increase}
              className="min-w-8 h-8 cursor-pointer rounded-lg bg-primary-color text-white flex items-center justify-center"
            >
              <svg
                width={15}
                height={15}
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.46647 0.799988V14.1333M0.799805 7.46665H14.1331"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={()=>{
              buyTicket.mutate({
                raffleId: raffle.id || 0,
                ticketsToBuy: getTicketQuantityById(raffle.id || 0),
              });
            }}  
            className="inline-flex px-2 py-3 sm:w-fit w-full flex-1 text-sm transition gap-1 duration-500 hover:opacity-90 bg-linear-to-r from-neutral-800 via-neutral-500 to-neutral-800 rounded-full h-11 items-center justify-center text-white font-semibold font-inter text-center"
          >
            Buy • <span>{totalCost/10**(VerifiedTokens.find((token) => token.address === raffle.ticketTokenAddress)?.decimals || 0)}</span> {VerifiedTokens.find((token) => token.address === raffle.ticketTokenAddress)?.symbol || "SOL"}
          </button>
        </div>
        )}
        {rafflesType === "Past Raffles" && (
          <div className="w-full flex items-center justify-between">
            <h4 className="text-base text-primary-color font-inter text-center w-full font-semibold">
              Raffle Ended
            </h4>
          </div>
        )}
      </div>
    </div>
  );
};

