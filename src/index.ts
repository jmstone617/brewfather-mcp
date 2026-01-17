import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config";
import { getAuthHeaders } from "./utils/helpers.js";
import getBatchesHandler from "./tools/getBatches.js";
import getBatchDetailsHandler from "./tools/getBatchDetails.js";
import { get } from "node:http";

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
            getBatchesHandler,
            getBatchDetailsHandler,
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
    else if (request.params.name === getBatchesHandler.name) {
        return await getBatchesHandler.run(request.params.arguments);
    }
    else if (request.params.name === getBatchDetailsHandler.name) {
        return await getBatchDetailsHandler.run(request.params.arguments);
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