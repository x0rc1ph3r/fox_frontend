import { useCreateRaffleStore } from "../store/createRaffleStore";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRaffleAnchorProgram } from "./useRaffleAnchorProgram";
import { PublicKey } from "@solana/web3.js";
import type { RaffleTypeBackend } from "types/backend/raffleTypes";
import { useWallet } from "@solana/wallet-adapter-react";
import { VerifiedTokens } from "../src/utils/verifiedTokens";
import {
  createRaffleOverBackend,
  verifyRaffleCreation,
} from "../api/routes/raffleRoutes";

export const useCreateRaffle = () => {
  const { publicKey } = useWallet();
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
    tokenPrizeAmount,
    tokenPrizeMint,
    val,
    ttv,
    ticketLimitPerWallet,
    numberOfWinners,
    winShares,
    isUniqueWinners,
    agreedToTerms,
    getEndTimestamp,
    setIsCreatingRaffle,
  } = useCreateRaffleStore();

  const { createRaffleMutation } = useRaffleAnchorProgram();

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
      if (!tokenPrizeAmount) {
        throw new Error("Token Prize Amount is required");
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
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };
  const now = Math.floor(Date.now() / 1000);

  const raffleBackendPayload: RaffleTypeBackend = {
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
      address: tokenPrizeMint,
      mintAddress: tokenPrizeMint,
      mint: tokenPrizeMint,
      name:
        VerifiedTokens.find((token) => token.address === tokenPrizeMint)
          ?.name || "",
      symbol:
        VerifiedTokens.find((token) => token.address === tokenPrizeMint)
          ?.symbol || "",
      decimals:
        VerifiedTokens.find((token) => token.address === tokenPrizeMint)
          ?.decimals || 0,
      verified: true,
      image:VerifiedTokens.find((token) => token.address === tokenPrizeMint)?.image || "",
      amount:
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
        return;
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
        prizeAmount:
          parseFloat(tokenPrizeAmount) *
          10 **
            (VerifiedTokens.find((token) => token.address === tokenPrizeMint)
              ?.decimals || 0),
        numWinners: parseInt(numberOfWinners),
        winShares: winShares,
        isUniqueWinners: parseInt(numberOfWinners) == 1,
        startRaffle: true,

        ticketMint: new PublicKey(ticketCurrency.address),
        prizeMint: new PublicKey(tokenPrizeMint),
      });
      if (!tx || data.error) {
        throw new Error("Failed to create raffle");
      } else {
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve(true);
          }, 5000)
        );
        const verifyData = await verifyRaffleCreation(data.raffle.id, tx);
        if (verifyData.error) {
          throw new Error("Failed to verify raffle creation");
        }
      }
    },
    onSuccess: () => {
      setIsCreatingRaffle(false);
      toast.success("Raffle created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
      setIsCreatingRaffle(false);
    },
  });

  return { createRaffle };
};
