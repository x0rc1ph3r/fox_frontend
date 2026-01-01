import { useMemo } from "react";
import { useGumballById } from "hooks/useGumballsQuery";
import type { GumballBackendDataType, PrizeDataBackend } from "types/backend/gumballTypes";

interface AvailablePrize extends PrizeDataBackend {
  remainingQuantity: number;
}

export const AvailableGumballTable = ({gumballId}: {gumballId: string}) => {
  const { data: gumball } = useGumballById(gumballId) as { data: GumballBackendDataType };
  
  const availableGumballs = useMemo(() => {
    if (!gumball?.prizes) return [];
    
    const spinCountByPrizeIndex: Record<number, number> = {};
    gumball.spins?.forEach((spin) => {
      const prizeIndex = spin.transaction.metadata.prizeIndex;
      spinCountByPrizeIndex[prizeIndex] = (spinCountByPrizeIndex[prizeIndex] || 0) + 1;
    });
    
    return gumball.prizes
      .map((prize): AvailablePrize => ({
        ...prize,
        remainingQuantity: prize.quantity - (spinCountByPrizeIndex[prize.prizeIndex] || 0),
      }))
      .filter((prize) => prize.remainingQuantity > 0);
  }, [gumball?.prizes, gumball?.spins]);
  return (
    <div className="mt-5 border relative border-gray-1100 md:pb-32 pb-10 rounded-[20px] w-full overflow-hidden">
      {availableGumballs?.length === 0 || gumball?.status === "CANCELLED" && (
        <div className="absolute w-full h-full flex items-center justify-center py-20">
          <p className="md:text-base text-sm font-medium text-center font-inter text-black-1000">
            No data found
          </p>
        </div>
      )}
      
    <div className="overflow-auto">
      <table className="table md:w-full w-[767px]">
        <thead className="bg-gray-1300">
          <tr>
            <th className="md:text-base text-sm text-start font-inter text-gray-1600 font-medium px-6 py-7">
              Prize
            </th>
            <th className="md:text-base text-sm text-start font-inter text-gray-1600 font-medium">
              <div className="pl-5 h-6 border-l border-gray-1600">Quantity</div>
            </th>
            <th className="md:text-base text-sm text-start font-inter text-gray-1600 font-medium">
              <div className="pl-5 h-6 border-l border-gray-1600">Floor price</div>
            </th>
          </tr>
        </thead>
        {gumball?.status !== "CANCELLED" && (
        <tbody>
          {availableGumballs?.map((row, idx) => {
            const displayQuantity = row.isNft 
              ? row.remainingQuantity 
              : `${(parseFloat(row.prizeAmount) / 10 ** (row.decimals || 0)) * row.remainingQuantity} ${row.symbol || ''}`;
            
            const displayFloorPrice = row.isNft 
              ? (row.floorPrice ? `${parseFloat(row.floorPrice) / 10 ** 9} SOL` : "N/A")
              : "N/A";

            return (
              <tr key={idx} className="w-full">
                <td>
                  <div className="px-6 flex items-center gap-2.5 py-6 h-24 border-b border-gray-1100">
                    <img src={row.image} className={`w-[60px] h-[60px] ${row.isNft ? 'rounded-lg' : 'rounded-full'}`} alt="no-img" />
                    <div className="flex flex-col">
                      <p className="md:text-base text-sm text-black-1000 font-medium font-inter">
                        {row.name}
                      </p>
                      <span className={`text-xs font-inter ${row.isNft ? 'text-purple-600' : 'text-green-600'}`}>
                        {row.isNft ? 'NFT' : 'Token'}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="px-5 flex items-center gap-2.5 py-6 h-24 border-b border-gray-1100">
                    <p className="md:text-base text-sm text-black-1000 font-medium font-inter">{displayQuantity}</p>
                  </div>
                </td>
                <td>
                  <div className="px-5 flex items-center gap-2.5 py-6 h-24 border-b border-gray-1100">
                    <p className="md:text-base text-sm text-black-1000 font-medium font-inter">{displayFloorPrice}</p>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>)}
      </table>
    </div>
    </div>
  );
};
