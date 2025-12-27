import { Link } from "@tanstack/react-router";
import React, { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToggleFavourite } from "../../../hooks/useToggleFavourite";
import { useQueryFavourites } from "../../../hooks/useQueryFavourites";

export interface AucationsCardProps {
  id: number;
  userName: string;
  userAvatar: string;
  heading: string;
  ProfileLink?: string;
  isFavorite?: boolean;
  MainImage: string;
  AuctionTime: string;
  val: number;
  val2: string;
  Winner: string;
  WinnerBid: string;
  isWinner: boolean;
  verified?: boolean;
  totalTickets: number;
  className?: string;
}

export const AucationsCard: React.FC<AucationsCardProps> = ({
  id,
  userName,
  userAvatar,
  isFavorite = false,
  heading,
  MainImage,
  AuctionTime,
  val,
  val2,
  Winner,
  WinnerBid,
  isWinner,
  verified = false,
  className,
}) => {
  const { publicKey } = useWallet();
  const { favouriteAuction } = useToggleFavourite(publicKey?.toString() || "");
  const { getFavouriteAuction } = useQueryFavourites(publicKey?.toString() || "");

  const favorite = useMemo(() => {
    if (!getFavouriteAuction.data || getFavouriteAuction.data.length === 0) return false;
    return getFavouriteAuction.data?.some((favourite) => favourite.id === id);
  }, [getFavouriteAuction.data, id]);

  const toggleFavorite = async () => {
    favouriteAuction.mutate({
      auctionId: id || 0,
    });
  };

  return (
      <div className={`bg-white-1000 border border-gray-1100 rounded-2xl ${className}`}>
          {/* Head */}
        <div className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <h4 className="text-base font-semibold font-inter text-black-1000">
              {userName}
            </h4>
          </div>
          <div className="relative inline-flex items-center justify-center">
            <img src="/images/home/polygon-shape.svg" alt={'shape'} />
            <p className="text-xs font-semibold font-inter text-white-1000 absolute z-10">
              T5
            </p>
          </div>
        </div>
        
        <div className="w-full relative group">
          <img
            src={MainImage}
            alt="featured-card"
            className="w-full border-y border-gray-1100 object-cover h-[339px]"
          />

          <div className="w-full h-full flex flex-col items-start justify-between p-4 absolute top-0 left-0">
            <div className="w-full h-full transition duration-300 group-hover:visible group-hover:opacity-100 invisible opacity-0 absolute left-0 p-4 top-0 flex flex-col items-start justify-between">
              <button onClick={toggleFavorite} className="bg-black/60 ml-auto cursor-pointer rounded-lg inline-flex items-center justify-center p-2.5">
              {!favorite ? 
             <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="#F08409"
              viewBox="0 0 256 256"
               >
              <path d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z" />
            </svg>

                 :
                <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="#F08409"
              viewBox="0 0 256 256"
            >
              <path d="M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z" />
            </svg>
              }

              </button>

          <Link 
            to="/auctions/$id"
             params={{ id: id.toString() }}
            className="w-full transition duration-300 hover:opacity-90 flex items-center justify-center py-1.5 px-6 h-11 text-white font-semibold font-inter bg-primary-color rounded-full"
          >
            View Auction
          </Link>

            </div>

           <div className="w-full  h-full flex transition duration-300 group-hover:invisible group-hover:opacity-0 visible opacity-100 flex-col items-start justify-between">
            <div className="w-full flex items-center justify-end">
              <div className="inline-flex items-center justify-center px-2.5 py-2 divide-x divide-white/30 rounded-lg bg-black/60 border border-white/30">
                <p className="text-xs font-semibold font-inter text-white">
                  {AuctionTime}
                </p>
              </div>
            </div>

            <div className="w-full flex items-center gap-1.5">
              <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-black/60">
                <p className="text-xs font-semibold font-inter uppercase text-white">
                  <span>{val}</span>
                </p>
              </div>

              <div className="flex items-center gap-[5px]">
                <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-black/60">
                  <p className="text-xs font-semibold font-inter uppercase text-white">
                    ⍜ <span>{val2}</span>
                  </p>
                </div>
             
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col px-4 py-4 gap-7">
          <div className="w-full flex items-center gap-5 justify-between">
            <h3 className="2xl:text-2xl text-lg lg:text-xl text-black-1000 font-bold font-inter">
              {heading}
            </h3>

            {verified && (
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
               {(isWinner) ?   
              <h4 className="md:text-base text-sm text-green-1000 font-inter font-semibold">
                {Winner}
              </h4>
              :
              <h4 className="text-base text-red-1000 font-semibold font-inter">No Winner</h4>
              }
              <h4 className="md:text-base text-sm text-green-1000 text-right font-inter font-semibold">
                {WinnerBid}
              </h4>
            </div>
            <div className="w-full flex items-center justify-between gap-5">
              <h4 className="md:text-sm text-xs text-gray-1200 font-inter">
                Winner
              </h4>
              {WinnerBid &&
              <h4 className="md:text-sm text-xs text-gray-1200 text-right font-inter">
                Winning bid
              </h4>}
            </div>
          </div>

    
        </div>
      </div>
  );
};
