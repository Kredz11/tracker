import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    env: {
      DB_PATH: ":memory:",
      JWT_SECRET: "test-secret",
    },
  },
});
