LUKS Alpine Setup

Two weeks ago, my friend gave me his SSD because the hard drive on my laptop was failing. Without much difficulty, I was able to replace the drive even though it was my first time. Since I've used [Void Linux](https://voidlinux.org) for more than a year, I decided it was time to give [Alpine Linux](https://alpinelinux.org) a try, which is notoriously famous for being one of the smallest linux distros. Since I couldn't find a well documented guide to install Alpine with disk encryption, I made one myself.

The harder part was figuring out how to install Alpine Linux with disk encryption on a MBR system. With that, let's get started.

1. Downloading and burning Alpine to a USB
2. Setting up the live environment
3. Creating the crypt disk
4. Mounting and installing
5. Chrooting and rebooting

This guide is based heavily off of [this guide](https://www.msiism.org/files/doc/alpine-linux-fde-custom.html), but it required a significant amount of trial and error before I got the commands working correctly. The purpose of this guide is to bring that one up to date.

#### Download and burn Alpine
The first, most obvious step is to obtain an Alpine ISO. These can be found on [their website](https://alpinelinux.org/downloads/). 

If you are on linux, you can burn the ISO using the following command:

    dd if=/path/to/alpine.iso of=/dev/sdX bs=1M

Where alpine.iso points to the iso and /dev/sdX points to the USB. On Windows, use [balenaEtcher](https://etcher.balena.io/) or [Rufus](https://rufus.ie).

Now, just boot into the USB using the specific function key your board uses.

#### Set up the environment
You want to run the following command until it starts to setup users and partition disks:

    setup-alpine

It should take care of most of the manual setup. CTRL+C to exit once you get to that point. If you have trouble with WiFi hardware as I do on my system, you want to issue a combination of the following commands:

    setup-interfaces
    # if you still can't connect afterward
    ip link set wlan0 up
    ip link set eth0 down
    rc-service networking restart

After obtaining an IP address, you can proceed with the `setup-alpine` command. 

Now, add the necessary packages:

    apk add cryptsetup e2fsprogs grub grub-bios lvm2 mkinitfs util-linux

#### Create the crypt disk

Randomize the disk prior to running any cryptsetup commands.
    
    dd if=/dev/urandom of=/dev/sda bs=1M

Subsitute /dev/sda with your main disk. This command takes some time, so keep yourself busy with some other activity. I went out on the snow.

Write your partition table using fdisk or cfdisk. Create a partition that starts from a sector far away from the boot signature, such as 2048. If your device sets the default to a double digit value, manually set it to 2048.

Scan for the new device nodes:

    mdev -s

Setup the container, replacing "name" with any string of your choice:

    cryptsetup open /dev/sda1 name
    pvcreate /dev/mapper/name

    vgcreate vg0 /dev/mapper/name

Now create logical volumes. I made one for root and for home but you can make as many as you want. 

    lvcreate -L 2G vg0 -n swap
    lvcreate -L 30G vg0 -n root
    lvcreate -l 100%FREE vg0 -n home

Format them:

    mkswap -L alpine-swap /dev/vg0/swap
    mkfs.ext4 -L alpine-root /dev/vg0/root
    mkfs.ext4 -L alpine-home /dev/vg0/home

    swapon /dev/vg0/swap

#### Mount and install
Due to `setup-alpine` having configured everything else for you, all that needs to happen now is mounting the disk and installing files.

    mount -t ext4 /dev/vg0/root /mnt
    mkdir -p /mnt/home
    mount -t ext4 /dev/vg0/home /mnt/home

And account for any additional partitions you may have created.

Use the setup-disk command:

    setup-disk -m sys /mnt

#### Chroot and reboot
And now your task is quite simple. 

    mount --rbind /proc /mnt/proc
    mount --rbind /dev /mnt/dev
    mount --rbind /sys /mnt/sys

    chroot /mnt

Grab the UUID of the disk:

    blkid -s UUID -o value /dev/sda1 >> /etc/default/gnvrub

Set the file to the following:

    GRUB_TIMEOUT=2
    GRUB_DISABLE_SUBMENU=y
    GRUB_DISABLE_RECOVERY=true
    GRUB_ENABLE_CRYPTODISK=y
    GRUB_CMDLINE_LINUX_DEFAULT="modules=sd-mod,usb-storage,ext4 cryptroot=UUID=283ca385-4c57-40f1-842b-6beda9c3daf1 cryptdm=vault cryptkey quiet rootfstype=ext4"

Make a cryptkey to avoid entering the password twice on boot:

    dd bs=512 count=4 if=/dev/urandom of=/crypto_keyfile.bin
    chmod 000 /crypto_keyfile.bin
    cryptsetup luksAddKey /dev/sda1 /crypto_keyfile.bin

    vi /etc/mkinitfs/mkinitfs.conf
    # add the "cryptkey" flag to features

Generate an initfs:

    mkinitfs -c /etc/mkinitfs/mkinitfs.conf kernel_version

Choose the latest kernel version from the following:
    
    ls /lib/modules

Now install GRUB

    grub-install /dev/sda
    grub-mkconfig -o /boot/grub/grub.cfg

Enable swap:

    printf 'UUID=%s  swap  swap  defaults  0 0\n' "$(blkid -s UUID -o value /dev/vg0/swap)" >> /etc/fstab
    rc-update add swap boot

Create a normal user: 
    
    setup-user -a -g 'audio video cdrom netdev'

And reboot.

#### After installation

First, ensure you have access to the repositories you want:

    vi /etc/apk/repositories

Unless you live under a rock, you will need graphical programs such as a web browser. 

    setup-xorg-base

After you have xfce4 or some UI working, you can proceed to install whatever WM your browser you use. The following drivers will be useful:

    apk add xf86-input-evdev wireless-tools wpa_supplicant linux-firmware-i915

Now, for the most part your system is ready to use. Your system will be fast; but MUSL will not permit you to use most packages normally.

If you liked my guide, check out [repairing a broken luks config](/blog/repair-broken-luks-grub-config.html). I'm still working on porting BashBlog to Alpine, please excuse the appearance of my blog.

Tags: guide, waste-of-time
