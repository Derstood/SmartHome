@echo off
REG ADD "HKLM\SOFTWARE\Policies\Google\Chrome" /v ExtensionManifestV2Availability /t REG_DWORD /d 2 /f
timeout /t 1 >nul
echo 请手动在 Chrome 中打开 chrome://policy/ 并点击“重新加载政策”
pause