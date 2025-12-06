```js
// ==UserScript==
// @name         GDR/GVR/GER-米家极客版通过 设备/变量/虚拟事件 找场景
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  米家极客版通过 设备/变量/虚拟事件 找场景
// @author       Derstood
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    if (! document.title.includes("米家自动化极客版")) {
      return
    }
    // 定义 getDeviceRules 函数并暴露到 window 对象上
    window.GDR = async function (aimDeviceName) {
        // 将输入字符串转换为正则表达式模式
        const aimDeviceNamePattern = new RegExp(aimDeviceName);

        // 定义 callAPI 函数，用于调用 API 并返回一个 Promise
        const callAPI = (api, params) => {
            return new Promise(res => editor.gateway.callAPI(api, params, res));
        };

        // 调用 getDevList API 获取设备列表
        const devList = (await callAPI('getDevList')).devList;

        // 调用 getGraphList API 获取规则列表
        const ruleList = await callAPI('getGraphList');
        // DEBUG use
        // const mapRule = new Map(ruleList.map(item => [item.userData.name, item.id]));
        // const content = await callAPI('getGraph', { id: mapRule.get("变量抓取test1") });

        // 初始化设备规则映射对象
        let devRuleMap = {};

        // 遍历每个规则
        for (const rule of ruleList) {
            // 调用 getGraph API 获取规则的详细信息
            const content = await callAPI('getGraph', { id: rule.id });

            // 提取规则中的设备ID，并过滤掉未定义的ID
            const dids = new Set(content.nodes.map(n => n.props?.did).filter(d => d !== undefined));

            // 使用 for...of 循环替代 forEach 以便在满足条件时中途退出循环
            for (const d of dids) {
                if (aimDeviceNamePattern.test(devList[d]?.name)) {
                    devRuleMap[d] = devRuleMap[d] ?? [];
                    devRuleMap[d].push(rule.id);
                }
            }
        }

        // 转换设备规则映射为设备名称和规则名称，并返回结果
        var result = Object.fromEntries(
            Object.entries(devRuleMap).map(([k, v]) => [
                devList[k]?.name ?? `did: ${k}`, // 使用设备ID查找设备名称，找不到则使用默认格式
                v.map(r => ruleList.find(rr => rr.id === r).userData.name)
            ])
        );
        console.log(result)
        return result
    };
    window.GDR_one = async function (aimDeviceName) {
        // 将输入字符串转换为正则表达式模式

        // 定义 callAPI 函数，用于调用 API 并返回一个 Promise
        const callAPI = (api, params) => {
            return new Promise(res => editor.gateway.callAPI(api, params, res));
        };

        // 调用 getDevList API 获取设备列表
        const devList = (await callAPI('getDevList')).devList;

        // 调用 getGraphList API 获取规则列表
        const ruleList = await callAPI('getGraphList');

        // 初始化设备规则Set
        const devRuleList = new Set();
        // 遍历每个规则
        for (const rule of ruleList) {
            // 调用 getGraph API 获取规则的详细信息
            const content = await callAPI('getGraph', { id: rule.id });

            // 提取规则中的设备ID，并过滤掉未定义的ID
            const dids = new Set(content.nodes.map(n => n.props?.did).filter(d => d !== undefined));

            // 使用 for...of 循环替代 forEach 以便在满足条件时中途退出循环
            for (const d of dids) {
                if (aimDeviceName == devList[d]?.name) {
                    devRuleList.add(rule.userData.name);
                }
            }
        }
        const result = [...devRuleList];
        console.log(result);
        return result;
    };
    window.GER = async function (aimEventName) {
        var aimEventNamePattern = new RegExp(aimEventName);
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
                const events_call = new Set(content.nodes.map(n => n.props?.arguments?.[0]?.v1).filter(d => d !== undefined));
                const events_act = new Set(content.nodes.map(n => n.props?.ins?.[0]?.value).filter(d => d !== undefined));

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
            console.log(eventRuleMap);
        })();
    };
    window.GVR = async function (aimVarName) {
        var aimVarNamePattern = new RegExp(aimVarName);
        // 定义 callAPI 函数，用于调用 API 并返回一个 Promise
        const callAPI = (api, params) => {
            return new Promise(res => editor.gateway.callAPI(api, params, res));
        };
        // 调用 getGraphList API 获取规则列表
        const ruleList = await callAPI('getGraphList');

        // 初始化设备规则映射对象
        let varRuleMap = {};

        const varList = await callAPI('getVarList', { scope: 'global' });
        // 遍历每个规则
        for (const rule of ruleList) {
            // 调用 getGraph API 获取规则的详细信息
            const content = await callAPI('getGraph', { id: rule.id });
            for (const n of content.nodes) {
                if (n.props?.scope === "global") {
                    var varName = varList[n.props?.id]?.userData?.name
                    if (aimVarNamePattern.test(varName)) {
                        varRuleMap[varName] = varRuleMap[varName] ?? [];
                        if (! varRuleMap[varName].includes(rule.userData.name)) {
                          varRuleMap[varName].push(rule.userData.name);
                        }
                    }
                } else if (n.type === "calculator" || n.type === "strConcat") {
                    for (let e of n.props?.elements) {
                        if (e.scope === "global") {
                            let varName = varList[e.id].userData.name
                            if (aimVarNamePattern.test(varName)) {
                                varRuleMap[varName] = varRuleMap[varName] ?? [];
                                if (! varRuleMap[varName].includes(rule.userData.name)) {
                                  varRuleMap[varName].push(rule.userData.name);
                                }
                            }
                        }
                    }
                }
            }
        }
        console.log(varRuleMap);
    };
    window.GVR_one = async function (aimVarName) {
        // 定义 callAPI 函数，用于调用 API 并返回一个 Promise
        const callAPI = (api, params) => {
            return new Promise(res => editor.gateway.callAPI(api, params, res));
        };
        // 调用 getGraphList API 获取规则列表
        const ruleList = await callAPI('getGraphList');

        // 初始化设备规则Set
        const varRuleList = new Set();

        const varList = await callAPI('getVarList', { scope: 'global' });
        // 遍历每个规则
        for (const rule of ruleList) {
            // 调用 getGraph API 获取规则的详细信息
            const content = await callAPI('getGraph', { id: rule.id });
            for (const n of content.nodes) {
                let valid=0;
                if (n.props?.scope === "global") {
                    var varName = varList[n.props?.id]?.userData?.name
                    valid = 1;
                } else if (n.type === "calculator" || n.type === "strConcat") {
                    for (let e of n.props?.elements) {
                        if (e.scope === "global") {
                            let varName = varList[e.id].userData.name;
                            valid = 1;
                        }
                    }
                } else if (n.type === "deviceInputSetVar") {
                    var varName = varList[n.props?.arguments?.[0]?.id]?.userData?.name;
                    valid = 1;
                }
                if (valid && aimVarName && aimVarName == varName ) {
                        varRuleList.add(rule.userData.name);
                }
            }
        }
        const result = [...varRuleList];
        console.log(result);
        return result;
    };
})();
```
