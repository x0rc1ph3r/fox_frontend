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