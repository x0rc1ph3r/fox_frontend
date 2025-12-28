import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchAuctions } from "../api/AuctionsApi"

export const useAuctionsQuery = (filter: string) => {
  return useInfiniteQuery({
    queryKey: ["auctions", filter],
    queryFn: ({ pageParam = 1 }) => fetchAuctions({ pageParam, filter }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  })
}
