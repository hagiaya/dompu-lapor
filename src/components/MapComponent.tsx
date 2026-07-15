'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { supabase } from '@/lib/supabaseClient';

// Fix leaflet icon paths
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function MapComponent({ center, zoom }: { center: [number, number], zoom: number }) {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function fetchReports() {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          ticket_id,
          complaint,
          status,
          lat,
          lng,
          categories(name)
        `)
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (data) {
        setReports(data);
      }
    }
    fetchReports();
  }, []);

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {reports.map((report) => (
        <Marker key={report.id} position={[report.lat, report.lng]} icon={icon}>
          <Popup>
            <strong>{report.categories?.name || 'Keluhan'}</strong><br/>
            Status: {report.status}<br/>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{report.ticket_id}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
