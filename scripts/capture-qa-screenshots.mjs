import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const DEFAULT_WIDTHS = [1920, 1440, 1024, 768, 390];
const DEFAULT_VIEWPORT_HEIGHT = 1080;
const READY_TIMEOUT_MS = 15000;
const CHROME_START_TIMEOUT_MS = 12000;
const SETTLE_MS = 300;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function printUsage() {
	console.log(`Usage:
node scripts/capture-qa-screenshots.mjs --url http://127.0.0.1:8080/about.html --task about-final [--widths 1920,1440,1024,768,390] [--viewport-height 1080]

Options:
  --url              Local page URL to capture.
  --task             QA artifact folder inside .qa-artifacts/.
  --widths           Comma-separated CSS viewport widths. Default: ${DEFAULT_WIDTHS.join(',')}.
  --viewport-height  CSS viewport height before full-page capture. Default: ${DEFAULT_VIEWPORT_HEIGHT}.
  --chrome-path      Explicit Chrome executable path. CHROME_PATH env is also supported.
`);
}

function parseArgs(argv) {
	const args = {};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--help' || arg === '-h') {
			args.help = true;
			continue;
		}
		if (!arg.startsWith('--')) {
			throw new Error(`Unexpected argument: ${arg}`);
		}

		const key = arg.slice(2);
		const value = argv[index + 1];
		if (!value || value.startsWith('--')) {
			throw new Error(`Missing value for --${key}`);
		}

		args[key] = value;
		index += 1;
	}

	if (args.help || args.h) {
		printUsage();
		process.exit(0);
	}

	return args;
}

function parseUrl(value) {
	if (!value) throw new Error('Missing required --url.');
	let parsed;
	try {
		parsed = new URL(value);
	} catch {
		throw new Error(`Invalid --url: ${value}`);
	}

	if (!['http:', 'https:'].includes(parsed.protocol)) {
		throw new Error('--url must be http or https.');
	}

	return parsed;
}

function parseTaskSlug(value) {
	if (!value) throw new Error('Missing required --task.');
	if (value.includes('\\') || value.includes('/')) {
		throw new Error('--task must be a single folder slug, not a path.');
	}
	if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value)) {
		throw new Error('--task may contain only letters, numbers, dot, underscore and hyphen.');
	}
	if (value === '.' || value === '..' || value.startsWith('.chrome-profile-')) {
		throw new Error('--task is not a safe QA folder name.');
	}
	return value;
}

function parsePositiveInteger(value, label) {
	const number = Number.parseInt(value, 10);
	if (!Number.isFinite(number) || String(number) !== String(value).trim() || number <= 0) {
		throw new Error(`${label} must be a positive integer.`);
	}
	return number;
}

function parseWidths(value) {
	if (!value) return DEFAULT_WIDTHS;

	const widths = value.split(',').map((part) => parsePositiveInteger(part.trim(), 'Each width'));
	if (!widths.length) throw new Error('--widths must include at least one width.');

	for (const width of widths) {
		if (width < 320 || width > 4096) {
			throw new Error(`Unsupported width ${width}. Use a value between 320 and 4096.`);
		}
	}

	return [...new Set(widths)];
}

function getPageSlug(pageUrl) {
	const pathname = decodeURIComponent(pageUrl.pathname);
	const basename = path.posix.basename(pathname === '/' ? 'index.html' : pathname);
	const withoutExtension = basename.replace(/\.[^.]+$/, '') || 'index';
	return withoutExtension
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'page';
}

function ensureInside(parentDir, childPath, label) {
	const relative = path.relative(parentDir, childPath);
	if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
		return;
	}
	throw new Error(`${label} resolves outside ${parentDir}.`);
}

