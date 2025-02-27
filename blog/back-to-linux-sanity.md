Back to Linux Sanity

It took me two months and eight days to realize how important convenience is to me. 

---

In mid-February, I received an SSD to replace the outdated spinning disk in my laptop. Having used [Void Linux](https://voidlinux.org) on my laptop since I first installed Linux, I thought it would be a good idea to try out [Alpine Linux](https://alpinelinux.org). Initially, the setup was a bit tedious, but once I got started, the user experience was fantastic: packages installed almost instantly, the computer was quick and nimble in its computations, and the software I needed was readily available.

However, it didn't take long to realize that [Alpine Linux](https://alpinelinux.org) wasn't well-suited for all situations. The operating system struggled with a higher number of packages and computationally intensive operations. For example, setting up a cryptodisk increased my boot time to about two minutes, and after installing LibreOffice, it took much longer to install additional packages. I eventually had to create a chroot just to work with [PyTorch](https://pytorch.org), [Mojo](https://mojolang.org), and [checkra1n](https://checkra.in) on my iPhone.

[Alpine Linux](https://alpinelinux.org) is only ideal for specific use cases. The decision to remove GNU C extensions reinforces the importance of application portability and offers users a choice, but it also sacrifices usability when working with advanced applications. For instance, kdenlive crashed during an assignment for my class and would segfault every time I tried to load it again. After discussing the issue with the developers, I realized that I had a bad build, which might not even be the developers' fault – this incident made me appreciate the simplicity of using a more common Linux distribution.

One aspect of [Alpine Linux](https://alpinelinux.org) that I did appreciate was the manual pages. They were far better than any other distro I've used, providing detailed descriptions of how to use the software installed on my computer. This made it easy to find what I needed without having to consult the ArchWiki all the time. If it weren't for the need to work with applications linked to the GNU C library, I might have stuck with [Alpine Linux](https://alpinelinux.org) just for the manual pages.

I didn't want to go back to my previous lightweight and easy-to-use Linux distribution. Instead, I opted for [Devuan](https://devuan.org), a Debian distribution without systemd that is a bit lighter. The installer didn't take long, and my system was ready to use without any significant issues. My laptop now boots faster, although I did have to resolve some annoyances with the initramfs due to unclear instructions in the refractainstaller. [Devuan](https://devuan.org) seems to work well, and I was able to set up my minimal bspwm environment and transfer my old files relatively quickly. However, I do miss the 160 MB of RAM usage my laptop had on idle with [Alpine Linux](https://alpinelinux.org). [Devuan](https://devuan.org)'s caching increased my idle usage by almost 100 MB.

In conclusion, neither [Devuan](https://devuan.org) nor [Alpine Linux](https://alpinelinux.org) is a perfect solution, but the need for practicality outweighs my desire to be minimal. While I enjoyed the minimalism of [Alpine](https://alpinelinux.org), the convenience and faster boot times of [Devuan](https://devuan.org) ultimately won me over.

Tags: reflection, waste-of-time, development
