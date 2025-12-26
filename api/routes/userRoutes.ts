import type { RaffleTypeBackend } from "types/backend/raffleTypes";
import { api } from "..";

export const requestMessage = async(publicKey:string)=>{
    try {
        const response = await api.get(`/user/auth/request-message/${publicKey}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const verifyMessage = async(publicKey:string, message:string, signature:string)=>{
    try {
        const response = await api.post(`/user/auth/verify`, {
            publicKey,
            message,
            signature,
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
// api/auth.ts
export const refreshToken = async (oldToken: string): Promise<string | null> => {
    try {
        const response = await api.post('/user/auth/refresh', {
            oldToken
        },{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${oldToken}`
            },
        });

        if (response.status !== 200) {
            throw new Error('Token refresh failed');
        }

        const data = response.data;
        return data.token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};

export const getProfileRaffleStats = async (publicKey:string)=>{
    try {
        const response = await api.get(`/user/profile/${publicKey}/raffles/stats`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getProfileGumballStats = async (publicKey:string)=>{
    try {
        const response = await api.get(`/user/profile/${publicKey}/gumballs/stats`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getProfileAuctionStats = async (publicKey:string)=>{
    try {
        const response = await api.get(`/user/profile/${publicKey}/auctions/stats`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


//raffle profile routes

export const getRaffleCreated = async (publicKey:string): Promise<{message:string, raffles:RaffleTypeBackend[]}> => {
    try {
        const response = await api.get(`/user/profile/${publicKey}/raffles/created`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getRafflePurchased = async (publicKey:string) => {
    try {
        const response = await api.get(`/user/profile/${publicKey}/raffles/purchased`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getRaffleFavourite = async (publicKey:string): Promise<{message:string, raffles:RaffleTypeBackend[]}> => {
    try {
        const response = await api.get(`/user/profile/${publicKey}/raffles/favourite`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
