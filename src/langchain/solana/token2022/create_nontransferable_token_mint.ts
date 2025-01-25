import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../../agent";

export class SolanaCreateNonTransferableTokenMintTool extends Tool {
  name = "solana_create_non_transferable_token_mint";
  description = `create a non transferable token mint

  Inputs ( input is a JSON string ):
  decimals: number, eg 9`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const { mint, signature } =
        await this.solanaKit.createNonTransferableTokenMint(
          parsedInput.decimals,
        );

      return JSON.stringify({
        status: "success",
        mint,
        signature,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
