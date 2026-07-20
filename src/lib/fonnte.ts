export async function sendWhatsAppMessage(target: string, message: string) {
  const token = 'KiA6VWBibCCfdJ1P95YS';
  try {
    const formData = new FormData();
    formData.append('target', target);
    formData.append('message', message);
    formData.append('countryCode', '62');

    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData
    });
    
    const result = await res.json();
    return result;
  } catch (err) {
    console.error('Fonnte API Error:', err);
    return null;
  }
}
