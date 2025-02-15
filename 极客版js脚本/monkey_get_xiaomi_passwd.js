// ==UserScript==
// @name         自动获取极客动态密码
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Send a POST request with custom headers and data
// @author       You
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';
    if (document.title.includes("米家自动化极客版")) {

      function triggerPaste(text) {
        // 找到一个输入框或可编辑区域
        const editableElement = document.querySelector("input, textarea, [contenteditable=true]");

        if (editableElement) {
            // 创建粘贴事件
            const pasteEvent = new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: new DataTransfer()
            });

            // 设置剪贴板内容
            pasteEvent.clipboardData.setData("text/plain", text);

            // 触发粘贴事件
            editableElement.dispatchEvent(pasteEvent);

            console.log("已自动粘贴:", text);
        } else {
            console.warn("未找到可编辑区域，无法自动粘贴");
        }
      }

      function postReq(url,headers,data) {
        GM_xmlhttpRequest({
          method: "POST",
          url: url,
          headers: headers,
          data: data,
          onload: function (response) {
              console.log("Response:", response);
              if (response.status == 200 ) {
                let parsedResponse = JSON.parse(response.responseText);
                let passcode = parsedResponse.result.passcode;
                GM_setClipboard(passcode);
                // 提示用户已复制
                // alert('字符串已复制到剪贴板：' + passcode);
                console.log(passcode)
                // 延时 1 秒后触发粘贴操作
                setTimeout(() => {
                    triggerPaste(passcode);
                }, 2000);
                // 存储当前解析结果
                const cacheData = { url, headers, data };
                localStorage.setItem("cachePasswdPost", JSON.stringify(cacheData));
                return true
              }
          },
          onerror: function (error) {
              console.error("Error:", error);
              return false
          }
      });

      }

    function createFileInput() {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0px';
      container.style.left = '80%';
      container.style.width = '100px';
      container.style.zIndex = 1000;

      // 自定义按钮
      const button = document.createElement('button');
      button.innerText = '上传抓包文件'; // 设置自定义文字
      button.style.width = '100%';
      button.style.padding = '5px';
      button.style.cursor = 'pointer';

      // 隐藏的文件输入框
      const input = document.createElement('input');
      input.type = 'file';
      input.style.position = 'absolute';
      input.style.opacity = 0;
      input.style.pointerEvents = 'none'; // 防止直接点击 input

      // 点击按钮触发文件选择
      button.addEventListener('click', () => input.click());

      // 监听文件上传事件
      input.addEventListener('change', handleFileUpload, false);

      container.appendChild(button);
      container.appendChild(input);
      document.body.appendChild(container);
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];

        if (!file) {
            console.log('未选择文件');
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            console.log('解析上传的文件内容');
            parseFileContent(e.target.result);
        };

        reader.onerror = function(e) {
            console.error('文件读取出错', e);
        };

        reader.readAsText(file);
    }

    function parseFileContent(content) {
        const sections = content.split(/\r?\n\r?\n/);

        console.log('检测分割后 sections 内容:', sections);

        if (sections.length < 3) {
            console.error('文件格式不正确，未找到完整的 URL、Headers 和 Data 部分');
            return;
        }

        // 提取 URL
        const urlLine = sections[0].split(' ')[1];
        const url = urlLine.trim();

        // 提取 Headers
        const headers = {};
        const headerLines = sections[1].split(/\r?\n/);
        headerLines.forEach(line => {
            const [key, value] = line.split(':');
            if (key && value) {
                headers[key.trim()] = value.trim();
            }
        });

        // 提取 Data 内容
        const dataLines = sections[2].split('&');
        const parsedData = {};

        dataLines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                parsedData[decodeURIComponent(key)] = decodeURIComponent(value);
            }
        });

        const data = new URLSearchParams(parsedData).toString();
        const encoder = new TextEncoder();
        const byteLength = encoder.encode(data).length;
        headers["Content-Length"]=String(byteLength);


        postReq(url,headers,data)

      }

      createFileInput();
      // 检查缓存是否存在
      if (localStorage.getItem("cachePasswdPost")) {
          console.log("缓存已存在，直接使用缓存数据");
          const cachedData = JSON.parse(localStorage.getItem("cachePasswdPost"));
          if ( ! postReq(cachedData.url, cachedData.headers, cachedData.data) ){
            localStorage.removeItem('cachePasswdPost');
          }
      }

    }
})();
