Repair broken luks GRUB config

I was messing with my computer's grub configuration because I didn't like entering my password multiple times. After clicking on a random StackExchange link and doing exactly as it said, I quickly ran into some kernel panics on the next boot.

If you are stuck in a similar situation, not to worry! Your computer will be in prime condition in no time... or at the minimum you will be able to get your files back.

The process:

1. Obtain a USB & burn Alpine

2. Install cryptsetup and lvm2 on Alpine

3. Mount your system to /mnt and chroot

4. Edit your grub config and reboot

#### Alpine USB

If you have a bootable USB lying around, go ahead and use it. Alpine is used for this guide due to its usability. Note that the instructions may differ.

Otherwise, for the purpose of this guide [burn a 200 MB disk image](https://alpinelinux.org/downloads/) to the Alpine USB. Should be finished rather quick.

Boot using the USB and enter `root` when prompted for login. There is no password.

#### Prepare the tools

The quickest way to get everything setup is to run `setup-alpine`. Once the script prompts you to add a new user or create partitions on the disk, **do not proceed.** Exit the script with `CTRL+C`.

I did have a few issues getting wlan0 to start properly. If you have those, please exit the installer and run `setup-interfaces`. If this does not work, do the following:

    ip link set wlan0 up
    ip link set eth0 down

Run `wpa_supplicant` manually to connect to the network. Try running `udhcpc` if you cannot ping any IP addresses.

Once the network is working, run the following:

    apk add cryptsetup lvm2 lsblk

Now, all we need to do is mount the system. First, let's decrypt the disk.

    lsblk

Once you find the disk name (/dev/sda most likely), find the partition you want to mount (probably /dev/sda1) and decrypt it.

    cryptsetup luksOpen /dev/sda1 vault

Enter your password. Now you want to activate the volume group so you can mount partitions as necessary.

Obtain the volume name from the following command:

    vgscan

Activate the volume:

    vgchange -ay [name]

Read your logical volume table:

    lvscan
    lvs


And now you are equipped with which volumes need to be mounted, and hopefully you remember where they were mounted on your system.

#### Chroot

This depends on your exact volume table, but for simplicity mount all the volumes. If you aren't sure, just mount the ones that can give you access to the grub configurations at `/etc/default/grub` and `/boot/grub/grub.cfg` as well as any other needed files by grub.

Mount your volumes to /mnt. My table included the following:

1. vg0-root
2. vg0-home
3. vg0-swap

Skipping swap, I ran the following:

    mount -t ext4 /dev/vg0/root /mnt
    mount -t ext4 /dev/vg0/home /mnt/home

...even though I don't necessarily need the `/home` partition, it will still be useful in case I cannot repair my grub configuration.

Now, we just need to prepare the chroot:

    mount --bind /dev /mnt/dev
    mount --bind /sys /mnt/sys
    mount --bind /proc /mnt/proc

Chroot into the mounted filesystem

    chroot /mnt

And now, you're in!

#### Repair and reboot 

Usually, I note what changes I make to my grub file in comments and on a piece of paper if needed. In my case, I just had to edit `/etc/default/grub` and find the line I had to change. At this time, you have access to whatever editor and packages you had on your system before breaking grub, so use the editor of your choice.

After writing your changes, run the following:

    update-grub

Reboot into your repaired system. If you still have kernel panics, follow this guide again to troubleshoot or in a worst case scenario, back up your files and reinstall the OS.

Thank you for following my guide. Please let me know of any questions, comments, or concerns you may have. Be careful when modifying the grub config again!

Tags: development, guide
