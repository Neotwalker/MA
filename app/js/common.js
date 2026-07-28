"use strict";

document.addEventListener("DOMContentLoaded", () => {
	const docEl = document.documentElement;
	const body = document.body;

	// ---------- UTILS ----------
	const header = document.querySelector('.header');
	const topButton = document.querySelector('.top');
	const modalGeneral = document.querySelector('#modal_general');
	const modalSend = document.querySelector('#modal_send') || document.querySelector('.modal--send');
	const burgerMenu = document.querySelector('.burger');
	const headerMenu = document.querySelector('.header--menu');
	const menu = headerMenu ? headerMenu.querySelector('.menu') : null;

	let activeModal = null;
	const modalScrollState = {
		locked: false,
		scrollY: 0,
		body: {},
		headerPaddingRight: '',
	};
	
	// ---------- COOKIES BANNER (6 месяцев) ----------
	(function () {
		const cookiesBanner = document.querySelector('.cookies');
		if (!cookiesBanner) return;

		const cookiesButton = cookiesBanner.querySelector('.cookies--button');
		if (!cookiesButton) return;

		const CONSENT_KEY = 'cookieConsent';
		const CONSENT_TS_KEY = 'cookieConsentTs';
		const SIX_MONTHS = 1000 * 60 * 60 * 24 * 30 * 6; // ~6 месяцев

		function shouldShowBanner() {
			try {
				const consent = localStorage.getItem(CONSENT_KEY);
				if (!consent) return true;

				// Старое согласие без таймстемпа — считаем бессрочным, баннер не показываем.
				const tsRaw = localStorage.getItem(CONSENT_TS_KEY);
				if (!tsRaw) return false;

				const ts = Number(tsRaw) || 0;
				return Date.now() - ts > SIX_MONTHS;
			} catch (e) {
				// если localStorage недоступен — просто показываем
				return true;
			}
		}

		if (shouldShowBanner()) {
			cookiesBanner.classList.add('active');
		}

		cookiesButton.addEventListener('click', () => {
			try {
				localStorage.setItem(CONSENT_KEY, 'true');
				localStorage.setItem(CONSENT_TS_KEY, String(Date.now()));
			} catch (e) {}
			cookiesBanner.classList.remove('active');
		});
	})();
	// ---------- HEADER SCROLL & SCROLL-TO-TOP ----------
	if (header && topButton) {
		const checkScroll = () => {
			const y = window.scrollY || window.pageYOffset;
			header.classList.toggle('scroll', y > 40);
			topButton.classList.toggle('scroll', y > 500);
		};

		checkScroll();
		window.addEventListener('load', checkScroll);
		window.addEventListener('scroll', checkScroll);

		topButton.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	// Убрать скролл при открытии модалок/меню
	const hasClass = (el, cls) => el && el.classList.contains(cls);
	const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
	const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth;
	function isAnythingOverlayOpen() {
		return (
			hasClass(headerMenu, 'open') ||
			Boolean(activeModal)
		);
	}
	function lockScroll() {
		if (!isAnythingOverlayOpen()) return;
		const scrollbarWidth = getScrollbarWidth();
		docEl.classList.add('overflow');
		if (scrollbarWidth > 0 && header) {
			header.style.paddingRight = `${scrollbarWidth}px`;
			body.style.paddingRight = `${scrollbarWidth}px`;
		}
	}
	function unlockScrollIfFree() {
		if (isAnythingOverlayOpen()) return;
		docEl.classList.remove('overflow');
		if (header) {
			header.style.paddingRight = '';
		}
		body.style.paddingRight = '';
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

		if (hasClass(headerMenu, 'open')) {
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

	function focusModalWrapper(modal) {
		const wrapper = modal?.querySelector('.modal--wrapper');
		requestAnimationFrame(() => {
			(wrapper || modal)?.focus?.({ preventScroll: true });
		});
	}

	function openModal(modal) {
		if (!modal) return;
		if (activeModal && activeModal !== modal) {
			closeModal(activeModal, { unlockScroll: false });
		}
		if (!modalScrollState.locked) {
			lockModalScroll();
		}
		activeModal = modal;
		modal.removeAttribute('inert');
		modal.setAttribute('aria-hidden', 'false');
		modal.classList.add('active');
		focusModalWrapper(modal);
	}

	function closeModal(modal = activeModal, options = {}) {
		const { unlockScroll = true } = options;
		if (!modal) return;
		if (modal.contains(document.activeElement)) {
			document.activeElement.blur();
		}
		modal.classList.remove('active');
		modal.setAttribute('aria-hidden', 'true');
		modal.setAttribute('inert', '');
		if (activeModal === modal) {
			activeModal = null;
		}
		if (unlockScroll) {
			unlockModalScroll();
		}
	}

	function trapModalFocus(event) {
		if (!activeModal || event.key !== 'Tab') return;
		const wrapper = activeModal.querySelector('.modal--wrapper');
		const focusable = getFocusableElements(activeModal);
		if (!focusable.length) {
			event.preventDefault();
			(wrapper || activeModal).focus({ preventScroll: true });
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
				openModal(target);
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
	}

	function openMenu() {
		if (!burgerMenu || !headerMenu || !menu) return;
		header.classList.add('open-menu');
		headerMenu.classList.add('open');
		burgerMenu.classList.add('active');
		menu.classList.add('active');
		lockScroll();
	}
	function closeMenu() {
		if (!burgerMenu || !headerMenu || !menu) return;

		header.classList.remove('open-menu');
		headerMenu.classList.remove('open');
		burgerMenu.classList.remove('active');
		menu.classList.remove('active');

		unlockScrollIfFree();
	}

	if (burgerMenu && headerMenu && menu) {
		burgerMenu.addEventListener('click', e => {
			e.stopPropagation();
			if (hasClass(headerMenu, 'open')) {
				closeMenu();
			} else {
				openMenu();
			}
		});
	}

	// ---------- MENU SUBMENU HANDLING ----------
	const isMobileMenu = () => window.innerWidth <= 1200;
	function resetSubMenus() {
		if (!headerMenu) return;

		qsa('.menu-item-has-children', headerMenu).forEach(li => {
			li.classList.remove('open-submenu');

			const sub = li.querySelector('.sub-menu');
			if (sub) {
				sub.style.maxHeight = '';
				sub.classList.remove('active');
			}
		});
	}
	function toggleSubMenu(li) {
		const sub = li.querySelector('.sub-menu');
		if (!sub) return;

		const isOpen = li.classList.toggle('open-submenu');

		if (isOpen) {
			sub.classList.add('active');
			sub.style.maxHeight = sub.scrollHeight + 'px';

			let parent = li.parentElement;
			while (parent && parent !== headerMenu) {
				if (parent.classList?.contains('sub-menu')) {
					parent.style.maxHeight = 'none';
				}
				parent = parent.parentElement;
			}
		} else {
			sub.style.maxHeight = '';
			sub.classList.remove('active');
		}
	}
	function initSubMenus() {
		if (!headerMenu) return;

		qsa('.menu-item-has-children', headerMenu).forEach(li => {
			if (!li.querySelector('.submenu-toggle')) {
				const toggle = document.createElement('span');
				toggle.className = 'submenu-toggle';
				li.appendChild(toggle);
			}

			if (li.dataset.submenuInited === '1') return;
			li.dataset.submenuInited = '1';

			li.querySelector('.submenu-toggle').addEventListener('click', e => {
				if (!isMobileMenu()) return;

				e.preventDefault();
				e.stopPropagation();

				toggleSubMenu(li);
			});
		});
	}
	// Инициализация
	initSubMenus();

	
	window.addEventListener('resize', () => {
		// При ресайзе чистим неправильные состояния
		if (window.innerWidth > 1200) {
			resetSubMenus();
			if (menu) menu.classList.remove('active');
		} else if (headerMenu && hasClass(headerMenu, 'open') && menu) {
			menu.classList.add('active');
		}
	});
	// Input Name Validation
	const fioInputs = document.querySelectorAll('input[name="fio"], input[name="fio1"]');
	fioInputs.forEach(input => {
		if (input.closest('[data-development-contact-form], [data-modal-contact-form]')) return;
		input.addEventListener('keyup', () => {
			input.value = input.value.replace(/http|https|url|www|\.net|\.ru|\.com|[0-9]/gi, '');
		});
	});
	// Phone Input Mask
	const phoneInputs = document.querySelectorAll('.wpcf7-tel');
	const applyPhoneMask = (e) => {
		const el = e.target;
		if (el.closest('[data-development-contact-form], [data-modal-contact-form]')) return;
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
	// Modal Contact Form
	const modalContactForms = document.querySelectorAll('[data-modal-contact-form]');
	const modalContactFormState = new Map();
	if (modalContactForms.length) {
		const modalPhoneMaskPattern = '+_ (___) ___ __-__';
		const modalPhoneMaxDigits = 11;
		const getModalPhoneDigits = (value = '', limit = modalPhoneMaxDigits) => String(value).replace(/\D/g, '').slice(0, limit);
		const getModalPhoneDigitCount = (value = '') => String(value).replace(/\D/g, '').length;
		const formatModalPhone = (value = '') => {
			const digits = getModalPhoneDigits(value);
			if (!digits) return '';
			let digitIndex = 0;
			let pendingChars = '';
			let formattedValue = '';

			for (const char of modalPhoneMaskPattern) {
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
		const getModalPhoneCaretPosition = (value, digitsBeforeCaret) => {
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
				submitButton?.toggleAttribute('disabled', isLoading);
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
			const applyModalPhoneMask = () => {
				if (!fields.phone) return;
				const selectionStart = fields.phone.selectionStart ?? fields.phone.value.length;
				const digitsBeforeCaret = Math.min(getModalPhoneDigitCount(fields.phone.value.slice(0, selectionStart)), modalPhoneMaxDigits);
				const digits = getModalPhoneDigits(fields.phone.value);
				const formattedValue = formatModalPhone(digits);
				fields.phone.value = formattedValue;

				if (document.activeElement === fields.phone && typeof fields.phone.setSelectionRange === 'function') {
					const caretPosition = getModalPhoneCaretPosition(formattedValue, Math.min(digitsBeforeCaret, digits.length));
					fields.phone.setSelectionRange(caretPosition, caretPosition);
				}
			};
			const validate = () => {
				clearErrors();
				setStatus('');
				applyModalPhoneMask();
				const phoneDigits = getModalPhoneDigitCount(fields.phone?.value || '');
				const emailValue = fields.email?.value.trim() || '';
				const errors = [];

				if (!phoneDigits) {
					setFieldError(fields.phone, 'modal-contact-phone-error', 'Укажите номер телефона.');
					errors.push(fields.phone);
				} else if (phoneDigits !== modalPhoneMaxDigits) {
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
			fields.phone?.addEventListener('beforeinput', (e) => {
				if (e.inputType !== 'insertText') return;
				if (e.data && /\D/.test(e.data)) {
					e.preventDefault();
				}
			});
			fields.phone?.addEventListener('input', () => {
				applyModalPhoneMask();
				setFieldError(fields.phone, 'modal-contact-phone-error');
			});
			fields.phone?.addEventListener('change', applyModalPhoneMask);
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
				closeModal(sourceModal, { unlockScroll: false });
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
		const phoneMaskPattern = '+_ (___) ___ __-__';
		const phoneMaxDigits = 11;

		const getDevelopmentPhoneDigits = (value = '', limit = phoneMaxDigits) => String(value).replace(/\D/g, '').slice(0, limit);
		const getDevelopmentPhoneDigitCount = (value = '') => String(value).replace(/\D/g, '').length;

		const formatDevelopmentPhone = (value = '') => {
			const digits = getDevelopmentPhoneDigits(value);
			if (!digits) return '';
			let digitIndex = 0;
			let pendingChars = '';
			let formattedValue = '';

			for (const char of phoneMaskPattern) {
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

		const getDevelopmentPhoneCaretPosition = (value, digitsBeforeCaret) => {
			if (!digitsBeforeCaret) return 0;
			let digitCount = 0;
			for (let index = 0; index < value.length; index += 1) {
				if (/\d/.test(value[index])) {
					digitCount += 1;
					if (digitCount === digitsBeforeCaret) {
						return index + 1;
					}
				}
			}
			return value.length;
		};

		const applyDevelopmentPhoneMask = () => {
			if (!fields.phone) return;
			const selectionStart = fields.phone.selectionStart ?? fields.phone.value.length;
			const digitsBeforeCaret = Math.min(getDevelopmentPhoneDigitCount(fields.phone.value.slice(0, selectionStart)), phoneMaxDigits);
			const digits = getDevelopmentPhoneDigits(fields.phone.value);
			const formattedValue = formatDevelopmentPhone(digits);
			fields.phone.value = formattedValue;

			if (document.activeElement === fields.phone && typeof fields.phone.setSelectionRange === 'function') {
				const caretPosition = getDevelopmentPhoneCaretPosition(formattedValue, Math.min(digitsBeforeCaret, digits.length));
				fields.phone.setSelectionRange(caretPosition, caretPosition);
			}
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
				if (digitsCount !== phoneMaxDigits) {
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

		fields.phone?.addEventListener('beforeinput', (e) => {
			if (e.inputType !== 'insertText') return;
			if (e.data && /\D/.test(e.data)) {
				e.preventDefault();
			}
		});
		fields.phone?.addEventListener('input', applyDevelopmentPhoneMask);
		fields.phone?.addEventListener('change', applyDevelopmentPhoneMask);

		['input', 'change'].forEach(eventName => {
			[fields.phone, fields.email].forEach(field => {
				field?.addEventListener(eventName, () => {
					setChannelError('');
					setFieldError(fields.phone, 'development-contact-phone-error');
					setFieldError(fields.email, 'development-contact-email-error');
				});
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
		if (form?.matches?.('[data-development-contact-form], [data-modal-contact-form]')) return;
		const sourceModal = form.closest('.modal');
		if (!sourceModal || activeModal !== sourceModal) return;

		form?.querySelector('.cf7sg-response-output')?.style.setProperty('display', 'none');
		if (modalSend) {
			closeModal(sourceModal, { unlockScroll: false });
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

	// Project Tags
	const tags = document.querySelectorAll('.main--cases__tags .tag');
	const cases = document.querySelectorAll('.main--cases__block');
	if (tags.length && cases.length) {
		tags.forEach(tag => {
			tag.addEventListener('click', () => {
				tags.forEach(t => t.classList.remove('active'));
				tag.classList.add('active');
				const filter = tag.getAttribute('data-filter');
				cases.forEach((block, index) => {
					block.classList.toggle('active', filter === '*' ? index === 0 : block.getAttribute('data-type') === filter);
				});
			});
		});
	}

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
