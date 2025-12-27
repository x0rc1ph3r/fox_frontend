import { useQuery } from "@tanstack/react-query";
import { getAuctionFavourite, getGumballFavourite, getRaffleFavourite } from "../api/routes/userRoutes";
export const useQueryFavourites = (publicKey:string) => {
    const getFavouriteRaffle = useQuery({
        queryKey:["favourite-raffle",publicKey],
        queryFn:async ()=>{
            const response = await getRaffleFavourite(publicKey);
            return response.raffles;
        },
        enabled: !!publicKey,
        staleTime: 60000,
    })
    const getFavouriteGumball = useQuery({
        queryKey:["favourite-gumball",publicKey],
        queryFn:async ()=>{
            const response = await getGumballFavourite(publicKey);
            return response.gumballs;
        },
        enabled: !!publicKey,
        staleTime: 60000,
    })
    const getFavouriteAuction = useQuery({
        queryKey:["favourite-auction",publicKey],
        queryFn:async ()=>{
            const response = await getAuctionFavourite(publicKey);
            return response.auctions;
        },
        enabled: !!publicKey,
        staleTime: 60000,
    })
    return { getFavouriteRaffle, getFavouriteGumball, getFavouriteAuction };
}