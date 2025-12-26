import { Dialog, DialogPanel, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import clsx from "clsx";
import { VerifiedTokens } from "@/utils/verifiedTokens";
import { useGumballStore } from "store/useGumballStore";
import { useGetTokenPrice } from "hooks/useGetTokenPrice";
import { useAddPrizes, type AddPrizeInputData } from "hooks/useAddPrizes";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface TokenPrize {
  id: string;
  token: typeof VerifiedTokens[0];
  prizeSize: string;
  numberOfPrizes: string;
  calculatedSolValue?: number;
}

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  gumballId: string;
  remainingPrizes: number;
}

// Separate component for each token prize row to have its own price hook
interface TokenPrizeRowProps {
  prize: TokenPrize;
  onUpdate: (id: string, field: 'prizeSize' | 'numberOfPrizes', value: string) => void;
  onRemove: (id: string) => void;
  onValueChange: (id: string, solValue: number) => void;
}

function TokenPrizeRow({ prize, onUpdate, onRemove, onValueChange }: TokenPrizeRowProps) {
  const { data: solPrice } = useGetTokenPrice("So11111111111111111111111111111111111111112");
  const { data: tokenPrice } = useGetTokenPrice(prize.token.address);

  const totalValue = useMemo(() => {
    const size = parseFloat(prize.prizeSize) || 0;
    const count = parseInt(prize.numberOfPrizes) || 0;
    const tokenPricePerSol = (tokenPrice?.price && solPrice?.price) 
      ? tokenPrice.price / solPrice.price 
      : 0;
    const prizeValue = size * count * tokenPricePerSol;
    return prizeValue;
  }, [prize.prizeSize, prize.numberOfPrizes, tokenPrice?.price, solPrice?.price]);

  // Report value changes to parent
  useEffect(() => {
    onValueChange(prize.id, totalValue);
  }, [totalValue, prize.id, onValueChange]);

  return (
    <div className="mb-6">
      <div className="flex items-start gap-4">
        {/* Token Image */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-1300 flex-shrink-0 border border-gray-1100">
          <img 
            src={prize.token.image} 
            alt={prize.token.symbol}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Inputs */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-black-1000 font-medium font-inter mb-2 block">
              Prize size
            </label>
            <input
              type="number"
              value={prize.prizeSize}
              onChange={(e) => onUpdate(prize.id, 'prizeSize', e.target.value)}
              placeholder="0"
              className="w-full h-12 px-4 rounded-lg border-2 border-primary-color/30 bg-white text-black-1000 font-medium font-inter focus:outline-none focus:border-primary-color transition"
            />
          </div>
          <div>
            <label className="text-sm text-black-1000 font-medium font-inter mb-2 block">
              Number of prizes
            </label>
            <input
              type="number"
              value={prize.numberOfPrizes}
              onChange={(e) => onUpdate(prize.id, 'numberOfPrizes', e.target.value)}
              placeholder="1"
              min="1"
              className="w-full h-12 px-4 rounded-lg border-2 border-primary-color/30 bg-white text-black-1000 font-medium font-inter focus:outline-none focus:border-primary-color transition"
            />
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(prize.id)}
          className="w-8 h-8 mt-8 flex-shrink-0 rounded-md bg-red-1000 flex items-center justify-center cursor-pointer hover:opacity-80 transition"
        >
          <svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Total Value & Balance Info */}
      <div className="flex items-center gap-4 mt-3 ml-20 text-sm font-medium font-inter">
        <span className="text-primary-color">
          Total value: <span className="text-black-1000">{totalValue.toFixed(2)} SOL</span>
        </span>
        
      </div>
    </div>
  );
}

