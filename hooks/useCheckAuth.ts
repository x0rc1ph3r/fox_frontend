import { jwtDecode } from 'jwt-decode';
import { useWallet } from '@solana/wallet-adapter-react';
import {requestMessage, verifyMessage} from '../api/routes/userRoutes';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
interface DecodedToken {
    publicKey: string;
    userId: string;
    exp: number;
}
export const useCheckAuth = () => {
   const token = localStorage.getItem('authToken');
   const {publicKey,signMessage} = useWallet();

   const getTokenDetails =():DecodedToken | null => {   
    if (!token) return null;
    return jwtDecode<DecodedToken>(token);
    }

const checkAndInvalidateToken = async (publicKey:string):Promise<boolean> => {
    if(!publicKey) {
        throw new Error("Public key is required");
    };
    const tokenDetails = getTokenDetails();
    if(tokenDetails && tokenDetails?.publicKey !== publicKey){
        localStorage.removeItem('authToken');
    }
    if(tokenDetails && tokenDetails?.publicKey === publicKey){
      return true;
    }
    const message = await requestMessage(publicKey);
    const result = await signAndVerifyMessage(message.message);
    if(!result.success){
        localStorage.removeItem('authToken');
        console.error("Invalid token");
        return false;
    } 
    return true;
}
const signAndVerifyMessage = async ( message: string) => {
    try {
        if(!publicKey || !signMessage){
            throw new Error("Wallet not connected");
        }
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const data = await verifyMessage(publicKey.toBase58(), message, bs58.encode(signature));
      
      if(!data.error && data.token){
        localStorage.setItem('authToken', data.token.toString());
        return { data, success: true };
      }
      return { data, success: false };
    } catch (error) {
      console.error("Error signing and verifying message:", error);
      return { data: null, success: false };
    }
  };
  return {checkAndInvalidateToken};
}