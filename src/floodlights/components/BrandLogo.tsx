/** inline WIN·2026 logo lockup — wordmark uses currentColor so it adapts to the theme */
export function BrandLogo() {
  return (
    <svg className="logo-svg" viewBox="0 0 248 64" role="img" aria-label="WIN 2026" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="60" height="60" rx="15" fill="#0E1424" stroke="#C9FF3D" strokeOpacity=".55" strokeWidth="2" />
      <path className="wmark-path" d="M15 21 L23 44 L32 30 L41 44 L49 21" fill="none" stroke="#C9FF3D" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="51.5" r="2.1" fill="#34E7FF" />
      <text className="wmk" x="78" y="42" fontSize="30" fill="currentColor">
        WIN<tspan fill="#C9FF3D">·</tspan>2026
      </text>
    </svg>
  )
}
