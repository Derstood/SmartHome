// ==UserScript==
// @name        自动填充验证码
// @match       *://*/*
// @run-at      document-idle
// @grant       none
// ==/UserScript==

(async function() {

	const params = new URLSearchParams(location.search);
	const code = params.get('code');
  if (!code) return;

  const numbers = document.querySelectorAll('.pin-number.bg-normal');
  const numMap = {};
  numbers.forEach(el => {
    const val = el.textContent.trim();
    if (/^\d$/.test(val)) {
      numMap[val] = el;
    }
  });

  for (const digit of code) {
    if (numMap[digit]) {
      numMap[digit].click();
      await new Promise(r => setTimeout(r, 100));
    }
  }
  const delBtn = document.querySelector('div.pin-delete.bg-normal');
  if (delBtn) {
    delBtn.click();
    await new Promise(r => setTimeout(r, 100));
  }
  const lastDigit = code[code.length - 1];
  numMap[lastDigit].click();
})();