#!/bin/sh

GOOGLE_TAG="<!-- Google tag (gtag.js) --><script async src=\"https://www.googletagmanager.com/gtag/js?id=G-V361P3KSWH\"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-V361P3KSWH');</script>"

for filename in *.md; do
    [ -e "$filename" ] || continue
    clean=$(basename "$filename" .md)
    if [ "$clean" = "index" ]; then
        lowdown -s \
            --html-no-skiphtml \
            --html-no-escapehtml \
            --html-hardwrap \
            -mtitle="Om Raheja - Entrepreneur & Software Engineer" \
            -mcss=style.css \
            -M htmlheader='<meta name="description" content="Om Raheja. Entrepreneur and software engineer. High School North Class of 2026. Creator of aquarc and codeabode.">'"$GOOGLE_TAG" \
            "$filename" > "$clean.html"
    else
        lowdown -s \
            --html-no-skiphtml \
            --html-no-escapehtml \
            --html-hardwrap \
            -mtitle="$clean" \
            -mcss=style.css \
            -M htmlheader="$GOOGLE_TAG" \
            "$filename" > "$clean.html"
    fi
done
