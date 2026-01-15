import { api } from "..";
import type { RaffleTypeBackend } from "../../types/backend/raffleTypes";

export const getRaffles = async (page: number, limit: number) => {
    try {
        const response = await api.get(`/raffle?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getCollectionFP = async (symbol: string) => {
    try {
        const response = await api.get(`/raffle/collection/floorPrice/${symbol}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const createRaffleOverBackend = async (raffle: RaffleTypeBackend) => {
    try {
        const response = await api.post("/raffle/create", raffle, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getRaffleById = async (raffleId: string) => {
    try {
        const response = await api.get(`/raffle/${raffleId}`);
        console.log("response", response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const buyRaffleTicket = async (raffleId: string, txSignature: string, ticketsToBuy: number) => {
    try {
        const response = await api.post(`/raffle/buy/${raffleId}`, {
            quantity: ticketsToBuy,
            txSignature,
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deleteRaffle = async (raffleId: string) => {
    try {
        const response = await api.delete(`/raffle/delete/${raffleId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
export const cancelRaffleOverBackend = async (raffleId: string, txSignature: string) => {
    try {
        const response = await api.post(`/raffle/cancel/${raffleId}`, {
            txSignature
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const claimRafflePrize = async (raffleId: string, txSignature: string) => {
    try {
        const response = await api.post(`/raffle/claim/${raffleId}`, {
            txSignature
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const claimTicketRaffle = async (raffleId: number, txSignature: string) => {
    try {
        const response = await api.post(`/raffle/claim-ticket-amount/${raffleId}`, {
            txSignature: txSignature,
        },{
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
export const getRaffleWinnersWhoClaimedPrize = async (raffleId: string) => {
    try {
        const response = await api.get(`/raffle/winners/claim/${raffleId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getCancelRaffleTx = async (raffleId: string) => {
    try {
        const response = await api.get(`/raffle/cancel-tx/${raffleId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getClaimRaffleTx = async (raffleId: string) => {
    try {
        const response = await api.get(`/raffle/claim-tx/${raffleId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const buyTicketTx = async (raffleId: number, ticketsToBuy: number) => {
    try {
        const response = await api.post("/raffle/buy-ticket-tx", {
            raffleId,
            ticketsToBuy,
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Define the parameter type for createRaffleTx
type CreateRaffleTxParams = {
    startTime: number;
    endTime: number;
    maximumTickets: number;
    totalTickets: number;
    ticketPrice: number;
    isTicketSol: boolean;
    maxPerWalletPct: number;
    prizeType: number;
    prizeAmount: number;
    numWinners: number;
    winShares: number[];
    isUniqueWinners: boolean;
    startRaffle: boolean;
    ticketMint: string;
    prizeMint: string;
};

export const createRaffleTx = async (params: CreateRaffleTxParams) => {
    try {
        const response = await api.post("/raffle/create-tx", params, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const claimPrizeBackTx = async (raffleId: string) => {
    try {
        const response = await api.get(`/raffle/claim-prize-back-tx/${raffleId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}