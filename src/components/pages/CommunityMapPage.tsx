'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useReports, useCategories } from '@/hooks/useReports';
import type { PriorityLevel, Report } from '@/types';
import type { CommunityMapRef } from '@/components/maps/CommunityMapInner';
import { displayId } from '@/lib/utils';
import {
  MapPin, Flame, Crosshair, Search, ArrowRight,
  Layers, MapPinOff, Compass
} from 'lucide-react';

const CommunityMapInner = dynamic(() => import('@/components/maps/CommunityMapInner'), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" label="Loading Geographic Intelligence Map…" className="h-[650px]" />,
});

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#D92D20',
  HIGH:     '#F04438',
  MEDIUM:   '#F79009',
  LOW:      '#12B76A',
};

export function CommunityMapPage() {
  const mapRef = useRef<CommunityMapRef>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'ALL'>('ALL');
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const { reports, fetchReports, loading } = useReports();
  const { categories, fetchCategories }    = useCategories();

  useEffect(() => {
    fetchCategories();
    fetchReports({ per_page: 100 });
  }, [fetchCategories, fetchReports]);

  useEffect(() => {
    fetchReports({
      search: searchQuery.trim() || undefined,
      category_id: filterCategory !== 'ALL' ? filterCategory : undefined,
      priority_level: filterPriority !== 'ALL' ? filterPriority : undefined,
      per_page: 100,
    });
  }, [filterCategory, filterPriority, fetchReports]);

  const rawItems = reports?.items ?? [];
  const validReports = rawItems.filter(r => r.location?.latitude && r.location?.longitude);

  // Sort descending by priority score for active clusters list
  const rankedReports = [...validReports].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    // Search geocoding via Nominatim OpenStreetMap
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          mapRef.current?.panTo(lat, lon, 14);
        }
      })
      .catch(() => {});
  }

  function handleLocate() {
    mapRef.current?.locateUser();
  }

  function handleToggleHeatmap() {
    if (mapRef.current) {
      const active = mapRef.current.toggleHeatmap();
      setHeatmapOn(active);
    }
  }

  function handleSelectReport(r: Report) {
    setSelectedReportId(r.id);
    if (r.location?.latitude && r.location?.longitude) {
      mapRef.current?.panTo(r.location.latitude, r.location.longitude, 16);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 gap-4 border-b border-[#E4E7EC]">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Compass className="h-6 w-6 text-[#155EEF]" />
              <span>Community Geographic Intelligence Map</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time geospatial OpenStreetMap with device GPS pinpointing, search geocoding, and priority heatmaps.
            </p>
          </div>

          {/* Controls & Layer Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search on Map */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search address/sector..."
                className="text-xs bg-white border border-[#E4E7EC] rounded-xl pl-8 pr-3 py-2 font-medium text-slate-700 w-44 sm:w-56 focus:outline-none focus:border-[#155EEF] shadow-xs"
              />
              <button type="submit" aria-label="Search map location">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400 cursor-pointer" />
              </button>
            </form>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-xs bg-white border border-[#E4E7EC] rounded-xl px-3 py-2 font-medium text-slate-700 shadow-xs cursor-pointer focus:outline-none focus:border-[#155EEF]"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value as PriorityLevel | 'ALL')}
              className="text-xs bg-white border border-[#E4E7EC] rounded-xl px-3 py-2 font-medium text-slate-700 shadow-xs cursor-pointer focus:outline-none focus:border-[#155EEF]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical (81-100)</option>
              <option value="HIGH">High (61-80)</option>
              <option value="MEDIUM">Medium (31-60)</option>
              <option value="LOW">Low (0-30)</option>
            </select>

            {/* Heatmap Toggle */}
            <button
              onClick={handleToggleHeatmap}
              className={`text-xs px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 border shadow-xs ${
                heatmapOn
                  ? 'bg-red-50 text-[#D92D20] border-red-200'
                  : 'bg-white text-slate-700 border-[#E4E7EC] hover:bg-slate-50'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-[#D92D20]" />
              <span>Halos: {heatmapOn ? 'ON' : 'ACTIVE'}</span>
            </button>

            {/* Recenter / GPS */}
            <button
              onClick={handleLocate}
              className="text-xs px-3 py-2 bg-[#155EEF] text-white rounded-xl font-bold transition flex items-center gap-1.5 hover:bg-blue-600 shadow-xs"
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span>My Location</span>
            </button>
          </div>
        </div>

        {/* 12-Column Grid: Map + Active Clusters Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Main Leaflet Map Viewport */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)] overflow-hidden flex flex-col h-[650px] relative">
            <CommunityMapInner
              ref={mapRef}
              reports={validReports}
              height="100%"
              onSelectReport={r => setSelectedReportId(r.id)}
            />

            {/* Map Floating Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#E4E7EC] shadow-md text-[11px] flex items-center gap-3 select-none">
              <span className="font-bold text-slate-700">Severity:</span>
              <span className="flex items-center gap-1 text-[#D92D20] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D92D20]"></span> Critical
              </span>
              <span className="flex items-center gap-1 text-[#F04438] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F04438]"></span> High
              </span>
              <span className="flex items-center gap-1 text-[#F79009] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F79009]"></span> Medium
              </span>
              <span className="flex items-center gap-1 text-[#12B76A] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#12B76A]"></span> Low
              </span>
            </div>
          </div>

          {/* Right Column: Active Geo-Clusters */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,0.08)] p-4 flex flex-col h-[650px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#155EEF]" />
                <span>Active Geo-Clusters ({rankedReports.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Ranked by Priority</span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2.5 pr-1 mt-3">
              {rankedReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <MapPinOff className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  No incidents match the active map filters.
                </div>
              ) : (
                rankedReports.map(p => {
                  const color = PRIORITY_COLORS[p.priority_level] || '#155EEF';
                  const isSelected = selectedReportId === p.id;
                  const score = p.priority_score ?? (p.ai_analysis?.priority_score || 50);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectReport(p)}
                      className={`p-3 rounded-xl border transition cursor-pointer group ${
                        isSelected
                          ? 'bg-blue-50 border-[#155EEF] shadow-xs'
                          : 'bg-slate-50 hover:bg-blue-50/40 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {displayId(p.id)}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: color }}
                        >
                          {score} Pts
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#155EEF] transition-colors">
                        {p.title}
                      </h4>

                      <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                        <span className="truncate flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          {p.location?.locality || p.location?.city || 'Gurugram'}
                        </span>
                        <Link
                          href={`/reports/${p.id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[#155EEF] font-bold hover:underline shrink-0 flex items-center gap-0.5 ml-2"
                        >
                          <span>Dossier</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
