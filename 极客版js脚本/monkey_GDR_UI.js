// ==UserScript==
// @name         米家极客版GDR UI
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Highlight blinking elements
// @author       Derstood
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 检查网页标题是否为“米家自动化极客版”
    function checkTitle() {
        return document.title.includes("米家自动化极客版");
    }

    function showToast(message, duration = 2000) {
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.style.position = 'fixed';
      toast.style.bottom = '50%';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.background = 'rgba(0, 0, 0, 0.8)';
      toast.style.color = 'white';
      toast.style.padding = '10px 20px';
      toast.style.borderRadius = '8px';
      toast.style.fontSize = '14px';
      toast.style.zIndex = 9999;
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';

      document.body.appendChild(toast);

      requestAnimationFrame(() => {
          toast.style.opacity = '1';
      });

      setTimeout(() => {
          toast.style.opacity = '0';
          toast.addEventListener('transitionend', () => {
              toast.remove();
          });
      }, duration);
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
                const values = result && typeof result === 'object' ? Object.values(result)[0] : null;
                if (Array.isArray(values)) {
                    window.lastGDRValue = values;
                    showToast(`已加载 ${values.length} 个选项，点击右上按钮查看`,1000);
                } else {
                    console.warn('GDR 返回结果无效：', result);
                    showToast('GDR 返回数据为空',1000);
                }
            });

            el.insertBefore(btn, el.firstChild);
        });
    }

    function createDropdownButton() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.left = '500px';         // ✅ 不要用 50% + transform，容易跳动
        container.style.width = '150px';
        container.style.zIndex = 1000;
        container.style.cursor = 'move';       // 鼠标悬浮在整体都显示拖动

        const button = document.createElement('button');
        button.innerText = '选择要打开的自动化';
        button.style.width = '100%';
        button.style.opacity = '0.5';
        button.style.padding = '5px';
        button.style.cursor = 'pointer';      // 按钮内仍可点
        container.appendChild(button);
        document.body.appendChild(container);

        // ✅ 拖动逻辑绑在 container 上
        // 拖动+防止 click 误触
        let preventNextClick = false;
        container.onmousedown = function (e) {
          e.preventDefault();

          const startX = e.clientX;
          const startY = e.clientY;

          const shiftX = e.clientX - container.getBoundingClientRect().left;
          const shiftY = e.clientY - container.getBoundingClientRect().top;

          function moveAt(pageX, pageY) {
              container.style.left = pageX - shiftX + 'px';
              container.style.top = pageY - shiftY + 'px';
          }

          function onMouseMove(e) {
              moveAt(e.pageX, e.pageY);
          }

          document.addEventListener('mousemove', onMouseMove);

          document.onmouseup = function (upEvent) {
              document.removeEventListener('mousemove', onMouseMove);
              document.onmouseup = null;

              const deltaX = upEvent.clientX - startX;
              const deltaY = upEvent.clientY - startY;
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              if (distance > 5) {
                  preventNextClick = true; // 判断为拖动，不触发 click
              }
          };
        };

        // 捕获阶段阻止 click 事件
        container.addEventListener('click', function (e) {
            if (preventNextClick) {
                e.stopPropagation();
                e.preventDefault();
                preventNextClick = false;
            }
        }, true); // useCapture = true

        button.addEventListener('click', () => {
            if (!window.lastGDRValue || !Array.isArray(window.lastGDRValue)) {
                showToast('请先点击设备方块加载数据',1000);
                return;
            }

            document.querySelector('.my-custom-select')?.remove();

            const rect = container.getBoundingClientRect();

            const select = document.createElement('select');
            select.className = 'my-custom-select';
            select.style.position = 'fixed';
            select.style.top = `${rect.bottom + 4}px`; // 出现在 container 下方
            select.style.left = `${rect.left}px`;      // 左对齐 container
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

            //const xElement = Array.from(document.querySelectorAll('.sider-item')).find(div => div.textContent.trim() === '自动化列表');
            const mainButton = document.querySelector('.app-header-menu-item.app-header-menu-left');

            select.addEventListener('change', () => {
                const value = select.value;
                //xElement?.click();
                mainButton.click();
                // 清空搜索框 start
                setTimeout(() => {
                  const input = document.querySelector('input[placeholder="输入想找的自动化"]');
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                  nativeInputValueSetter.call(input, '');
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                }, 200);
                // 清空搜索框 end

                setTimeout(() => {
                    const targetElement = Array.from(document.querySelectorAll('.rule-list-item-left-title')).find(p => p.textContent.trim() === value);
                    targetElement?.click();
                }, 400);
                select.remove();
            });

            select.addEventListener('mousedown', () => {
                if (select.options.length === 1) {
                    const event = new Event('change', { bubbles: true });
                    select.dispatchEvent(event);
                }
            });
            document.addEventListener('click', (e) => {
              if (!select.contains(e.target) && !container.contains(e.target)) {
                  select.remove();
              }
            }, { once: true });
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
