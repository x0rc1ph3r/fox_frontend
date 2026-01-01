import { useMemo, useState } from "react";
import { SoldGumballTable } from "./SoldGumballTable";
import { AvailableGumballTable } from "./AvailableGumballTable";
import { Link } from "@tanstack/react-router";
import { useCancelGumball } from "../../../hooks/useCancelGumball";
import { useGumballStore } from "../../../store/useGumballStore";
import { useGumballById } from "../../../hooks/useGumballsQuery";
import type { GumballBackendDataType } from "../../../types/backend/gumballTypes";
import { useGetTokenPrice } from "hooks/useGetTokenPrice";
import { VerifiedTokens } from "@/utils/verifiedTokens";
import { Loader2 } from "lucide-react";
interface GumballStudioProps {
  gumballId: string;
}

export const GumballStudio = ({ gumballId }: GumballStudioProps) => {
  const { cancelGumball } = useCancelGumball();
   const [tabNames, setTabNames] = useState([
  { name: "Sold", active: true },
  { name: "Available", active: false },
]);
const { data: gumball } = useGumballById(gumballId) as { data: GumballBackendDataType };
const handleTabClick = (clickedName: string) => {
  setTabNames((prev) =>
    prev.map((tab) =>
      tab.name === clickedName
        ? { ...tab, active: true }
        : { ...tab, active: false }
    )
  );
};  
const {data:solPrice} = useGetTokenPrice("So11111111111111111111111111111111111111112");
const {data:tokenPrice} = useGetTokenPrice(gumball?.ticketMint);
const totalProceedsInSol = useMemo(()=>{
  const numTotalProceeds = parseFloat(gumball?.totalProceeds || "0") / 10**(VerifiedTokens.find((token: typeof VerifiedTokens[0]) => token.address === gumball?.ticketMint)?.decimals || 0);
  const totalProcesds = numTotalProceeds * parseFloat(tokenPrice?.price || "1");
  console.log(totalProcesds);
  console.log(solPrice?.price);
  console.log(totalProcesds / parseFloat(solPrice?.price || "0"));
  return totalProcesds / parseFloat(solPrice?.price || "0");
}, [gumball?.totalProceeds, solPrice?.price]);

const availablePrizeIndexes = useMemo(() => {
  if (!gumball?.prizes) return [];
  
  const spinCountByPrizeIndex: Record<number, number> = {};
  gumball.spins?.forEach((spin) => {
    const prizeIndex = spin.transaction.metadata.prizeIndex;
    spinCountByPrizeIndex[prizeIndex] = (spinCountByPrizeIndex[prizeIndex] || 0) + 1;
  });
  
  return gumball.prizes
    .filter((prize) => prize.quantity - (spinCountByPrizeIndex[prize.prizeIndex] || 0) > 0)
    .map((prize) => prize.prizeIndex);
}, [gumball?.prizes, gumball?.spins]);
 console.log(totalProceedsInSol);
  
 return (
    <div className="w-full md:pt-[48px]">
        <div className="w-full flex items-center lg:justify-end md:gap-[30px] gap-4 md:mb-7 mb-5">
            <button onClick={() => cancelGumball.mutate({
              gumballId: parseInt(gumballId),
              prizeIndexes: availablePrizeIndexes,
            })} className="inline-flex cursor-pointer items-center gap-2.5 md:text-base text-sm font-medium text-red-1000 font-inter disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cancelGumball.isPending || availablePrizeIndexes.length === 0 || gumball?.status === "CANCELLED"}
            
            >
              {cancelGumball.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <img src="/icons/delete-icon-1.svg" className="w-6 h-6" alt="no-img" />}
                <span>{cancelGumball.isPending ? "Cancelling..." : "Cancel Gumball"}</span>
            </button>
            <div className="border-r border-gray-1100 h-[34px]"></div>
            <Link to="/gumballs/$id"
            params={{ id: gumballId }} 
            className="inline-flex cursor-pointer items-center gap-2.5 md:text-base text-sm font-medium text-black-1000 font-inter">
                <img src="/icons/gumball-icon-1.svg" className="w-6 h-6" alt="no-img" />
                <span>View Gumball</span>
            </Link>
        </div>

        <div className="w-full pb-16">
        <div className="w-full grid md:grid-cols-3 grid-cols-1 bg-gray-1300 border border-gray-1100 md:p-6 p-4 md:gap-10 gap-5 rounded-[10px]">
            <div className="">
                <h3 className='md:text-base text-sm text-black-1000 font-medium font-inter mb-[22px]'>Sale Start</h3>
                <h4 className='text-2xl font-bold font-inter text-black-1000'>{gumball?.ticketsSold}/{gumball?.totalTickets}</h4>
            </div>

               <div className="">
                <h3 className='md:text-base text-sm text-black-1000 font-medium font-inter mb-[22px]'>Proceed</h3>
                <div className="flex items-center gap-4">
                <h4 className='text-2xl font-bold font-inter text-black-1000'>{totalProceedsInSol} SOL</h4>
                <h4 className="text-base font-medium font-inter text-primary-color">{gumball?.uniqueBuyers} Unique Buyers</h4>
                </div>
            </div>
            {/* {gumball?.status === "INITIALIZED" &&  
            <div className="py-3">
                <button className="h-12 cursor-pointer hover:opacity-90 max-w-[260px] flex-1 w-full rounded-full font-medium text-black-1000 text-center bg-primary-color">
                      Launch Gumball Now
                  </button>
              </div>
            } */}
          </div>

        <ul className="flex items-center gap-3 md:gap-5 md:w-auto w-full pt-16">
           {tabNames.map((tab) => (
            <li key={tab.name} className="flex-1 sm:flex-none">
            <button
                onClick={() => handleTabClick(tab.name)}
                className={`md:text-base text-sm md:w-auto w-full cursor-pointer font-inter font-medium transition duration-300 
                hover:bg-primary-color text-black-1000 rounded-full py-2.5 md:py-3.5 md:px-5 px-3
                ${tab.active ? "bg-primary-color" : "bg-gray-1400"}
                `}>
                {tab.name}
            </button>
            </li>
            ))}
        </ul> 

        <div className="w-full">
            {tabNames[0].active &&
            <SoldGumballTable gumballId={gumballId}/>
            }

            {tabNames[1].active &&
            <AvailableGumballTable gumballId={gumballId}/>
            }
        </div>
        </div>   
    </div>
  )
}
