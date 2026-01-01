import { useCreateRaffleStore } from "../store/createRaffleStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRaffleAnchorProgram } from "./useRaffleAnchorProgram";
import { PublicKey } from "@solana/web3.js";
import type { RaffleTypeBackend } from "types/backend/raffleTypes";
import { useWallet } from "@solana/wallet-adapter-react";
import { VerifiedTokens } from "../src/utils/verifiedTokens";
import {
  createRaffleOverBackend,
  deleteRaffle,
  verifyRaffleCreation,
} from "../api/routes/raffleRoutes";
import { useRouter } from "@tanstack/react-router";
import { VerifiedNftCollections } from "@/utils/verifiedNftCollections";

export const useCreateRaffle = () => {
  // const { getAllRaffles } = useRaffleAnchorProgram();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const {
    endDate,
    endTimeHour,
    endTimeMinute,
    endTimePeriod,
    supply,
    ticketPrice,
    ticketCurrency,
    percentage,
    prizeType,
    nftPrizeMint,
    prizeImage,
    tokenPrizeAmount,
    tokenPrizeMint,
    val,
    floor,
    ttv,
    nftCollection,
    ticketLimitPerWallet,
    numberOfWinners,
    winShares,
    isUniqueWinners,
    nftPrizeName,
    agreedToTerms,
    getEndTimestamp,
    setIsCreatingRaffle,
  } = useCreateRaffleStore();

  const { createRaffleMutation, getRaffleConfig } = useRaffleAnchorProgram();
  const router = useRouter();
  const validateForm = () => {
    try {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }
      if (!endDate) {
        throw new Error("End Date is required");
      }
      if (!endTimeHour) {
        throw new Error("End Time Hour is required");
      }
      if (!endTimeMinute) {
        throw new Error("End Time Minute is required");
      }
      if (!endTimePeriod) {
        throw new Error("End Time Period is required");
      }
      if (!supply) {
        throw new Error("Supply is required");
      }
      if (!ticketPrice) {
        throw new Error("Ticket Price is required");
      }
      if (!ticketCurrency) {
        throw new Error("Ticket Currency is required");
      }
      if (!prizeType) {
        throw new Error("Prize Type is required");
      }
      if (!nftPrizeMint && !tokenPrizeMint) {
        throw new Error("NFT Prize or Token Prize is required");
      }
      if (!nftPrizeMint && !tokenPrizeAmount) {
        throw new Error("NFT Prize or Token Prize Amount is required");
      }
      if (!val) {
        throw new Error("Val is required");
      }
      if (!ttv) {
        throw new Error("TTV is required");
      }
      if (!isUniqueWinners) {
        throw new Error("Is Unique Winners is required");
      }
      if (!agreedToTerms) {
        throw new Error("You must agree to the terms and conditions");
      }
      if (ticketLimitPerWallet && parseInt(ticketLimitPerWallet) < 1) {
        throw new Error("Ticket Limit Per Wallet must be greater than 0");
      } else if (ticketLimitPerWallet && parseInt(ticketLimitPerWallet) > 100) {
        throw new Error(
          "Ticket Limit Per Wallet must be less than or equal to Supply"
        );
      }
      if (numberOfWinners && parseInt(numberOfWinners) < 1) {
        throw new Error("Number of Winners must be greater than 0");
      } else if (
        numberOfWinners &&
        parseInt(numberOfWinners) > parseInt(supply)
      ) {
        throw new Error(
          "Number of Winners must be less than or equal to Supply"
        );
      }

      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
      return false;
    }
  };

  const now = Math.floor(Date.now() / 1000);

  const deleteRaffleOverBackend = async (raffleId: number) => {
    try {
      const response = await deleteRaffle(raffleId.toString());
      if (response.error) {
        throw new Error("Failed to delete raffle");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  const fetchRaffleConfig = () => {
    const raffleConfig = getRaffleConfig.data;
    return raffleConfig?.raffleCount || 0;
  }
  const raffleBackendPayload: RaffleTypeBackend = {
    id: fetchRaffleConfig(),
    createdAt: new Date(now * 1000),
    endsAt: new Date(getEndTimestamp()! * 1000),
    createdBy: publicKey?.toBase58() || "",
    ticketPrice:
      parseFloat(ticketPrice) *
      10 **
      (VerifiedTokens.find(
        (token) => token.address === ticketCurrency.address
      )?.decimals || 0),
    ticketSupply: parseInt(supply),
    ticketTokenAddress: ticketCurrency.address,
    val: parseFloat(val),
    ttv: ttv,
    roi: parseFloat(percentage),
    maxEntries: Math.floor(
      (parseInt(ticketLimitPerWallet) * parseInt(supply)) / 100
    ),
    numberOfWinners: parseInt(numberOfWinners),
    prizeData: {
      type: prizeType === "nft" ? "NFT" : "TOKEN",
      address: prizeType === "nft" ? nftPrizeMint : tokenPrizeMint,
      mintAddress: prizeType === "nft" ? nftPrizeMint : tokenPrizeMint,
      mint: prizeType === "nft" ? nftPrizeMint : tokenPrizeMint,
      name: prizeType === "nft" ? nftPrizeName : VerifiedTokens.find((token) => token.address === tokenPrizeMint)?.name || "",
      collection: prizeType === "nft" ? (nftCollection?nftCollection:"") : undefined,
      symbol:
        prizeType === "nft" ?
        "":
        VerifiedTokens.find((token) => token.address === tokenPrizeMint)
          ?.symbol || "",
      decimals:
        prizeType === "nft" ?
        0 :
        VerifiedTokens.find((token) => token.address === tokenPrizeMint)
          ?.decimals || 0,
      verified: true,
      image: prizeType === "nft" ? prizeImage : VerifiedTokens.find((token) => token.address === tokenPrizeMint)?.image || "",
      floor: prizeType === "nft" ? parseFloat(floor)/10**9 : undefined,
      amount: prizeType === "nft" ? parseFloat(floor)/10**9 :
        parseFloat(tokenPrizeAmount) *
        10 **
        (VerifiedTokens.find((token) => token.address === tokenPrizeMint)
          ?.decimals || 0),
    },
  };
  const createRaffle = useMutation({
    mutationKey: ["createRaffle"],
    mutationFn: async () => {
      if (!validateForm()) {
        setIsCreatingRaffle(false);
        throw new Error("Validation failed");
      }
      const data = await createRaffleOverBackend(raffleBackendPayload);
      
      const tx = await createRaffleMutation.mutateAsync({
        startTime: now + 60,
        endTime: getEndTimestamp()!,

        totalTickets: parseInt(supply),
        ticketPrice:
          parseFloat(ticketPrice) *
          10 **
          (VerifiedTokens.find(
            (token) => token.address === ticketCurrency.address
          )?.decimals || 0),
        isTicketSol: ticketCurrency.symbol === "SOL",

        maxPerWalletPct: parseInt(ticketLimitPerWallet),
        prizeType: prizeType === "sol" ? 2 : prizeType === "spl" ? 1 : 0,
        prizeAmount: prizeType === "nft" ? 0 :
          parseFloat(tokenPrizeAmount) *
          10 **
          (VerifiedTokens.find((token) => token.address === tokenPrizeMint)
            ?.decimals || 0),
        numWinners: parseInt(numberOfWinners),
        winShares: winShares,
        isUniqueWinners: parseInt(numberOfWinners) == 1,
        startRaffle: true,

        ticketMint: new PublicKey(ticketCurrency.address),
        prizeMint: new PublicKey(prizeType === "nft" ? nftPrizeMint : tokenPrizeMint),
      });
      if (!tx || data.error) {
        throw new Error("Failed to create raffle");
      } else {
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve(true);
          }, 2000)
        );
        const verifyData = await verifyRaffleCreation(data.raffle.id, tx);
        if (verifyData.error) {
          return data.raffle.id;
        }
      }
      return data.raffle.id;
    },
    onMutate: async () => {
      return { raffleId: fetchRaffleConfig() };
    },
    onSuccess: (raffleId: number) => {
      queryClient.invalidateQueries({ queryKey: ["raffles", raffleId.toString()] });
      setIsCreatingRaffle(false);
      toast.success("Raffle created successfully");
      new Promise((resolve) => setTimeout(resolve, 2000));
      router.navigate({ to: "/raffles/$id", params: { id: raffleId.toString() } });
    },
    onError: async (_error, _args, context) => {
      if (context?.raffleId) {
        await deleteRaffleOverBackend(context.raffleId);
      }
      setIsCreatingRaffle(false);
      toast.error("Failed to create raffle");
    },
  });

  return { createRaffle };
};
