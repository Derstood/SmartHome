```js
// Scriptable 脚本：自动获取极客动态密码（最终版）

// 获取快捷指令传入的文件路径 URL
let content = args.shortcutParameter;

// 兼容 Scriptable 的 UTF-8 字节长度计算函数
function utf8ByteLength(str) {
  let s = str.length;
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s += 2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--; // 代理对
  }
  return s;
}

// 解析文件内容为 URL、Headers 和 Data
function parseContent(content) {
  const sections = content.split(/\r?\n\r?\n/);
  if (sections.length < 3) throw new Error("文件格式错误，需包含 URL、Headers、Body 三部分");

  const urlLine = sections[0].split(' ')[1];
  const url = urlLine.trim();

  const headers = {};
  const headerLines = sections[1].split(/\r?\n/);
  for (let line of headerLines) {
    const [key, value] = line.split(':');
    if (key && value) headers[key.trim()] = value.trim();
  }

  const dataLines = sections[2].split('&');
  const parsedData = {};
  for (let line of dataLines) {
    const [key, value] = line.split('=');
    if (key && value) {
      parsedData[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }

  const data = Object.entries(parsedData)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  headers["Content-Length"] = String(utf8ByteLength(data));

  return { url, headers, data };
}

// 发 POST 请求并处理响应
async function sendPost(url, headers, data) {
  let req = new Request(url);
  req.method = "POST";
  req.headers = headers;
  req.body = data;

  try {
    let res = await req.loadJSON();
    if (!res.result || !res.result.passcode) throw new Error("响应中未找到 passcode");

    const passcode = res.result.passcode;
    Pasteboard.copyString(passcode);
    console.log("已复制 passcode:"+passcode);
    return passcode;
  } catch (err) {
    console.error("请求失败:", err);
    await new Alert().present("请求失败: " + err.message);
  }
}

// 主逻辑
try {
  const { url, headers, data } = parseContent(content);
  const passcode = await sendPost(url, headers, data);
  Script.setShortcutOutput(passcode);
} catch (e) {
  console.error("执行出错:", e);
}```
