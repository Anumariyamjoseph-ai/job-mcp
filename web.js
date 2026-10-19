import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const JOB_URL = process.env.JOB_URL || "http://localhost:3000";
const STUDENT_URL = process.env.STUDENT_URL || "http://localhost:4000";

function buildServer() {
  const server = new McpServer({ name: "job-student-mcp", version: "1.0.0" });

  server.tool(
    "get_jobs",
    "Get job vacancies. Optionally filter by stack, like MERN or Python/Django",
    { stack: z.string().optional() },
    async ({ stack }) => {
      const url = new URL(JOB_URL + "/api/jobs");
      if (stack) url.searchParams.set("stack", stack);
      const json = await (await fetch(url)).json();
      return { content: [{ type: "text", text: JSON.stringify(json.data, null, 2) }] };
    }
  );

  server.tool(
    "get_students",
    "Get students with their skills. Optionally filter by stack, like MERN or Python/Django",
    { stack: z.string().optional() },
    async ({ stack }) => {
      const url = new URL(STUDENT_URL + "/api/students");
      if (stack) url.searchParams.set("stack", stack);
      const json = await (await fetch(url)).json();
      return { content: [{ type: "text", text: JSON.stringify(json.data, null, 2) }] };
    }
  );

  return server;
}

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", (req, res) => {
  res.status(405).json({ error: "Use POST" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("MCP server running on port " + PORT));