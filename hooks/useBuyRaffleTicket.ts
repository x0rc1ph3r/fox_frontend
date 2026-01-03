import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRaffleAnchorProgram } from "./useRaffleAnchorProgram";
import { buyRaffleTicket } from "../api/routes/raffleRoutes";
import toast from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCheckAuth } from "./useCheckAuth";

export const useBuyRaffleTicket = () => {
  const { buyTicketMutation } = useRaffleAnchorProgram();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  const { checkAndInvalidateToken } = useCheckAuth();

  const validateForm = async (args: { raffleId: number; ticketsToBuy: number }) => {
    try {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }
      const isValid = await checkAndInvalidateToken(publicKey.toBase58());
      if (!isValid) {
        throw new Error("Signature verification failed");
      }
      if (!args.raffleId) {
        throw new Error("Raffle ID is required");
      }
      if (!args.ticketsToBuy || args.ticketsToBuy <= 0) {
        throw new Error("At least one ticket must be bought");
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

  const buyTicket = useMutation({
    mutationKey: ["buyTicket"],
    mutationFn: async (args: {
      raffleId: number;
      ticketsToBuy: number;
    }) => {
      console.log("args", args);
      if (!await validateForm(args)) {
        throw new Error("Validation failed");
      }
      const tx = await buyTicketMutation.mutateAsync(args);
      const response = await buyRaffleTicket(args.raffleId.toString(), tx, args.ticketsToBuy);
      console.log("response", response);
      if (response.error) {
        throw new Error(response.error);
      }
      return args.raffleId;
    },
    onSuccess: (raffleId) => {
      queryClient.invalidateQueries({ queryKey: ["raffle", raffleId.toString()] });
      toast.success("Tickets bought successfully");
    },
    onError: () => {
      toast.error("Failed to buy tickets");
    }
  });
  return { buyTicket };
};