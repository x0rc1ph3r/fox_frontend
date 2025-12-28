import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useEffect } from "react";
import SearchBox from "../../components/home/SearchBox";
import SortDropdown from "../../components/home/SortDropdown";
import FilterModel from "../../components/home/FilterModel";
import FeaturedSwiper from "../../components/gumballs/FeaturedSwiper";
import { GumballsCard } from "../../components/gumballs/GumballsCard";
import { ToolsSection } from "@/components/home/ToolsSection";
import { TryToolsSection } from "@/components/home/TryToolsSection";
import { useRafflesStore } from "../../../store/gumballs-store";
import { useGumballsQuery } from "../../../hooks/useGumballsQuery";
import { useGlobalStore } from "../../../store/globalStore";
import CryptoCardSkeleton from "@/components/skeleton/RafflesCardSkeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import { NoGumballs } from "../../components/home/NoGumballs";
import { useFiltersStore } from "../../../store/filters-store";
import { sortGumballs, filterGumballs, getActiveFiltersList, hasActiveFilters, type PageType } from "../../utils/sortAndFilter";
import type { GumballBackendDataType } from "../../../types/backend/gumballTypes";

export const Route = createFileRoute("/gumballs/")({
  component: Gumballs,
});

const options = [
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

function Gumballs() {
  const { filter, setFilter } = useRafflesStore();
  const { data, fetchNextPage, hasNextPage, isLoading } =
    useGumballsQuery(filter);
  const { sort, setSort, searchQuery, setSearchQuery } = useGlobalStore();

  const {
    raffleType,
    selectedToken,
    selectedCollection,
    floorMin,
    floorMax,
    endTimeAfter,
    endTimeBefore,
    filtersApplied,
    clearFilter,
    resetFilters,
    setPageType,
  } = useFiltersStore();

  useEffect(() => {
    setPageType("gumballs");
  }, [setPageType]);

  const filterOptions = {
    raffleType,
    selectedToken,
    selectedCollection,
    floorMin,
    floorMax,
    endTimeAfter,
    endTimeBefore,
  };

  const activeFilters = useMemo(() => {
    return getActiveFiltersList(filterOptions, "gumballs");
  }, [raffleType, selectedToken, selectedCollection, floorMin, floorMax, endTimeAfter, endTimeBefore]);

  const showActiveFilters = hasActiveFilters(filterOptions, "gumballs");

  const gumballs = useMemo(() => {
    let allGumballs = (data?.pages.flatMap((p) => p.items) || []) as GumballBackendDataType[];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      allGumballs = allGumballs.filter((gumball) =>
        gumball.name?.toLowerCase().includes(query)
      );
    }

    if (filtersApplied && showActiveFilters) {
      allGumballs = filterGumballs(allGumballs, filterOptions);
    }

    if (sort && sort !== "Sort") {
      allGumballs = sortGumballs(allGumballs, sort);
    }

    return allGumballs;
  }, [data, searchQuery, sort, filtersApplied, raffleType, selectedToken, selectedCollection, floorMin, floorMax, endTimeAfter, endTimeBefore]);

  useEffect(() => {
    setSearchQuery("");
  }, []);

  return (
    <main className="main font-inter">
      {/* <section className="w-full md:pt-0 pt-5">
       
        <div className="w-full max-w-[1440px] px-5 mx-auto">
             <Link
            to={"/"}
            className="md:text-base text-sm md:font-normal font-semibold transition duration-500 hover:opacity-90 bg-primary-color py-2.5 md:py-3 px-8 items-center justify-center text-black-1000 text-center md:hidden inline-flex w-full font-inter rounded-full"
          >
            Buy tickets, earn Juice! 🥤
          </Link>
          <div className="p-10 pb-2 overflow-x-hidden md:pt-10 pt-5 px-0 border border-gray-1100 rounded-[30px] bg-gray-1300 mt-5 relative">
            <div className="absolute top-10 left-0 w-full hidden md:block h-[150px] bg-linear-to-b from-gray-1300 to-transparent pointer-events-none"></div>
            <div className="w-full md:px-10 px-4 flex items-center justify-between relative xl:pb-0 pb-0 md:pb-10">
              <p className="md:text-base text-sm bg-gray-1400 py-2.5 md:py-3 px-8 text-black-1000 text-center items-center justify-center inline-flex font-semibold font-inter rounded-full md:w-auto w-full">Featured Top EV</p>
              <Link to={"/"}  className="text-base transition duration-500 hover:opacity-90 bg-primary-color py-3 px-8 text-black-1000 text-center hidden md:inline-flex font-inter rounded-full">Buy tickets, earn Juice! 🥤</Link>
            </div>
             <h1 className="xl:text-[150px] whitespace-nowrap text-[48px] xs:text-[54px] md:text-8xl lg:text-[120px] px-0 md:px-10 font-bold font-inter text-center bg-linear-to-t from-gray-1200/80 to-white bg-clip-text text-transparent md:whitespace-normal xs:whitespace-nowrap">Featured Top EV</h1>
            <FeaturedSwiper/>
          </div>
        </div>
      </section> */}

      <TryToolsSection />

      <ToolsSection />

      <section className="w-full pt-10 md:pt-[122px] pb-10 md:pb-[90px]">
        <div className="w-full max-w-[1440px] px-5 mx-auto">
          <div className="flex-1 flex items-center justify-between lg:gap-10 gap-5 flex-col lg:flex-row">
            <div className="overflow-x-auto md:overflow-hidden lg:w-1/2 w-full">
              <ul className="flex items-center sm:justify-center md:justify-start justify-start md:gap-5 gap-3">
                {["Featured", "All Gumballs", "Past Gumballs"].map(
                  (f, index) => (
                    <li key={index}>
                      <button
                        onClick={() => setFilter(f)}
                        className={`md:text-base whitespace-nowrap text-sm cursor-pointer font-inter font-medium transition duration-300 hover:bg-primary-color text-black-1000 rounded-full py-2.5 md:py-3.5 px-4
                        ${filter === f ? "bg-primary-color" : "bg-gray-1400"}`}
                      >
                        {" "}
                        {f}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="flex justify-end md:gap-5 gap-3">
              <SearchBox
                placeholder="Search gumballs..."
                value={searchQuery}
                onSearch={(value) => {
                  setSearchQuery(value);
                }}
              />
              <SortDropdown
                options={options}
                selected={sort}
                onChange={(value) => {
                  setSort(value);
                  console.log("Selected sort option:", value);
                }}
              />
              <FilterModel />
            </div>
          </div>

          {/* Filters List */}
          <div className="lg:py-10 py-5 flex items-center gap-4">
            <div className={`w-full overflow-x-auto items-center gap-4 ${showActiveFilters ? 'flex' : 'hidden'}`}>
              {showActiveFilters && (
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
                          onClick={() => resetFilters()}
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
                            onClick={() => clearFilter(filterItem.id)}
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
          ) : gumballs.length > 0 ? (
            <InfiniteScroll
              dataLength={gumballs.length}
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
                {gumballs.map((r) => (
                  <GumballsCard key={r.id} gumball={r} />
                ))}
              </div>
            </InfiniteScroll>
          ) : (
            <NoGumballs />
          )}
        </div>
      </section>
    </main>
  );
}
