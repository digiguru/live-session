import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const outputRoot = "docs/assets/walkthroughs";
await mkdir(`${outputRoot}/wheel-of-emotion`, { recursive: true });
await mkdir(`${outputRoot}/teamtools`, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function snapPage(page, path) {
  await page.screenshot({ path, fullPage: true });
}

async function snap(locator, path) {
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path });
}

async function createWheelRoom(page, name) {
  await page.goto("https://emotion.digiguru.co.uk", { waitUntil: "networkidle" });
  await page.locator("#createFirstRoomButton").click();
  await page.locator("#newRoomNameInput").fill(name);
  await page.locator("#createRoomForm").getByRole("button", { name: "Create room" }).click();
  await page.waitForURL(/\/room\/[a-z0-9-]{3,64}$/);
  await page.locator("#connectionStatus").filter({ hasText: "Live" }).waitFor();
  return page.url();
}

async function captureWheel() {
  const hostContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const participantContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const host = await hostContext.newPage();
  const participant = await participantContext.newPage();

  await host.goto("https://emotion.digiguru.co.uk", { waitUntil: "networkidle" });
  await snapPage(host, `${outputRoot}/wheel-of-emotion/01-host-dashboard.png`);

  const roomUrl = await createWheelRoom(host, "Live-session walkthrough");
  await snapPage(host, `${outputRoot}/wheel-of-emotion/02-live-room.png`);

  await participant.goto(roomUrl, { waitUntil: "networkidle" });
  await participant.locator("#connectionStatus").filter({ hasText: "Live" }).waitFor();
  await snap(participant.locator(".workspace"), `${outputRoot}/wheel-of-emotion/03-emotion-wheel.png`);

  await host.locator("#connectedCount").filter({ hasText: "1" }).waitFor();
  await snap(host.locator(".room-panel"), `${outputRoot}/wheel-of-emotion/04-presence-waiting.png`);

  await participant.locator('[data-emotion-id="happy-optimistic-hopeful"]').click();
  await host.locator("#roomVoteTotal").filter({ hasText: "1" }).waitFor();
  await snap(host.locator(".room-panel"), `${outputRoot}/wheel-of-emotion/05-group-results.png`);

  await host.locator("#saveRoomButton").click();
  await host.goto("https://emotion.digiguru.co.uk", { waitUntil: "networkidle" });
  await snap(host.locator(".saved-rooms-card"), `${outputRoot}/wheel-of-emotion/06-saved-rooms.png`);

  await host.goto(roomUrl, { waitUntil: "networkidle" });
  host.once("dialog", (dialog) => dialog.accept());
  await host.locator("#closeRoomButton").click();
  await participant.locator("#closedNotice").waitFor({ state: "visible" });
  await snap(participant.locator("#roomView"), `${outputRoot}/wheel-of-emotion/07-closed-room.png`);

  await hostContext.close();
  await participantContext.close();
}

async function captureTeamTools() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  await page.goto("https://team-tools.digiguru.co.uk", { waitUntil: "networkidle" });
  await page.locator("#user").waitFor();

  for (const scientist of ["Ada Lovelace", "Alan Turing", "Grace Hopper", "Margaret Hamilton"]) {
    await page.locator("#user").fill(scientist);
    await page.locator("#add").click();
  }
  await snap(page.locator(".tool-card--entry"), `${outputRoot}/teamtools/01-participant-entry.png`);

  await snap(page.locator(".tool-grid"), `${outputRoot}/teamtools/02-activity-workspace.png`);

  const comfort = page.locator(".tool-card").filter({ has: page.getByRole("heading", { name: "Comfort model" }) });
  await snap(comfort, `${outputRoot}/teamtools/03-comfort-model.png`);

  const tuckman = page.locator(".tool-card").filter({ has: page.getByRole("heading", { name: "Tuckman model" }) });
  await snap(tuckman, `${outputRoot}/teamtools/04-tuckman-model.png`);

  await snapPage(page, `${outputRoot}/teamtools/05-combined-workspace.png`);

  await context.close();
}

try {
  await captureWheel();
  await captureTeamTools();
} finally {
  await browser.close();
}
