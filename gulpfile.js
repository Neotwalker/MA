import gulp from 'gulp'
const { src, dest, parallel, series, watch } = gulp

// import browserSync from 'browser-sync'
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'
import postCss from 'gulp-postcss'
import cssnano from 'cssnano'
import concat from 'gulp-concat'
import uglifyim from 'gulp-uglify-es'
const uglify = uglifyim.default
import rename from 'gulp-rename'
import { deleteAsync } from 'del'
import cache from 'gulp-cache'
import autoprefixer from 'autoprefixer'
import ftp from 'vinyl-ftp'
import rsyncfn from 'gulp-rsync'

const sassfn = gulpSass(dartSass)

// function browsersync(done) {
// 	browserSync.init({
// 		server: {
// 			baseDir: 'app/',
// 		},
// 		host: 'localhost',
// 		port: 3000,
// 		ui: false,
// 		notify: false,
// 		ghostMode: false,
// 		online: false,
// 		open: false,
// 		cors: true,
// 		socket: {
// 			domain: 'localhost:3000'
// 		}
// 	}, done)
// }

function js() {
	return src([
		'app/js/common.js',
	])
		.pipe(concat('scripts.min.js'))
		.pipe(uglify().on('error', function (err) {
			console.error(err.toString())
			this.emit('end')
		}))
		.pipe(dest('app/js'))
}

function sass() {
	return src('app/sass/**/*.sass')
		.pipe(sassfn().on('error', sassfn.logError))
		.pipe(postCss([
			autoprefixer({ grid: 'autoplace' }),
			cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
		]))
		.pipe(rename({ suffix: '.min', prefix: '' }))
		.pipe(dest('app/css'))
}

async function imagemin() {
	const { default: imageminfn } = await import('gulp-imagemin')

	return src(['app/img/**/*'])
		.pipe(imageminfn())
		.pipe(dest('dist/img/'))
}

async function removedist() {
	await deleteAsync('dist/**/*', { force: true })
}

async function clearcache() {
	cache.clearAll()
}

function buildcopy() {
	return src([
		'app/*.html',
		'app/.htaccess',
		'{app/js,app/css}/*.min.*',
		'app/fonts/**/*'
	], { base: 'app/' })
		.pipe(dest('dist'))
}

function deploy() {
	let conn = ftp.create({
		host: 'hostname.com',
		user: 'username',
		password: 'userpassword',
		parallel: 10
	})

	let globs = [
		'dist/**',
	]

	return src(globs, { buffer: false })
		.pipe(conn.dest('/path/to/folder/on/server'))
}

function rsync() {
	return src('dist/')
		.pipe(rsyncfn({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			include: [],
			exclude: ['**/Thumbs.db', '**/*.DS_Store'],
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
}

function startwatch() {
	watch('app/sass/**/*.sass', { usePolling: true }, sass)
	watch(['libs/**/*.js', 'app/js/common.js'], { usePolling: true }, js)
	watch('app/*.html', { usePolling: true })
}

export { js, sass, imagemin, deploy, rsync, clearcache }
export const build = series(removedist, imagemin, js, sass, buildcopy)
export default series(js, sass, startwatch)