export default function AddTokenModal({ isOpen, onClose, gumballId,remainingPrizes }: AddTokenModalProps) {
  const { prizeCount, addPrize, prizes: existingPrizes, updatePrizeStats } = useGumballStore();
  const { addPrizes } = useAddPrizes();
  const [tokenPrizes, setTokenPrizes] = useState<TokenPrize[]>([]);
  const [selectedToken, setSelectedToken] = useState<typeof VerifiedTokens[0] | null>(null);
  const [prizeValues, setPrizeValues] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();
  // Handler for value changes from child components
  const handleValueChange = useCallback((id: string, solValue: number) => {
    setPrizeValues(prev => ({ ...prev, [id]: solValue }));
  }, []);

  // Calculate remaining prizes
  const totalPrizesAdded = useMemo(() => {
    return tokenPrizes.reduce((sum, tp) => sum + (parseInt(tp.numberOfPrizes) || 0), 0);
  }, [tokenPrizes]);

  const maxPrizes = parseInt(prizeCount) || 0;
  // const remainingPrizes = Math.max(0, maxPrizes - totalPrizesAdded);

  // Get available tokens (not already added)
  const availableTokens = useMemo(() => {
    return VerifiedTokens;
  }, [tokenPrizes]);

  const handleAddToken = () => {
    if (!selectedToken) return;
    
    const newPrize: TokenPrize = {
      id: crypto.randomUUID(),
      token: selectedToken,
      prizeSize: "",
      numberOfPrizes: "1",
    };
    
    setTokenPrizes([...tokenPrizes, newPrize]);
    setSelectedToken(null);
  };

  const handleRemoveToken = (id: string) => {
    setTokenPrizes(tokenPrizes.filter(tp => tp.id !== id));
    setPrizeValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  const handleUpdatePrize = (id: string, field: 'prizeSize' | 'numberOfPrizes', value: string) => {
    setTokenPrizes(tokenPrizes.map(tp => 
      tp.id === id ? { ...tp, [field]: value } : tp
    ));
  };

  const handleAddPrizes = async () => {
    // Filter valid prizes
    const validPrizes = tokenPrizes.filter(tp => {
      const prizeSize = parseFloat(tp.prizeSize) || 0;
      const numberOfPrizes = parseInt(tp.numberOfPrizes) || 0;
      return prizeSize > 0 && numberOfPrizes > 0;
    });

    if (validPrizes.length === 0) return;

    // Calculate starting prize index based on existing prizes
    const startingPrizeIndex = existingPrizes.length;

    // Prepare data for on-chain transaction and backend
    const prizesData: AddPrizeInputData[] = validPrizes.map((tp, index) => {
      const prizeSize = parseFloat(tp.prizeSize) || 0;
      const numberOfPrizes = parseInt(tp.numberOfPrizes) || 0;
      const decimals = tp.token.decimals || 9;
      
      // Convert prize amount to base units (e.g., lamports for SOL)
      const prizeAmountInBaseUnits = Math.floor(prizeSize * Math.pow(10, decimals));
      return {
        prizeIndex: startingPrizeIndex + index,
        isNft: false,
        mint: tp.token.address,
        name: tp.token.name,
        symbol: tp.token.symbol,
        image: tp.token.image,
        decimals: decimals,
        prizeAmount: prizeAmountInBaseUnits,
        quantity: numberOfPrizes,
      };
    });

    // Call the addPrizes mutation
    addPrizes.mutate(
      {
        gumballId: gumballId,
        prizes: prizesData,
      },
      {
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["gumball", gumballId] });
        toast.success("Prizes added successfully");
          // Calculate totals for stats update
          let totalQuantity = 0;
          let totalValueInSol = 0;

          // Add prizes to the store after successful transaction
          validPrizes.forEach(tp => {
            const prizeSize = parseFloat(tp.prizeSize) || 0;
            const numberOfPrizes = parseInt(tp.numberOfPrizes) || 0;
            const solValue = prizeValues[tp.id] || 0;
            
            totalQuantity += numberOfPrizes;
            totalValueInSol += solValue;
            
            addPrize({
              id: tp.id,
              category: 'token',
              mint: tp.token.address,
              amount: prizeSize,
              quantity: numberOfPrizes,
              name: tp.token.name,
              symbol: tp.token.symbol,
              image: tp.token.image,
              decimals: tp.token.decimals,
              floorPrice: solValue / numberOfPrizes, // Store per-prize value
            });
          });
          
          // Update prize stats in the store
          updatePrizeStats(totalQuantity, totalValueInSol);
          
          // Reset and close
          setTokenPrizes([]);
          setSelectedToken(null);
          setPrizeValues({});
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setTokenPrizes([]);
    setSelectedToken(null);
    setPrizeValues({});
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-50 focus:outline-none"
      onClose={handleClose}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/70">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-[600px] rounded-2xl bg-white border-2 border-primary-color/20 shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h4 className="text-2xl text-black-1000 font-bold font-inter">Add tokens</h4>
              <button
                onClick={handleClose}
                className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-black-1000 cursor-pointer hover:border-primary-color hover:bg-primary-color/10 transition duration-300"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-4 min-h-[30vh] overflow-y-auto">
              {/* Token Prize Rows */}
              {tokenPrizes.map((prize) => (
                <TokenPrizeRow
                  key={prize.id}
                  prize={prize}
                  onUpdate={handleUpdatePrize}
                  onRemove={handleRemoveToken}
                  onValueChange={handleValueChange}
                />
              ))}

              {/* Add Token Dropdown */}
              {availableTokens.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-start gap-4">
                    {/* Empty Token Placeholder */}
                    <div className="w-16 h-16 rounded-xl bg-gray-1300 flex-shrink-0 border border-gray-1100 flex items-center justify-center">
                      {selectedToken ? (
                        <img 
                          src={selectedToken.image} 
                          alt={selectedToken.symbol}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="#BDBDBD" strokeWidth="2"/>
                          <path d="M12 8V16M8 12H16" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>

                    {/* Token Selector */}
                    <div className="flex-1">
                      <label className="text-sm text-black-1000 font-medium font-inter mb-2 block">
                        Choose token
                      </label>
                      <Listbox value={selectedToken} onChange={setSelectedToken}>
                        {({ open }) => (
                          <div className="relative">
                            <ListboxButton
                              className={clsx(
                                "relative w-full h-12 px-4 rounded-lg border-2 border-primary-color/30 bg-white cursor-pointer text-left font-inter font-medium focus:outline-none focus:border-primary-color transition",
                                open && "border-primary-color"
                              )}
                            >
                              {selectedToken ? (
                                <span className="flex items-center gap-3 text-black-1000">
                                  <img 
                                    src={selectedToken.image} 
                                    alt={selectedToken.symbol}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  {selectedToken.name} ({selectedToken.symbol})
                                </span>
                              ) : (
                                <span className="text-gray-1200">Select from list</span>
                              )}
                              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                                <svg
                                  width={16}
                                  height={16}
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={clsx("transition-transform", open && "rotate-180")}
                                >
                                  <path
                                    d="M12.6693 6L8.0026 10.6667L3.33594 6"
                                    stroke="#212121"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </ListboxButton>

                            <ListboxOptions
                              className={clsx(
                                "absolute z-100 w-full mt-1 bg-white border border-gray-1100 rounded-lg shadow-lg max-h-60 overflow-auto",
                                "transition duration-100 ease-in data-leave:data-closed:opacity-0"
                              )}
                            >
                              {availableTokens.map((token) => (
                                <ListboxOption
                                  key={token.address}
                                  value={token}
                                  className={clsx(
                                    "flex items-center  gap-3 px-4 py-3 cursor-pointer font-inter font-medium transition",
                                    "data-selected:bg-orange-1000 data-selected:text-black-1000",
                                    "data-focus:bg-gray-1100/50 hover:bg-gray-1100/50"
                                  )}
                                >
                                  <img 
                                    src={token.image} 
                                    alt={token.symbol}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <span>{token.name} ({token.symbol})</span>
                                </ListboxOption>
                              ))}
                            </ListboxOptions>
                          </div>
                        )}
                      </Listbox>
                    </div>
                  </div>

                  {/* Add Token Button */}
                  {selectedToken && (
                    <div className="mt-4 ml-20">
                      <button
                        onClick={handleAddToken}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary-color text-primary-color font-medium font-inter cursor-pointer hover:bg-primary-color hover:text-white transition"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Add Token
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-1100">
              {/* Remaining Prizes Count */}
              <div className="text-right mb-4">
                <span className="text-sm font-medium font-inter text-primary-color">
                  {remainingPrizes} prizes remaining
                </span>
              </div>

              {/* Add Prizes Button */}
              <button
                onClick={handleAddPrizes}
                disabled={tokenPrizes.length === 0 || addPrizes.isPending}
                className={clsx(
                  "w-full h-14 rounded-full font-semibold font-inter text-lg transition duration-300",
                  "bg-gradient-to-r from-primary-color via-orange-400 to-primary-color text-white",
                  "hover:shadow-lg hover:shadow-primary-color/30",
                  (tokenPrizes.length === 0 || addPrizes.isPending) && "opacity-50 cursor-not-allowed"
                )}
              >
                {addPrizes.isPending ? "Adding prizes..." : "Add prizes"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

