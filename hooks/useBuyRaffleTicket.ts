import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRaffleAnchorProgram } from "./useRaffleAnchorProgram";
import { buyRaffleTicket } from "../api/routes/raffleRoutes";
import toast from "react-hot-toast";

export const useBuyRaffleTicket = () => {
  const { buyTicketMutation } = useRaffleAnchorProgram();
  const queryClient = useQueryClient();
  const buyTicket = useMutation({
    mutationKey: ["buyTicket"],
    mutationFn: async (args: {
      raffleId: number;
      ticketsToBuy: number;
    }) => {
      console.log("args",args);
      const tx = await buyTicketMutation.mutateAsync(args);
      const response = await buyRaffleTicket(args.raffleId.toString(),tx, args.ticketsToBuy);
      console.log("response",response);
      if(response.error){
        throw new Error(response.error);
      }
      return args.raffleId;
    },
    onSuccess:(raffleId)=>{
      queryClient.invalidateQueries({ queryKey: ["raffle", raffleId.toString()] });
      toast.success("Tickets bought successfully");
    },
    onError:(error:any)=>{
      console.error(error);
      toast.error("Failed to buy tickets");
    }
  });
  return { buyTicket };
};