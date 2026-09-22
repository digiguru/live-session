import { describe, expect, it } from "vitest";
import { cleanSessionName, validCredential, validSessionId } from "../validation.js";

describe("validation", () => {
  it("normalises names and validates public identities", () => {
    expect(cleanSessionName("  Monday   retro ")).toBe("Monday retro");
    expect(validSessionId("quantum-node-1234")).toBe(true);
    expect(validSessionId("not valid")).toBe(false);
    expect(validCredential("abcdefghijklmnop")).toBe(true);
    expect(validCredential("short")).toBe(false);
  });
});
