import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useEffect } from "react";
import SearchBox from "../../components/home/SearchBox";
import SortDropdown from "../../components/home/SortDropdown";
import FilterModel from "../../components/home/FilterModel";
import { NoAuctions } from "../../components/auctions/NoAuctions";
import { AuctionsCard } from "../../components/auctions/AuctionsCard";
import { useAuctionsStore } from "store/auctions-store";
import { useAuctionsQuery } from "hooks/useAuctionsQuery";
import { useGlobalStore } from "store/globalStore";
import CryptoCardSkeleton from "@/components/skeleton/RafflesCardSkeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import { useFiltersStore } from "../../../store/filters-store";
import {
  sortAuctions,
  filterAuctions,
  getActiveFiltersList,
  hasActiveFilters,
  type AuctionItem,
} from "../../utils/sortAndFilter";

const options = [
  { label: "Recently Added", value: "Recently Added" },
  { label: "Expiring Soon", value: "Expiring Soon" },
  { label: "Price: Low to High", value: "Price: Low to High" },
  { label: "Price: High to Low", value: "Price: High to Low" },
  { label: "Floor: Low to High", value: "Floor: Low to High" },
  { label: "Floor: High to Low", value: "Floor: High to Low" },
];

export const Route = createFileRoute("/auctions/")({
  component: Auctions,
});

function Auctions() {
  const { filter, setFilter } = useAuctionsStore();
  const { data, fetchNextPage, hasNextPage, isLoading } =
    useAuctionsQuery(filter);
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
    setPageType("auctions");
  }, [setPageType]);

  const filterOptions = useMemo(
    () => ({
      raffleType,
      selectedToken,
      selectedCollection,
      floorMin,
      floorMax,
      endTimeAfter,
      endTimeBefore,
    }),
    [
      raffleType,
      selectedToken,
      selectedCollection,
      floorMin,
      floorMax,
      endTimeAfter,
      endTimeBefore,
    ]
  );

  const activeFilters = useMemo(() => {
    return getActiveFiltersList(filterOptions, "auctions");
  }, [filterOptions]);

  const showActiveFilters = hasActiveFilters(filterOptions, "auctions");

  const aucations = useMemo(() => {
    let allAuctions = data?.pages.flatMap((p) => p.items) || [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      allAuctions = allAuctions.filter((auction) =>
        auction.prizeName?.toLowerCase().includes(query)
      );
    }

    if (filtersApplied && showActiveFilters) {
      allAuctions = filterAuctions(
        allAuctions as AuctionItem[],
        filterOptions
      ) as typeof allAuctions;
    }

    if (sort && sort !== "Sort") {
      allAuctions = sortAuctions(
        allAuctions as AuctionItem[],
        sort
      ) as typeof allAuctions;
    }

    return allAuctions;
  }, [
    data,
    searchQuery,
    sort,
    filtersApplied,
    showActiveFilters,
    filterOptions,
  ]);

  useEffect(() => {
    setSearchQuery("");
  }, []);

  return (
    <main className="main font-inter">
      <section className="w-full lg:pt-[60px] pt-5 pb-20 md:pb-[120px]">
        <div className="w-full max-w-[1440px] px-5 mx-auto">
          <div className="w-full flex items-center justify-between gap-5 lg:gap-10 flex-wrap">
            <ul className="flex items-center gap-3 md:gap-5 md:w-auto w-full">
              {["All Auctions", "Past Auctions"].map((f, index) => (
                <li key={index} className="flex-1 md:flex-auto">
                  <button
                    onClick={() => setFilter(f)}
                    className={`md:text-base text-sm md:w-auto w-full cursor-pointer font-inter font-medium transition duration-300 hover:bg-primary-color text-black-1000 rounded-full py-2.5 md:py-3.5 px-5
                      ${filter === f ? "bg-primary-color" : "bg-gray-1400"}`}
                  >
                    {" "}
                    {f}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-start lg:justify-end gap-3.5 md:gap-5">
              <SearchBox
                placeholder="Search auctions..."
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
          <div className="lg:py-10 py-5 overflow-x-auto flex gap-4">
            <div
              className={`${showActiveFilters ? "flex" : "hidden"} items-center gap-4`}
            >
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
            <div className="flex items-center min-h-[60vh] justify-center">
              <img src="/loading-vector.svg" alt="" />
            </div>
          ) : aucations.length > 0 ? (
            <InfiniteScroll
              dataLength={aucations.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <CryptoCardSkeleton key={i} />
                    ))}
                </div>
              }
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {aucations.map((r) => (
                  <AuctionsCard key={r.id} {...r} id={r.id ?? 0} prizeName={r.prizeName ?? ""} prizeImage={r.prizeImage ?? ""} collectionName={r.collectionName ?? ""} reservePrice={r.reservePrice ?? ""} status={r.status ?? ""} />
                ))}
              </div>
            </InfiniteScroll>
          ) : (
            <NoAuctions />
          )}
        </div>
      </section>
    </main>
  );
}
