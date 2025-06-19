// ==UserScript==
// @name         米家极客版GDR UI
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Highlight blinking elements
// @author       Derstood
// @match        *://*/*
// @grant GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 检查网页标题是否为“米家自动化极客版”
    function checkTitle() {
        return document.title.includes("米家自动化极客版");
    }

    function add_call_GDR_btn() {
        document.querySelectorAll('.common-device-cell:not([data-patched])').forEach(el => {
            el.setAttribute('data-patched', 'true'); // 防止重复添加

            const title = el.querySelector('h5.device-name')?.getAttribute('title');
            if (!title) return;

            const btn = document.createElement('div');
            btn.textContent = '🔲';
            btn.style.cssText = `
                width: 16px; height: 16px;
                display: inline-block;
                margin-right: 5px;
                background: lightgray;
                color: black;
                font-size: 12px;
                text-align: center;
                line-height: 16px;
                cursor: pointer;
                border-radius: 2px;
                user-select: none;
            `;
            btn.addEventListener('click', async e => {
                e.stopPropagation();
                const result = await GDR(title);
                const values = Object.values(result)[0];  // 只取第一个 value 数组
                if (Array.isArray(values)) {
                    window.lastGDRValue = values;
                    console.log(`已加载 ${values.length} 个选项，点击右上按钮查看`);
                } else {
                    console.log('GDR 返回无效');
                }
            });

            el.insertBefore(btn, el.firstChild);
        });
    }

    function createDropdownButton() {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0px';
      container.style.left = '50%';
      container.style.width = '150px';
      container.style.zIndex = 1000;

      const button = document.createElement('button');
      button.innerText = '选择要打开的自动化';
      button.style.width = '100%';
      button.style.padding = '5px';
      button.style.cursor = 'pointer';

      button.addEventListener('click', () => {
        if (!window.lastGDRValue || !Array.isArray(window.lastGDRValue)) {
          alert('请先点击设备方块加载数据');
          return;
        }

        const select = document.createElement('select');
        select.style.position = 'fixed';
        select.style.top = '30px';
        select.style.left = '50%';
        select.style.zIndex = 1001;
        select.style.width = '100px';

        select.setAttribute('size', window.lastGDRValue.length);
        select.style.height = `${window.lastGDRValue.length * 24}px`;


        window.lastGDRValue.forEach(v => {
          const option = document.createElement('option');
          option.textContent = v;
          option.value = v;
          select.appendChild(option);
        });

        const xElement = Array.from(document.querySelectorAll('.sider-item')).find(div => div.textContent.trim() === '自动化列表');
        select.addEventListener('change', () => {
          xElement.click()
          setTimeout(() => {
            let targetElement = Array.from(document.querySelectorAll('.rule-list-item-left-title')).find(p => p.textContent.trim() === select.value);
            targetElement.click()
          }, 200);

          select.remove();
        });

        document.body.appendChild(select);
      });

      container.appendChild(button);
      document.body.appendChild(container);
    }





    // 检查标题
    if (checkTitle()) {


         const observer = new MutationObserver(add_call_GDR_btn);
         observer.observe(document.body, { childList: true, subtree: true });

         add_call_GDR_btn(); // 页面初始加载也执行一次

         createDropdownButton(); // 页面加载时执行一次
    }
})();
