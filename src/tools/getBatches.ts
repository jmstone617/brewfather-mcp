import type { ToolHandler } from "../utils/types.js";
import { getAuthHeaders } from "../utils/helpers.js";

export const getBatchesHandler: ToolHandler = {
    name: "get_batches",
    description: "Retrieves a list of the most recent batches from BrewFather",
    inputSchema: {
        type: "object",
        properties: {
            limit: {
                type: "number",
                description: "Number of recent batches to retrieve (default 5)",
            },
        },
        required: [],
    },
    run: async (input: any) => {
        const args = input as { limit?: number };
        const limit = args.limit ? args.limit : 5;

        try {
            const response = await fetch(
                `https://api.brewfather.app/v2/batches?limit=${limit}&order_by_direction=desc&order_by=brewDate`,
                {
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                return {
                    content: [{type: "text", text: "Error retrieving batches"}],
                    isError: true,
                };
            }

            const data = await response.json();

            // We return the raw JSON so the LLM can analyze it
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
                content:[{ type: "text", text: `Request failed: ${error}` }],
                isError: true,
            }
        }
    }
};

export default getBatchesHandler;