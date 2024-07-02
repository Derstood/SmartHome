const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // 查找所有符合条件的元素
        const playButtons = document.querySelectorAll('.prism-big-play-btn');
        playButtons.forEach(function(playButton) {
            // 延时处理
            setTimeout(function() {
                // 检查元素是否具有 'pause' class
                if (playButton.classList.contains('pause')) {
                    playButton.click(); // 执行点击操作
                    // observer.disconnect(); // 找到对象后，停止观察
                }
            }, 2000); // 延时2秒（可以根据需要调整）
        });
    });
});

// 开始观察 document.body 的变化
observer.observe(document.body, { 
    childList: true, // 观察子节点的变化
    subtree: true, // 观察所有后代节点
    attributes: true, // 观察属性变化
    attributeFilter: ['class'] // 仅观察 class 属性的变化
});
