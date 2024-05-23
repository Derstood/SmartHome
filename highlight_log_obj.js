// ==UserScript==
// @name         Highlight Blinking Elements
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Highlight blinking elements on a specific website
// @author       Derstood
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function checkTitle() {
        return document.title.includes("米家自动化极客版");
    }

    // 主函数，执行高亮逻辑
    function highlightBlinkingElements() {
        // 高亮线元素
        const animateElements = document.querySelectorAll('animate');
        animateElements.forEach(animateElement => {
          // 获取每个 <animate> 元素的父元素 <path>
          const pathElement = animateElement.parentElement;
          // 修改 <path> 元素的 stroke 属性，使动画变成红色
          pathElement.setAttribute('stroke', 'red');
        });


        // 高亮卡片元素
        const blinkElements = document.querySelectorAll('.panel-log-card-blink');
        blinkElements.forEach(element => {
          element.style.backgroundColor = 'red'; // 例如，设置背景颜色为红色
          element.style.border = '2px solid yellow'; // 设置边框为黄色
          element.style.opacity = '0.5'; // 设置透明度为0.5
        });
    }

    // 检查标题并设置间隔执行
    if (checkTitle()) {
        setInterval(highlightBlinkingElements, 3000); // 每3秒执行一次
    }
})();