function chromeCandidates() {
	const env = process.env;
	return [
		env.PROGRAMFILES ? path.join(env.PROGRAMFILES, 'Google', 'Chrome', 'Application', 'chrome.exe') : null,
		env['PROGRAMFILES(X86)'] ? path.join(env['PROGRAMFILES(X86)'], 'Google', 'Chrome', 'Application', 'chrome.exe') : null,
		env.LOCALAPPDATA ? path.join(env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe') : null,
		env.PROGRAMFILES ? path.join(env.PROGRAMFILES, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : null,
		env['PROGRAMFILES(X86)'] ? path.join(env['PROGRAMFILES(X86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe') : null,
		env.LOCALAPPDATA ? path.join(env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : null,
	].filter(Boolean);
}

function findChrome(explicitPath) {
	if (explicitPath) {
		if (existsSync(explicitPath)) return explicitPath;
		throw new Error(`Explicit Chrome path was not found: ${explicitPath}`);
	}

	if (process.env.CHROME_PATH) {
		if (existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
		throw new Error(`CHROME_PATH was set but does not exist: ${process.env.CHROME_PATH}`);
	}

	const candidates = [...new Set(chromeCandidates())];
	for (const candidate of candidates) {
		if (existsSync(candidate)) return candidate;
	}

	const tried = candidates.map((candidate) => `  - ${candidate}`).join('\n');
	throw new Error(`Chrome was not found. Set CHROME_PATH or pass --chrome-path.\nChecked:\n${tried}`);
}

async function getFreePort() {
	return new Promise((resolve, reject) => {
		const server = net.createServer();
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			server.close(() => resolve(address.port));
		});
	});
}

async function fetchJson(url, timeoutMs = 2000) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, { signal: controller.signal });
		if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
		return await response.json();
	} finally {
		clearTimeout(timer);
	}
}

async function waitForDevTools(port, chromeProcess) {
	const endpoint = `http://127.0.0.1:${port}`;
	const startedAt = Date.now();

	while (Date.now() - startedAt < CHROME_START_TIMEOUT_MS) {
		if (chromeProcess.exitCode !== null) {
			throw new Error(`Chrome exited before DevTools became available. Exit code: ${chromeProcess.exitCode}`);
		}

		try {
			await fetchJson(`${endpoint}/json/version`);
			return endpoint;
		} catch {
			await delay(150);
		}
	}

	throw new Error('Timed out waiting for Chrome DevTools endpoint.');
}

async function getPageWebSocketUrl(endpoint) {
	const targets = await fetchJson(`${endpoint}/json/list`, 3000);
	const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
	if (!page) throw new Error('Chrome DevTools did not expose a page target.');
	return page.webSocketDebuggerUrl;
}

class CdpClient {
	constructor(webSocketUrl) {
		this.nextId = 1;
		this.pending = new Map();
		this.events = [];
		this.errors = [];
		this.ws = new WebSocket(webSocketUrl);
	}

	async open() {
		await new Promise((resolve, reject) => {
			const cleanup = () => {
				this.ws.removeEventListener('open', onOpen);
				this.ws.removeEventListener('error', onError);
			};
			const onOpen = () => {
				cleanup();
				resolve();
			};
			const onError = () => {
				cleanup();
				reject(new Error('Failed to connect to Chrome DevTools WebSocket.'));
			};
			this.ws.addEventListener('open', onOpen, { once: true });
			this.ws.addEventListener('error', onError, { once: true });
		});

		this.ws.addEventListener('message', (event) => this.handleMessage(event));
	}

	handleMessage(event) {
		const payload = typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString('utf8');
		const message = JSON.parse(payload);

		if (message.id) {
			const pending = this.pending.get(message.id);
			if (!pending) return;
			this.pending.delete(message.id);
			if (message.error) {
				pending.reject(new Error(`${message.error.message || 'CDP error'}${message.error.data ? `: ${message.error.data}` : ''}`));
			} else {
				pending.resolve(message.result || {});
			}
			return;
		}

		this.events.push(message);
		if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
			this.errors.push({
				source: 'console.error',
				text: (message.params.args || []).map((arg) => arg.value ?? arg.description ?? arg.type).join(' '),
			});
		}
		if (message.method === 'Runtime.exceptionThrown') {
			this.errors.push({
				source: 'exception',
				text: message.params?.exceptionDetails?.text || 'Runtime exception',
			});
		}
		if (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error') {
			this.errors.push({
				source: 'log',
				text: message.params.entry.text,
				url: message.params.entry.url,
			});
		}
	}

	send(method, params = {}) {
		const id = this.nextId;
		this.nextId += 1;

		const promise = new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
		});

		this.ws.send(JSON.stringify({ id, method, params }));
		return promise;
	}

	close() {
		if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
			this.ws.close();
		}
	}
}

async function evaluate(cdp, expression, timeoutMs = READY_TIMEOUT_MS) {
	const result = await cdp.send('Runtime.evaluate', {
		expression,
		awaitPromise: true,
		returnByValue: true,
	}, { timeoutMs });

	if (result.exceptionDetails) {
		throw new Error(result.exceptionDetails.text || 'Runtime.evaluate failed.');
	}

	return result.result?.value;
}

