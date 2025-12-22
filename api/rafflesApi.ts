import { RafflesData } from "../data/raffles-data";
import { getRaffles } from "./routes/raffleRoutes";
interface RafflesPage {
  items: typeof RafflesData[number][];
  nextPage: number | null;
}

export const fetchRaffles = async ({
  pageParam = 1,
  filter = "Featured",
}: {
  pageParam?: number;
  filter?: string;
}): Promise<RafflesPage> => {
  const pageSize = 8;
  let filteredData = RafflesData;

  if (filter === "Featured") filteredData = RafflesData.filter((r) => r.isFavorite);
  if (filter === "All Raffles") filteredData = RafflesData;
  if (filter === "Past Raffles") 
    filteredData = RafflesData.filter((r) => (r.totalTickets - r.soldTickets) < 1);
  const pageItems = filteredData.slice((pageParam - 1) * pageSize, pageParam * pageSize);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: pageItems,
        nextPage: pageItems.length < pageSize ? null : pageParam + 1,
      });
    }, 500); 
  });
};
