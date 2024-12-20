for filename in *.md; do
    [ -e "$filename" ] || continue
	clean=$(basename $filename .md)
	lowdown \
		-s \
		--html-no-skiphtml \
		--html-no-escapehtml \
		--html-hardwrap \
		-mtitle=$clean \
		-mcss=style.css \
		$filename \
		> $clean.html
done
