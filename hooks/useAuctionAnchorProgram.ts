/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { useAnchorProvider } from "../src/providers/SolanaProvider";
import auctionIdl from "../types/auction.json";
import type { Auction } from "../types/auction";
import { getTokenProgramFromMint, getAtaAddress, ensureAtaIx } from './helpers';

export const AUCTION_PROGRAM_ID = new anchor.web3.PublicKey(auctionIdl.address);

/** * Returns a fully configured Anchor Program instance */
export function useAuctionAnchorProgram() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const provider = useAnchorProvider();

    /* ---------------- Program ---------------- */
    const auctionProgram = useMemo(
        () => getAuctionProgram(provider),
        [provider, AUCTION_PROGRAM_ID]
    );

    /* ---------------- PDA helpers ---------------- */
    /** AuctionConfig PDA */
    const auctionConfigPda = useMemo(() => {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("auction")],
            AUCTION_PROGRAM_ID
        )[0];
    }, []);

    /** Auction PDA by auction_id */
    const auctionPda = (auctionId: number): PublicKey => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("auction"),
                new BN(auctionId).toArrayLike(Buffer, "le", 4), // u32
            ],
            AUCTION_PROGRAM_ID
        )[0];
    };

    /* ---------------- State Queries ---------------- */
    /** Fetch auction config */
    const getAuctionConfig = useQuery({
        queryKey: ["auctionConfig"],
        enabled: !!auctionProgram,
        queryFn: async () => {
            if (!auctionProgram) throw new Error("Program not ready");
            return auctionProgram.account.auctionConfig.fetch(auctionConfigPda);
        },
    });

    /** Fetch all auctions */
    const getAllAuctions = useQuery({
        queryKey: ["auctions", "all"],
        enabled: !!auctionProgram,
        queryFn: async () => {
            if (!auctionProgram) throw new Error("Program not ready");
            return auctionProgram.account.auction.all();
        },
    });

    /**
     * Fetch a single auction by ID
     * Usage:
     * const auction = useQuery(getAuctionById(1));
     */
    const getAuctionById = useCallback(
        (auctionId: number) => ({
            queryKey: ["auction", auctionId],
            enabled: !!auctionProgram && auctionId > 0,
            queryFn: async () => {
                if (!auctionProgram) throw new Error("Program not ready");
                return auctionProgram.account.auction.fetch(
                    auctionPda(auctionId)
                );
            },
        }),
        [auctionProgram]
    );

    const initializeAuctionConfigMutation = useMutation({
        mutationKey: ["auction", "config", "initialize"],
        mutationFn: async (args: {
            auctionOwner: PublicKey;
            auctionAdmin: PublicKey;
            creationFeeLamports: number;
            commissionBps: number;
            minimumAuctionPeriod: number;
            maximumAuctionPeriod: number;
            minimumTimeExtension: number;
            maximumTimeExtension: number;
        }) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await auctionProgram.methods
                .initializeAuctionConfig(
                    args.auctionOwner,
                    args.auctionAdmin,
                    new BN(args.creationFeeLamports),
                    args.commissionBps,
                    args.minimumAuctionPeriod,
                    args.maximumAuctionPeriod,
                    args.minimumTimeExtension,
                    args.maximumTimeExtension
                )
                .accounts({
                    payer: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Auction config Initialized TX: ", tx);
        },
        onError: (error) => {
            console.log("Auction config Initialization Failed: ", error);
        },
    });

    const updateAuctionOwnerMutation = useMutation({
        mutationKey: ["auction", "config", "updateOwner"],
        mutationFn: async (newAuctionOwner: PublicKey) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await auctionProgram.methods
                .updateAuctionOwner(newAuctionOwner)
                .accounts({
                    auctionOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Update Auction config owner TX: ", tx);
        },
        onError: (error) => {
            console.log("Update Auction config owner Failed: ", error);
        },
    });

    const updateAuctionAdminMutation = useMutation({
        mutationKey: ["auction", "config", "updateAdmin"],
        mutationFn: async (newAuctionAdmin: PublicKey) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await auctionProgram.methods
                .updateAuctionAdmin(newAuctionAdmin)
                .accounts({
                    auctionOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Update Auction config admin TX: ", tx);
        },
        onError: (error) => {
            console.log("Update Auction config admin Failed: ", error);
        },
    });

    const updateAuctionConfigDataMutation = useMutation({
        mutationKey: ["auction", "config", "updateData"],
        mutationFn: async (args: {
            creationFeeLamports: number;
            commissionBps: number;
            minimumAuctionPeriod: number;
            maximumAuctionPeriod: number;
            minimumTimeExtension: number;
            maximumTimeExtension: number;
        }) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await auctionProgram.methods
                .updateConfigData(
                    new BN(args.creationFeeLamports),
                    args.commissionBps,
                    args.minimumAuctionPeriod,
                    args.maximumAuctionPeriod,
                    args.minimumTimeExtension,
                    args.maximumTimeExtension
                )
                .accounts({
                    auctionOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Update Auction config data TX: ", tx);
        },
        onError: (error) => {
            console.log("Update Auction config data Failed: ", error);
        },
    });

    const updateAuctionPauseMutation = useMutation({
        mutationKey: ["auction", "config", "pause"],
        mutationFn: async (newPauseFlags: number) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await auctionProgram.methods
                .updatePauseAndUnpause(newPauseFlags)
                .accounts({
                    auctionOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Update pause & unpause TX: ", tx);
        },
        onError: (error) => {
            console.log("Update pause & unpause Failed: ", error);
        },
    });

    const createAuctionMutation = useMutation({
        mutationKey: ["auction", "create"],
        mutationFn: async (args: {
            startTime: number;
            endTime: number;
            startImmediately: boolean;
            isBidMintSol: boolean;
            baseBid: number;
            minIncrement: number;
            timeExtension: number;
            prizeMint: PublicKey;
            bidMint?: PublicKey; // ignored if SOL
        }) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            // // fetch config to get auction_count
            // const config = await auctionProgram.account.auctionConfig.fetch(
            //     auctionConfigPda
            // );

            // const auctionAccountPda = auctionPda(config.auctionCount);

            // const creatorPrizeAta = await getAtaAddress(
            //     connection,
            //     args.prizeMint,
            //     wallet.publicKey
            // );

            // const prizeEscrowAta = await getAtaAddress(
            //     connection,
            //     args.prizeMint,
            //     auctionAccountPda,
            //     true // PDA owner
            // );

            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                args.prizeMint
            );

            return await auctionProgram.methods
                .createAuction(
                    new BN(args.startTime),
                    new BN(args.endTime),
                    args.startImmediately,
                    args.isBidMintSol,
                    new BN(args.baseBid),
                    new BN(args.minIncrement),
                    args.timeExtension
                )
                .accounts({
                    creator: wallet.publicKey,
                    auctionAdmin: AUCTION_ADMIN_KEYPAIR.publicKey,

                    prizeMint: args.prizeMint,
                    bidMint: args.bidMint ?? FAKE_MINT,

                    prizeTokenProgram,
                })
                .signers([AUCTION_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Auction created:", tx);
        },
        onError: (error) => {
            console.error("Create auction failed:", error);
        },
    });

    const updateAuctionMutation = useMutation({
        mutationKey: ["auction", "update"],
        mutationFn: async (args: {
            auctionId: number;
            startTime: number;
            endTime: number;
            startImmediately: boolean;
            baseBid: number;
            minIncrement: number;
            timeExtension: number;
        }) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await auctionProgram.methods
                .updateAuction(
                    args.auctionId,
                    new BN(args.startTime),
                    new BN(args.endTime),
                    args.startImmediately,
                    new BN(args.baseBid),
                    new BN(args.minIncrement),
                    args.timeExtension
                )
                .accounts({
                    creator: wallet.publicKey,
                    auctionAdmin: AUCTION_ADMIN_KEYPAIR.publicKey,
                })
                .signers([AUCTION_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Auction updated:", tx);
        },
        onError: (error) => {
            console.error("Auction update failed:", error);
        },
    });

    const cancelAuctionMutation = useMutation({
        mutationKey: ["auction", "cancel"],
        mutationFn: async (auctionId: number) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const auctionAccountPda = auctionPda(auctionId);

            const auctionData = await auctionProgram.account.auction.fetch(
                auctionAccountPda
            );

            // const prizeEscrow = await getAtaAddress(
            //     connection,
            //     auctionData.prizeMint,
            //     auctionAccountPda,
            //     true
            // );

            // const creatorPrizeAta = await getAtaAddress(
            //     connection,
            //     auctionData.prizeMint,
            //     wallet.publicKey
            // );

            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                auctionData.prizeMint
            );

            return await auctionProgram.methods
                .cancelAuction(auctionId)
                .accounts({
                    creator: wallet.publicKey,
                    auctionAdmin: AUCTION_ADMIN_KEYPAIR.publicKey,

                    prizeMint: auctionData.prizeMint,

                    prizeTokenProgram,
                })
                .signers([AUCTION_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Auction cancelled:", tx);
        },
        onError: (error) => {
            console.error("Cancel auction failed:", error);
        },
    });

    const completeAuctionMutation = useMutation({
        mutationKey: ["auction", "complete"],
        mutationFn: async (auctionId: number) => {
            if (!auctionProgram) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            /* ---------------- PDAs ---------------- */
            const auctionAccountPda = auctionPda(auctionId);

            const auctionData = await auctionProgram.account.auction.fetch(
                auctionAccountPda
            );

            const prizeMint = auctionData.prizeMint;
            const bidMint = auctionData.bidMint ?? FAKE_MINT;

            /* ---------------- Prize escrow (already exists) ---------------- */
            const prizeEscrow = await getAtaAddress(
                connection,
                prizeMint,
                auctionAccountPda,
                true
            );

            /* ---------------- Creator prize ATA (already exists) ---------------- */
            const creatorPrizeAta = await getAtaAddress(
                connection,
                prizeMint,
                auctionData.creator
            );

            /* ---------------- Winner prize ATA (MUST ensure) ---------------- */
            let winnerPrizeAta = FAKE_ATA;

            if (!auctionData.highestBidder.equals(PublicKey.default)) {
                const prizeTokenProgram = await getTokenProgramFromMint(
                    connection,
                    prizeMint
                );

                const res = await ensureAtaIx({
                    connection,
                    mint: prizeMint,
                    owner: auctionData.highestBidder,
                    payer: AUCTION_ADMIN_KEYPAIR.publicKey,
                    tokenProgram: prizeTokenProgram,
                });

                winnerPrizeAta = res.ata;
                if (res.ix) tx.add(res.ix);
            }

            /* ---------------- Token programs ---------------- */
            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                prizeMint
            );

            const bidTokenProgram = await getTokenProgramFromMint(
                connection,
                bidMint
            );

            /* ---------------- Bid-side accounts (already exist) ---------------- */
            let bidEscrow = FAKE_ATA;
            let bidFeeTreasuryAta = FAKE_ATA;
            let creatorBidAta = FAKE_ATA;

            if (auctionData.bidMint !== null) {
                // Escrow already exists (created during first buy)
                bidEscrow = await getAtaAddress(
                    connection,
                    bidMint,
                    auctionAccountPda,
                    true
                );

                /* -------- Ensure fee treasury ATA (owner = config PDA) -------- */
                const feeTreasuryRes = await ensureAtaIx({
                    connection,
                    mint: bidMint,
                    owner: auctionConfigPda,
                    payer: AUCTION_ADMIN_KEYPAIR.publicKey,
                    tokenProgram: bidTokenProgram,
                    allowOwnerOffCurve: true, // PDA owner
                });

                bidFeeTreasuryAta = feeTreasuryRes.ata;
                if (feeTreasuryRes.ix) {
                    tx.add(feeTreasuryRes.ix);
                }

                /* -------- Ensure creator bid ATA (owner = creator wallet) -------- */
                const creatorBidRes = await ensureAtaIx({
                    connection,
                    mint: bidMint,
                    owner: auctionData.creator,
                    payer: AUCTION_ADMIN_KEYPAIR.publicKey,
                    tokenProgram: bidTokenProgram,
                });

                creatorBidAta = creatorBidRes.ata;
                if (creatorBidRes.ix) {
                    tx.add(creatorBidRes.ix);
                }
            }

            /* ---------------- Anchor instruction ---------------- */
            const ix = await auctionProgram.methods
                .completeAuction(auctionId)
                .accounts({
                    auctionAdmin: AUCTION_ADMIN_KEYPAIR.publicKey,
                    creator: auctionData.creator,
                    winner: auctionData.highestBidder,

                    prizeMint,
                    bidMint,

                    prizeEscrow,
                    bidEscrow,

                    creatorPrizeAta,
                    winnerPrizeAta,

                    bidFeeTreasuryAta,
                    creatorBidAta,

                    prizeTokenProgram,
                    bidTokenProgram,
                })
                .instruction();

            tx.add(ix);

            /* ---------------- Send TX ---------------- */
            return await provider.sendAndConfirm(tx, [
                AUCTION_ADMIN_KEYPAIR,
            ]);
        },
        onSuccess: (tx) => {
            console.log("Auction completed:", tx);
        },
        onError: (error) => {
            console.log("Complete auction failed:", error);
        },
    });

    const startAuctionMutation = useMutation({
        mutationKey: ["auction", "start"],
        mutationFn: async (auctionId: number) => {
            if (!auctionProgram) {
                throw new Error("Wallet not ready");
            }

            return await auctionProgram.methods
                .startAuction(auctionId)
                .accounts({
                    auctionAdmin: AUCTION_ADMIN_KEYPAIR.publicKey,
                })
                .signers([AUCTION_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Auction started:", tx);
        },
        onError: (error) => {
            console.error("Start auction failed:", error);
        },
    });

    const withdrawAuctionSolFeesMutation = useMutation({
        mutationKey: ["auction", "withdrawSolFees"],
        mutationFn: async (args: {
            amount: number;
            receiver: PublicKey;
        }) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await auctionProgram.methods
                .withdrawSolFees(new BN(args.amount))
                .accounts({
                    owner: wallet.publicKey,
                    receiver: args.receiver,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("SOL fees withdrawn:", tx);
        },
        onError: (error) => {
            console.error("Withdraw SOL fees failed:", error);
        },
    });

    const withdrawAuctionSplFeesMutation = useMutation({
        mutationKey: ["auction", "withdrawSplFees"],
        mutationFn: async (args: {
            amount: number;
            feeMint: PublicKey;
            receiver: PublicKey;
        }) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            /* ---------------- Token program ---------------- */
            const tokenProgram = await getTokenProgramFromMint(
                connection,
                args.feeMint
            );

            /* ---------------- ATAs ---------------- */
            // Fee treasury ATA (owner = auction config PDA)
            const treasuryRes = await ensureAtaIx({
                connection,
                mint: args.feeMint,
                owner: auctionConfigPda,
                payer: wallet.publicKey,
                tokenProgram,
                allowOwnerOffCurve: true, // PDA owner
            });

            // const feeTreasuryAta = treasuryRes.ata;
            if (treasuryRes.ix) tx.add(treasuryRes.ix);

            // Receiver ATA (owner = receiver wallet or PDA)
            const receiverRes = await ensureAtaIx({
                connection,
                mint: args.feeMint,
                owner: args.receiver,
                payer: wallet.publicKey,
                tokenProgram,
                allowOwnerOffCurve: true,
            });

            const receiverFeeAta = receiverRes.ata;
            if (receiverRes.ix) tx.add(receiverRes.ix);

            /* ---------------- Anchor Instruction ---------------- */
            const ix = await auctionProgram.methods
                .withdrawSplFees(new BN(args.amount))
                .accounts({
                    owner: wallet.publicKey,

                    feeMint: args.feeMint,

                    receiverFeeAta,

                    tokenProgram,
                })
                .instruction();

            tx.add(ix);

            /* ---------------- Send TX ---------------- */
            return await provider.sendAndConfirm(tx);
        },
        onSuccess: (tx) => {
            console.log("Auction SPL Fees withdrawn:", tx);
        },
        onError: (error) => {
            console.log("Withdraw Auction SPL Fees Failed:", error);
        },
    });

    const placeBidMutation = useMutation({
        mutationKey: ["auction", "placeBid"],
        mutationFn: async (args: {
            auctionId: number;
            bidAmount: number;
        }) => {
            if (!auctionProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            /* ---------------- PDAs ---------------- */
            const auctionAccountPda = auctionPda(args.auctionId);

            const auctionData = await auctionProgram.account.auction.fetch(
                auctionAccountPda
            );

            const isSolBid = auctionData.bidMint === null;
            const bidMint = auctionData.bidMint ?? FAKE_MINT;

            let currentBidderAta: PublicKey = FAKE_ATA;
            let prevBidderAta: PublicKey = FAKE_ATA;
            let bidEscrow: PublicKey = FAKE_ATA;

            /* ---------------- Token program ---------------- */
            const bidTokenProgram = await getTokenProgramFromMint(
                connection,
                bidMint
            );

            if (!isSolBid) {
                /* -------- Ensure Escrow ATA -------- */
                const escrowRes = await ensureAtaIx({
                    connection,
                    mint: bidMint,
                    owner: auctionAccountPda,
                    payer: wallet.publicKey,
                    tokenProgram: bidTokenProgram,
                    allowOwnerOffCurve: true,
                });

                bidEscrow = escrowRes.ata;
                if (escrowRes.ix) tx.add(escrowRes.ix);

                /* -------- Ensure current bidder ATA -------- */
                const currentRes = await ensureAtaIx({
                    connection,
                    mint: bidMint,
                    owner: wallet.publicKey,
                    payer: wallet.publicKey,
                    tokenProgram: bidTokenProgram,
                });

                currentBidderAta = currentRes.ata;
                if (currentRes.ix) tx.add(currentRes.ix);

                /* -------- Ensure previous bidder ATA (refund path) -------- */
                if (!auctionData.highestBidder.equals(PublicKey.default)) {
                    const prevRes = await ensureAtaIx({
                        connection,
                        mint: bidMint,
                        owner: auctionData.highestBidder,
                        payer: wallet.publicKey,
                        tokenProgram: bidTokenProgram,
                    });

                    prevBidderAta = prevRes.ata;
                    if (prevRes.ix) tx.add(prevRes.ix);
                }
            }

            /* ---------------- Anchor instruction ---------------- */
            const ix = await auctionProgram.methods
                .placeBid(
                    args.auctionId,
                    new BN(args.bidAmount)
                )
                .accounts({
                    bidder: wallet.publicKey,
                    auctionAdmin: AUCTION_ADMIN_KEYPAIR.publicKey,

                    prevBidderAccount: auctionData.highestBidder,

                    bidMint,
                    currentBidderAta,
                    prevBidderAta,
                    bidEscrow,

                    bidTokenProgram,
                })
                .instruction();

            tx.add(ix);

            /* ---------------- Send TX ---------------- */
            return await provider.sendAndConfirm(tx, [
                AUCTION_ADMIN_KEYPAIR,
            ]);
        },
        onSuccess: (tx) => {
            console.log("Bid placed:", tx);
        },
        onError: (error) => {
            console.log("Place bid failed:", error);
        },
    });


    /* ---------------- Return API ---------------- */
    return {
        /* ---------------- Program ---------------- */
        auctionProgram,

        /* ---------------- PDAs ---------------- */
        auctionConfigPda,
        auctionPda,

        /* ---------------- Queries ---------------- */
        getAuctionConfig,
        getAllAuctions,
        getAuctionById,

        /* ---------------- Config / Admin (Owner only) ---------------- */
        initializeAuctionConfigMutation,
        updateAuctionOwnerMutation,
        updateAuctionAdminMutation,
        updateAuctionConfigDataMutation,
        updateAuctionPauseMutation,

        /* ---------------- Auction Lifecycle ---------------- */
        createAuctionMutation,
        updateAuctionMutation,
        cancelAuctionMutation,
        startAuctionMutation,
        completeAuctionMutation,

        /* ---------------- Bidding ---------------- */
        placeBidMutation,

        /* ---------------- Fee Withdrawals ---------------- */
        withdrawAuctionSolFeesMutation,
        withdrawAuctionSplFeesMutation,
    };

}

function getAuctionProgram(provider: anchor.AnchorProvider): anchor.Program<Auction> {
    return new anchor.Program<Auction>(auctionIdl as anchor.Idl, provider);
}

const FAKE_MINT = new PublicKey('So11111111111111111111111111111111111111112');
const FAKE_ATA = new PublicKey('B9W4wPFWjTbZ9ab1okzB4D3SsGY7wntkrBKwpp5RC1Uv')
const AUCTION_ADMIN_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from([214, 195, 221, 90, 116, 238, 191, 49, 125, 52, 76, 239, 68, 25, 144, 85, 125, 238, 21, 60, 157, 1, 180, 229, 79, 34, 252, 213, 224, 131, 52, 3, 33, 100, 214, 59, 229, 171, 12, 132, 229, 175, 48, 210, 5, 182, 82, 46, 140, 62, 152, 210, 153, 80, 185, 240, 181, 75, 2, 7, 87, 48, 51, 49]));