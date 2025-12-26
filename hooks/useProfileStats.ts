import { useQuery } from "@tanstack/react-query";
import {
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
  return {
    getRaffleStats,
    getGumballStats,
    getAuctionStats,
    getRaffleCreatedCards,
    getRafflePurchasedCards,
    getRaffleFavouriteCards,
  };
};
