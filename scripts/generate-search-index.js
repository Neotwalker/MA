import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const appDir = path.join(rootDir, 'app')
const outputPath = path.join(appDir, 'search-index.json')
const contentLimit = 4200

const excludedFiles = new Set([
	'404.html',
	'search.html',
	'sitemap.html'
])

const structuralPatterns = [
	/<script\b[\s\S]*?<\/script>/gi,
	/<style\b[\s\S]*?<\/style>/gi,
	/<svg\b[\s\S]*?<\/svg>/gi,
	/<canvas\b[\s\S]*?<\/canvas>/gi,
	/<form\b[\s\S]*?<\/form>/gi,
	/<nav\b[\s\S]*?<\/nav>/gi,
	/<aside\b[\s\S]*?<\/aside>/gi,
	/<div\b[^>]*class=["'][^"']*(?:modal|cookie-|mobile-navigation|breadcrumbs|header-search-panel)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi
]

const entityMap = new Map([
	['amp', '&'],
	['lt', '<'],
	['gt', '>'],
	['quot', '"'],
	['apos', "'"],
	['nbsp', ' '],
	['laquo', '«'],
	['raquo', '»'],
	['mdash', '—'],
	['ndash', '–'],
	['hellip', '…'],
	['copy', '©']
])

function decodeHtml(value = '') {
	return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
		if (entity[0] === '#') {
			const isHex = entity[1]?.toLowerCase() === 'x'
			const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10)
			return Number.isFinite(code) ? String.fromCodePoint(code) : match
		}

		return entityMap.get(entity.toLowerCase()) || match
	})
}

function normalizeText(value = '') {
	return decodeHtml(value)
		.replace(/\s+/g, ' ')
		.replace(/\s+([,.!?;:])/g, '$1')
		.trim()
}

