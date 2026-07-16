'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { supabase } from '@/lib/supabaseClient';

const getIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = getIcon('red');
const blueIcon = getIcon('blue');
const greenIcon = getIcon('green');

export default function MapComponent({ center, zoom, filterStatus = 'ALL' }: { center: [number, number], zoom: number, filterStatus?: string }) {
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
      
      {reports.filter(r => {
        if (filterStatus === 'ALL') return true;
        if (filterStatus === 'RED' && (r.status === 'PENDING' || r.status === 'ACCEPTED' || r.status === 'REJECTED')) return true;
        if (filterStatus === 'BLUE' && r.status === 'IN_PROGRESS') return true;
        if (filterStatus === 'GREEN' && r.status === 'COMPLETED') return true;
        return false;
      }).map((report) => {
        let markerIcon = redIcon;
        if (report.status === 'IN_PROGRESS') markerIcon = blueIcon;
        else if (report.status === 'COMPLETED') markerIcon = greenIcon;

        return (
          <Marker key={report.id} position={[report.lat, report.lng]} icon={markerIcon}>
            <Popup>
              <strong>{report.categories?.name || 'Keluhan'}</strong><br/>
              Status: {report.status}<br/>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{report.ticket_id}</span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
