/* eslint-disable @typescript-eslint/no-unused-vars */
import { createFileRoute, Link } from "@tanstack/react-router";
import FeaturedSwiper from "../../components/home/FeaturedSwiper";
import SortDropdown from "../../components/home/SortDropdown";
import SearchBox from "../../components/home/SearchBox";
import { CryptoCard } from "../../components/common/CryptoCard";
import InfiniteScroll from "react-infinite-scroll-component";
import FilterModel from "../../components/home/FilterModel";
import { useRafflesStore } from "../../../store/rafflesStore";
import { useRaffles } from "../../../hooks/useRaffles";
import { useEffect, useMemo, useState } from "react";
import CryptoCardSkeleton from "@/components/skeleton/RafflesCardSkeleton";
import { TryToolsSection } from "@/components/home/TryToolsSection";
import { ToolsSection } from "@/components/home/ToolsSection";
import { useGlobalStore } from "../../../store/globalStore";
import { useRaffleAnchorProgram } from "hooks/useRaffleAnchorProgram";
import type { RaffleTypeBackend } from "types/backend/raffleTypes";
import { useBuyRaffleTicketStore } from "store/buyraffleticketstore";
import { NoRaffles } from "@/components/home/NoRaffles";
import { BN } from "@coral-xyz/anchor";
import { useQuery } from "@tanstack/react-query";

const sortingOptions = [
  { label: "Recently Added", value: "Recently Added" },
  { label: "Expiring Soon", value: "Expiring Soon" },
  { label: "Selling out soon", value: "Selling out soon" },
  { label: "Price: Low to High", value: "Price: Low to High" },
  { label: "Price: High to Low", value: "Price: High to Low" },
  { label: "TTV/Floor: Low to High", value: "TTV/Floor: Low to High" },
  { label: "TTV/Floor: High to Low", value: "TTV/Floor: High to Low" },
  { label: "Floor: Low to High", value: "Floor: Low to High" },
  { label: "Floor: High to Low", value: "Floor: High to Low" },
];

export const Route = createFileRoute("/raffles/")({
  component: RafflesPage,
});

