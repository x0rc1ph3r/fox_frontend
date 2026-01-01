import { VerifiedTokens } from "@/utils/verifiedTokens";
import { useState, useRef, useEffect } from "react";
import { useGumballStore } from "../../../store/useGumballStore";

export default function GumballPriceInput() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("SOL");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { ticketCurrency,ticketPrice, setTicketCurrency, setTicketPrice,setIsTicketSol } = useGumballStore();
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2.5">
        <p className="text-gray-1200 font-inter text-sm font-medium">Gumball price</p>
      </div>

      <div className="relative">
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setTicketPrice((parseFloat(e.target.value) * (10 ** (VerifiedTokens.find((token) => token.address === ticketCurrency.address)?.decimals || 0))).toString());
          }}
          className="text-black-1000 outline outline-gray-1100 rounded-lg focus:outline-primary-color placeholder:text-gray-1200 text-base w-full font-inter px-5 h-12 font-medium"
          placeholder="Enter Amount"
        />

        <div ref={dropdownRef} className="absolute z-30 top-1/2 right-5 -translate-y-1/2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 cursor-pointer font-inter text-base font-medium text-black-1000 bg-white px-2.5 border-l border-solid border-gray-1100 rounded-r-md h-12"
          >
            <p>{currency}</p>
            <img src="/icons/down-arw.svg" alt="arrow" />
          </button>

          {open && (
            <ol className="absolute right-0 mt-1 bg-white shadow-lg rounded-md overflow-hidden z-10 w-20">
              {VerifiedTokens.map((cur) => (
                <li key={cur.address}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-gray-1100 font-inter text-sm text-black-1000"
                    onClick={() => {
                      setCurrency(cur.symbol);
                      setIsTicketSol(cur.symbol === "SOL");
                      setTicketCurrency({
                        symbol: cur.symbol,
                        address: cur.address,
                      });
                      setOpen(false);
                    }}
                  >
                    {cur.symbol}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
