import {useQuery} from "@tanstack/react-query";
import { getWinnningNotifications } from "../api/routes/notificationRoutes";
import {useWallet} from "@solana/wallet-adapter-react";
import { useNavbarStore } from "../store/globalStore";
import { useCheckAuth } from "./useCheckAuth";

export const useNotificationQuery =  ()=>{
    const {publicKey} = useWallet();
    const { isAuth } = useNavbarStore();
    const currentWallet = publicKey?.toBase58() ?? "";
    const { checkAndInvalidateToken } = useCheckAuth();
    
    const isReady = isAuth && !!publicKey;

    const isValidToken = async () => {
      if(!publicKey){
        return false;
      }
      return await checkAndInvalidateToken(publicKey.toBase58());
    }
    return useQuery({
        queryKey: ["notification", currentWallet],
        queryFn: async () => {
          if(!await isValidToken()){
            throw new Error("Invalid token");
          }
          const data = await getWinnningNotifications();
          return data;
        },
        enabled: isReady,
        staleTime: 60000,
        refetchInterval: isReady ? 60000 : false
      })
}