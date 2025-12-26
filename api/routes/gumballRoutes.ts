import type { AddMultiplePrizesTypeBackend, AddPrizeTypeBackend, GumballBackendType } from "../../types/backend/gumballTypes";
import { api } from "..";

export const createGumballOverBackend = async(gumball:GumballBackendType)=>{
    try {
        const response = await api.post("/gumball/create", gumball,{
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

export const confirmGumballCreation = async(gumballId:string, txSignature:string)=>{
    try {
        const response = await api.post(`/gumball/confirm/${gumballId}`,{
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

export const deleteGumballOverBackend = async(gumballId:string)=>{
    try {
        const response = await api.delete(`/gumball/delete/${gumballId}`,{
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addSinglePrizeToGumball = async(gumballId:string, prize:AddPrizeTypeBackend)=>{
    try {
        const response = await api.post(`/gumball/addprize/${gumballId}`, prize,{
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }

}

export const addMultiplePrizesToGumball = async(gumballId:string, prizes:AddMultiplePrizesTypeBackend)=>{
    try {
        const response = await api.post(`/gumball/addprizes/${gumballId}`, prizes,{
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const cancelGumballOverBackend = async(gumballId:string,txSignature:string)=>{
    try {
        const response = await api.post(`/gumball/cancel/${gumballId}`,{
            txSignature
        },{
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            }
        });
        return response.data;
    } catch (error) {   
        throw error;
    }
}

export const getGumballs = async(page:number, limit:number)=>{
    try {
        const response = await api.get(`/gumball?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getGumballById = async(id:string)=>{
    try {
        const response = await api.get(`/gumball/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const prepareSpin = async(gumballId:string)=>{
    try {
        const response = await api.get(`/gumball/prepare-spin/${gumballId}`,{
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

export const spinGumball = async(gumballId:string, txSignature:string, prizeIndex:number)=>{
    try {
        const response = await api.post(`/gumball/spin/${gumballId}`,{
            txSignature,
            prizeIndex
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

export const claimPrize = async(gumballId:string, txSignature:string, prizeIndex:number)=>{
    try {
        const response = await api.post(`/gumball/claim-prize/${gumballId}`,{
            txSignature,
            prizeIndex
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
