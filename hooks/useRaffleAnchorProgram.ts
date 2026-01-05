/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { useAnchorProvider } from "../src/providers/SolanaProvider";
import raffleIdl from "../types/raffle.json";
import type { Raffle } from "../types/raffle";
import { getTokenProgramFromMint, ensureAtaIx } from './helpers';

export const RAFFLE_PROGRAM_ID = new anchor.web3.PublicKey(raffleIdl.address);

/** * Returns a fully configured Anchor Program instance */
export function useRaffleAnchorProgram() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const provider = useAnchorProvider();

    /* ---------------- Program ---------------- */
    const raffleProgram = useMemo(
        () => getRaffleProgram(provider),
        [provider, RAFFLE_PROGRAM_ID]
    );

    /* ---------------- PDA helpers ---------------- */
    const raffleConfigPda = useMemo(() => {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("raffle")],
            RAFFLE_PROGRAM_ID
        )[0];
    }, []);

    const rafflePda = (raffleId: number): PublicKey => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("raffle"),
                new BN(raffleId).toArrayLike(Buffer, "le", 4), // u32
            ],
            RAFFLE_PROGRAM_ID
        )[0];
    };

    const raffleBuyerPda = (raffleId: number, buyerAddress: string): PublicKey => {
        const buyerPubkey = new PublicKey(buyerAddress);

        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("raffle"),
                new BN(raffleId).toArrayLike(Buffer, "le", 4),
                buyerPubkey.toBuffer(),
            ],
            RAFFLE_PROGRAM_ID
        )[0];
    };

    /* ---------------- State query fucntions ---------------- */
    const getRaffleConfig = useQuery({
        queryKey: ["raffleConfig"],
        enabled: !!raffleProgram,
        queryFn: async () => {
            if (!raffleProgram) throw new Error("Program not ready");
            return raffleProgram.account.raffleConfig.fetch(raffleConfigPda);
        },
    });

    // result.data = [[...], [...], ....]
    const getAllRaffles = useQuery({
        queryKey: ["raffles", "all"],
        enabled: !!raffleProgram,
        queryFn: async () => {
            if (!raffleProgram) throw new Error("Program not ready");
            return raffleProgram.account.raffle.all();
        },
    });

    // result.data = [[...], [...], ....]
    const getAllRaffleBuyers = useQuery({
        queryKey: ["raffleBuyers", "all"],
        enabled: !!raffleProgram,
        queryFn: async () => {
            if (!raffleProgram) throw new Error("Program not ready");
            return raffleProgram.account.buyer.all();
        },
    });

    /**
     * Fetch a PARTICULAR raffle by raffle_id
     * Usage: const sampleRaffle = useQuery(getRaffleById(1));
     * console.log(sampleRaffle.data)
     */
    const getRaffleById = useCallback((raffleId: number) => {
        return {
            queryKey: ["raffle", raffleId],
            enabled: !!raffleProgram && raffleId > 0,
            queryFn: async () => {
                if (!raffleProgram) throw new Error("Program not ready");
                return raffleProgram.account.raffle.fetch(rafflePda(raffleId));
            },
        };
    }, [raffleProgram]);

    /**
     * Fetch a PARTICULAR raffle buyer by raffle_id & buyer address
     * Usage: const sampleRaffleBuyer = useQuery(getRaffleBuyer(1, "414C5ffjEmZaVdrptaA5TfWWNsLWFVM6aqZfPvwsxsmr"));
     * console.log(sampleRaffleBuyer.data)
     */
    const getRaffleBuyer = useCallback((raffleId: number, buyerAddress: string) => {
        return {
            queryKey: ["buyer", raffleId, buyerAddress],
            enabled: !!raffleProgram && raffleId > 0 && buyerAddress !== '',
            queryFn: async () => {
                if (!raffleProgram) throw new Error("Program not ready");
                return raffleProgram.account.buyer.fetch(raffleBuyerPda(raffleId, buyerAddress));
            },
        };
    }, [raffleProgram]);

    /**
     * Fetch all buyer data for particular raffle
     * Usage: const sampleBuyersByRaffle = useQuery(getBuyersByRaffle(1));
     * console.log(sampleBuyersByRaffle.data)
     */
    const getBuyersByRaffle = useCallback((raffleId: number) => {
        return {
            queryKey: ["buyers", raffleId],
            enabled: !!raffleProgram && raffleId > 0,
            queryFn: async () => {
                if (!raffleProgram) throw new Error("Program not ready");

                return raffleProgram.account.buyer.all([
                    {
                        memcmp: {
                            offset: 8, // discriminator
                            bytes: Buffer.from(new BN(raffleId).toArrayLike(Buffer, "le", 4)).toString('hex'),
                        },
                    },
                ]);
            },
        };
    },
        [raffleProgram]
    );

    /* ---------------- Create Raffle Mutation --------------- */
    const createRaffleMutation = useMutation({
        mutationKey: ["raffle", "create"],
        mutationFn: async (args: CreateRaffleArgs) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            // ---------------- Fetch config ----------------
            const config = await raffleProgram.account.raffleConfig.fetch(
                raffleConfigPda
            );

            // ---------------- Derive raffle PDA ----------------
            const rafflePda = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("raffle"),
                    new BN(config.raffleCount).toArrayLike(Buffer, "le", 4),
                ],
                raffleProgram.programId
            )[0];

            // ---------------- Resolve mints ----------------
            const ticketMint = args.isTicketSol ? FAKE_MINT : args.ticketMint;
            const prizeMint = args.prizeType === PrizeType.Sol ? FAKE_MINT : args.prizeMint;

            // ---------------- Resolve token programs ----------------
            const ticketTokenProgram = await getTokenProgramFromMint(
                connection,
                ticketMint
            );

            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                prizeMint
            );

            // ---------------- Ticket Escrow ATA ----------------
            let ticketEscrow = FAKE_ATA;

            if (!args.isTicketSol) {
                const res = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: rafflePda,
                    payer: wallet.publicKey,
                    tokenProgram: ticketTokenProgram,
                    allowOwnerOffCurve: true,
                });

                ticketEscrow = res.ata;
                if (res.ix) tx.add(res.ix);
            }

            // ---------------- Prize Escrow + Creator ATA ----------------
            let prizeEscrow = FAKE_ATA;
            let creatorPrizeAta = FAKE_ATA;

            if (args.prizeType !== PrizeType.Sol) {
                const escrowRes = await ensureAtaIx({
                    connection,
                    mint: prizeMint,
                    owner: rafflePda,
                    payer: wallet.publicKey,
                    tokenProgram: prizeTokenProgram,
                    allowOwnerOffCurve: true,
                });

                prizeEscrow = escrowRes.ata;
                if (escrowRes.ix) tx.add(escrowRes.ix);

                const creatorRes = await ensureAtaIx({
                    connection,
                    mint: prizeMint,
                    owner: wallet.publicKey,
                    payer: wallet.publicKey,
                    tokenProgram: prizeTokenProgram,
                });

                creatorPrizeAta = creatorRes.ata;
                if (creatorRes.ix) tx.add(creatorRes.ix);
            }

            // ---------------- Anchor Instruction ----------------
            const ix = await raffleProgram.methods
                .createRaffle(
                    new BN(args.startTime.toString()),
                    new BN(args.endTime.toString()),
                    args.totalTickets,
                    new BN(args.ticketPrice),
                    args.isTicketSol,
                    args.maxPerWalletPct,
                    prizeTypeToAnchor(args.prizeType),
                    new BN(args.prizeAmount),
                    args.numWinners,
                    Buffer.from(args.winShares),
                    args.isUniqueWinners,
                    args.startRaffle,
                    args.maximumTickets,
                )
                .accounts({
                    creator: wallet.publicKey,
                    raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,

                    ticketMint,
                    prizeMint,

                    ticketEscrow,
                    prizeEscrow,
                    creatorPrizeAta,

                    ticketTokenProgram,
                    prizeTokenProgram,
                })
                .instruction();

            tx.add(ix);

            // ---------------- Send TX ----------------
            return await provider.sendAndConfirm(tx, [
                RAFFLE_ADMIN_KEYPAIR, // admin signer only
            ]);
        },
        onSuccess: (txSig) => {
            console.log("Create Raffle success:", txSig);
        },
        onError: (error) => {
            console.log("Create Raffle failed:", error);
        },
    });

    /* ---------------- Activate Raffle Mutation --------------- */
    const activateRaffleMutation = useMutation({
        mutationKey: ["raffle", "activate"],
        mutationFn: async (raffleId: number) => {
            if (!raffleProgram) {
                throw new Error("Program not ready");
            }

            return await raffleProgram.methods
                .activateRaffle(raffleId)
                .accounts({
                    raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,
                })
                .signers([RAFFLE_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Activate Raffle: ", tx);
        },
        onError: (error) => {
            console.log("Activate Raffle Failed: ", error);
        },
    });

    /* ---------------- Announce Winners Mutation ---------------- */
    const announceWinnersMutation = useMutation({
        mutationKey: ["raffle", "announceWinners"],
        mutationFn: async (args: {
            raffleId: number;
            winners: PublicKey[];
        }) => {
            if (!raffleProgram) {
                throw new Error("Program not ready");
            }

            const tx = new Transaction();

            // ---------------- PDAs ----------------
            const raffleAccountPda = rafflePda(args.raffleId);

            const raffleData = await raffleProgram.account.raffle.fetch(
                raffleAccountPda
            );

            // ---------------- Ticket mint ----------------
            const ticketMint = raffleData.ticketMint ?? FAKE_MINT;

            // ---------------- Token program ----------------
            const ticketTokenProgram = await getTokenProgramFromMint(
                connection,
                ticketMint
            );

            // ---------------- Escrow & Treasury ----------------
            let ticketEscrow = FAKE_ATA;
            let ticketFeeTreasury = FAKE_ATA;

            if (raffleData.ticketMint !== null) {
                // Ticket escrow ATA (owner = raffle PDA)
                const escrowRes = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: raffleAccountPda,
                    payer: RAFFLE_ADMIN_KEYPAIR.publicKey,
                    tokenProgram: ticketTokenProgram,
                    allowOwnerOffCurve: true,
                });

                ticketEscrow = escrowRes.ata;
                if (escrowRes.ix) tx.add(escrowRes.ix);

                // Fee treasury ATA (owner = raffle config PDA)
                const treasuryRes = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: raffleConfigPda,
                    payer: RAFFLE_ADMIN_KEYPAIR.publicKey,
                    tokenProgram: ticketTokenProgram,
                    allowOwnerOffCurve: true,
                });

                ticketFeeTreasury = treasuryRes.ata;
                if (treasuryRes.ix) tx.add(treasuryRes.ix);
            }

            // ---------------- Anchor Instruction ----------------
            const ix = await raffleProgram.methods
                .announceWinners(
                    args.raffleId,
                    args.winners
                )
                .accounts({
                    raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,

                    ticketMint,
                    ticketEscrow,
                    ticketFeeTreasury,

                    ticketTokenProgram,
                })
                .instruction();

            tx.add(ix);

            // ---------------- Send TX ----------------
            return await provider.sendAndConfirm(tx, [
                RAFFLE_ADMIN_KEYPAIR,
            ]);
        },
        onSuccess: (tx) => {
            console.log("Winners announced:", tx);
        },
        onError: (error) => {
            console.log("Announce winners failed:", error);
        },
    });

    /* ---------------- Buy Ticket Mutation ---------------- */
    const buyTicketMutation = useMutation({
        mutationKey: ["raffle", "buyTicket"],
        mutationFn: async (args: {
            raffleId: number;
            ticketsToBuy: number;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            // ---------------- PDAs ----------------
            const raffleAccountPda = rafflePda(args.raffleId);

            const buyerAccountPda = raffleBuyerPda(
                args.raffleId,
                wallet.publicKey.toBase58()
            );

            // ---------------- Fetch raffle ----------------
            const raffleData = await raffleProgram.account.raffle.fetch(
                raffleAccountPda
            );

            // ---------------- Ticket mint ----------------
            const isSolTicket = raffleData.ticketMint === null;
            const ticketMint = raffleData.ticketMint ?? FAKE_MINT;

            // ---------------- Token program ----------------
            const ticketTokenProgram = await getTokenProgramFromMint(
                connection,
                ticketMint
            );

            // ---------------- Accounts ----------------
            let buyerTicketAta: PublicKey = FAKE_ATA;
            let ticketEscrow: PublicKey = FAKE_ATA;

            if (!isSolTicket) {
                // Buyer ticket ATA
                const buyerAtaRes = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: wallet.publicKey,
                    payer: wallet.publicKey,
                    tokenProgram: ticketTokenProgram,
                });

                buyerTicketAta = buyerAtaRes.ata;
                if (buyerAtaRes.ix) tx.add(buyerAtaRes.ix);

                // Ticket escrow ATA (owner = raffle PDA)
                const escrowRes = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: raffleAccountPda,
                    payer: wallet.publicKey,
                    tokenProgram: ticketTokenProgram,
                    allowOwnerOffCurve: true,
                });

                ticketEscrow = escrowRes.ata;
                if (escrowRes.ix) tx.add(escrowRes.ix);
            }

            // ---------------- Anchor Instruction ----------------
            const ix = await raffleProgram.methods
                .buyTicket(
                    args.raffleId,
                    args.ticketsToBuy
                )
                .accounts({
                    buyer: wallet.publicKey,
                    raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,

                    ticketMint,
                    buyerTicketAta,
                    ticketEscrow,

                    ticketTokenProgram,
                })
                .instruction();

            tx.add(ix);

            // ---------------- Send TX ----------------
            return await provider.sendAndConfirm(tx, [
                RAFFLE_ADMIN_KEYPAIR,
            ]);
        },
        onSuccess: (tx) => {
            console.log("Buy Ticket TX:", tx);
        },
        onError: (error) => {
            console.log("Buy Ticket Failed:", error);
        },
    });

    /* ---------------- Buyer Claim Prize Mutation ---------------- */
    const buyerClaimPrizeMutation = useMutation({
        mutationKey: ["raffle", "buyerClaimPrize"],
        mutationFn: async (args: {
            raffleId: number;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            /* ---------------- PDAs ---------------- */
            const raffleAccountPda = rafflePda(args.raffleId);

            const buyerAccountPda = raffleBuyerPda(
                args.raffleId,
                wallet.publicKey.toBase58()
            );

            /* ---------------- Fetch raffle ---------------- */
            const raffleData = await raffleProgram.account.raffle.fetch(
                raffleAccountPda
            );

            /* ---------------- Prize mint ---------------- */
            const isSolPrize = raffleData.prizeMint === null;
            const prizeMint = raffleData.prizeMint ?? FAKE_MINT;

            /* ---------------- Token program ---------------- */
            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                prizeMint
            );

            /* ---------------- Accounts ---------------- */
            let prizeEscrow: PublicKey = FAKE_ATA;
            let winnerPrizeAta: PublicKey = FAKE_ATA;

            if (!isSolPrize) {
                // Prize escrow ATA (owner = raffle PDA)
                const escrowRes = await ensureAtaIx({
                    connection,
                    mint: prizeMint,
                    owner: raffleAccountPda,
                    payer: wallet.publicKey,
                    tokenProgram: prizeTokenProgram,
                    allowOwnerOffCurve: true,
                });

                prizeEscrow = escrowRes.ata;
                if (escrowRes.ix) tx.add(escrowRes.ix);

                // Winner prize ATA (owner = winner)
                const winnerAtaRes = await ensureAtaIx({
                    connection,
                    mint: prizeMint,
                    owner: wallet.publicKey,
                    payer: wallet.publicKey,
                    tokenProgram: prizeTokenProgram,
                });

                winnerPrizeAta = winnerAtaRes.ata;
                if (winnerAtaRes.ix) tx.add(winnerAtaRes.ix);
            }

            /* ---------------- Anchor Instruction ---------------- */
            const ix = await raffleProgram.methods
                .buyerClaimPrize(args.raffleId)
                .accounts({
                    raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,
                    winner: wallet.publicKey,

                    prizeMint,
                    prizeEscrow,
                    winnerPrizeAta,

                    prizeTokenProgram,
                })
                .instruction();

            tx.add(ix);

            /* ---------------- Send TX ---------------- */
            return await provider.sendAndConfirm(tx, [
                RAFFLE_ADMIN_KEYPAIR,
            ]);
        },
        onSuccess: (tx) => {
            console.log("Prize claimed:", tx);
        },
        onError: (error) => {
            console.log("Buyer claim prize failed:", error);
        },
    });

    /* ---------------- Cancel Raffle Mutation ---------------- */
    const cancelRaffleMutation = useMutation({
        mutationKey: ["raffle", "cancel"],
        mutationFn: async (args: {
            raffleId: number;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            /* ---------------- PDAs ---------------- */
            const raffleAccountPda = rafflePda(args.raffleId);

            /* ---------------- Fetch raffle ---------------- */
            const raffleData = await raffleProgram.account.raffle.fetch(
                raffleAccountPda
            );

            /* ---------------- Prize type ---------------- */
            const isSolPrize = raffleData.prizeMint === null;
            const prizeMint = raffleData.prizeMint ?? FAKE_MINT;

            /* ---------------- Token program ---------------- */
            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                prizeMint
            );

            /* ---------------- Accounts ---------------- */
            let prizeEscrow: PublicKey = FAKE_ATA;
            let creatorPrizeAta: PublicKey = FAKE_ATA;

            if (!isSolPrize) {
                // Prize escrow ATA (owner = raffle PDA)
                const escrowRes = await ensureAtaIx({
                    connection,
                    mint: prizeMint,
                    owner: raffleAccountPda,
                    payer: wallet.publicKey,
                    tokenProgram: prizeTokenProgram,
                    allowOwnerOffCurve: true,
                });

                prizeEscrow = escrowRes.ata;
                if (escrowRes.ix) tx.add(escrowRes.ix);

                // Creator prize ATA (owner = creator wallet)
                const creatorAtaRes = await ensureAtaIx({
                    connection,
                    mint: prizeMint,
                    owner: wallet.publicKey,
                    payer: wallet.publicKey,
                    tokenProgram: prizeTokenProgram,
                });

                creatorPrizeAta = creatorAtaRes.ata;
                if (creatorAtaRes.ix) tx.add(creatorAtaRes.ix);
            }

            /* ---------------- Anchor Instruction ---------------- */
            const ix = await raffleProgram.methods
                .cancelRaffle(args.raffleId)
                .accounts({
                    creator: wallet.publicKey,
                    raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,

                    prizeMint,
                    prizeEscrow,
                    creatorPrizeAta,

                    prizeTokenProgram,
                })
                .instruction();

            tx.add(ix);

            /* ---------------- Send TX ---------------- */
            return await provider.sendAndConfirm(tx, [
                RAFFLE_ADMIN_KEYPAIR,
            ]);
        },
        onSuccess: (tx) => {
            console.log("Cancel Raffle TX:", tx);
        },
        onError: (error) => {
            console.log("Cancel Raffle Failed:", error);
        },
    });

    /* ---------------- Creator Claim Amount Back Mutation ---------------- */
    const claimAmountBackMutation = useMutation({
        mutationKey: ["raffle", "claimAmountBack"],
        mutationFn: async (args: {
            raffleId: number;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            /* ---------------- PDAs ---------------- */
            const raffleAccountPda = rafflePda(args.raffleId);

            /* ---------------- Fetch raffle ---------------- */
            const raffleData = await raffleProgram.account.raffle.fetch(
                raffleAccountPda
            );

            /* ---------------- Prize side ---------------- */
            const isSolPrize = raffleData.prizeMint === null;
            const prizeMint = raffleData.prizeMint ?? FAKE_MINT;

            /* ---------------- Ticket side ---------------- */
            const isSolTicket = raffleData.ticketMint === null;
            const ticketMint = raffleData.ticketMint ?? FAKE_MINT;

            /* ---------------- Token programs ---------------- */
            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                prizeMint
            );
            const ticketTokenProgram = await getTokenProgramFromMint(
                connection,
                ticketMint
            );

            /* ---------------- Accounts ---------------- */
            let prizeEscrow: PublicKey = FAKE_ATA;
            let creatorPrizeAta: PublicKey = FAKE_ATA;
            let ticketEscrow: PublicKey = FAKE_ATA;
            let creatorTicketAta: PublicKey = FAKE_ATA;

            // ---- Prize SPL / NFT ----
            if (!isSolPrize) {
                // Prize escrow ATA (owner = raffle PDA)
                const prizeEscrowRes = await ensureAtaIx({
                    connection,
                    mint: prizeMint,
                    owner: raffleAccountPda,
                    payer: wallet.publicKey,
                    tokenProgram: prizeTokenProgram,
                    allowOwnerOffCurve: true,
                });

                prizeEscrow = prizeEscrowRes.ata;
                if (prizeEscrowRes.ix) tx.add(prizeEscrowRes.ix);

                // Creator prize ATA
                const creatorPrizeRes = await ensureAtaIx({
                    connection,
                    mint: prizeMint,
                    owner: wallet.publicKey,
                    payer: wallet.publicKey,
                    tokenProgram: prizeTokenProgram,
                });

                creatorPrizeAta = creatorPrizeRes.ata;
                if (creatorPrizeRes.ix) tx.add(creatorPrizeRes.ix);
            }

            // ---- Ticket SPL ----
            if (!isSolTicket) {
                // Ticket escrow ATA (owner = raffle PDA)
                const ticketEscrowRes = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: raffleAccountPda,
                    payer: wallet.publicKey,
                    tokenProgram: ticketTokenProgram,
                    allowOwnerOffCurve: true,
                });

                ticketEscrow = ticketEscrowRes.ata;
                if (ticketEscrowRes.ix) tx.add(ticketEscrowRes.ix);

                // Creator ticket ATA
                const creatorTicketRes = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: wallet.publicKey,
                    payer: wallet.publicKey,
                    tokenProgram: ticketTokenProgram,
                });

                creatorTicketAta = creatorTicketRes.ata;
                if (creatorTicketRes.ix) tx.add(creatorTicketRes.ix);
            }

            /* ---------------- Anchor Instruction ---------------- */
            const ix = await raffleProgram.methods
                .claimAmountBack(args.raffleId)
                .accounts({
                    creator: wallet.publicKey,
                    raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,

                    prizeMint,
                    ticketMint,

                    prizeEscrow,
                    ticketEscrow,

                    creatorPrizeAta,
                    creatorTicketAta,

                    prizeTokenProgram,
                    ticketTokenProgram,
                })
                .instruction();

            tx.add(ix);

            /* ---------------- Send TX ---------------- */
            return await provider.sendAndConfirm(tx, [
                RAFFLE_ADMIN_KEYPAIR,
            ]);
        },
        onSuccess: (tx) => {
            console.log("Claim Amount Back TX:", tx);
        },
        onError: (error) => {
            console.log("Claim Amount Back Failed:", error);
        },
    });

    /* ---------------- Update Raffle Ticketing Mutation ---------------- */
    const updateRaffleTicketingMutation = useMutation({
        mutationKey: ["raffle", "updateTicketing"],
        mutationFn: async (args: {
            raffleId: number;
            newTotalTickets: number;
            newTicketPrice: number;
            newMaxPerWalletPct: number;
            newMaximumTickets: number;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await raffleProgram.methods
                .updateRaffleTicketing(
                    args.raffleId,
                    args.newTotalTickets,
                    new BN(args.newTicketPrice),
                    args.newMaxPerWalletPct,
                    args.newMaximumTickets,
                )
                .accounts({
                    creator: wallet.publicKey,
                    raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,
                })
                .signers([RAFFLE_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Update Raffle Ticketing TX:", tx);
        },
        onError: (error) => {
            console.error("Update Raffle Ticketing Failed:", error);
        },
    });

    /* ---------------- Update Raffle Time Mutation ---------------- */
    const updateRaffleTimeMutation = useMutation({
        mutationKey: ["raffle", "updateTime"],
        mutationFn: async (args: {
            raffleId: number;
            newStartTime: number;
            newEndTime: number;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await raffleProgram.methods
                .updateRaffleTime(
                    args.raffleId,
                    new BN(args.newStartTime),
                    new BN(args.newEndTime)
                )
                .accounts({
                    creator: wallet.publicKey,
                    raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,
                })
                .signers([RAFFLE_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Update Raffle Timing TX:", tx);
        },
        onError: (error) => {
            console.error("Update Raffle Timing Failed:", error);
        },
    });

    /* ---------------- Update Raffle Winners Mutation ---------------- */
    const updateRaffleWinnersMutation = useMutation({
        mutationKey: ["raffle", "updateWinners"],
        mutationFn: async (args: {
            raffleId: number;
            winShares: number[];
            isUniqueWinners: boolean;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await raffleProgram.methods
                .updateRaffleWinners(
                    args.raffleId,
                    Buffer.from(args.winShares),
                    args.isUniqueWinners
                )
                .accounts({
                    creator: wallet.publicKey,
                    raffleAdmin: RAFFLE_ADMIN_KEYPAIR.publicKey,
                })
                .signers([RAFFLE_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Update Raffle Winners TX:", tx);
        },
        onError: (error) => {
            console.error("Update Raffle Winners Failed:", error);
        },
    });

    /* ---------------- Withdraw SOL Fees(Main owner call) ---------------- */
    const withdrawSolFeesMutation = useMutation({
        mutationKey: ["raffle", "withdrawSolFees"],
        mutationFn: async (args: {
            amount: number;
            receiver: PublicKey;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await raffleProgram.methods
                .withdrawSolFees(new BN(args.amount))
                .accounts({
                    owner: wallet.publicKey,
                    receiver: args.receiver,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Withdraw SOL Fees TX:", tx);
        },
        onError: (error) => {
            console.error("Withdraw SOL Fees Failed:", error);
        },
    });

    /* ---------------- Withdraw SPL Fees(Main owner call) ---------------- */
    const withdrawSplFeesMutation = useMutation({
        mutationKey: ["raffle", "withdrawSplFees"],
        mutationFn: async (args: {
            amount: number;
            feeMint: PublicKey;
            receiver: PublicKey;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            /* ---------------- Token program ---------------- */
            const tokenProgram = await getTokenProgramFromMint(
                connection,
                args.feeMint
            );

            /* ---------------- ATAs ---------------- */
            // Fee treasury ATA (owner = raffle config PDA)
            const treasuryRes = await ensureAtaIx({
                connection,
                mint: args.feeMint,
                owner: raffleConfigPda,
                payer: wallet.publicKey,
                tokenProgram,
                allowOwnerOffCurve: true,
            });

            const feeTreasuryAta = treasuryRes.ata;
            if (treasuryRes.ix) tx.add(treasuryRes.ix);

            // Receiver ATA (owner = receiver wallet)
            const receiverRes = await ensureAtaIx({
                connection,
                mint: args.feeMint,
                owner: args.receiver,
                payer: wallet.publicKey,
                tokenProgram,
                allowOwnerOffCurve: true,  // receiver may be PDA or wallet
            });

            const receiverFeeAta = receiverRes.ata;
            if (receiverRes.ix) tx.add(receiverRes.ix);

            /* ---------------- Anchor Instruction ---------------- */
            const ix = await raffleProgram.methods
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
            console.log("Withdraw SPL Fees TX:", tx);
        },
        onError: (error) => {
            console.log("Withdraw SPL Fees Failed:", error);
        },
    });

    /* ---------------- Setup Raffle Config(Main owner call) ---------------- */
    const initializeRaffleConfigMutation = useMutation({
        mutationKey: ["raffleConfig", "initialize"],
        mutationFn: async (args: {
            raffleOwner: PublicKey;
            raffleAdmin: PublicKey;
            creationFeeLamports: number;
            ticketFeeBps: number;
            minimumRafflePeriod: number;
            maximumRafflePeriod: number;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await raffleProgram.methods
                .initializeRaffleConfig(
                    args.raffleOwner,
                    args.raffleAdmin,
                    new BN(args.creationFeeLamports),
                    args.ticketFeeBps,
                    args.minimumRafflePeriod,
                    args.maximumRafflePeriod
                )
                .accounts({
                    payer: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Raffle config Initialized TX:", tx);
        },
        onError: (error) => {
            console.error("Raffle config Initialized Failed:", error);
        },
    });

    /* ---------------- Update Raffle Config Owner(Main owner call) ---------------- */
    const updateRaffleConfigOwnerMutation = useMutation({
        mutationKey: ["raffleConfig", "updateOwner"],
        mutationFn: async (newOwner: PublicKey) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await raffleProgram.methods
                .updateRaffleConfigOwner(newOwner)
                .accounts({
                    raffleOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Raffle config Owner updated TX:", tx);
        },
        onError: (error) => {
            console.error("Raffle config Owner updation Failed:", error);
        },
    });

    /* ---------------- Update Raffle Config Admin(Main owner call) ---------------- */
    const updateRaffleConfigAdminMutation = useMutation({
        mutationKey: ["raffleConfig", "updateAdmin"],
        mutationFn: async (newAdmin: PublicKey) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await raffleProgram.methods
                .updateRaffleConfigAdmin(newAdmin)
                .accounts({
                    raffleOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Raffle config Admin updated TX:", tx);
        },
        onError: (error) => {
            console.error("Raffle config Admin updation Failed:", error);
        },
    });

    /* ---------------- Update Raffle Pause & Unpause(Main owner call) ---------------- */
    const updatePauseFlagsMutation = useMutation({
        mutationKey: ["raffleConfig", "pauseFlags"],
        mutationFn: async (pauseFlags: number) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await raffleProgram.methods
                .updatePauseAndUnpause(pauseFlags)
                .accounts({
                    raffleOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Pause & Unpause updated TX:", tx);
        },
        onError: (error) => {
            console.error("Pause & Unpause updation Failed:", error);
        },
    });

    /* ---------------- Update Raffle Config Data(Main owner call) ---------------- */
    const updateRaffleConfigDataMutation = useMutation({
        mutationKey: ["raffleConfig", "updateData"],
        mutationFn: async (args: {
            creationFeeLamports: number;
            ticketFeeBps: number;
            minimumRafflePeriod: number;
            maximumRafflePeriod: number;
        }) => {
            if (!raffleProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await raffleProgram.methods
                .updateRaffleConfigData(
                    new BN(args.creationFeeLamports),
                    args.ticketFeeBps,
                    args.minimumRafflePeriod,
                    args.maximumRafflePeriod
                )
                .accounts({
                    raffleOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Raffle config data updated TX:", tx);
        },
        onError: (error) => {
            console.error("Raffle config data updation Failed:", error);
        },
    });


    /* ---------------- Return API ---------------- */
    return {
        // raffle program
        raffleProgram,

        // raffle state PDA's
        raffleConfigPda,
        rafflePda,
        raffleBuyerPda,

        // fetch state data of raffle states
        getRaffleConfig,
        getAllRaffles,
        getAllRaffleBuyers,
        getRaffleById,
        getRaffleBuyer,
        getBuyersByRaffle,

        // config setup
        initializeRaffleConfigMutation,
        updateRaffleConfigOwnerMutation,
        updateRaffleConfigAdminMutation,
        updatePauseFlagsMutation,
        updateRaffleConfigDataMutation,

        // creator functions
        createRaffleMutation,
        cancelRaffleMutation,
        claimAmountBackMutation,

        // buyer functions
        buyerClaimPrizeMutation,
        buyTicketMutation,

        // raffle admin functions
        activateRaffleMutation,
        announceWinnersMutation,

        // update raffle(by creator)
        updateRaffleTicketingMutation,
        updateRaffleTimeMutation,
        updateRaffleWinnersMutation,

        // main owner calls
        withdrawSolFeesMutation,
        withdrawSplFeesMutation
    };
}

function getRaffleProgram(provider: anchor.AnchorProvider): anchor.Program<Raffle> {
    return new anchor.Program<Raffle>(raffleIdl as anchor.Idl, provider);
}

function prizeTypeToAnchor(prizeType: number) {
    switch (prizeType) {
        case PrizeType.Nft:
            return { nft: {} };

        case PrizeType.Spl:
            return { spl: {} };

        case PrizeType.Sol:
            return { sol: {} };

        default:
            throw new Error(`Invalid prizeType: ${prizeType}`);
    }
}

type CreateRaffleArgs = {
    startTime: number;
    endTime: number;
    totalTickets: number;
    ticketPrice: number;
    isTicketSol: boolean;
    maxPerWalletPct: number;
    prizeType: number; // enum index
    prizeAmount: number;
    numWinners: number;
    winShares: number[];
    isUniqueWinners: boolean;
    startRaffle: boolean;
    maximumTickets: number;

    // accounts
    ticketMint: PublicKey;
    prizeMint: PublicKey;
};

enum PrizeType {
    Nft = 0,
    Spl = 1,
    Sol = 2,
}

const systemProgram = anchor.web3.SystemProgram.programId;
const FAKE_MINT = new PublicKey('So11111111111111111111111111111111111111112');
const FAKE_ATA = new PublicKey('B9W4wPFWjTbZ9ab1okzB4D3SsGY7wntkrBKwpp5RC1Uv')
const RAFFLE_ADMIN_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from([214, 195, 221, 90, 116, 238, 191, 49, 125, 52, 76, 239, 68, 25, 144, 85, 125, 238, 21, 60, 157, 1, 180, 229, 79, 34, 252, 213, 224, 131, 52, 3, 33, 100, 214, 59, 229, 171, 12, 132, 229, 175, 48, 210, 5, 182, 82, 46, 140, 62, 152, 210, 153, 80, 185, 240, 181, 75, 2, 7, 87, 48, 51, 49]));