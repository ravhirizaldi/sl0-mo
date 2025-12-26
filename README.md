# sl0-mo

[![npm version](https://img.shields.io/npm/v/sl0-mo.svg)](https://www.npmjs.com/package/sl0-mo)

A lightweight Node.js library to add artificial latency and random errors to async functions and Express routes. Ideal for testing how your application handles slow networks or flaky services.

## Installation

```bash
npm install sl0-mo
```

## Usage

### Wrapper for Async Functions

```typescript
import { withLatency } from 'sl0-mo';

// Your original function
const fetchData = async (id: number) => {
  // ... fetch data
  return { id, name: "Item" };
};

// Wrapped version
const delayedFetch = withLatency(fetchData, {
  min: 200,      // Minimum latency in ms (default: 200)
  max: 1000,     // Maximum latency in ms (default: 800)
  errorRate: 0.1 // 10% chance of throwing an error (default: 0)
});

// Use it just like the original
try {
  const data = await delayedFetch(123);
  console.log(data);
} catch (err) {
  console.error("Request failed!");
}
```

### Express Middleware

```typescript
import express from 'express';
import { latencyMiddleware } from 'sl0-mo';

const app = express();

// Add latency to all routes
app.use(latencyMiddleware({
  min: 500,
  max: 1500,
  errorRate: 0.05
}));

app.get('/', (req, res) => {
  res.send('Delayed response');
});

app.listen(3000);
```

## API

### `withLatency(fn, options)`

Wraps an async function.

- `fn`: The async function to wrap.
- `options`:
    - `min` (number): Minimum delay in ms.
    - `max` (number): Maximum delay in ms.
    - `errorRate` (number): Probability of error (0-1).

### `latencyMiddleware(options)`

Express middleware.

- `options`: Same as `withLatency`.

## License

MIT
