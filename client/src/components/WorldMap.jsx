import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { REGIONS } from '../data/regions';

const loader = new Loader({
  apiKey: 'AIzaSyDNzve-W7zTBlEkHiLruCpzhQTiu3ScdHs',
  version: 'weekly',
});

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#374151' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#4b5563' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#374151' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#4b5563' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1a2535' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1628' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1e3a5f' }] },
];

function makePinSvg(flag, selected) {
  const size = selected ? 46 : 36;
  const bg = selected ? '#00d4ff' : 'rgba(17,24,39,0.9)';
  const border = selected ? '#00d4ff' : 'rgba(255,255,255,0.45)';
  const ring = selected
    ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="none" stroke="#00d4ff" stroke-width="2" opacity="0.4"/>`
    : '';
  const fontSize = selected ? 22 : 18;
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    ${ring}
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}" fill="${bg}" stroke="${border}" stroke-width="1.8"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}">${flag}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function makePinIcon(google, flag, selected) {
  const size = selected ? 46 : 36;
  return {
    url: makePinSvg(flag, selected),
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
}

function iwContent(r) {
  return (
    `<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;">` +
    `<span style="font-size:2rem;line-height:1;flex-shrink:0;">${r.flag}</span>` +
    `<div style="display:flex;flex-direction:column;gap:3px;">` +
    `<div style="font-size:0.95rem;font-weight:700;color:#f0f6fc;font-family:Inter,sans-serif;">${r.name}</div>` +
    `<div style="font-size:0.78rem;color:#00d4ff;font-family:Inter,sans-serif;">${r.interviewer}</div>` +
    `<div style="font-size:0.68rem;color:rgba(240,246,252,0.5);font-family:Inter,sans-serif;">${r.styleTag}</div>` +
    `</div></div>`
  );
}

function applySelection(google, markersRef, infoWindowRef, map, key) {
  Object.entries(markersRef.current).forEach(([k, marker]) => {
    const sel = k === key;
    marker.setIcon(makePinIcon(google, REGIONS[k].flag, sel));
    marker.setZIndex(sel ? 100 : 1);
  });

  if (key && REGIONS[key]) {
    const r = REGIONS[key];
    map.panTo({ lat: r.lat, lng: r.lon });
    map.setZoom(5);
    infoWindowRef.current.setContent(iwContent(r));
    infoWindowRef.current.open(map, markersRef.current[key]);
  } else {
    infoWindowRef.current?.close();
    map.panTo({ lat: 22, lng: 15 });
    map.setZoom(2);
  }
}

export default function WorldMap({ selectedRegion, onSelectRegion }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const infoWindowRef = useRef(null);
  const googleRef = useRef(null);
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    loader.load().then((google) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      googleRef.current = google;

      const map = new google.maps.Map(containerRef.current, {
        zoom: 2,
        center: { lat: 22, lng: 15 },
        styles: MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        gestureHandling: 'cooperative',
        backgroundColor: '#0d1117',
        minZoom: 2,
        maxZoom: 12,
        clickableIcons: false,
      });

      mapRef.current = map;
      infoWindowRef.current = new google.maps.InfoWindow({ disableAutoPan: false });

      Object.entries(REGIONS).forEach(([key, r]) => {
        const marker = new google.maps.Marker({
          position: { lat: r.lat, lng: r.lon },
          map,
          title: r.name,
          icon: makePinIcon(google, r.flag, false),
          cursor: 'pointer',
          zIndex: 1,
        });

        marker.addListener('click', () => onSelectRegion?.(key));
        markersRef.current[key] = marker;
      });

      readyRef.current = true;
      if (selectedRegion) applySelection(google, markersRef, infoWindowRef, map, selectedRegion);
    });

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const google = googleRef.current;
    const map = mapRef.current;
    if (!google || !map || !readyRef.current) return;
    applySelection(google, markersRef, infoWindowRef, map, selectedRegion);
  }, [selectedRegion]);

  return (
    <div className="world-map-stage">
      <div ref={containerRef} className="world-map-container" />
      <div className="world-map-hint">Click a pin to select your interview city</div>
    </div>
  );
}
