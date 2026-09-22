import { describe, expect, it } from "vitest";
import { countPresence, participantPresence } from "../presence.js";

describe("presence", () => {
  it("deduplicates participant connections and derives waiting", () => {
    const states = participantPresence(
      [
        { participantId: "p1", connected: true, lastActiveAt: 9_900 },
        { participantId: "p1", connected: true, lastActiveAt: 9_950 },
        { participantId: "p2", connected: true, lastActiveAt: 9_900 },
        { participantId: "p3", connected: true, lastActiveAt: 1_000 }
      ],
      [{ participantId: "p1", value: "done" }],
      10_000,
      1_000
    );
    expect(countPresence(states)).toEqual({ connected: 3, active: 2, contributed: 1, waiting: 1 });
  });

  it("expires idle non-contributors without wall-clock sleeping", () => {
    const connection = [{ participantId: "p1", connected: true, lastActiveAt: 1_000 }];
    expect(countPresence(participantPresence(connection, [], 1_200, 300))).toEqual({
      connected: 1, active: 1, contributed: 0, waiting: 1
    });
    expect(countPresence(participantPresence(connection, [], 1_301, 300))).toEqual({
      connected: 1, active: 0, contributed: 0, waiting: 0
    });
  });
});
