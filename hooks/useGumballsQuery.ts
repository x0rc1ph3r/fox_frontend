import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { fetchGumballById, fetchGumballs } from "../api/GumballsApi"

export const useGumballsQuery = (filter: string) => {
  return useInfiniteQuery({
    queryKey: ["gumballs", filter],
    queryFn: ({ pageParam = 1 }) => fetchGumballs({ pageParam, filter }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  })
}

export const useGumballById = (id:string) => {
  return useQuery({
    queryKey: ["gumball", id],
    queryFn: () => {
      console.log("id",id);
      const data = fetchGumballById(id);
      console.log("data",data);
      return data;
    },
  })
}