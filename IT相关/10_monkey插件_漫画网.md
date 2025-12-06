```js
// ==UserScript==
// @name         漫画便携插件
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  键盘翻页、滚轮加速、屏蔽广告
// @author       Derstood
// @match        https://18comic.vip/photo/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //  绑定方向键点击上一话和下一话
    //
  document.addEventListener('DOMContentLoaded', function() {
        const checkButtons = setInterval(function() {
            // 尝试获取 "下一话" 元素
            const nextButton = Array.from(document.querySelectorAll('span')).find(span => /下一[話话]/.test(span.textContent));
            if (nextButton) {
                document.addEventListener('keydown', function(event) {
                    if (event.key === 'ArrowRight') {  // 按下右方向键
                        event.preventDefault();  // 阻止默认行为
                        nextButton.click();  // 模拟点击下一话

                    }
                });
                clearInterval(checkButtons);  // 停止定时检查
            }
        }, 500);  // 每500ms检查一次，直到找到 "下一话" 或 "上一话" 元素
    });

    document.addEventListener('DOMContentLoaded', function() {
        const checkButtons = setInterval(function() {
            // 尝试获取 "下一话" 元素
            const preButton = Array.from(document.querySelectorAll('span')).find(span => /上一[話话]/.test(span.textContent));
            // 如果找到了"下一话"按钮
            if (preButton) {
                document.addEventListener('keydown', function(event) {
                    if (event.key === 'ArrowLeft') {  // 按下右方向键
                        event.preventDefault();  // 阻止默认行为
                        preButton.click();  // 模拟点击下一话

                    }
                });
                clearInterval(checkButtons);  // 停止定时检查
            }
        }, 500);  // 每500ms检查一次，直到找到 "下一话" 或 "上一话" 元素
    });


    // 鼠标滚轮加倍
    //
    const scrollMultiplier = 3; // 设置倍数

    window.addEventListener('wheel', function(event) {
        // 阻止默认的滚动行为
        event.preventDefault();

        // 获取滚动的距离
        let delta = event.deltaY || event.deltaX;

        // 根据倍数调整滚动距离
        delta *= scrollMultiplier;

        // 手动滚动页面
        window.scrollBy(0, delta);
    }, { passive: false });



    // block ad
    //
     document.getElementById('Comic_Top_Nav') && document.getElementById('Comic_Top_Nav').remove();
})();
```
