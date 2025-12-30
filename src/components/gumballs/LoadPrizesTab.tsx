import { useMemo, useState } from 'react';
import AddTokenModal from './AddTokenModal';
import AddNftModal from './AddNftModal';
import { useGumballById } from '../../../hooks/useGumballsQuery';
import type { GumballBackendDataType } from 'types/backend/gumballTypes';
import { VerifiedTokens } from '@/utils/verifiedTokens';
import { useGetTotalPrizeValueInSol } from '../../../hooks/useGetTotalPrizeValueInSol';

export const LoadPrizesTab = ({gumballId}: {gumballId: string}) => {
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  const [isAddNftModalOpen, setIsAddNftModalOpen] = useState(false);
  const { data: gumball, isLoading } = useGumballById(gumballId) as { data: GumballBackendDataType, isLoading: boolean };
  console.log("gumball", gumball);

  const { totalValueInSol, isLoading: isPriceLoading, formattedValue } = useGetTotalPrizeValueInSol(gumball?.prizes);
  
  const maxROI = useMemo(() => {
    if (!gumball) return '0';
    const maxProceeds = gumball.maxPrizes * parseFloat(gumball.ticketPrice) / (10 ** (VerifiedTokens.find((token: typeof VerifiedTokens[0]) => token.address === gumball.ticketMint)?.decimals || 0));
    const roi = (maxProceeds - totalValueInSol) / maxProceeds * 100;
    console.log("maxProceeds", maxProceeds);
    console.log("totalValueInSol", totalValueInSol);
    console.log("roi", roi);
    if (isNaN(roi) || roi === Infinity) return '0';
    return Math.max(roi, 0).toFixed(2); 
  }, [gumball, totalValueInSol]);
  console.log(maxROI);

  if (isLoading || !gumball) {
    return <div className='w-full'>
      <div className="flex items-center gap-5 border border-solid border-primary-color rounded-[10px] bg-primary-color/5 py-4 px-5">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-10 h-10 border border-solid border-primary-color rounded-full animate-spin"></div>
        </div>
      </div>
    </div>;
  }

  const totalPrizesAdded = gumball.prizes.reduce((acc, prize) => acc + prize.quantity, 0) || 0;
  
  return (
    <div className='w-full'>
         <div className="flex items-center gap-5 border border-solid border-primary-color rounded-[10px] bg-primary-color/5 py-4 px-5">
            <div>
              <p className="md:text-lg text-base text-primary-color font-medium font-inter pb-2.5 leading-7">
                Load your prizes into the Gumball machine
              </p>
              <p className="md:text-lg text-sm font-medium text-black-1000 font-inter leading-7">
                You can load a mix ofNFTs or  Tokens from our verified list. If you enable buy back, you’ll be able to top this up when the machine is live
              </p>
            </div>
          </div>

          <div className="w-full grid md:grid-cols-4 grid-cols-2 my-10 bg-gray-1300 border border-gray-1100 p-6 gap-20 rounded-[10px]">
            <div className="">
                <h3 className='text-base text-black-1000 font-medium font-inter mb-[22px]'>Price Loaded</h3>
                <h4 className='text-2xl font-bold font-inter text-black-1000'>{gumball?.prizes.reduce((acc, prize) => acc + prize.quantity, 0)}/{gumball?.maxPrizes}</h4>
            </div>

               <div className="">
                <h3 className='text-base text-black-1000 font-medium font-inter mb-[22px]'>Total Prize Value</h3>
                <h4 className='text-2xl font-bold font-inter text-black-1000'>
                  {isPriceLoading ? 'Loading...' : `${totalValueInSol.toFixed(2)} SOL`}
                </h4>
            </div>

               <div className="">
                <h3 className='text-base text-black-1000 font-medium font-inter mb-[22px]'>Max Proceeds</h3>
                <h4 className='text-2xl font-bold font-inter text-black-1000'>{gumball?.maxPrizes * parseFloat(gumball?.ticketPrice)/(10**(VerifiedTokens.find((token: typeof VerifiedTokens[0]) => token.address === gumball?.ticketMint)?.decimals || 0))} SOL</h4>
            </div>

               <div className="">
                <h3 className='text-base text-black-1000 font-medium font-inter mb-[22px]'>Max ROI</h3>
                <h4 className='text-2xl font-bold font-inter text-black-1000'>{maxROI}%</h4>
            </div>

          </div>

          <div className="w-full grid md:grid-cols-2 grid-cols-1 gap-[28px]">

               <div className="relative border border-solid border-gray-1100 bg-gray-1300 rounded-[20px]">
                   <div className="w-full p-5">
                    <h2 className='lg:text-xl text-lg text-primary-color font-bold font-inter'>NFTs</h2>
                    <div className="w-full flex items-center justify-center flex-col md:my-24 my-10">
                    <h4 className="font-inter mb-5 lg:mb-6 font-bold lg:text-xl text-lg text-black-1000/30">
                    Add NFT prize
                    </h4>
                    <button
                    onClick={() => setIsAddNftModalOpen(true)}
                    className="text-white font-semibold hover:from-primary-color hover:via-primary-color hover:to-primary-color text-sm lg:text-base leading-normal font-inter h-10 lg:h-11 rounded-full inline-flex items-center justify-center px-5 lg:px-[26px] transition duration-500 hover:opacity-90 bg-linear-to-r from-neutral-800 via-neutral-500 to-neutral-800 gap-2 cursor-pointer"
                    >
                    <span className="w-6 h-6 flex items-center justify-center">
                        <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path
                            d="M0.75 6.75H12.75M6.75 0.75V12.75"
                            stroke="#fff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        </svg>
                    </span>
                    Add
                    </button>
                    </div>
                   </div>

                </div>

                <div className="relative border border-solid border-gray-1100 bg-gray-1300 rounded-[20px]">
                   <div className="w-full p-5">
                    <h2 className='lg:text-xl text-lg text-primary-color font-bold font-inter'>Tokens</h2>
                    <div className="w-full flex items-center justify-center flex-col md:my-24 my-10">
                    <h4 className="font-inter mb-5 lg:mb-6 font-bold lg:text-xl text-lg text-black-1000/30">
                    Add Tokens prize
                    </h4>
                    <button
                    onClick={() => setIsAddTokenModalOpen(true)}
                    className="text-white font-semibold hover:from-primary-color hover:via-primary-color hover:to-primary-color text-sm lg:text-base leading-normal font-inter h-10 lg:h-11 rounded-full inline-flex items-center justify-center px-5 lg:px-[26px] transition duration-500 hover:opacity-90 bg-linear-to-r from-neutral-800 via-neutral-500 to-neutral-800 gap-2 cursor-pointer"
                    >
                    <span className="w-6 h-6 flex items-center justify-center">
                        <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path
                            d="M0.75 6.75H12.75M6.75 0.75V12.75"
                            stroke="#fff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        </svg>
                    </span>
                    Add
                    </button>
                    </div>
                   </div>
                </div>

                <AddTokenModal 
                  isOpen={isAddTokenModalOpen} 
                  onClose={() => setIsAddTokenModalOpen(false)}
                  gumballId={gumballId}
                  remainingPrizes={gumball?.totalTickets - (gumball?.prizesAdded || 0)}
                />

                <AddNftModal 
                  isOpen={isAddNftModalOpen} 
                  onClose={() => setIsAddNftModalOpen(false)}
                  gumballId={gumballId}
                />

            
          </div>


    </div>
  )
}
