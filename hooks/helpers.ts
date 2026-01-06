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
import type { RaffleTypeBackend } from "types/backend/raffleTypes";
import type { Raffle } from "types/raffle";

export const connection = new Connection(SOLANA_RPC, "confirmed");

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


export const calculateRent = async (byteSize:number) => {
  try {
    const connection = new Connection(SOLANA_RPC, "confirmed");
    const rentLamports = await connection.getMinimumBalanceForRentExemption(byteSize);
    const rentSol = rentLamports / LAMPORTS_PER_SOL;

    return {
      rentLamports,
      rentSol,
    };
  } catch (err) {
    console.error("Rent calculation error:", err);
    return null;
  }
};

