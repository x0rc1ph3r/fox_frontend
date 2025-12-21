import { useState, useRef, useEffect, useMemo } from "react";
import { useCreateRaffleStore } from "../../../store/createRaffleStore";
import { VerifiedTokens } from "../../utils/verifiedTokens";
import { useFetchUserToken } from "../../../hooks/useFetchUserToken";
import { useGetTokenPrice } from "hooks/useGetTokenPrice";

export default function TokenPrizeInput() {
    const { tokenPrizeAmount, setTokenPrizeAmount ,tokenPrizeMint, setTokenPrizeMint, setUserVerifiedTokens, getComputedVal } = useCreateRaffleStore();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [filteredVerifiedTokens, setFilteredVerifiedTokens] = useState(VerifiedTokens);
    const { data: tokenPrice } = useGetTokenPrice(tokenPrizeMint);
    const { data: SolPrice } = useGetTokenPrice("So11111111111111111111111111111111111111112");
    const { userVerifiedTokens } = useFetchUserToken();
    
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
  
  useEffect(() => {
    if (userVerifiedTokens.length > 0) {
      setFilteredVerifiedTokens(VerifiedTokens.filter((token) => userVerifiedTokens.some((userToken) => userToken.address === token.address)));
      setTokenPrizeMint(userVerifiedTokens[0].address);
      setUserVerifiedTokens(userVerifiedTokens.map((token) => token.address));
    }
  }, [userVerifiedTokens]);

  return (
    <div className="relative">
      <input
        id="amount"
        type="number"
        value={tokenPrizeAmount}
        onChange={(e) => {
          setTokenPrizeAmount(e.target.value);
          getComputedVal(tokenPrice?.price || 0, SolPrice?.price || 0);
        }}
        className="text-black-1000 focus:outline-0 bg-white focus:border-primary-color placeholder:text-gray-1200 text-base w-full font-inter px-5 h-12 border border-solid border-gray-1100 rounded-lg font-medium"
        autoComplete="off"
        placeholder="Enter Amount"
        disabled={userVerifiedTokens?.length == 0}
      />
      {userVerifiedTokens?.length != 0 && (
       
      <div
        ref={dropdownRef}
        className={`absolute z-20 top-1/2 right-5 -translate-y-1/2 bg-white border-l border-solid border-gray-1100 ${filteredVerifiedTokens.length > 0 ? "block" : "hidden"}`}
      >
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 cursor-pointer font-inter text-base font-medium text-black-1000 py-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <p>{filteredVerifiedTokens.find((token) => token.address === tokenPrizeMint)?.symbol}</p>
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
            {filteredVerifiedTokens.map((coin) => (
              <li key={coin.address}>
                <button
                  type="button"
                  className="w-full cursor-pointer flex items-center gap-2 text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setTokenPrizeMint(coin.address);
                    setIsOpen(false);
                  }}
                >
                  <img src={coin.image} alt={coin.name} className="w-4 h-4" />
                  {coin.name}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
      )}

    </div>
  );
}
