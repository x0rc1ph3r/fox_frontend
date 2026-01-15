import { api } from "..";
import type { AuctionTypeBackend } from "../../types/backend/auctionTypes";

export const getAuctions = async (page: number, limit: number) => {
    try {
        const response = await api.get(`/auction?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const createAuctionOverBackend = async (auction: AuctionTypeBackend) => {
    try {
        const response = await api.post("/auction/create", auction, {
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

export const getAuctionById = async (auctionId: string) => {
    try {
        const response = await api.get(`/auction/${auctionId}`);
        console.log("response", response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const bidInAuction = async (auctionId: string, txSignature: string, bidAmount: string) => {
    try {
        const response = await api.post(`/auction/bid/${auctionId}`, {
            bidAmount,
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

export const deleteAuction = async (auctionId: string) => {
    try {
        const response = await api.delete(`/auction/delete/${auctionId}`, {
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

export const cancelAuctionOverBackend = async (auctionId: string, txSignature: string) => {
    try {
        const response = await api.post(`/auction/cancel/${auctionId}`, {
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

export const claimAuctionPrize = async (auctionId: string, txSignature: string) => {
    try {
        const response = await api.post(`/auction/claim/${auctionId}`, {
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

export const getAuctionsByUser = async () => {
    try {
        const response = await api.get("/auction/auctionbyuser");
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getBidsByUser = async () => {
    try {
        const response = await api.get("/auction/bidsbyuser");
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getCreateAuctionTx = async (startTime: number, endTime: number, startImmediately: boolean, isBidMintSol: boolean, baseBid: number, minIncrement: number, timeExtension: number, prizeMint: string, bidMint?: string) => {
    try {
        const response = await api.post("/auction/create-tx", {
            startTime,
            endTime,
            startImmediately,
            isBidMintSol,
            baseBid,
            minIncrement,
            timeExtension,
            prizeMint,
            bidMint
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

export const getCancelAuctionTx = async (auctionId: string) => {
    try {
        const response = await api.get(`/auction/cancel-tx/${auctionId}`, {
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

export const getBidAuctionTx = async (auctionId: number, bidAmount: number) => {
    try {
        const response = await api.post("/auction/bid-tx", {
            auctionId,
            bidAmount
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