// ==UserScript==
// @name         米家极客版GDR UI
// @namespace    http://tampermonkey.net/
// @version      0.3
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

    function ruleListUI () {
      GM_addStyle(`
          .rule-list {
            display: flex !important; /* 使用 flex 布局 */
            flex-wrap: wrap !important; /* 子元素换行 */
            justify-content: space-between !important; /* 子元素之间均匀分布 */
          }
          .rule-list-item {
            width: 32% !important; /* 宽度为 32%（留一些空间用于 margin） */
            margin-bottom: 10px !important; /* 设置下间距 */
            min-width: 280px !important; /* 确保最小宽度 */
            box-sizing: border-box !important; /* 确保宽度和 margin 计算正确 */
          }
        `);
    }

    // 主函数，执行高亮逻辑
    function highlightBlinkingElements() {
        const targetNode = document.body;
        // 观察器的配置（需要观察哪些变动）
        const config = {
            childList: true,
            subtree: true,
        };
        // 当观察到变动时执行的回调函数
        const callback = function(mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 处理新添加的 .panel-log-card-blink 元素
                            if (node.classList.contains('panel-log-card-blink')) {
                                node.style.backgroundColor = 'red'; // 修改背景颜色为红色
                                node.style.border = '2px solid yellow'; // 修改边框为黄色
                            } else {
                                const blinkElement = node.querySelector('.panel-log-card-blink');
                                if (blinkElement) {
                                    blinkElement.style.backgroundColor = 'red'; // 修改背景颜色为红色
                                    blinkElement.style.border = '2px solid yellow'; // 修改边框为黄色
                                }
                            }

                            // 处理新添加的 <animate> 元素
                            if (node.tagName === 'ANIMATE') {
                                const pathElement = node.parentElement;
                                if (pathElement) {
                                     pathElement.setAttribute('stroke', 'red');
                                }
                            } else {
                                const animateElements = node.querySelectorAll('animate');
                                animateElements.forEach(animateElement => {
                                    const pathElement = animateElement.parentElement;
                                    if (pathElement) {
                                         pathElement.setAttribute('stroke', 'red');
                                    }
                                });
                            }
                        }
                    });
                }
            }
        };
        // 创建一个观察器实例并传入回调函数
        const observer = new MutationObserver(callback);
        // 以上述配置开始观察目标节点
        observer.observe(targetNode, config);
        // 你可以在适当的时候停止观察
        // observer.disconnect();
    }

    function highlightElementsLines() {
        const targetNode = document.body;
        // 观察器的配置（需要观察哪些变动）
        const config = {
            childList: true,
            subtree: true,
        };
        // 当观察到变动时执行的回调函数
        const callback = function(mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 查找具有 cursor: move 的 .card-wrapper 元素
                            if (node.classList.contains('card-wrapper') && node.style.cursor === 'move') {
                                const dataId = node.getAttribute('data-id');
                                if (dataId) {
                                    // 匹配 class 为 "line-drawer" 并且 data-id 包含刚才的 data-id 的元素
                                    const lineDrawerElements = document.querySelectorAll('.line-drawer');
                                    lineDrawerElements.forEach(lineDrawer => {
                                        const lineDrawerDataId = lineDrawer.getAttribute('data-id');
                                        if (lineDrawerDataId && lineDrawerDataId.includes(dataId)) {
                                            // 找到 stroke-dasharray=0 的子节点并修改 stroke-width
                                            const strokePath = Array.from(lineDrawer.querySelectorAll('path')).find(path => {
                                                return path.getAttribute('stroke-dasharray') === '0' && path.getAttribute('stroke-width') === '2';
                                            });
                                            if (strokePath) {
                                                strokePath.setAttribute('stroke-width', '10');
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        };
        // 创建一个观察器实例并传入回调函数
        const observer = new MutationObserver(callback);
        // 以上述配置开始观察目标节点
        observer.observe(targetNode, config);
        // 你可以在适当的时候停止观察
        // observer.disconnect();
      }

    // 检查标题
    if (checkTitle()) {
        highlightBlinkingElements()
        highlightElementsLines()
        ruleListUI()
    }
})();
