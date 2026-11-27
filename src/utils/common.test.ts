import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetReaderConfig } = vi.hoisted(() => ({
  mockGetReaderConfig: vi.fn((_key: string) => ""),
}));

vi.mock("react-device-detect", () => ({
  isElectron: false,
}));

vi.mock("../assets/lib/kookit-extra-browser.min", () => ({
  CommonTool: {},
  ConfigService: {
    getReaderConfig: mockGetReaderConfig,
    getAllListConfig: vi.fn(() => []),
  },
  KookitConfig: { ConvertLangMap: {} },
  SyncUtil: {},
  CollectionUtil: {},
}));

vi.mock("../assets/lib/kookit.min", () => ({
  BookHelper: {},
}));

vi.mock("./file/bookUtil", () => ({ default: {} }));
vi.mock("./storage/databaseService", () => ({ default: {} }));
vi.mock("localforage", () => ({ default: {} }));
vi.mock("../constants/driveList", () => ({ driveList: [] }));
vi.mock("./request/thirdparty", () => ({
  encryptToken: vi.fn(),
  getCloudSyncToken: vi.fn(),
  refreshThirdToken: vi.fn(),
}));
vi.mock("./file/common", () => ({
  getCloudConfig: vi.fn(),
  getCloudToken: vi.fn(),
  removeCloudConfig: vi.fn(),
}));
vi.mock("./storage/syncService", () => ({ default: {} }));
vi.mock("./request/user", () => ({ updateUserConfig: vi.fn() }));
vi.mock("../constants/ttsList", () => ({
  languageCNMap: {},
  languageENMap: {},
}));
vi.mock("../constants/dropdownList", () => ({
  getOcrPaddleLangList: vi.fn(() => []),
  ocrTesseractLangList: [],
}));
vi.mock("./storage/tokenService", () => ({ default: {} }));
vi.mock("./plugins/catalog", () => ({
  getBuiltinPluginDefinition: vi.fn(),
}));
vi.mock("../i18n", () => ({
  default: { t: (key: string) => key, language: "en" },
}));
vi.mock("dompurify", () => ({
  default: { sanitize: (html: string) => html },
}));

import { AUTO_SINGLE_PAGE_MAX_WIDTH, getPageWidth } from "./common";

const setViewportWidth = (clientWidth: number) => {
  vi.stubGlobal("document", {
    body: { clientWidth },
  });
};

const parsePx = (value: string) => parseInt(value, 10);

describe("getPageWidth", () => {
  beforeEach(() => {
    mockGetReaderConfig.mockReset();
    mockGetReaderConfig.mockReturnValue("");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("narrow viewports (< AUTO_SINGLE_PAGE_MAX_WIDTH)", () => {
    it("uses full width minus padding instead of 0.6x in single mode", () => {
      setViewportWidth(390);
      const result = getPageWidth("single", "1", 0, false, false, false);
      const width = parsePx(result.pageWidth);

      expect(width).toBe(356);
      expect(width).toBeLessThanOrEqual(390 - 32);
      expect(result.pageOffset).toBe("calc(50vw + 0px - 0px - 178px)");
    });

    it("uses full width minus padding in scroll mode", () => {
      setViewportWidth(412);
      const result = getPageWidth("scroll", "1", 0, false, false, false);
      const width = parsePx(result.pageWidth);

      expect(width).toBe(378);
      expect(width).toBeLessThanOrEqual(412 - 32);
    });

    it("respects positive margin and scale < 1 on narrow viewports", () => {
      setViewportWidth(390);
      const withMargin = getPageWidth("single", "1", 20, false, false, false);
      expect(parsePx(withMargin.pageWidth)).toBe(318);

      const scaledDown = getPageWidth("single", "0.75", 0, false, false, false);
      expect(parsePx(scaledDown.pageWidth)).toBe(266);
    });

    it("clamps scale >= 1 to clientWidth - 32 with centered offset", () => {
      setViewportWidth(390);
      const result = getPageWidth("single", "1.5", 0, false, false, false);
      const width = parsePx(result.pageWidth);

      expect(width).toBe(356);
      expect(result.pageOffset).toBe("calc(50vw + 0px - 0px - 178px)");
    });

    it("uses minimal 16px horizontal padding when isFitPage is true", () => {
      setViewportWidth(390);
      const result = getPageWidth("single", "1", 0, false, false, true);

      expect(result.pageWidth).toBe("358px");
      expect(result.pageOffset).toBe("16px");
    });

    it("clamps isFitPage width to positive value when panels exceed viewport", () => {
      setViewportWidth(390);
      const result = getPageWidth("scroll", "1", 0, true, true, true);

      expect(parsePx(result.pageWidth)).toBeGreaterThanOrEqual(4);
      expect(result.pageOffset).toBe("316px");
    });
  });

  describe("desktop viewports (>= AUTO_SINGLE_PAGE_MAX_WIDTH)", () => {
    it("uses 0.75x viewport width by default at scale=1 in single/scroll modes", () => {
      setViewportWidth(1280);
      const single = getPageWidth("single", "1", 0, false, false, false);
      const scroll = getPageWidth("scroll", "1", 0, false, false, false);

      expect(single.pageWidth).toBe("960px");
      expect(single.pageOffset).toBe("calc(50vw + 0px - 0px - 480px)");
      expect(scroll).toEqual(single);
    });

    it("keeps 125% preset wider than 100% and clamps 200% to clientWidth - 32", () => {
      setViewportWidth(1280);
      const preset125 = getPageWidth("single", "1.25", 0, false, false, false);
      const preset200 = getPageWidth("single", "2", 0, false, false, false);

      expect(parsePx(preset125.pageWidth)).toBe(1200);
      expect(parsePx(preset200.pageWidth)).toBeLessThanOrEqual(1280 - 32);
      expect(parsePx(preset200.pageWidth)).toBe(1248);
      expect(preset200.pageOffset).toBe("calc(50vw + 0px - 0px - 624px)");
    });

    it("accounts for locked nav and setting panels", () => {
      setViewportWidth(1280);
      const navLocked = getPageWidth("single", "1", 0, true, false, false);
      expect(parsePx(navLocked.pageWidth)).toBe(658);
      expect(navLocked.pageOffset).toBe("calc(50vw + 150px - 0px - 329px)");

      const fitNavLocked = getPageWidth("single", "1", 0, true, false, true);
      expect(fitNavLocked.pageWidth).toBe("874px");
      expect(fitNavLocked.pageOffset).toBe("350px");
    });

    it("keeps desktop isFitPage padding at 50/106", () => {
      setViewportWidth(AUTO_SINGLE_PAGE_MAX_WIDTH);
      const result = getPageWidth("single", "1", 0, false, false, true);

      expect(result.pageWidth).toBe("794px");
      expect(result.pageOffset).toBe("50px");
    });

    it("computes double mode width with margin and column alignment", () => {
      setViewportWidth(1280);
      const normal = getPageWidth("double", "1", 0, false, false, false);
      expect(normal.pageWidth).toBe("1200px");
      expect(normal.pageOffset).toBe("calc(50vw + 0px - 0px - 600px)");

      const negMargin = getPageWidth("double", "1", -40, false, false, false);
      expect(parsePx(negMargin.pageWidth)).toBeLessThanOrEqual(1280 - 32);
    });
  });
});
