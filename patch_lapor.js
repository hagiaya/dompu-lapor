const fs = require('fs');
const path = './src/app/lapor/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Copy, Download to imports
content = content.replace(
  "import { MessageSquarePlus, Search, Send, MapPin, User, Phone, CheckCircle, Shield, Clock, TrendingUp } from 'lucide-react';",
  "import { MessageSquarePlus, Search, Send, MapPin, User, Phone, CheckCircle, Shield, Clock, TrendingUp, Copy, Download } from 'lucide-react';"
);

// 2. Hide Edukasi & Statistik when ticketId is present
content = content.replace(
  "{/* Edukasi & Statistik */}",
  "{!ticketId && (\n            <>\n              {/* Edukasi & Statistik */}"
);

// Close the tag before </main>
content = content.replace(
  "          </div>\n\n        </main>",
  "          </div>\n            </>\n          )}\n\n        </main>"
);

// 3. Move the ticketId conditional to wrap the entire glass-panel content
const oldGlassPanelStart = `          <div className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', marginBottom: '3rem' }}>
            {/* Tabs */}`;
            
const newGlassPanelStart = `          <div className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', marginBottom: '3rem' }}>
            {ticketId ? (
              <div style={{ padding: '3rem 2rem', background: '#ffffff', textAlign: 'center' }}>
                <div style={{ padding: '2rem', background: '#dcfce7', color: '#166534', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid #bbf7d0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <CheckCircle size={64} style={{ margin: '0 auto 1rem auto', color: '#15803d' }} />
                  <p style={{ fontWeight: '900', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Berhasil Dikirim!</p>
                  <p style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Kode Tiket Anda:</p>
                  <strong style={{ fontSize: '2.5rem', letterSpacing: '4px', display: 'block', margin: '1rem 0', color: '#166534', userSelect: 'all' }}>{ticketId}</strong>
                  <p style={{ fontSize: '1rem', marginTop: '1.5rem', fontWeight: '500' }}>Simpan kode ini untuk melacak laporan Anda.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(ticketId); alert('Kode tiket berhasil disalin!'); }} style={{ padding: '0.75rem 1.5rem', background: '#fff', border: '2px solid var(--secondary-color)', color: 'var(--secondary-color)', borderRadius: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Copy size={20} /> Salin Tiket
                  </button>
                  <button type="button" onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([\`Tiket Laporan SiMAJU: \${ticketId}\\nSimpan kode ini untuk melacak status laporan Anda.\`], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = \`Tiket_SiMAJU_\${ticketId}.txt\`;
                    element.click();
                  }} style={{ padding: '0.75rem 1.5rem', background: 'var(--secondary-color)', border: '2px solid var(--secondary-color)', color: '#fff', borderRadius: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Download size={20} /> Download Tiket
                  </button>
                </div>

                <button type="button" onClick={() => { setTicketId(''); setActiveTab('buat'); }} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem', borderRadius: '0.75rem', fontWeight: 'bold' }}>
                  Kembali ke Halaman Utama
                </button>
              </div>
            ) : (
              <>
            {/* Tabs */}`;

content = content.replace(oldGlassPanelStart, newGlassPanelStart);

const oldTicketBlock = `              {activeTab === 'buat' ? (
                ticketId ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                    <div style={{ padding: '2rem', background: '#dcfce7', color: '#166534', borderRadius: '1rem', marginBottom: '1.5rem', border: '1px solid #bbf7d0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <CheckCircle size={56} style={{ margin: '0 auto 1rem auto', color: '#15803d' }} />
                      <p style={{ fontWeight: '900', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Berhasil Dikirim!</p>
                      <p style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Kode Tiket Anda:</p>
                      <strong style={{ fontSize: '2rem', letterSpacing: '2px', display: 'block', margin: '0.5rem 0', color: '#166534' }}>{ticketId}</strong>
                      <p style={{ fontSize: '0.95rem', marginTop: '1.5rem', fontWeight: '500' }}>Simpan kode ini untuk melacak laporan Anda.</p>
                    </div>
                    <button onClick={() => setTicketId('')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem', borderRadius: '0.75rem', fontWeight: 'bold' }}>
                      Kirim Laporan Lainnya
                    </button>
                  </div>
                ) : (
                <form onSubmit={handleSubmit}>`;

const newTicketBlock = `              {activeTab === 'buat' ? (
                <form onSubmit={handleSubmit}>`;

content = content.replace(oldTicketBlock, newTicketBlock);

// 4. Close the new fragment for glass-panel
const oldGlassPanelEnd = `              )}
            </div>
          </div>`;
          
const newGlassPanelEnd = `              )}
            </div>
              </>
            )}
          </div>`;
          
content = content.replace(oldGlassPanelEnd, newGlassPanelEnd);

fs.writeFileSync(path, content);
console.log("Patch applied successfully!");
