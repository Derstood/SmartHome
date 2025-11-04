# windows
可以这样解决:[Chrome 如何继续使用 Manifest V2 扩展](https://www.tjsky.net/tutorial/1009)

# mac
1. 选择**google-chrome-137-0-7151-104.dmg** 版本
2. 之后在浏览器地址中访问并设置flag：
```
#设置为[Disabled]
chrome://flags/#extension-manifest-v2-deprecation-warning
chrome://flags/#extension-manifest-v2-deprecation-disabled
chrome://flags/#extension-manifest-v2-deprecation-unsupported

#设置为[Enabled]
chrome://flags/#allow-legacy-mv2-extensions
```

3. 禁止更新
```bash
cd ~/Library/Google/GoogleSoftwareUpdate
rm -rf GoogleSoftwareUpdate.bundle

cd ~/Library/Google
sudo chown root:wheel GoogleSoftwareUpdate
```
