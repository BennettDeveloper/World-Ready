import { useRef, useEffect, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { REGIONS } from '../data/regions';

const POINTS = Object.entries(REGIONS).map(([key, r]) => ({
  key,
  lat: r.lat,
  lng: r.lon,
  flag: r.flag,
  name: r.name,
}));

export default function WorldMap({ selectedRegion, onSelectRegion }) {
  const globeRef = useRef();

  // Auto-rotate when idle
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.4;
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.1;
    globe.pointOfView({ lat: 22, lng: 15, altitude: 2.2 });
  }, []);

  // Pan to selected region
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (selectedRegion && REGIONS[selectedRegion]) {
      const r = REGIONS[selectedRegion];
      globe.controls().autoRotate = false;
      globe.pointOfView({ lat: r.lat, lng: r.lon, altitude: 1.6 }, 900);
    } else {
      globe.controls().autoRotate = true;
      globe.pointOfView({ lat: 22, lng: 15, altitude: 2.2 }, 900);
    }
  }, [selectedRegion]);

  const makeHtmlEl = useCallback((d) => {
    const el = document.createElement('div');
    const isSelected = d.key === selectedRegion;
    el.className = 'globe-pin' + (isSelected ? ' selected' : '');
    el.innerHTML = `<span class="globe-pin-flag">${d.flag}</span>`;
    el.title = d.name;
    el.addEventListener('click', () => onSelectRegion?.(d.key));
    return el;
  }, [selectedRegion, onSelectRegion]);

  return (
    <div className="world-map-stage">
      <Globe
        ref={globeRef}
        width={620}
        height={540}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="rgba(0,212,255,0.18)"
        atmosphereAltitude={0.18}
        htmlElementsData={POINTS}
        htmlElement={makeHtmlEl}
        htmlTransitionDuration={300}
      />
      <div className="world-map-hint">Click a pin to select your interview city</div>
    </div>
  );
}
