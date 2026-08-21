"use strict";

document.addEventListener("DOMContentLoaded", () => {
	const docEl = document.documentElement;
	const body = document.body;

	// ---------- UTILS ----------
	const header = document.querySelector('.header');
	const topButton = document.querySelector('.top');
	const modalGeneral = document.querySelector('#modal_general');
	const modalSend = document.querySelector('#modal_send') || document.querySelector('.modal--send');
	const servicesToggle = document.querySelector('.header-nav__services-toggle');
	const servicesMenu = document.querySelector('#header-services-menu');
	const aboutToggle = document.querySelector('.header-nav__about-toggle');
	const aboutMenu = document.querySelector('#header-about-menu');
	const searchToggle = document.querySelector('.header-search-toggle');
	const searchPanel = document.querySelector('#header-search-panel');
	const searchInput = document.querySelector('#header-search-input');
	const searchClose = document.querySelector('.header-search-form__close');
	const burgerMenu = document.querySelector('.burger');
	const mobileNavigation = document.querySelector('#mobile-navigation');
	const mobileNavigationOverlay = document.querySelector('.mobile-navigation-overlay');
	const mobileServicesToggle = document.querySelector('.mobile-navigation__services-toggle');
	const mobileServicesList = document.querySelector('#mobile-services-list');
	const mobileAboutToggle = document.querySelector('.mobile-navigation__about-toggle');
	const mobileAboutList = document.querySelector('#mobile-about-list');

	let activeModal = null;
	let activeModalTrigger = null;
	let isMobileNavigationOpen = false;
	let resetHeaderSearch = null;
	const mobileScrollState = {
		locked: false,
		scrollY: 0,
		headerPaddingRight: '',
		bodyPaddingRight: '',
	};
	const modalScrollState = {
		locked: false,
		scrollY: 0,
		body: {},
		headerPaddingRight: '',
	};
	const modalMobileViewportQuery = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
	const modalTouchViewportQuery = window.matchMedia ? window.matchMedia('(hover: none) and (pointer: coarse)') : null;
	let modalViewportRaf = 0;
	
	// ---------- COOKIE CONSENT ----------
	(function () {
		const banner = document.querySelector('.cookie-consent');
		const preferences = document.querySelector('.cookie-preferences');
		const settingsOpeners = Array.from(document.querySelectorAll('.cookie-settings-open'));
		if (!banner && !preferences && !settingsOpeners.length) return;

		const analyticsToggle = preferences?.querySelector('.cookie-preferences__checkbox');
		const preferencesDialog = preferences?.querySelector('.cookie-preferences__dialog');
		const closeButtons = preferences ? Array.from(preferences.querySelectorAll('[data-cookie-settings-close]')) : [];
		const acceptButtons = Array.from(document.querySelectorAll('.cookie-consent__accept, .cookie-preferences__accept'));
		const necessaryButtons = Array.from(document.querySelectorAll('.cookie-consent__necessary, .cookie-preferences__necessary'));
		const saveButton = preferences?.querySelector('.cookie-preferences__save');
		const bannerSettingsButton = banner?.querySelector('.cookie-consent__settings');
		const CONSENT_KEY = 'maratCookieConsent';
		const LEGACY_KEYS = [
			'cookieConsent',
			'cookieConsentTs',
			'cookieConsentMode',
			'cookieAnalyticsAllowed',
			'cookieConsentUpdatedAt',
		];
		const CONSENT_VERSION = 1;
		const CONSENT_TTL = 1000 * 60 * 60 * 24 * 180;
		let preferencesTrigger = null;
		let memoryConsent = null;
		const preferencesScrollState = {
			locked: false,
			scrollY: 0,
			body: {},
			headerPaddingRight: '',
		};

		function normalizeConsent(value) {
			let parsed = value;
			if (typeof value === 'string') {
				try {
					parsed = JSON.parse(value);
				} catch (e) {
					return null;
				}
			}

			if (!parsed || typeof parsed !== 'object') return null;
			if (parsed.version !== CONSENT_VERSION) return null;
			if (parsed.necessary !== true) return null;
			if (typeof parsed.analytics !== 'boolean') return null;
			if (typeof parsed.updatedAt !== 'string') return null;

			const updatedAt = Date.parse(parsed.updatedAt);
			if (Number.isNaN(updatedAt) || Date.now() - updatedAt > CONSENT_TTL) return null;

			return {
				version: CONSENT_VERSION,
				necessary: true,
				analytics: parsed.analytics,
				updatedAt: parsed.updatedAt,
			};
		}

		function readStoredConsent() {
			let storageAvailable = true;
			try {
				const stored = normalizeConsent(localStorage.getItem(CONSENT_KEY));
				if (stored) return stored;
			} catch (e) {
				storageAvailable = false;
			}

			return storageAvailable ? null : normalizeConsent(memoryConsent);
		}

		function getCurrentConsent() {
			return readStoredConsent() || {
				version: CONSENT_VERSION,
				necessary: true,
				analytics: false,
				updatedAt: null,
			};
		}

		function writeConsent(analyticsAllowed) {
			const consent = {
				version: CONSENT_VERSION,
				necessary: true,
				analytics: Boolean(analyticsAllowed),
				updatedAt: new Date().toISOString(),
			};

			memoryConsent = consent;
			try {
				localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
				LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
			} catch (e) {}

			return consent;
		}

		function emitConsentChange(consent) {
			document.dispatchEvent(new CustomEvent('site:consent-change', {
				detail: {
					necessary: true,
					analytics: Boolean(consent.analytics),
				},
			}));
		}

		function updateBannerOffset() {
			if (!banner?.classList.contains('active')) {
				body.classList.remove('cookie-banner-visible');
				docEl.style.removeProperty('--cookie-consent-height');
				return;
			}

			const inner = banner.querySelector('.cookie-consent__inner');
			const height = inner ? Math.ceil(inner.getBoundingClientRect().height) : 0;
			body.classList.add('cookie-banner-visible');
			docEl.style.setProperty('--cookie-consent-height', `${height}px`);
		}

		function showBanner() {
			if (!banner) return;
			banner.classList.add('active');
			banner.setAttribute('aria-hidden', 'false');
			banner.removeAttribute('inert');
			requestAnimationFrame(updateBannerOffset);
		}

		function hideBanner() {
			if (!banner) return;
			if (banner.contains(document.activeElement)) {
				document.activeElement.blur();
			}
			banner.classList.remove('active');
			banner.setAttribute('aria-hidden', 'true');
			banner.setAttribute('inert', '');
			updateBannerOffset();
		}

		function lockPreferencesScroll() {
			if (preferencesScrollState.locked) return;
			const scrollbarWidth = getScrollbarWidth();
			preferencesScrollState.scrollY = window.scrollY || window.pageYOffset || 0;
			preferencesScrollState.body = {
				position: body.style.position,
				top: body.style.top,
				left: body.style.left,
				width: body.style.width,
				paddingRight: body.style.paddingRight,
			};
			preferencesScrollState.headerPaddingRight = header?.style.paddingRight || '';

			docEl.classList.add('overflow');
			body.style.position = 'fixed';
			body.style.top = `-${preferencesScrollState.scrollY}px`;
			body.style.left = '0';
			body.style.width = '100%';
			if (scrollbarWidth > 0) {
				body.style.paddingRight = `${scrollbarWidth}px`;
				if (header) {
					header.style.paddingRight = `${scrollbarWidth}px`;
				}
			}
			preferencesScrollState.locked = true;
		}

		function unlockPreferencesScroll() {
			if (!preferencesScrollState.locked) return;
			const { scrollY, body: previousBody, headerPaddingRight } = preferencesScrollState;
			const previousScrollBehavior = docEl.style.scrollBehavior;

			docEl.style.scrollBehavior = 'auto';
			body.style.position = previousBody.position || '';
			body.style.top = previousBody.top || '';
			body.style.left = previousBody.left || '';
			body.style.width = previousBody.width || '';
			body.style.paddingRight = previousBody.paddingRight || '';
			if (header) {
				header.style.paddingRight = headerPaddingRight || '';
			}
			preferencesScrollState.locked = false;
			docEl.classList.remove('overflow');
			window.scrollTo(0, scrollY);
			requestAnimationFrame(() => {
				docEl.style.scrollBehavior = previousScrollBehavior || '';
			});
		}

		function getFocusableElements() {
			if (!preferences) return [];
			return Array.from(preferences.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])'))
				.filter((element) => !element.disabled && element.offsetParent !== null);
		}

		function openPreferences(trigger) {
			if (!preferences || !preferencesDialog || activeModal) return;
			closeHeaderLayers();
			const consent = getCurrentConsent();
			preferencesTrigger = trigger || document.activeElement;
			if (analyticsToggle) {
				analyticsToggle.checked = Boolean(consent.analytics);
			}
			hideBanner();
			lockPreferencesScroll();
			preferences.classList.add('active');
			preferences.setAttribute('aria-hidden', 'false');
			preferences.removeAttribute('inert');
			focusAfterPaint(preferencesDialog);
		}

		function closePreferences(options = {}) {
			if (!preferences) return;
			const { returnFocus = true, restoreBanner = true } = options;
			if (preferences.contains(document.activeElement)) {
				document.activeElement.blur();
			}
			preferences.classList.remove('active');
			preferences.setAttribute('aria-hidden', 'true');
			preferences.setAttribute('inert', '');
			unlockPreferencesScroll();
			if (restoreBanner && !readStoredConsent()) {
				showBanner();
			}
			if (
				returnFocus &&
				preferencesTrigger &&
				document.contains(preferencesTrigger) &&
				!preferencesTrigger.closest('[inert], [aria-hidden="true"]') &&
				typeof preferencesTrigger.focus === 'function'
			) {
				focusWithoutScroll(preferencesTrigger);
			}
			preferencesTrigger = null;
		}

		function saveChoice(analyticsAllowed) {
			const consent = writeConsent(analyticsAllowed);
			hideBanner();
			closePreferences({ returnFocus: true, restoreBanner: false });
			emitConsentChange(consent);
		}

		function trapPreferencesFocus(event) {
			if (!preferences?.classList.contains('active') || event.key !== 'Tab') return;
			const focusable = getFocusableElements();
			if (!focusable.length) {
				event.preventDefault();
				focusWithoutScroll(preferencesDialog);
				return;
			}
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const current = document.activeElement;
			if (event.shiftKey && (current === first || current === preferencesDialog || !preferences.contains(current))) {
				event.preventDefault();
				last.focus({ preventScroll: true });
			} else if (!event.shiftKey && (current === last || current === preferencesDialog || !preferences.contains(current))) {
				event.preventDefault();
				first.focus({ preventScroll: true });
			}
		}

		window.getMaratCookieConsent = getCurrentConsent;

		const choice = readStoredConsent();
		if (choice) {
			hideBanner();
		} else {
			showBanner();
		}

		acceptButtons.forEach((button) => {
			button.addEventListener('click', () => saveChoice(true));
		});
		necessaryButtons.forEach((button) => {
			button.addEventListener('click', () => saveChoice(false));
		});
		saveButton?.addEventListener('click', () => saveChoice(Boolean(analyticsToggle?.checked)));
		bannerSettingsButton?.addEventListener('click', (event) => openPreferences(event.currentTarget));
		settingsOpeners.forEach((button) => {
			button.addEventListener('click', (event) => openPreferences(event.currentTarget));
		});
		closeButtons.forEach((button) => {
			button.addEventListener('click', () => closePreferences());
		});
		preferences?.addEventListener('click', (event) => {
			if (event.target === preferences) {
				closePreferences();
			}
		});
		window.addEventListener('resize', updateBannerOffset);
		document.addEventListener('keydown', (event) => {
			if (!preferences?.classList.contains('active')) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				closePreferences();
				return;
			}
			trapPreferencesFocus(event);
		});
	})();
	// ---------- HEADER SCROLL & SCROLL-TO-TOP ----------
	if (header || topButton) {
		let isScrollTicking = false;

		const updateScrollState = () => {
			const y = window.scrollY || window.pageYOffset;
			header?.classList.toggle('scroll', y > 8);
			topButton?.classList.toggle('scroll', y > 500);
			isScrollTicking = false;
		};

		const requestScrollStateUpdate = () => {
			if (isScrollTicking) return;
			isScrollTicking = true;
			requestAnimationFrame(updateScrollState);
		};

		updateScrollState();
		window.addEventListener('load', updateScrollState);
		window.addEventListener('pageshow', updateScrollState);
		window.addEventListener('scroll', requestScrollStateUpdate, { passive: true });

		if (topButton) {
			const topSafetyTargets = Array.from(document.querySelectorAll([
				'.articles-archive-cta',
				'.article-related',
				'.case-study-cta',
				'.industry-cta',
				'.site-footer__cta',
			].join(',')));

			if (topSafetyTargets.length) {
				let isTopSafetyTicking = false;
				const isTopOverSafetyTarget = () => {
					const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
					return topSafetyTargets.some((target) => {
						const rect = target.getBoundingClientRect();
						return rect.top < viewportHeight * 0.92 && rect.bottom > viewportHeight * 0.08;
					});
				};
				const setTopSafetyState = (isUnsafe) => {
					topButton.classList.toggle('top--safe-hidden', isUnsafe);
				};
				const updateTopSafetyState = () => {
					setTopSafetyState(isTopOverSafetyTarget());
					isTopSafetyTicking = false;
				};
				const requestTopSafetyStateUpdate = () => {
					if (isTopSafetyTicking) return;
					isTopSafetyTicking = true;
					requestAnimationFrame(updateTopSafetyState);
				};

				if ('IntersectionObserver' in window) {
					const visibleSafetyTargets = new Set();
					const topSafetyObserver = new IntersectionObserver((entries) => {
						entries.forEach((entry) => {
							if (entry.isIntersecting) {
								visibleSafetyTargets.add(entry.target);
							} else {
								visibleSafetyTargets.delete(entry.target);
							}
						});
						setTopSafetyState(visibleSafetyTargets.size > 0 || isTopOverSafetyTarget());
					}, {
						root: null,
						rootMargin: '0px 0px -8% 0px',
						threshold: 0.01,
					});

					topSafetyTargets.forEach((target) => topSafetyObserver.observe(target));
				}

				updateTopSafetyState();
				window.addEventListener('load', updateTopSafetyState);
				window.addEventListener('pageshow', updateTopSafetyState);
				window.addEventListener('scroll', requestTopSafetyStateUpdate, { passive: true });
				window.addEventListener('resize', requestTopSafetyStateUpdate);
			}
		}

		topButton?.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	// Убрать скролл при открытии модалок/меню
	const hasClass = (el, cls) => el && el.classList.contains(cls);
	const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
	const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth;
	function isAnythingOverlayOpen() {
		return (
			isMobileNavigationOpen ||
			Boolean(activeModal)
		);
	}
	function lockScroll() {
		if (!isMobileNavigationOpen || mobileScrollState.locked) return;
		const scrollbarWidth = getScrollbarWidth();
		mobileScrollState.scrollY = window.scrollY || window.pageYOffset || 0;
		mobileScrollState.headerPaddingRight = header?.style.paddingRight || '';
		mobileScrollState.bodyPaddingRight = body.style.paddingRight || '';
		docEl.classList.add('overflow');
		if (scrollbarWidth > 0 && header) {
			header.style.paddingRight = `${scrollbarWidth}px`;
			body.style.paddingRight = `${scrollbarWidth}px`;
		}
		mobileScrollState.locked = true;
	}
	function unlockScrollIfFree(options = {}) {
		const { restoreScroll = true } = options;
		if (isAnythingOverlayOpen()) return;
		const { scrollY, headerPaddingRight, bodyPaddingRight } = mobileScrollState;
		const previousScrollBehavior = docEl.style.scrollBehavior;
		docEl.classList.remove('overflow');
		if (header) {
			header.style.paddingRight = headerPaddingRight || '';
		}
		body.style.paddingRight = bodyPaddingRight || '';
		if (mobileScrollState.locked && restoreScroll) {
			docEl.style.scrollBehavior = 'auto';
			window.scrollTo(0, scrollY);
			requestAnimationFrame(() => {
				docEl.style.scrollBehavior = previousScrollBehavior || '';
			});
		}
		mobileScrollState.locked = false;
		mobileScrollState.scrollY = 0;
		mobileScrollState.headerPaddingRight = '';
		mobileScrollState.bodyPaddingRight = '';
	}

	// ---------- MODALS ----------
	function getModalTarget(trigger) {
		if (!trigger) return null;
		const dataTarget = trigger.getAttribute('data-modal-target')?.trim();
		const href = trigger.getAttribute('href')?.trim();
		const selector = dataTarget || (href && href.startsWith('#') && href.length > 1 ? href : '');
		if (!selector || !selector.startsWith('#')) return null;
		try {
			const target = document.querySelector(selector);
			return target?.classList.contains('modal') ? target : null;
		} catch (e) {
			return null;
		}
	}

	function shouldSyncModalViewport() {
		return Boolean(
			window.visualViewport
			&& (
				(modalMobileViewportQuery && modalMobileViewportQuery.matches)
				|| (modalTouchViewportQuery && modalTouchViewportQuery.matches)
			)
		);
	}

	function clearModalViewportVars() {
		if (modalViewportRaf) {
			cancelAnimationFrame(modalViewportRaf);
			modalViewportRaf = 0;
		}
		docEl.style.removeProperty('--modal-visual-height');
		docEl.style.removeProperty('--modal-visual-offset-top');
	}

	function syncModalViewportVars() {
		if (!activeModal || !shouldSyncModalViewport()) {
			clearModalViewportVars();
			return;
		}

		const viewport = window.visualViewport;
		const height = Math.max(320, Math.round(viewport.height));
		const offsetTop = Math.max(0, Math.round(viewport.offsetTop));
		docEl.style.setProperty('--modal-visual-height', `${height}px`);
		docEl.style.setProperty('--modal-visual-offset-top', `${offsetTop}px`);
	}

	function queueModalViewportSync() {
		if (!activeModal) return;
		if (modalViewportRaf) return;
		modalViewportRaf = requestAnimationFrame(() => {
			modalViewportRaf = 0;
			syncModalViewportVars();
		});
	}

	function lockModalScroll() {
		if (modalScrollState.locked) return;
		const scrollbarWidth = getScrollbarWidth();
		modalScrollState.scrollY = window.scrollY || window.pageYOffset || 0;
		modalScrollState.body = {
			position: body.style.position,
			top: body.style.top,
			left: body.style.left,
			width: body.style.width,
			paddingRight: body.style.paddingRight,
		};
		modalScrollState.headerPaddingRight = header?.style.paddingRight || '';

		docEl.classList.add('overflow');
		body.style.position = 'fixed';
		body.style.top = `-${modalScrollState.scrollY}px`;
		body.style.left = '0';
		body.style.width = '100%';
		if (scrollbarWidth > 0) {
			body.style.paddingRight = `${scrollbarWidth}px`;
			if (header) {
				header.style.paddingRight = `${scrollbarWidth}px`;
			}
		}
		modalScrollState.locked = true;
	}

	function unlockModalScroll() {
		if (!modalScrollState.locked) return;
		const { scrollY, body: previousBody, headerPaddingRight } = modalScrollState;
		const previousScrollBehavior = docEl.style.scrollBehavior;

		docEl.style.scrollBehavior = 'auto';
		body.style.position = previousBody.position || '';
		body.style.top = previousBody.top || '';
		body.style.left = previousBody.left || '';
		body.style.width = previousBody.width || '';
		body.style.paddingRight = previousBody.paddingRight || '';
		if (header) {
			header.style.paddingRight = headerPaddingRight || '';
		}
		modalScrollState.locked = false;

		if (isMobileNavigationOpen) {
			lockScroll();
		} else {
			docEl.classList.remove('overflow');
		}
		window.scrollTo(0, scrollY);
		requestAnimationFrame(() => {
			docEl.style.scrollBehavior = previousScrollBehavior || '';
		});
	}

	function getFocusableElements(modal) {
		if (!modal) return [];
		const selectors = [
			'a[href]',
			'button:not([disabled])',
			'input:not([disabled]):not([type="hidden"])',
			'textarea:not([disabled])',
			'select:not([disabled])',
			'[tabindex]:not([tabindex="-1"])',
		];
		return qsa(selectors.join(','), modal).filter(element => {
			if (element.closest('[inert], [aria-hidden="true"]')) return false;
			const style = window.getComputedStyle(element);
			if (style.display === 'none' || style.visibility === 'hidden') return false;
			return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
		});
	}

	function focusWithoutScroll(element) {
		if (!element) return;
		try {
			element.focus({ preventScroll: true });
		} catch {
			element.focus();
		}
	}

	function focusAfterPaint(element) {
		if (!element) return;
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				focusWithoutScroll(element);
				window.setTimeout(() => {
					if (document.activeElement !== element) {
						focusWithoutScroll(element);
					}
				}, 60);
			});
		});
	}

	function focusModalWrapper(modal) {
		const wrapper = modal?.querySelector('.modal--wrapper');
		if (wrapper && !wrapper.hasAttribute('tabindex')) {
			wrapper.setAttribute('tabindex', '-1');
		}
		focusAfterPaint(wrapper || modal);
	}

	function openModal(modal, trigger = null) {
		if (!modal) return;
		if (activeModal && activeModal !== modal) {
			closeModal(activeModal, { unlockScroll: false, restoreFocus: false });
		}
		if (!modalScrollState.locked) {
			lockModalScroll();
		}
		if (trigger) {
			activeModalTrigger = trigger;
		}
		activeModal = modal;
		modal.removeAttribute('inert');
		modal.setAttribute('aria-hidden', 'false');
		syncModalViewportVars();
		modal.classList.add('active');
		focusModalWrapper(modal);
	}

	function closeModal(modal = activeModal, options = {}) {
		const { unlockScroll = true, restoreFocus = true } = options;
		if (!modal) return;
		const shouldClearActiveModal = activeModal === modal;
		const restoreTarget = shouldClearActiveModal && restoreFocus ? activeModalTrigger : null;
		if (modal.contains(document.activeElement)) {
			document.activeElement.blur();
		}
		modal.classList.remove('active');
		modal.setAttribute('aria-hidden', 'true');
		modal.setAttribute('inert', '');
		if (shouldClearActiveModal) {
			activeModal = null;
			clearModalViewportVars();
		}
		if (unlockScroll) {
			unlockModalScroll();
		}
		if (restoreFocus) {
			activeModalTrigger = null;
			if (restoreTarget && document.contains(restoreTarget)) {
				focusAfterPaint(restoreTarget);
			}
		}
	}

	function trapModalFocus(event) {
		if (!activeModal || event.key !== 'Tab') return;
		const wrapper = activeModal.querySelector('.modal--wrapper');
		const focusable = getFocusableElements(activeModal);
		if (!focusable.length) {
			event.preventDefault();
			focusWithoutScroll(wrapper || activeModal);
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const current = document.activeElement;

		if (event.shiftKey && (current === first || current === wrapper || !activeModal.contains(current))) {
			event.preventDefault();
			last.focus({ preventScroll: true });
			return;
		}

		if (!event.shiftKey && (current === last || current === wrapper || !activeModal.contains(current))) {
			event.preventDefault();
			first.focus({ preventScroll: true });
		}
	}

	if (modalGeneral || modalSend) {
		qsa('.modal--open').forEach(trigger => {
			trigger.addEventListener('click', e => {
				const target = getModalTarget(trigger);
				if (!target) return;
				e.preventDefault();
				closeHeaderLayers({ beforeModal: true });
				openModal(target, trigger);
			});
		});

		qsa('.modal--close').forEach(close => {
			close.addEventListener('click', e => {
				e.stopPropagation();
				closeModal(close.closest('.modal') || activeModal);
			});
		});

		qsa('.modal').forEach(modalElement => {
			modalElement.addEventListener('click', e => {
				if (e.target === modalElement && activeModal === modalElement) {
					closeModal(modalElement);
				}
			});
		});

		document.addEventListener('keydown', e => {
			if (!activeModal) return;
			if (e.key === 'Escape') {
				e.preventDefault();
				closeModal(activeModal);
				return;
			}
			trapModalFocus(e);
		});

		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', queueModalViewportSync);
			window.visualViewport.addEventListener('scroll', queueModalViewportSync);
		}
		modalMobileViewportQuery?.addEventListener?.('change', () => {
			if (activeModal) {
				queueModalViewportSync();
			} else {
				clearModalViewportVars();
			}
		});
		modalTouchViewportQuery?.addEventListener?.('change', () => {
			if (activeModal) {
				queueModalViewportSync();
			} else {
				clearModalViewportVars();
			}
		});
	}

	// Case study sticky rail active state
	(function () {
		const rail = document.querySelector('.case-study-rail');
		if (!rail) return;

		const links = Array.from(rail.querySelectorAll('a[href^="#"]'));
		const entries = links
			.map(link => {
				const id = decodeURIComponent(link.getAttribute('href') || '').replace(/^#/, '');
				const section = id ? document.getElementById(id) : null;
				return section ? { id, link, item: link.closest('li'), section } : null;
			})
			.filter(Boolean);
		if (!entries.length) return;

		let activeId = '';
		let activeRaf = 0;

		const setActive = (id) => {
			if (!id || activeId === id) return;
			activeId = id;
			entries.forEach(entry => {
				const isActive = entry.id === id;
				entry.item?.classList.toggle('is-active', isActive);
				if (isActive) {
					entry.link.setAttribute('aria-current', 'location');
				} else {
					entry.link.removeAttribute('aria-current');
				}
			});
		};

		const getActivationLine = () => {
			const headerHeight = header?.getBoundingClientRect().height || 0;
			return headerHeight + Math.min(window.innerHeight * 0.32, 280);
		};

		const updateActiveFromPosition = () => {
			activeRaf = 0;
			const activationLine = getActivationLine();
			let current = entries[0];

			for (const entry of entries) {
				const rect = entry.section.getBoundingClientRect();
				if (rect.top <= activationLine) {
					current = entry;
				}
			}

			setActive(current.id);
		};

		const queueActiveUpdate = () => {
			if (activeRaf) return;
			activeRaf = window.requestAnimationFrame(updateActiveFromPosition);
		};

		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver(queueActiveUpdate, {
				root: null,
				rootMargin: '-20% 0px -55% 0px',
				threshold: [0, 0.1, 0.35, 0.65],
			});
			entries.forEach(entry => observer.observe(entry.section));
		}

		links.forEach(link => {
			link.addEventListener('click', () => {
				const id = decodeURIComponent(link.getAttribute('href') || '').replace(/^#/, '');
				setActive(id);
				window.setTimeout(queueActiveUpdate, 450);
			});
		});
		window.addEventListener('scroll', queueActiveUpdate, { passive: true });
		window.addEventListener('resize', queueActiveUpdate);
		queueActiveUpdate();
	}());

	// Article table of contents active state
	(function () {
		const toc = document.querySelector('[data-article-toc]');
		const article = document.querySelector('[data-article-single]');
		if (!toc || !article) return;

		const links = Array.from(document.querySelectorAll('.article-toc a[href^="#"], .article-toc-mobile a[href^="#"]'));
		const entries = links
			.map(link => {
				const id = decodeURIComponent(link.getAttribute('href') || '').replace(/^#/, '');
				const section = id ? document.getElementById(id) : null;
				return section ? { id, link, section } : null;
			})
			.filter(Boolean);
		if (!entries.length) return;

		const sections = Array.from(new Map(entries.map(entry => [entry.id, entry.section])).entries())
			.map(([id, section]) => ({ id, section }));
		const mobileToc = document.querySelector('.article-toc-mobile');
		let activeRaf = 0;

		const setActive = (id) => {
			if (!id) return;
			entries.forEach(entry => {
				const isVisible = Boolean(entry.link.offsetWidth || entry.link.offsetHeight || entry.link.getClientRects().length);
				if (entry.id === id && isVisible) {
					entry.link.setAttribute('aria-current', 'true');
				} else {
					entry.link.removeAttribute('aria-current');
				}
			});
		};

		const getActivationLine = () => {
			const headerHeight = header?.getBoundingClientRect().height || 0;
			return headerHeight + Math.min(Math.max(window.innerHeight * 0.12, 56), 120);
		};

		const getSectionHeadingTop = (entry) => {
			const heading = entry.section.querySelector('h2, h3, h4') || entry.section;
			return heading.getBoundingClientRect().top;
		};

		const updateActiveFromPosition = () => {
			activeRaf = 0;
			const activationLine = getActivationLine();
			let current = sections[0];
			const maxScroll = Math.max(
				document.documentElement.scrollHeight,
				document.body?.scrollHeight || 0
			) - window.innerHeight;

			if (window.scrollY >= maxScroll - 4) {
				setActive(sections[sections.length - 1].id);
				return;
			}

			for (const entry of sections) {
				if (getSectionHeadingTop(entry) <= activationLine) {
					current = entry;
				}
			}

			setActive(current.id);
		};

		const queueActiveUpdate = () => {
			if (activeRaf) return;
			activeRaf = window.requestAnimationFrame(updateActiveFromPosition);
		};

		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver(queueActiveUpdate, {
				root: null,
				rootMargin: '0px 0px -70% 0px',
				threshold: [0, 1],
			});
			sections.forEach(entry => observer.observe(entry.section));
		}

		links.forEach(link => {
			link.addEventListener('click', () => {
				const id = decodeURIComponent(link.getAttribute('href') || '').replace(/^#/, '');
				setActive(id);
				window.setTimeout(queueActiveUpdate, 450);
			});
		});
		window.addEventListener('scroll', queueActiveUpdate, { passive: true });
		window.addEventListener('resize', queueActiveUpdate);
		mobileToc?.addEventListener('toggle', queueActiveUpdate);
		queueActiveUpdate();
	}());

	function closeServicesDropdown() {
		if (!servicesToggle || !servicesMenu) return;
		servicesToggle.setAttribute('aria-expanded', 'false');
		servicesMenu.setAttribute('aria-hidden', 'true');
		servicesMenu.setAttribute('inert', '');
		servicesMenu.classList.remove('is-open');
		header?.classList.remove('header--services-open');
	}

	function openServicesDropdown() {
		if (!servicesToggle || !servicesMenu) return;
		closeSearchPanel();
		closeAboutDropdown();
		closeMobileNavigation();
		servicesToggle.setAttribute('aria-expanded', 'true');
		servicesMenu.setAttribute('aria-hidden', 'false');
		servicesMenu.removeAttribute('inert');
		servicesMenu.classList.add('is-open');
		header?.classList.add('header--services-open');
	}

	function toggleServicesDropdown() {
		if (servicesToggle?.getAttribute('aria-expanded') === 'true') {
			closeServicesDropdown();
		} else {
			openServicesDropdown();
		}
	}

	function closeAboutDropdown(options = {}) {
		if (!aboutToggle || !aboutMenu) return;
		const { restoreFocus = false } = options;
		const wasOpen = aboutMenu.classList.contains('is-open');
		aboutToggle.setAttribute('aria-expanded', 'false');
		aboutMenu.setAttribute('aria-hidden', 'true');
		aboutMenu.setAttribute('inert', '');
		aboutMenu.classList.remove('is-open');
		header?.classList.remove('header--about-open');
		if (restoreFocus && wasOpen) {
			focusAfterPaint(aboutToggle);
		}
	}

	function openAboutDropdown() {
		if (!aboutToggle || !aboutMenu) return;
		closeSearchPanel();
		closeServicesDropdown();
		closeMobileNavigation();
		aboutToggle.setAttribute('aria-expanded', 'true');
		aboutMenu.setAttribute('aria-hidden', 'false');
		aboutMenu.removeAttribute('inert');
		aboutMenu.classList.add('is-open');
		header?.classList.add('header--about-open');
	}

	function toggleAboutDropdown() {
		if (aboutToggle?.getAttribute('aria-expanded') === 'true') {
			closeAboutDropdown();
		} else {
			openAboutDropdown();
		}
	}

	function closeSearchPanel(options = {}) {
		if (!searchToggle || !searchPanel) return;
		const { restoreFocus = false, clear = true } = options;
		const wasOpen = searchPanel.classList.contains('is-open');
		searchToggle.setAttribute('aria-expanded', 'false');
		searchToggle.setAttribute('aria-label', 'Открыть поиск');
		searchPanel.setAttribute('aria-hidden', 'true');
		searchPanel.setAttribute('inert', '');
		searchPanel.classList.remove('is-open');
		header?.classList.remove('header--search-open');
		if (clear && typeof resetHeaderSearch === 'function') {
			resetHeaderSearch();
		}
		if (restoreFocus && wasOpen) {
			focusAfterPaint(searchToggle);
		}
	}

	function openSearchPanel() {
		if (!searchToggle || !searchPanel) return;
		closeServicesDropdown();
		closeAboutDropdown();
		closeMobileNavigation();
		searchToggle.setAttribute('aria-expanded', 'true');
		searchToggle.setAttribute('aria-label', 'Закрыть поиск');
		searchPanel.setAttribute('aria-hidden', 'false');
		searchPanel.removeAttribute('inert');
		searchPanel.classList.add('is-open');
		header?.classList.add('header--search-open');
		focusAfterPaint(searchInput);
	}

	function toggleSearchPanel() {
		if (searchToggle?.getAttribute('aria-expanded') === 'true') {
			closeSearchPanel();
		} else {
			openSearchPanel();
		}
	}

	function closeMobileServices() {
		if (!mobileServicesToggle || !mobileServicesList) return;
		mobileServicesToggle.setAttribute('aria-expanded', 'false');
		mobileServicesList.setAttribute('aria-hidden', 'true');
		mobileServicesList.setAttribute('inert', '');
		mobileServicesList.classList.remove('is-open');
		mobileServicesList.style.maxHeight = '';
	}

	function openMobileServices() {
		if (!mobileServicesToggle || !mobileServicesList) return;
		closeMobileAbout();
		mobileServicesToggle.setAttribute('aria-expanded', 'true');
		mobileServicesList.setAttribute('aria-hidden', 'false');
		mobileServicesList.removeAttribute('inert');
		mobileServicesList.classList.add('is-open');
		mobileServicesList.style.maxHeight = `${mobileServicesList.scrollHeight}px`;
	}

	function toggleMobileServices() {
		if (mobileServicesToggle?.getAttribute('aria-expanded') === 'true') {
			closeMobileServices();
		} else {
			openMobileServices();
		}
	}

	function closeMobileAbout() {
		if (!mobileAboutToggle || !mobileAboutList) return;
		mobileAboutToggle.setAttribute('aria-expanded', 'false');
		mobileAboutList.setAttribute('aria-hidden', 'true');
		mobileAboutList.setAttribute('inert', '');
		mobileAboutList.classList.remove('is-open');
		mobileAboutList.style.maxHeight = '';
	}

	function openMobileAbout() {
		if (!mobileAboutToggle || !mobileAboutList) return;
		closeMobileServices();
		mobileAboutToggle.setAttribute('aria-expanded', 'true');
		mobileAboutList.setAttribute('aria-hidden', 'false');
		mobileAboutList.removeAttribute('inert');
		mobileAboutList.classList.add('is-open');
		mobileAboutList.style.maxHeight = `${mobileAboutList.scrollHeight}px`;
	}

	function toggleMobileAbout() {
		if (mobileAboutToggle?.getAttribute('aria-expanded') === 'true') {
			closeMobileAbout();
		} else {
			openMobileAbout();
		}
	}

	function openMobileNavigation() {
		if (!burgerMenu || !mobileNavigation) return;
		closeServicesDropdown();
		closeAboutDropdown();
		closeSearchPanel();
		isMobileNavigationOpen = true;
		header?.classList.add('open-menu');
		burgerMenu.classList.add('active');
		burgerMenu.setAttribute('aria-expanded', 'true');
		burgerMenu.setAttribute('aria-label', 'Закрыть меню');
		mobileNavigation.setAttribute('aria-hidden', 'false');
		mobileNavigation.removeAttribute('inert');
		mobileNavigation.classList.add('is-open');
		mobileNavigationOverlay?.classList.add('is-open');
		lockScroll();
		const preferredFocusable = mobileServicesToggle || mobileAboutToggle || getFocusableElements(mobileNavigation)[0];
		focusAfterPaint(preferredFocusable || mobileNavigation);
	}

	function closeMobileNavigation(options = {}) {
		const { restoreScroll = true } = options;
		if (!burgerMenu || !mobileNavigation || !isMobileNavigationOpen) return;
		if (mobileNavigation.contains(document.activeElement)) {
			document.activeElement.blur();
		}
		isMobileNavigationOpen = false;
		header?.classList.remove('open-menu');
		burgerMenu.classList.remove('active');
		burgerMenu.setAttribute('aria-expanded', 'false');
		burgerMenu.setAttribute('aria-label', 'Открыть меню');
		closeMobileServices();
		closeMobileAbout();
		mobileNavigation.classList.remove('is-open');
		mobileNavigation.setAttribute('aria-hidden', 'true');
		mobileNavigation.setAttribute('inert', '');
		mobileNavigationOverlay?.classList.remove('is-open');
		unlockScrollIfFree({ restoreScroll });
	}

	function closeHeaderLayers(options = {}) {
		const { beforeModal = false } = options;
		closeServicesDropdown();
		closeAboutDropdown();
		closeSearchPanel();
		closeMobileNavigation({ restoreScroll: !beforeModal });
	}

	function trapMobileNavigationFocus(event) {
		if (!isMobileNavigationOpen || activeModal || event.key !== 'Tab') return;
		const focusable = getFocusableElements(mobileNavigation);
		if (!focusable.length) {
			event.preventDefault();
			focusWithoutScroll(mobileNavigation);
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const current = document.activeElement;

		if (event.shiftKey && (current === first || current === mobileNavigation || !mobileNavigation.contains(current))) {
			event.preventDefault();
			last.focus({ preventScroll: true });
			return;
		}

		if (!event.shiftKey && (current === last || current === mobileNavigation || !mobileNavigation.contains(current))) {
			event.preventDefault();
			first.focus({ preventScroll: true });
		}
	}

	function handleToggleKey(event, callback) {
		if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
		event.preventDefault();
		event.stopPropagation();
		callback();
	}

	const siteSearchRoots = qsa('[data-site-search]');
	const siteSearchConfig = {
		source: 'static',
		staticIndexUrl: 'search-index.json',
		futureEndpoint: '/wp-json/limitless/v1/search',
		minLength: 2,
		debounce: 200
	};
	let siteSearchIndexPromise = null;

	function normalizeSearchValue(value = '') {
		return String(value)
			.toLowerCase()
			.replace(/ё/g, 'е')
			.replace(/[–—-]/g, ' ')
			.replace(/[^a-zа-я0-9\s]+/gi, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function getSearchTokens(value = '') {
		return Array.from(new Set(normalizeSearchValue(value).split(' ').filter(token => token.length >= siteSearchConfig.minLength)));
	}

	function escapeHtml(value = '') {
		return String(value).replace(/[&<>"']/g, (char) => ({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		})[char]);
	}

	function escapeRegExp(value = '') {
		return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function getHighlightPattern(tokens = []) {
		const patterns = tokens
			.filter(Boolean)
			.sort((a, b) => b.length - a.length)
			.map(token => escapeRegExp(token).replace(/[её]/gi, '[её]'));

		return patterns.length ? new RegExp(`(${patterns.join('|')})`, 'giu') : null;
	}

	function highlightSearchText(text = '', tokens = []) {
		const escaped = escapeHtml(text);
		const pattern = getHighlightPattern(tokens);
		return pattern ? escaped.replace(pattern, '<mark>$1</mark>') : escaped;
	}

	function getSearchIndex() {
		if (!siteSearchIndexPromise) {
			siteSearchIndexPromise = fetch(siteSearchConfig.staticIndexUrl, {
				headers: { Accept: 'application/json' },
				cache: 'no-store'
			})
				.then(response => {
					if (!response.ok) {
						throw new Error(`Search index request failed: ${response.status}`);
					}
					return response.json();
				})
				.then(index => {
					if (!index || !Array.isArray(index.documents)) {
						throw new Error('Search index has invalid schema');
					}
					return index.documents;
				});
		}

		return siteSearchIndexPromise;
	}

	function scoreSearchDocument(documentItem, query, tokens) {
		const normalizedQuery = normalizeSearchValue(query);
		const title = normalizeSearchValue(documentItem.title);
		const description = normalizeSearchValue(documentItem.description);
		const content = normalizeSearchValue(documentItem.content);
		const keywords = Array.isArray(documentItem.keywords) ? documentItem.keywords.map(normalizeSearchValue).join(' ') : '';
		const fields = [title, keywords, description, content];

		if (!tokens.every(token => fields.some(field => field.includes(token)))) {
			return 0;
		}

		let score = Number(documentItem.weight) || 0;

		if (title === normalizedQuery) score += 1000;
		if (title.startsWith(normalizedQuery)) score += 720;
		if (description.includes(normalizedQuery)) score += 180;
		if (content.includes(normalizedQuery)) score += 60;

		for (const token of tokens) {
			if (title.split(' ').includes(token)) score += 170;
			else if (title.includes(token)) score += 125;
			if (keywords.split(' ').includes(token)) score += 110;
			if (description.includes(token)) score += 55;
			if (content.includes(token)) score += 18;
		}

		return score;
	}

	function searchDocuments(documents, query) {
		const tokens = getSearchTokens(query);

		if (tokens.length === 0) {
			return [];
		}

		return documents
			.map(documentItem => ({
				...documentItem,
				_score: scoreSearchDocument(documentItem, query, tokens)
			}))
			.filter(documentItem => documentItem._score > 0)
			.sort((a, b) => b._score - a._score || a.title.localeCompare(b.title, 'ru'));
	}

	function getSearchSnippet(documentItem, tokens) {
		const source = documentItem.description || documentItem.content || '';
		const normalizedSource = normalizeSearchValue(source);
		const firstToken = tokens.find(token => normalizedSource.includes(token));

		if (!firstToken) {
			return source.length > 168 ? `${source.slice(0, 165).trim()}...` : source;
		}

		const index = normalizedSource.indexOf(firstToken);
		const start = Math.max(0, index - 70);
		const end = Math.min(source.length, index + 120);
		const prefix = start > 0 ? '...' : '';
		const suffix = end < source.length ? '...' : '';

		return `${prefix}${source.slice(start, end).trim()}${suffix}`;
	}

	function getSearchUrl(query = '') {
		const normalizedQuery = query.trim();
		return normalizedQuery ? `search.html?q=${encodeURIComponent(normalizedQuery)}` : 'search.html';
	}

	function initSiteSearch(root) {
		const form = root.querySelector('[data-site-search-form]');
		const input = root.querySelector('[data-site-search-input]');
		const dropdown = root.querySelector('[data-site-search-dropdown]');
		const status = root.querySelector('[data-site-search-status]');
		const list = root.querySelector('[data-site-search-list]');
		const allLink = root.querySelector('[data-site-search-all]');
		const clearButton = root.querySelector('[data-site-search-clear]');
		const pageSummary = root.querySelector('[data-search-page-summary]');
		const pageResults = root.querySelector('[data-search-page-results]');
		const context = root.dataset.searchContext || 'inline';
		const isHeader = context === 'header';
		const isPage = context === 'page';
		const limit = Number.parseInt(root.dataset.searchLimit || (isPage ? '50' : '7'), 10);
		let activeIndex = -1;
		let currentResults = [];
		let latestRequestId = 0;
		let debounceTimer = 0;

		if (!form || !input || !dropdown || !status || !list) {
			return null;
		}

		function hideAllResultsLink() {
			if (!allLink) return;
			allLink.hidden = true;
			allLink.removeAttribute('href');
		}

		function showAllResultsLink(query) {
			if (!allLink) return;
			allLink.href = getSearchUrl(query);
			allLink.hidden = false;
		}

		function setDropdownOpen(isOpen) {
			dropdown.hidden = !isOpen;
			input.setAttribute('aria-expanded', String(isOpen));
			if (!isOpen) {
				activeIndex = -1;
				input.removeAttribute('aria-activedescendant');
				qsa('[role="option"]', list).forEach(option => option.setAttribute('aria-selected', 'false'));
			}
		}

		function setStatus(message) {
			status.textContent = message;
			status.hidden = false;
			list.replaceChildren();
			currentResults = [];
			hideAllResultsLink();
			setDropdownOpen(true);
		}

		function closeDropdown() {
			hideAllResultsLink();
			setDropdownOpen(false);
		}

		function setActiveResult(nextIndex) {
			if (!currentResults.length) return;
			activeIndex = (nextIndex + currentResults.length) % currentResults.length;
			qsa('[role="option"]', list).forEach((option, index) => {
				const isActive = index === activeIndex;
				option.setAttribute('aria-selected', String(isActive));
				if (isActive) {
					input.setAttribute('aria-activedescendant', option.id);
					option.scrollIntoView({ block: 'nearest' });
				}
			});
		}

		function renderLiveResults(results, query) {
			const tokens = getSearchTokens(query);
			const shownResults = results.slice(0, limit);
			currentResults = shownResults;
			status.hidden = shownResults.length > 0;
			status.textContent = shownResults.length ? '' : 'Ничего не найдено. Попробуйте другое слово или перейдите к карте сайта.';
			list.replaceChildren();

			for (const [index, result] of shownResults.entries()) {
				const option = document.createElement('a');
				option.className = 'live-search__item';
				option.href = result.url;
				option.id = `${dropdown.id}-option-${index + 1}`;
				option.setAttribute('role', 'option');
				option.setAttribute('aria-selected', 'false');
				option.tabIndex = -1;
				option.innerHTML = `
					<span class="live-search__media" aria-hidden="true">${result.image ? `<img src="${escapeHtml(result.image)}" alt="" loading="lazy" decoding="async">` : `<span class="live-search__placeholder">${escapeHtml(result.type.slice(0, 1))}</span>`}</span>
					<span class="live-search__body">
						<span class="live-search__type">${escapeHtml(result.type)}</span>
						<span class="live-search__title">${highlightSearchText(result.title, tokens)}</span>
						<span class="live-search__snippet">${highlightSearchText(getSearchSnippet(result, tokens), tokens)}</span>
					</span>
					<span class="live-search__arrow" aria-hidden="true">→</span>
				`;
				option.addEventListener('mouseenter', () => setActiveResult(index));
				list.append(option);
			}

			if (allLink) {
				if (results.length > shownResults.length) {
					showAllResultsLink(query);
				} else {
					hideAllResultsLink();
				}
			}

			setDropdownOpen(true);
		}

		function renderPageResults(results, query, options = {}) {
			if (!pageSummary || !pageResults) return;
			const { loading = false, error = false } = options;
			const trimmedQuery = query.trim();
			const tokens = getSearchTokens(trimmedQuery);
			pageResults.replaceChildren();
			clearButton?.toggleAttribute('hidden', !trimmedQuery);

			if (!trimmedQuery) {
				pageSummary.textContent = 'Введите запрос, чтобы увидеть результаты.';
				return;
			}

			if (trimmedQuery.length < siteSearchConfig.minLength) {
				pageSummary.textContent = 'Введите ещё хотя бы один символ.';
				return;
			}

			if (loading) {
				pageSummary.textContent = 'Загружаю индекс поиска...';
				return;
			}

			if (error) {
				pageSummary.textContent = 'Не удалось загрузить поиск. Попробуйте обновить страницу.';
				return;
			}

			pageSummary.textContent = `По запросу “${trimmedQuery}” найдено: ${results.length}`;

			if (!results.length) {
				const empty = document.createElement('div');
				empty.className = 'search-page__empty';
				empty.innerHTML = `
					<h2>Ничего не найдено</h2>
					<p>Попробуйте изменить формулировку: например, искать по типу сайта, отрасли, CMS, SEO или названию проекта.</p>
				`;
				pageResults.append(empty);
				return;
			}

			for (const result of results) {
				const item = document.createElement('a');
				item.className = 'search-result';
				item.href = result.url;
				item.innerHTML = `
					${result.image ? `<span class="search-result__media" aria-hidden="true"><img src="${escapeHtml(result.image)}" alt="" loading="lazy" decoding="async"></span>` : ''}
					<span class="search-result__body">
						<span class="search-result__type">${escapeHtml(result.type)}</span>
						<span class="search-result__title h3">${highlightSearchText(result.title, tokens)}</span>
						<span class="search-result__text">${highlightSearchText(getSearchSnippet(result, tokens), tokens)}</span>
						<span class="search-result__url">${escapeHtml(result.url)}</span>
					</span>
					<span class="search-result__arrow" aria-hidden="true">→</span>
				`;
				pageResults.append(item);
			}
		}

		async function runSearch(options = {}) {
			const { live = true, page = isPage } = options;
			const query = input.value.trim();
			const requestId = ++latestRequestId;

			clearButton?.toggleAttribute('hidden', !query);

			if (!query) {
				if (live) setStatus('Начните вводить название услуги, проекта или статьи');
				if (page) renderPageResults([], query);
				return;
			}

			if (query.length < siteSearchConfig.minLength) {
				if (live) setStatus('Введите ещё хотя бы один символ');
				if (page) renderPageResults([], query);
				return;
			}

			if (live) setStatus('Загружаю индекс поиска...');
			if (page) renderPageResults([], query, { loading: true });

			try {
				const documents = await getSearchIndex();
				if (requestId !== latestRequestId) return;
				const results = searchDocuments(documents, query);
				if (live) renderLiveResults(results, query);
				if (page) renderPageResults(results, query);
			} catch (error) {
				if (requestId !== latestRequestId) return;
				if (live) setStatus('Не удалось загрузить поиск. Попробуйте обновить страницу.');
				if (page) renderPageResults([], query, { error: true });
			}
		}

		function debounceSearch() {
			window.clearTimeout(debounceTimer);
			debounceTimer = window.setTimeout(() => {
				runSearch();
			}, siteSearchConfig.debounce);
		}

		function openCurrentResult() {
			if (activeIndex < 0 || !currentResults[activeIndex]) return false;
			window.location.href = currentResults[activeIndex].url;
			return true;
		}

		function submitSearch(pushHistory = true) {
			const query = input.value.trim();
			if (!query) {
				input.focus();
				return;
			}

			if (isPage) {
				if (pushHistory && window.history?.pushState) {
					window.history.pushState({ q: query }, '', getSearchUrl(query));
				}
				runSearch({ live: false, page: true });
				closeDropdown();
				return;
			}

			window.location.href = getSearchUrl(query);
		}

		function resetSearch() {
			window.clearTimeout(debounceTimer);
			input.value = '';
			closeDropdown();
			clearButton?.setAttribute('hidden', '');
			status.textContent = 'Начните вводить название услуги, проекта или статьи';
			list.replaceChildren();
			currentResults = [];
			hideAllResultsLink();
			if (isPage) {
				renderPageResults([], '');
			}
		}

		form.addEventListener('submit', (event) => {
			event.preventDefault();
			if (event.submitter !== root.querySelector('[data-site-search-submit]') && openCurrentResult()) return;
			submitSearch();
		});

		input.addEventListener('focus', () => {
			if (!input.value.trim()) {
				if (isHeader) return;
				setStatus('Начните вводить название услуги, проекта или статьи');
			} else {
				runSearch();
			}
		});

		input.addEventListener('input', debounceSearch);

		input.addEventListener('keydown', (event) => {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				if (dropdown.hidden) {
					runSearch();
				} else {
					setActiveResult(activeIndex + 1);
				}
				return;
			}

			if (event.key === 'ArrowUp') {
				event.preventDefault();
				if (!dropdown.hidden) {
					setActiveResult(activeIndex - 1);
				}
				return;
			}

			if (event.key === 'Home' && !dropdown.hidden && currentResults.length) {
				event.preventDefault();
				setActiveResult(0);
				return;
			}

			if (event.key === 'End' && !dropdown.hidden && currentResults.length) {
				event.preventDefault();
				setActiveResult(currentResults.length - 1);
				return;
			}

			if (event.key === 'Enter') {
				event.preventDefault();
				if (activeIndex >= 0) {
					openCurrentResult();
				} else {
					submitSearch();
				}
				return;
			}

			if (event.key === 'Escape') {
				if (!dropdown.hidden) {
					event.preventDefault();
					event.stopPropagation();
					closeDropdown();
					return;
				}

				if (isHeader && searchPanel?.classList.contains('is-open')) {
					event.preventDefault();
					event.stopPropagation();
					closeSearchPanel({ restoreFocus: true });
				}
			}
		});

		clearButton?.addEventListener('click', () => {
			resetSearch();
			if (isPage && window.history?.pushState) {
				window.history.pushState({ q: '' }, '', 'search.html');
			}
			input.focus();
		});

		if (isPage) {
			const applyQueryFromUrl = () => {
				const params = new URLSearchParams(window.location.search);
				input.value = params.get('q') || '';
				runSearch({ live: false, page: true });
			};

			applyQueryFromUrl();
			window.addEventListener('popstate', applyQueryFromUrl);
		}

		return resetSearch;
	}

	if (siteSearchRoots.length) {
		for (const root of siteSearchRoots) {
			const reset = initSiteSearch(root);
			if (root.dataset.searchContext === 'header') {
				resetHeaderSearch = reset;
			}
		}
	}

	if (servicesToggle && servicesMenu) {
		servicesToggle.addEventListener('keydown', e => {
			handleToggleKey(e, toggleServicesDropdown);
		});
		servicesToggle.addEventListener('click', e => {
			e.stopPropagation();
			toggleServicesDropdown();
		});
		servicesMenu.addEventListener('click', e => {
			e.stopPropagation();
		});
		qsa('a[href]', servicesMenu).forEach(link => {
			link.addEventListener('click', () => {
				if (link.classList.contains('modal--open')) return;
				closeServicesDropdown();
			});
		});
	}

	if (aboutToggle && aboutMenu) {
		aboutToggle.addEventListener('keydown', e => {
			handleToggleKey(e, toggleAboutDropdown);
		});
		aboutToggle.addEventListener('click', e => {
			e.stopPropagation();
			toggleAboutDropdown();
		});
		aboutMenu.addEventListener('click', e => {
			e.stopPropagation();
		});
		qsa('a[href]', aboutMenu).forEach(link => {
			link.addEventListener('click', () => {
				closeAboutDropdown();
			});
		});
	}

	if (searchToggle && searchPanel) {
		searchToggle.addEventListener('keydown', e => {
			handleToggleKey(e, toggleSearchPanel);
		});
		searchToggle.addEventListener('click', e => {
			e.stopPropagation();
			toggleSearchPanel();
		});
		searchPanel.addEventListener('click', e => {
			e.stopPropagation();
		});
		searchClose?.addEventListener('click', () => {
			closeSearchPanel({ restoreFocus: true });
		});
	}

	if (burgerMenu && mobileNavigation) {
		burgerMenu.addEventListener('keydown', e => {
			handleToggleKey(e, () => {
				if (isMobileNavigationOpen) {
					closeMobileNavigation();
				} else {
					openMobileNavigation();
				}
			});
		});
		burgerMenu.addEventListener('click', e => {
			e.stopPropagation();
			if (isMobileNavigationOpen) {
				closeMobileNavigation();
			} else {
				openMobileNavigation();
			}
		});
		mobileNavigation.addEventListener('click', e => {
			e.stopPropagation();
		});
		mobileNavigationOverlay?.addEventListener('click', () => {
			closeMobileNavigation();
		});
	}

	mobileServicesToggle?.addEventListener('click', e => {
		e.preventDefault();
		toggleMobileServices();
	});
	mobileServicesToggle?.addEventListener('keydown', e => {
		handleToggleKey(e, toggleMobileServices);
	});

	mobileAboutToggle?.addEventListener('click', e => {
		e.preventDefault();
		toggleMobileAbout();
	});
	mobileAboutToggle?.addEventListener('keydown', e => {
		handleToggleKey(e, toggleMobileAbout);
	});

	qsa('a[href]', mobileNavigation).forEach(link => {
		link.addEventListener('click', () => {
			if (link.classList.contains('modal--open')) return;
			const href = link.getAttribute('href') || '';
			if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
				closeMobileNavigation();
			}
		});
	});

	document.addEventListener('click', e => {
		if (activeModal) return;
		if (servicesMenu?.classList.contains('is-open') && !servicesMenu.contains(e.target) && !servicesToggle?.contains(e.target)) {
			closeServicesDropdown();
		}
		if (aboutMenu?.classList.contains('is-open') && !aboutMenu.contains(e.target) && !aboutToggle?.contains(e.target)) {
			closeAboutDropdown();
		}
		if (searchPanel?.classList.contains('is-open') && !searchPanel.contains(e.target) && !searchToggle?.contains(e.target)) {
			closeSearchPanel();
		}
	});

	document.addEventListener('keydown', e => {
		if (activeModal) return;
		if (e.key === 'Tab') {
			trapMobileNavigationFocus(e);
			return;
		}
		if (e.key !== 'Escape') return;

		if (isMobileNavigationOpen) {
			e.preventDefault();
			closeMobileNavigation();
			return;
		}
		if (searchPanel?.classList.contains('is-open')) {
			e.preventDefault();
			closeSearchPanel({ restoreFocus: true });
			return;
		}
		if (aboutMenu?.classList.contains('is-open')) {
			e.preventDefault();
			closeAboutDropdown({ restoreFocus: true });
			return;
		}
		if (servicesMenu?.classList.contains('is-open')) {
			e.preventDefault();
			closeServicesDropdown();
		}
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth >= 1200) {
			closeMobileNavigation({ restoreScroll: false });
		} else {
			closeServicesDropdown();
			closeAboutDropdown();
		}
		if (mobileServicesList?.classList.contains('is-open')) {
			mobileServicesList.style.maxHeight = `${mobileServicesList.scrollHeight}px`;
		}
		if (mobileAboutList?.classList.contains('is-open')) {
			mobileAboutList.style.maxHeight = `${mobileAboutList.scrollHeight}px`;
		}
	});
	// Input Name Validation
	const fioInputs = document.querySelectorAll('input[name="fio"], input[name="fio1"]');
	fioInputs.forEach(input => {
		if (input.closest('[data-development-contact-form], [data-modal-contact-form], [data-brief-form]')) return;
		input.addEventListener('keyup', () => {
			input.value = input.value.replace(/http|https|url|www|\.net|\.ru|\.com|[0-9]/gi, '');
		});
	});
	// Phone Input Mask
	const phoneInputs = document.querySelectorAll('.wpcf7-tel');
	const applyPhoneMask = (e) => {
		const el = e.target;
		if (el.closest('[data-development-contact-form], [data-modal-contact-form], [data-brief-form]')) return;
		const clearVal = el.dataset.phoneClear;
		const pattern = el.dataset.phonePattern || '+_(___) ___-__-__';
		const def = pattern.replace(/\D/g, '');
		let val = el.value.replace(/\D/g, '');
		if (clearVal !== 'false' && e.type === 'blur' && val.length < pattern.match(/[\_\d]/g).length) {
				el.value = '';
				return;
		}
		if (def.length >= val.length) val = def;
		let i = 0;
		el.value = pattern.replace(/./g, a => /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? '' : a);
	};
	phoneInputs.forEach(input => ['input', 'blur', 'focus'].forEach(ev => input.addEventListener(ev, applyPhoneMask)));
	const scopedPhoneMaskPattern = '+_ (___) ___ __-__';
	const scopedPhoneMaxDigits = 11;
	const getScopedPhoneDigits = (value = '', limit = scopedPhoneMaxDigits) => String(value).replace(/\D/g, '').slice(0, limit);
	const getScopedPhoneDigitCount = (value = '') => String(value).replace(/\D/g, '').length;
	const formatScopedPhoneDigits = (value = '') => {
		const digits = getScopedPhoneDigits(value);
		if (!digits) return '';
		let digitIndex = 0;
		let pendingChars = '';
		let formattedValue = '';

		for (const char of scopedPhoneMaskPattern) {
			if (char === '_') {
				if (digitIndex >= digits.length) break;
				formattedValue += pendingChars + digits[digitIndex];
				pendingChars = '';
				digitIndex += 1;
			} else {
				pendingChars += char;
			}
		}
		return formattedValue;
	};
	const getScopedPhoneCaretPosition = (value, digitsBeforeCaret) => {
		if (!digitsBeforeCaret) return 0;
		let digitCount = 0;
		for (let index = 0; index < value.length; index += 1) {
			if (/\d/.test(value[index])) {
				digitCount += 1;
				if (digitCount === digitsBeforeCaret) return index + 1;
			}
		}
		return value.length;
	};
	const initScopedPhoneMask = (input, onInput = () => {}) => {
		if (!input) return () => {};
		let clearOnNextInput = false;
		const applyMask = () => {
			const selectionStart = input.selectionStart ?? input.value.length;
			const digitsBeforeCaret = Math.min(getScopedPhoneDigitCount(input.value.slice(0, selectionStart)), scopedPhoneMaxDigits);
			const digits = getScopedPhoneDigits(input.value);

			if (clearOnNextInput || !digits) {
				clearOnNextInput = false;
				input.value = '';
				if (document.activeElement === input && typeof input.setSelectionRange === 'function') {
					input.setSelectionRange(0, 0);
				}
				return;
			}

			clearOnNextInput = false;
			const formattedValue = formatScopedPhoneDigits(digits);
			input.value = formattedValue;

			if (document.activeElement === input && typeof input.setSelectionRange === 'function') {
				const caretPosition = getScopedPhoneCaretPosition(formattedValue, Math.min(digitsBeforeCaret, digits.length));
				input.setSelectionRange(caretPosition, caretPosition);
			}
		};

		input.addEventListener('beforeinput', (event) => {
			const inputType = event.inputType || '';
			if (!inputType.startsWith('delete')) {
				clearOnNextInput = false;
				return;
			}

			const currentDigits = getScopedPhoneDigitCount(input.value);
			const selectionStart = input.selectionStart ?? input.value.length;
			const selectionEnd = input.selectionEnd ?? selectionStart;
			const selectedDigits = getScopedPhoneDigitCount(input.value.slice(selectionStart, selectionEnd));
			clearOnNextInput = Boolean(currentDigits && selectedDigits >= currentDigits);
		});
		input.addEventListener('keydown', (event) => {
			if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'a') return;
			event.preventDefault();
			if (typeof input.setSelectionRange === 'function') {
				input.setSelectionRange(0, input.value.length);
			}
		});
		input.addEventListener('input', () => {
			applyMask();
			onInput(input);
		});
		input.addEventListener('change', applyMask);
		return applyMask;
	};
	// Form Checkboxes
	const setupCheckbox = (checkboxId, buttonSelector) => {
		const checkbox = document.getElementById(checkboxId);
		const button = document.querySelector(buttonSelector);
		if (checkbox && button) {
			button.setAttribute('disabled', 'disabled');
			checkbox.addEventListener('change', () => {
				button.toggleAttribute('disabled', !checkbox.checked);
			});
		}
	};
	setupCheckbox('check1', '.main--contacts__left form .wpcf7-submit');
	const getCf7EventForm = (e) => {
		const targetForm = e.target?.closest?.('form');
		if (targetForm) return targetForm;
		const unit = e.detail?.unitTag ? document.getElementById(e.detail.unitTag) : null;
		if (unit?.matches?.('form')) return unit;
		return unit?.querySelector?.('form') || null;
	};
	// Project Brief Form
	const briefForm = document.querySelector('[data-brief-form]');
	if (briefForm) {
		const BRIEF_DRAFT_KEY = 'maratProjectBriefDraftV1';
		const formStatus = briefForm.querySelector('[data-brief-status]');
		const errorSummary = briefForm.querySelector('#brief-error-summary');
		const errorSummaryList = briefForm.querySelector('[data-brief-error-summary-list]');
		const submitButton = briefForm.querySelector('.wpcf7-submit');
		const submitText = submitButton?.querySelector('span');
		const defaultSubmitText = submitText?.textContent || '';
		const fileInput = briefForm.querySelector('#brief-project-files');
		const fileList = briefForm.querySelector('[data-brief-files-list]');
		const fields = {
			businessDescription: briefForm.querySelector('#brief-business-description'),
			projectGoal: briefForm.querySelector('#brief-project-goal'),
			clientName: briefForm.querySelector('#brief-client-name'),
			contactPhone: briefForm.querySelector('#brief-client-phone'),
			contactEmail: briefForm.querySelector('#brief-client-email'),
			contactTelegram: briefForm.querySelector('#brief-client-telegram'),
			privacyConsent: briefForm.querySelector('#brief-privacy-consent'),
		};
		const contactFieldByTarget = {
			'contact-phone': fields.contactPhone,
			'contact-email': fields.contactEmail,
			'contact-telegram': fields.contactTelegram,
		};
		let isBriefLoading = false;
		let draftTimer = null;

		const hasBriefForm7Context = () => {
			const hasCf7Api = typeof window.wpcf7 === 'object' && typeof window.wpcf7.submit === 'function';
			const hasCf7Unit = Boolean(briefForm.querySelector('input[name="_wpcf7"], input[name="_wpcf7_unit_tag"]'));
			return hasCf7Api && hasCf7Unit;
		};
		const setStatus = (message = '', type = '') => {
			if (!formStatus) return;
			formStatus.textContent = message;
			formStatus.dataset.status = type;
		};
		const setLoading = (isLoading) => {
			isBriefLoading = Boolean(isLoading);
			briefForm.setAttribute('aria-busy', isBriefLoading ? 'true' : 'false');
			if (submitButton) {
				submitButton.toggleAttribute('disabled', isBriefLoading);
				submitButton.classList.toggle('button--loading', isBriefLoading);
				submitButton.setAttribute('aria-busy', isBriefLoading ? 'true' : 'false');
			}
			if (submitText) {
				submitText.textContent = isBriefLoading ? 'Отправляю...' : defaultSubmitText;
			}
		};
		const getErrorId = (field) => {
			const describedBy = field?.getAttribute('aria-describedby') || '';
			return describedBy.split(/\s+/).find(id => id.endsWith('-error')) || '';
		};
		const getErrorElement = (id) => id ? document.getElementById(id) : null;
		const setFieldError = (field, message = '') => {
			if (!field) return;
			const error = getErrorElement(getErrorId(field));
			field.setAttribute('aria-invalid', message ? 'true' : 'false');
			field.closest('.brief-field, .brief-form__consent')?.classList.toggle('brief-form__field--error', Boolean(message));
			if (error) {
				error.textContent = message;
			}
		};
		const getGroupInputs = (name) => Array.from(briefForm.querySelectorAll(`input[name="${name}"]`));
		const getCheckedGroupInput = (name) => getGroupInputs(name).find(input => input.checked) || null;
		const setGroupError = (name, errorId, message = '') => {
			getGroupInputs(name).forEach(input => {
				input.setAttribute('aria-invalid', message ? 'true' : 'false');
			});
			const error = getErrorElement(errorId);
			if (error) {
				error.textContent = message;
			}
		};
		const hideErrorSummary = () => {
			if (!errorSummary || !errorSummaryList) return;
			errorSummary.hidden = true;
			errorSummaryList.textContent = '';
		};
		const showErrorSummary = (errors) => {
			if (!errorSummary || !errorSummaryList) return;
			errorSummaryList.textContent = '';
			errors.forEach(({ target, label, message }) => {
				const item = document.createElement('li');
				const link = document.createElement('a');
				link.href = target?.id ? `#${target.id}` : '#brief-form-title';
				link.textContent = `${label}: ${message}`;
				item.append(link);
				errorSummaryList.append(item);
			});
			errorSummary.hidden = false;
			focusAfterPaint(errorSummary);
		};
		const clearAllErrors = () => {
			briefForm.querySelectorAll('[aria-invalid="true"]').forEach(field => {
				field.setAttribute('aria-invalid', 'false');
			});
			briefForm.querySelectorAll('.brief-form__error').forEach(error => {
				error.textContent = '';
			});
			briefForm.querySelectorAll('.brief-form__field--error').forEach(field => {
				field.classList.remove('brief-form__field--error');
			});
			hideErrorSummary();
		};
		const updateConditional = (targetName, isVisible) => {
			briefForm.querySelectorAll(`[data-brief-conditional="${targetName}"]`).forEach(block => {
				block.hidden = !isVisible;
				block.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
			});
		};
		const updateProjectTypeOther = () => {
			const selected = getCheckedGroupInput('project_type');
			updateConditional('project-type-other', selected?.dataset.briefToggle === 'project-type-other');
		};
		const updateCurrentSiteFields = () => {
			const selected = getCheckedGroupInput('current_state');
			updateConditional('current-site', selected?.dataset.briefToggle === 'current-site');
		};
		const updateContactFields = () => {
			const selected = getCheckedGroupInput('contact_channel');
			const activeTarget = selected?.dataset.briefToggle || '';
			Object.entries(contactFieldByTarget).forEach(([target, field]) => {
				const isActive = target === activeTarget;
				updateConditional(target, isActive);
				if (field) {
					field.toggleAttribute('required', isActive);
					if (isActive) {
						field.setAttribute('aria-required', 'true');
					} else {
						field.removeAttribute('aria-required');
						setFieldError(field);
					}
				}
			});
		};
		const updateConditionals = () => {
			updateProjectTypeOther();
			updateCurrentSiteFields();
			updateContactFields();
		};
		const updateFileList = () => {
			if (!fileList) return;
			const files = Array.from(fileInput?.files || []);
			fileList.textContent = '';
			if (!files.length) {
				fileList.textContent = 'Файлы не выбраны.';
				return;
			}
			const count = document.createElement('p');
			count.textContent = `Выбрано файлов: ${files.length}`;
			const list = document.createElement('ul');
			files.forEach((file, index) => {
				const item = document.createElement('li');
				const name = document.createElement('span');
				const removeButton = document.createElement('button');
				name.className = 'brief-file__name';
				name.textContent = file.name;
				removeButton.className = 'brief-file__remove';
				removeButton.type = 'button';
				removeButton.textContent = 'Удалить';
				removeButton.setAttribute('aria-label', `Удалить файл ${file.name}`);
				removeButton.addEventListener('click', () => {
					removeFileAt(index);
				});
				item.append(name, removeButton);
				list.append(item);
			});
			fileList.append(count, list);
		};
		const setFileInputFiles = (files) => {
			if (!fileInput || typeof DataTransfer !== 'function') return false;
			const transfer = new DataTransfer();
			files.forEach(file => {
				transfer.items.add(file);
			});
			fileInput.files = transfer.files;
			return true;
		};
		const removeFileAt = (index) => {
			const files = Array.from(fileInput?.files || []);
			if (!files[index]) return;
			files.splice(index, 1);
			if (!setFileInputFiles(files)) {
				setStatus('Не удалось удалить файл в этом браузере. Выберите файлы заново.', 'error');
				return;
			}
			fileInput.dispatchEvent(new Event('change', { bubbles: true }));
		};
		const getDraftControls = () => Array.from(briefForm.querySelectorAll('input, select, textarea')).filter((field) => {
			const type = (field.type || '').toLowerCase();
			return field.name && !field.name.startsWith('_wpcf7') && !['file', 'submit', 'button', 'reset'].includes(type);
		});
		const readDraft = () => {
			try {
				const raw = sessionStorage.getItem(BRIEF_DRAFT_KEY);
				return raw ? JSON.parse(raw) : null;
			} catch (e) {
				return null;
			}
		};
		const writeDraft = () => {
			const data = {};
			getDraftControls().forEach(field => {
				const type = (field.type || '').toLowerCase();
				if (type === 'checkbox') {
					if (!Array.isArray(data[field.name])) {
						data[field.name] = [];
					}
					if (field.checked) {
						data[field.name].push(field.value);
					}
					return;
				}
				if (type === 'radio') {
					if (!Object.prototype.hasOwnProperty.call(data, field.name)) {
						data[field.name] = '';
					}
					if (field.checked) {
						data[field.name] = field.value;
					}
					return;
				}
				data[field.name] = field.value;
			});
			try {
				sessionStorage.setItem(BRIEF_DRAFT_KEY, JSON.stringify(data));
			} catch (e) {}
		};
		const scheduleDraftSave = () => {
			window.clearTimeout(draftTimer);
			draftTimer = window.setTimeout(writeDraft, 250);
		};
		const restoreDraft = () => {
			const draft = readDraft();
			if (!draft || typeof draft !== 'object') return;
			getDraftControls().forEach(field => {
				if (!Object.prototype.hasOwnProperty.call(draft, field.name)) return;
				const type = (field.type || '').toLowerCase();
				if (type === 'checkbox') {
					field.checked = Array.isArray(draft[field.name]) && draft[field.name].includes(field.value);
					return;
				}
				if (type === 'radio') {
					field.checked = draft[field.name] === field.value;
					return;
				}
				field.value = draft[field.name] || '';
			});
		};
		const clearDraft = () => {
			try {
				sessionStorage.removeItem(BRIEF_DRAFT_KEY);
			} catch (e) {}
		};
		const applyBriefPhoneMask = initScopedPhoneMask(fields.contactPhone, () => {
			setFieldError(fields.contactPhone);
			hideErrorSummary();
		});
		const validateBriefForm = () => {
			clearAllErrors();
			setStatus('');
			updateConditionals();
			applyBriefPhoneMask();
			const errors = [];
			const pushFieldError = (field, label, message) => {
				setFieldError(field, message);
				errors.push({ target: field, label, message });
			};
			const projectType = getCheckedGroupInput('project_type');
			const contactChannel = getCheckedGroupInput('contact_channel');

			if (!projectType) {
				const target = getGroupInputs('project_type')[0];
				const message = 'Выберите, что нужно сделать.';
				setGroupError('project_type', 'brief-project-type-error', message);
				errors.push({ target, label: 'Что нужно сделать', message });
			}
			if (!fields.businessDescription?.value.trim()) {
				pushFieldError(fields.businessDescription, 'Чем занимается проект или бизнес', 'Заполните это поле.');
			}
			if (!fields.projectGoal?.value.trim()) {
				pushFieldError(fields.projectGoal, 'Какую задачу должен решить проект', 'Заполните это поле.');
			}
			if (!fields.clientName?.value.trim()) {
				pushFieldError(fields.clientName, 'Как к вам обращаться', 'Заполните это поле.');
			}
			if (!contactChannel) {
				const target = getGroupInputs('contact_channel')[0];
				const message = 'Выберите удобный канал связи.';
				setGroupError('contact_channel', 'brief-contact-channel-error', message);
				errors.push({ target, label: 'Удобный канал связи', message });
			} else {
				const activeContactField = contactFieldByTarget[contactChannel.dataset.briefToggle || ''];
				if (activeContactField === fields.contactPhone) {
					const phoneDigits = getScopedPhoneDigitCount(fields.contactPhone?.value || '');
					if (!phoneDigits) {
						pushFieldError(fields.contactPhone, 'Телефон', 'Укажите номер телефона.');
					} else if (phoneDigits !== scopedPhoneMaxDigits) {
						pushFieldError(fields.contactPhone, 'Телефон', 'Введите номер телефона полностью.');
					}
				}
				if (activeContactField === fields.contactEmail) {
					const emailValue = fields.contactEmail?.value.trim() || '';
					if (!emailValue) {
						pushFieldError(fields.contactEmail, 'E-mail', 'Укажите адрес электронной почты.');
					} else if (fields.contactEmail && !fields.contactEmail.validity.valid) {
						pushFieldError(fields.contactEmail, 'E-mail', 'Проверьте адрес электронной почты.');
					}
				}
				if (activeContactField === fields.contactTelegram && !fields.contactTelegram?.value.trim()) {
					pushFieldError(fields.contactTelegram, 'Telegram', 'Укажите Telegram.');
				}
			}
			if (fields.privacyConsent && !fields.privacyConsent.checked) {
				pushFieldError(fields.privacyConsent, 'Согласие на обработку данных', 'Подтвердите согласие.');
			}

			if (errors.length) {
				showErrorSummary(errors);
				return false;
			}
			hideErrorSummary();
			return true;
		};

		restoreDraft();
		updateConditionals();
		applyBriefPhoneMask();
		updateFileList();

		getGroupInputs('project_type').forEach(input => {
			input.addEventListener('change', () => {
				setGroupError('project_type', 'brief-project-type-error');
				updateProjectTypeOther();
				hideErrorSummary();
				scheduleDraftSave();
			});
		});
		getGroupInputs('current_state').forEach(input => {
			input.addEventListener('change', () => {
				updateCurrentSiteFields();
				hideErrorSummary();
				scheduleDraftSave();
			});
		});
		getGroupInputs('contact_channel').forEach(input => {
			input.addEventListener('change', () => {
				setGroupError('contact_channel', 'brief-contact-channel-error');
				updateContactFields();
				hideErrorSummary();
				scheduleDraftSave();
			});
		});
		getDraftControls().forEach(field => {
			const type = (field.type || '').toLowerCase();
			const eventNames = ['checkbox', 'radio'].includes(type) ? ['change'] : ['input', 'change'];
			eventNames.forEach(eventName => {
				field.addEventListener(eventName, () => {
					setFieldError(field);
					hideErrorSummary();
					scheduleDraftSave();
				});
			});
		});
		fileInput?.addEventListener('change', () => {
			updateFileList();
			setFieldError(fileInput);
		});

		briefForm.addEventListener('submit', (e) => {
			if (isBriefLoading || submitButton?.disabled) {
				e.preventDefault();
				return;
			}
			if (!validateBriefForm()) {
				e.preventDefault();
				return;
			}
			if (!hasBriefForm7Context()) {
				e.preventDefault();
				setLoading(false);
				setStatus('Форма готова к подключению. Отправка будет доступна после интеграции с WordPress', 'info');
				formStatus?.focus();
				return;
			}
			setLoading(true);
		});

		document.addEventListener('wpcf7mailsent', (e) => {
			const eventForm = getCf7EventForm(e);
			if (eventForm !== briefForm) return;
			briefForm.querySelector('.cf7sg-response-output')?.style.setProperty('display', 'none');
			clearDraft();
			clearAllErrors();
			briefForm.reset();
			updateConditionals();
			applyBriefPhoneMask();
			updateFileList();
			setLoading(false);
			setStatus('Бриф отправлен. Спасибо - данные проекта получены', 'success');
			formStatus?.focus();
		});

		const handleBriefCf7Failure = (message) => (e) => {
			const eventForm = getCf7EventForm(e);
			if (eventForm !== briefForm) return;
			setLoading(false);
			setStatus(message, 'error');
			formStatus?.focus();
		};

		document.addEventListener('wpcf7invalid', handleBriefCf7Failure('Проверьте выделенные поля.'));
		document.addEventListener('wpcf7mailfailed', handleBriefCf7Failure('Не удалось отправить бриф. Попробуйте ещё раз или свяжитесь со мной другим способом.'));
		document.addEventListener('wpcf7spam', handleBriefCf7Failure('Бриф не отправлен. Проверьте данные и попробуйте ещё раз.'));
	}
	// Modal Contact Form
	const modalContactForms = document.querySelectorAll('[data-modal-contact-form]');
	const modalContactFormState = new Map();
	if (modalContactForms.length) {
		const hasModalContactForm7Context = (form) => {
			const hasCf7Api = typeof window.wpcf7 === 'object' && typeof window.wpcf7.submit === 'function';
			const hasCf7Unit = Boolean(form.querySelector('input[name="_wpcf7"], input[name="_wpcf7_unit_tag"]'));
			return hasCf7Api && hasCf7Unit;
		};
		const createModalContactFormState = (form) => {
			const formStatus = form.querySelector('.form-status');
			const submitButton = form.querySelector('.wpcf7-submit');
			const submitText = submitButton?.querySelector('span');
			const defaultSubmitText = submitText?.textContent || '';
			const fields = {
				name: form.querySelector('#modal-contact-name'),
				phone: form.querySelector('#modal-contact-phone'),
				email: form.querySelector('#modal-contact-email'),
				consent: form.querySelector('#modal-contact-consent'),
			};

			const getErrorElement = (id) => form.querySelector(`#${id}`);
			const setStatus = (message = '', type = '') => {
				if (!formStatus) return;
				formStatus.textContent = message;
				formStatus.dataset.status = type;
			};
			const setLoading = (isLoading) => {
				form.setAttribute('aria-busy', isLoading ? 'true' : 'false');
				if (submitButton) {
					submitButton.toggleAttribute('disabled', isLoading);
					submitButton.classList.toggle('button--loading', isLoading);
					submitButton.setAttribute('aria-busy', isLoading ? 'true' : 'false');
				}
				if (submitText) {
					submitText.textContent = isLoading ? 'Отправляю…' : defaultSubmitText;
				}
			};
			const setFieldError = (field, errorId, message = '') => {
				if (!field) return;
				const error = getErrorElement(errorId);
				field.setAttribute('aria-invalid', message ? 'true' : 'false');
				field.closest('.form-field')?.classList.toggle('form-field--error', Boolean(message));
				if (error) {
					error.textContent = message;
				}
			};
			const clearErrors = () => {
				setFieldError(fields.name, 'modal-contact-name-error');
				setFieldError(fields.phone, 'modal-contact-phone-error');
				setFieldError(fields.email, 'modal-contact-email-error');
				setFieldError(fields.consent, 'modal-contact-consent-error');
				form.querySelectorAll('.form-field__error').forEach(error => {
					error.textContent = '';
				});
			};
			const applyModalPhoneMask = initScopedPhoneMask(fields.phone, () => {
				setFieldError(fields.phone, 'modal-contact-phone-error');
			});
			const validate = () => {
				clearErrors();
				setStatus('');
				applyModalPhoneMask();
				const phoneDigits = getScopedPhoneDigitCount(fields.phone?.value || '');
				const emailValue = fields.email?.value.trim() || '';
				const errors = [];

				if (!phoneDigits) {
					setFieldError(fields.phone, 'modal-contact-phone-error', 'Укажите номер телефона.');
					errors.push(fields.phone);
				} else if (phoneDigits !== scopedPhoneMaxDigits) {
					setFieldError(fields.phone, 'modal-contact-phone-error', 'Введите номер телефона полностью.');
					errors.push(fields.phone);
				}

				if (emailValue && fields.email && !fields.email.validity.valid) {
					setFieldError(fields.email, 'modal-contact-email-error', 'Проверьте адрес электронной почты.');
					errors.push(fields.email);
				}

				if (fields.consent && !fields.consent.checked) {
					setFieldError(fields.consent, 'modal-contact-consent-error', 'Подтвердите согласие на обработку данных.');
					errors.push(fields.consent);
				}

				if (errors.length) {
					setStatus('Проверьте выделенные поля.', 'error');
					errors[0]?.focus();
					return false;
				}
				return true;
			};

			fields.name?.addEventListener('input', () => {
				fields.name.value = fields.name.value.replace(/http|https|url|www|\.net|\.ru|\.com|[0-9]/gi, '');
				setFieldError(fields.name, 'modal-contact-name-error');
			});
			fields.email?.addEventListener('input', () => {
				setFieldError(fields.email, 'modal-contact-email-error');
			});
			fields.consent?.addEventListener('change', () => {
				setFieldError(fields.consent, 'modal-contact-consent-error');
			});
			form.addEventListener('submit', (e) => {
				if (submitButton?.disabled) {
					e.preventDefault();
					return;
				}
				if (!validate()) {
					e.preventDefault();
					return;
				}
				if (!hasModalContactForm7Context(form)) {
					e.preventDefault();
					setLoading(false);
					setStatus('Форма подготовлена к отправке. Фактическая отправка будет подключена при интеграции с WordPress.', 'info');
					formStatus?.focus();
					return;
				}
				setLoading(true);
			});

			return {
				form,
				formStatus,
				setStatus,
				setLoading,
				clearErrors,
				applyModalPhoneMask,
			};
		};

		modalContactForms.forEach(form => {
			modalContactFormState.set(form, createModalContactFormState(form));
		});

		document.addEventListener('wpcf7mailsent', (e) => {
			const form = getCf7EventForm(e);
			const state = modalContactFormState.get(form);
			if (!state) return;
			form.querySelector('.cf7sg-response-output')?.style.setProperty('display', 'none');
			state.clearErrors();
			form.reset();
			state.applyModalPhoneMask();
			state.setLoading(false);
			state.setStatus('');
			const sourceModal = form.closest('.modal');
			if (modalSend && sourceModal && activeModal === sourceModal) {
				closeModal(sourceModal, { unlockScroll: false, restoreFocus: false });
				openModal(modalSend);
			}
		});

		const handleModalCf7Failure = (message) => (e) => {
			const form = getCf7EventForm(e);
			const state = modalContactFormState.get(form);
			if (!state) return;
			state.setLoading(false);
			state.setStatus(message, 'error');
			state.formStatus?.focus();
		};

		document.addEventListener('wpcf7invalid', handleModalCf7Failure('Проверьте выделенные поля.'));
		document.addEventListener('wpcf7mailfailed', handleModalCf7Failure('Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь со мной другим способом.'));
		document.addEventListener('wpcf7spam', handleModalCf7Failure('Заявка не отправлена. Проверьте данные и попробуйте ещё раз.'));
	}
	// Development Contact Form
	const developmentContactForm = document.querySelector('[data-development-contact-form]');
	if (developmentContactForm) {
		const formStatus = developmentContactForm.querySelector('.form-status');
		const submitButton = developmentContactForm.querySelector('.wpcf7-submit');
		const submitText = submitButton?.querySelector('span');
		const defaultSubmitText = submitText?.textContent || '';
		const fields = {
			phone: developmentContactForm.querySelector('#development-contact-phone'),
			email: developmentContactForm.querySelector('#development-contact-email'),
			consent: developmentContactForm.querySelector('#development-contact-consent'),
		};

		const hasContactForm7Context = () => {
			const hasCf7Api = typeof window.wpcf7 === 'object' && typeof window.wpcf7.submit === 'function';
			const hasCf7Unit = Boolean(developmentContactForm.querySelector('input[name="_wpcf7"], input[name="_wpcf7_unit_tag"]'));
			return hasCf7Api && hasCf7Unit;
		};

		const setStatus = (message = '', type = '') => {
			if (!formStatus) return;
			formStatus.textContent = message;
			formStatus.dataset.status = type;
		};

		const setLoading = (isLoading) => {
			developmentContactForm.setAttribute('aria-busy', isLoading ? 'true' : 'false');
			if (submitButton) {
				submitButton.toggleAttribute('disabled', isLoading);
				submitButton.classList.toggle('button--loading', isLoading);
				submitButton.setAttribute('aria-busy', isLoading ? 'true' : 'false');
			}
			if (submitText) {
				submitText.textContent = isLoading ? 'Отправляю…' : defaultSubmitText;
			}
		};

		const getErrorElement = (id) => document.getElementById(id);

		const setFieldError = (field, errorId, message = '') => {
			if (!field) return;
			const error = getErrorElement(errorId);
			field.setAttribute('aria-invalid', message ? 'true' : 'false');
			field.closest('.form-field')?.classList.toggle('form-field--error', Boolean(message));
			if (error) {
				error.textContent = message;
			}
		};

		const setChannelError = (message = '') => {
			const error = getErrorElement('development-contact-channel-error');
			if (error) {
				error.textContent = message;
			}
			fields.phone?.setAttribute('aria-invalid', message ? 'true' : 'false');
			fields.email?.setAttribute('aria-invalid', message ? 'true' : 'false');
			fields.phone?.closest('.form-field')?.classList.toggle('form-field--error', Boolean(message));
			fields.email?.closest('.form-field')?.classList.toggle('form-field--error', Boolean(message));
		};

		const clearErrors = () => {
			setChannelError('');
			setFieldError(fields.phone, 'development-contact-phone-error');
			setFieldError(fields.email, 'development-contact-email-error');
			setFieldError(fields.consent, 'development-contact-consent-error');
			developmentContactForm.querySelectorAll('.form-field__error').forEach(error => {
				error.textContent = '';
			});
		};
		const clearDevelopmentContactErrors = () => {
			setChannelError('');
			setFieldError(fields.phone, 'development-contact-phone-error');
			setFieldError(fields.email, 'development-contact-email-error');
		};
		const applyDevelopmentPhoneMask = initScopedPhoneMask(fields.phone, clearDevelopmentContactErrors);

		const validateDevelopmentContactForm = () => {
			clearErrors();
			setStatus('');
			applyDevelopmentPhoneMask();
			const phoneValue = fields.phone?.value.trim() || '';
			const emailValue = fields.email?.value.trim() || '';
			const errors = [];

			if (!phoneValue && !emailValue) {
				setChannelError('Укажите телефон или e-mail.');
				errors.push(fields.phone);
			}

			if (phoneValue) {
				const digitsCount = phoneValue.replace(/\D/g, '').length;
				if (digitsCount !== scopedPhoneMaxDigits) {
					setFieldError(fields.phone, 'development-contact-phone-error', 'Введите номер телефона полностью.');
					errors.push(fields.phone);
				}
			}

			if (emailValue && fields.email && !fields.email.validity.valid) {
				setFieldError(fields.email, 'development-contact-email-error', 'Проверьте адрес электронной почты.');
				errors.push(fields.email);
			}

			if (fields.consent && !fields.consent.checked) {
				setFieldError(fields.consent, 'development-contact-consent-error', 'Подтвердите согласие на обработку данных.');
				errors.push(fields.consent);
			}

			if (errors.length) {
				setStatus('Проверьте выделенные поля.', 'error');
				errors[0]?.focus();
				return false;
			}
			return true;
		};

		['input', 'change'].forEach(eventName => {
			fields.email?.addEventListener(eventName, () => {
				clearDevelopmentContactErrors();
			});
			fields.consent?.addEventListener(eventName, () => {
				setFieldError(fields.consent, 'development-contact-consent-error');
			});
		});

		developmentContactForm.addEventListener('submit', (e) => {
			if (submitButton?.disabled) {
				e.preventDefault();
				return;
			}
			if (!validateDevelopmentContactForm()) {
				e.preventDefault();
				return;
			}
			if (!hasContactForm7Context()) {
				e.preventDefault();
				setLoading(false);
				setStatus('Форма подготовлена к отправке. Фактическая отправка будет подключена при интеграции с WordPress.', 'info');
				return;
			}
			setLoading(true);
		});

		document.addEventListener('wpcf7mailsent', (e) => {
			const eventForm = getCf7EventForm(e);
			if (eventForm !== developmentContactForm) return;
			developmentContactForm.querySelector('.cf7sg-response-output')?.style.setProperty('display', 'none');
			clearErrors();
			developmentContactForm.reset();
			setLoading(false);
			setStatus('Спасибо, задача отправлена. Я свяжусь с вами после просмотра сообщения.', 'success');
			formStatus?.focus();
		});

		const handleCf7Failure = (message) => (e) => {
			const eventForm = getCf7EventForm(e);
			if (eventForm !== developmentContactForm) return;
			setLoading(false);
			setStatus(message, 'error');
			formStatus?.focus();
		};

		document.addEventListener('wpcf7invalid', handleCf7Failure('Проверьте выделенные поля.'));
		document.addEventListener('wpcf7mailfailed', handleCf7Failure('Не удалось отправить сообщение. Попробуйте ещё раз или свяжитесь со мной другим способом.'));
		document.addEventListener('wpcf7spam', handleCf7Failure('Сообщение не отправлено. Проверьте данные и попробуйте ещё раз.'));
	}
	// Form Submission
	document.addEventListener('wpcf7mailsent', (e) => {
		const form = getCf7EventForm(e);
		if (!form) return;
		if (form?.matches?.('[data-development-contact-form], [data-modal-contact-form], [data-brief-form]')) return;
		const sourceModal = form.closest('.modal');
		if (!sourceModal || activeModal !== sourceModal) return;

		form?.querySelector('.cf7sg-response-output')?.style.setProperty('display', 'none');
		if (modalSend) {
			closeModal(sourceModal, { unlockScroll: false, restoreFocus: false });
			openModal(modalSend);
		}
		form?.querySelector('.wpcf7-submit')?.setAttribute('disabled', 'disabled');
		form?.reset();
	});

	// Footer Menu (Mobile)
	if (window.innerWidth <= 768) {
		document.querySelectorAll('.footer--menu').forEach((menu, index) => {
			const title = menu.querySelector('.h3');
			const list = menu.querySelector('.menu');
			if (title && list) {
				if (index === 0) {
					menu.classList.add('active');
					list.style.maxHeight = `${list.scrollHeight}px`;
				}
				title.addEventListener('click', () => {
					document.querySelectorAll('.footer--menu').forEach(m => {
						if (m !== menu) {
							m.classList.remove('active');
							m.querySelector('.menu').style.maxHeight = null;
						}
					});
					menu.classList.toggle('active');
					list.style.maxHeight = menu.classList.contains('active') ? `${list.scrollHeight}px` : null;
				});
			}
		});
	}

	// Portfolio Archive Filters
	const portfolioArchive = document.querySelector('[data-portfolio-archive]');
	if (portfolioArchive && portfolioArchive.dataset.portfolioInitialized !== 'true') {
		const portfolioFilters = Array.from(portfolioArchive.querySelectorAll('[data-portfolio-filter]'));
		const portfolioCards = Array.from(portfolioArchive.querySelectorAll('[data-portfolio-card]'));
		const portfolioLive = portfolioArchive.querySelector('[data-portfolio-live]');
		const portfolioFiltered = portfolioArchive.querySelector('[data-portfolio-filtered]');
		const portfolioFilteredGrid = portfolioArchive.querySelector('[data-portfolio-filtered-grid]');
		const portfolioFilteredTitle = portfolioArchive.querySelector('[data-portfolio-filtered-title]');
		const portfolioFilteredCount = portfolioArchive.querySelector('[data-portfolio-filtered-count]');
		const portfolioFeatured = portfolioArchive.querySelector('.portfolio-featured');
		const portfolioList = portfolioArchive.querySelector('.portfolio-list');
		const portfolioMidCta = portfolioArchive.querySelector('.portfolio-archive__mid-cta');

		if (portfolioFilters.length && portfolioCards.length) {
			portfolioArchive.dataset.portfolioInitialized = 'true';
			portfolioArchive.dataset.portfolioEnhanced = 'true';

			const focusableSelector = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
			const labels = portfolioFilters.reduce((acc, button) => {
				acc[button.dataset.portfolioFilter || 'all'] = button.textContent.trim();
				return acc;
			}, {});
			const cardSlots = portfolioCards.map(card => ({
				card,
				parent: card.parentNode,
				nextSibling: card.nextSibling
			}));
			const editorialSections = [portfolioFeatured, portfolioList, portfolioMidCta].filter(Boolean);

			const getPortfolioDeclension = (count, words) => {
				const lastTwo = Math.abs(count) % 100;
				const lastOne = lastTwo % 10;

				if (lastTwo > 10 && lastTwo < 20) return words[2];
				if (lastOne > 1 && lastOne < 5) return words[1];
				if (lastOne === 1) return words[0];
				return words[2];
			};

			const getProjectCountText = count => `${count} ${getPortfolioDeclension(count, ['проект', 'проекта', 'проектов'])}`;

			const setFocusableState = (root, isFocusable) => {
				const focusableElements = Array.from(root.querySelectorAll(focusableSelector));
				focusableElements.forEach(element => {
					if (isFocusable) {
						if (Object.prototype.hasOwnProperty.call(element.dataset, 'portfolioTabindex')) {
							const originalTabindex = element.dataset.portfolioTabindex;
							if (originalTabindex) {
								element.setAttribute('tabindex', originalTabindex);
							} else {
								element.removeAttribute('tabindex');
							}
							delete element.dataset.portfolioTabindex;
						}
						return;
					}

					if (!Object.prototype.hasOwnProperty.call(element.dataset, 'portfolioTabindex')) {
						element.dataset.portfolioTabindex = element.getAttribute('tabindex') || '';
					}
					element.setAttribute('tabindex', '-1');
				});
			};

			const setElementHidden = (element, isHidden) => {
				if (!element) return;

				element.hidden = isHidden;
				if (isHidden) {
					element.setAttribute('aria-hidden', 'true');
					element.setAttribute('inert', '');
					element.inert = true;
					setFocusableState(element, false);
					return;
				}

				element.removeAttribute('aria-hidden');
				element.removeAttribute('inert');
				element.inert = false;
				setFocusableState(element, true);
			};

			const updateLive = (count, filter) => {
				if (!portfolioLive) return;

				const filterLabel = labels[filter] || 'проекты';
				portfolioLive.textContent = filter === 'all'
					? `Показаны все ${count} проектов`
					: `${filterLabel}: ${getProjectCountText(count)}`;
			};

			const showCard = card => {
				card.hidden = false;
				card.removeAttribute('aria-hidden');
				card.removeAttribute('inert');
				card.inert = false;
				setFocusableState(card, true);
				card.classList.remove('is-hiding');
			};

			const hideCard = card => {
				setFocusableState(card, false);
				card.setAttribute('aria-hidden', 'true');
				card.setAttribute('inert', '');
				card.inert = true;
				card.hidden = true;
				card.classList.remove('is-hiding');
			};

			const restoreEditorialCards = () => {
				cardSlots.forEach(slot => {
					showCard(slot.card);
					if (slot.card.parentNode === slot.parent && slot.card.nextSibling === slot.nextSibling) return;

					if (slot.nextSibling && slot.nextSibling.parentNode === slot.parent) {
						slot.parent.insertBefore(slot.card, slot.nextSibling);
						return;
					}

					slot.parent.appendChild(slot.card);
				});
			};

			const updateFilteredHead = (filter, count) => {
				if (portfolioFilteredTitle) {
					portfolioFilteredTitle.textContent = labels[filter] || 'Проекты';
				}
				if (portfolioFilteredCount) {
					portfolioFilteredCount.textContent = getProjectCountText(count);
				}
				if (portfolioFilteredGrid) {
					portfolioFilteredGrid.dataset.filteredCount = String(count);
				}
			};

			const scrollActiveFilterIntoView = button => {
				if (!button || typeof button.scrollIntoView !== 'function') return;

				button.scrollIntoView({
					block: 'nearest',
					inline: 'nearest',
					behavior: reducedMotion.matches ? 'auto' : 'smooth'
				});
			};

			const applyPortfolioFilter = (requestedFilter, shouldScrollActive = false) => {
				const filter = labels[requestedFilter] ? requestedFilter : 'all';
				const isAll = filter === 'all';
				let activeButton = null;

				portfolioFilters.forEach(button => {
					const isActive = button.dataset.portfolioFilter === filter;
					button.classList.toggle('is-active', isActive);
					button.setAttribute('aria-pressed', String(isActive));
					if (isActive) {
						activeButton = button;
					}
				});

				restoreEditorialCards();

				if (isAll || !portfolioFiltered || !portfolioFilteredGrid) {
					setElementHidden(portfolioFiltered, true);
					editorialSections.forEach(section => setElementHidden(section, false));
					updateLive(portfolioCards.length, 'all');
					portfolioArchive.dataset.portfolioMode = 'all';
					delete portfolioArchive.dataset.portfolioActiveFilter;
					if (portfolioFilteredGrid) {
						portfolioFilteredGrid.removeAttribute('data-filtered-count');
					}
					if (shouldScrollActive) {
						scrollActiveFilterIntoView(activeButton);
					}
					return;
				}

				const visibleCards = portfolioCards.filter(card => {
					const categories = (card.dataset.portfolioCategory || '').split(/\s+/).filter(Boolean);
					return categories.includes(filter);
				});

				portfolioCards.forEach(card => {
					if (visibleCards.includes(card)) {
						showCard(card);
						portfolioFilteredGrid.appendChild(card);
						return;
					}
					hideCard(card);
				});

				updateFilteredHead(filter, visibleCards.length);
				setElementHidden(portfolioFiltered, false);
				editorialSections.forEach(section => setElementHidden(section, true));
				updateLive(visibleCards.length, filter);
				portfolioArchive.dataset.portfolioMode = 'filtered';
				portfolioArchive.dataset.portfolioActiveFilter = filter;

				if (shouldScrollActive) {
					scrollActiveFilterIntoView(activeButton);
				}
			};

			portfolioFilters.forEach((button, index) => {
				button.addEventListener('click', () => {
					applyPortfolioFilter(button.dataset.portfolioFilter || 'all', true);
				});

				button.addEventListener('keydown', event => {
					const currentIndex = portfolioFilters.indexOf(button);
					let nextIndex = currentIndex;

					if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
						nextIndex = (currentIndex + 1) % portfolioFilters.length;
					} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
						nextIndex = (currentIndex - 1 + portfolioFilters.length) % portfolioFilters.length;
					} else if (event.key === 'Home') {
						nextIndex = 0;
					} else if (event.key === 'End') {
						nextIndex = portfolioFilters.length - 1;
					} else {
						return;
					}

					event.preventDefault();
					portfolioFilters[nextIndex].focus();
					portfolioFilters[nextIndex].click();
				});

				button.setAttribute('type', 'button');
				if (index === 0 && !portfolioFilters.some(filter => filter.getAttribute('aria-pressed') === 'true')) {
					button.setAttribute('aria-pressed', 'true');
					button.classList.add('is-active');
				}
			});

			const initialFilter = portfolioFilters.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.portfolioFilter || 'all';
			applyPortfolioFilter(initialFilter, false);

			window.addEventListener('pageshow', () => {
				const activeFilter = portfolioFilters.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.portfolioFilter || 'all';
				applyPortfolioFilter(activeFilter, false);
			});
		}
	}

	// Home Project Logos Marquee
	const logoMarquees = document.querySelectorAll('[data-logo-marquee]');
	logoMarquees.forEach(viewport => {
		const track = viewport.querySelector('[data-logo-marquee-track]');
		const group = viewport.querySelector('[data-logo-marquee-group]');
		if (!track || !group || viewport.dataset.marqueeReady === 'true') return;

		viewport.dataset.marqueeReady = 'true';

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const speed = 32;
		const dragThreshold = 6;
		const state = {
			offset: 0,
			groupWidth: 0,
			lastTime: 0,
			hoverPaused: false,
			focusPaused: false,
			dragging: false,
			dragIntent: false,
			pointerId: null,
			startX: 0,
			startY: 0,
			startOffset: 0,
			lastX: 0,
			lastMoveTime: 0,
			velocity: 0,
			resumeAt: 0,
			suppressClick: false,
		};

		const clone = group.cloneNode(true);
		clone.setAttribute('aria-hidden', 'true');
		clone.removeAttribute('data-logo-marquee-group');
		clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
		clone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(element => {
			element.setAttribute('tabindex', '-1');
		});
		track.appendChild(clone);

		const normalizeOffset = value => {
			if (!state.groupWidth) return 0;
			const offset = value % state.groupWidth;
			return offset < 0 ? offset + state.groupWidth : offset;
		};

		const updateTransform = () => {
			if (reduceMotion.matches) {
				viewport.dataset.reducedMotion = 'true';
				track.style.transform = '';
				return;
			}

			viewport.dataset.reducedMotion = 'false';
			track.style.transform = `translate3d(${-state.offset}px, 0, 0)`;
		};

		const measure = () => {
			state.groupWidth = Math.max(group.getBoundingClientRect().width, 1);
			state.offset = normalizeOffset(state.offset);
			updateTransform();
		};

		const requestAutoplayResume = delay => {
			state.resumeAt = performance.now() + delay;
		};

		const isPaused = () => state.hoverPaused || state.focusPaused;

		const finishDrag = () => {
			if (!state.dragging) return;

			state.dragging = false;
			state.dragIntent = false;
			viewport.classList.remove('is-dragging');
			if (state.pointerId !== null && viewport.hasPointerCapture?.(state.pointerId)) {
				try {
					viewport.releasePointerCapture(state.pointerId);
				} catch (e) {}
			}
			state.pointerId = null;
			requestAutoplayResume(1200);
		};

		const animate = time => {
			if (!state.lastTime) state.lastTime = time;
			const delta = Math.min((time - state.lastTime) / 1000, .05);
			state.lastTime = time;

			if (!reduceMotion.matches && state.groupWidth) {
				if (!state.dragging && !isPaused()) {
					if (Math.abs(state.velocity) > 4) {
						state.offset = normalizeOffset(state.offset - state.velocity * delta);
						state.velocity *= Math.pow(.9, delta * 60);
					} else {
						state.velocity = 0;
					}

					if (time >= state.resumeAt) {
						state.offset = normalizeOffset(state.offset + speed * delta);
					}
				}

				updateTransform();
			}

			requestAnimationFrame(animate);
		};

		viewport.addEventListener('mouseenter', () => {
			state.hoverPaused = true;
			state.velocity = 0;
		});

		viewport.addEventListener('mouseleave', () => {
			state.hoverPaused = false;
			requestAutoplayResume(350);
		});

		viewport.addEventListener('focusin', () => {
			state.focusPaused = true;
			state.velocity = 0;
		});

		viewport.addEventListener('focusout', () => {
			if (viewport.contains(document.activeElement)) return;
			state.focusPaused = false;
			requestAutoplayResume(350);
		});

		viewport.addEventListener('pointerdown', event => {
			if (reduceMotion.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;

			state.dragging = true;
			state.dragIntent = false;
			state.pointerId = event.pointerId;
			state.startX = event.clientX;
			state.startY = event.clientY;
			state.startOffset = state.offset;
			state.lastX = event.clientX;
			state.lastMoveTime = performance.now();
			state.velocity = 0;
			state.suppressClick = false;
		});

		viewport.addEventListener('pointermove', event => {
			if (!state.dragging || state.pointerId !== event.pointerId) return;

			const deltaX = event.clientX - state.startX;
			const deltaY = event.clientY - state.startY;

			if (!state.dragIntent) {
				if (Math.abs(deltaX) < dragThreshold && Math.abs(deltaY) < dragThreshold) return;
				if (Math.abs(deltaY) > Math.abs(deltaX)) {
					finishDrag();
					return;
				}

				state.dragIntent = true;
				viewport.classList.add('is-dragging');
				try {
					viewport.setPointerCapture?.(event.pointerId);
				} catch (e) {}
			}

			event.preventDefault();
			state.offset = normalizeOffset(state.startOffset - deltaX);
			const now = performance.now();
			const elapsed = Math.max(now - state.lastMoveTime, 16);
			state.velocity = ((event.clientX - state.lastX) / elapsed) * 1000;
			state.lastX = event.clientX;
			state.lastMoveTime = now;
			state.suppressClick = Math.abs(deltaX) > dragThreshold;
			updateTransform();
		});

		viewport.addEventListener('pointerup', finishDrag);
		viewport.addEventListener('pointercancel', finishDrag);

		viewport.addEventListener('click', event => {
			if (!state.suppressClick) return;
			event.preventDefault();
			event.stopPropagation();
			state.suppressClick = false;
		}, true);

		const handleMotionChange = () => {
			state.velocity = 0;
			state.lastTime = 0;
			measure();
		};

		if (reduceMotion.addEventListener) {
			reduceMotion.addEventListener('change', handleMotionChange);
		} else {
			reduceMotion.addListener(handleMotionChange);
		}

		if (typeof ResizeObserver !== 'undefined') {
			new ResizeObserver(measure).observe(group);
		} else {
			window.addEventListener('resize', measure);
		}

		measure();
		requestAnimationFrame(animate);
	});

	// Smooth Height for FAQ
	const smoothHeight = (itemSelector, buttonSelector, contentSelector) => {
		const items = document.querySelectorAll(itemSelector);
		if (!items.length) return;

		const setItemState = (item, button, content, isOpen) => {
			item.dataset.open = isOpen ? 'true' : 'false';
			item.classList.toggle('active', isOpen);
			button.classList.toggle('active', isOpen);

			if (button.hasAttribute('aria-expanded')) {
				button.setAttribute('aria-expanded', String(isOpen));
			}

			if (content.hasAttribute('aria-hidden')) {
				content.setAttribute('aria-hidden', String(!isOpen));
			}

			content.style.maxHeight = isOpen ? `${content.scrollHeight}px` : '';
		};

		const firstItem = items[0];
		const firstButton = firstItem.querySelector(buttonSelector);
		const firstContent = firstItem.querySelector(contentSelector);
		if (firstButton && firstContent) {
			setItemState(firstItem, firstButton, firstContent, true);
		}

		// Функция для получения высоты шапки динамически
		const getHeaderHeight = () => {
			const header = document.querySelector('.header'); // Замените на селектор вашей шапки
			return header ? header.offsetHeight : 0;
		};

		items.forEach(item => {
			const button = item.querySelector(buttonSelector);
			const content = item.querySelector(contentSelector);
			if (button && content) {
				if (item !== firstItem) {
					setItemState(item, button, content, false);
				}

				button.addEventListener('click', () => {
					const isOpen = item.dataset.open === 'true';
					items.forEach(i => {
						if (i !== item) {
							const otherButton = i.querySelector(buttonSelector);
							const otherContent = i.querySelector(contentSelector);
							if (otherButton && otherContent) {
								setItemState(i, otherButton, otherContent, false);
							}
						}
					});
					setItemState(item, button, content, !isOpen);

					// Прокрутка к началу активного блока, если он открыт
					if (!isOpen) {
						setTimeout(() => {
							const rect = item.getBoundingClientRect();
							const isFullyVisible =
								rect.top >= 0 &&
								rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);

							if (!isFullyVisible) {
								const headerHeight = getHeaderHeight();
								const scrollPosition = window.scrollY + rect.top - headerHeight - 10; // Добавляем отступ 10px
								window.scrollTo({
									top: scrollPosition,
									behavior: 'smooth',
								});
							}
						}, 300); // Задержка для завершения анимации открытия
					}
				});

				window.addEventListener('resize', () => {
					if (item.dataset.open === 'true' && parseInt(content.style.maxHeight) !== content.scrollHeight) {
						content.style.maxHeight = `${content.scrollHeight}px`;
					}
				});
			}
		});
	};
	smoothHeight('.main--faq__item', '.main--faq__toggle, .main--faq__item--button', '.main--faq__item--answer');

	// анимации при появлении
	const headitems = document.querySelectorAll(".main--header, .taxonomy--header");
	const headobserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add("visible");
			}
		});
	}, {
		threshold: 0.2 // 20% блока должно быть видно, чтобы активировать
	});
	headitems.forEach(item => headobserver.observe(item));

	const allitems = document.querySelectorAll(".services--stages, .contacts--header, .case--header, .case--client, .main--faq, .taxonomy--team, .main--areas, .taxonomy--info, .taxonomy--idea, .main--stages, .taxonomy--services, .main--adv__wrapper .item, .main--adv, .main--services, .main--services__wrapper, .main--companies, .main--experts, .main--cases, .main--brief, .main--idea, .main--articles, .main--contacts");
	const allobserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add("visible");
			}
		});
	}, {
		threshold: 0.05 // 20% блока должно быть видно, чтобы активировать
	});
	allitems.forEach(item => allobserver.observe(item));

	// taxonomy--team === Hover эффект (только для десктопа с hover) ===
	if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
		const wrapper = document.querySelector('.taxonomy--team .wrapper');
		if (wrapper) {
			const items = wrapper.querySelectorAll('.item');
			items.forEach(item => {
				item.addEventListener('mouseenter', () => {
					setTimeout(() => {
						items.forEach(el => el !== item ? el.style.opacity = '0.15' : el.style.opacity = '1');
					}, 250);
				});

				item.addEventListener('mouseleave', () => {
					setTimeout(() => {
						items.forEach(el => el.style.opacity = '1');
					}, 250);
				});
			});
		}
	}

	// === Сворачивание/разворачивание команды ===
	const teamSection = document.querySelector(".taxonomy--team");
	if (teamSection) {
		const teamItems = teamSection.querySelectorAll(".wrapper .item");
		const button = teamSection.querySelector(".team--all");
		const initialCount = 4;
		const breakpoint = 768;
		// Если блоков 4 или меньше — показываем всё и прячем кнопку
		if (teamItems.length <= initialCount) {
			teamItems.forEach(item => item.classList.add("show"));
			if (button) button.style.display = "none";
			return;
		}
		function initTeamToggle() {
			if (!button) return;

			if (window.innerWidth > breakpoint) {
				// Десктоп
				teamItems.forEach((item, index) => {
					item.classList.toggle("show", index < initialCount);
				});

				button.style.display = "";

				let isExpanded = false;

				// Сброс старых обработчиков
				const newButton = button.cloneNode(true);
				button.replaceWith(newButton);

				newButton.textContent = "Показать ещё";

				newButton.addEventListener("click", () => {
					isExpanded = !isExpanded;

					if (isExpanded) {
						teamItems.forEach(item => item.classList.add("show"));
						newButton.textContent = "Скрыть";
					} else {
						teamItems.forEach((item, index) => {
							item.classList.toggle("show", index < initialCount);
						});
						newButton.textContent = "Показать ещё";
					}
				});
			} else {
				// Мобилка — показываем всё, кнопку скрываем
				teamItems.forEach(item => item.classList.add("show"));
				button.style.display = "none";
			}
		}
		initTeamToggle();
		window.addEventListener("resize", initTeamToggle);
	}

	// фоновая анимация
	function normalizeColor(e) {
		return [(e >> 16 & 255) / 255, (e >> 8 & 255) / 255, (255 & e) / 255]
	}
	["SCREEN", "LINEAR_LIGHT"].reduce( (e, t, n) => Object.assign(e, {
		[t]: n
	}), {});
	class MiniGl {
		constructor(e, t, n, i=!1) {
				const s = this
					, o = -1 !== document.location.search.toLowerCase().indexOf("debug=webgl");
				s.canvas = e,
				s.gl = s.canvas.getContext("webgl", {
						antialias: !0
				}),
				s.meshes = [];
				const r = s.gl;
				t && n && this.setSize(t, n),
				s.lastDebugMsg,
				s.debug = i && o ? function(e) {
						const t = new Date;
						t - s.lastDebugMsg > 1e3 && console.log("---"),
						console.log(t.toLocaleTimeString() + Array(Math.max(0, 32 - e.length)).join(" ") + e + ": ", ...Array.from(arguments).slice(1)),
						s.lastDebugMsg = t
				}
				: () => {}
				,
				Object.defineProperties(s, {
						Material: {
								enumerable: !1,
								value: class {
										constructor(e, t, n={}) {
												function i(e, t) {
														const n = r.createShader(e);
														return r.shaderSource(n, t),
														r.compileShader(n),
														r.getShaderParameter(n, r.COMPILE_STATUS) || console.error(r.getShaderInfoLog(n)),
														s.debug("Material.compileShaderSource", {
																source: t
														}),
														n
												}
												function o(e, t) {
														return Object.entries(e).map( ([e,n]) => n.getDeclaration(e, t)).join("\n")
												}
												this.uniforms = n,
												this.uniformInstances = [];
												const a = "\n              precision highp float;\n            ";
												this.vertexSource = `\n              ${a}\n              attribute vec4 position;\n              attribute vec2 uv;\n              attribute vec2 uvNorm;\n              ${o(s.commonUniforms, "vertex")}\n              ${o(n, "vertex")}\n              ${e}\n            `,
												this.Source = `\n              ${a}\n              ${o(s.commonUniforms, "fragment")}\n              ${o(n, "fragment")}\n              ${t}\n            `,
												this.vertexShader = i(r.VERTEX_SHADER, this.vertexSource),
												this.fragmentShader = i(r.FRAGMENT_SHADER, this.Source),
												this.program = r.createProgram(),
												r.attachShader(this.program, this.vertexShader),
												r.attachShader(this.program, this.fragmentShader),
												r.linkProgram(this.program),
												r.getProgramParameter(this.program, r.LINK_STATUS) || console.error(r.getProgramInfoLog(this.program)),
												r.useProgram(this.program),
												this.attachUniforms(void 0, s.commonUniforms),
												this.attachUniforms(void 0, this.uniforms)
										}
										attachUniforms(e, t) {
												const n = this;
												void 0 === e ? Object.entries(t).forEach( ([e,t]) => {
														n.attachUniforms(e, t)
												}
												) : "array" == t.type ? t.value.forEach( (t, i) => n.attachUniforms(`${e}[${i}]`, t)) : "struct" == t.type ? Object.entries(t.value).forEach( ([t,i]) => n.attachUniforms(`${e}.${t}`, i)) : (s.debug("Material.attachUniforms", {
														name: e,
														uniform: t
												}),
												n.uniformInstances.push({
														uniform: t,
														location: r.getUniformLocation(n.program, e)
												}))
										}
								}
						},
						Uniform: {
								enumerable: !1,
								value: class {
										constructor(e) {
												this.type = "float",
												Object.assign(this, e),
												this.typeFn = {
														float: "1f",
														int: "1i",
														vec2: "2fv",
														vec3: "3fv",
														vec4: "4fv",
														mat4: "Matrix4fv"
												}[this.type] || "1f",
												this.update()
										}
										update(e) {
												void 0 !== this.value && r[`uniform${this.typeFn}`](e, 0 === this.typeFn.indexOf("Matrix") ? this.transpose : this.value, 0 === this.typeFn.indexOf("Matrix") ? this.value : null)
										}
										getDeclaration(e, t, n) {
												const i = this;
												if (i.excludeFrom !== t) {
														if ("array" === i.type)
																return i.value[0].getDeclaration(e, t, i.value.length) + `\nconst int ${e}_length = ${i.value.length};`;
														if ("struct" === i.type) {
																let s = e.replace("u_", "");
																return `uniform struct ${s = s.charAt(0).toUpperCase() + s.slice(1)} \n                                  {\n` + Object.entries(i.value).map( ([e,n]) => n.getDeclaration(e, t).replace(/^uniform/, "")).join("") + `\n} ${e}${n > 0 ? `[${n}]` : ""};`
														}
														return `uniform ${i.type} ${e}${n > 0 ? `[${n}]` : ""};`
												}
										}
								}
						},
						PlaneGeometry: {
								enumerable: !1,
								value: class {
										constructor(e, t, n, i, o) {
												r.createBuffer(),
												this.attributes = {
														position: new s.Attribute({
																target: r.ARRAY_BUFFER,
																size: 3
														}),
														uv: new s.Attribute({
																target: r.ARRAY_BUFFER,
																size: 2
														}),
														uvNorm: new s.Attribute({
																target: r.ARRAY_BUFFER,
																size: 2
														}),
														index: new s.Attribute({
																target: r.ELEMENT_ARRAY_BUFFER,
																size: 3,
																type: r.UNSIGNED_SHORT
														})
												},
												this.setTopology(n, i),
												this.setSize(e, t, o)
										}
										setTopology(e=1, t=1) {
												const n = this;
												n.xSegCount = e,
												n.ySegCount = t,
												n.vertexCount = (n.xSegCount + 1) * (n.ySegCount + 1),
												n.quadCount = n.xSegCount * n.ySegCount * 2,
												n.attributes.uv.values = new Float32Array(2 * n.vertexCount),
												n.attributes.uvNorm.values = new Float32Array(2 * n.vertexCount),
												n.attributes.index.values = new Uint16Array(3 * n.quadCount);
												for (let e = 0; e <= n.ySegCount; e++)
														for (let t = 0; t <= n.xSegCount; t++) {
																const i = e * (n.xSegCount + 1) + t;
																if (n.attributes.uv.values[2 * i] = t / n.xSegCount,
																n.attributes.uv.values[2 * i + 1] = 1 - e / n.ySegCount,
																n.attributes.uvNorm.values[2 * i] = t / n.xSegCount * 2 - 1,
																n.attributes.uvNorm.values[2 * i + 1] = 1 - e / n.ySegCount * 2,
																t < n.xSegCount && e < n.ySegCount) {
																		const s = e * n.xSegCount + t;
																		n.attributes.index.values[6 * s] = i,
																		n.attributes.index.values[6 * s + 1] = i + 1 + n.xSegCount,
																		n.attributes.index.values[6 * s + 2] = i + 1,
																		n.attributes.index.values[6 * s + 3] = i + 1,
																		n.attributes.index.values[6 * s + 4] = i + 1 + n.xSegCount,
																		n.attributes.index.values[6 * s + 5] = i + 2 + n.xSegCount
																}
														}
												n.attributes.uv.update(),
												n.attributes.uvNorm.update(),
												n.attributes.index.update(),
												s.debug("Geometry.setTopology", {
														uv: n.attributes.uv,
														uvNorm: n.attributes.uvNorm,
														index: n.attributes.index
												})
										}
										setSize(e=1, t=1, n="xz") {
												const i = this;
												i.width = e,
												i.height = t,
												i.orientation = n,
												i.attributes.position.values && i.attributes.position.values.length === 3 * i.vertexCount || (i.attributes.position.values = new Float32Array(3 * i.vertexCount));
												const o = e / -2
													, r = t / -2
													, a = e / i.xSegCount
													, l = t / i.ySegCount;
												for (let e = 0; e <= i.ySegCount; e++) {
														const t = r + e * l;
														for (let s = 0; s <= i.xSegCount; s++) {
																const r = o + s * a
																	, l = e * (i.xSegCount + 1) + s;
																i.attributes.position.values[3 * l + "xyz".indexOf(n[0])] = r,
																i.attributes.position.values[3 * l + "xyz".indexOf(n[1])] = -t
														}
												}
												i.attributes.position.update(),
												s.debug("Geometry.setSize", {
														position: i.attributes.position
												})
										}
								}
						},
						Mesh: {
								enumerable: !1,
								value: class {
										constructor(e, t) {
												const n = this;
												n.geometry = e,
												n.material = t,
												n.wireframe = !1,
												n.attributeInstances = [],
												Object.entries(n.geometry.attributes).forEach( ([e,t]) => {
														n.attributeInstances.push({
																attribute: t,
																location: t.attach(e, n.material.program)
														})
												}
												),
												s.meshes.push(n),
												s.debug("Mesh.constructor", {
														mesh: n
												})
										}
										draw() {
												r.useProgram(this.material.program),
												this.material.uniformInstances.forEach( ({uniform: e, location: t}) => e.update(t)),
												this.attributeInstances.forEach( ({attribute: e, location: t}) => e.use(t)),
												r.drawElements(this.wireframe ? r.LINES : r.TRIANGLES, this.geometry.attributes.index.values.length, r.UNSIGNED_SHORT, 0)
										}
										remove() {
												s.meshes = s.meshes.filter(e => e != this)
										}
								}
						},
						Attribute: {
								enumerable: !1,
								value: class {
										constructor(e) {
												this.type = r.FLOAT,
												this.normalized = !1,
												this.buffer = r.createBuffer(),
												Object.assign(this, e),
												this.update()
										}
										update() {
												void 0 !== this.values && (r.bindBuffer(this.target, this.buffer),
												r.bufferData(this.target, this.values, r.STATIC_DRAW))
										}
										attach(e, t) {
												const n = r.getAttribLocation(t, e);
												return this.target === r.ARRAY_BUFFER && (r.enableVertexAttribArray(n),
												r.vertexAttribPointer(n, this.size, this.type, this.normalized, 0, 0)),
												n
										}
										use(e) {
												r.bindBuffer(this.target, this.buffer),
												this.target === r.ARRAY_BUFFER && (r.enableVertexAttribArray(e),
												r.vertexAttribPointer(e, this.size, this.type, this.normalized, 0, 0))
										}
								}
						}
				});
				const a = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
				s.commonUniforms = {
						projectionMatrix: new s.Uniform({
								type: "mat4",
								value: a
						}),
						modelViewMatrix: new s.Uniform({
								type: "mat4",
								value: a
						}),
						resolution: new s.Uniform({
								type: "vec2",
								value: [1, 1]
						}),
						aspectRatio: new s.Uniform({
								type: "float",
								value: 1
						})
				}
		}
		setSize(e=640, t=480) {
				this.width = e,
				this.height = t,
				this.canvas.width = e,
				this.canvas.height = t,
				this.gl.viewport(0, 0, e, t),
				this.commonUniforms.resolution.value = [e, t],
				this.commonUniforms.aspectRatio.value = e / t,
				this.debug("MiniGL.setSize", {
						width: e,
						height: t
				})
		}
		setOrthographicCamera(e=0, t=0, n=0, i=-2e3, s=2e3) {
				this.commonUniforms.projectionMatrix.value = [2 / this.width, 0, 0, 0, 0, 2 / this.height, 0, 0, 0, 0, 2 / (i - s), 0, e, t, n, 1],
				this.debug("setOrthographicCamera", this.commonUniforms.projectionMatrix.value)
		}
		render() {
				this.gl.clearColor(0, 0, 0, 0),
				this.gl.clearDepth(1),
				this.meshes.forEach(e => e.draw())
		}
	}
	function e(e, t, n) {
		return t in e ? Object.defineProperty(e, t, {
				value: n,
				enumerable: !0,
				configurable: !0,
				writable: !0
		}) : e[t] = n,
		e
	}
	class Gradient {
		constructor(...t) {
				e(this, "el", void 0),
				e(this, "cssVarRetries", 0),
				e(this, "maxCssVarRetries", 200),
				e(this, "angle", 0),
				e(this, "isLoadedClass", !1),
				e(this, "isScrolling", !1),
				e(this, "scrollingTimeout", void 0),
				e(this, "scrollingRefreshDelay", 200),
				e(this, "isIntersecting", !1),
				e(this, "shaderFiles", void 0),
				e(this, "vertexShader", void 0),
				e(this, "sectionColors", void 0),
				e(this, "computedCanvasStyle", void 0),
				e(this, "conf", void 0),
				e(this, "uniforms", void 0),
				e(this, "t", 1253106),
				e(this, "last", 0),
				e(this, "width", void 0),
				e(this, "minWidth", 1111),
				e(this, "height", 600),
				e(this, "xSegCount", void 0),
				e(this, "ySegCount", void 0),
				e(this, "mesh", void 0),
				e(this, "material", void 0),
				e(this, "geometry", void 0),
				e(this, "minigl", void 0),
				e(this, "scrollObserver", void 0),
				e(this, "amp", 320),
				e(this, "seed", 5),
				e(this, "freqX", 14e-5),
				e(this, "freqY", 29e-5),
				e(this, "freqDelta", 1e-5),
				e(this, "activeColors", [1, 1, 1, 1]),
				e(this, "isMetaKey", !1),
				e(this, "isGradientLegendVisible", !1),
				e(this, "isMouseDown", !1),
				e(this, "handleScroll", () => {
						clearTimeout(this.scrollingTimeout),
						this.scrollingTimeout = setTimeout(this.handleScrollEnd, this.scrollingRefreshDelay),
						this.isGradientLegendVisible && this.hideGradientLegend(),
						this.conf.playing && (this.isScrolling = !0,
						this.pause())
				}
				),
				e(this, "handleScrollEnd", () => {
						this.isScrolling = !1,
						this.isIntersecting && this.play()
				}
				),
				e(this, "resize", () => {
						this.width = window.innerWidth,
						this.minigl.setSize(this.width, this.height),
						this.minigl.setOrthographicCamera(),
						this.xSegCount = Math.ceil(this.width * this.conf.density[0]),
						this.ySegCount = Math.ceil(this.height * this.conf.density[1]),
						this.mesh.geometry.setTopology(this.xSegCount, this.ySegCount),
						this.mesh.geometry.setSize(this.width, this.height),
						this.mesh.material.uniforms.u_shadow_power.value = this.width < 600 ? 5 : 6
				}
				),
				e(this, "handleMouseDown", e => {
						this.isGradientLegendVisible && (this.isMetaKey = e.metaKey,
						this.isMouseDown = !0,
						!1 === this.conf.playing && requestAnimationFrame(this.animate))
				}
				),
				e(this, "handleMouseUp", () => {
						this.isMouseDown = !1
				}
				),
				e(this, "animate", e => {
						if (!this.shouldSkipFrame(e) || this.isMouseDown) {
								if (this.t += Math.min(e - this.last, 1e3 / 15),
								this.last = e,
								this.isMouseDown) {
										let e = 160;
										this.isMetaKey && (e = -160),
										this.t += e
								}
								this.mesh.material.uniforms.u_time.value = this.t,
								this.minigl.render()
						}
						if (0 !== this.last && this.isStatic)
								return this.minigl.render(),
								void this.disconnect();
						(this.conf.playing || this.isMouseDown) && requestAnimationFrame(this.animate)
				}
				),
				e(this, "addIsLoadedClass", () => {
						!this.isLoadedClass && (this.isLoadedClass = !0,
						this.el.classList.add("isLoaded"),
						setTimeout( () => {
								this.el.parentElement.classList.add("isLoaded")
						}
						, 3e3))
				}
				),
				e(this, "pause", () => {
						this.conf.playing = !1
				}
				),
				e(this, "play", () => {
						requestAnimationFrame(this.animate),
						this.conf.playing = !0
				}
				),
				e(this, "initGradient", e => (this.el = document.querySelector(e),
				this.connect(),
				this))
		}
		async connect() {
				this.shaderFiles = {
						vertex: "varying vec3 v_color;\n\nvoid main() {\n  float time = u_time * u_global.noiseSpeed;\n\n  vec2 noiseCoord = resolution * uvNorm * u_global.noiseFreq;\n\n  vec2 st = 1. - uvNorm.xy;\n\n  //\n  // Tilting the plane\n  //\n\n  // Front-to-back tilt\n  float tilt = resolution.y / 2.0 * uvNorm.y;\n\n  // Left-to-right angle\n  float incline = resolution.x * uvNorm.x / 2.0 * u_vertDeform.incline;\n\n  // Up-down shift to offset incline\n  float offset = resolution.x / 2.0 * u_vertDeform.incline * mix(u_vertDeform.offsetBottom, u_vertDeform.offsetTop, uv.y);\n\n  //\n  // Vertex noise\n  //\n\n  float noise = snoise(vec3(\n    noiseCoord.x * u_vertDeform.noiseFreq.x + time * u_vertDeform.noiseFlow,\n    noiseCoord.y * u_vertDeform.noiseFreq.y,\n    time * u_vertDeform.noiseSpeed + u_vertDeform.noiseSeed\n  )) * u_vertDeform.noiseAmp;\n\n  // Fade noise to zero at edges\n  noise *= 1.0 - pow(abs(uvNorm.y), 2.0);\n\n  // Clamp to 0\n  noise = max(0.0, noise);\n\n  vec3 pos = vec3(\n    position.x,\n    position.y + tilt + incline + noise - offset,\n    position.z\n  );\n\n  //\n  // Vertex color, to be passed to fragment shader\n  //\n\n  if (u_active_colors[0] == 1.) {\n    v_color = u_baseColor;\n  }\n\n  for (int i = 0; i < u_waveLayers_length; i++) {\n    if (u_active_colors[i + 1] == 1.) {\n      WaveLayers layer = u_waveLayers[i];\n\n      float noise = smoothstep(\n        layer.noiseFloor,\n        layer.noiseCeil,\n        snoise(vec3(\n          noiseCoord.x * layer.noiseFreq.x + time * layer.noiseFlow,\n          noiseCoord.y * layer.noiseFreq.y,\n          time * layer.noiseSpeed + layer.noiseSeed\n        )) / 2.0 + 0.5\n      );\n\n      v_color = blendNormal(v_color, layer.color, pow(noise, 4.));\n    }\n  }\n\n  //\n  // Finish\n  //\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n}",
						noise: "//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : stegu\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//               https://github.com/stegu/webgl-noise\n//\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n    return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v)\n{\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289(i);\n  vec4 p = permute( permute( permute(\n            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n          + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n          + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n}",
						blend: "//\n// https://github.com/jamieowen/glsl-blend\n//\n\n// Normal\n\nvec3 blendNormal(vec3 base, vec3 blend) {\n\treturn blend;\n}\n\nvec3 blendNormal(vec3 base, vec3 blend, float opacity) {\n\treturn (blendNormal(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Screen\n\nfloat blendScreen(float base, float blend) {\n\treturn 1.0-((1.0-base)*(1.0-blend));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend) {\n\treturn vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend, float opacity) {\n\treturn (blendScreen(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Multiply\n\nvec3 blendMultiply(vec3 base, vec3 blend) {\n\treturn base*blend;\n}\n\nvec3 blendMultiply(vec3 base, vec3 blend, float opacity) {\n\treturn (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Overlay\n\nfloat blendOverlay(float base, float blend) {\n\treturn base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));\n}\n\nvec3 blendOverlay(vec3 base, vec3 blend) {\n\treturn vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));\n}\n\nvec3 blendOverlay(vec3 base, vec3 blend, float opacity) {\n\treturn (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Hard light\n\nvec3 blendHardLight(vec3 base, vec3 blend) {\n\treturn blendOverlay(blend,base);\n}\n\nvec3 blendHardLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Soft light\n\nfloat blendSoftLight(float base, float blend) {\n\treturn (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));\n}\n\nvec3 blendSoftLight(vec3 base, vec3 blend) {\n\treturn vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));\n}\n\nvec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Color dodge\n\nfloat blendColorDodge(float base, float blend) {\n\treturn (blend==1.0)?blend:min(base/(1.0-blend),1.0);\n}\n\nvec3 blendColorDodge(vec3 base, vec3 blend) {\n\treturn vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));\n}\n\nvec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {\n\treturn (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Color burn\n\nfloat blendColorBurn(float base, float blend) {\n\treturn (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);\n}\n\nvec3 blendColorBurn(vec3 base, vec3 blend) {\n\treturn vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));\n}\n\nvec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {\n\treturn (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Vivid Light\n\nfloat blendVividLight(float base, float blend) {\n\treturn (blend<0.5)?blendColorBurn(base,(2.0*blend)):blendColorDodge(base,(2.0*(blend-0.5)));\n}\n\nvec3 blendVividLight(vec3 base, vec3 blend) {\n\treturn vec3(blendVividLight(base.r,blend.r),blendVividLight(base.g,blend.g),blendVividLight(base.b,blend.b));\n}\n\nvec3 blendVividLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendVividLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Lighten\n\nfloat blendLighten(float base, float blend) {\n\treturn max(blend,base);\n}\n\nvec3 blendLighten(vec3 base, vec3 blend) {\n\treturn vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));\n}\n\nvec3 blendLighten(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLighten(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Linear burn\n\nfloat blendLinearBurn(float base, float blend) {\n\t// Note : Same implementation as BlendSubtractf\n\treturn max(base+blend-1.0,0.0);\n}\n\nvec3 blendLinearBurn(vec3 base, vec3 blend) {\n\t// Note : Same implementation as BlendSubtract\n\treturn max(base+blend-vec3(1.0),vec3(0.0));\n}\n\nvec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Linear dodge\n\nfloat blendLinearDodge(float base, float blend) {\n\t// Note : Same implementation as BlendAddf\n\treturn min(base+blend,1.0);\n}\n\nvec3 blendLinearDodge(vec3 base, vec3 blend) {\n\t// Note : Same implementation as BlendAdd\n\treturn min(base+blend,vec3(1.0));\n}\n\nvec3 blendLinearDodge(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n// Linear light\n\nfloat blendLinearLight(float base, float blend) {\n\treturn blend<0.5?blendLinearBurn(base,(2.0*blend)):blendLinearDodge(base,(2.0*(blend-0.5)));\n}\n\nvec3 blendLinearLight(vec3 base, vec3 blend) {\n\treturn vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));\n}\n\nvec3 blendLinearLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearLight(base, blend) * opacity + base * (1.0 - opacity));\n}",
						fragment: "varying vec3 v_color;\n\nvoid main() {\n  vec3 color = v_color;\n  if (u_darken_top == 1.0) {\n    vec2 st = gl_FragCoord.xy/resolution.xy;\n    color.g -= pow(st.y + sin(-12.0) * st.x, u_shadow_power) * 0.4;\n  }\n  gl_FragColor = vec4(color, 1.0);\n}"
				},
				this.conf = {
						presetName: "",
						wireframe: !1,
						density: [.06, .16],
						zoom: 1,
						rotation: 0,
						playing: !0
				},
				document.querySelectorAll("canvas").length < 1 ? console.log("DID NOT LOAD HERO STRIPE CANVAS") : (this.minigl = new MiniGl(this.el,null,null,!0),
				requestAnimationFrame( () => {
						this.el && (this.computedCanvasStyle = getComputedStyle(this.el),
						this.waitForCssVars())
				}
				))
		}
		disconnect() {
				this.scrollObserver && (window.removeEventListener("scroll", this.handleScroll),
				window.removeEventListener("mousedown", this.handleMouseDown),
				window.removeEventListener("mouseup", this.handleMouseUp),
				window.removeEventListener("keydown", this.handleKeyDown),
				this.scrollObserver.disconnect()),
				window.removeEventListener("resize", this.resize)
		}
		initMaterial() {
				this.uniforms = {
						u_time: new this.minigl.Uniform({
								value: 0
						}),
						u_shadow_power: new this.minigl.Uniform({
								value: 5
						}),
						u_darken_top: new this.minigl.Uniform({
								value: "" === this.el.dataset.jsDarkenTop ? 1 : 0
						}),
						u_active_colors: new this.minigl.Uniform({
								value: this.activeColors,
								type: "vec4"
						}),
						u_global: new this.minigl.Uniform({
								value: {
										noiseFreq: new this.minigl.Uniform({
												value: [this.freqX, this.freqY],
												type: "vec2"
										}),
										noiseSpeed: new this.minigl.Uniform({
												value: 5e-6
										})
								},
								type: "struct"
						}),
						u_vertDeform: new this.minigl.Uniform({
								value: {
										incline: new this.minigl.Uniform({
												value: Math.sin(this.angle) / Math.cos(this.angle)
										}),
										offsetTop: new this.minigl.Uniform({
												value: -.5
										}),
										offsetBottom: new this.minigl.Uniform({
												value: -.5
										}),
										noiseFreq: new this.minigl.Uniform({
												value: [3, 4],
												type: "vec2"
										}),
										noiseAmp: new this.minigl.Uniform({
												value: this.amp
										}),
										noiseSpeed: new this.minigl.Uniform({
												value: 10
										}),
										noiseFlow: new this.minigl.Uniform({
												value: 3
										}),
										noiseSeed: new this.minigl.Uniform({
												value: this.seed
										})
								},
								type: "struct",
								excludeFrom: "fragment"
						}),
						u_baseColor: new this.minigl.Uniform({
								value: this.sectionColors[0],
								type: "vec3",
								excludeFrom: "fragment"
						}),
						u_waveLayers: new this.minigl.Uniform({
								value: [],
								excludeFrom: "fragment",
								type: "array"
						})
				};
				for (let e = 1; e < this.sectionColors.length; e += 1)
						this.uniforms.u_waveLayers.value.push(new this.minigl.Uniform({
								value: {
										color: new this.minigl.Uniform({
												value: this.sectionColors[e],
												type: "vec3"
										}),
										noiseFreq: new this.minigl.Uniform({
												value: [2 + e / this.sectionColors.length, 3 + e / this.sectionColors.length],
												type: "vec2"
										}),
										noiseSpeed: new this.minigl.Uniform({
												value: 11 + .3 * e
										}),
										noiseFlow: new this.minigl.Uniform({
												value: 6.5 + .3 * e
										}),
										noiseSeed: new this.minigl.Uniform({
												value: this.seed + 10 * e
										}),
										noiseFloor: new this.minigl.Uniform({
												value: .1
										}),
										noiseCeil: new this.minigl.Uniform({
												value: .63 + .07 * e
										})
								},
								type: "struct"
						}));
				return this.vertexShader = [this.shaderFiles.noise, this.shaderFiles.blend, this.shaderFiles.vertex].join("\n\n"),
				new this.minigl.Material(this.vertexShader,this.shaderFiles.fragment,this.uniforms)
		}
		initMesh() {
				this.material = this.initMaterial(),
				this.geometry = new this.minigl.PlaneGeometry,
				this.mesh = new this.minigl.Mesh(this.geometry,this.material)
		}
		shouldSkipFrame(e) {
				return !!window.document.hidden || !this.conf.playing || parseInt(e, 10) % 2 == 0 || void 0
		}
		updateFrequency(e) {
				this.freqX += e,
				this.freqY += e
		}
		toggleColor(e) {
				this.activeColors[e] = 0 === this.activeColors[e] ? 1 : 0
		}
		showGradientLegend() {
				this.width > this.minWidth && (this.isGradientLegendVisible = !0,
				document.body.classList.add("isGradientLegendVisible"))
		}
		hideGradientLegend() {
				this.isGradientLegendVisible = !1,
				document.body.classList.remove("isGradientLegendVisible")
		}
		init() {
				this.initGradientColors(),
				this.initMesh(),
				this.resize(),
				requestAnimationFrame(this.animate),
				window.addEventListener("resize", this.resize)
		}
		waitForCssVars() {
				if (this.computedCanvasStyle && -1 !== this.computedCanvasStyle.getPropertyValue("--gradient-color-1").indexOf("#"))
						this.init(),
						this.addIsLoadedClass();
				else {
						if (this.cssVarRetries += 1,
						this.cssVarRetries > this.maxCssVarRetries)
								return this.sectionColors = [16711680, 16711680, 16711935, 65280, 255],
								void this.init();
						requestAnimationFrame( () => this.waitForCssVars())
				}
		}
		initGradientColors() {
				this.sectionColors = ["--gradient-color-1", "--gradient-color-2", "--gradient-color-3", "--gradient-color-4"].map(e => {
						let t = this.computedCanvasStyle.getPropertyValue(e).trim();
						if (4 === t.length) {
								t = `#${t.substr(1).split("").map(e => e + e).join("")}`
						}
						return t && `0x${t.substr(1)}`
				}
				).filter(Boolean).map(normalizeColor)
		}
	}
	var gradient = new Gradient;
	gradient.initGradient("#gradient-canvas");


});
