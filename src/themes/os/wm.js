// Window-manager state for Reddy OS. Pure reducer, no DOM access.
// Window rects live here; drags/resizes write to the DOM directly while the
// pointer moves and commit the final rect with a single "rect" action.

export const MENU_H = 30;
export const DOCK_SPACE = 92; // kept clear at the bottom for maximised windows
export const MIN_W = 320;
export const MIN_H = 220;

// Default window sizes and titles (no JSX here so the reducer stays pure).
export const APP_META = {
  about: { title: "About Me", w: 660, h: 640 },
  projects: { title: "Projects", w: 900, h: 600 },
  experience: { title: "Experience", w: 660, h: 640 },
  terminal: { title: "Terminal", w: 620, h: 420 },
  resume: { title: "Résumé.pdf", w: 760, h: 700 },
  certs: { title: "Certificates", w: 800, h: 580 },
  photos: { title: "Photos", w: 820, h: 620 },
  contact: { title: "Contact", w: 600, h: 600 },
  readme: { title: "Read me first.txt", w: 500, h: 500 },
  osinfo: { title: "About this portfolio", w: 440, h: 470 },
  project: { title: "Project", w: 660, h: 640 },
};

export const winId = (app, props) => (app === "project" ? `project:${props?.id}` : app);

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function fitRect(rect, vp) {
  const w = clamp(rect.w, MIN_W, Math.max(MIN_W, vp.w - 24));
  const h = clamp(rect.h, MIN_H, Math.max(MIN_H, vp.h - MENU_H - DOCK_SPACE - 12));
  const x = clamp(rect.x, 8, Math.max(8, vp.w - w - 8));
  const y = clamp(rect.y, MENU_H + 6, Math.max(MENU_H + 6, vp.h - h - DOCK_SPACE));
  return { x, y, w, h };
}

function cascadeRect(app, n, vp) {
  const meta = APP_META[app] || APP_META.project;
  const step = n % 7;
  return fitRect({ x: 150 + step * 32, y: MENU_H + 26 + step * 28, w: meta.w, h: meta.h }, vp);
}

export const maxRect = (vp) => ({
  x: 6,
  y: MENU_H + 6,
  w: vp.w - 12,
  h: vp.h - MENU_H - 12 - DOCK_SPACE + 12,
});

function topMost(wins, excludeId) {
  let best = null;
  for (const w of wins) if (!w.min && w.id !== excludeId && (!best || w.z > best.z)) best = w;
  return best ? best.id : null;
}

function makeWin(app, props, rect, z, extra = {}) {
  return { id: winId(app, props), app, props: props || {}, ...rect, z, min: false, max: false, origin: null, ...extra };
}

export function initWM({ vp, page }) {
  const base = { wins: [], topZ: 10, focused: null, opened: 0 };
  if (page === "archive") {
    const r = cascadeRect("projects", 0, vp);
    return { ...base, wins: [makeWin("projects", {}, r, 11, { max: true })], topZ: 11, focused: "projects", opened: 1 };
  }
  // Arrange About Me + Terminal side by side when there is room, overlapped otherwise.
  const left = 136;
  const avail = vp.w - left - 24;
  let about, term;
  if (avail >= 1160) {
    about = { x: left + 10, y: MENU_H + 24, w: 640, h: 660 };
    term = { x: left + 10 + 640 + 28, y: MENU_H + 70, w: Math.min(600, avail - 640 - 40), h: 420 };
  } else {
    const aw = Math.min(620, Math.round(avail * 0.62));
    const tw = Math.min(560, Math.round(avail * 0.56));
    about = { x: left, y: MENU_H + 20, w: aw, h: 640 };
    term = { x: vp.w - tw - 28, y: MENU_H + 110, w: tw, h: 400 };
  }
  return {
    ...base,
    wins: [makeWin("about", {}, fitRect(about, vp), 11), makeWin("terminal", {}, fitRect(term, vp), 12)],
    topZ: 12,
    focused: "terminal",
    opened: 2,
  };
}

export function wmReducer(state, a) {
  switch (a.type) {
    case "open": {
      const id = winId(a.app, a.props);
      const z = state.topZ + 1;
      const existing = state.wins.find((w) => w.id === id);
      if (existing) {
        return {
          ...state,
          topZ: z,
          focused: id,
          wins: state.wins.map((w) =>
            w.id === id ? { ...w, z, min: false, max: a.max ?? w.max, origin: null } : w
          ),
        };
      }
      const rect = cascadeRect(a.app, state.opened, a.vp);
      const win = makeWin(a.app, a.props, rect, z, { max: !!a.max, origin: a.origin || null });
      return { ...state, topZ: z, focused: id, opened: state.opened + 1, wins: [...state.wins, win] };
    }
    case "focus": {
      const w = state.wins.find((x) => x.id === a.id);
      if (!w || (state.focused === a.id && w.z === state.topZ)) return state;
      const z = state.topZ + 1;
      return { ...state, topZ: z, focused: a.id, wins: state.wins.map((x) => (x.id === a.id ? { ...x, z } : x)) };
    }
    case "blur":
      return state.focused === null ? state : { ...state, focused: null };
    case "minimize":
      return {
        ...state,
        focused: state.focused === a.id ? topMost(state.wins, a.id) : state.focused,
        wins: state.wins.map((w) => (w.id === a.id ? { ...w, min: true } : w)),
      };
    case "close": {
      const wins = state.wins.filter((w) => w.id !== a.id);
      return { ...state, wins, focused: state.focused === a.id ? topMost(wins) : state.focused };
    }
    case "toggleMax":
      return { ...state, wins: state.wins.map((w) => (w.id === a.id ? { ...w, max: !w.max } : w)) };
    case "rect":
      return {
        ...state,
        wins: state.wins.map((w) => (w.id === a.id ? { ...w, x: a.x, y: a.y, w: a.w ?? w.w, h: a.h ?? w.h } : w)),
      };
    case "cycle": {
      const visible = state.wins.filter((w) => !w.min);
      if (visible.length < 2) return state;
      // Bring the bottom-most window to the front: repeated presses walk the whole stack.
      const bottom = visible.reduce((b, w) => (w.z < b.z ? w : b));
      const z = state.topZ + 1;
      return { ...state, topZ: z, focused: bottom.id, wins: state.wins.map((w) => (w.id === bottom.id ? { ...w, z } : w)) };
    }
    case "closeAll":
      return { ...state, wins: [], focused: null };
    default:
      return state;
  }
}
