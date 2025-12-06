```js
// ==UserScript==
// @name         calculate_time
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  计算时长
// @author       Derestood
// @match        https://oa.starsmicrosystem.com/oaataticsv/attendance/*
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

  function calculate_time () {
    // 获取所有 class 为 events-list 的 div 元素
    const eventsListDivs = document.querySelectorAll('.cal-month-day, .cal-day-inmonth');

    // 用于累计超过 11 小时的时间差
    let totalExcessTime = 0;
    let totalTime = 0;
    // 将毫秒转化为半小时为单位的时间
    function roundToHalfHour(ms) {
      // 计算超出的小时数（单位：小时）
      const hours = ms / (1000 * 60 * 60);
      // 四舍五入到最接近的半小时
      return Math.floor(hours * 2) / 2;
    }

    // 遍历每一个 events-list div
    eventsListDivs.forEach(event => {
      // 确保获取到时间字符串后再进行处理
      const spanElement = event.querySelector('div')?.querySelector('span');
      let  day = event.querySelector('span').innerText;
      if (spanElement) {
        const timeString = spanElement.innerText;

        if (timeString) {
          const [startTimeStr, endTimeStr] = timeString.split(' - ');
          // 转换为 Date 对象
          const startTime = new Date(`1970-01-01T${startTimeStr}Z`);
          const endTime = new Date(`1970-01-01T${endTimeStr}Z`);

          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            return
          }
          // 计算时间差（毫秒）
          const timeDifference = endTime - startTime;
          totalTime += timeDifference / 3600000;
          // 如果差值超过 11 小时 (11小时 = 11 * 60 * 60 * 1000 毫秒)
          if (timeDifference >= 11.5 * 60 * 60 * 1000) {
            // 累加超出部分，四舍五入到最接近的半小时
            totalExcessTime += roundToHalfHour(timeDifference - 11 * 60 * 60 * 1000);
            console.log(day+"号加班："+roundToHalfHour(timeDifference - 11 * 60 * 60 * 1000)+"小时")
          }
        }
      }

    });
    console.log('超过 11 小时的累计时间差（按半小时计算）：', totalExcessTime, '小时');
    console.log('总工时 不包含周末：', totalTime.toFixed(2), '小时');
    console.log(totalTime);
  }

  // 选择需要绑定事件的按钮
  const prevButton = document.querySelector('[data-calendar-nav="prev"]');
  const nextButton = document.querySelector('[data-calendar-nav="next"]');

  if (prevButton) {
      prevButton.addEventListener('click', calculate_time);
  }

  if (nextButton) {
      nextButton.addEventListener('click', calculate_time);
  }


})();
```
