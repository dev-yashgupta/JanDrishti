'use client';
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import type { Map as LeafletMap, Marker, Circle } from 'leaflet';
import type { Report } from '@/types';
import { PRIORITY_CONFIG } from '@/lib/utils';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';

export interface CommunityMapRef {
  panTo: (lat: number, lng: number, zoom?: number) => void;
  locateUser: () => void;
  toggleHeatmap: () => boolean;
}

interface CommunityMapInnerProps {
  reports: Report[];
  height?: string;
  onSelectReport?: (report: Report) => void;
}

const PRIORITY_MARKER_COLORS: Record<string, string> = {
  CRITICAL: '#D92D20',
  HIGH:     '#F04438',
  MEDIUM:   '#F79009',
  LOW:      '#12B76A',
};

const CommunityMapInner = forwardRef<CommunityMapRef, CommunityMapInnerProps>(function CommunityMapInner(
  { reports, height = '650px', onSelectReport },
  ref
) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Marker[]>([]);
  const circlesRef = useRef<Circle[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);
  const [heatmapActive, setHeatmapActive] = useState(false);

  useImperativeHandle(ref, () => ({
    panTo: (lat: number, lng: number, zoom = 15) => {
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], zoom, { animate: true });
      }
    },
    locateUser: () => {
      if (!navigator.geolocation || !mapRef.current) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 15, { animate: true });
            import('leaflet').then((L) => {
              if (!mapRef.current) return;
              if (userMarkerRef.current) userMarkerRef.current.remove();
              const userIcon = L.divIcon({
                className: '',
                html: `<div class="user-pulse-marker"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });
              userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
                .bindPopup('<b>Your Current Location</b>')
                .addTo(mapRef.current)
                .openPopup();
            });
          }
        },
        () => {
          // Fallback if denied
        }
      );
    },
    toggleHeatmap: () => {
      setHeatmapActive((prev) => !prev);
      return !heatmapActive;
    },
  }));

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    import('leaflet').then((L) => {
      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!containerRef.current) return;
      const initialCenter: [number, number] =
        reports.length > 0 && reports[0].location?.latitude && reports[0].location?.longitude
          ? [reports[0].location.latitude, reports[0].location.longitude]
          : [28.4595, 77.0266];

      const map = L.map(containerRef.current, { zoomControl: true }).setView(initialCenter, DEFAULT_MAP_ZOOM);
      mapRef.current = map;

      // CartoDB Positron / OSM clean tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Render markers and halo clusters
      markersRef.current.forEach((m) => m.remove());
      circlesRef.current.forEach((c) => c.remove());
      markersRef.current = [];
      circlesRef.current = [];

      reports.forEach((report) => {
        if (!report.location?.latitude || !report.location?.longitude) return;
        const { latitude: lat, longitude: lng } = report.location;
        const color = PRIORITY_MARKER_COLORS[report.priority_level] ?? '#155EEF';
        const priorityLabel = PRIORITY_CONFIG[report.priority_level]?.label ?? report.priority_level;
        const score = report.priority_score ?? (report.ai_analysis?.priority_score || 50);

        // Pulsing halo for Critical and High incidents
        if (report.priority_level === 'CRITICAL' || report.priority_level === 'HIGH') {
          const haloClass = report.priority_level === 'CRITICAL' ? 'cluster-halo-critical' : 'cluster-halo-warning';
          const circle = L.circle([lat, lng], {
            radius: report.priority_level === 'CRITICAL' ? 450 : 250,
            color: color,
            weight: 2,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: 0.2,
            className: haloClass,
          }).addTo(map);
          circlesRef.current.push(circle);
        }

        // Custom teardrop pin icon
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative; width:30px; height:30px; cursor:pointer;">
              <div style="
                width:30px; height:30px; border-radius:50% 50% 50% 0;
                background:${color}; border:2.5px solid white;
                box-shadow:0 3px 8px rgba(7,26,47,0.35);
                transform:rotate(-45deg);
                display:flex; align-items:center; justify-content:center;
              ">
              </div>
              <div style="
                position:absolute; top:7px; left:7px; width:16px; height:16px;
                color:white; font-size:9px; font-weight:800; font-family:sans-serif;
                display:flex; align-items:center; justify-content:center;
                z-index:2;
              ">
                ${score}
              </div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -32],
        });

        const popupContent = document.createElement('div');
        popupContent.className = 'p-3.5 space-y-2';
        popupContent.style.minWidth = '240px';
        popupContent.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
            <span style="font-size:10px; font-weight:800; text-transform:uppercase; padding:2px 8px; border-radius:9999px; background:${color}15; color:${color}; border:1px solid ${color}35;">
              ${priorityLabel} (${score})
            </span>
            <span style="font-size:10px; font-family:monospace; color:#94a3b8; font-weight:bold;">${report.id.slice(0, 8)}</span>
          </div>
          <div style="font-size:13px; font-weight:700; color:#0f172a; line-height:1.3;">
            ${report.title}
          </div>
          <div style="font-size:11px; color:#64748b; display:flex; align-items:center; gap:4px;">
            📍 ${report.location?.locality ? report.location.locality + ', ' : ''}${report.location?.city || 'Gurugram'}
          </div>
          <div style="font-size:11px; color:#475569; display:flex; justify-content:space-between; border-top:1px solid #f1f5f9; padding-top:6px; margin-top:6px;">
            <span>Category: <strong style="color:#155EEF;">${report.category?.name || 'Civic'}</strong></span>
            <span>👍 ${report.support_count || 1}</span>
          </div>
          <a href="/reports/${report.id}" style="display:block; text-align:center; margin-top:8px; padding:6px 12px; background:#155EEF; color:white; border-radius:8px; font-size:11px; font-weight:700; text-decoration:none;">
            View Full Problem Dossier →
          </a>
        `;

        const marker = L.marker([lat, lng], { icon })
          .bindPopup(popupContent, { maxWidth: 280 })
          .addTo(map);

        marker.on('click', () => {
          if (onSelectReport) onSelectReport(report);
        });

        markersRef.current.push(marker);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [reports, onSelectReport]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <div ref={containerRef} className="w-full h-full z-10" />
    </div>
  );
});

export default CommunityMapInner;
