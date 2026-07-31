import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(rootDir, 'dist')
const errors = []

const counters = {
	htmlFiles: 0,
	htmlReferences: 0,
	cssUrls: 0,
	images: 0,
	fonts: 0
}

const requiredFiles = [
	'dist/index.html',
	'dist/404.html',
	'dist/css/main.min.css',
	'dist/js/scripts.min.js',
	'dist/img/brand/marat-abzalov-mark-tiny-1.png'
]

const imageExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico'])
const fontExts = new Set(['.woff', '.woff2', '.ttf', '.otf', '.eot'])
const checkedBinaryExts = new Set([...imageExts, ...fontExts])

function toProjectPath(filePath) {
	return path.relative(rootDir, filePath).replace(/\\/g, '/')
}

function readBinary(filePath) {
	return readFileSync(filePath)
}

function sha256(buffer) {
	return createHash('sha256').update(buffer).digest('hex')
}

function addError(message) {
	errors.push(message)
}

function verifySourceCopy(filePath) {
	const rel = path.relative(distDir, filePath)
	const normalizedRel = rel.replace(/\\/g, '/')

	if (!normalizedRel.startsWith('img/') && !normalizedRel.startsWith('fonts/')) {
		return
	}

	const sourcePath = path.join(rootDir, 'app', rel)

	if (!existsSync(sourcePath)) {
		addError(`${toProjectPath(filePath)}: missing source counterpart ${toProjectPath(sourcePath)}`)
		return
	}

	const distBuffer = readBinary(filePath)
	const sourceBuffer = readBinary(sourcePath)

	if (sha256(distBuffer) !== sha256(sourceBuffer)) {
		addError(`${toProjectPath(filePath)}: differs from ${toProjectPath(sourcePath)}`)
	}
}

function walk(dir) {
	if (!existsSync(dir)) {
		return []
	}

	const entries = readdirSync(dir)
	const files = []

	for (const entry of entries) {
		const fullPath = path.join(dir, entry)
		const stats = statSync(fullPath)

		if (stats.isDirectory()) {
			files.push(...walk(fullPath))
		} else if (stats.isFile()) {
			files.push(fullPath)
		}
	}

	return files
}

function pngInfo(buffer) {
	const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

	if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature) || buffer.toString('ascii', 12, 16) !== 'IHDR') {
		return null
	}

	return {
		format: 'PNG',
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20)
	}
}

function jpegInfo(buffer) {
	if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
		return null
	}

	let offset = 2

	while (offset < buffer.length) {
		if (buffer[offset] !== 0xff) {
			return { format: 'JPEG', width: null, height: null }
		}

		while (buffer[offset] === 0xff) {
			offset += 1
		}

		const marker = buffer[offset]
		offset += 1

		if (marker === 0xd9 || marker === 0xda) {
			break
		}

		if (offset + 2 > buffer.length) {
			return { format: 'JPEG', width: null, height: null }
		}

		const length = buffer.readUInt16BE(offset)

		if (length < 2 || offset + length > buffer.length) {
			return { format: 'JPEG', width: null, height: null }
		}

		const isSofMarker =
			(marker >= 0xc0 && marker <= 0xc3) ||
			(marker >= 0xc5 && marker <= 0xc7) ||
			(marker >= 0xc9 && marker <= 0xcb) ||
			(marker >= 0xcd && marker <= 0xcf)

		if (isSofMarker) {
			return {
				format: 'JPEG',
				width: buffer.readUInt16BE(offset + 7),
				height: buffer.readUInt16BE(offset + 5)
			}
		}

		offset += length
	}

	return { format: 'JPEG', width: null, height: null }
}

function webpInfo(buffer) {
	if (buffer.length < 16 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
		return null
	}

	const chunk = buffer.toString('ascii', 12, 16)

	if (chunk === 'VP8X' && buffer.length >= 30) {
		return {
			format: 'WEBP',
			width: 1 + buffer.readUIntLE(24, 3),
			height: 1 + buffer.readUIntLE(27, 3)
		}
	}

	if (chunk === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
		const bits = buffer.readUInt32LE(21)

		return {
			format: 'WEBP',
			width: (bits & 0x3fff) + 1,
			height: ((bits >> 14) & 0x3fff) + 1
		}
	}

	if (chunk === 'VP8 ' && buffer.length >= 30 && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
		return {
			format: 'WEBP',
			width: buffer.readUInt16LE(26) & 0x3fff,
			height: buffer.readUInt16LE(28) & 0x3fff
		}
	}

	return { format: 'WEBP', width: null, height: null }
}

function gifInfo(buffer) {
	const signature = buffer.toString('ascii', 0, 6)

	if (signature !== 'GIF87a' && signature !== 'GIF89a') {
		return null
	}

	return {
		format: 'GIF',
		width: buffer.readUInt16LE(6),
		height: buffer.readUInt16LE(8)
	}
}

function icoInfo(buffer) {
	if (buffer.length < 6) {
		return null
	}

	const reserved = buffer.readUInt16LE(0)
	const type = buffer.readUInt16LE(2)
	const count = buffer.readUInt16LE(4)

	if (reserved !== 0 || ![1, 2].includes(type) || count < 1) {
		return null
	}

	return { format: 'ICO', width: null, height: null }
}

