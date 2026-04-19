import { REGIONS } from '../data/regions';

// Equirectangular: x = (lon+180)/360*W, y = (90-lat)/180*H
const W = 1600, H = 320;
const px = lon => (lon + 180) / 360 * W;
const py = lat => (90 - lat) / 180 * H;

// Terrain polygons — first copy (0..1600). Second copy adds W to every x coord.
const TERRAIN = [
  // === Ice / Arctic ===
  { fill: '#c8dce8', d: `M556,5 L628,2 L685,8 L705,22 L682,46 L618,54 L563,40 Z` }, // Greenland
  { fill: '#deeaf0', d: `M0,0 L185,0 L185,18 L100,20 L0,15 Z` }, // Arctic top
  { fill: '#deeaf0', d: `M1415,0 L1600,0 L1600,18 L1510,20 L1415,12 Z` },
  // === North America ===
  { fill: '#3d7a2c', d: `M88,52 L185,32 L262,36 L272,55 L255,72 L232,92 L205,96 L162,82 L102,82 Z` }, // West forests
  { fill: '#9b8743', d: `M262,36 L362,40 L402,62 L442,65 L430,100 L388,118 L348,126 L298,120 L268,105 Z` }, // Plains
  { fill: '#4a8a38', d: `M402,62 L548,62 L565,80 L540,112 L498,126 L458,120 L428,100 Z` }, // East forests
  { fill: '#c4a040', d: `M215,100 L285,94 L295,118 L272,145 L245,152 L218,142 L205,125 Z` }, // SW desert
  { fill: '#5a8f3a', d: `M245,145 L295,138 L302,158 L278,165 L250,162 Z` }, // Mexico/C.Am
  { fill: '#c8dce8', d: `M185,32 L242,22 L258,34 L232,38 L195,38 Z` }, // Northern Canada tundra
  // === South America ===
  { fill: '#1a6b15', d: `M456,158 L508,150 L542,155 L558,175 L552,202 L538,228 L510,248 L478,254 L458,240 L445,215 L444,185 Z` }, // Tropical
  { fill: '#7a9a35', d: `M478,254 L510,248 L540,255 L536,288 L510,298 L485,285 Z` }, // Pampas
  // === Europe ===
  { fill: '#4a8a38', d: `M726,35 L800,28 L842,35 L865,50 L858,76 L830,90 L798,95 L768,90 L740,75 L726,55 Z` },
  { fill: '#5a8840', d: `M776,14 L812,9 L832,18 L820,38 L798,42 L776,35 Z` }, // Scandinavia
  { fill: '#5a8f38', d: `M715,38 L729,34 L732,52 L718,56 Z` }, // UK
  { fill: '#6a9040', d: `M738,68 L775,62 L782,82 L768,92 L738,90 Z` }, // Iberia
  // === Africa ===
  { fill: '#c4a040', d: `M716,90 L862,85 L912,92 L938,115 L930,160 L870,172 L818,168 L768,162 L726,150 L714,128 Z` }, // N. Africa / Sahara
  { fill: '#2d7a1a', d: `M762,155 L822,150 L860,158 L872,185 L855,206 L820,210 L788,205 L762,185 Z` }, // Congo jungle
  { fill: '#7a9a35', d: `M714,158 L760,150 L762,185 L788,205 L820,210 L858,208 L900,185 L898,228 L870,252 L832,268 L800,272 L768,262 L740,240 L716,210 Z` }, // Sub-Saharan
  { fill: '#6a9040', d: `M865,248 L900,242 L906,268 L882,272 L860,262 Z` }, // SE Africa tip
  // === Middle East ===
  { fill: '#c8a040', d: `M920,95 L975,88 L1012,95 L1028,112 L1022,140 L994,162 L958,168 L928,158 L914,135 Z` },
  { fill: '#6a9040', d: `M868,68 L928,62 L950,78 L938,98 L902,102 L868,95 Z` }, // Turkey/Caucasus
  // === Asia ===
  { fill: '#4a7a3a', d: `M830,15 L1200,5 L1355,15 L1398,35 L1378,65 L1198,65 L1048,60 L895,52 L868,38 Z` }, // Russia/Siberia
  { fill: '#9b8743', d: `M895,52 L1048,42 L1180,50 L1220,65 L1198,95 L1098,105 L998,100 L918,90 Z` }, // C. Asia steppe
  { fill: '#3d7a2c', d: `M1200,55 L1352,48 L1420,58 L1448,75 L1430,106 L1400,118 L1360,126 L1308,118 L1260,98 L1220,80 Z` }, // E. Asia forests
  { fill: '#6a9040', d: `M1010,115 L1055,108 L1080,118 L1078,148 L1060,178 L1036,185 L1012,168 L1005,142 Z` }, // India
  { fill: '#2d7a1a', d: `M1225,132 L1350,118 L1400,128 L1406,148 L1380,162 L1338,168 L1295,155 L1250,145 Z` }, // SE Asia
  { fill: '#1a6b15', d: `M1260,162 L1340,158 L1380,168 L1382,182 L1345,185 L1275,178 Z` }, // Indonesia/Malaysia
  { fill: '#1a6b15', d: `M1405,165 L1448,162 L1452,178 L1425,182 L1406,178 Z` }, // E. Indonesia
  { fill: '#4a8a38', d: `M1413,68 L1438,62 L1448,75 L1440,92 L1418,90 Z` }, // Japan
  // === Australia ===
  { fill: '#c4a040', d: `M1256,192 L1418,185 L1462,200 L1468,230 L1448,262 L1398,275 L1336,278 L1282,262 L1252,240 L1250,215 Z` },
  { fill: '#4a8a38', d: `M1418,235 L1462,228 L1466,255 L1442,262 L1416,252 Z` }, // SE coast
  { fill: '#4a8a38', d: `M1506,228 L1520,220 L1530,238 L1520,258 L1508,252 Z` }, // New Zealand
  // === Antarctica ===
  { fill: '#d0e8f2', d: `M0,292 L1600,292 L1600,320 L0,320 Z` },
];

