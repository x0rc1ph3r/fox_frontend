import { useMutation } from "@tanstack/react-query";
import type { AddMultiplePrizesTypeBackend, PrizeDataBackend } from "../types/backend/gumballTypes";
import { addMultiplePrizesToGumball } from "../api/routes/gumballRoutes";
import toast from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import { useGumballAnchorProgram } from "./useGumballAnchorProgram";

type OnChainPrizeInput = {
    prizeIndex: number;
    prizeAmount: number;
    quantity: number;
    prizeMint: PublicKey;
};

export type AddPrizeInputData = {
    prizeIndex: number;
    isNft: boolean;
    mint: string;
    name?: string;
    symbol?: string;
    image?: string;
    decimals?: number;
    prizeAmount: number; 
    quantity: number;
    floorPrice?: string;
};

export const useAddPrizes = () => {
    const { addMultiplePrizesMutation } = useGumballAnchorProgram();
    
    const addPrizes = useMutation({
        mutationKey: ["addPrizes"],
        mutationFn: async (args: {
            gumballId: string;
            prizes: AddPrizeInputData[];
        }) => {
            console.log("gumballId", args.gumballId);
            console.log("Input prizes:", args.prizes);
            const onChainPrizes: OnChainPrizeInput[] = args.prizes.map((prize) => {
                console.log("Processing prize:", prize);
                console.log("Processing prize with mint:", prize.mint);
                const mintPubkey = new PublicKey(prize.mint);
                console.log("Converted to PublicKey:", mintPubkey.toString());
                return {
                    prizeIndex: prize.prizeIndex,
                    prizeAmount: prize.prizeAmount>0 ? prize.prizeAmount : 1,
                    quantity: prize.quantity,
                    prizeMint: mintPubkey,
                };
            });
            console.log("onChainPrizes", onChainPrizes);

            const txSignature = await addMultiplePrizesMutation.mutateAsync({
                gumballId: parseInt(args.gumballId),
                prizes: onChainPrizes,
            });

            const backendPrizes: PrizeDataBackend[] = args.prizes.map((prize) => ({
                prizeIndex: prize.prizeIndex,
                isNft: prize.isNft,
                mint: prize.mint,
                name: prize.name,
                symbol: prize.symbol,
                image: prize.image,
                decimals: prize.decimals,
                totalAmount: String(prize.prizeAmount * prize.quantity),
                prizeAmount: String(prize.prizeAmount),
                quantity: prize.quantity,
                floorPrice: prize.floorPrice,
            }));

            const backendPayload: AddMultiplePrizesTypeBackend = {
                prizes: backendPrizes,
                txSignature: txSignature,
            };

            const response = await addMultiplePrizesToGumball(args.gumballId, backendPayload);
            if (response.error) {
                throw new Error(response.error);
            }
            
            return { txSignature, backendResponse: response };
        },
        onSuccess: () => {
            toast.success("Prizes added successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to add prizes");
        },
    });
    
    return { addPrizes };
};