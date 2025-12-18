/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { useAnchorProvider } from "../src/providers/SolanaProvider";
import gumballIdl from "../types/gumball.json";
import type { Gumball } from "../types/gumball";
import { getTokenProgramFromMint, getAtaAddress } from './helpers';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

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
                                bytes: new BN(gumballId).toArrayLike(Buffer, "le", 4),
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
        mutationFn: async (args: {
            gumballOwner: PublicKey;
            gumballAdmin: PublicKey;
            creationFeeLamports: number;
            ticketFeeBps: number;
            minimumGumballPeriod: number;
            maximumGumballPeriod: number;
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            return await gumballProgram.methods
                .initializeGumballConfig(
                    args.gumballOwner,
                    args.gumballAdmin,
                    new BN(args.creationFeeLamports),
                    args.ticketFeeBps,
                    args.minimumGumballPeriod,
                    args.maximumGumballPeriod
                )
                .accounts({
                    gumballConfig: gumballConfigPda,
                    payer: wallet.publicKey,
                    systemProgram,
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
                    gumballConfig: gumballConfigPda,
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
                    gumballConfig: gumballConfigPda,
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
                    gumballConfig: gumballConfigPda,
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
                    gumballConfig: gumballConfigPda,
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
                    gumballConfig: gumballConfigPda,
                    owner: wallet.publicKey,
                    receiver: args.receiver,
                    systemProgram,
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

            const feeTreasuryAta = await getAtaAddress(
                connection,
                args.feeMint,
                gumballConfigPda,
                true // PDA owner
            );

            const receiverFeeAta = await getAtaAddress(
                connection,
                args.feeMint,
                args.receiver,
                true
            );

            const tokenProgram = await getTokenProgramFromMint(
                connection,
                args.feeMint
            );

            return await gumballProgram.methods
                .withdrawSplFees(new BN(args.amount))
                .accounts({
                    gumballConfig: gumballConfigPda,
                    owner: wallet.publicKey,
                    feeMint: args.feeMint,
                    feeTreasuryAta,
                    receiverFeeAta,
                    tokenProgram,
                    systemProgram,
                })
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("SPL fees withdrawn:", tx);
        },
        onError: (err) => {
            console.error("Withdraw SPL fees failed:", err);
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
                .accounts({
                    gumballConfig: gumballConfigPda,
                    gumball: gumballPdaAddress,
                    creator: wallet.publicKey,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,
                    ticketMint: args.ticketMint ?? FAKE_MINT,
                    systemProgram,
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
                    gumballConfig: gumballConfigPda,
                    gumball: gumballPda(args.gumballId),
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
                    gumballConfig: gumballConfigPda,
                    gumball: gumballPda(args.gumballId),
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

            const gumballAddress = gumballPda(args.gumballId);
            const prizeAddress = prizePda(args.gumballId, args.prizeIndex);

            const gumballState =
                await gumballProgram.account.gumballMachine.fetch(
                    gumballAddress
                );

            const ticketMint: PublicKey | null = gumballState.ticketMint;

            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                args.prizeMint
            );

            const ticketTokenProgram = ticketMint
                ? await getTokenProgramFromMint(connection, ticketMint)
                : TOKEN_PROGRAM_ID;

            // Prize escrow ATA (owned by gumball PDA)
            const prizeEscrow = await getAtaAddress(
                connection,
                args.prizeMint,
                gumballAddress,
                true
            );

            // Spinner prize ATA (created if needed)
            const spinnerPrizeAta = await getAtaAddress(
                connection,
                args.prizeMint,
                wallet.publicKey
            );

            const ticketEscrow = ticketMint
                ? await getAtaAddress(
                    connection,
                    ticketMint,
                    gumballAddress,
                    true
                ) : FAKE_ATA;

            const spinnerTicketAta = ticketMint
                ? await getAtaAddress(
                    connection,
                    ticketMint,
                    wallet.publicKey,
                    true
                ) : FAKE_ATA;

            return await gumballProgram.methods
                .spinGumball(args.gumballId, args.prizeIndex)
                .accounts({
                    gumballConfig: gumballConfigPda,
                    gumball: gumballAddress,
                    prize: prizeAddress,

                    spinner: wallet.publicKey,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,

                    prizeMint: args.prizeMint,
                    ticketMint: ticketMint ?? FAKE_MINT,

                    prizeEscrow,
                    spinnerPrizeAta,

                    ticketEscrow,
                    spinnerTicketAta,

                    prizeTokenProgram,
                    ticketTokenProgram,

                    associatedTokenProgram,
                    systemProgram,
                })
                .signers([GUMBALL_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball spun successfully:", tx);
        },
        onError: (err) => {
            console.error("Spin gumball failed:", err);
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
                    gumballConfig: gumballConfigPda,
                    gumball: gumballPda(gumballId),
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
                    gumballConfig: gumballConfigPda,
                    gumball: gumballPda(gumballId),
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
            if (!gumballProgram) {
                throw new Error("Wallet not ready");
            }

            const gumballAddress = gumballPda(gumballId);
            const gumballState =
                await gumballProgram.account.gumballMachine.fetch(gumballAddress);

            const ticketMint: PublicKey | null = gumballState.ticketMint;

            const ticketTokenProgram = ticketMint
                ? await getTokenProgramFromMint(connection, ticketMint)
                : TOKEN_PROGRAM_ID;

            const ticketEscrow = ticketMint
                ? await getAtaAddress(connection, ticketMint, gumballAddress, true)
                : FAKE_ATA;

            const ticketFeeEscrowAta = ticketMint
                ? await getAtaAddress(connection, ticketMint, gumballConfigPda, true)
                : FAKE_ATA;

            const creatorTicketAta = ticketMint
                ? await getAtaAddress(connection, ticketMint, gumballState.creator, true)
                : FAKE_ATA;

            return await gumballProgram.methods
                .endGumball(gumballId)
                .accounts({
                    gumballConfig: gumballConfigPda,
                    gumball: gumballAddress,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,
                    creator: gumballState.creator,

                    ticketMint: ticketMint ?? FAKE_MINT,
                    ticketEscrow,
                    ticketFeeEscrowAta,
                    creatorTicketAta,

                    ticketTokenProgram,
                    systemProgram,
                })
                .signers([GUMBALL_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball ended successfully:", tx);
        },
        onError: (err) => {
            console.error("Gumball ended failed:", err);
        },
    });

    const addPrizeMutation = useMutation({
        mutationKey: ["gumball", "prize", "add"],
        mutationFn: async (args: {
            gumballId: number;
            prizeIndex: number;
            prizeAmount: number;
            quantity: number;
            prizeMint: PublicKey;
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                args.prizeMint
            );

            const gumballAddress = gumballPda(args.gumballId);

            return await gumballProgram.methods
                .addPrize(
                    args.gumballId,
                    args.prizeIndex,
                    new BN(args.prizeAmount),
                    args.quantity
                )
                .accounts({
                    gumballConfig: gumballConfigPda,
                    gumball: gumballAddress,
                    prize: prizePda(args.gumballId, args.prizeIndex),

                    creator: wallet.publicKey,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,

                    prizeMint: args.prizeMint,

                    prizeEscrow: await getAtaAddress(
                        connection,
                        args.prizeMint,
                        gumballAddress,
                        true
                    ),

                    creatorPrizeAta: await getAtaAddress(
                        connection,
                        args.prizeMint,
                        wallet.publicKey,
                    ),

                    prizeTokenProgram,
                    associatedTokenProgram,
                    systemProgram,
                })
                .signers([GUMBALL_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Gumball prize added successfully:", tx);
        },
        onError: (err) => {
            console.error("Gumball prize adding failed:", err);
        },
    });

    const claimPrizeBackMutation = useMutation({
        mutationKey: ["gumball", "prize", "claimBack"],
        mutationFn: async (args: {
            gumballId: number;
            prizeIndex: number;
        }) => {
            if (!gumballProgram || !wallet.publicKey) {
                throw new Error("Wallet not ready");
            }

            const gumballAddress = gumballPda(args.gumballId);
            const prizeAddress = prizePda(args.gumballId, args.prizeIndex);

            // Fetch prize account to read mint authoritatively
            const prizeState =
                await gumballProgram.account.prize.fetch(prizeAddress);
            const prizeMint: PublicKey = prizeState.mint;

            // Resolve correct token program (Token v1 / Token-2022)
            const prizeTokenProgram = await getTokenProgramFromMint(
                connection,
                prizeMint
            );

            return await gumballProgram.methods
                .claimPrizeBack(args.gumballId, args.prizeIndex)
                .accounts({
                    gumballConfig: gumballConfigPda,
                    gumball: gumballAddress,
                    prize: prizeAddress,

                    creator: wallet.publicKey,
                    gumballAdmin: GUMBALL_ADMIN_KEYPAIR.publicKey,

                    prizeMint,

                    prizeEscrow: await getAtaAddress(
                        connection,
                        prizeMint,
                        gumballAddress,
                        true
                    ),

                    creatorPrizeAta: await getAtaAddress(
                        connection,
                        prizeMint,
                        wallet.publicKey
                    ),

                    prizeTokenProgram,
                    associatedTokenProgram,
                    systemProgram,
                })
                .signers([GUMBALL_ADMIN_KEYPAIR])
                .rpc();
        },
        onSuccess: (tx) => {
            console.log("Prize claimed back successfully:", tx);
        },
        onError: (err) => {
            console.error("Claim prize back failed:", err);
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

        /* ---------------- Prize actions ---------------- */
        addPrizeMutation,
        spinGumballMutation,
        claimPrizeBackMutation,

        /* ---------------- Fee withdrawals ---------------- */
        withdrawGumballSolFeesMutation,
        withdrawGumballSplFeesMutation,
    };

}

function getGumballProgram(provider: anchor.AnchorProvider): anchor.Program<Gumball> {
    return new anchor.Program<Gumball>(gumballIdl as anchor.Idl, provider);
}

const associatedTokenProgram = anchor.utils.token.ASSOCIATED_PROGRAM_ID;
const systemProgram = anchor.web3.SystemProgram.programId;
const FAKE_MINT = new PublicKey('So11111111111111111111111111111111111111112');
const FAKE_ATA = new PublicKey('B9W4wPFWjTbZ9ab1okzB4D3SsGY7wntkrBKwpp5RC1Uv')
const GUMBALL_ADMIN_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from([214, 195, 221, 90, 116, 238, 191, 49, 125, 52, 76, 239, 68, 25, 144, 85, 125, 238, 21, 60, 157, 1, 180, 229, 79, 34, 252, 213, 224, 131, 52, 3, 33, 100, 214, 59, 229, 171, 12, 132, 229, 175, 48, 210, 5, 182, 82, 46, 140, 62, 152, 210, 153, 80, 185, 240, 181, 75, 2, 7, 87, 48, 51, 49]));