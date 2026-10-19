import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "job-mcp", version: "1.0.0" });

server.tool(
  "get_jobs",
  "Get job vacancies. Optionally filter by stack, like MERN or Python/Django",
  { stack: z.string().optional() },
  async ({ stack }) => {
    const url = new URL("http://localhost:3000/api/jobs");
    if (stack) url.searchParams.set("stack", stack);
    const res = await fetch(url);
    const json = await res.json();
    return {
      content: [{ type: "text", text: JSON.stringify(json.data, null, 2) }],
    };
  }
);

await server.connect(new StdioServerTransport());