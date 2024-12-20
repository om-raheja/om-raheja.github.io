Petition Signing Finally Setup!

Before, you had to send me an email, or be lucky enough to be at my in person signing events to sign my petition... but no longer! You can now sign the petition on the homepage or [here](/petition.html). It only took me 2 days to reprogram the site, it being static initially...

#### How did you do it?
The petition signing uses a raw HTML form. I wanted the frontend to be as minimalist as possible and for most of the work to be handled by the backend, which did pose some pretty big difficulties.

The config for the server currently looks something like this:

    server "omraheja.us.to" {
        listen on * port 80
        root "/htdocs/omraheja.us.to"

        location "/pub/*" {
            directory auto index
        }
    }

OpenBSD httpd is pretty straightforward, so all I did was change it to this: 

    server "omraheja.us.to" {
        listen on * port 80
        root "/htdocs/omraheja.us.to"

            location "/pub/*" {
                directory auto index
            }

            location "/vote.cgi" {
                fastcgi socket "/run/slowcgi.sock"
                root "/cgi-bin"
            }
    }

...and then in /cgi-bin I wrote about 200 lines of vulnerable C. It's really been a while, I had almost forgotten how to use stdio's file API.

#### Hardest parts
This project is not complicated at all, it was just frustrating; it managed to prove how rough my C programming had became.

You may ask why I chose C for such a project. Typically for CGI scripts, perl is used for its simplicity and support. The thing is, perl is an interpretive language, and this tiny vm I'm using has very limited resources. Having to run an actual executable instead of reading files is already a lot slower, so why not just put it in a native, compiled, language?

Besides, I've been using C as my main language for 2 years. On the rare occasion that I decide to code, C is almost always my language of choice.

That being said, the hardest part was supporting application/x-www-url-formencoded. Parsing it myself actually wasn't that difficult once I realized that anything thats not alphanumerical or a period will be encoded as a hex with a % sign before. 

strtol(3) is pretty garbage for this job, so I decided to parse it myself. For something like `%2a` in 

    name=om%2a

The respective C code was as simple as:

    real = (hex_to_char(first) << 4) | hex_to_char(second);

In simple words, it converts the '2' to a 2 and stores it in the upper 4 bits and 'a' to 10 and stores it in the lower 4 bits. It's pretty efficient.

Once I relearned the file API and figured out how to make it append to a csv file, I had to mess around with permissions for the chroot directory until I realized a simple `chmod a+w signatures.csv` would do the job.

The biggest problem right now is ratelimiting, because I don't want bot based spam. I don't want to IP rate limit, because then I will have a lot of trouble at public signing events.

The final solution to this would be to implement something like [SimpleCaptcha](https://simplecaptcha.sourceforge.net/). It could be implemented easily server side and would require little to no JavaScript. It's not so annoying that it would prevent public signing events, but would allow only the more advanced bots to spam my form.

#### Source code?
I love making my projects open source, and this is no exception. I'm going to get a git hosted locally soon for my organization. 

Tags: coding, waste-of-time

