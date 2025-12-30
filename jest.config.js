/** @type {import("jest").Config} **/
export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest', // 1. The transformer
            {
                useESM: true, // 2. The options object
            },
        ],
    },
};