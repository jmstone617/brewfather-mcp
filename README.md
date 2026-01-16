# 🍺 BrewFather MCP Server

An MCP server that connects BrewFather to LLM tools, enabling batch lookups, detailed brew data retrieval, and brewing calculations via a simple API.

## ✨ Features

- *Batch Retrieval:* List recent brewing batches with sorting and limits (get_batches).
- *Deep Dive:* Retrieve full recipe, fermentation, and gravity details for specific batches (get_batch_details).
- *Calculators:* Built-in utilities like ABV calculation (calculate_abv).
- *Type-Safe:* Built with TypeScript and Zod for robust schema validation.

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- A [BrewFather](https://brewfather.app) account with API access (Premium subscription required).

## 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/brewfather-mcp.git
cd brewfather-mcp
```

2. Install dependencies:

```bash
npm install
```

## ⚙️ Configuration

Create a .env file in the root directory and add your BrewFather credentials:

```env
BREWFATHER_USER_ID=your_user_id
BREWFATHER_API_KEY=your_api_key
```

## 🏃 Usage

### Development (MCP Inspector)

To test the server capabilities locally using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector npx tsx src/index.ts
```

### Integration (Claude Desktop / LLMs)

Add the server to your configuration file:

```json
{
  "mcpServers": {
    "brewfather": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/brewfather-mcp/src/index.ts"],
      "env": {
        "BREWFATHER_USER_ID": "your_user_id",
        "BREWFATHER_API_KEY": "your_api_key"
      }
    }
  }
}
```
