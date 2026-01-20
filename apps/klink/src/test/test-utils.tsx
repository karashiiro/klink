import type { ReactNode, ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TamaguiProvider, createTamagui, Theme } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { Provider as JotaiProvider, createStore } from "jotai";
import { MemoryRouter } from "react-router";
import {
  SessionContext,
  type SessionContextValue,
} from "../contexts/SessionContext";

// Create Tamagui config matching main.tsx
const tamaguiConfig = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    dark: {
      ...defaultConfig.themes.dark,
      background: "hsla(249, 17%, 16%, 1.00)",
      primary: "#364163",
      accent: "#a58431",
      accentOverlay: "rgba(221, 189, 158, 1)",
      accentText: "#534116",
      greenBase: "rgba(124, 255, 104, 1)",
      greenHover: "rgba(101, 233, 81, 1)",
      greenPress: "rgba(78, 197, 60, 1)",
      greenText: "rgba(29, 94, 19, 1)",
      greenDisabled: "rgba(124, 255, 104, 0.5)",
      blueBase: "rgba(61, 154, 253, 1)",
      blueHover: "rgba(44, 130, 223, 1)",
      bluePress: "rgba(31, 110, 196, 1)",
      blueText: "rgba(30, 68, 114, 1)",
      blueDisabled: "rgba(61, 154, 253, 0.5)",
      yellowBase: "#F4D03F",
      yellowHover: "#F1C40F",
      yellowPress: "#D4AC0D",
      yellowText: "#4A3D08",
      redBase: "#E74C3C",
      redHover: "#C0392B",
      redPress: "#A93226",
      redText: "#640000",
      overlay: "rgba(255, 255, 255, 0.1)",
      shadow: "rgba(0, 0, 0, 0.25)",
      textTitle: "#ecf1ff",
      textMuted: "#999999",
      insetCardBackground: "#364163",
      insetCardPublicBackground: "#F7A5A5",
      insetCardBorderRadius: "12px",
      insetCardInnerRadius: "8px",
      insetCardBorderWidth: "2px",
      insetCardPadding: "$2",
    },
  },
});

// Default mock session for authenticated tests
export const mockSession: SessionContextValue = {
  pdsUrl: "https://bsky.social",
  did: "did:plc:test123",
  endpoint: "https://bsky.social",
  handle: "test.bsky.social",
};

export interface WrapperOptions {
  store?: ReturnType<typeof createStore>;
  session?: SessionContextValue | null;
  initialRoute?: string;
  withRouter?: boolean;
}

export function createWrapper(options: WrapperOptions = {}) {
  const {
    store = createStore(),
    session = mockSession,
    initialRoute = "/",
    withRouter = false,
  } = options;

  return function Wrapper({ children }: { children: ReactNode }) {
    let content = (
      <TamaguiProvider config={tamaguiConfig}>
        <Theme name="dark">
          <JotaiProvider store={store}>
            <SessionContext.Provider value={session}>
              {children}
            </SessionContext.Provider>
          </JotaiProvider>
        </Theme>
      </TamaguiProvider>
    );

    if (withRouter) {
      content = (
        <MemoryRouter initialEntries={[initialRoute]}>{content}</MemoryRouter>
      );
    }

    return content;
  };
}

export interface RenderWithProvidersOptions
  extends Omit<RenderOptions, "wrapper">,
    WrapperOptions {}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
) {
  const {
    store = createStore(),
    session,
    initialRoute,
    withRouter,
    ...renderOptions
  } = options;

  return {
    store,
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: createWrapper({ store, session, initialRoute, withRouter }),
      ...renderOptions,
    }),
  };
}

// Re-export everything from @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";
export { userEvent };
export { renderWithProviders as render };
