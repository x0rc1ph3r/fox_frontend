import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { TransactionsTable } from '../../components/auctions/TransactionsTable';
import { GumballPrizesTable } from '../../components/gumballs/GumballPrizesTable';
import { MoneybackTable } from '../../components/gumballs/MoneybackTable';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useGumballById } from 'hooks/useGumballsQuery';
import type { GumballBackendDataType } from '../../../types/backend/gumballTypes';
import { VerifiedTokens } from '../../utils/verifiedTokens';
import { useSpinGumball } from 'hooks/useSpinGumball';
import { Dialog, DialogPanel } from '@headlessui/react';
import { prepareSpin } from '../../../api/routes/gumballRoutes';


interface Prize{
      gumballId: number,
      prizeIndex: number,
      prizeMint: string,
      ticketPrice: string,
      ticketMint: string,
      isTicketSol: boolean,
      prizeImage: string,
      prizeAmount: string,
      isNft: boolean
}
interface PrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: Prize;
  onClaimPrize: () => void;
  isClaimPending: boolean;
}

const PrizeModal = ({ isOpen, onClose, prize, onClaimPrize, isClaimPending }: PrizeModalProps) => {
  const formatPrice = (price: string, mint: string) => {
    const numPrice = parseFloat(price)/ 10**(VerifiedTokens.find((token: typeof VerifiedTokens[0]) => token.address === mint)?.decimals || 0);
    return `${numPrice}`;
  }
  return (
    <Dialog open={isOpen} as="div" className="relative z-50" onClose={onClose}>
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative z-10 w-full max-w-md duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
          >
            <div className="bg-white rounded-[24px] p-6 shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L13 13M1 13L13 1" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="flex flex-col items-center pt-4">
                <div className="relative w-[300px]   h-[300px] flex items-center justify-center flex-col gap-4">
                  <img src={prize.prizeImage??""} alt={prize.prizeImage} className="w-[200px] h-[200]px object-cover" />
                  {prize.isNft ? (
                    <p className="text-black-1000 font-bold text-lg font-inter">1x NFT</p>
                  ) : (
                    <p className="text-black-1000 font-bold text-lg font-inter">{formatPrice(prize.prizeAmount, prize.prizeMint)} {VerifiedTokens.find((token: typeof VerifiedTokens[0]) => token.address === prize.prizeMint)?.symbol}</p>
                  )}
                </div>
                <button
                  onClick={onClaimPrize}
                  disabled={isClaimPending}
                  className="mt-6 w-full cursor-pointer px-12 py-3.5 rounded-full font-bold text-lg font-inter transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--color-primary-color)',
                    color: 'var(--color-white-1000)',
                    boxShadow: '0 6px 24px rgba(255, 20, 147, 0.35)',
                  }}
                >
                  {isClaimPending ? 'Claiming...' : 'Claim prize'}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export const Route = createFileRoute('/gumballs/$id')({
  component: GumballsDetails,
})
//TODO: handle total tickets vs prize quantity
function GumballsDetails() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useGumballById(id || "");
  const gumball = data as GumballBackendDataType | undefined;
  const router = useRouter();
  const [prize,setPrize] = useState<Prize | null>(null);
  const { spinGumballFunction } = useSpinGumball();

  const [tabs, setTabs] = useState([
      { name: "Gumball Prizes", active: true },
      // { name: "Your Prizes", active: false },
      ]);

  const isActive = gumball?.status === "ACTIVE";

  const MAX = 10;
  const [quantityValue, setQuantityValue] = useState<number>(1);
  
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [isClaimPending, setIsClaimPending] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpinClick = () => {
    setIsSpinning(true);
    new Promise((resolve) => setTimeout(resolve, 3000));
    setIsPrizeModalOpen(true);
  };

  const handleClaimPrize = async () => {
    setIsClaimPending(true);
    try {
      await spinGumballFunction.mutateAsync({ gumballId: parseInt(id || ""), prizeIndex: prize?.prizeIndex || 0, prizeMint: prize?.prizeMint || "" });
      setIsPrizeModalOpen(false);
    } catch (error) {
      console.error('Failed to claim prize:', error);
    } finally {
      setIsClaimPending(false);
      setIsSpinning(false);
    }
  };

  const formatPrice = (price: string | undefined, isTicketSol: boolean | undefined) => {
    if (!price) return "0";
    if (isTicketSol) {
        const priceNum = parseFloat(price)/10**9;
      return `${priceNum} SOL`;
    }
    const numPrice = parseFloat(price)/ 10**(VerifiedTokens.find((token: typeof VerifiedTokens[0]) => token.address === gumball?.ticketMint)?.decimals || 0);
    return `${numPrice} ${isTicketSol ? "SOL" : ""}`;
  };

  const progressPercent = gumball ? (gumball.ticketsSold / gumball.totalTickets) * 100 : 0;
  const truncateAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

    const decrease = () => {
        setQuantityValue((prev) => Math.max(1, prev - 1));
    };

    const increase = () => {
        setQuantityValue((prev) => Math.min(MAX, prev + 1));
    };

    const handleQuickSelect = (num: number) => {
        setQuantityValue(num);
    };
    

    useEffect(()=>{
      const fetchPrize = async () => {
      if(isSpinning){
          const data = await prepareSpin(id || "");
          if(data.error){
            console.error('Failed to prepare spin:', data.error);
          }
          setPrize(data);
        }
      }
      fetchPrize();
    },[isSpinning, id])
  if (isLoading) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto"></div>
          <p className="mt-4 text-gray-1200 font-inter">Loading gumball...</p>
        </div>
      </main>
    );
  }

  if (isError || !gumball) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-black-1000 font-inter font-semibold">Gumball not found</p>
          <button onClick={() => router.history.go(-1)} className='mt-4 cursor-pointer px-6 py-2.5 bg-primary-color rounded-full text-white font-semibold'>
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
  <main>
    <div className="w-full pb-2 pt-5 md:py-10 max-w-[1440px] px-5 mx-auto">
        <button onClick={() => router.history.go(-1)} className='cursor-pointer px-3.5 md:px-[30px] transition duration-300 hover:opacity-80 inline-flex items-center gap-2.5 py-2.5 bg-gray-1400 rounded-full text-sm md:text-base font-semibold text-black-1000'>
        <img src="/icons/back-arw.svg" alt="" />
         Back
         </button>
    </div>

    <section className='w-full pb-20'>
        <div className="w-full max-w-[1280px] px-5 mx-auto">
            <div className="w-full flex gap-[60px] md:gap-10 md:flex-row flex-col">
                <div className="flex-1">
                    <div className="md:p-[18px] p-2 rounded-[20px] border border-gray-1100">
                        {isActive ? 
                      <img src={gumball.prizes[0]?.image || "/images/gumballs/sol-img-frame.png"} className="w-full h-[506px] rounded-[20px] object-cover" alt={gumball.name} />
                    :
                    <div className="relative flex items-center justify-center rounded-lg overflow-hidden">
                        <img src={gumball.prizes[0]?.image || "/images/ended-img-1.png"} className="w-full object-cover lg:h-[604px] h-[406px]" alt={gumball.name} />
                        <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>
                        <p className='md:text-[28px] text-lg text-white font-bold font-inter absolute z-10'>
                          {gumball.status === "CANCELLED" ? "Cancelled" : gumball.status === "ENDED" ? "Sale Ended" : "Not Started"}
                        </p>
                    </div>
                    
                    }
                    </div>
                
                </div>

                <div className="flex-1 max-w-[467px]">
                    <div className="w-full">
                        <div className="flex items-center gap-3">
                          <h1 className='md:text-[28px] text-xl font-inter font-bold text-black-1000'>{gumball.name}</h1>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            gumball.status === "ACTIVE" ? "bg-green-100 text-green-600" :
                            gumball.status === "ENDED" ? "bg-gray-200 text-gray-600" :
                            gumball.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                            "bg-yellow-100 text-yellow-600"
                          }`}>
                            {gumball.status}
                          </span>
                        </div>
                        <div className="w-full">
                            <div className="w-full flex items-center justify-between md:pt-5 py-6 md:pb-6">
                                <div className="inline-flex gap-4">
                                    <img src="/images/placeholder-user.png" className="w-10 h-10 rounded-full object-cover" alt="creator" />
                                    <div className="">
                                        <p className='text-xs font-inter font-normal text-gray-1200 md:pb-0 pb-1'>Creator</p>
                                        <h4 className='md:text-base text-sm text-black-1000 font-inter font-semibold'>{truncateAddress(gumball.creatorAddress)}</h4>
                                    </div>
                                </div>  
                            </div>

                            <div className="w-full flex items-center justify-between py-4 px-5 border border-gray-1100 rounded-[20px] bg-gray-1300">
                                <div className="inline-flex flex-col gap-2.5">
                                    <p className='font-inter text-sm text-gray-1200'>Ticket Price</p>
                                    <h3 className='lg:text-[28px] text-xl font-semibold font-inter text-primary-color'>{formatPrice(gumball.ticketPrice, gumball.isTicketSol)}</h3>
                                </div>
                                <div className="inline-flex flex-col gap-2.5 text-right">
                                    <p className='font-inter text-sm text-gray-1200'>Total Prize Value</p>
                                    <h3 className='lg:text-[28px] text-xl font-semibold font-inter text-black-1000'>{formatPrice(gumball.totalPrizeValue, gumball.isTicketSol)}</h3>
                                </div>
                            </div>

                            <div className="w-full">
                                {isActive ? 
                                <div className="w-full">
                                {/* <div className="w-full flex items-center justify-between pt-7 pb-5">
                                        <p className="text-sm font-medium font-inter text-gray-1200">
                                        Quantity
                                        </p>
                                        <p className="text-black-1000 font-sm font-inter font-medium">
                                        Max : <span className="quantity-count">{MAX}</span>
                                        </p>
                                    </div>

                               <div className="w-full flex items-center justify-between p-[13px] border border-gray-1100 rounded-2xl">
                                <button
                                onClick={decrease}
                                className="w-8 h-8 cursor-pointer rounded-lg bg-primary-color text-white flex items-center justify-center"
                                >
                                <svg
                                    width={15}
                                    height={2}
                                    viewBox="0 0 15 2"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                    d="M0.799805 0.799988H14.1331"
                                    stroke="white"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    />
                                </svg>
                                </button>

                                <input
                                value={quantityValue}
                                onChange={(e) =>
                                    setQuantityValue(
                                    Math.min(MAX, Math.max(1, Number(e.target.value)))
                                    )
                                }
                                className="outline-0 text-center font-bold font-inter text-black-1000"
                                type="number"
                                name="quantity"
                                id="quantity"
                                />

                                <button
                                onClick={increase}
                                className="w-8 h-8 cursor-pointer rounded-lg bg-primary-color text-white flex items-center justify-center"
                                >
                                <svg
                                    width={15}
                                    height={15}
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                    d="M7.46647 0.799988V14.1333M0.799805 7.46665H14.1331"
                                    stroke="white"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    />
                                </svg>
                                </button>
                            </div>


                               <div className="w-full pt-5 pb-10">
                                    <ul className="grid grid-cols-4 gap-4">
                                    {[1, 3, 5, 10].map((num) => (
                                        <li key={num} className="w-full">
                                        <button
                                            onClick={() => handleQuickSelect(num)}
                                            className="text-sm py-3 w-full cursor-pointer bg-gray-1300 rounded-lg text-black-1000 text-center font-inter font-semibold"
                                        >
                                            x{num}
                                        </button>
                                        </li>
                                    ))}
                                    </ul>
                                </div> */}

                                <div className="w-full flex mt-10">
                                <PrimaryButton onclick={handleSpinClick} text='Press To Spin' className='w-full h-12' disabled={spinGumballFunction.isPending || isSpinning} />
                                </div>

                                {/* <p className='md:text-base text-sm text-black-1000 font-medium font-inter pt-[18px] pb-10'>Your balance: 0 SOL</p> */}
                                </div>
                                :
                                <div className="w-full bg-gray-1300 rounded-full flex items-center justify-center h-12 my-10">
                                    <p className='text-base text-black-1000 text-center font-semibold font-inter'>
                                      {gumball.status === "CANCELLED" ? "Cancelled" : gumball.status === "ENDED" ? "Sale Ended" : "Not Started Yet"}
                                    </p>
                                    
                                </div>
                                }
                                <div className="w-full flex items-center gap-4 mt-10">
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-1300 rounded-full h-4 relative">
                                            <div 
                                              className="bg-primary-color rounded-full absolute left-0 top-0 h-4 transition-all duration-300" 
                                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="">
                                        <p className='md:text-base text-sm text-black-1000 font-medium font-inter'>{gumball.ticketsSold} / {gumball.totalTickets} sold</p>
                                    </div>

                                </div>

                            </div>


                        </div>

                    </div>
                </div>

            </div>
                <div className="w-full">
                    <ul className="flex items-center md:gap-5 gap-3 pb-8 md:pb-10 md:pt-[70px] pt-14">
                                {tabs.map((tab, index) => (
                                <li key={index}>
                                    <button onClick={() => {
                                    const updatedTabs = tabs.map((t, i) => ({
                                        ...t,
                                        active: i === index,
                                    }));
                                    setTabs(updatedTabs);
                                    }
                                    } className={`md:text-base text-sm cursor-pointer font-inter font-medium transition duration-300 hover:bg-primary-color text-black-1000 rounded-full py-3.5 md:px-5 px-3 ${tab.active ? `bg-primary-color` : `bg-gray-1400`}`}>{tab.name}</button>
                                </li>
                                ))}
                            </ul>

                            {tabs[0].active &&
                            <div className="md:grid md:grid-cols-2 items-start gap-5">
                             <GumballPrizesTable prizes={gumball.prizes} />
                             <div className="flex-1 md:-mt-px mt-10">
                             <MoneybackTable spins={gumball.spins} />
                             </div>
                             </div>
                            }

                            {/* {tabs[1].active &&
                             <TransactionsTable spins={gumball.spins} />
                            } */}
                            


                </div>
        </div>
    </section>
{prize && (
    <PrizeModal
      isOpen={isPrizeModalOpen}
      onClose={() => {
        setIsPrizeModalOpen(false);
        setIsSpinning(false);
      }}
      prize={prize as Prize}
      onClaimPrize={handleClaimPrize}
      isClaimPending={isClaimPending}
    />
    )}
</main>
  )}
