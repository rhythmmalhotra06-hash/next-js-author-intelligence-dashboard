/* 24px feather-style icons used across Author Intelligence. */

const I = (path) => ({ size = 18, color = "currentColor", strokeWidth = 1.75, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }} {...rest}>
    {path}
  </svg>
);

const IcDashboard = I(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>);
const IcUsers = I(<><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14c2.5 0 5 1.6 5 5" /></>);
const IcChart = I(<><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>);
const IcMessage = I(<><path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1.4 4A7.9 7.9 0 0 1 21 12Z" /><path d="M8 11h8M8 14h5" /></>);
const IcSearch = I(<><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>);
const IcBell = I(<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 9H3c0-1 3-2 3-9Z" /><path d="M10 21a2 2 0 0 0 4 0" /></>);
const IcChevDown = I(<path d="m6 9 6 6 6-6" />);
const IcChevRight = I(<path d="m9 6 6 6-6 6" />);
const IcArrowUp = I(<><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></>);
const IcArrowDown = I(<><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>);
const IcArrowRight = I(<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>);
const IcStar = I(<path d="m12 3 2.7 6 6.3.6-4.8 4.3 1.5 6.3L12 17l-5.7 3.2 1.5-6.3L3 9.6 9.3 9 12 3Z" />);
const IcFlag = I(<><path d="M4 22V4" /><path d="M4 4h13l-2 4 2 4H4" /></>);
const IcSparkle = I(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></>);
const IcFilter = I(<path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" />);
const IcDownload = I(<><path d="M12 3v12" /><path d="m6 11 6 6 6-6" /><path d="M5 21h14" /></>);
const IcMore = I(<><circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/></>);
const IcSettings = I(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>);
const IcCheck = I(<path d="m5 12 5 5L20 7" />);
const IcInfo = I(<><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M12 11v5" /></>);
const IcExternal = I(<><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></>);
const IcCalendar = I(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>);
const IcDot = ({ size = 6, color = "currentColor" }) => (<span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, flex: "none" }} />);

Object.assign(window, {
  IcDashboard, IcUsers, IcChart, IcMessage, IcSearch, IcBell, IcChevDown, IcChevRight,
  IcArrowUp, IcArrowDown, IcArrowRight, IcStar, IcFlag, IcSparkle, IcFilter, IcDownload,
  IcMore, IcSettings, IcCheck, IcInfo, IcExternal, IcCalendar, IcDot,
});
