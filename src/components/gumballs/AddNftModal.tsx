import { Dialog, DialogPanel } from "@headlessui/react";
import { useState, useMemo } from "react";
import clsx from "clsx";
import { useGumballById } from "hooks/useGumballsQuery";
import type { GumballBackendDataType } from "types/backend/gumballTypes";
import { useFetchUserNfts } from "hooks/useFetchUserNfts";
import { useGetCollectionFP } from "hooks/useGetCollectionFP";
import { toast } from "react-hot-toast";
import { useAddPrizes, type AddPrizeInputData } from "hooks/useAddPrizes";
import { useQueryClient } from "@tanstack/react-query";
import { useGumballStore } from "store/useGumballStore";

interface NftItem {
  id: string;
  name: string;
  image: string;
  floorPrice: number;
  mint: string;
}

interface AddNftModalProps {
  isOpen: boolean;
  onClose: () => void;
  gumballId: string;
}

const MOCK_NFTS: NftItem[] = [
  {
    id: "1",
    name: "Mad Lads #1234",
    image: "https://madlads.s3.us-west-2.amazonaws.com/images/1234.png",
    floorPrice: 125.5,
    mint: "Mad1234567890abcdefghijklmnopqrstuvwxyz",
  },
  {
    id: "2",
    name: "Tensorian #5678",
    image: "https://madlads.s3.us-west-2.amazonaws.com/images/5678.png",
    floorPrice: 45.2,
    mint: "Ten5678901234567890abcdefghijklmnopqrst",
  },
  {
    id: "3",
    name: "SMB Gen2 #9012",
    image: "https://madlads.s3.us-west-2.amazonaws.com/images/9012.png",
    floorPrice: 89.8,
    mint: "SMB9012345678901234567890abcdefghijklmn",
  },
  {
    id: "4",
    name: "Degods #3456",
    image: "https://madlads.s3.us-west-2.amazonaws.com/images/3456.png",
    floorPrice: 210.4,
    mint: "Deg3456789012345678901234567890abcdefgh",
  },
  {
    id: "5",
    name: "Okay Bears #7890",
    image: "https://madlads.s3.us-west-2.amazonaws.com/images/7890.png",
    floorPrice: 67.3,
    mint: "Oak7890123456789012345678901234567890ab",
  },
];

