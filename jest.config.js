module.exports = {
  roots: ["<rootDir>/assets"],
  testMatch: ["<rootDir>/assets/test/**/*.ts(x)?"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/assets/setupTests.ts"]
};
