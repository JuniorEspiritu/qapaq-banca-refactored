// Íconos SVG minimalistas (sin dependencias externas).
const PATHS = {
  home:     "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z|M9 22V12h6v10",
  wallet:   "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z|M16 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0",
  credit:   "M2 5h20v14H2z|M2 10h20",
  send:     "M22 2L11 13|M22 2L15 22 8 13 2 9z",
  receipt:  "M5 2h14a1 1 0 0 1 1 1v18l-3-2-2 2-2-2-2 2-2-2-3 2V3a1 1 0 0 1 1-1z",
  file:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|M14 2v6h6|M16 13H8|M16 17H8|M10 9H8",
  logout:   "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4|M16 17l5-5-5-5|M21 12H9",
  arrow:    "M5 12h14|M12 5l7 7-7 7",
  back:     "M19 12H5|M12 19l-7-7 7-7",
  plus:     "M12 5v14|M5 12h14",
  check:    "M20 6L9 17l-5-5",
  clock:    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z|M12 6v6l4 2",
  piggy:    "M19 11c0-1.1-.9-2-2-2H6.5L4 7.5V11H2v2h2v1a7 7 0 0 0 14 0v-1h2v-2h-1zM9 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  chart:    "M3 3v18h18|M18 9l-5 5-4-4-4 4",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M7 10l5 5 5-5|M12 15V3",
  x:        "M18 6L6 18|M6 6l12 12",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  briefcase:"M20 7h-3V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2H8a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM9 5h6v2H9z",
  gem:      "M6 3h12l4 6-10 12L2 9z|M2 9h20|M9 3l3 6-3 12|M15 3l-3 6 3 12",
  calendar: "M3 4h18v18H3z|M16 2v4|M8 2v4|M3 10h18",
  trending: "M23 6l-9.5 9.5-5-5L1 18|M17 6h6v6",
  users:    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8|M22 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75",
  key:      "M21 2l-2 2|M14.5 9.5L19 5|M16 7l3 3|M9.5 14.5a5 5 0 1 1-7.07 7.07 5 5 0 0 1 7.07-7.07z",
  cardId:   "M2 4h20v16H2z|M7 10h2|M7 14h6|M15 9h4v6h-4z",
  alert:    "M12 9v4|M12 17h.01|M10.29 3.86l-8.13 14A1 1 0 0 0 3 19h18a1 1 0 0 0 .87-1.5l-8.14-14a1 1 0 0 0-1.74 0z",
  thumbsUp: "M7 10v12|M15 5.88 14 10h6.31a2 2 0 0 1 1.92 2.56l-2.18 7A2 2 0 0 1 18.12 21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L11 2a2.5 2.5 0 0 1 4 2z",
  thumbsDown:"M17 14V2|M9 18.12 10 14H3.69a2 2 0 0 1-1.92-2.56l2.18-7A2 2 0 0 1 5.88 3H20a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L13 22a2.5 2.5 0 0 1-4-2z",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  refresh:  "M21 2v6h-6|M3 22v-6h6|M3 11a9 9 0 0 1 15-6.7L21 8|M21 13a9 9 0 0 1-15 6.7L3 16",
}

export default function Icon({ name, size = 18, className }) {
  const d = PATHS[name] || PATHS.home
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
      style={{ flexShrink: 0 }}>
      {d.split('|').map((seg, i) => <path key={i} d={seg} />)}
    </svg>
  )
}
