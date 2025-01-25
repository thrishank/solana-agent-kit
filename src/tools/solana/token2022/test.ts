import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createInitializeNonTransferableMintInstruction,
  ExtensionType,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import { SolanaAgentKit } from "../../../agent";
import { getMintLen } from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import { PublicKey } from "@solana/web3.js";

/**
 * Create a Non Transferable Token Mint
 * @async
 * @param agent SolanaAgentKit instance
 * @param decimals Token decimals
 * @returns mint address and trnsaction signature
 */
async function createNonTransferableMint(
  agent: SolanaAgentKit,
  decimals: number,
  tokenName: string,
  tokenSymbol: string,
  uri: string,
): Promise<{ mint: PublicKey; signature: string }> {
  try {
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    const metadata: TokenMetadata = {
      mint,
      name: tokenName,
      symbol: tokenSymbol,
      uri,
      additionalMetadata: [],
    };
    const extensions = [
      ExtensionType.NonTransferableAccount,
      ExtensionType.MetadataPointer,
    ];
    const mintLength = getMintLen(extensions);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const mintLamports =
      await agent.connection.getMinimumBalanceForRentExemption(
        mintLength + metadataLen,
      );

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

    const initMetadataPointerInstruction =
      createInitializeMetadataPointerInstruction(
        mint,
        agent.wallet_address,
        mint, // Metadata account - points to itself
        TOKEN_2022_PROGRAM_ID,
      );

    const initializeMintInstruction = createInitializeMintInstruction(
      mint,
      decimals,
      agent.wallet_address,
      agent.wallet_address,
      TOKEN_2022_PROGRAM_ID,
    );

    const initMetadataInstruction = createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint,
      metadata: mint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: agent.wallet_address,
      updateAuthority: agent.wallet_address,
    });

    const mintTransaction = new Transaction().add(
      createAccountInstruction,
      initializeNonTransferableMintInstruction,
      initMetadataPointerInstruction,
      initializeMintInstruction,
      initMetadataInstruction,
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

const solanaAgent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL!,
  {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    HELIUS_API_KEY: process.env.HELIUS_API_KEY!,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY!,
  },
);

createNonTransferableMint(
  solanaAgent,
  0,
  "agent",
  "AGENT",
  "https://solana.com",
);
