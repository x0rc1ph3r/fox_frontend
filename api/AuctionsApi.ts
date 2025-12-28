import { getAuctionById, getAuctions } from "./routes/auctionRoutes";
import type { AuctionTypeBackend } from "../types/backend/auctionTypes";

interface AuctionsPage {
  items: AuctionTypeBackend[];
  nextPage: number | null;
}

export const fetchAuctions = async ({
  pageParam = 1,
  filter = "All Auctions",
}: {
  pageParam?: number;
  filter?: string;
}): Promise<AuctionsPage> => {
  const pageSize = 8;
  const response = await getAuctions(pageParam, pageSize);
  const now = new Date();
  let filteredData: AuctionTypeBackend[] = response.auctions || [];

  if (filter === "All Auctions") {
    filteredData = filteredData.filter((r: AuctionTypeBackend) => r.startsAt < now && r.endsAt > now);
  }
  else if (filter === "Past Auctions") {
    filteredData = filteredData.filter((r: AuctionTypeBackend) => r.endsAt < now);
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


export const fetchAuctionById = async(id:string)=>{
  const response = await getAuctionById(id);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(response.auction);
    }, 500);
  });
};