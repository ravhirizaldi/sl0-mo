import express from "express";
import { latencyMiddleware } from "../src";

const app = express();
const port = 3000;

// 1. Apply latency to all routes using middleware
// app.use(latencyMiddleware({ ... }));

// 2. Or apply to specific routes
app.get("/", latencyMiddleware({ min: 100, max: 200 }), (req, res) => {
  res.send("Hello World with Latency (Middleware)!");
});

// 3. Or wrap the handler function directly
import { withLatency } from "../src";

app.get(
  "/users",
  withLatency(
    async (req, res) => {
      res.send("User list (wrapped handler)");
    },
    { min: 300, max: 1200 }
  )
);

// 4. Wrapped handler with error possibility
app.get(
  "/login",
  withLatency(
    async (req, res) => {
      res.send("login sukses kalo sabar nunggu");
    },
    { min: 200, max: 2000, errorRate: 0.1 }
  )
); // 10% chance to fail

// Add error handler for demo
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Caught error:", err.message);
  res.status(500).send(`Server Error: ${err.message}`);
});

app.listen(port, () => {
  console.log(`Express example app listening on port ${port}`);
  console.log(`Try accessing http://localhost:${port}`);
  console.log(
    `You should experience delays between 100-500ms and occasional 500 errors.`
  );
  console.log(`Press Ctrl+C to exit.`);
});
