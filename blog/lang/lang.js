// Site-wide language picker.
//
// Every page carries a <details class="lang-nav site-nav"> in its header.
// The Hindi / romanized / English variant links are baked into the HTML by
// bb.sh at build time, so switching language works with no JS at all. This
// script only enhances that markup:
//   1. reads the stored language choice (localStorage key: blog.lang)
//   2. highlights the chosen/current language in the picker
//   3. remembers new choices so return visits land on the same language
//   4. auto-opens the picker on a visitor's first visit
//
// List pages (index.html, all_posts.html, all_tags.html, tag_*.html) are
// built in three real language variants, so if the visitor has a stored
// choice that differs from the page they're on, this script redirects to
// the matching variant (the picker's baked links already point there).
// Post pages only switch when the post has translated siblings; posts that
// exist in only one language get no-op (#) links from bb.sh.
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

    // Whole-page language switch: on list pages honor the stored choice by
    // loading that variant. Guarded by hasStored so a fresh visitor isn't
    // yanked away from an explicitly requested URL (the picker auto-opens
    // instead); the variant pages themselves match, so no loop.
    if (isList && hasStored && stored !== curLang) {
        location.replace(baseName + FILE[stored]);
        return;
    }

    // The links already carry their real hrefs from bb.sh; add click
    // handling so the choice is remembered and no-op (#) links dismiss the
    // picker instead of scrolling to the top of the page.
    links.forEach(function (a) {
        var lang = a.getAttribute('data-lang');
        var isCurrent = lang === curLang;

        if (isCurrent) a.classList.add('lang-active');

        a.addEventListener('click', function (e) {
            try { localStorage.setItem(KEY, lang); } catch (err) {}
            stored = lang;
            reflectChoice();
            if (a.getAttribute('href') === '#') {
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