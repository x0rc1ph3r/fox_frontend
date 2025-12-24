import { RafflesData } from "../data/raffles-data";
import { getRaffleById, getRaffles } from "./routes/raffleRoutes";
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
  let filteredData = await getRaffles(pageParam, pageSize);
  filteredData = filteredData.raffles;
  if (filter === "Featured") filteredData = filteredData.filter((r: any) => r.isFavorite);
  if (filter === "All Raffles") filteredData = filteredData.filter((r:any) => r.state.toLowerCase() === "active");
  if (filter === "Past Raffles") filteredData = filteredData.filter((r: any) => r.state === "failedEnded" || r.state === "successEnded");
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: filteredData,
        nextPage: filteredData.length < pageSize ? null : pageParam + 1,
      });
    }, 500); 
  });
};


export const fetchRaffleById = async(raffleId:string)=>{
  const response = await getRaffleById(raffleId);
  console.log("response",response.raffle);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(response.raffle);
    }, 500);
  });
}