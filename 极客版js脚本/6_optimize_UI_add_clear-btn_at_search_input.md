```js
// ==UserScript==
// @name         极客版本搜索框添加清空按钮
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  在搜索输入框后添加清空按钮
// @author       Derstood
// @match        *://*/*
// ==/UserScript==

(function() {
    'use strict';

    // check title
    if(! document.title.includes("米家自动化极客版")){
      return ;
    }

    const style = document.createElement('style');
    style.textContent = `
        .custom-clear-btn {
            position: absolute;
            left: 25%;
            top: 50%;
            transform: translateY(-50%);
            width: auto;
            height: 16px;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            color: rgba(0, 0, 0, 0.45);
            background-color: rgba(91, 143, 163, 0.5);
            transition: color 0.3s;
            z-index: 10;
            font-size: 14px;
            font-weight: bold;
            user-select: none;
        }
        .custom-clear-btn:hover {
            color: rgba(0, 0, 0, 0.85);
            background-color: rgba(91, 143, 163, 0.75);
        }
    `;
    document.head.appendChild(style);

    function initInput() {
        const wrapper = document.querySelector('.ant-input-affix-wrapper:not(.ant-input-affix-wrapper-readonly)');
        const input = wrapper?.querySelector('input');

        if (!input || wrapper.querySelector('.custom-clear-btn')) return;

        const clearBtn = document.createElement('span');
        clearBtn.className = 'custom-clear-btn';
        clearBtn.innerHTML = '✕';

        wrapper.appendChild(clearBtn);

        // 监听输入变化
        input.addEventListener('input', () => {
            clearBtn.style.display = input.value ? 'flex' : 'none';
        });

        // 初始状态
        clearBtn.style.display = input.value ? 'flex' : 'none';

        // 点击清空
        clearBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 先获取原生 setter
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
            ).set;

            // 使用原生 setter 设置空值
            nativeInputValueSetter.call(input, '');

            // 触发所有可能的事件
            const events = [
                new Event('input', { bubbles: true, cancelable: true }),
                new Event('change', { bubbles: true, cancelable: true }),
                new KeyboardEvent('keydown', { bubbles: true, cancelable: true }),
                new KeyboardEvent('keyup', { bubbles: true, cancelable: true }),
                new Event('blur', { bubbles: true }),
                new Event('focus', { bubbles: true })
            ];

            events.forEach(event => input.dispatchEvent(event));

            // 隐藏按钮
            clearBtn.style.display = 'none';

            // 重新聚焦
            input.focus();
            input.click();
        });
    }

    // 延迟执行以确保页面加载完成
    setTimeout(initInput, 1000);

    // 也监听 DOM 变化
    const observer = new MutationObserver(initInput);
    observer.observe(document.body, { childList: true, subtree: true });
})();
```
