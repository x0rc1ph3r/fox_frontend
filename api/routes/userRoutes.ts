import type { RaffleTypeBackend } from "types/backend/raffleTypes";
import { api } from "..";
import type { GumballBackendDataType } from "types/backend/gumballTypes";
import type { AuctionTypeBackend } from "types/backend/auctionTypes";

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
        const response = await api.get(`/user/profile/${publicKey}/raffles/favourites`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


//gumball profile routes

export const getGumballCreated = async (publicKey:string): Promise<{message:string, gumballs:GumballBackendDataType[]}> => {
    try {
        const response = await api.get(`/user/profile/${publicKey}/gumballs/created`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getGumballPurchased = async (publicKey:string): Promise<{message:string, gumballs:GumballBackendDataType[]}> => {
    try {
        const response = await api.get(`/user/profile/${publicKey}/gumballs/purchased`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getGumballFavourite = async (publicKey:string): Promise<{message:string, gumballs:GumballBackendDataType[]}> => {
    try {
        const response = await api.get(`/user/profile/${publicKey}/gumballs/favourites`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//auction profile routes

export const getAuctionCreated = async (publicKey:string): Promise<{message:string, auctions:AuctionTypeBackend[]}> => {
    try {
        const response = await api.get(`/user/profile/${publicKey}/auctions/created`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getAuctionPurchased = async (publicKey:string): Promise<{message:string, auctions:AuctionTypeBackend[]}> => {
    try {
        const response = await api.get(`/user/profile/${publicKey}/auctions/participated`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getAuctionFavourite = async (publicKey:string): Promise<{message:string, auctions:AuctionTypeBackend[]}> => {
    try {
        const response = await api.get(`/user/profile/${publicKey}/auctions/favourites`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const toggleRaffleFavourite = async (raffleId:string)=>{
    try {
        const response = await api.post(`/user/favourites/raffle/${raffleId}`, {}, {
            headers:{
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

export const toggleGumballFavourite = async (gumballId:string)=>{
    try {
        const response = await api.post(`/user/favourites/gumball/${gumballId}`, {}, {
            headers:{
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

export const toggleAuctionFavourite = async (auctionId:string)=>{
    try {
        const response = await api.post(`/user/favourites/auction/${auctionId}`, {}, {
            headers:{
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