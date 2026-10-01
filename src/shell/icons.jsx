// Shared inline icons. All use currentColor and accept className / size.
const Svg = ({ size = 20, className, children, filled = false }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const GitHubIcon = (p) => (
  <Svg {...p} filled>
    <path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.1 6.8 9.4.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1-.9-1.3-.9-1.3-.7-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.7 1.3 1.9.9 2.3.7.1-.5.3-.9.6-1.1-2.2-.3-4.5-1.1-4.5-4.8 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.7-2.3 4.5-4.5 4.8.3.3.7.8.7 1.7v2.5c0 .3.2.6.7.5A10 10 0 0022 12c0-5.5-4.5-10-10-10z" />
  </Svg>
);

export const LinkedInIcon = (p) => (
  <Svg {...p} filled>
    <path d="M4 4h4v16H4zM6 2a2 2 0 110 4 2 2 0 010-4zM10 8h4v2c.6-1 1.7-2 3.5-2 3.7 0 4.5 2.4 4.5 5.5V20h-4v-6c0-1.5 0-3.4-2-3.4s-2.3 1.6-2.3 3.3V20h-4z" />
  </Svg>
);

export const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Svg>
);

export const WhatsAppIcon = (p) => (
  <Svg {...p}>
    <path d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.6z" />
    <path d="M9 9.5c.3 2 2.2 4 4.5 4.6l1-1 1.8.8-.3 1.4c-3.3.3-6.8-3.1-6.6-6.5l1.4-.3.8 1.8z" />
  </Svg>
);

export const ArrowUpRightIcon = (p) => (
  <Svg {...p}>
    <path d="M7 17L17 7M8 7h9v9" />
  </Svg>
);

export const ArrowRightIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const ExternalIcon = (p) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
  </Svg>
);

export const FileIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </Svg>
);

export const socialIcon = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  email: MailIcon,
  whatsapp: WhatsAppIcon,
};
