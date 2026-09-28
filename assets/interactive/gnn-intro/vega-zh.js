(function () {
  'use strict';

  const TITLES = {
    'BasicArchitectures.json': '参数量与模型性能',
    'ArchitectureNDim.json': '不同嵌入维度的性能表现',
    'ArchitectureNLayers.json': '按网络层数区分的模型架构',
    'ArchitectureAggregation.json': '按聚合类型区分的模型架构',
    'ArchitectureMessagePassing.json': '按消息传递方式区分的模型架构',
  };
  const FIELDS = {
    'Number of parameters': '参数量',
    'test AUC (pungent)': '测试集 AUC (刺鼻)',
    'node dim': '节点维度',
    'edge dim': '边维度',
    'globals dim': '全局维度',
    'n layers': '层数',
    'aggregation type': '聚合类型',
    'Message passing': '消息传递',
    'learn edges': '学习边表示',
    'learn globals': '学习全局表示',
    'learn nodes': '学习节点表示',
  };
  const VALUES = {
    'aggregation type': { max: '最大值', mean: '均值', sum: '求和' },
    'Message passing': {
      None: '无',
      edges: '边',
      nodes: '节点',
      globals: '全局',
      'edges & globals': '边与全局',
      'nodes & edges': '节点与边',
      'nodes & globals': '节点与全局',
      'nodes & edges & globals': '节点、边与全局',
    },
  };
  const DISPLAY_FIELDS = {
    'aggregation type': '__zh_aggregation_type',
    'Message passing': '__zh_message_passing',
  };

  function labelExpression(field, source) {
    return Object.entries(VALUES[field]).reduceRight(
      (fallback, [english, chinese]) => `${source} === ${JSON.stringify(english)} ? ${JSON.stringify(chinese)} : (${fallback})`,
      source,
    );
  }

  function localizeEncoding(encoding) {
    for (const [channel, value] of Object.entries(encoding)) {
      const definitions = Array.isArray(value) ? value : [value];
      for (const definition of definitions) {
        if (definition && FIELDS[definition.field] && definition.title === undefined) {
          definition.title = FIELDS[definition.field];
        }
        if (!definition || !VALUES[definition.field]) continue;
        const field = definition.field;
        if (channel === 'tooltip') {
          definition.field = DISPLAY_FIELDS[field];
        } else {
          const setting = channel === 'color' ? 'legend' : 'axis';
          if (definition[setting] !== null) {
            definition[setting] = { ...definition[setting], labelExpr: labelExpression(field, 'datum.label') };
          }
        }
      }
    }
  }

  function localizeSpec(spec) {
    if (spec.encoding) localizeEncoding(spec.encoding);
    for (const key of ['hconcat', 'vconcat', 'layer']) {
      for (const child of spec[key] || []) localizeSpec(child);
    }
    if (spec.spec) localizeSpec(spec.spec);
  }

  window.renderGnnChart = async function (selector, file) {
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Failed to load ${file}: ${response.status}`);
      const spec = await response.json();
      spec.title = TITLES[file];
      spec.transform = [
        ...(spec.transform || []),
        ...Object.entries(DISPLAY_FIELDS).map(([field, display]) => ({
          calculate: labelExpression(field, `datum[${JSON.stringify(field)}]`),
          as: display,
        })),
      ];
      localizeSpec(spec);
      await vegaEmbed(selector, spec);
      document.querySelector(`${selector} .chart-wrapper`).setAttribute('aria-label', spec.title);
    } catch (error) {
      console.error(error);
    }
  };
})();
