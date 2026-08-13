#Linux目录结构
- 蓝色：表示目录
- 青色：表示连接
- 黑色：表示文件

##/
- bin        :  用户二进制目录
- sbin       :  系统二进制目录
- etc        :  配置文件目录
- dev        :  设备文件目录
- proc       :  进程信息目录
- var        :  变量文件目录
- tmp        :  临时文件目录
- usr        :  用户程序目录
- home       :  主页目录
- boot       :  启动目录
- lib        :  系统库目录
- opt        :  可选附件应用目录
- mnt        :  安装目录
- media      :  可卸载设备目录
- srv        :  服务数据目录

### ／根目录
每一个文件和目录从根目录开始，周游root用户具有该目录的写权限。

### ／bin 用户二进制文件
包含了二进制可执行文件。
在单用户模式下，需要使用的常见Linux命令都位于此目录下，用户所有用户使用的命令都在这里。
例如：mkdir,ls

### ／sbin 系统二进制文件
就像/bin，/sbin同样也包含二进制可执行文件。
但是，在这个目录下的linux命令通常由系统管理员使用，对系统进行维护。例如：iptables、reboot、fdisk、ifconfig、swapon命令

### /etc - 配置文件
包含所有程序所需的配置文件。
也包含了用于启动/停止单个程序的启动和关闭shell脚本。例如：/etc/resolv.conf、/etc/logrotate.conf

### /dev - 设备文件
包含设备文件。
这些包括终端设备、USB或连接到系统的任何设备。例如：/dev/tty1、/dev/usbmon0

### /proc - 进程信息
包含系统进程的相关信息。
这是一个虚拟的文件系统，包含有关正在运行的进程的信息。例如：/proc/{pid}目录中包含的与特定pid相关的信息。
这是一个虚拟的文件系统，系统资源以文本信息形式存在。例如：/proc/uptime

### /var - 变量文件
var代表变量文件。
这个目录下可以找到内容可能增长的文件。
这包括 - 系统日志文件（/var/log）;包和数据库文件（/var/lib）;电子邮件（/var/mail）;打印队列（/var/spool）;锁文件（/var/lock）;多次重新启动需要的临时文件（/var/tmp）;

### /tmp - 临时文件
包含系统和用户创建的临时文件。
当系统重新启动时，这个目录下的文件都将被删除。

### /usr - 用户程序
包含二进制文件、库文件、文档和二级程序的源代码。
/usr/bin中包含用户程序的二进制文件。如果你在/bin中找不到用户二进制文件，到/usr/bin目录看看。例如：at、awk、cc、less、scp。
/usr/sbin中包含系统管理员的二进制文件。如果你在/sbin中找不到系统二进制文件，到/usr/sbin目录看看。例如：atd、cron、sshd、useradd、userdel。
/usr/lib中包含了/usr/bin和/usr/sbin用到的库。
/usr/local中包含了从源安装的用户程序。例如，当你从源安装Apache，它会在/usr/local/apache2中。

### /home - HOME目录
所有用户用home目录来存储他们的个人档案。
例如：/home/john、/home/nikita

### /boot - 引导加载程序文件
包含引导加载程序相关的文件。
内核的initrd、vmlinux、grub文件位于/boot下。
例如：initrd.img-2.6.32-24-generic、vmlinuz-2.6.32-24-generic

### /lib - 系统库
包含支持位于/bin和/sbin下的二进制文件的库文件.
库文件名为 ld*或lib*.so.*
例如：ld-2.11.1.so，libncurses.so.5.7

### /opt - 可选的附加应用程序
opt代表可选的。
包含从个别厂商的附加应用程序。
附加应用程序应该安装在/opt/或者/opt/的子目录下。

### /mnt - 挂载目录
临时安装目录，系统管理员可以挂载文件系统。

### /media - 可移动媒体设备
用于挂载可移动设备的临时目录。
举例来说，挂载CD-ROM的/media/cdrom，挂载软盘驱动器的/media/floppy;

### /srv - 服务数据
srv代表服务。
包含服务器特定服务相关的数据。
例如，/srv/cvs包含cvs相关的数据。