async function waitForPageReady(cdp) {
	const result = await evaluate(cdp, `new Promise((resolve) => {
		const timeout = setTimeout(() => resolve({ timedOut: true }), ${READY_TIMEOUT_MS});
		const done = (value) => {
			clearTimeout(timeout);
			resolve(value);
		};
		(async () => {
			if (document.readyState !== 'complete') {
				await new Promise((readyResolve) => window.addEventListener('load', readyResolve, { once: true }));
			}
			if (document.fonts && document.fonts.ready) {
				await document.fonts.ready;
			}
			Array.from(document.images).forEach((image) => {
				image.loading = 'eager';
				image.fetchPriority = 'high';
			});
			const scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body ? document.body.scrollHeight : 0,
				window.innerHeight
			);
			for (let y = 0; y <= scrollHeight; y += Math.max(240, Math.floor(window.innerHeight * 0.85))) {
				window.scrollTo(0, y);
				await new Promise((scrollResolve) => setTimeout(scrollResolve, 120));
			}
			window.scrollTo(0, 0);
			await new Promise((scrollResolve) => setTimeout(scrollResolve, 120));
			const images = Array.from(document.images);
			await Promise.all(images.map((image) => new Promise((imageResolve) => {
				if (image.complete) {
					imageResolve();
					return;
				}
				const imageTimer = setTimeout(imageResolve, 5000);
				const finish = () => {
					clearTimeout(imageTimer);
					imageResolve();
				};
				image.addEventListener('load', finish, { once: true });
				image.addEventListener('error', finish, { once: true });
			})));
			await Promise.all(images.map(async (image) => {
				if (image.decode && image.complete && image.naturalWidth > 0) {
					try {
						await image.decode();
					} catch {}
				}
			}));
			const failedImages = images
				.filter((image) => (image.currentSrc || image.src) && (!image.complete || image.naturalWidth === 0))
				.map((image) => image.currentSrc || image.src);
			done({
				timedOut: false,
				readyState: document.readyState,
				imageCount: images.length,
				failedImages,
			});
		})().catch((error) => done({ timedOut: false, error: String(error && error.message ? error.message : error) }));
	})`);

	if (result?.timedOut) throw new Error('Timed out waiting for document, fonts and images.');
	if (result?.error) throw new Error(`Page readiness failed: ${result.error}`);
	if (result?.failedImages?.length) {
		throw new Error(`Some images failed to load:\n${result.failedImages.map((item) => `  - ${item}`).join('\n')}`);
	}
	return result;
}

async function prepareUi(cdp) {
	await evaluate(cdp, `(() => {
		try {
			localStorage.setItem('maratCookieConsent', JSON.stringify({
				version: 1,
				necessary: true,
				analytics: false,
				updatedAt: new Date().toISOString()
			}));
			['cookieConsent', 'cookieConsentTs', 'cookieConsentMode', 'cookieAnalyticsAllowed', 'cookieConsentUpdatedAt']
				.forEach((key) => localStorage.removeItem(key));
		} catch {}

		const cookieAccept = document.querySelector('.cookie-consent__accept');
		if (cookieAccept && cookieAccept.offsetParent !== null) cookieAccept.click();

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

		const activeModalClose = document.querySelector('.modal.active .modal--close');
		if (activeModalClose) activeModalClose.click();

		const searchClose = document.querySelector('.header-search-form__close');
		const searchPanel = document.querySelector('#header-search-panel.is-open');
		if (searchPanel && searchClose) searchClose.click();

		const burger = document.querySelector('.burger[aria-expanded="true"]');
		if (burger) burger.click();

		if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
		window.scrollTo(0, 0);

		return {
			cookieVisible: Boolean(document.querySelector('.cookie-consent.active')),
			modalOpen: Boolean(document.querySelector('.modal.active')),
			searchOpen: Boolean(document.querySelector('#header-search-panel.is-open')),
			menuOpen: Boolean(document.querySelector('.burger[aria-expanded="true"]')),
		};
	})()`);
	await delay(SETTLE_MS);
}

function validatePng(buffer, requestedWidth, viewportHeight, allowShortPage = true) {
	if (buffer.length <= 0) throw new Error('PNG file is empty.');
	if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('PNG signature is invalid.');
	if (buffer.subarray(12, 16).toString('ascii') !== 'IHDR') throw new Error('PNG IHDR chunk is missing.');

	const pngWidth = buffer.readUInt32BE(16);
	const pngHeight = buffer.readUInt32BE(20);
	if (pngWidth !== requestedWidth) {
		throw new Error(`PNG width ${pngWidth} does not match requested width ${requestedWidth}.`);
	}
	if (pngHeight <= 0) throw new Error('PNG height is invalid.');
	if (!allowShortPage && pngHeight <= viewportHeight) {
		throw new Error(`PNG height ${pngHeight} is not greater than viewport height ${viewportHeight}.`);
	}

	return { pngWidth, pngHeight };
}

