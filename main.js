const { w3cwebsocket: WebSocket } = require('websocket');

const wsUrl = 'wss://1xlite-394299.top/games-frame/sockets/crash?appGuid=00000000-0000-0000-0000-000000000000&whence=55&fcountry=66&ref=1&gr=285&lng=en'; // Change this to the WebSocket server URL you want to monitor

const headers = {
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'Upgrade',
    'Cookie': 'auid=sv0dNmYPbOmmPmpNAxd9Ag==; lng=en; SESSION=cb9c7b7a9f0891f63e27efb9c9ae0817; che_g=db74974b-71dc-a484-1f46-203227cb398d; application_locale=en; tzo=3; sh.session.id=976d7480-942f-45c6-8e43-ee39ddec3f80; cookies_agree_type=3; is12h=0; is_rtl=1; fast_coupon=true; v3fr=1; che_i=2; ggru=195; platform_type=desktop; window_width=1920',
    'Host': '1xlite-394299.top',
    'Origin': 'https://1xlite-394299.top',
    'Pragma': 'no-cache',
    'Sec-Gpc': '1',
    'Sec-Websocket-Extensions': 'permessage-deflate; client_max_window_bits',
    'Sec-Websocket-Key': 'fBBP31U6z+3zLTwpnL/jwA==',
    'Sec-Websocket-Version': '13',
    'Upgrade': 'websocket',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  };
  
  const ws = new WebSocket(wsUrl, null, null, headers);

ws.onerror = function (error) {
    console.error('WebSocket error:', error);
};

ws.onopen = function () {
    console.log('WebSocket connection established');
};

ws.onclose = function () {
    console.log('WebSocket connection closed');
};

ws.onmessage = function (e) {
    console.log('Received message:', e.data);
};

console.log('Listening to WebSocket logs...');
