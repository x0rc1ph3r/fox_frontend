import type { GumballBackendType } from "../../types/backend/gumballTypes";
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