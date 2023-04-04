公司新的项目采用了umi3+dva+antd（antdpro-compoent）的技术栈，在开发和配置的时候开箱即用还是很爽的，但在用Jenkins自动化部署的时候，却怎么打包都失败 

> Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory

大致意思就是 堆限制分配附近的无效标记压缩失败 - JavaScript堆内存不足
经过百度发现在打包数量很多的时候node内存可能会不够用，但本机电脑是可以正常打包的，而且是个新项目，根本不存在很多包的问题，在使用umi2的时候并没有此类问题出现，于是猜测可能是umi3新的某些东西导致的，umi3和umi2有个很大的不同是umi3可以启用mfsu和webpack5，为了代码的编译速度也确实启用了这两个功能，注释这两个配置后，打包正常，问题解决。
但在shell脚本执行时

> cp: omitting directory ‘dist/static’
Build step 'Execute shell' marked build as failure

cp 命令加 -r就行