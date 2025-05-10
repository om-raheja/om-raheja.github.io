for filename in *.md; do
    [ -e "$filename" ] || continue
    clean=$(basename "$filename" .md)
    if [ "$clean" = "index" ]; then
        # Custom processing for index.md with title and meta description
        lowdown -s \
            --html-no-skiphtml \
            --html-no-escapehtml \
            --html-hardwrap \
            -mtitle="Om Raheja - Entrepreneur & Software Engineer" \
            -mcss=style.css \
            -M htmlheader='<meta name="description" content="Om Raheja. Entrepreneur and software engineer. High School North Class of 2026. Creator of aquarc and codeabode.">' \
            "$filename" > "$clean.html"
    else
        # Default processing for other pages
        lowdown -s \
            --html-no-skiphtml \
            --html-no-escapehtml \
            --html-hardwrap \
            -mtitle="$clean" \
            -mcss=style.css \
            "$filename" > "$clean.html"
    fi
done
