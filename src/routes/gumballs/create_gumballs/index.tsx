import { BuySettings } from '@/components/gumballs/BuySettings';
import { GumballSetup } from '@/components/gumballs/GumballSetup';
import { GumballStudio } from '@/components/gumballs/GumballStudio';
import { LoadPrizesTab } from '@/components/gumballs/LoadPrizesTab';
import { createFileRoute, Link } from '@tanstack/react-router'
import { useGumballStore, type GumballTab } from 'store/useGumballStore';
import { useCreateGumball } from '../../../../hooks/useCreateGumball';

export const Route = createFileRoute('/gumballs/create_gumballs/')({
  component: CreateGumballs,
})

const tabs: { name: string; key: GumballTab }[] = [
  { name: "Gumball set-up", key: "setup" },
  { name: "Load Prizes", key: "loadPrizes" },
  // { name: "Buy back Settings", key: "buySettings" },
  { name: "Gumball Studio", key: "studio" },
];

function CreateGumballs() {
  const { activeTab, setActiveTab, createdGumballId } = useGumballStore();
  const { createGumball } = useCreateGumball();

  // Determine if a tab should be disabled
  const isTabDisabled = (tabKey: GumballTab): boolean => {
    
    // If gumball is NOT created, disable "loadPrizes" tab
    if ( tabKey === "loadPrizes") {
      return true;
    }
    if (tabKey === "studio") {
      return true;
    }
    
    // If gumball IS created, disable "setup" tab
    if (tabKey === "setup") {
      return false;
    }
    
    return false;
  };

  const handleTabClick = (tabKey: GumballTab) => {
    if (!isTabDisabled(tabKey)) {
      setActiveTab(tabKey);
    }
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
                {tabs.map((tab) => {
                    const disabled = isTabDisabled(tab.key);
                    return (
                      <li key={tab.key}>
                        <button
                          type="button"
                          onClick={() => handleTabClick(tab.key)}
                          disabled={disabled}
                          className={`border border-solid w-full border-gray-1100 flex items-center justify-center rounded-full lg:px-10 px-4 sm:h-12 h-8 md:text-base sm:text-sm text-xs font-medium text-black-1000 font-inter transition-all ${
                            activeTab === tab.key 
                              ? "bg-primary-color" 
                              : "bg-gray-1400"
                          } ${
                            disabled 
                              ? "opacity-50 cursor-not-allowed" 
                              : "cursor-pointer hover:opacity-80"
                          }`}>
                          {tab.name}
                        </button>
                      </li>
                    );
                  })}
            </ul>

            {activeTab === "setup" && <GumballSetup />}

       
        </div>
      </div>
    </section>
  );
}
