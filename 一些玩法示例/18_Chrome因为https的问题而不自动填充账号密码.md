# Chrome因为https的问题而不自动填充账号密码

## 根因 
chrome会将部分网址(以局域网为例)从hhtp自动转为https，然后就不能填充密码了。
将如下内容写到一个名为**chrome_http_lan.reg**的文件中运行注册表:
```
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome]
"InsecureOriginsToTreatAsSecure"=hex(0):68,00,74,00,74,00,70,00,3a,00,2f,00,2f,00,31,00,39,00,32,00,2e,00,31,00,36,00,38,00,2e,00,30,00,2e,00,30,00,2f,00,31,00,36,00,00,00
```
这里是将192.168.x.x的全部指定为安全网站的遍历内容(chrome目前不支持*匹配)。
如果有部分想自定义的，可以在
[chrome flag 设置](chrome://flags/#unsafely-treat-insecure-origin-as-secure)里加入，一行一个
