import { getGumballById, getGumballs } from "./routes/gumballRoutes";
import type { GumballBackendDataType } from "../types/backend/gumballTypes";

interface GumballsPage {
  items: GumballBackendDataType[];
  nextPage: number | null;
}

export const fetchGumballs = async ({
  pageParam = 1,
  filter = "All Gumballs",
}: {
  pageParam?: number;
  filter?: string;
}): Promise<GumballsPage> => {
  const pageSize = 8;
  const response = await getGumballs(pageParam, pageSize);
  let filteredData: GumballBackendDataType[] = response.gumballs.filter((r:GumballBackendDataType) => r.prizes.length >0 ) || [];
  
  if (filter === "All Gumballs") {
    filteredData = filteredData.filter((r) => r.status === "ACTIVE");
  } else if (filter === "Past Gumballs") {
    filteredData = filteredData.filter((r) => r.status === "COMPLETED_SUCCESSFULLY" || r.status === "COMPLETED_FAILED");
  }else{
    filteredData = []
  }

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

export const fetchGumballById = async(id:string)=>{
  const response = await getGumballById(id);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(response.gumball);
    }, 500);
  });
};