async function captureWidth(cdp, pageUrl, pageSlug, taskDir, width, viewportHeight) {
	await cdp.send('Emulation.setDeviceMetricsOverride', {
		width,
		height: viewportHeight,
		deviceScaleFactor: 1,
		mobile: width <= 480,
		screenWidth: width,
		screenHeight: viewportHeight,
	});
	await cdp.send('Page.navigate', { url: pageUrl.href });
	await waitForPageReady(cdp);
	await prepareUi(cdp);

	const dimensions = await evaluate(cdp, `(() => {
		const doc = document.documentElement;
		const body = document.body;
		const width = window.innerWidth;
		const height = Math.max(
			doc.scrollHeight,
			doc.offsetHeight,
			body ? body.scrollHeight : 0,
			body ? body.offsetHeight : 0,
			window.innerHeight
		);
		return {
			innerWidth: window.innerWidth,
			innerHeight: window.innerHeight,
			scrollWidth: doc.scrollWidth,
			clientWidth: doc.clientWidth,
			height
		};
	})()`);

	if (dimensions.innerWidth !== width) {
		throw new Error(`Viewport width ${dimensions.innerWidth} does not match requested width ${width}.`);
	}
	if (dimensions.scrollWidth > dimensions.clientWidth + 1) {
		throw new Error(`Horizontal overflow detected at ${width}px: scrollWidth ${dimensions.scrollWidth}, clientWidth ${dimensions.clientWidth}.`);
	}

	const captureHeight = Math.ceil(dimensions.height);
	const screenshot = await cdp.send('Page.captureScreenshot', {
		format: 'png',
		fromSurface: true,
		captureBeyondViewport: true,
		clip: {
			x: 0,
			y: 0,
			width,
			height: captureHeight,
			scale: 1,
		},
	});
	const buffer = Buffer.from(screenshot.data, 'base64');
	const fileName = `${pageSlug}-${width}.png`;
	const filePath = path.join(taskDir, fileName);
	await writeFile(filePath, buffer);

	const written = await readFile(filePath);
	const { pngWidth, pngHeight } = validatePng(written, width, viewportHeight);
	const fileStat = await stat(filePath);

	return {
		width,
		file: fileName,
		path: filePath,
		pngWidth,
		pngHeight,
		bytes: fileStat.size,
	};
}

async function waitForProcessExit(childProcess, timeoutMs) {
	if (!childProcess || childProcess.exitCode !== null) return true;

	return new Promise((resolve) => {
		const timer = setTimeout(() => resolve(false), timeoutMs);
		childProcess.once('exit', () => {
			clearTimeout(timer);
			resolve(true);
		});
	});
}

async function killProcessTree(childProcess) {
	if (!childProcess || childProcess.exitCode !== null) return;

	if (process.platform === 'win32' && childProcess.pid) {
		await new Promise((resolve) => {
			const killer = spawn('taskkill', ['/PID', String(childProcess.pid), '/T', '/F'], {
				stdio: 'ignore',
				windowsHide: true,
			});
			killer.once('exit', resolve);
			killer.once('error', resolve);
		});
		return;
	}

	childProcess.kill();
}

async function removeProfileDir(profileDir, qaRoot) {
	if (!profileDir) return;
	ensureInside(qaRoot, profileDir, 'Chrome profile path');
	if (!path.basename(profileDir).startsWith('.chrome-profile-')) {
		throw new Error(`Refusing to remove unexpected profile folder: ${profileDir}`);
	}

	let lastError;
	for (let attempt = 0; attempt < 8; attempt += 1) {
		try {
			await rm(profileDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 150 });
			return;
		} catch (error) {
			lastError = error;
			await delay(250);
		}
	}

	throw lastError;
}

async function cleanupChrome(chromeProcess, profileDir, qaRoot) {
	if (chromeProcess && chromeProcess.exitCode === null) {
		const exitedGracefully = await waitForProcessExit(chromeProcess, 2500);
		if (!exitedGracefully) {
			await killProcessTree(chromeProcess);
			await waitForProcessExit(chromeProcess, 5000);
		}
	}

	await removeProfileDir(profileDir, qaRoot);
}

