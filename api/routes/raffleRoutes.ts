import {api} from "..";
import type { RaffleTypeBackend } from "../../types/backend/raffleTypes";

export const getRaffles = async(page:number, limit:number)=>{
    try {
        const response = await api.get(`/raffle?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const createRaffleOverBackend = async(raffle:RaffleTypeBackend)=>{
    try {
        const response = await api.post("/raffle/create", raffle,{
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

export const verifyRaffleCreation = async(raffleId:string, txSignature:string)=>{
    try {
        const response = await api.post(`/raffle/confirm/${raffleId}`,{
            txSignature
        },{
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
 
export const getRaffleById = async(raffleId:string)=>{
    try {
        const response = await api.get(`/raffle/${raffleId}`);
        console.log("response",response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const buyRaffleTicket = async(raffleId:string,txSignature:string, ticketsToBuy:number)=>{
    try {
        const response = await api.post(`/raffle/buy/${raffleId}`,{
            quantity:ticketsToBuy,
            txSignature,
        },{
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

export const deleteRaffle = async(raffleId:string)=>{
    try{
        const response = await api.delete(`/raffle/delete/${raffleId}`,{
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
export const cancelRaffleOverBackend = async(raffleId:string,txSignature:string)=>{
    try {
        const response = await api.post(`/raffle/cancel/${raffleId}`,{
            txSignature
        },{
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

export const claimRafflePrize = async(raffleId:string,txSignature:string)=>{
    try {
        const response = await api.post(`/raffle/claim/${raffleId}`,{
            txSignature
        },{
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

export const getRaffleWinnersWhoClaimedPrize = async(raffleId:string)=>{
    try {
        const response = await api.get(`/raffle/winners/claim/${raffleId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}