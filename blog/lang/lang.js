// Site-wide language picker.
//
// Every blog page carries the same <details class="lang-nav site-nav">
// markup in its header. This script:
//   1. reads the stored language choice (localStorage key: blog.lang)
//   2. rewrites the picker links so they point at the current page's
//      Hindi / romanized / English variants
//   3. remembers new choices and reflects them in the picker itself
// On list pages (index, tags, archive) choosing a language also rewrites
// every listed post link to the chosen variant where one exists, so the
// switch visibly works there too. There is no silent redirect anywhere.
(function () {
    'use strict';

    var KEY = 'blog.lang';
    var LABELS = { hi: 'हिन्दी', rom: 'hindi', en: 'English' };
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    if (!stored || !LABELS[stored]) stored = 'hi'; // default to Hindi

    var picker = document.querySelector('.lang-nav.site-nav');
    if (!picker) return;
    var links = picker.querySelectorAll('a[data-lang]');
    if (!links.length) return;
    var summary = picker.querySelector('summary');

    // Pathnames are percent-encoded for Devanagari filenames, decode them.
    var file = '';
    try { file = decodeURIComponent(location.pathname.split('/').pop() || 'index.html'); }
    catch (e) { file = 'index.html'; }

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
                 baseName.indexOf('all_tags') === -1 &&
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
            rewriteListLinks();
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

    // On list pages (index, tags, all_posts) every post link carries
    // data-hi/data-rom/data-en variant URLs (emitted by bb.sh for posts that
    // actually have siblings). Point them at the chosen language so the
    // picker visibly does something on pages without their own variants.
    function rewriteListLinks() {
        if (isPost) return;
        var ch = stored || 'hi';
        document.querySelectorAll('a[data-hi]').forEach(function (a) {
            var key = ch === 'en' ? 'data-en' : ch === 'rom' ? 'data-rom' : 'data-hi';
            var variant = a.getAttribute(key);
            if (variant) a.href = variant;
        });
    }

    // First visit: open the picker so the three choices are plainly visible
    if (!localStorage.getItem(KEY)) {
        picker.setAttribute('open', 'open');
    }

    reflectChoice();
    rewriteListLinks();

    function curLangChar() {
        return curLang === 'en' ? 'e' : curLang === 'rom' ? 'r' : 'h';
    }
})();
