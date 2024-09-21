// ==UserScript==
// @name         Sort Var
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Sort Var
// @author       Derstood
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

   if (document.title.includes("米家自动化极客版")) {
      function sortVarCells() {
        const varLists = document.querySelectorAll(".var-list");

        varLists.forEach(varList => {
            const commonVarCells = Array.from(varList.querySelectorAll(".common-var-cell"));

            // 按照 var name 的 title 属性进行字典顺序排序
            commonVarCells.sort((a, b) => {
                const titleAElement = a.querySelector(".var-name");
                const titleBElement = b.querySelector(".var-name");
                // 确保找到元素后再获取 title
                const titleA = titleAElement ? titleAElement.getAttribute("title").toUpperCase() : "";
                const titleB = titleBElement ? titleBElement.getAttribute("title").toUpperCase() : "";
                return titleA.localeCompare(titleB);
            });

            // 清空原始的 var-list，然后按新顺序插入元素
            varList.innerHTML = '';
            commonVarCells.forEach(cell => varList.appendChild(cell));
        });
      }

      let hasLogged = false; // 用于跟踪是否已记录日志

      const observer = new MutationObserver((mutations) => {
          mutations.forEach(mutation => {
              const targetDiv = document.querySelector('div.sider-item.active');
              if (targetDiv && targetDiv.innerText === '全局变量列表' && !hasLogged) {
                  console.log('Target div found by mutation observer:', targetDiv);
                  hasLogged = true; // 记录日志后更新标志位
                  setTimeout(sortVarCells, 200);
              } else if (!targetDiv || targetDiv.innerText !== '全局变量列表') {
                  hasLogged = false; // 重置标志位，以便下次重新记录
              }
          });
      });

      // 配置观察选项，监视子节点的添加和变化
      const config = {
          childList: true,
          subtree: true // 监视所有子节点
      };

      // 启动观察
      observer.observe(document.body, config);
   }
})();
