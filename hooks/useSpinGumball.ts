import { useMutation } from "@tanstack/react-query";
import { prepareSpin, spinGumball } from "../api/routes/gumballRoutes";
import { useGumballAnchorProgram } from "./useGumballAnchorProgram";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCheckAuth } from "./useCheckAuth";
import { useWallet } from "@solana/wallet-adapter-react";

export const useSpinGumball = () => {
    const { spinGumballMutation } = useGumballAnchorProgram();
    const queryClient = useQueryClient();
    const { checkAndInvalidateToken } = useCheckAuth();
    const { publicKey } = useWallet();

    const validateForm = async (args: { gumballId: number; prizeIndex: number; prizeMint: string }) => {
        try {
            if (!publicKey) {
                throw new Error("Wallet not connected");
            }
            const isValid = await checkAndInvalidateToken(publicKey.toBase58());
            if (!isValid) {
                throw new Error("Signature verification failed");
            }
            if (!args.gumballId) {
                throw new Error("Gumball ID is required");
            }
            if (args.prizeIndex === undefined || args.prizeIndex === null) {
                throw new Error("Prize index is required");
            }
            if (!args.prizeMint) {
                throw new Error("Prize mint is required");
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

    const spinGumballFunction = useMutation({
        mutationKey: ["gumball", "spin"],
        mutationFn: async (args: {
            gumballId: number;
            prizeIndex: number;
            prizeMint: string;
        }) => {
            if (!(await validateForm(args))) {
                throw new Error("Validation failed");
            }
            console.log("args", args);
            const tx = await spinGumballMutation.mutateAsync({
                gumballId: args.gumballId,
                prizeIndex: args.prizeIndex,
                prizeMint: new PublicKey(args.prizeMint),
            });
            if (!tx) {
                throw new Error("Failed to spin gumball");
            }
            const spinResponse = await spinGumball(args.gumballId.toString(), tx, args.prizeIndex);
            if (spinResponse.error) {
                throw new Error(spinResponse.error);
            }
            return args.gumballId;
        },
        onSuccess: (gumballId: number) => {
            queryClient.invalidateQueries({ queryKey: ["gumball", gumballId.toString()] });
            toast.success("Gumball spun successfully");
        },
        onError: () => {
            toast.error("Failed to spin gumball");
        }
    });
    return { spinGumballFunction };
}   