import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { useState, useEffect } from "react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SOLANA_RPC } from "@/constants";

// audit: can we use connnection form different imports
export async function ensureAtaIx(params: {
  connection: Connection;
  mint: PublicKey;
  owner: PublicKey;
  payer: PublicKey;
  tokenProgram: PublicKey;
  allowOwnerOffCurve?: boolean;
}): Promise<{
  ata: PublicKey;
  ix?: TransactionInstruction;
}> {
  const ata = getAssociatedTokenAddressSync(
    params.mint,
    params.owner,
    params.allowOwnerOffCurve ?? false,
    params.tokenProgram,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const info = await params.connection.getAccountInfo(ata);

  if (info) {
    return { ata };
  }

  const ix = createAssociatedTokenAccountInstruction(
    params.payer,
    ata,
    params.owner,
    params.mint,
    params.tokenProgram
  );

  return { ata, ix };
}

export async function getTokenProgramFromMint(
  connection: Connection,
  mint: PublicKey
): Promise<PublicKey> {
  const mintAccountInfo = await connection.getAccountInfo(mint);

  if (!mintAccountInfo) {
    throw new Error("Mint account not found");
  }

  const owner = mintAccountInfo.owner;

  if (owner.equals(TOKEN_PROGRAM_ID)) {
    return TOKEN_PROGRAM_ID;
  }

  if (owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return TOKEN_2022_PROGRAM_ID;
  }

  throw new Error("Unsupported token program");
}

export async function getAtaAddress(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = true
): Promise<PublicKey> {
  const mintAccountInfo = await connection.getAccountInfo(mint);
  if (!mintAccountInfo) {
    throw new Error("Mint account not found");
  }

  const tokenProgramId = mintAccountInfo.owner;

  if (
    !tokenProgramId.equals(TOKEN_PROGRAM_ID) &&
    !tokenProgramId.equals(TOKEN_2022_PROGRAM_ID)
  ) {
    throw new Error("Unsupported token program");
  }

  return getAssociatedTokenAddressSync(
    mint,
    owner,
    allowOwnerOffCurve,
    tokenProgramId,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
}

export const calculateRent = async (winners: number) => {
  const MAX_RENT_SOL = 0.72;
  const MAX_RENT_LAMPORTS = 720_000_000;

  // Raffle account structure sizes based on the IDL
  const DISCRIMINATOR_SIZE = 8;
  const RAFFLE_FIXED_SIZE = 162;

  // Dynamic sizes
  const getWinSharesSize = (numWinners: number) => 4 + numWinners; // Vec<u8> = 4 bytes length + data
  const getWinnersSize = (numWinners: number) => 4 + 32 * numWinners; // Vec<Pubkey>
  const getIsWinClaimedSize = (numWinners: number) => 4 + numWinners; // Vec<bool>

  try {
    // Calculate exact space for the Raffle account
    console.log("rent calculation");
    const winSharesSize = getWinSharesSize(winners);
    const winnersVecSize = getWinnersSize(winners);
    const isWinClaimedSize = getIsWinClaimedSize(winners);

    const totalSize =
      DISCRIMINATOR_SIZE +
      RAFFLE_FIXED_SIZE +
      winSharesSize +
      winnersVecSize +
      isWinClaimedSize;

    // Get rent exemption from Solana
    const connection = new Connection(SOLANA_RPC, "confirmed");
    const rentLamports =
      await connection.getMinimumBalanceForRentExemption(totalSize);
    const rentSol = rentLamports / LAMPORTS_PER_SOL;

    const exceedsMax = rentLamports > MAX_RENT_LAMPORTS;

    // Calculate max tickets based on current winners count
    let maxTickets = null;
    if (exceedsMax) {
      // Binary search to find max tickets
      const testSize = (testTickets: number) => {
        const ws = getWinSharesSize(winners);
        const wv = getWinnersSize(winners);
        const iwc = getIsWinClaimedSize(winners);
        return DISCRIMINATOR_SIZE + RAFFLE_FIXED_SIZE + ws + wv + iwc;
      };

      // Since ticket count doesn't affect size, the issue is winners
      const baseSize = testSize(1);
      const rentPerByte = rentLamports / totalSize;
      const maxSize = MAX_RENT_LAMPORTS / rentPerByte;
      const availableForWinners =
        maxSize - DISCRIMINATOR_SIZE - RAFFLE_FIXED_SIZE;

      // Each winner needs: 1 (winShares) + 32 (pubkey) + 1 (isClaimed) = 34 bytes + vec overhead
      const bytesPerWinner = 34;
      maxTickets = Math.floor(availableForWinners / bytesPerWinner);
    }

    return {
      rentLamports,
      rentSol,
      maxTickets,
    };
  } catch (err) {
    console.error("Rent calculation error:", err);
    return null;
  }
};
