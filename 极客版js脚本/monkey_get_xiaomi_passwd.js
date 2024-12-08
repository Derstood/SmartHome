// ==UserScript==
// @name         自动获取极客密码
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
        const input = document.createElement('input');
        input.type = 'file';
        input.style.position = 'fixed';
        input.style.top = '10px';
        input.style.left = '10px';
        input.style.zIndex = 1000;
        input.textContent="gg"

        document.body.appendChild(input);

        input.addEventListener('change', handleFileUpload, false);
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
