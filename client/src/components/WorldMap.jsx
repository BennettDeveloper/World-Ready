import { useRef, useEffect, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { REGIONS } from '../data/regions';

const POINTS = Object.entries(REGIONS).map(([key, r]) => ({
  key,
  lat: r.lat,
  lng: r.lon,
  flag: r.flag,
  name: r.name,
  interviewer: r.interviewer,
  styleTag: r.styleTag,
}));

export default function WorldMap({ selectedRegion, onSelectRegion }) {
  const globeRef = useRef();
  const elMapRef = useRef({});
  const onSelectRef = useRef(onSelectRegion);
  useEffect(() => { onSelectRef.current = onSelectRegion; });

  // Init controls once
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.4;
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.1;
    globe.pointOfView({ lat: 22, lng: 15, altitude: 2.2 });
  }, []);

  // Pan to selected region — update CSS classes directly, no element recreation
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    Object.entries(elMapRef.current).forEach(([key, el]) => {
      el.classList.toggle('selected', key === selectedRegion);
    });
    if (selectedRegion && REGIONS[selectedRegion]) {
      const r = REGIONS[selectedRegion];
      globe.controls().autoRotate = false;
      globe.pointOfView({ lat: r.lat, lng: r.lon, altitude: 1.6 }, 900);
    } else {
      globe.controls().autoRotate = true;
      globe.pointOfView({ lat: 22, lng: 15, altitude: 2.2 }, 900);
    }
  }, [selectedRegion]);

  // Stable factory — never changes, so globe never duplicates elements
  const makeHtmlEl = useCallback((d) => {
    if (elMapRef.current[d.key]) return elMapRef.current[d.key];
    const el = document.createElement('div');
    el.className = 'globe-pin';
    el.innerHTML = `
      <span class="globe-pin-flag">${d.flag}</span>
      <div class="globe-tooltip">
        <span class="gt-name">${d.name}</span>
        <span class="gt-interviewer">${d.interviewer}</span>
        <span class="gt-style">${d.styleTag}</span>
      </div>`;
    el.addEventListener('click', () => onSelectRef.current?.(d.key));
    elMapRef.current[d.key] = el;
    return el;
  }, []);

  return (
    <div className="world-map-stage">
      <Globe
        ref={globeRef}
        width={620}
        height={540}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#00d4ff"
        atmosphereAltitude={0.15}
        htmlElementsData={POINTS}
        htmlElement={makeHtmlEl}
        htmlTransitionDuration={0}
      />
      <div className="world-map-hint">Click a pin to select your interview city</div>
    </div>
  );
}
