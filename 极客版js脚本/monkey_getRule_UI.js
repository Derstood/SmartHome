// ==UserScript==
// @name         米家极客版getRule UI
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  同时支持设备(GDR)与变量(GVR)的标志与快速跳转功能
// @author       Derstood
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
  'use strict';

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
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
  }

  function add_marker_btn(selector, titleSelector, func, flagName) {
    document.querySelectorAll(`${selector}:not([data-patched-${flagName}])`).forEach(el => {
      el.setAttribute(`data-patched-${flagName}`, 'true');
      const title = el.querySelector(titleSelector)?.getAttribute('title');
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
        const result = await func(title);
        if (Array.isArray(result)) {
          window.lastGDRValue = result;
          showToast(`已加载 ${result.length} 个选项，点击右上按钮查看`, 1000);
        } else {
          console.warn(`${flagName} 返回结果无效：`, result);
          showToast(`${flagName} 返回数据为空`, 1000);
        }
      });
      el.insertBefore(btn, el.firstChild);
    });
  }

  function createDropdownButton() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.left = '500px';
    container.style.width = '150px';
    container.style.zIndex = 1000;
    container.style.cursor = 'move';

    const button = document.createElement('button');
    button.innerText = '选择要打开的自动化';
    button.style.width = '100%';
    button.style.opacity = '0.5';
    button.style.padding = '5px';
    button.style.cursor = 'pointer';
    container.appendChild(button);
    document.body.appendChild(container);

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
        if (Math.sqrt(deltaX ** 2 + deltaY ** 2) > 5) preventNextClick = true;
      };
    };

    container.addEventListener('click', e => {
      if (preventNextClick) {
        e.stopPropagation();
        e.preventDefault();
        preventNextClick = false;
      }
    }, true);

    button.addEventListener('click', () => {
      if (!window.lastGDRValue || !Array.isArray(window.lastGDRValue)) {
        showToast('请先点击设备或变量方块加载数据', 1000);
        return;
      }
      document.querySelector('.my-custom-select')?.remove();
      const rect = container.getBoundingClientRect();
      const select = document.createElement('select');
      select.className = 'my-custom-select';
      select.style.position = 'fixed';
      select.style.top = `${rect.bottom + 4}px`;
      select.style.left = `${rect.left}px`;
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

      const mainButton = document.querySelector('.app-header-menu-item.app-header-menu-left');
      select.addEventListener('change', () => {
        const value = select.value;
        mainButton?.click();
        setTimeout(() => {
          const input = document.querySelector('input[placeholder="输入想找的自动化"]');
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, '');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }, 200);
        setTimeout(() => {
          const target = Array.from(document.querySelectorAll('.rule-list-item-left-title'))
            .find(p => p.textContent.trim() === value);
          target?.click();
        }, 400);
        select.remove();
      });
      select.addEventListener('mousedown', () => {
        if (select.options.length === 1) {
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      document.addEventListener('click', e => {
        if (!select.contains(e.target) && !container.contains(e.target)) select.remove();
      }, { once: true });
      document.body.appendChild(select);
    });
  }

  if (checkTitle()) {
    const observer = new MutationObserver(() => {
      add_marker_btn('.common-device-cell', 'h5.device-name', GDR_one, 'gdr');
      add_marker_btn('.common-var-cell', 'h5.var-name', GVR_one, 'gvr');
    });
    observer.observe(document.body, { childList: true, subtree: true });
    add_marker_btn('.common-device-cell', 'h5.device-name', GDR_one, 'gdr');
    add_marker_btn('.common-var-cell', 'h5.var-name', GVR_one, 'gvr');
    createDropdownButton();
  }
})();
