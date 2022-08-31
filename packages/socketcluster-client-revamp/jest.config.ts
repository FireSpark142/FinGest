/* eslint-disable */
export default {
  displayName: "socketcluster-client-revamp",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": "@swc/jest"
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/packages/socketcluster-client-revamp"
};
