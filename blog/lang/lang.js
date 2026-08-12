// Site-wide language picker.
//
// Every blog page carries the same <details class="lang-nav site-nav">
// markup in its header. This script:
//   1. reads the stored language choice (localStorage key: blog.lang)
//   2. fills in the picker links so they point at the current page's
//      Hindi / romanized / English variants
//   3. remembers new choices and reflects them in the picker itself
//
// List pages (index.html, all_posts.html, all_tags.html, tag_*.html) are
// built in three real language variants, so choosing a language there
// navigates to the matching variant and the whole page changes (header,
// footer and every listed post). On visits where the stored language
// differs from the current list page, the matching variant is loaded.
// Post pages only switch when the post actually has translated siblings:
// the picker links are read from the post's own title anchor (data-hi /
// data-rom / data-en), which bb.sh only emits when siblings exist.
(function () {
    'use strict';

    var KEY = 'blog.lang';
    var LABELS = { hi: 'हिन्दी', rom: 'hindi', en: 'English' };
    var FILE = { hi: '.html', rom: '-romanized.html', en: '.en.html' };

    var stored = null;
    var hasStored = false;
    try {
        stored = localStorage.getItem(KEY);
        hasStored = stored !== null;
    } catch (e) {}
    if (!stored || !LABELS[stored]) stored = 'hi';

    var picker = document.querySelector('.lang-nav.site-nav');
    if (!picker) return;
    var links = picker.querySelectorAll('a[data-lang]');
    if (!links.length) return;
    var summary = picker.querySelector('summary');

    // Pathnames are percent-encoded for Devanagari filenames, decode them.
    var file = '';
    try { file = decodeURIComponent(location.pathname.split('/').pop() || 'index.html'); }
    catch (e) { file = 'index.html'; }

    // Current page language and its base (variant-less) page name
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

    // A list page has its own trilingual variants; everything else is a post.
    var isList = !!baseName && (
        baseName === 'index' ||
        baseName === 'all_posts' ||
        baseName === 'all_tags' ||
        baseName.indexOf('tag_') === 0
    );

    // For posts, the real variant URLs come from the post's own title
    // anchor; bb.sh only emits them when translated siblings exist.
    var postVars = {};
    if (isList === false && baseName) {
        var anchor = document.querySelector('h3 a[data-hi]');
        if (anchor) {
            postVars.hi = anchor.getAttribute('data-hi');
            postVars.rom = anchor.getAttribute('data-rom');
            postVars.en = anchor.getAttribute('data-en');
        }
    }

    // Whole-page language switch: on list pages honor the stored choice by
    // loading that variant. Guarded by hasStored so a fresh visitor isn't
    // yanked away from an explicitly requested URL (the picker auto-opens
    // instead); the variant pages themselves match, so no loop.
    if (isList && hasStored && stored !== curLang) {
        location.replace(baseName + FILE[stored]);
        return;
    }

    links.forEach(function (a) {
        var lang = a.getAttribute('data-lang');
        var target = null;
        if (isList) {
            target = baseName + FILE[lang];
        } else if (postVars[lang]) {
            target = postVars[lang];
        }
        var isCurrent = lang === curLang;

        if (target) {
            a.href = target;
            a.removeAttribute('data-nolink');
        } else {
            a.setAttribute('data-nolink', '1');
        }
        if (isCurrent) a.classList.add('lang-active');

        a.addEventListener('click', function (e) {
            try { localStorage.setItem(KEY, lang); } catch (err) {}
            stored = lang;
            reflectChoice();
            if (!target) {
                e.preventDefault();
                picker.removeAttribute('open');
                return false;
            }
            return true;
        });
    });

    // Show which language is chosen (or emphasise the current page's one)
    function reflectChoice() {
        var chosen = stored || (isList ? curLang : null);
        links.forEach(function (a) {
            a.classList.toggle('lang-active', a.getAttribute('data-lang') === chosen);
        });
        if (summary && chosen && LABELS[chosen]) {
            summary.textContent = LABELS[chosen] + ' \u2713';
            picker.setAttribute('lang', chosen);
        }
    }

    // First visit: open the picker so the three choices are plainly visible
    if (!hasStored && curLang === 'hi') {
        picker.setAttribute('open', 'open');
    }

    reflectChoice();
})();