import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const openai = new OpenAI();

async function main() {
    // 1. Start the Server process
    const serverPath = path.join(process.cwd(), "dist", "index.js");
    console.log("Looking for server at:", serverPath);

    const transport = new StdioClientTransport({
        command: "node",
        args: [path.join(process.cwd(), "dist", "index.js")],
    });

    // 2. Create the MCP Client
    const client = new Client(
        {
            name: "brewfather-host",
            version: "0.1.0",
        },
        {
            capabilities: {},
        }
    );

    await client.connect(transport);
    console.log("Connected to MCP Server! 🚀");

    const result = await client.request(
        { method: "tools/list" },
        ListToolsResultSchema // Optional validation schema
    );

    const openAITools = result.tools.map((tool) => ({
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
        },
    }));

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "user", content: "Get the last 3 batches" }
        ],
        tools: openAITools as any, // Overrule Typescript's type check
    });

    // Look at the first tool call
    const toolCall = response.choices[0]?.message.tool_calls?.[0];

    // Check if it exists AND is a function type
    if (toolCall && toolCall.type === 'function') {
        const toolCallId = toolCall.id;
        const rawArguments = toolCall.function.arguments;

        const parsedArguments = JSON.parse(rawArguments);
        const toolResult = await client.callTool({ name: "get_batches", arguments: parsedArguments });
        
        // Prepare the tool response message
        const toolMessage = {
            role: "tool",
            tool_call_id: toolCall.id, // Linking the data to the specific request
            content: JSON.stringify(toolResult),
        };

        // Add all messages to a history array
        const conversationHistory = [
            { role: "user", content: "Get the last 3 batches" },
            response.choices[0]?.message,
            toolMessage                  
        ];

        // 3. Final call to get the human-friendly answer
        const finalResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: conversationHistory as any,
        });

        console.log("\n--- Final Answer ---");
        console.log(finalResponse.choices[0]?.message.content);
    }
}

main().catch(console.error);