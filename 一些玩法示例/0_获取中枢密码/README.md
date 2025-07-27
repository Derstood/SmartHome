# 自动获取小米中枢网关的登录密码


## 原理
1. 发post请求
2. 解析返回
3. 将返回直接粘贴到输入框中自动验证并跳转

## 一、Win / MacOS 平台
[实现效果](https://v.douyin.com/p8sAPpB-mMI)
### 知识储备
1. 抓包软件的使用
2. 暴力猴扩展的使用

### 输入
#### 一个暴力猴脚本
[脚本源码](../../极客版js脚本/monkey_get_xiaomi_passwd.js)

#### 一个抓包文件
[post格式](post请求的格式样例.txt)<br>
1. url 
2. header 
3. body<br> 
三部分之间需要用**空行隔开**

### 使用步骤
1. 添加[暴力猴](../../极客版js脚本/monkey_get_xiaomi_passwd.js)脚本
2. 首次使用需要上传一个[抓包文件](post请求的格式样例.txt)

## 二、ios / ipadOS 平台
[实现效果](https://v.douyin.com/efV99u0Ulws)
### 知识储备
1. 抓包软件的使用
2. 快捷指令的使用
3. scriptable app的使用
4. safari浏览器的userscript扩展的使用

### 输入
#### 一个scriptable脚本
[post_send.js脚本内容](post_send.js)

#### 一个抓包文件
[post格式](post请求的格式样例.txt)<br>
1. url 
2. header 
3. body<br> 
三部分之间需要用**空行隔开**

#### 一个快捷指令：
 ![快捷指令.jpeg](%E5%BF%AB%E6%8D%B7%E6%8C%87%E4%BB%A4.jpeg)

#### 一个userscript脚本
[auto_fill.js脚本内容](auto_fill.js)

### 使用步骤
1. 快捷指令调用scriptable应用运行，输入[post格式](post请求的格式样例.txt)的文件，输出验证码
2. 快捷指令open极客版url，同时把**验证码**用?的方式传入参数
3. safari浏览器安装userscript脚本，负责将验证码自动填入
