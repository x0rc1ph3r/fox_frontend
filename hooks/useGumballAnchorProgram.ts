/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { useAnchorProvider } from "../src/providers/SolanaProvider";
import gumballIdl from "../types/gumball.json";
import type { Gumball } from "../types/gumball";
import { getTokenProgramFromMint, getAtaAddress, ensureAtaIx } from './helpers';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import bs58 from "bs58";

export const GUMBALL_PROGRAM_ID = new anchor.web3.PublicKey(gumballIdl.address);

/** * Returns a fully configured Anchor Program instance */
export function useGumballAnchorProgram() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const provider = useAnchorProvider();

    /* ---------------- Program ---------------- */
    const gumballProgram = useMemo(
        () => getGumballProgram(provider),
        [provider, GUMBALL_PROGRAM_ID]
    );

    /* ---------------- PDA helpers ---------------- */
    const gumballConfigPda = useMemo(() => {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("gumball")],
            GUMBALL_PROGRAM_ID
        )[0];
    }, []);

    const gumballPda = (gumballId: number): PublicKey => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("gumball"),
                new BN(gumballId).toArrayLike(Buffer, "le", 4),
            ],
            GUMBALL_PROGRAM_ID
        )[0];
    };

    const prizePda = (gumballId: number, prizeIndex: number): PublicKey => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("gumball"),
                new BN(gumballId).toArrayLike(Buffer, "le", 4),
                new BN(prizeIndex).toArrayLike(Buffer, "le", 2),
            ],
            GUMBALL_PROGRAM_ID
        )[0];
    };

    const getGumballConfig = useQuery({
        queryKey: ["gumballConfig"],
        enabled: !!gumballProgram,
        queryFn: async () => {
            if (!gumballProgram) throw new Error("Program not ready");
            return gumballProgram.account.gumballConfig.fetch(gumballConfigPda);
        },
    });

    const getAllGumballs = useQuery({
        queryKey: ["gumballs", "all"],
        enabled: !!gumballProgram,
        queryFn: async () => {
            if (!gumballProgram) throw new Error("Program not ready");
            return gumballProgram.account.gumballMachine.all();
        },
    });

    const getGumballById = useCallback(
        (gumballId: number) => {
            return {
                queryKey: ["gumball", gumballId],
                enabled: !!gumballProgram && gumballId > 0,
                queryFn: async () => {
                    if (!gumballProgram) throw new Error("Program not ready");
                    return gumballProgram.account.gumballMachine.fetch(
                        gumballPda(gumballId)
                    );
                },
            };
        },
        [gumballProgram]
    );


    const getPrizesByGumball = useCallback(
        (gumballId: number) => {
            return {
                queryKey: ["gumballPrizes", gumballId],
                enabled: !!gumballProgram && gumballId > 0,
                queryFn: async () => {
                    if (!gumballProgram) throw new Error("Program not ready");

                    return gumballProgram.account.prize.all([
                        {
                            memcmp: {
                                offset: 8, // discriminator
                                bytes: bs58.encode(new BN(gumballId).toArrayLike(Buffer, "le", 4)),
                            },
                        },
                    ]);
                },
            };
        },
        [gumballProgram]
    );

    const getPrizeByIndex = useCallback(
        (gumballId: number, prizeIndex: number) => {
            return {
                queryKey: ["gumballPrize", gumballId, prizeIndex],
                enabled: !!gumballProgram,
                queryFn: async () => {
                    if (!gumballProgram) throw new Error("Program not ready");
                    return gumballProgram.account.prize.fetch(
                        prizePda(gumballId, prizeIndex)
                    );
                },
            };
        },
        [gumballProgram]
    );

    const initializeGumballConfigMutation = useMutation({
        mutationKey: ["gumball", "config", "initialize"],
        mutationFn: async () => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
                .initializeGumballConfig(
                    wallet.publicKey,
                    GUMBALL_ADMIN_KEYPAIR.publicKey,
                    new BN(1000_000_00),
                    100,
                    24 * 60 * 60,
                    24 * 60 * 60 * 7
                )
                .accounts({
                    payer: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball config initialized:", tx);
        },
        onError: (err) => {
            console.error("Initialize gumball config failed:", err);
        },
    });

    const updateGumballOwnerMutation = useMutation({
        mutationKey: ["gumball", "config", "updateOwner"],
        mutationFn: async (newOwner: PublicKey) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
                .updateGumballOwner(newOwner)
                .accounts({
                    gumballOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball owner updated:", tx);
        },
        onError: (err) => {
            console.error("Update gumball owner failed:", err);
        },
    });

    const updateGumballAdminMutation = useMutation({
        mutationKey: ["gumball", "config", "updateAdmin"],
        mutationFn: async (newAdmin: PublicKey) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
                .updateGumballAdmin(newAdmin)
                .accounts({
                    gumballOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball admin updated:", tx);
        },
        onError: (err) => {
            console.error("Update gumball admin failed:", err);
        },
    });

    const updateGumballConfigDataMutation = useMutation({
        mutationKey: ["gumball", "config", "updateData"],
        mutationFn: async (args: {
            creationFeeLamports: number;
            ticketFeeBps: number;
            minimumGumballPeriod: number;
            maximumGumballPeriod: number;
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
                .updateGumballConfigData(
                    new BN(args.creationFeeLamports),
                    args.ticketFeeBps,
                    args.minimumGumballPeriod,
                    args.maximumGumballPeriod
                )
                .accounts({
                    gumballOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball config updated:", tx);
        },
        onError: (err) => {
            console.error("Update gumball config failed:", err);
        },
    });

    const updateGumballPauseMutation = useMutation({
        mutationKey: ["gumball", "config", "pause"],
        mutationFn: async (newPauseFlags: number) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
                .updatePauseFlags(newPauseFlags)
                .accounts({
                    gumballOwner: wallet.publicKey,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Pause flags updated:", tx);
        },
        onError: (err) => {
            console.error("Update pause flags failed:", err);
        },
    });

    const withdrawGumballSolFeesMutation = useMutation({
        mutationKey: ["gumball", "fees", "withdrawSol"],
        mutationFn: async (args: {
            amount: number;
            receiver: PublicKey;
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
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
        onError: (err) => {
            console.error("Withdraw SOL fees failed:", err);
        },
    });

    const withdrawGumballSplFeesMutation = useMutation({
        mutationKey: ["gumball", "fees", "withdrawSpl"],
        mutationFn: async (args: {
            amount: number;
            feeMint: PublicKey;
            receiver: PublicKey;
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            /* ---------------- Token program ---------------- */
            const tokenProgram = await getTokenProgramFromMint(
                connection,
                args.feeMint
            );

            /* ---------------- ATAs ---------------- */
            // Fee treasury ATA (owner = gumball config PDA)
            const treasuryRes = await ensureAtaIx({
                connection,
                mint: args.feeMint,
                owner: gumballConfigPda,
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
            const ix = await gumballProgram.methods
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
            console.log("Gumball SPL Fees withdrawn:", tx);
        },
        onError: (error) => {
            console.log("Withdraw Gumball SPL Fees failed:", error);
        },
    });

    const createGumballMutation = useMutation({
        mutationKey: ["gumball", "create"],
        mutationFn: async (args: {
            startTime: number;        // i64 (unix seconds)
            endTime: number;          // i64
            totalTickets: number;     // u16
            ticketPrice: number;      // u64 (lamports or token base units)
            isTicketSol: boolean;
            startGumball: boolean;
            ticketMint?: PublicKey;    // REQUIRED (ignored by program if SOL)
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            // You MUST fetch config before creating
            const config = await gumballProgram.account.gumballConfig.fetch(
                gumballConfigPda
            );

            const gumballId = config.gumballCount;
            const gumballPdaAddress = gumballPda(gumballId);

            return await gumballProgram.methods
                .createGumball(
                    new BN(args.startTime),
                    new BN(args.endTime),
                    args.totalTickets,
                    new BN(args.ticketPrice),
                    args.isTicketSol,
                    args.startGumball
                )
                .accountsPartial({
                    gumball: gumballPdaAddress,
                    creator: wallet.publicKey,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,
                    ticketMint: args.ticketMint ?? FAKE_MINT,
                })
                .signers([GUMBALL_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball created:", tx);
        },
        onError: (err) => {
            console.error("Create gumball failed:", err);
        },
    });

    const updateGumballTimeMutation = useMutation({
        mutationKey: ["gumball", "update", "time"],
        mutationFn: async (args: {
            gumballId: number;
            newStartTime: number;   // unix seconds
            newEndTime: number;     // unix seconds
            startGumball: boolean;
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
                .updateGumballTime(
                    args.gumballId,
                    new BN(args.newStartTime),
                    new BN(args.newEndTime),
                    args.startGumball
                )
                .accounts({
                    creator: wallet.publicKey,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,
                })
                .signers([GUMBALL_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball time updated:", tx);
        },
        onError: (err) => {
            console.error("Update gumball time failed:", err);
        },
    });

    const updateGumballDataMutation = useMutation({
        mutationKey: ["gumball", "update", "data"],
        mutationFn: async (args: {
            gumballId: number;
            newTicketPrice: number;   // u64
            newTotalTickets: number;  // u16
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
                .updateGumballData(
                    args.gumballId,
                    new BN(args.newTicketPrice),
                    args.newTotalTickets
                )
                .accounts({
                    creator: wallet.publicKey,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,
                })
                .signers([GUMBALL_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball data updated:", tx);
        },
        onError: (err) => {
            console.error("Update gumball data failed:", err);
        },
    });

    const spinGumballMutation = useMutation({
        mutationKey: ["gumball", "spin"],
        mutationFn: async (args: {
            gumballId: number;
            prizeIndex: number;
            prizeMint: PublicKey;
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            /* ---------------- PDAs ---------------- */
            const gumballAddress = gumballPda(args.gumballId);
            // const prizeAddress = prizePda(args.gumballId, args.prizeIndex);

            const gumballState =
                await gumballProgram.account.gumballMachine.fetch(
                    gumballAddress
                );

            const ticketMint: PublicKey | null = gumballState.ticketMint;

            /* ---------------- Token programs ---------------- */
            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                args.prizeMint
            );

            const ticketTokenProgram = ticketMint
                ? await getTokenProgramFromMint(connection, ticketMint)
                : TOKEN_PROGRAM_ID;

            /* ---------------- Prize ATAs ---------------- */
            // // Prize escrow (already exists, owned by gumball PDA)
            // const prizeEscrow = await getAtaAddress(
            //     connection,
            //     args.prizeMint,
            //     gumballAddress,
            //     true
            // );

            // // Spinner prize ATA (created on-chain via init_if_needed)
            // const spinnerPrizeAta = await getAtaAddress(
            //     connection,
            //     args.prizeMint,
            //     wallet.publicKey
            // );

            /* ---------------- Ticket ATAs (CLIENT MUST ENSURE) ---------------- */
            let ticketEscrow = FAKE_ATA;
            let spinnerTicketAta = FAKE_ATA;

            if (ticketMint) {
                /* -------- Ticket escrow ATA (owner = gumball PDA) -------- */
                const ticketEscrowRes = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: gumballAddress,
                    payer: wallet.publicKey,
                    tokenProgram: ticketTokenProgram,
                    allowOwnerOffCurve: true, // PDA owner
                });

                ticketEscrow = ticketEscrowRes.ata;
                if (ticketEscrowRes.ix) tx.add(ticketEscrowRes.ix);

                /* -------- Spinner ticket ATA -------- */
                const spinnerTicketRes = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: wallet.publicKey,
                    payer: wallet.publicKey,
                    tokenProgram: ticketTokenProgram,
                });

                spinnerTicketAta = spinnerTicketRes.ata;
                if (spinnerTicketRes.ix) tx.add(spinnerTicketRes.ix);
            }

            /* ---------------- Anchor Instruction ---------------- */
            const ix = await gumballProgram.methods
                .spinGumball(args.gumballId, args.prizeIndex)
                .accounts({
                    spinner: wallet.publicKey,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,

                    prizeMint: args.prizeMint,
                    ticketMint: ticketMint ?? FAKE_MINT,

                    ticketEscrow,
                    spinnerTicketAta,

                    prizeTokenProgram,
                    ticketTokenProgram,
                })
                .instruction();

            tx.add(ix);

            /* ---------------- Send TX ---------------- */
            return await provider.sendAndConfirm(tx, [
                GUMBALL_ADMIN_KEYPAIR,
            ]);
        },
        onSuccess: (tx) => {
            console.log("Gumball spun successfully:", tx);
        },
        onError: (err) => {
            console.error("Gumball spin failed:", err);
        },
    });

    const activateGumballMutation = useMutation({
        mutationKey: ["gumball", "activate"],
        mutationFn: async (gumballId: number) => {
            if (!gumballProgram) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
                .activateGumball(gumballId)
                .accounts({
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,
                })
                .signers([GUMBALL_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball activated successfully:", tx);
        },
        onError: (err) => {
            console.error("Gumball activation failed:", err);
        },
    });

    const cancelGumballMutation = useMutation({
        mutationKey: ["gumball", "cancel"],
        mutationFn: async (gumballId: number) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
                .cancelGumball(gumballId)
                .accounts({
                    creator: wallet.publicKey,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,
                })
                .signers([GUMBALL_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball cancelled successfully:", tx);
        },
        onError: (err) => {
            console.error("Gumball cancelled failed:", err);
        },
    });

    const endGumballMutation = useMutation({
        mutationKey: ["gumball", "end"],
        mutationFn: async (gumballId: number) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            /* ---------------- PDAs ---------------- */
            const gumballAddress = gumballPda(gumballId);

            const gumballState = await gumballProgram.account.gumballMachine.fetch(gumballAddress);

            const ticketMint: PublicKey | null = gumballState.ticketMint;

            /* ---------------- Token program ---------------- */
            const ticketTokenProgram = ticketMint
                ? await getTokenProgramFromMint(connection, ticketMint)
                : TOKEN_PROGRAM_ID;

            /* ---------------- Ticket ATAs (CLIENT MUST ENSURE) ---------------- */
            let ticketEscrow = FAKE_ATA;
            let ticketFeeEscrowAta = FAKE_ATA;
            let creatorTicketAta = FAKE_ATA;

            if (ticketMint) {
                /* -------- Ticket escrow (owner = gumball PDA) -------- */
                ticketEscrow = await getAtaAddress(connection, ticketMint, gumballAddress, true);

                /* -------- Fee treasury ATA (owner = gumball config PDA) -------- */
                const feeTreasuryRes = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: gumballConfigPda,
                    payer: wallet.publicKey,
                    tokenProgram: ticketTokenProgram,
                    allowOwnerOffCurve: true, // PDA owner
                });

                ticketFeeEscrowAta = feeTreasuryRes.ata;
                if (feeTreasuryRes.ix) tx.add(feeTreasuryRes.ix);

                /* -------- Creator ticket ATA -------- */
                const creatorTicketRes = await ensureAtaIx({
                    connection,
                    mint: ticketMint,
                    owner: gumballState.creator,
                    payer: wallet.publicKey,
                    tokenProgram: ticketTokenProgram,
                });

                creatorTicketAta = creatorTicketRes.ata;
                if (creatorTicketRes.ix) tx.add(creatorTicketRes.ix);
            }

            /* ---------------- Anchor Instruction ---------------- */
            const ix = await gumballProgram.methods
                .endGumball(gumballId)
                .accounts({
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,
                    creator: gumballState.creator,

                    ticketMint: ticketMint ?? FAKE_MINT,

                    ticketEscrow,
                    ticketFeeEscrowAta,
                    creatorTicketAta,

                    ticketTokenProgram,
                })
                .instruction();

            tx.add(ix);

            /* ---------------- Send TX ---------------- */
            return await provider.sendAndConfirm(tx, [
                GUMBALL_ADMIN_KEYPAIR,
            ]);
        },
        onSuccess: (tx) => {
            console.log("Gumball ended successfully:", tx);
        },
        onError: (err) => {
            console.log("End gumball failed:", err);
        },
    });

    const addMultiplePrizesMutation = useMutation({
        mutationKey: ["gumball", "prize", "addMultiple"],
        mutationFn: async (args: {
            gumballId: number;
            prizes: AddPrizeInput[];
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();
            // const gumballAddress = gumballPda(args.gumballId);

            for (const prize of args.prizes) {
                const prizeTokenProgram = await getTokenProgramFromMint(
                    connection,
                    prize.prizeMint
                );

                // /* -------- Ensure Prize Escrow ATA (PDA-owned), ATA's are cretated in onchain if does not exist -------- */
                // const prizeEscrowRes = await ensureAtaIx({
                //     connection,
                //     mint: prize.prizeMint,
                //     owner: gumballAddress,
                //     payer: wallet.publicKey,
                //     tokenProgram: prizeTokenProgram,
                //     allowOwnerOffCurve: true,
                // });

                // /* -------- Ensure Creator Prize ATA -------- */
                // const creatorPrizeRes = await ensureAtaIx({
                //     connection,
                //     mint: prize.prizeMint,
                //     owner: wallet.publicKey,
                //     payer: wallet.publicKey,
                //     tokenProgram: prizeTokenProgram,
                // });

                /* -------- Add Prize Instruction -------- */
                const ix = await gumballProgram.methods
                    .addPrize(

                        args.gumballId,
                        prize.prizeIndex,
                        new BN(prize.prizeAmount),
                        prize.quantity
                    )
                    .accounts({
                        creator: wallet.publicKey,
                        gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,

                        prizeMint: prize.prizeMint,

                        prizeTokenProgram,
                    })
                    .instruction();

                tx.add(ix);
            }

            /* -------- Send Single Transaction -------- */
            return await provider.sendAndConfirm(tx, [
                GUMBALL_ADMIN_KEYPAIR,
            ]);
        },
        onSuccess: (tx) => {
            console.log("Multiple prizes added successfully:", tx);
        },
        onError: (err) => {
            console.error("Add multiple prizes failed:", err);
        },
    });

    const claimMultiplePrizesBackMutation = useMutation({
        mutationKey: ["gumball", "prize", "claimBackMultiple"],
        mutationFn: async (args: {
            gumballId: number;
            prizes: ClaimPrizeBackInput[];
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const tx = new Transaction();

            // const gumballAddress = gumballPda(args.gumballId);

            for (const prize of args.prizes) {
                const prizeAddress = prizePda(
                    args.gumballId,
                    prize.prizeIndex
                );

                // Fetch prize account to get mint
                const prizeState = await gumballProgram.account.prize.fetch(prizeAddress);

                const prizeMint: PublicKey = prizeState.mint;

                const prizeTokenProgram = await getTokenProgramFromMint(
                    connection,
                    prizeMint
                );

                // const prizeEscrowRes = await ensureAtaIx({
                //     connection,
                //     mint: prizeMint,
                //     owner: gumballAddress,
                //     payer: wallet.publicKey,
                //     tokenProgram: prizeTokenProgram,
                //     allowOwnerOffCurve: true,
                // });

                // const creatorPrizeRes = await ensureAtaIx({
                //     connection,
                //     mint: prizeMint,
                //     owner: wallet.publicKey,
                //     payer: wallet.publicKey,
                //     tokenProgram: prizeTokenProgram,
                // });

                const ix = await gumballProgram.methods
                    .claimPrizeBack(args.gumballId, prize.prizeIndex)
                    .accounts({
                        creator: wallet.publicKey,
                        gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,

                        prizeMint,

                        prizeTokenProgram,
                    })
                    .instruction();

                tx.add(ix);
            }

            return await provider.sendAndConfirm(tx, [
                GUMBALL_ADMIN_KEYPAIR,
            ]);
        },

        onSuccess: (tx) => {
            console.log("Multiple prizes claimed back successfully:", tx);
        },

        onError: (err) => {
            console.error("Claim multiple prizes back failed:", err);
        },
    });

    const cancelAndClaimSelectedPrizesMutation = useMutation({
        mutationKey: ["gumball", "cancel-and-claim-selected"],
        mutationFn: async ({
            gumballId,
            prizeIndexes,
        }: {
            gumballId: number;
            prizeIndexes: number[]; // Array of prize indexes to claim back
        }) => {
            if (!gumballProgram || !wallet.publicKey || !provider || !connection) {
                throw new Error("Wallet / program not ready");
            }

            if (prizeIndexes.length === 0) {
                throw new Error("No prizes selected to claim back");
            }

            const tx = new Transaction();

            // const gumballAddress = gumballPda(gumballId);

            // 1. Cancel Gumball instruction
            const cancelIx = await gumballProgram.methods
                .cancelGumball(gumballId)
                .accounts({
                    // gumballConfig: gumballConfigPda,
                    // gumball: gumballAddress,
                    creator: wallet.publicKey,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,
                })
                .instruction();

            tx.add(cancelIx);

            // 2. Claim back only the selected prize indexes
            const claimIxs: TransactionInstruction[] = [];

            for (const prizeIndex of prizeIndexes) {
                const prizeAddress = prizePda(gumballId, prizeIndex);

                let prizeState;
                try {
                    prizeState = await gumballProgram.account.prize.fetch(prizeAddress);
                } catch (err) {
                    console.log(err);
                    continue; // Skip if prize doesn't exist
                }

                const prizeMint: PublicKey = prizeState.mint;

                const prizeTokenProgram = await getTokenProgramFromMint(connection, prizeMint);

                // Ensure escrow ATA (owned by gumball)
                // const prizeEscrowRes = await ensureAtaIx({
                //     connection,
                //     mint: prizeMint,
                //     owner: gumballAddress,
                //     payer: wallet.publicKey,
                //     tokenProgram: prizeTokenProgram,
                //     allowOwnerOffCurve: true,
                // });

                // Ensure creator ATA (user's wallet)
                const creatorPrizeRes = await ensureAtaIx({
                    connection,
                    mint: prizeMint,
                    owner: wallet.publicKey,
                    payer: wallet.publicKey,
                    tokenProgram: prizeTokenProgram,
                });

                if (creatorPrizeRes.ix) tx.add(creatorPrizeRes.ix);

                const claimIx = await gumballProgram.methods
                    .claimPrizeBack(gumballId, prizeIndex)
                    .accounts({
                        // gumballConfig: gumballConfigPda,
                        // gumball: gumballAddress,
                        // prize: prizeAddress,

                        creator: wallet.publicKey,
                        gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,

                        prizeMint,

                        // prizeEscrow: prizeEscrowRes.ata,
                        // creatorPrizeAta: creatorPrizeRes.ata,

                        prizeTokenProgram,
                        // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        // systemProgram: anchor.web3.SystemProgram.programId,
                    })
                    .instruction();

                claimIxs.push(claimIx);
            }

            if (claimIxs.length === 0) {
                throw new Error("No valid prizes found to claim back");
            }

            tx.add(...claimIxs);

            const signature = await provider.sendAndConfirm(tx, [GUMBALL_ADMIN_KEYPAIR]);

            return { signature, claimedCount: claimIxs.length };
        },

        onSuccess: (tx) => {
            console.log("Cancelled and Multiple prizes claimed back successfully:", tx);
        },

        onError: (err) => {
            console.error("Cancel an Claim multiple prizes back failed:", err);
        },
    });


    return {
        /* ---------------- Program ---------------- */
        gumballProgram,

        /* ---------------- PDAs ---------------- */
        gumballConfigPda,
        gumballPda,
        prizePda,

        /* ---------------- Queries ---------------- */
        getGumballConfig,
        getAllGumballs,
        getGumballById,
        getPrizesByGumball,
        getPrizeByIndex,

        /* ---------------- Config mutations ---------------- */
        initializeGumballConfigMutation,
        updateGumballOwnerMutation,
        updateGumballAdminMutation,
        updateGumballConfigDataMutation,
        updateGumballPauseMutation,

        /* ---------------- Gumball lifecycle ---------------- */
        createGumballMutation,
        activateGumballMutation,
        updateGumballTimeMutation,
        updateGumballDataMutation,
        cancelGumballMutation,
        endGumballMutation,
        cancelAndClaimSelectedPrizesMutation,

        /* ---------------- Prize actions ---------------- */
        addMultiplePrizesMutation,
        spinGumballMutation,
        claimMultiplePrizesBackMutation,

        /* ---------------- Fee withdrawals ---------------- */
        withdrawGumballSolFeesMutation,
        withdrawGumballSplFeesMutation,
    };

}

function getGumballProgram(provider: anchor.AnchorProvider): anchor.Program<Gumball> {
    return new anchor.Program<Gumball>(gumballIdl as anchor.Idl, provider);
}

type AddPrizeInput = {
    prizeIndex: number;
    prizeAmount: number;
    quantity: number;
    prizeMint: PublicKey;
};

type ClaimPrizeBackInput = {
    prizeIndex: number;
};

const FAKE_MINT = new PublicKey('So11111111111111111111111111111111111111112');
const FAKE_ATA = new PublicKey('B9W4wPFWjTbZ9ab1okzB4D3SsGY7wntkrBKwpp5RC1Uv')
const GUMBALL_ADMIN_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from([214, 195, 221, 90, 116, 238, 191, 49, 125, 52, 76, 239, 68, 25, 144, 85, 125, 238, 21, 60, 157, 1, 180, 229, 79, 34, 252, 213, 224, 131, 52, 3, 33, 100, 214, 59, 229, 171, 12, 132, 229, 175, 48, 210, 5, 182, 82, 46, 140, 62, 152, 210, 153, 80, 185, 240, 181, 75, 2, 7, 87, 48, 51, 49]));