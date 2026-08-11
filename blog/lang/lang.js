// Site-wide language picker.
//
// Every blog page carries the same <details class="lang-nav site-nav">
// markup in its header. This script:
//   1. reads the stored language choice (localStorage key: blog.lang)
//   2. rewrites the picker links so they point at the current page's
//      Hindi / romanized / English variants
//   3. remembers new choices and reflects them in the picker itself
// On pages without per-post variants (index, tags, archive) choosing a
// language stores the preference and visibly highlights it; there is no
// silent redirect anywhere.
(function () {
    'use strict';

    var KEY = 'blog.lang';
    var LABELS = { hi: 'हिन्दी', rom: 'hindi', en: 'English' };
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}

    var picker = document.querySelector('.lang-nav.site-nav');
    if (!picker) return;
    var links = picker.querySelectorAll('a[data-lang]');
    if (!links.length) return;
    var summary = picker.querySelector('summary');

    var file = (location.pathname.split('/').pop() || 'index.html');

    // Current page language and its base post name
    var curLang;
    var baseName;
    if (/\.en\.html$/.test(file)) {
        curLang = 'en';
        baseName = file.replace(/\.en\.html$/, '');
    } else if (/-romanized\.html$/.test(file)) {
        curLang = 'rom';
        baseName = file.replace(/-romanized\.html$/, '');
    } else if (/\.html$/.test(file)) {
        curLang = 'hi';
        baseName = file.replace(/\.html$/, '');
    } else {
        curLang = null;
        baseName = null;
    }

    var isPost = baseName && baseName !== 'index' &&
                 baseName.indexOf('all_posts') === -1 &&
                 baseName.indexOf('tag_') === -1;

    links.forEach(function (a) {
        var lang = a.getAttribute('data-lang')[0]; // h|r|e
        var suffix = lang === 'e' ? '.en.html' :
                     lang === 'r' ? '-romanized.html' : '.html';
        var target = (isPost && baseName) ? baseName + suffix : '#';
        var isCurrent = isPost && lang === curLangChar();

        if (target === '#') {
            a.setAttribute('data-nolink', '1');
        } else {
            a.href = target;
        }
        if (isCurrent) a.classList.add('lang-active');

        a.addEventListener('click', function (e) {
            try { localStorage.setItem(KEY, a.getAttribute('data-lang')); } catch (err) {}
            stored = a.getAttribute('data-lang');
            reflectChoice();
            if (target === '#') {
                e.preventDefault();
                picker.removeAttribute('open');
                return false;
            }
            return true;
        });
    });

    // Show which language is chosen (or emphasise the current page's one)
    function reflectChoice() {
        var chosen = stored || (isPost ? curLangChar() : null);
        links.forEach(function (a) {
            a.classList.toggle('lang-active', a.getAttribute('data-lang') === chosen);
        });
        if (summary && chosen && LABELS[chosen]) {
            summary.textContent = LABELS[chosen] + ' \u2713';
            picker.setAttribute('lang', chosen);
        }
    }

    // First visit: open the picker so the three choices are plainly visible
    if (!stored) {
        picker.setAttribute('open', 'open');
    }

    reflectChoice();

    function curLangChar() {
        return curLang === 'en' ? 'e' : curLang === 'rom' ? 'r' : 'h';
    }
})();