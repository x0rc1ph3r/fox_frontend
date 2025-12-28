import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { GumballPrizesTable } from '../../components/gumballs/GumballPrizesTable';
import { useState } from 'react';
import { LastSpinsTable } from '@/components/gumballs/LastSpinsTable';
import TicketCartModel from '@/components/common/TicketCartModel';

export const Route = createFileRoute('/gumballs/preview_gumball')({
  component: PreviewGumballs,
})

function PreviewGumballs() {

    const router = useRouter();
    const [saleEnded] = useState(true);
    const [TokenModel, setTokenModel] = useState(false)
    
     
    



  return (
      <main>
        <div className="w-full pb-2 pt-5 md:py-10 max-w-[1440px] md:px-5 px-4 mx-auto">
            <button onClick={() => router.history.go(-1)} className='bg-gray-1400 transition hover:opacity-80 mb-10 rounded-[80px] inline-flex md:h-[49px] h-10 justify-center items-center px-6 gap-2.5 text-base font-semibold text-black-1000 font-inter'>
            <img src="/icons/back-arw.svg" alt="" />
             Back
             </button>
        </div>
    
        <section className='w-full pb-20'>
            <div className="w-full max-w-[1440px] md:px-5 px-4 mx-auto">
                <div className="w-full flex gap-10 md:gap-10 md:flex-row flex-col">
                    <div className="flex-1">
                        <div className="md:p-[18px] p-2 rounded-[20px] border border-gray-1100">
                            {saleEnded ? 
                          <img src="/images/gumballs/sol-img-frame.png" className="w-full lg:h-[604px] h-[506px] rounded-[20px]" alt="no img" />
                        :
                        <div className="relative flex items-center justify-center rounded-lg overflow-hidden">
                            <img src="/images/ended-img-1.png" className="w-full object-cover lg:h-[604px] h-[406px]" alt="no img" />
                            <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>
                            <p className='md:text-[28px] text-lg text-white font-bold font-inter absolute z-10'>Sale Ended</p>
                        </div>
                        
                        }
                        </div>
                    
                    </div>
    
                    <div className="flex-1 max-w-[467px]">
                        <div className="w-full">
                            <h1 className='md:text-[28px] text-xl font-inter font-bold text-black-1000'>Moneyback or big hit</h1>
                            <div className="w-full">
                                <div className="w-full flex items-center justify-between md:pt-5 py-6 md:pb-6">
                                    <div className="inline-flex gap-4">
                                        <img src="/images/placeholder-user.png" className="w-10 h-10 rounded-full object-cover" alt="no" />
                                        <div className="">
                                            <p className='text-xs font-inter font-normal text-gray-1200 md:pb-0 pb-1'>Raffler</p>
                                            <h4 className='md:text-base text-sm text-black-1000 font-inter font-semibold'>OzzyyySOL</h4>
                                        </div>
                                    </div>  
                                </div>
    
                                <div className="w-full flex items-center justify-between py-4 px-5 border border-gray-1100 rounded-[20px] bg-gray-1300">
                                    <div className="inline-flex flex-col gap-2.5">
                                        <p className='font-inter text-sm text-gray-1200'>Prize </p>
                                        <h3 className='lg:text-[28px] text-xl font-semibold font-inter text-primary-color'>0.022 SOL</h3>
                                    </div>
                                </div>
    
                                <div className="w-full">
                                    {saleEnded && 
                                    <div className="w-full py-10">
                                    <PrimaryButton onclick={()=>setTokenModel(true)} text='Manage Gumball' className='w-full h-12' />
                                    </div>
                                    }
                                    <div className="w-full flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-1300 rounded-full h-4 relative">
                                                <div className="bg-primary-color rounded-full absolute left-0 top-0 h-4 w-1/4"></div>
                                            </div>
                                        </div>
    
                                        <div className="">
                                            <p className='md:text-base text-sm text-black-1000 font-medium font-inter'>225 / 1000 sold</p>
                                        </div>
    
                                    </div>
    
                                </div>
    
    
                            </div>
    
                        </div>
                    </div>
    
                </div>
                <div className="w-full">
                        <div className="md:grid md:grid-cols-2 items-start gap-5 pt-10">
                            <div className="w-full">
                            <h2 className='text-xl pb-8 text-black-1000 font-bold font-inter'>Gumball Prizes</h2>
                            <GumballPrizesTable prizes={[]}/>
                            </div>
                            <div className="flex-1">
                            <h2 className='text-xl pb-8 text-black-1000 font-bold font-inter'>Last Spins</h2>
                            <LastSpinsTable/>
                            </div>
                      </div>
                 </div>
            </div>
        </section>


    <TicketCartModel isOpen={TokenModel} onClose={()=>setTokenModel(false)} />
        
        
    </main>
  )
}
