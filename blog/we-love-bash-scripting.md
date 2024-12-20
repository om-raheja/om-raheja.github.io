We love bash scripting!

As I was in the throes of configuring my mail client, I was jolted back to reality by the sight of my unfinished chemistry homework. Without a moment to lose, I seized the paper and gave it a quick once-over. It became apparent that I needed to meticulously label and number the axes of the graph.

For the x-axis, I had 38 points to mark. Swiftly, I assigned numbers from 0 to 14, allotting 2 boxes for each. The simplicity of this task spared me any complex mental gymnastics. However, the real challenge was yet to come.

The y-axis was a daunting grid of 50 boxes, needing to be numbered from -200 to 250. The thought of doing the calculations mentally was unappealing, to say the least. So, I turned to a more efficient solution - a bash script that would do the work for me in a matter of seconds.

I promptly opened a new file and embedded the following script:

    #!/bin/bash
    num=-200

    while [ "$num" != 250 ] ; do
        echo $num
        num=$(expr $num + 9)
        read e
    done


My task was simplified to merely reading a number and pressing enter to label the next cell.

This, I believe, is the true beauty of coding. It empowers you to automate simple tasks in a blink, saving precious time and effort that a machine can spare. While there are numerous reasons to create full-fledged programs, like the neovim I'm using for this post, the real value for an average person lies in these small yet significant automations.

This journey with the command line began two years ago and since then, my efficiency with technology has grown leaps and bounds. Why should I twiddle my thumbs waiting for Gmail to load, when I can swiftly navigate my emails using keyboard keys via the command line? Why waste a minute loading YouTube (or Invidious, for that matter) when I can simply run ytfzf from my local terminal, opening mpv to enjoy videos while multitasking on my homework?

So, here's to a safe and enlightening journey with bash scripting!

Tags: development, command-line
