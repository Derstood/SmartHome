await (async () => {
    // 定义 callAPI 函数，用于调用 API 并返回一个 Promise
    const callAPI = (api, params) => {
        return new Promise(res => editor.gateway.callAPI(api, params, res));
    };
    // 调用 getDevList API 获取设备列表
    const devList = (await callAPI('getDevList')).devList;
    // 调用 getGraphList API 获取规则列表
    const ruleList = await callAPI('getGraphList');
    // 初始化设备规则映射对象
    let devRuleMap = {};
    // 遍历每个规则
    for (const rule of ruleList) {
        // 调用 getGraph API 获取规则的详细信息
        const content = await callAPI('getGraph', { id: rule.id });
        // 提取规则中的设备ID，并过滤掉未定义的ID
        const dids = new Set(content.nodes.map(n => n.props?.did).filter(d => d !== undefined));
        // 对于每个设备ID，将规则ID添加到对应的设备规则列表中
        dids.forEach(d => {
            if (devList[d]?.name === "书房空调") {
                devRuleMap[d] = devRuleMap[d] ?? [];
                devRuleMap[d].push(rule.id);
            }
        });
    }
    // 转换设备规则映射为设备名称和规则名称，并返回结果
    return Object.fromEntries(
        Object.entries(devRuleMap).map(([k, v]) => [
            devList[k]?.name ?? `did: ${k}`, // 使用设备ID查找设备名称，找不到则使用默认格式
            v.map(r => ruleList.find(rr => rr.id === r).userData.name)
        ])
    );
})();
