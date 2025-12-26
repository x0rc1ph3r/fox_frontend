import { VerifiedTokens } from "@/utils/verifiedTokens";
import type { SpinDataBackend } from "types/backend/gumballTypes";

export const MoneybackTable = ({ spins }: { spins: SpinDataBackend[] }) => {
  const filterSpins = spins.filter((spin)=>{return {transaction:spin.transaction,spunAt:spin.spunAt}});
  console.log(filterSpins);
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price)/ 10**(VerifiedTokens.find((token: typeof VerifiedTokens[0]) => token.address === filterSpins[0].transaction.mintAddress)?.decimals || 0);
    return `${numPrice}`;
  }
  return (
    <div className="border border-gray-1100 rounded-[20px] w-full overflow-x-auto xl:overflow-hidden">
      <table className="table xl:w-full w-[500px] md:w-[600px]">
        <thead className="bg-gray-1300">
          <tr className="flex-1">
            <th
              scope="col"
              className="text-base w-1/3 text-start font-inter text-gray-1600 font-medium px-4 md:px-10 py-4 md:py-7"
            >
              Prize
            </th>
            <th
              scope="col"
              className="text-base w-1/5 text-start font-inter text-gray-1600 font-medium"
            >
              <div className="pl-5 h-6 border-l border-gray-1600"> TX</div>
            </th>
            <th
              scope="col"
              className="text-base w-1/5 text-start font-inter text-gray-1600 font-medium"
            >
              <div className="pl-5 h-6 border-l border-gray-1600">Time</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {filterSpins.map((spin)=>(
          <tr className="flex-1">
            <td scope="row">
              <div className="md:px-10 px-4 flex items-center gap-5 md:gap-2.5 py-6 border-b border-gray-1100">
                <img
                  src={spin.transaction.metadata?.prizeImage??"/images/placeholder-user.png"}
                  className="md:w-[60px] w-10 h-10 md:h-[60px] rounded-full object-cover"
                  alt="no img"
                />
                <p className="text-base text-black-1000 font-medium font-inter">
                  {formatPrice(spin.transaction.metadata?.prizeAmount??0 )}
                </p>
              </div>
            </td>
            <td>
              <div className="3xl:px-5 px-0 flex items-center gap-2.5 py-[34px] md:py-[42px] border-b border-gray-1100">
                <p className="md:text-base text-sm text-black-1000 font-medium font-inter">
                  {spin.transaction.transactionId.slice(0, 6)}...
                  {spin.transaction.transactionId.slice(-4)}
                </p>
                <img
                  src="/icons/external-link-icon.svg"
                  onClick={() => window.open(`https://solscan.io/tx/${spin.transaction.transactionId}`, "_blank")}
                  className="w-5 h-5 cursor-pointer"
                  alt="link"
                />
              </div>
            </td>
            <td>
              <div className="3xl:px-5 px-0 flex items-center gap-2.5 py-[34px] md:py-[42px] border-b border-gray-1100">
                <p className="md:text-base text-sm text-black-1000 font-medium font-inter">
                  {new Date(spin.spunAt)
                    .toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    .replace(",", "")
                    .replace(/ (\d{2})$/, "'$1")}
                </p>
              </div>
            </td>
          </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
