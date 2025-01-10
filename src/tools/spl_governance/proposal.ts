import { SplGovernance, VoteType } from "governance-idl-sdk";
import { SolanaAgentKit } from "../../agent";
import { PublicKey, Transaction } from "@solana/web3.js";

/**
 * Construct a CreateProposal Instruction
 * @param name Name of the proposal
 * @param descriptionLink link to the gist/brief description of the proposal
 * @param voteType Proposal Vote Type. Either Single Choice or Multi Choice
 * @param options The array of options
 * @param useDenyOption Indicates whether the proposal has the deny option
 * @param realmAccount The Realm Account
 * @param governanceAccount The governance account. pda(realm, governance seed)
 * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner)
 * @param governingTokenMint The Mint Account of the governing token (either community token or council token) for which the proposal is created for
 * @param governanceAuthority Either the current delegate or governing token owner
 * @param proposalSeed (Optional) Random public key to seed the proposal account
 *
 * @return Transaction signature
 */
export async function createProposal(
  agent: SolanaAgentKit,
  name: string,
  descriptionLink: string,
  voteType: VoteType,
  options: [string],
  useDenyOption: boolean,
  realmAccount: PublicKey,
  governanceAccount: PublicKey,
  tokenOwnerRecord: PublicKey,
  governingTokenMint: PublicKey,
  governanceAuthority: PublicKey,
  payer: PublicKey,
  proposalSeed?: PublicKey,
  voterWeightRecord?: PublicKey,
) {
  try {
    const splGovernance = new SplGovernance(agent.connection);

    const createProposalIx = await splGovernance.createProposalInstruction(
      name,
      descriptionLink,
      voteType,
      options,
      useDenyOption,
      realmAccount,
      governanceAccount,
      tokenOwnerRecord,
      governingTokenMint,
      governanceAuthority,
      payer,
      proposalSeed,
      voterWeightRecord,
    );

    const { blockhash, lastValidBlockHeight } =
      await agent.connection.getLatestBlockhash();

    const transaction = new Transaction({ blockhash, lastValidBlockHeight });
    transaction.add(createProposalIx);

    const signature = await agent.connection.sendTransaction(transaction, [
      agent.wallet,
    ]);
    return signature;
  } catch (err) {
    throw new Error(`Error creating proposal: ${err}`);
  }
}
