@echo off
REG ADD "HKLM\SOFTWARE\Policies\Google\Chrome" /v ExtensionManifestV2Availability /t REG_DWORD /d 2 /f
timeout /t 1 >nul
echo 请手动在 Chrome 中打开 chrome://policy/ 并点击“重新加载政策”
pause

Chrome 138.0.7204.101 及之后的版本无法按上述这样直接开启对Manifest v2 扩展程序的支持，如果你发现操作后无效，可以试试下边这个方法：

打开 chrome 浏览器
访问chrome://flags/#temporary-unexpire-flags-m137，将最后参数改为「Enabled」（注意：这个 m137 是 Chrome 版本为 138 时的结果，Chrome版本是139时，这个参数会变成chrome://flags/#temporary-unexpire-flags-m138 请以此类推，尝试那个最大的数）
重启 Chrome 浏览器（注意：要彻底重启，不要残留后台进程，不然你是看不到后面这些东西的）
依次访问如下地址，并设置为对应参数
chrome://flags/#extension-manifest-v2-deprecation-warning 
#设置为[Disabled]
chrome://flags/#extension-manifest-v2-deprecation-disabled 
#设置为[Disabled]
chrome://flags/#extension-manifest-v2-deprecation-unsupported 
#设置为[Disabled]
chrome://flags/#allow-legacy-mv2-extensions 
#设置为[Enabled]
