process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function test() {
    const ip = '34.9.244.181';
    const hostname = 'zoom.red';
    const url = `https://${ip}/baaszoom/public/canguroazul/getZoomTrackWs?tipo_busqueda=1&web=1&codigo=TEST`;
    
    console.log('Testing fetch to IP:', url);
    try {
        const res = await fetch(url, {
            headers: { 
                'Connection': 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Host': hostname
            }
        });
        console.log('Status:', res.status);
    } catch (err) {
        console.error('Fetch failed!');
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
    }
}

test();