// Region pin positions
const PINS = Object.entries(REGIONS).map(([key, r]) => ({
  key,
  flag: r.flag,
  x: px(r.lon),
  y: py(r.lat),
}));

export default function Globe({ size = 320, selectedRegion, onSelectRegion }) {
  const latLines = [-60, -30, 0, 30, 60].map((lat, i) => {
    const cy = 160 + (lat / 90) * 148;
    const rx = Math.sqrt(Math.max(0, 148 * 148 - (cy - 160) * (cy - 160)));
    return <ellipse key={i} cx="160" cy={cy} rx={rx} ry={rx * 0.15} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7" />;
  });

  return (
    <div className="globe-wrapper" style={{ width: size, height: size }}>
      <div className="globe-sphere">
        {/* Terrain surface */}
        <div className="globe-surface">
          <svg viewBox={`0 0 ${W * 2} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            {/* Ocean base */}
            <rect width={W * 2} height={H} fill="#1a5f8c" />
            {/* First copy of terrain */}
            {TERRAIN.map((t, i) => <path key={i} d={t.d} fill={t.fill} />)}
            {/* Second copy — offset by W */}
            {TERRAIN.map((t, i) => {
              const shifted = t.d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) =>
                `${parseFloat(x) + W},${y}`);
              return <path key={`b${i}`} d={shifted} fill={t.fill} />;
            })}
            {/* Region pins on first copy */}
            {PINS.map(p => (
              <g key={p.key} className={`globe-pin${selectedRegion === p.key ? ' pin-selected' : ''}`}
                onClick={() => onSelectRegion?.(p.key)}>
                <circle cx={p.x} cy={p.y} r="10" fill="rgba(255,255,255,0.9)" stroke="white" strokeWidth="1.5" className="pin-pulse" />
                <circle cx={p.x} cy={p.y} r="5" fill={selectedRegion === p.key ? '#00d4ff' : 'rgba(10,15,30,0.8)'} />
                <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="7">{p.flag}</text>
              </g>
            ))}
            {/* Region pins second copy */}
            {PINS.map(p => (
              <g key={`b-${p.key}`} className={`globe-pin${selectedRegion === p.key ? ' pin-selected' : ''}`}
                onClick={() => onSelectRegion?.(p.key)}>
                <circle cx={p.x + W} cy={p.y} r="10" fill="rgba(255,255,255,0.9)" stroke="white" strokeWidth="1.5" className="pin-pulse" />
                <circle cx={p.x + W} cy={p.y} r="5" fill={selectedRegion === p.key ? '#00d4ff' : 'rgba(10,15,30,0.8)'} />
                <text x={p.x + W} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="7">{p.flag}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Latitude grid */}
        <svg className="globe-grid" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
          {latLines}
          <circle cx="160" cy="160" r="148" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </svg>

        {/* Lighting */}
        <div className="globe-shading" />
        <div className="globe-atmosphere" />
      </div>
      <div className="globe-glow" />
    </div>
  );
}
