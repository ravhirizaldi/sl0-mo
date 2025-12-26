import { withLatency } from "../src";

const fetchMockData = async (id: number) => {
  return `Data for item ${id}`;
};

const delayedFetch = withLatency(fetchMockData, {
  min: 500,
  max: 1500,
  errorRate: 0.2,
});

(async () => {
  console.log("--- Starting Basic Example ---");
  console.log(
    "Simulating 5 requests with 500-1500ms latency and 20% error rate..."
  );

  for (let i = 1; i <= 5; i++) {
    const start = Date.now();
    try {
      console.log(`\nRequest ${i}: Fetching...`);
      const result = await delayedFetch(i);
      const duration = Date.now() - start;
      console.log(`Request ${i}: Success (${duration}ms) -> ${result}`);
    } catch (error: any) {
      const duration = Date.now() - start;
      console.log(`Request ${i}: Failed (${duration}ms) -> ${error.message}`);
    }
  }
  console.log("\n--- Finished Basic Example ---");
})();
