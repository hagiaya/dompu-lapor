'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon paths
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function MapComponent({ center, zoom }: { center: [number, number], zoom: number }) {
  // Contoh titik-titik laporan di Kab. Dompu
  const mockReports = [
    { id: 1, pos: [-8.5333, 118.4667], type: 'Jalan Rusak', status: 'Pending' },
    { id: 2, pos: [-8.5533, 118.4267], type: 'Irigasi Tersumbat', status: 'Dikerjakan' },
    { id: 3, pos: [-8.5133, 118.4967], type: 'Lampu Jalan Mati', status: 'Selesai' }
  ];

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {mockReports.map((report) => (
        <Marker key={report.id} position={report.pos as [number, number]} icon={icon}>
          <Popup>
            <strong>{report.type}</strong><br/>
            Status: {report.status}
          </Popup>
        </Marker>
      ))}

      {/* Contoh Heatmap area */}
      <Circle center={[-8.5333, 118.4667]} pathOptions={{ fillColor: 'red', color: 'red' }} radius={2000} />
      <Circle center={[-8.5533, 118.4267]} pathOptions={{ fillColor: 'orange', color: 'orange' }} radius={1000} />
    </MapContainer>
  );
}
