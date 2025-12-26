import { BuySettings } from '@/components/gumballs/BuySettings';
import { GumballSetup } from '@/components/gumballs/GumballSetup';
import { GumballStudio } from '@/components/gumballs/GumballStudio';
import { LoadPrizesTab } from '@/components/gumballs/LoadPrizesTab';
import { createFileRoute, Link, useParams, useRouteContext } from '@tanstack/react-router'
import { useGumballStore, type GumballTab } from 'store/useGumballStore';
import { useCreateGumball } from '../../../../hooks/useCreateGumball';
import { useState } from 'react';

export const Route = createFileRoute('/gumballs/create_gumballs/$id')({
  component: CreateGumballs,
})

const tabs: { name: string; key: GumballTab }[] = [
  { name: "Load Prizes", key: "loadPrizes" },
  // { name: "Buy back Settings", key: "buySettings" },
  { name: "Gumball Studio", key: "studio" },
];

function CreateGumballs() {
  const { createdGumballId } = useGumballStore();
  const [activeTab, setActiveTab] = useState<GumballTab>("loadPrizes");
  const { createGumball } = useCreateGumball();
  const { id } = Route.useParams();
 

  const handleTabClick = (tabKey: GumballTab) => {
      setActiveTab(tabKey);
  };

  return (
    <section className="md:pt-10 pt-5 md:pb-[122px] pb-5">
      <div className="max-w-[1440px] mx-auto w-full md:px-10 px-4">
        <div className="max-w-[870px] w-full">
          <Link
            to={"/gumballs"}
            className="bg-gray-1400 transition hover:opacity-80 mb-10 rounded-[80px] inline-flex md:h-[49px] h-10 justify-center items-center px-6 gap-2.5 text-base font-semibold text-black-1000 font-inter">
            <span>
              <img src="/icons/back-arw.svg" alt="" />
            </span>
            Back
          </Link>

            <ul className="pb-12 flex lg:flex-nowrap flex-wrap items-center sm:justify-center md:justify-start justify-start md:gap-5 gap-1">
              <li key="setup">
                        <button
                          type="button"
                          disabled={true}
                          className={`border border-solid w-full border-gray-1100 flex items-center justify-center rounded-full lg:px-10 px-4 sm:h-12 h-8 md:text-base sm:text-sm text-xs font-medium text-black-1000 font-inter transition-all ${
                            activeTab === "setup" 
                              ? "bg-primary-color" 
                              : "bg-gray-1400"
                          } ${
                            true 
                              ? "opacity-50 cursor-not-allowed" 
                              : "cursor-pointer hover:opacity-80"
                          }`}>
                          Gumball set-up
                        </button>
                      </li>
                {tabs.map((tab) => {
                    return (
                      <li key={tab.key}>
                        <button
                          type="button"
                          onClick={() => handleTabClick(tab.key)}
                          className={`border border-solid w-full border-gray-1100 flex items-center justify-center rounded-full lg:px-10 px-4 sm:h-12 h-8 md:text-base sm:text-sm text-xs font-medium text-black-1000 font-inter transition-all ${
                            activeTab === tab.key 
                              ? "bg-primary-color" 
                              : "bg-gray-1400"
                          } `}>
                          {tab.name}
                        </button>
                      </li>
                    );
                  })}
            </ul>


            {activeTab === "setup" || activeTab === "loadPrizes" && <LoadPrizesTab gumballId={id.toString()} />}
            {activeTab === "studio" && <GumballStudio gumballId={id.toString()} />}


       
        </div>
      </div>
    </section>
  );
}
