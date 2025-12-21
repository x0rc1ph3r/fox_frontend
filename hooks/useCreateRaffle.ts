import { useCreateRaffleStore } from "../store/createRaffleStore";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useCreateRaffle = ()=>{
    const {
        endDate,
        endTimeHour,
        endTimeMinute,
        endTimePeriod,
        supply,
        ticketPrice,
        ticketCurrency,
        prizeType,
        nftPrizeMint,
        tokenPrizeAmount,
        tokenPrizeMint,
        val,
        ttv,
        percentage,
        rent,
        ticketLimitPerWallet,
        numberOfWinners,
        winShares,
        isUniqueWinners,
        agreedToTerms,
    } = useCreateRaffleStore();

    const validateForm = ()=>{
        try{
            if(!endDate){
                throw new Error("End Date is required");
            }
            if(!endTimeHour){
                throw new Error("End Time Hour is required");
            }
            if(!endTimeMinute){
                throw new Error("End Time Minute is required");
            }
            if(!endTimePeriod){
                throw new Error("End Time Period is required");
            }
            if(!supply){
                throw new Error("Supply is required");
            }
            if(!ticketPrice){
                throw new Error("Ticket Price is required");
            }
            if(!ticketCurrency){
                throw new Error("Ticket Currency is required");
            }
            if(!prizeType){
                throw new Error("Prize Type is required");
            }
            if(!nftPrizeMint && !tokenPrizeMint){
                throw new Error("NFT Prize or Token Prize is required");
            }
            if(!tokenPrizeAmount){
                throw new Error("Token Prize Amount is required");
            }
            if(!val){
                throw new Error("Val is required");
            }
            if(!ttv){
                throw new Error("TTV is required");
            }
            if(!isUniqueWinners){
                throw new Error("Is Unique Winners is required");
            }
            if(!agreedToTerms){
                throw new Error("You must agree to the terms and conditions");
            }
            if(ticketLimitPerWallet && parseInt(ticketLimitPerWallet) < 1){
                throw new Error("Ticket Limit Per Wallet must be greater than 0");
            }else if(ticketLimitPerWallet && parseInt(ticketLimitPerWallet) > parseInt(supply)){
                throw new Error("Ticket Limit Per Wallet must be less than or equal to Supply");
            }
            if(numberOfWinners && parseInt(numberOfWinners) < 1){
                throw new Error("Number of Winners must be greater than 0");
            }else if(numberOfWinners && parseInt(numberOfWinners) > parseInt(supply)){
                throw new Error("Number of Winners must be less than or equal to Supply");
            }
            
            return true;
        }catch(error:any){
            toast.error(error.message);
            return false;
        }
    }
    const createRaffleMutation = useMutation({
        mutationFn: async ()=>{
            if(!validateForm()){
                return;
            }
            console.log("form submitted");
            toast.success("Raffle created successfully");
        }
    })

    return {createRaffleMutation};
}