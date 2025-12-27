import {useMutation, useQueryClient} from "@tanstack/react-query";
import { toggleAuctionFavourite, toggleGumballFavourite, toggleRaffleFavourite} from "../api/routes/userRoutes"

export const useToggleFavourite = (publicKey:string)=>{
    const queryClient = useQueryClient();
    const favouriteRaffle = useMutation({
        mutationKey:["favourite-raffle"],
        mutationFn:async (args:{
            raffleId:number
        })=>{
            await toggleRaffleFavourite(args.raffleId.toString());
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["favourite-raffle",publicKey]});
            console.log("Toggle favourite raffle successful");
        },
        onError:(error)=>{
            console.error(error);
        }
    })

    const favouriteGumball = useMutation({
        mutationKey:["favourite-gumball"],
        mutationFn:async (args:{
            gumballId:number
        })=>{
            await toggleGumballFavourite(args.gumballId.toString());
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["favourite-gumball",publicKey]});
            console.log("Toggle favourite gumball successful");
        },
        onError:(error)=>{
            console.error(error);
        }
    })
    const favouriteAuction = useMutation({
        mutationKey:["favourite-auction"],
        mutationFn:async (args:{
            auctionId:number
        })=>{
            await toggleAuctionFavourite(args.auctionId.toString());
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["favourite-auction",publicKey]});
            console.log("Toggle favourite auction successful");
        },
        onError:(error)=>{
            console.error(error);
        }
    })
    return { favouriteRaffle, favouriteGumball, favouriteAuction };
}