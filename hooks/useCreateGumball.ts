import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGumballAnchorProgram } from "./useGumballAnchorProgram";
import toast from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
// import type { GumballBackendType } from "../types/backend/gumballTypes";
// import { createGumballSchema } from "../types/backend/gumballTypes";
import { confirmGumballCreation, createGumballOverBackend, deleteGumballOverBackend } from "../api/routes/gumballRoutes";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGumballStore } from "../store/useGumballStore";
import { useRouter } from "@tanstack/react-router";
import { useCheckAuth } from "./useCheckAuth";

export const useCreateGumball = () => {
    //TODO: Add activation logic from contract if the gumball starting immediately
    const { createGumballMutation } = useGumballAnchorProgram();
    const queryClient = useQueryClient();
    const { publicKey } = useWallet();
    const { setCreatedGumballId, setActiveTab } = useGumballStore();
    const router = useRouter();
    const { checkAndInvalidateToken } = useCheckAuth();

    const validateForm = async (args: {
        name: string;
        startTime: number;
        endTime: number;
        totalTickets: number;
        ticketPrice: number;
        isTicketSol: boolean;
        startGumball: boolean;
        ticketMint?: PublicKey;
    }) => {
        if (!publicKey) {
            throw new Error("Wallet not connected");
        }
        const isValid = await checkAndInvalidateToken(publicKey.toBase58());
        if (!isValid) {
            throw new Error("Signature verification failed");
        }
        if (args.name.length === 0) {
            throw new Error("Name is required");
        }
        if (args.startTime <= 0) {
            throw new Error("Start time is required");
        }
        if (args.endTime <= 0) {
            throw new Error("End time is required");
        }
        if (args.totalTickets <= 0) {
            throw new Error("Total tickets must be greater than 0");
        }
        if (args.ticketPrice && args.ticketPrice <= 0) {
            throw new Error("Ticket price must be greater than 0");
        }
        if (!args.isTicketSol && args.ticketMint === undefined) {
            throw new Error("Ticket mint is required");
        }
        return true;
    }
    const { getGumballConfig } = useGumballAnchorProgram();
    const gumballCount = getGumballConfig.data?.gumballCount || 0;
    const createGumball = useMutation({
        mutationKey: ["createGumball"],
        mutationFn: async (args: {
            name: string;
            startTime: number;
            endTime: number;
            totalTickets: number;
            ticketPrice: number;
            isTicketSol: boolean;
            startGumball: boolean;
            // Ticket configuration
            ticketMint?: PublicKey;
        }) => {
            console.log("createGumball");
            console.log(args);
            console.log("gumballCount", gumballCount);
            const validatedData = await validateForm(args);
            if (!validatedData) {
                throw new Error();
            }
            const createGumball = await createGumballOverBackend({
                id: gumballCount,
                creatorAddress: publicKey?.toBase58().toString() || "",
                name: args.name,
                manualStart: false,
                startTime: new Date((args.startTime * 1000) - 2), //2 sec before start to avoid failure in contract because of time difference
                endTime: new Date((args.endTime) * 1000),
                totalTickets: 0,
                ticketPrice: args.ticketPrice.toString(),
                isTicketSol: args.isTicketSol,
                maxPrizes: args.totalTickets,
                ticketMint: args.ticketMint ? args.ticketMint.toBase58().toString() : undefined,
            });
            if (!createGumball) {
                return createGumball.gumball.id;
            }
            console.log(createGumball);
            const tx = await createGumballMutation.mutateAsync({
                startTime: args.startTime,
                endTime: args.endTime,
                totalTickets: args.totalTickets,
                ticketPrice: args.ticketPrice,
                isTicketSol: args.isTicketSol,
                startGumball: args.startGumball,
                ticketMint: args.ticketMint ? new PublicKey(args.ticketMint) : undefined,
            });
            if (!tx) {
                return createGumball.gumball.id;
            } else {
                const confirmData = await confirmGumballCreation(createGumball.gumball.id, tx);
                if (!confirmData) {
                    throw new Error("Failed to confirm gumball creation");
                }
            }
            return createGumball.gumball.id;
        },
        onSuccess: (gumballId: number) => {
            queryClient.invalidateQueries({ queryKey: ["gumballs", gumballId.toString()] });
            toast.success("Gumball created successfully");
            setCreatedGumballId(gumballId);
            setActiveTab("loadPrizes");
            router.navigate({ to: "/gumballs/create_gumballs/$id", params: { id: gumballId.toString() } });
        },
        onError: () => {
            deleteGumballOverBackend(gumballCount.toString());
            toast.error("Failed to create gumball");
        }
    });
    return { createGumball };
}