'use client';
import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { Report } from '@/types';
import { PRIORITY_CONFIG } from '@/lib/utils';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';

interface ProblemsMapProps {
  reports: Report[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

const PRIORITY_MARKER_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

export default function ProblemsMapInner({
  reports,
  height = '500px',
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
}: ProblemsMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Avoid double-init
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    import('leaflet').then((L) => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!containerRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: true }).setView(center, zoom);
      mapRef.current = map;

      // Tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add markers for each report with a location
      reports.forEach((report) => {
        if (!report.location?.latitude || !report.location?.longitude) return;
        const { latitude: lat, longitude: lng } = report.location;
        const color = PRIORITY_MARKER_COLORS[report.priority_level] ?? '#6b7280';
        const priorityLabel = PRIORITY_CONFIG[report.priority_level]?.label ?? report.priority_level;

        // Custom colored circle marker
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:28px;height:28px;border-radius:50% 50% 50% 0;
            background:${color};border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,.4);
            transform:rotate(-45deg);
          "></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -30],
        });

        const popup = L.popup({ maxWidth: 260 }).setContent(`
          <div style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.5">
            <div style="font-weight:700;margin-bottom:4px;color:#0f172a">${report.title}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
              <span style="background:${color}20;color:${color};border:1px solid ${color}40;
                border-radius:9999px;padding:1px 8px;font-size:11px;font-weight:600">${priorityLabel}</span>
              ${report.category ? `<span style="background:#f1f5f9;color:#475569;border-radius:9999px;padding:1px 8px;font-size:11px;border:1px solid #e2e8f0">${report.category.icon ?? ''} ${report.category.name}</span>` : ''}
            </div>
            <div style="color:#64748b;font-size:12px">📍 ${report.location?.city}, ${report.location?.state}</div>
            <div style="color:#64748b;font-size:12px">👍 ${report.support_count} supporters</div>
            ${report.ai_analysis ? `<div style="color:#64748b;font-size:12px">Score: <strong>${report.ai_analysis.priority_score}/100</strong></div>` : ''}
            <a href="/reports/${report.id}" style="display:inline-block;margin-top:8px;color:#1d4ed8;font-size:12px;font-weight:600">View Details →</a>
          </div>
        `);

        L.marker([lat, lng], { icon }).bindPopup(popup).addTo(map);
      });

      // Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports.length]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}
      aria-label="Problems map"
    />
  );
}
