import { useState, useRef, useEffect } from "react";
import { useCreateRaffleStore } from "../../../store/createRaffleStore";
import { ticketTokens } from "@/utils/ticketTokens";
import { useGetTokenPrice } from "hooks/useGetTokenPrice";

export default function AmountInput() {
  const { ticketPrice, ticketCurrency, getComputedTTV,setTicketPrice, setTicketCurrency, setTicketPricePerSol } = useCreateRaffleStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: ticketTokenPrice } = useGetTokenPrice(ticketCurrency.address);
  const { data: solPrice } = useGetTokenPrice("So11111111111111111111111111111111111111112");

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (value: string) => {
    setTicketCurrency(ticketTokens.find((token) => token.symbol === value) || { symbol: "", address: "" });
    setTicketPricePerSol((parseFloat(ticketPrice) * (ticketTokenPrice?.price/solPrice?.price)).toFixed(2));
    getComputedTTV();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <input
        id="amount"
        type="number"
        value={ticketPrice}
        onChange={(e) => {
          setTicketPrice(e.target.value);
          setTicketPricePerSol((parseFloat(e.target.value) * (ticketTokenPrice?.price/solPrice?.price)).toFixed(2));
          getComputedTTV();
        }}
        className="text-black-1000 focus:outline-0 bg-white focus:border-primary-color placeholder:text-gray-1200 text-base w-full font-inter px-5 h-12 border border-solid border-gray-1100 rounded-lg font-medium"
        autoComplete="off"
        placeholder="Enter Amount"
      />
      <div
        ref={dropdownRef}
        className="absolute z-20 top-1/2 right-5 -translate-y-1/2 bg-white border-l border-solid border-gray-1100"
      >
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 cursor-pointer font-inter text-base font-medium text-black-1000 py-1"
          onClick={toggleDropdown}
        >
          <p>{ticketCurrency.symbol}</p>
          <span>
            <img
              src="/icons/down-arw.svg"
              alt="toggle"
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {isOpen && (
          <ol className="absolute top-full right-0 w-full bg-white border border-gray-1100 rounded-md mt-3 z-10">
            {ticketTokens.map((token) => (
              <li key={token.symbol}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => handleSelect(token.symbol)}
                >
                  {token.symbol}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
