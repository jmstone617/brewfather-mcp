import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config";

// Verify keys are present
const BF_USER = process.env.BREWFATHER_USER_ID;
const BF_KEY = process.env.BREWFATHER_API_KEY;

if (!BF_USER || !BF_KEY) {
    console.error("BREWFATHER_USER_ID and BREWFATHER_API_KEY must be set");
    process.exit(1);
}

// Helper for Basic Auth header
function getAuthHeaders() {
    const authString = Buffer.from(`${BF_USER}:${BF_KEY}`).toString("base64");
    return {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
    };
}

// 1. Initialize the server
const server = new Server(
    {
        name: "brewfather-mcp",
        version: "0.1.0"
    },
    {
        capabilities: {
            tools: {}
        },
    }
);

// 2. Define the "Menu" (List Tools)
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "calculate_abv",
                description: "Calculates Alcohol by Volume from gravity readings",
                inputSchema: {
                    type: "object",
                    properties: {
                        og: { type: "string", description: "Original gravity" },
                        fg: { type: "string", description: "Final gravity" }
                    },
                    required: ["og", "fg"]
                },
            },
            {
                name: "get_batches",
                description: "Retrieves a list of the most recent batches from BrewFather",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "number",
                            description: "Max number of batches to return (default: 5)"
                        }
                    },
                },
            },
            {
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
            },
        ],
    };
});

// 3. Define the "Kitchen" (Execute Tools)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "calculate_abv") {
        // A simple calculation to test our plumbing
        const args = request.params.arguments as { og: string; fg: string };

        const og = parseFloat(args.og);
        const fg = parseFloat(args.fg);
        const abv = (og - fg) * 131.25;

        return {
            content: [
                {
                    type: "text",
                    text: `The ABV is ${abv.toFixed(2)}%`,
                },
            ],
        };
    }
    else if (request.params.name === "get_batches") {
        const args = request.params.arguments as { limit?: number };
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
    else if (request.params.name === "get_batch_details") {
        const args = request.params.arguments as { batch_id: string };
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
    throw new Error("Tool not found");
});

// 4. Start the transport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // NOTE: We use console.error for logs because console.log is used for the protocol!
    console.error("BrewFather MCP Server running on Stdio");
}

main().catch((error) => {
    console.error("Server error: ", error);
    process.exit(1);
});