import {
  createInitializeMintInstruction,
  createInitializeNonTransferableMintInstruction,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { SolanaAgentKit } from "../../../agent";
import { getMintLen } from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { sendAndConfirmTransaction } from "@solana/web3.js";

/**
 * Create a Non Transferable Token Mint
 * @async
 * @param agent SolanaAgentKit instance
 * @param decimals Token decimals
 * @returns mint address and trnsaction signature
 */
export async function createNonTransferableMint(
  agent: SolanaAgentKit,
  decimals: number,
) {
  try {
    const extensions = [ExtensionType.NonTransferableAccount];
    const mintLength = getMintLen(extensions);
    const mintLamports =
      await agent.connection.getMinimumBalanceForRentExemption(mintLength);

    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: agent.wallet.publicKey,
      newAccountPubkey: mint,
      lamports: mintLamports,
      space: mintLength,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const initializeNonTransferableMintInstruction =
      createInitializeNonTransferableMintInstruction(
        mint,
        TOKEN_2022_PROGRAM_ID,
      );

    const initializeMintInstruction = createInitializeMintInstruction(
      mint,
      decimals,
      agent.wallet.publicKey,
      null, // Confirmation Config
      TOKEN_2022_PROGRAM_ID,
    );

    const mintTransaction = new Transaction().add(
      createAccountInstruction,
      initializeNonTransferableMintInstruction,
      initializeMintInstruction,
    );

    const signature = await sendAndConfirmTransaction(
      agent.connection,
      mintTransaction,
      [agent.wallet, mintKeypair],
      { commitment: "finalized" },
    );
    return { mint, signature };
  } catch (error: any) {
    throw new Error(`Creating mint failed: ${error.message}`);
  }
}