function RafflesPage() {
  const { filter, setFilter } = useRafflesStore();
    const { data, fetchNextPage, hasNextPage, isLoading,isError,error } = useRaffles(filter);
    const { sort, setSort } = useGlobalStore();
    const { getAllRaffles, getRaffleConfig, getRaffleById } = useRaffleAnchorProgram();
    const { ticketQuantityById, setTicketQuantityById, getTicketQuantityById } = useBuyRaffleTicketStore();
    const [filters, setFilters] = useState<string[]>([]);
    
    const testRaffleById = useQuery(getRaffleById(39));
    
    const raffles = useMemo(() => 
      data?.pages.map((p) => p.items).flat() as unknown as RaffleTypeBackend[],
      [data]
    );
    const activeFilters = [
      { id: "all", label: "All Raffles" },
      { id: "past", label: "Past Raffles" },
    ];
    useEffect(()=>{
      if(raffles){
        raffles.map((r)=>{
          if(getTicketQuantityById(r.id || 0) === 0){
            setTicketQuantityById(r.id || 0,1);
          }
        });
      }
    }, [raffles]);
  return (
    <main className="flex-1 font-inter">
      <section className="w-full md:pt-0 pt-5">
        <div className="w-full max-w-[1440px] md:px-5 px-4 mx-auto">
          <Link
            to={"/"}
            className="md:text-base text-sm md:font-normal font-semibold transition duration-500 hover:opacity-90 bg-primary-color py-2.5 md:py-3 px-8 items-center justify-center text-black-1000 text-center md:hidden inline-flex w-full font-inter rounded-full"
          >
            Buy tickets, earn Juice! 🥤
          </Link>
          {/* <div className="p-10 pb-2 md:pt-10 pt-5 px-0 border border-gray-1100 rounded-[30px] bg-gray-1300 mt-5 relative">
            <div className="absolute top-10 left-0 w-full hidden md:block h-[150px] bg-linear-to-b from-gray-1300 to-transparent pointer-events-none"></div>
            <div className="w-full md:px-10 px-4 flex items-center justify-between relative xl:pb-0 pb-0 md:pb-10">
              <p className="md:text-base text-sm bg-gray-1400 py-2.5 md:py-3 px-8 text-black-1000 text-center items-center justify-center inline-flex font-semibold font-inter rounded-full md:w-auto w-full">
                Featured Ending Soon ⚡
              </p>
              <Link
                to={"/"}
                className="text-base transition duration-500 hover:opacity-90 bg-primary-color py-3 px-8 text-black-1000 text-center hidden md:inline-flex font-inter rounded-full"
              >
                Buy tickets, earn Juice! 🥤
              </Link>
            </div>
            <h1 className="xl:text-[150px] text-[48px] xs:text-[54px] md:text-8xl lg:text-[120px] px-0 md:px-10 font-bold font-inter text-center bg-linear-to-t from-gray-1200/80 to-white bg-clip-text text-transparent md:whitespace-normal xs:whitespace-nowrap">
              Fox9 Featured
            </h1>
            <FeaturedSwiper />
          </div> */}
        </div>
      </section>

      <TryToolsSection />

      <ToolsSection />

      <section className="w-full pt-10 md:pt-[122px] pb-10 md:pb-[90px]">
        <div className="w-full max-w-[1440px] px-4 md:px-5 mx-auto">
          <div className="w-full flex items-center justify-between gap-5 lg:gap-10 flex-wrap">
            <ul className="flex items-center md:gap-5 gap-1.5 xs:gap-3">
              {["Featured", "All Raffles", "Past Raffles"].map((f, index) => (
                <li key={index}>
                  <button
                    onClick={() => setFilter(f)}
                    className={`md:text-base text-sm cursor-pointer font-inter font-medium transition duration-300 hover:bg-primary-color text-black-1000 rounded-full py-2.5 md:py-3.5 px-4
                 ${filter === f ? "bg-primary-color" : "bg-gray-1400"}`}
                  >
                    {" "}
                    {f}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex lg:justify-end gap-1.5 xs:gap-3 md:gap-5">
              <SearchBox
                onSearch={(value) => {
                  console.log("Searching for:", value);
                }}
              />

              <SortDropdown
                options={sortingOptions}
                selected={sort}
                onChange={(value) => {
                  setSort(value);
                  console.log("Selected sort option:", value);
                }}
              />
              <FilterModel />
            </div>
          </div>

          <div className="md:py-10 pt-10 overflow-x-auto pb-0 flex items-center gap-4">
            <div className="hidden items-center gap-4">
              {activeFilters.length > 0 && (
                <>
                  <p className="md:text-base text-sm whitespace-nowrap font-black-1000 font-semibold font-inter">
                    Filters :
                  </p>

                  <ul className="flex items-center gap-4">
                    <li>
                      <div className="border group hover:border-black-1000 transition duration-200 h-12 inline-flex items-center justify-center rounded-full border-gray-1100 px-5 py-3 gap-2">
                        <p className="md:text-base whitespace-nowrap text-sm font-inter font-medium text-black-1000">
                          Clear All
                        </p>
                        <button
                          onClick={() => setFilter("")}
                          className="cursor-pointer"
                        >
                          <img
                            src="/icons/cross-icon.svg"
                            className="min-w-4"
                            alt="cross icon"
                          />
                        </button>
                      </div>
                    </li>

                    {activeFilters.map((filterItem) => (
                      <li key={filterItem.id}>
                        <div className="border group hover:border-black-1000 transition duration-200 h-12 inline-flex items-center justify-center rounded-full border-gray-1100 px-5 py-3 gap-2">
                          <p className="md:text-base whitespace-nowrap text-sm font-inter font-medium text-black-1000">
                            {filterItem.label}
                          </p>
                          <button
                            onClick={() =>
                              setFilters(
                                filters.filter((f) => f !== filterItem.id)
                              )
                            }
                            className="cursor-pointer"
                          >
                            <img
                              src="/icons/cross-icon.svg"
                              className="min-w-4"
                              alt="remove icon"
                            />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <CryptoCardSkeleton key={i} />
                ))}
            </div>
          ) : raffles && raffles?.length > 0 ? (
            <InfiniteScroll
              dataLength={raffles?.length || 0}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={
                <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4 mt-5">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <CryptoCardSkeleton key={i} />
                    ))}
                </div>
              }
            >
              <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4">
                {raffles?.map((r) => (
                  <CryptoCard rafflesType={filter} key={r.id} raffle={r as unknown as RaffleTypeBackend} soldTickets={r.ticketSold!} />
                ))}
              </div>
            </InfiniteScroll>
          ) : (
            <NoRaffles />
          )}
        </div>
      </section>
    </main>
  );
}

export default RafflesPage;
