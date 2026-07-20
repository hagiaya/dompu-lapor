import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/fonnte';

export async function POST(request: Request) {
  try {
    const { target, ticketId, complaint } = await request.json();
    
    if (!target || !ticketId) {
      return NextResponse.json({ success: false, error: 'Target and Ticket ID are required' }, { status: 400 });
    }

    const message = `*Laporan Berhasil Dikirim!*\n\nTerima kasih telah melapor ke SiMAJU (Sistem Informasi Masyarakat menuju Dompu Maju).\n\n*Detail Laporan:*\nKeluhan: ${complaint || '-'}\n*Kode Tiket:* ${ticketId}\n\nSimpan kode tiket ini untuk melacak progres laporan Anda di website SiMAJU.\n\n_Lapor Cepat, DOMPU HEBAT!_`;

    const result = await sendWhatsAppMessage(target, message);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Send WA API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
