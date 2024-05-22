var aimVarNamePattern = new RegExp("模式");

await (async () => {
    // 定义 callAPI 函数，用于调用 API 并返回一个 Promise
    const callAPI = (api, params) => {
        return new Promise(res => editor.gateway.callAPI(api, params, res));
    };
    // 调用 getGraphList API 获取规则列表
    const ruleList = await callAPI('getGraphList');

    // 初始化设备规则映射对象
    let varRuleMap = {};

    const varList = await callAPI('getVarList', { scope: 'global'});
    // 遍历每个规则
    for (const rule of ruleList) {
        // 调用 getGraph API 获取规则的详细信息
        const content = await callAPI('getGraph', { id: rule.id }); 
        for (const n of content.nodes) {
            if (n.props?.scope === "global" ) {
                varName = varList[n.props?.id].userData.name
                if ( aimVarNamePattern.test(varName) ) {
                    varRuleMap[varName] = varRuleMap[varName] ?? [];
                    varRuleMap[varName].push(rule.userData.name);
                    break; // 满足条件后退出当前 for...of 循环
                }
            }
        }
    }
    return varRuleMap
})();
