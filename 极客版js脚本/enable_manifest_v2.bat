@echo off
REG ADD "HKLM\SOFTWARE\Policies\Google\Chrome" /v ExtensionManifestV2Availability /t REG_DWORD /d 2 /f
timeout /t 1 >nul
echo ���ֶ��� Chrome �д� chrome://policy/ ����������¼������ߡ�
pause