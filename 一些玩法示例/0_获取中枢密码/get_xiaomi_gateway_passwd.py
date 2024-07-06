import ctypes
import json
import sys
from time import sleep
import urllib.parse
import pyperclip
import requests
from typing import Dict, Optional

# 分配新的控制台
ctypes.windll.kernel32.AllocConsole()

# 设置控制台窗口标题
ctypes.windll.kernel32.SetConsoleTitleW("get xiaomi gateway passwd")

# 获取标准输出句柄
STD_OUTPUT_HANDLE = -11
h = ctypes.windll.kernel32.GetStdHandle(STD_OUTPUT_HANDLE)


# 定义 SMALL_RECT 结构体
class SMALL_RECT(ctypes.Structure):
    _fields_ = [("Left", ctypes.c_short),
                ("Top", ctypes.c_short),
                ("Right", ctypes.c_short),
                ("Bottom", ctypes.c_short)]


# 设置窗口大小
rect = SMALL_RECT(0, 0, 80, 6)
ctypes.windll.kernel32.SetConsoleWindowInfo(h, True, ctypes.byref(rect))

# 移动窗口位置
hwnd = ctypes.windll.kernel32.GetConsoleWindow()
if hwnd:
    ctypes.windll.user32.MoveWindow(hwnd, 100, 100, 300, 100, True)

# 重定向标准输出和标准错误流到新的控制台窗口
sys.stdout = open('CONOUT$', 'w')
sys.stderr = open('CONOUT$', 'w')


def parse_input(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    parse_headers = {}
    parse_data = {}
    parse_url = ""
    header_started = False
    data_started = False
    for line in lines:
        line = line.strip()
        # 第一行包含URL
        if line.startswith("POST"):
            parts = line.split(" ")
            if len(parts) >= 2:
                parse_url = parts[1]
            continue
        # 如果是空行，标记data部分的开始
        if not line:
            if header_started:
                data_started = True
            else:
                header_started = True
            continue
        # 根据data_started标志判断当前行属于header还是data部分
        if data_started:
            if "=" in line:
                params = urllib.parse.parse_qs(line)
                for key, value in params.items():
                    params[key] = value[0]
                parse_data = {key: value for key, value in params.items()}
                print(parse_data)
        else:
            if ": " in line:
                key, value = line.split(": ", 1)
                parse_headers[key.strip()] = value.strip()
    return parse_url, parse_headers, parse_data


# 指定文件路径
request_info_path = 'get_xiaomi_gateway_passwd_database.txt'
# 解析输入
url, headers, data = parse_input(request_info_path)


proxies: Dict[str, Optional[str]] = {'http': None, 'https': None}

# 发送POST请求 rpc/1055319308
session = requests.Session()
try:
    response = session.post(url, headers=headers, data=data, proxies=proxies)
    response_data = json.loads(response.text)
    # 提取passcode字段中的六位数字
    passcode = response_data['result']['passcode']
except Exception as e:
    print("Error:", e)
    sleep(6)
    exit()

print("提取到的六位数字:", passcode)
while True:
    try:
        pyperclip.copy(passcode)
        print("已自动复制到剪贴板")
        break
    except pyperclip.PyperclipException:
        print("剪贴板未初始化，正在重试...")
        sleep(1)
sleep(1)