var aimEventNamePattern = new RegExp("闪红灯");
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
    let eventRuleMap = {};

    // 遍历每个规则
    for (const rule of ruleList) {
        // 调用 getGraph API 获取规则的详细信息
        const content = await callAPI('getGraph', { id: rule.id });
        // 提取规则中的虚拟事件名字
        const events_call = new Set(content.nodes.map(n => n.cfg?.userData?.oriProps?.arguments?.[0]?.v1).filter(d => d !== undefined));
        const events_act  = new Set(content.nodes.map(n => n.inputs?.in1).filter(d => d !== undefined));
        const events = new Set([...events_call, ...events_act]);
        // 使用 for...of 循环替代 forEach 以便在满足条件时中途退出循环
        for (const e of events) {
            if (aimEventNamePattern.test(e)) {
                eventRuleMap[e] = eventRuleMap[e] ?? [];
                eventRuleMap[e].push(rule.userData.name);
            }
        }
    }

    // 转换设备规则映射为设备名称和规则名称，并返回结果
    return eventRuleMap
})();

