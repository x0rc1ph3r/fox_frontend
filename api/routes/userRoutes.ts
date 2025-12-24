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