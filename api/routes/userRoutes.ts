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