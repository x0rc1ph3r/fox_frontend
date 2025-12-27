import { useQuery } from "@tanstack/react-query";
import {
  getAuctionCreated,
  getAuctionFavourite,
  getAuctionPurchased,
  getGumballCreated,
  getGumballFavourite,
  getGumballPurchased,
  getProfileAuctionStats,
  getProfileGumballStats,
  getProfileRaffleStats,
  getRaffleCreated,
  getRaffleFavourite,
  getRafflePurchased,
} from "../api/routes/userRoutes";

export const useProfileStats = (publicKey: string) => {
  const getRaffleStats = useQuery({
    queryKey: ["profile-raffle-stats"],
    queryFn: async () => {
      const raffleStats = await getProfileRaffleStats(publicKey);
      return raffleStats;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });
  const getGumballStats = useQuery({
    queryKey: ["profile-gumball-stats"],
    queryFn: async () => {
      const gumballStats = await getProfileGumballStats(publicKey);
      return gumballStats;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });
  const getAuctionStats = useQuery({
    queryKey: ["profile-auction-stats"],
    queryFn: async () => {
      const auctionStats = await getProfileAuctionStats(publicKey);
      return auctionStats;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });
  const getRaffleCreatedCards = useQuery({
    queryKey: ["profile-raffle-created"],
    queryFn: async () => {
      const raffleCreated = await getRaffleCreated(publicKey);
      return raffleCreated.raffles;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });
  const getRafflePurchasedCards = useQuery({
    queryKey: ["profile-raffle-purchased"],
    queryFn: async () => {
      const rafflePurchased = await getRafflePurchased(publicKey);
      return rafflePurchased.raffles;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });
  const getRaffleFavouriteCards = useQuery({
    queryKey: ["profile-raffle-favourite"],
    queryFn: async () => {
      const raffleFavourite = await getRaffleFavourite(publicKey);
      return raffleFavourite.raffles;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });

  const getGumballCreatedCards = useQuery({
    queryKey: ["profile-gumball-created"],
    queryFn: async () => {
      const gumballCreated = await getGumballCreated(publicKey);
      return gumballCreated.gumballs;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });
  const getGumballPurchasedCards = useQuery({
    queryKey: ["profile-gumball-purchased"],
    queryFn: async () => {
      const gumballPurchased = await getGumballPurchased(publicKey);
      return gumballPurchased.gumballs;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });
  const getGumballFavouriteCards = useQuery({
    queryKey: ["profile-gumball-favourite"],
    queryFn: async () => {
      const gumballFavourite = await getGumballFavourite(publicKey);
      return gumballFavourite.gumballs;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });
  const getAuctionCreatedCards = useQuery({
    queryKey: ["profile-auction-created"],
    queryFn: async () => {
      const auctionCreated = await getAuctionCreated(publicKey);
      return auctionCreated.auctions;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });
  // const getAuctionPurchasedCards = useQuery({
  //   queryKey: ["profile-auction-purchased"],
  //   queryFn: async () => {
  //     const auctionPurchased = await getAuctionPurchased(publicKey);
  //     return auctionPurchased.auctions;
  //   },
  //   enabled: !!publicKey,
  //   staleTime: 60000,
  // });
  const getAuctionFavouriteCards = useQuery({
    queryKey: ["profile-auction-favourite"],
    queryFn: async () => {
      const auctionFavourite = await getAuctionFavourite(publicKey);
      return auctionFavourite.auctions;
    },
    enabled: !!publicKey,
    staleTime: 60000,
  });
  return {
    getRaffleStats,
    getGumballStats,
    getAuctionStats,
    getRaffleCreatedCards,
    getRafflePurchasedCards,
    getRaffleFavouriteCards,
    getGumballCreatedCards,
    getGumballPurchasedCards,
    getGumballFavouriteCards,
    getAuctionCreatedCards,
    // getAuctionPurchasedCards,
    getAuctionFavouriteCards,
  };
};