async function main() {
	if (typeof globalThis.WebSocket !== 'function') {
		throw new Error('This Node runtime does not provide globalThis.WebSocket. Use the bundled/local Node 24 runtime.');
	}

	const args = parseArgs(process.argv.slice(2));
	const pageUrl = parseUrl(args.url);
	const taskSlug = parseTaskSlug(args.task);
	const widths = parseWidths(args.widths);
	const viewportHeight = parsePositiveInteger(args['viewport-height'] || String(DEFAULT_VIEWPORT_HEIGHT), '--viewport-height');
	const chromePath = findChrome(args['chrome-path']);

	const projectRoot = process.cwd();
	const qaRoot = path.resolve(projectRoot, '.qa-artifacts');
	const taskDir = path.resolve(qaRoot, taskSlug);
	ensureInside(qaRoot, taskDir, 'Task directory');
	await mkdir(taskDir, { recursive: true });

	const profileDir = path.resolve(qaRoot, `.chrome-profile-${process.pid}-${Date.now().toString(36)}`);
	ensureInside(qaRoot, profileDir, 'Chrome profile path');
	await mkdir(profileDir, { recursive: true });

	const port = await getFreePort();
	const chromeArgs = [
		'--headless=new',
		'--remote-debugging-address=127.0.0.1',
		`--remote-debugging-port=${port}`,
		`--user-data-dir=${profileDir}`,
		'--no-first-run',
		'--no-default-browser-check',
		'--disable-background-networking',
		'--disable-sync',
		'--disable-extensions',
		'--disable-popup-blocking',
		`--window-size=${Math.max(...widths)},${viewportHeight}`,
		'about:blank',
	];

	const chromeProcess = spawn(chromePath, chromeArgs, {
		stdio: ['ignore', 'ignore', 'pipe'],
		windowsHide: true,
	});
	let chromeStderr = '';
	chromeProcess.stderr?.on('data', (chunk) => {
		chromeStderr += chunk.toString();
	});

	let cdp;
	const pageSlug = getPageSlug(pageUrl);
	const startedAt = new Date().toISOString();

	try {
		const endpoint = await waitForDevTools(port, chromeProcess);
		const webSocketUrl = await getPageWebSocketUrl(endpoint);
		cdp = new CdpClient(webSocketUrl);
		await cdp.open();
		await cdp.send('Page.enable');
		await cdp.send('Runtime.enable');
		await cdp.send('Log.enable');
		await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
			source: `try {
				localStorage.setItem('maratCookieConsent', JSON.stringify({
					version: 1,
					necessary: true,
					analytics: false,
					updatedAt: new Date().toISOString()
				}));
				['cookieConsent', 'cookieConsentTs', 'cookieConsentMode', 'cookieAnalyticsAllowed', 'cookieConsentUpdatedAt']
					.forEach((key) => localStorage.removeItem(key));
			} catch {}`,
		});

		const screenshots = [];
		for (const width of widths) {
			const result = await captureWidth(cdp, pageUrl, pageSlug, taskDir, width, viewportHeight);
			screenshots.push(result);
		}

		const manifest = {
			url: pageUrl.href,
			task: taskSlug,
			createdAt: startedAt,
			chrome: {
				executable: chromePath,
				isolatedProfile: 'removed after capture',
			},
			viewportHeight,
			screenshots: screenshots.map(({ width, file, pngWidth, pngHeight, bytes }) => ({
				width,
				file,
				pngWidth,
				pngHeight,
				bytes,
			})),
			pageErrors: cdp.errors,
		};

		const manifestPath = path.join(taskDir, 'manifest.json');
		await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

		console.log(`Chrome: ${chromePath}`);
		console.log(`Task: ${taskSlug}`);
		console.log(`URL: ${pageUrl.href}`);
		console.log('');
		console.log('width  png dimensions  bytes    path');
		for (const item of screenshots) {
			console.log(`${String(item.width).padEnd(6)} ${`${item.pngWidth}x${item.pngHeight}`.padEnd(15)} ${String(item.bytes).padEnd(8)} ${item.path}`);
		}
		console.log(`${''.padEnd(6)} ${''.padEnd(15)} ${''.padEnd(8)} ${manifestPath}`);

		if (cdp.errors.length) {
			console.log('');
			console.log(`Page errors captured: ${cdp.errors.length}`);
			for (const error of cdp.errors) {
				console.log(`- [${error.source}] ${error.text}`);
			}
		}
	} finally {
		try {
			if (cdp) {
				await cdp.send('Browser.close').catch(() => {});
				cdp.close();
			}
		} finally {
			await cleanupChrome(chromeProcess, profileDir, qaRoot);
		}
	}

	if (chromeStderr && process.env.QA_SCREENSHOTS_DEBUG === '1') {
		console.error(chromeStderr.trim());
	}
}

main().catch((error) => {
	console.error(`qa:screenshots error: ${error.message}`);
	process.exitCode = 1;
});
