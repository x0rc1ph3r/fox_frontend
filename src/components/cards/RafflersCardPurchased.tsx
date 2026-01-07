import { VerifiedTokens } from "@/utils/verifiedTokens";
import { Link } from "@tanstack/react-router";
import type { RaffleTypeBackend } from "types/backend/raffleTypes";
import { PrimaryButton } from "../ui/PrimaryButton";
import { useClaimRafflePrize } from "../../../hooks/useClaimRafflePrize";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { VerifiedNftCollections } from "@/utils/verifiedNftCollections";

export interface RafflersCardPurchasedProps extends RaffleTypeBackend {
  ticketsBought:number;
  className?: string;
  isWinner: boolean;
  hasClaimed: boolean;
}

export const RafflersCardPurchased: React.FC<RafflersCardPurchasedProps> = (props) => {
  const {
    id,
    raffle,
    prizeData,
    createdBy,
    ticketSupply,
    ticketSold = 0,
    ticketPrice,
    ticketTokenAddress,
    ticketsBought,
    raffleEntries,
    className,
    isWinner,
    hasClaimed,
  } = props;

  console.log(props)

  console.log(isWinner, hasClaimed)
  const chancePercent = ticketSupply > 0 ? ((ticketsBought / ticketSupply) * 100).toFixed(1) : 0;
  
  const totalSpent = ticketsBought * ticketPrice;
  
  const remainingTickets = ticketSupply - ticketSold;
  const { claimPrize } = useClaimRafflePrize();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  return (
    <div
      className={`bg-transparent hover:bg-gray-1300 w-full transition duration-300 border border-gray-1100 rounded-2xl ${className}`}
    >
      <div className="w-full flex gap-5 p-5 sm:flex-row flex-col">
        <img
          src={prizeData.image}
          alt={prizeData.name}
          className="object-cover w-[109px] h-[109px] rounded-lg"
        />

        <div className="flex-1">
          <div className="flex w-full items-center justify-between">
            <h3 className="xl:text-2xl text-xl text-black-1000 font-bold font-inter">
              {prizeData.name}
            </h3>
            <div className="flex items-center ">
              {isWinner && 
                <PrimaryButton
                className="w-full h-[40px] relative right-10 "
                onclick={() => {
                  claimPrize.mutate({
                    raffleId: Number(id) || 0,
                  }, {
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ["profile-raffle-purchased", publicKey?.toBase58() || ""] });
                      toast.success("Prize claimed successfully");
                    },
                    onError: () => {
                      toast.error("Failed to claim prize");
                    }
                  })
                }}  
                text="Claim Prize"
                disabled={hasClaimed || claimPrize.isPending}
              />
              }
            <Link
              to="/raffles/$id"
              params={{ id: raffle || id?.toString() || "" }}
              className="w-10 h-10 transition duration-300 hover:opacity-90 flex items-center justify-center text-white font-semibold font-inter bg-primary-color rounded-md"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 4.16665L13.3333 9.99998L7.5 15.8333"
                  stroke="#212121"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            </div>
          </div>

          <div className="w-full gap-6 flex justify-between mt-6 md:flex-row flex-col">
            <div className="flex flex-col gap-1.5">
              {prizeData.verified && (
                <div className="inline-flex gap-2.5 items-center">
                  <p className="text-sm text-black-1000 font-semibold font-inter">
                    {prizeData.collection ? VerifiedNftCollections.find((collection) => collection.address === prizeData.collection)?.name : "Verified Collection"}
                  </p>
                  <img
                    src="/icons/verified-icon.svg"
                    alt="verified"
                    className="w-5 h-5"
                  />
                </div>
              )}

              <p className="text-sm font-medium text-primary-color font-inter">
                {createdBy.slice(0, 6)}...{createdBy.slice(-4)}
              </p>
            </div>

            <p className="text-base mt-auto text-primary-color font-medium font-inter">
              {prizeData.symbol}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-1100"></div>
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 md:gap-20 p-5">
        <div>
          <h4 className="text-sm mb-1.5 text-gray-1200 font-inter">
            Tickets remaining
          </h4>
          {ticketSupply !== ticketSold ? (
            <h4 className="md:text-base text-sm text-black-1000 font-inter font-medium">
              {remainingTickets}/{ticketSupply}
            </h4>
          ) : (
            <h4 className="text-base text-red-1000 font-semibold font-inter">
              SOLD OUT
            </h4>
          )}
        </div>

        <div className="flex-1">
          <h4 className="text-sm mb-1.5 text-gray-1200 font-inter">Price</h4>
          <h4 className="md:text-base text-sm text-black-1000 font-inter font-medium">
            <span>{ticketPrice/10**(VerifiedTokens.find((token) => token.address === ticketTokenAddress)?.decimals || 0)}</span> {VerifiedTokens.find((token) => token.address === ticketTokenAddress)?.symbol || "SOL"}
          </h4>
        </div>

        <div className="flex-1">
          <h4 className="text-sm mb-1.5 text-gray-1200 font-inter">
            Tickets Bought
          </h4>
          <h4 className="md:text-base text-sm text-black-1000 font-inter font-medium">
            <span>{ticketsBought}</span>
          </h4>
        </div>

        <div className="flex-1">
          <h4 className="text-sm mb-1.5 text-gray-1200 font-inter">Chance</h4>
          <h4 className="md:text-base text-sm text-black-1000 font-inter font-medium">
            <span>{chancePercent}</span>% Chance
          </h4>
        </div>

        <div className="flex-1">
          <h4 className="text-sm mb-1.5 text-gray-1200 font-inter">Spent</h4>
          <h4 className="md:text-base text-sm text-black-1000 font-inter font-medium">
            <span>{totalSpent/10**(VerifiedTokens.find((token) => token.address === ticketTokenAddress)?.decimals || 0)}</span> {VerifiedTokens.find((token) => token.address === ticketTokenAddress)?.symbol || "SOL"} Spent
          </h4>
        </div>
      </div>
    </div>
  );
};
