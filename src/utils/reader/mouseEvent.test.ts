import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetReaderConfig,
  mockSetObjectConfig,
  mockIsAndroidUi,
  hammerInstances,
} = vi.hoisted(() => ({
  mockGetReaderConfig: vi.fn((_key: string) => ""),
  mockSetObjectConfig: vi.fn(),
  mockIsAndroidUi: vi.fn(() => false),
  hammerInstances: [] as Array<{
    target: any;
    panSetCalls: any[];
    handlers: Record<string, (e: any) => Promise<void> | void>;
  }>,
}));

vi.mock("react-device-detect", () => ({
  isElectron: false,
}));

vi.mock("../../assets/lib/kookit-extra-browser.min", () => ({
  ConfigService: {
    getReaderConfig: mockGetReaderConfig,
    setReaderConfig: vi.fn(),
    setObjectConfig: mockSetObjectConfig,
    getAllListConfig: vi.fn(() => []),
  },
}));

vi.mock("./docUtil", () => ({
  getIframeDoc: vi.fn(() => []),
  getIframeWin: vi.fn(),
}));

vi.mock("../common", () => ({
  handleExitFullScreen: vi.fn(),
  handleFullScreen: vi.fn(),
  isReadingAidMode: vi.fn(() => false),
  isUndockedPopupBoxOpen: vi.fn(() => false),
  sleep: vi.fn(() => Promise.resolve()),
}));

vi.mock("../../store/useAppStore", () => ({
  useAppStore: {
    getState: vi.fn(() => ({})),
  },
}));

vi.mock("hammerjs", () => {
  const HammerMock: any = vi.fn(function (this: any, target: any) {
    const instance = {
      target,
      panSetCalls: [] as any[],
      handlers: {} as Record<string, (e: any) => Promise<void> | void>,
      get: vi.fn((name: string) => {
        if (name === "pan") {
          return {
            set: vi.fn((opts: any) => {
              instance.panSetCalls.push(opts);
            }),
          };
        }
        return { set: vi.fn() };
      }),
      on: vi.fn((events: string, cb: (e: any) => Promise<void> | void) => {
        for (const ev of events.split(/\s+/)) {
          instance.handlers[ev] = cb;
        }
      }),
    };
    hammerInstances.push(instance);
    return instance;
  });
  HammerMock.DIRECTION_ALL = 30;
  return { default: HammerMock };
});

vi.mock("./ttsUtil", () => ({
  default: { pauseAudio: vi.fn() },
}));

vi.mock("./shortcutUtil", () => ({
  getShortcutConfig: vi.fn(() => ({})),
  isNextPageKey: vi.fn(() => false),
  isPrevPageKey: vi.fn(() => false),
  matchShortcut: vi.fn(() => false),
}));

vi.mock("./overlayTurn", () => ({
  OVERLAY_TURN_DURATION: 200,
}));

vi.mock("../platform", () => ({
  isAndroidUi: mockIsAndroidUi,
}));

function createMockDoc() {
  const listeners: Record<string, Array<(e: any) => Promise<void> | void>> = {};
  return {
    addEventListener: vi.fn(
      (type: string, cb: (e: any) => Promise<void> | void) => {
        if (!listeners[type]) listeners[type] = [];
        listeners[type].push(cb);
      }
    ),
    dispatch: async (type: string, event: any) => {
      for (const cb of listeners[type] || []) {
        await cb(event);
      }
    },
    listenerCount: (type: string) => (listeners[type] || []).length,
  };
}

const createBook = (key = "book-1") =>
  ({
    key,
    format: "EPUB",
  }) as any;

const createRendition = () => ({
  revertDirection: "no",
  next: vi.fn(async () => {}),
  prev: vi.fn(async () => {}),
  record: vi.fn(async () => {}),
  getPosition: vi.fn(() => ({ cfi: "pos" })),
});

