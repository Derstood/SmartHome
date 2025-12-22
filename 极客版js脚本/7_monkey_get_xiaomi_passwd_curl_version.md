```javascript
// ==UserScript==
// @name         自动获取极客动态密码curl version
// @namespace    http://tampermonkey.net/
// @version      0.21
// @description  Send a POST request with curl cmd
// @author       Derstood
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
                }, 1000);
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
      button.innerText = '上传curl命令'; // 设置自定义文字
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
            parseCurlCmd(e.target.result);
        };

        reader.onerror = function(e) {
            console.error('文件读取出错', e);
        };

        reader.readAsText(file);
    }

    function parseCurlCmd(curlText) {
        const result = {
          method: "GET",
          url: "",
          headers: {},
          data: null,
        };

        // 去掉换行压缩成一行，方便解析
        const text = curlText.replace(/\s+/g, " ");

        // URL
        const urlMatch = text.match(/curl\s+'([^']+)'/);
        if (urlMatch) result.url = urlMatch[1];

        // method no use: forece POST here
        // if (text.includes(" -X ")) {
        //   const m = text.match(/-X\s+(\w+)/);
        //   if (m) result.method = m[1];
        // } else if (text.includes("--data")) {
        //   result.method = "POST";
        // }

        // headers
        const headerRegex = /-H\s+'([^:]+):\s*([^']+)'/g;
        let h;
        while ((h = headerRegex.exec(text)) !== null) {
          result.headers[h[1]] = h[2];
        }

        // data
        const dataMatch = text.match(/--data(?:-raw)?\s+'([^']+)'/);
        if (dataMatch) {
          result.data = dataMatch[1];
        }
        console.log("convert curl finished ...")
        postReq(result.url,result.headers,result.data)

      }

      createFileInput();
      // 检查缓存是否存在
      if (localStorage.getItem("cachePasswdPost")) {
          console.log("缓存已存在，直接使用缓存数据");
          const cachedData = JSON.parse(localStorage.getItem("cachePasswdPost"));
          if ( ! postReq(cachedData.url, cachedData.headers, cachedData.data) ){
            // localStorage.removeItem('cachePasswdPost');
          }
      } else {
          console.log("无缓存，需要上传req文件");
      }

    }
})();
```