function fontInfo(buffer) {
	const signature = buffer.toString('ascii', 0, 4)

	if (signature === 'wOFF') {
		return { format: 'WOFF' }
	}

	if (signature === 'wOF2') {
		return { format: 'WOFF2' }
	}

	if (signature === 'OTTO') {
		return { format: 'OTF' }
	}

	if (buffer[0] === 0x00 && buffer[1] === 0x01 && buffer[2] === 0x00 && buffer[3] === 0x00) {
		return { format: 'TTF' }
	}

	if (signature === 'true') {
		return { format: 'TTF' }
	}

	if (buffer.length >= 512 && buffer.readUInt32LE(0) === buffer.length) {
		return { format: 'EOT' }
	}

	return null
}

function validateBinary(filePath) {
	const ext = path.extname(filePath).toLowerCase()
	const buffer = readBinary(filePath)
	const projectPath = toProjectPath(filePath)
	let info = null

	verifySourceCopy(filePath)

	if (ext === '.eot') {
		counters.fonts += 1
		return
	}

	if (imageExts.has(ext)) {
		info = pngInfo(buffer) || jpegInfo(buffer) || webpInfo(buffer) || gifInfo(buffer) || icoInfo(buffer)
		counters.images += 1
	} else if (fontExts.has(ext)) {
		info = fontInfo(buffer)
		counters.fonts += 1
	}

	if (!info) {
		addError(`${projectPath}: unknown or corrupted binary signature, sha256=${sha256(buffer)}`)
		return
	}

	if (imageExts.has(ext) && ext !== '.ico' && (!Number.isFinite(info.width) || !Number.isFinite(info.height) || info.width < 1 || info.height < 1)) {
		addError(`${projectPath}: ${info.format} dimensions are not readable`)
	}
}

function isExternalUrl(url) {
	return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)
}

function normalizeUrl(rawValue) {
	const unquoted = rawValue.trim().replace(/^['"]|['"]$/g, '')

	if (!unquoted || unquoted.startsWith('#') || isExternalUrl(unquoted)) {
		return null
	}

	const clean = unquoted.split('#')[0].split('?')[0]

	if (!clean) {
		return null
	}

	try {
		return decodeURI(clean)
	} catch {
		return clean
	}
}

function resolveLocalReference(baseFile, rawUrl) {
	const url = normalizeUrl(rawUrl)

	if (!url) {
		return null
	}

	if (url.startsWith('/')) {
		return path.join(distDir, url.slice(1))
	}

	return path.resolve(path.dirname(baseFile), url)
}

function assertLocalReference(baseFile, rawUrl, sourceLabel) {
	const target = resolveLocalReference(baseFile, rawUrl)

	if (!target) {
		return
	}

	const relativeTarget = path.relative(distDir, target)

	if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) {
		addError(`${sourceLabel}: reference escapes dist: ${rawUrl}`)
		return
	}

	if (!existsSync(target)) {
		addError(`${sourceLabel}: missing local asset ${rawUrl} -> ${toProjectPath(target)}`)
	}
}

function verifyCssUrls(cssFile) {
	const css = readFileSync(cssFile, 'utf8')
	const urlPattern = /url\(([^)]+)\)/g
	let match

	while ((match = urlPattern.exec(css)) !== null) {
		counters.cssUrls += 1
		assertLocalReference(cssFile, match[1], `${toProjectPath(cssFile)} url(...)`)
	}
}

function parseSrcset(value) {
	return value
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => entry.split(/\s+/)[0])
}

function verifyHtmlReferences(htmlFile) {
	const html = readFileSync(htmlFile, 'utf8')
	const attrPattern = /\s(src|srcset)=["']([^"']+)["']/gi
	const linkPattern = /<link\b[^>]*>/gi
	let match

	counters.htmlFiles += 1

	while ((match = attrPattern.exec(html)) !== null) {
		const [, attr, value] = match
		const urls = attr.toLowerCase() === 'srcset' ? parseSrcset(value) : [value]

		for (const url of urls) {
			counters.htmlReferences += 1
			assertLocalReference(htmlFile, url, `${toProjectPath(htmlFile)} ${attr}`)
		}
	}

	while ((match = linkPattern.exec(html)) !== null) {
		const tag = match[0]
		const relMatch = tag.match(/\srel=["']([^"']+)["']/i)
		const hrefMatch = tag.match(/\shref=["']([^"']+)["']/i)

		if (!hrefMatch || !relMatch) {
			continue
		}

		if (!/\b(stylesheet|icon|preload|modulepreload)\b/i.test(relMatch[1])) {
			continue
		}

		counters.htmlReferences += 1
		assertLocalReference(htmlFile, hrefMatch[1], `${toProjectPath(htmlFile)} link href`)
	}
}

for (const requiredFile of requiredFiles) {
	const filePath = path.join(rootDir, requiredFile)

	if (!existsSync(filePath)) {
		addError(`${requiredFile}: required file is missing`)
	}
}

for (const filePath of walk(distDir)) {
	const ext = path.extname(filePath).toLowerCase()

	if (checkedBinaryExts.has(ext)) {
		validateBinary(filePath)
	}
}

const mainCss = path.join(distDir, 'css', 'main.min.css')

if (existsSync(mainCss)) {
	verifyCssUrls(mainCss)
}

for (const htmlFile of walk(distDir).filter((filePath) => path.extname(filePath).toLowerCase() === '.html')) {
	verifyHtmlReferences(htmlFile)
}

if (errors.length > 0) {
	console.error('verify-dist-assets failed:')
	for (const error of errors) {
		console.error(`- ${error}`)
	}
	process.exit(1)
}

console.log(
	[
		'verify-dist-assets passed:',
		`${counters.htmlFiles} HTML files`,
		`${counters.cssUrls} CSS URLs`,
		`${counters.htmlReferences} HTML asset references`,
		`${counters.images} images`,
		`${counters.fonts} fonts`,
		'0 errors'
	].join(' ')
)
