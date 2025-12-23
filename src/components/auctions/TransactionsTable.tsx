import type { TransactionTypeBackend } from "types/backend/raffleTypes";


export const TransactionsTable = ({
  transactions,
  isLoading = false,
}: {
  transactions?: TransactionTypeBackend[];
  isLoading?: boolean;
}) => {
  return (
    <div className="border border-gray-1100 md:pb-36 pb-24 rounded-[20px] w-full md:overflow-hidden overflow-x-auto">
      <table className="table w-full min-w-[600px]">
        <thead className="bg-gray-1300">
          <tr>
            <th className="text-base md:w-1/3 text-start font-inter text-gray-1600 font-medium md:px-10 px-4 py-7">
              Transaction
            </th>
            <th className="text-base md:w-1/5 text-start font-inter text-gray-1600 font-medium">
              <div className="px-5 h-6 border-l border-gray-1600">Buyer</div>
            </th>
            <th className="text-base md:w-1/5 text-start font-inter text-gray-1600 font-medium">
              <div className="px-5 h-6 border-l border-gray-1600">
                Date & time
              </div>
            </th>
            <th className="text-base md:w-1/5 text-start font-inter text-gray-1600 font-medium">
              <div className="px-5 h-6 border-l border-gray-1600">Tickets</div>
            </th>
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td>
                      <div className="md:px-10 px-4 py-4 border-b border-gray-1100 flex items-center gap-2.5">
                        <div className="h-4 w-24 bg-gray-300 rounded"></div>
                        <div className="h-5 w-5 bg-gray-300 rounded"></div>
                      </div>
                    </td>

                    <td>
                      <div className="px-5 md:py-6 py-4 border-b border-gray-1100">
                        <div className="h-4 w-24 bg-gray-300 rounded"></div>
                      </div>
                    </td>

                    <td>
                      <div className="px-5 py-6 border-b border-gray-1100">
                        <div className="h-4 w-32 bg-gray-300 rounded"></div>
                      </div>
                    </td>

                    <td>
                      <div className="px-5 py-6 border-b border-gray-1100">
                        <div className="h-4 w-6 bg-gray-300 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
            : transactions?.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="md:px-10 px-4 flex items-center gap-2.5 md:py-6 py-4 border-b border-gray-1100">
                      <p className="text-base text-black-1000 font-medium font-inter">
                        {t.transactionId.slice(0, 6)}...
                        {t.transactionId.slice(-4)}
                      </p>
                      <img
                        src="/icons/external-link-icon.svg"
                        onClick={() => window.open(`https://solscan.io/tx/${t.transactionId}`, "_blank")}
                        className="w-5 h-5"
                        alt="link"
                      />
                    </div>
                  </td>

                  <td>
                    <div className="px-5 md:py-6 py-4 border-b border-gray-1100">
                      <p className="text-base text-black-1000 font-medium font-inter">
                        {t.sender.slice(0, 6)}...{t.sender.slice(-4)}
                      </p>
                    </div>
                  </td>

                  <td>
                    <div className="px-5 md:py-6 py-4 border-b border-gray-1100">
                      <p className="text-base text-black-1000 font-medium font-inter">
                        {new Date(t.createdAt)
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

                  <td>
                    <div className="px-5 md:py-6 py-4 border-b border-gray-1100">
                      <p className="text-base text-black-1000 font-medium font-inter">
                        {t.metadata?.quantity??0}
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
