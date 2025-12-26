import { withLatency } from "../src";

describe("withLatency", () => {
  it("should pass arguments and return the result of the wrapped function", async () => {
    const mockFn = jest.fn(async (x: number) => x * 2);
    const wrapped = withLatency(mockFn, { min: 10, max: 20 });

    const result = await wrapped(5);
    expect(result).toBe(10);
    expect(mockFn).toHaveBeenCalledWith(5);
  });

  it("should respect the minimum latency", async () => {
    const mockFn = async () => "done";
    const minDelay = 100;
    const wrapped = withLatency(mockFn, { min: minDelay, max: minDelay + 50 });

    const start = Date.now();
    await wrapped();
    const duration = Date.now() - start;

    // Allow a small margin of error for timer inaccuracy
    expect(duration).toBeGreaterThanOrEqual(minDelay - 10);
  });

  it('should throw "fake latency injected error" based on errorRate', async () => {
    const mockFn = async () => "success";
    // Set errorRate to 1 to guarantee failure
    const wrapped = withLatency(mockFn, { min: 1, max: 5, errorRate: 1 });

    await expect(wrapped()).rejects.toThrow("fake latency injected error");
  });

  it("should not throw error if errorRate is 0", async () => {
    const mockFn = async () => "success";
    const wrapped = withLatency(mockFn, { min: 1, max: 5, errorRate: 0 });

    // Run multiple times to be sure
    for (let i = 0; i < 20; i++) {
      await expect(wrapped()).resolves.toBe("success");
    }
  });
});
