import os from 'node:os';

const port = process.argv[2] || '8080';

function isPrivateIpv4(ip) {
	return (
		ip.startsWith('192.168.') ||
		ip.startsWith('10.') ||
		/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
	);
}

function isBadAdapter(name) {
	const n = name.toLowerCase();
	return (
		n.includes('virtual') ||
		n.includes('vmware') ||
		n.includes('hyper-v') ||
		n.includes('wsl') ||
		n.includes('docker') ||
		n.includes('loopback') ||
		n.includes('bluetooth') ||
		n.includes('happ-tun') ||
		n.includes('tun')
	);
}

function getLanIp() {
	const nets = os.networkInterfaces();
	const preferred = [];
	const fallback = [];

	for (const [name, entries] of Object.entries(nets)) {
		for (const net of entries || []) {
			const isIpv4 = net.family === 'IPv4' || net.family === 4;
			if (!isIpv4 || net.internal) continue;
			if (!isPrivateIpv4(net.address)) continue;

			const item = { name, address: net.address };

			if (isBadAdapter(name)) {
				fallback.push(item);
				continue;
			}

			if (
				name.toLowerCase().includes('ethernet') ||
				name.toLowerCase().includes('wi-fi') ||
				name.toLowerCase().includes('беспровод')
			) {
				preferred.push(item);
			} else {
				fallback.push(item);
			}
		}
	}

	if (preferred.length > 0) return preferred[0].address;
	if (fallback.length > 0) return fallback[0].address;
	return null;
}

const lanIp = getLanIp();

console.log('');
console.log('Открыть на ПК:');
console.log(`  http://localhost:${port}`);
console.log('');

if (lanIp) {
	console.log('Открыть на телефоне:');
	console.log(`  http://${lanIp}:${port}`);
} else {
	console.log('Не удалось определить LAN IP.');
	console.log('Проверь вручную через ipconfig.');
}

console.log('');