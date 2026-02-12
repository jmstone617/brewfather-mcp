import type { ToolHandler } from "../utils/types.js";
import { getAuthHeaders } from "../utils/helpers.js";

export const getInventoryFermentablesHandler: ToolHandler = {
    name: "get_inventory_fermentables",
    description: "Retrieves a list of inventory fermentables from BrewFather",
    inputSchema: {
        type: "object",
        properties: {
            limit: {
                type: "number",
                description: "Number of inventory fermentables to retrieve (default 10)",
            },
        },
        required: [],
    },
    run: async (input: any) => {
        const args = input as { limit?: number };
        const limit = args.limit ? args.limit : 10;
        const categories = [
            "color", 
            "grainCategory", 
            "inventory", 
            "name", 
            "notes", 
            "origin", 
            "potential", 
            "supplier", 
            "type"
        ];

        try {
            const params = new URLSearchParams({
                limit: String(limit),
                inventory_exists: "true",
                categories: categories.join(","),
            });
            const response = await fetch(
                `https://api.brewfather.app/v2/inventory/fermentables?${params.toString()}`,
                {
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                return {
                    content: [{type: "text", text: "Error retrieving inventory fermentables"}],
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

export default getInventoryFermentablesHandler;