export default function AddNftModal({ isOpen, onClose, gumballId }: AddNftModalProps) {
  const { data: gumball } = useGumballById(gumballId) as { data: GumballBackendDataType };
  const { addPrize, prizes:  updatePrizeStats } = useGumballStore();
  const { addPrizes } = useAddPrizes();
  const queryClient = useQueryClient();
  const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const {userNfts, isLoading: isLoadingNfts, error: errorNfts} = useFetchUserNfts();
  const { collectionFPs, collectionFPMap, isLoading: isLoadingCollectionFP, hasError: hasErrorCollectionFP } = useGetCollectionFP();

  const nfts = useMemo(()=>{
    return userNfts.map((nft: any) => ({
      id: nft.id,
      name: nft.content.metadata.name,
      image: nft.content.links.image,
      floorPrice: collectionFPMap[nft.grouping[0].group_value],
      mint: nft.id, 
    }));
  }, [userNfts, collectionFPMap]);


  const totalPrizesAdded = useMemo(() => {
    return gumball?.prizes.reduce((sum, prize) => sum + prize.quantity, 0) || 0;
  }, [gumball?.prizes]);

  const maxPrizes = gumball?.maxPrizes || 0;
  const remainingPrizes = maxPrizes - totalPrizesAdded;
  const localRemainingPrizes = remainingPrizes - selectedNfts.size;

  const filteredNfts = useMemo(() => {
    if (!searchQuery.trim()) return nfts;
    const query = searchQuery.toLowerCase();
    return nfts.filter((nft: any) => 
      nft.name.toLowerCase().includes(query)
    );
  }, [searchQuery,userNfts]);

  const toggleNftSelection = (nftId: string) => {
    setSelectedNfts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nftId)) {
        newSet.delete(nftId);
      } else {
        if (localRemainingPrizes > 0) {
          newSet.add(nftId);
        }
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedNfts.size === filteredNfts.length) {
      setSelectedNfts(new Set());
    } else {
      const nftsToSelect = filteredNfts.slice(0, remainingPrizes);
      setSelectedNfts(new Set(nftsToSelect.map((nft: any) => nft.id)));
    }
  };

  const handleSelectNone = () => {
    setSelectedNfts(new Set());
  };

  const handleAddPrizes = async () => {
    const selectedNftData = nfts.filter((nft: any) => selectedNfts.has(nft.id));
    
    if (selectedNftData.length === 0) return;

    const startingPrizeIndex = gumball?.prizesAdded || 0;


    const prizesData: AddPrizeInputData[] = selectedNftData.map((nft: any, index: number) => {
      return {
        prizeIndex: startingPrizeIndex + 1,
        isNft: true,
        mint: nft.mint,
        name: nft.name,
        image: nft.image,
        prizeAmount: nft.floorPrice || 0, 
        quantity: 1, 
        floorPrice: String(nft.floorPrice || 0),
      };
    });

    addPrizes.mutate(
      {
        gumballId: gumballId,
        prizes: prizesData,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["gumball", gumballId] });
          toast.success("NFT prizes added successfully");
          
          let totalQuantity = 0;
          let totalValueInSol = 0;

          selectedNftData.forEach((nft: any) => {
            const floorPrice = nft.floorPrice || 0;
            
            totalQuantity += 1;
            totalValueInSol += floorPrice;
            
            addPrize({
              id: nft.id,
              category: 'nft',
              mint: nft.mint,
              amount: 1,
              quantity: 1,
              name: nft.name,
              image: nft.image,
              floorPrice: floorPrice,
            });
          });
          
          
          handleClose();
        },
      }
    );
  };
  const handleClose = () => {
    setSelectedNfts(new Set());
    setSearchQuery("");
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
            className="w-full max-w-[800px] rounded-2xl bg-white border-2 border-primary-color/40 shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
          >
            <div className="flex items-center justify-end px-6 pt-6 pb-2">
              <button
                onClick={handleClose}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-white cursor-pointer hover:bg-gray-100 transition duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2L14 14M2 14L14 2" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="px-6 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search nft name"
                    className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-primary-color/50 bg-transparent text-black-1000 placeholder:text-black-1000/50 font-medium font-inter focus:outline-none focus:border-primary-color transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-primary-color font-semibold font-inter">
                  {selectedNfts.size}/{filteredNfts.length} selected
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className="text-primary-color font-semibold font-inter hover:text-purple-300 transition cursor-pointer"
                  >
                    Select all
                  </button>
                  <span className="text-gray-500">|</span>
                  <button
                    onClick={handleSelectNone}
                    className="text-primary-color font-semibold font-inter hover:text-purple-300 transition cursor-pointer"
                  >
                    Select none
                  </button>
                </div>
              </div>
            </div>

            <div className="px-11 pb-3">
              <div className="grid grid-cols-[50px_1fr_150px] gap-4 text-left">
                <span className="text-sm font-semibold text-gray-300 font-inter">NFT</span>
                <span className="text-sm font-semibold text-gray-300 font-inter">Title</span>
                <span className="text-sm font-semibold text-gray-300 font-inter">Floor price</span>
              </div>
            </div>

            <div className="px-6 pb-6 min-h-[40vh] max-h-[50vh] overflow-y-auto">
              {filteredNfts.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-xl font-semibold text-gray-400 font-inter">No NFTs found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNfts.map((nft: any) => {
                    const isSelected = selectedNfts.has(nft.id);
                    return (
                      <div
                        key={nft.id}
                        onClick={() => toggleNftSelection(nft.id)}
                        className={clsx(
                          "relative grid grid-cols-[50px_1fr_150px] gap-4 items-center p-4 rounded-xl cursor-pointer transition duration-200",
                          isSelected 
                            ? "bg-primary-color/20 border-2 border-primary-color" 
                            : "bg-white/5 border-2 border-transparent hover:bg-black/10"
                        )}
                      >
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                          <img 
                            src={nft.image} 
                            alt={nft.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/placeholder-user.png";
                            }}
                          />
                        </div>

                        <div className="font-medium text-black-1000 font-inter truncate">
                          {nft.name}
                        </div>

                        <div className="font-semibold text-black-1000 font-inter">
                          {nft.floorPrice ? nft.floorPrice.toFixed(2) : 0} SOL
                        </div>

                        {isSelected && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-5 border-t flex items-center justify-between flex-col border-primary-color/30">
              <div className="text-right mb-4">
                <span className="text-sm font-semibold font-inter text-primary-color">
                  {localRemainingPrizes} prizes remaining
                </span>
              </div>

              <button
                onClick={handleAddPrizes}
                disabled={selectedNfts.size === 0}
                className={clsx(
                  "w-[50%] h-14 rounded-full font-semibold font-inter text-lg transition duration-300",
                  selectedNfts.size > 0
                    ? "bg-primary-color text-black-1000 hover:shadow-lg cursor-pointer"
                    : "bg-primary-color text-black-1000 cursor-not-allowed opacity-50"
                )}
              >
                Add prizes
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

