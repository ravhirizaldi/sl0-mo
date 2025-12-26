import express from "express";
import request from "supertest";
import { latencyMiddleware, withLatency } from "../src";

describe("latencyMiddleware", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
  });

  it("should call next() and eventually respond", async () => {
    app.use(latencyMiddleware({ min: 10, max: 20 }));
    app.get("/", (req, res) => res.send("ok"));

    const start = Date.now();
    const res = await request(app).get("/");
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.text).toBe("ok");
    expect(duration).toBeGreaterThanOrEqual(10);
  });

  it("should inject errors based on errorRate", async () => {
    // High error rate to test error injection
    app.use(latencyMiddleware({ min: 10, max: 20, errorRate: 1 }));

    // Error handling middleware
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(500).send(err.message);
    });

    app.get("/", (req, res) => res.send("ok"));

    const res = await request(app).get("/");
    expect(res.status).toBe(500);
    expect(res.text).toBe("fake latency injected error");
  });

  it("should correctly handle errors when using withLatency wrapper on a handler", async () => {
    // Create a detached handler wrapped with latency and error
    const wrappedHandler = withLatency(
      async (req: any, res: any) => {
        res.send("success");
      },
      { min: 10, max: 20, errorRate: 1 }
    );

    app.get("/wrapped", wrappedHandler);

    // Error handling middleware
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(500).send(err.message);
    });

    const res = await request(app).get("/wrapped");
    expect(res.status).toBe(500);
    expect(res.text).toBe("fake latency injected error");
  });
});
