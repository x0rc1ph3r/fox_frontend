import { Button, Dialog, DialogPanel } from "@headlessui/react";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";
import { RadioGroup } from "../ui/RadioGroup";
import SelectOption from "../ui/SelectOption";
import FormInput from "../ui/FormInput";
import DateSelector from "../ui/DateSelector";
import TimeSelector from "../ui/TimeSelector";
import { useFiltersStore } from "../../../store/filters-store";
import { VerifiedTokens } from "@/utils/verifiedTokens";


interface PersonOption {
  id: number; 
  name: string;
}

const tokenOptions: PersonOption[] = VerifiedTokens.map((token, index) => ({ id: index + 1, name: token.name }));

const collectionOptions: PersonOption[] = [
  { id: 1, name: "CryptoPunks" },
  { id: 2, name: "BAYC" },
  { id: 3, name: "Azuki" },
  { id: 4, name: "Moonbirds" },
  { id: 5, name: "Doodles" },
];



export default function FilterModal() {
  const {
    isFilterOpen,
    setFilterOpen,
    pageType,

    raffleType,
    setRaffleType,

    selectedToken,
    setSelectedToken,

    selectedCollection,
    setSelectedCollection,

    floorMin,
    floorMax,
    setFloorMin,
    setFloorMax,

    endTimeAfter,
    endTimeBefore,
    setEndTimeAfter,
    setEndTimeBefore,

    resetFilters,
  } = useFiltersStore();

  const showRaffleType = pageType === "raffles";


  

  const open = () => setFilterOpen(true);
  const close = () => setFilterOpen(false);

  return (
    <>
      <Button
        onClick={open}
        className="md:px-5 py-3 md:w-auto text-gray-1200 hover:text-black-1000 hover:border-primary-color transition duration-200 justify-center h-10 md:h-12 w-10 group text-base cursor-pointer font-inter font-medium rounded-full border inline-flex items-center gap-2 border-gray-1100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          className="group-hover:text-primary-color text-black-1000"

        >
          <path
            d="M3 6.375H21M6.37493 12H17.6249M10.8749 17.625H13.1249"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="md:block hidden">Filter</span>
      </Button>

      <Dialog
        open={isFilterOpen}
        as="div"
        className="relative z-10 bg-black/80"
        onClose={close}>
        <div className="fixed inset-0 w-screen overflow-y-auto bg-black/80">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-[896px] rounded-xl bg-white">

              <div className="flex items-center justify-between border-b px-[22px] pt-6 pb-4">
                <h4 className="text-lg font-semibold">Filter</h4>
                <button onClick={close} className="cursor-pointer">
                  <img src="/icons/cross-icon.svg" alt="close" />
                </button>
              </div>

              <div className={`grid ${pageType === "auctions" ? "md:grid-cols-1" : "md:grid-cols-2"} px-4 md:px-5 border-b border-gray-1100`}>
                
                <div className={`py-[30px] ${pageType !== "auctions" ? "md:border-r border-gray-1100" : ""}`}>

                  {showRaffleType && (
                    <RadioGroup
                      name="raffles"
                      value={raffleType}
                      onChange={setRaffleType}
                      options={[
                        { label: "Token Raffles", value: "token" },
                        { label: "NFT Raffles", value: "nft" },
                      ]}
                    />
                  )}

                  <div className={`md:space-y-5 space-y-3 ${showRaffleType ? "pt-10 md:pt-[42px]" : ""} md:pr-7`}>
                    <SelectOption
                      label="Token"
                      placeholder="Search Token"
                      options={tokenOptions}
                      value={selectedToken}
                      onChange={setSelectedToken}
                    />

                    <SelectOption
                      label="Collection"
                      placeholder="Search Collection"
                      options={collectionOptions}
                      value={selectedCollection}
                      onChange={setSelectedCollection}
                    />

                    <div className="grid grid-cols-2 gap-2.5">
                      <FormInput
                        label="Floor"
                        placeholder="Min"
                        value={floorMin}
                        onChange={(e) => setFloorMin(e.target.value)}
                      />
                      <FormInput
                        placeholder="Max"
                        value={floorMax}
                        onChange={(e) => setFloorMax(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {pageType !== "auctions" && (
                  <div className="md:pt-[30px] md:pl-7">
                    <h4 className="text-base font-inter font-semibold text-black-1000">End time</h4>

                    <div className="md:space-y-5 space-y-3 md:pt-[42px] pt-5 md:pb-0 pb-[30px]">
                      <div className="grid grid-cols-2 md:flex lg:flex-row flex-row md:flex-col items-end md:gap-x-5 gap-y-5 gap-x-2.5">
                      <DateSelector
                          label="After"
                          value={new Date(endTimeAfter.date)}
                          onChange={(date: Date | null) =>
                            setEndTimeAfter(date?.toISOString() || "", endTimeAfter.time)
                          }/>
                        
                      <TimeSelector
                          hour={endTimeAfter.time.split(":")[0]}
                          minute={endTimeAfter.time.split(":")[1]}
                          period={endTimeAfter.time.split(":")[2] as "AM" | "PM"}
                          onTimeChange={(hour: string, minute: string, period: "AM" | "PM") =>
                            setEndTimeAfter(endTimeAfter.date, `${hour}:${minute}:${period}`)
                          }
                          hasValue={!!endTimeAfter.date}/>
                      </div>

                      <div className="grid grid-cols-2 md:flex lg:flex-row flex-row md:flex-col items-end md:gap-x-5 gap-y-5 gap-x-2.5">
                        <DateSelector
                          label="Before"
                          value={new Date(endTimeBefore.date)}
                          onChange={(date: Date | null) =>
                            setEndTimeBefore(date?.toISOString() || "", endTimeBefore.time)
                          }/>
                        <TimeSelector
                          hour={endTimeBefore.time.split(":")[0]}
                          minute={endTimeBefore.time.split(":")[1]}
                          period={endTimeBefore.time.split(":")[2] as "AM" | "PM"}
                          onTimeChange={(hour: string, minute: string, period: "AM" | "PM") =>
                            setEndTimeBefore(endTimeBefore.date, `${hour}:${minute}:${period}`)
                          }
                          hasValue={!!endTimeBefore.date}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3.5 pb-[18px] px-5 flex items-center justify-between md:justify-end gap-5">
                <div className="flex-1 md:block hidden">
                  <SecondaryButton onclick={resetFilters} text="Reset All" />
                </div>

                <SecondaryButton  className="md:w-auto w-full justify-center" onclick={close} text="Cancel" />
                <PrimaryButton
                  onclick={() => {
                    useFiltersStore.getState().applyFilters();
                  }}
                  text="Apply"
                   className="md:w-auto text-sm px-[30px] w-full"
                />
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
