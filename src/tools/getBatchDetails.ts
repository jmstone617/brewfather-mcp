import type { ToolHandler } from "../utils/types.js";
import { getAuthHeaders } from "../utils/helpers.js";

export const getBatchDetailsHandler: ToolHandler = {
    name: "get_batch_details",
    description: "Retrieves the details about a specific batch.",
    inputSchema: {
        type: "object",
        properties: {
            batch_id: {
                type: "string",
                description: "The ID of the batch to retrieve"
            }
        },
        required: ["batch_id"],
    },
    run: async (input: any) => {
        const args = input as { batch_id: string };
        const batchId = args.batch_id;
        
        try {
            const response = await fetch(
                `https://api.brewfather.app/v2/batches/${batchId}`,
                {
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                return {
                    content: [{type: "text", text: "Error retrieving batch details"}],
                    isError: true,
                };
            }

            const data = await response.json();

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2),
                    },
                ],
            }
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Request failed: ${error}` }],
                isError: true,
            }
        }
    }
};

export default getBatchDetailsHandler;