import { Action } from "../../../types/action";
import { SolanaAgentKit } from "../../../agent";
import { z } from "zod";
import { createNonTransferableMint } from "../../../tools";

const createNonTransferableMintAction: Action = {
  name: "CREATE_NON_TRANSFERABLE_MINT",
  similes: [
    "create non-transferable token",
    "initialize non-transferable mint",
    "mint non-transferable tokens",
  ],
  description: `Create a non-transferable token mint with specified decimals.`,
  examples: [
    [
      {
        input: {
          decimals: 9,
        },
        output: {
          status: "success",
          message: "Non-transferable mint created successfully",
          mint: "8z1FnrcutaAmNZ57wbAb6fqNNBcTiMQWRZQb3sg8cYkv",
          transaction:
            "2Skosa48ky13c2qC6fqAPbNLDP29hUk16J9BTKhs32mgoeLSZKudSyexywacQfRXvq4Hj8WFUX1bcQWtSYa7sW2n",
        },
        explanation: "Create a non-transferable token mint with 9 decimals",
      },
    ],
  ],
  schema: z.object({
    decimals: z
      .number()
      .int()
      .nonnegative("Decimals must be a non-negative integer"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const decimals = input.decimals;

    const { mint, signature } = await createNonTransferableMint(
      agent,
      decimals,
    );

    return {
      status: "success",
      message: "Non-transferable mint created successfully",
      mint: mint.toString(),
      transaction: signature,
    };
  },
};

export default createNonTransferableMintAction;