function normalizeForKeyword(value = '') {
	return normalizeText(value)
		.toLowerCase()
		.replace(/ё/g, 'е')
		.replace(/[–—-]/g, ' ')
		.replace(/[^a-zа-я0-9\s]+/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function stripTags(html = '') {
	return html.replace(/<[^>]+>/g, ' ')
}

function extractMain(html = '') {
	const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)
	return mainMatch ? mainMatch[1] : html
}

function extractTagText(html, tagName) {
	const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'))
	return match ? normalizeText(stripTags(match[1])) : ''
}

function extractMeta(html, selectorName, selectorValue) {
	const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${selectorName}=["']${selectorValue}["'])[^>]*\\bcontent=["']([^"']*)["'][^>]*>`, 'i')
	const reversePattern = new RegExp(`<meta\\b(?=[^>]*\\bcontent=["']([^"']*)["'])(?=[^>]*\\b${selectorName}=["']${selectorValue}["'])[^>]*>`, 'i')
	const match = html.match(pattern) || html.match(reversePattern)
	return match ? normalizeText(match[1]) : ''
}

function cleanTitle(title = '') {
	return normalizeText(
		title
			.replace(/\s+[—|-]\s+Limitless Creators\s*$/i, '')
			.replace(/\s+[—|-]\s+Марат Абзалов\s*$/i, '')
	)
}

function removeStructuralHtml(html = '') {
	let cleaned = html
	for (const pattern of structuralPatterns) {
		cleaned = cleaned.replace(pattern, ' ')
	}
	cleaned = cleaned.replace(/<[^>]+\baria-hidden=["']true["'][^>]*>[\s\S]*?<\/[^>]+>/gi, ' ')
	return cleaned
}

function extractFirstParagraph(html = '') {
	const paragraphs = Array.from(html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
	for (const paragraph of paragraphs) {
		const text = normalizeText(stripTags(paragraph[1]))
		if (text.length > 45) {
			return text
		}
	}
	return ''
}

function normalizeImagePath(rawUrl = '') {
	const cleanUrl = decodeHtml(rawUrl).split('#')[0].split('?')[0].trim()
	let localPath = cleanUrl
		.replace(/^https?:\/\/(?:www\.)?limitlesscreators\.ru\//i, '')
		.replace(/^\/+/, '')
		.replace(/^app\//, '')

	if (!localPath.startsWith('img/')) {
		return ''
	}

	if (!existsSync(path.join(appDir, localPath))) {
		return ''
	}

	return localPath.replace(/\\/g, '/')
}

function extractImage(html = '', mainHtml = '') {
	const ogImage = extractMeta(html, 'property', 'og:image')
	const normalizedOgImage = normalizeImagePath(ogImage)
	if (normalizedOgImage && !/brand\/marat-abzalov-mark|favicon/i.test(normalizedOgImage)) {
		return normalizedOgImage
	}

	const imageMatches = Array.from(mainHtml.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi))
	for (const match of imageMatches) {
		const imagePath = normalizeImagePath(match[1])
		if (!imagePath || /brand\/marat-abzalov-mark|favicon|logo/i.test(imagePath)) {
			continue
		}
		return imagePath
	}

	return ''
}

function getDocumentType(fileName) {
	if (fileName === 'single-case.html') {
		return 'Проект'
	}

	if (fileName === 'single-articles.html') {
		return 'Статья'
	}

	if (fileName.startsWith('services')) {
		return 'Услуга'
	}

	return 'Страница'
}

function getDocumentWeight(fileName, type) {
	if (fileName === 'index.html') return 100
	if (fileName === 'services-taxonomy-dev.html') return 96
	if (fileName === 'services-taxonomy-seo.html') return 92
	if (fileName.startsWith('services-industry-')) return 88
	if (fileName === 'services-single.html') return 86
	if (type === 'Услуга') return 84
	if (type === 'Проект') return 78
	if (type === 'Статья') return 72
	return 60
}

function makeKeywords({ title, description, content, type, fileName }) {
	const source = `${title} ${description} ${type} ${fileName.replace(/[-.]/g, ' ')} ${content.slice(0, 800)}`
	const stopWords = new Set(['для', 'или', 'как', 'что', 'это', 'над', 'при', 'без', 'под', 'сайт', 'сайта', 'сайты'])
	const words = normalizeForKeyword(source)
		.split(' ')
		.filter((word) => word.length > 2 && !stopWords.has(word))

	return Array.from(new Set(words)).slice(0, 24)
}

function createDocument(fileName) {
	const filePath = path.join(appDir, fileName)
	const html = readFileSync(filePath, 'utf8')
	const mainHtml = extractMain(html)
	const cleanedMain = removeStructuralHtml(mainHtml)
	const rawTitle = extractTagText(mainHtml, 'h1') || extractTagText(html, 'title')
	const title = cleanTitle(rawTitle)
	const description = extractMeta(html, 'name', 'description') || extractFirstParagraph(cleanedMain)
	const content = normalizeText(stripTags(cleanedMain)).slice(0, contentLimit)
	const type = getDocumentType(fileName)

	return {
		title,
		url: fileName,
		type,
		description,
		content,
		image: extractImage(html, mainHtml),
		keywords: makeKeywords({ title, description, content, type, fileName }),
		weight: getDocumentWeight(fileName, type)
	}
}

export async function generateSearchIndex() {
	const htmlFiles = readdirSync(appDir)
		.filter((fileName) => fileName.endsWith('.html'))
		.filter((fileName) => !excludedFiles.has(fileName))
		.sort((a, b) => a.localeCompare(b, 'ru'))

	const documents = htmlFiles
		.map(createDocument)
		.filter((document) => document.title && document.url && document.content)

	const index = {
		version: 1,
		source: 'static',
		futureEndpoint: '/wp-json/limitless/v1/search',
		generatedAt: new Date().toISOString(),
		documents
	}

	writeFileSync(outputPath, `${JSON.stringify(index, null, '\t')}\n`, 'utf8')
	console.log(`search-index: ${documents.length} documents -> app/search-index.json`)

	return index
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	generateSearchIndex().catch((error) => {
		console.error(error)
		process.exit(1)
	})
}
