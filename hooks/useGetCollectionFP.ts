import { useQueries } from "@tanstack/react-query";
import { VerifiedNftCollections } from "../src/utils/verifiedNftCollections";
import { NETWORK } from "@/constants";
import { getCollectionFP } from "../api/routes/raffleRoutes";

interface CollectionFloorPrice {
    address: string;
    name: string;
    floorPrice: number | null;
    isLoading: boolean;
    error: Error | null;
}

export const useGetCollectionFP = () => {
    const fetchCollectionFP = async (collectionAddress: string) => {
        try {
            // if(NETWORK === "devnet") {
            //     return 0;
            // }
            const symbol = VerifiedNftCollections.find((collection) => collection.address === collectionAddress)?.symbol;
            if(!symbol) {
                return 0;
            }
            console.log("symbol", symbol);
            const response = await getCollectionFP(symbol);
            console.log("response", response);
            return response.floorPrice;
        } catch (error) {
            console.error(`Error fetching floor price for ${collectionAddress}:`, error);
            throw error;
        }
    };

    const queries = useQueries({
        queries: VerifiedNftCollections.map((collection) => ({
            queryKey: ['collectionFP', collection.address],
            queryFn: async () => await fetchCollectionFP(collection.address),
            staleTime: 1000 * 60 * 60 * 24, 
            cacheTime: 1000 * 60 * 60 * 24,
            retry: 2,
            refetchOnWindowFocus: false,
        })),
    });

    const collectionFPs: CollectionFloorPrice[] = queries.map((query, index) => ({
        address: VerifiedNftCollections[index].address,
        name: VerifiedNftCollections[index].name,
        floorPrice: query.data as number | null,
        isLoading: query.isLoading,
        error: query.error as Error | null,
    }));

    const collectionFPMap = collectionFPs.reduce((acc, collection) => {
        acc[collection.address] = collection.floorPrice;
        return acc;
    }, {} as Record<string, number | null>);

    const isLoading = queries.some((query) => query.isLoading);
    const isAllLoading = queries.every((query) => query.isLoading);

    const hasError = queries.some((query) => query.error);

    return {
        collectionFPs,
        collectionFPMap,
        isLoading,
        isAllLoading,
        hasError,
        refetchAll: () => queries.forEach((query) => query.refetch()),
    };
};