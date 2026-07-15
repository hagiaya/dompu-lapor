'use client';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: 'inherit' }}>Memuat Peta...</div>
});

export default function Map({ center = [-8.5333, 118.4667] as [number, number], zoom = 11, style = { height: '100%', width: '100%' } }: { center?: [number, number], zoom?: number, style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <MapComponent center={center} zoom={zoom} />
    </div>
  );
}
