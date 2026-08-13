#CenterOs安装Node.js
1. cd /usr/local/src 
2. wget http://nodejs.org/dist/v0.10.24/node-v0.10.24.tar.gz
3. tar zxvf node-v0.10.24.tar.gz
4. cd node-v0.10.24
5. ./configure --prefix=/usr/local/node/0.10.24
6. make
7. make install
8. (报错：无g++,不出错可省略)yum install gcc gcc-c++，make install
9. Node.js加入环境变量
10. vim /etc/profile,在export PATH USER LOGNAME MAIL HOSTNAME HISTSIZE HISTCONTROL上面加上
```
#set for nodejs
export NODE_HOME=/usr/local/node/0.10.24
export PATH=$NODE_HOME/bin:$PATH

export PATH USER LOGNAME MAIL HOSTNAME HISTSIZE HISTCONTROL
```
11. source /etc/profile
12. node -v检查是否正确

##Mac ssh
`ssh root@60.205.210.49`