describe("mouseEvent bindHtmlEvent", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    mockGetReaderConfig.mockReset().mockReturnValue("");
    mockSetObjectConfig.mockReset();
    mockIsAndroidUi.mockReset().mockReturnValue(false);
    hammerInstances.length = 0;

    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("navigator", { maxTouchPoints: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("does not swallow discrete mouse wheel ticks arriving >= 40ms apart after 150ms", async () => {
    const { bindHtmlEvent } = await import("./mouseEvent");
    const doc = createMockDoc();
    const rendition = createRendition();

    bindHtmlEvent(rendition, doc, createBook(), "single", vi.fn(), vi.fn());

    // Tick 1 at t=0ms
    await doc.dispatch("wheel", { deltaX: 0, deltaY: 100, ctrlKey: false });
    expect(rendition.next).toHaveBeenCalledTimes(1);

    // Tick 2 at t=80ms (80ms < 120ms quiet timer, < 150ms min delay) -> ignored, defers quiet timer to t=200ms
    vi.advanceTimersByTime(80);
    await doc.dispatch("wheel", { deltaX: 0, deltaY: 100, ctrlKey: false });
    expect(rendition.next).toHaveBeenCalledTimes(1);

    // Tick 3 at t=160ms (before quiet timer fires at 200ms; gap=80ms >= 40ms, elapsed=160ms >= 150ms)
    vi.advanceTimersByTime(80);
    await doc.dispatch("wheel", { deltaX: 0, deltaY: 100, ctrlKey: false });
    expect(rendition.next).toHaveBeenCalledTimes(2);
  });

  it("suppresses continuous trackpad inertia with gap < 40ms and decaying delta", async () => {
    const { bindHtmlEvent } = await import("./mouseEvent");
    const doc = createMockDoc();
    const rendition = createRendition();

    bindHtmlEvent(rendition, doc, createBook(), "single", vi.fn(), vi.fn());

    await doc.dispatch("wheel", { deltaX: 0, deltaY: 80, ctrlKey: false });
    expect(rendition.next).toHaveBeenCalledTimes(1);

    for (let i = 1; i <= 15; i++) {
      vi.advanceTimersByTime(16);
      await doc.dispatch("wheel", {
        deltaX: 0,
        deltaY: Math.max(2, 80 - i * 5),
        ctrlKey: false,
      });
    }
    expect(rendition.next).toHaveBeenCalledTimes(1);
  });

  it("ignores sub-pixel wheel noise without deferring re-arm", async () => {
    const { bindHtmlEvent } = await import("./mouseEvent");
    const doc = createMockDoc();
    const rendition = createRendition();

    bindHtmlEvent(rendition, doc, createBook(), "single", vi.fn(), vi.fn());

    await doc.dispatch("wheel", { deltaX: 0, deltaY: 100, ctrlKey: false });
    expect(rendition.next).toHaveBeenCalledTimes(1);

    // Sub-pixel noise at t=100ms should not reset the 120ms quiet timer
    vi.advanceTimersByTime(100);
    await doc.dispatch("wheel", { deltaX: 0, deltaY: 0.4, ctrlKey: false });

    // Quiet timer from t=0ms fires at t=120ms
    vi.advanceTimersByTime(25);
    await doc.dispatch("wheel", { deltaX: 0, deltaY: 100, ctrlKey: false });
    expect(rendition.next).toHaveBeenCalledTimes(2);
  });

  it("attaches Hammer with DIRECTION_ALL on Android/touch devices without isTouch config", async () => {
    mockIsAndroidUi.mockReturnValue(true);
    const { bindHtmlEvent } = await import("./mouseEvent");
    const doc = createMockDoc();
    const rendition = createRendition();

    bindHtmlEvent(rendition, doc, createBook(), "single", vi.fn(), vi.fn());

    expect(hammerInstances).toHaveLength(1);
    expect(hammerInstances[0].panSetCalls).toEqual([{ direction: 30 }]);

    await hammerInstances[0].handlers.panup({
      type: "panup",
      pointerType: "touch",
    });
    expect(rendition.next).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(200);
    await hammerInstances[0].handlers.pandown({
      type: "pandown",
      pointerType: "touch",
    });
    expect(rendition.prev).toHaveBeenCalledTimes(1);
  });

  it("updates WeakMap context when bindHtmlEvent is called again on reused doc", async () => {
    mockIsAndroidUi.mockReturnValue(true);
    const { bindHtmlEvent } = await import("./mouseEvent");
    const doc = createMockDoc();
    const firstRendition = createRendition();
    const secondRendition = createRendition();

    bindHtmlEvent(
      firstRendition,
      doc,
      createBook("book-1"),
      "scroll",
      vi.fn(),
      vi.fn()
    );
    expect(doc.listenerCount("wheel")).toBe(1);
    expect(hammerInstances).toHaveLength(1);

    // Re-bind same reused doc with new rendition, book, and readerMode="single"
    bindHtmlEvent(
      secondRendition,
      doc,
      createBook("book-2"),
      "single",
      vi.fn(),
      vi.fn()
    );
    expect(doc.listenerCount("wheel")).toBe(1);
    expect(hammerInstances).toHaveLength(1);

    vi.setSystemTime(1000);
    await doc.dispatch("wheel", { deltaX: 0, deltaY: 100, ctrlKey: false });
    expect(firstRendition.next).not.toHaveBeenCalled();
    expect(secondRendition.next).toHaveBeenCalledTimes(1);

    await hammerInstances[0].handlers.panleft({
      type: "panleft",
      pointerType: "touch",
    });
    expect(secondRendition.next).toHaveBeenCalledTimes(2);
    expect(mockSetObjectConfig).toHaveBeenLastCalledWith(
      "book-2",
      { cfi: "pos" },
      "recordLocation"
    );
  });
});
