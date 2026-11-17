const aliases = {
  erp_master_search: { type: 'kind' },
  erp_purchase_detail: { purchaseId: 'id' },
  erp_sales_detail: { contractId: 'id' },
  crm_customer_detail: { customerId: 'id' },
  crm_lead_detail: { leadId: 'id' },
  crm_opportunity_detail: { opportunityId: 'id' },
  mes_inspect: { recordId: 'id' },
  geo_report_summary: { analysisId: 'id' },
  manufacturing_order_status: { orderId: 'id' },
  manufacturing_trace: { trackingCode: 'code', traceCode: 'code' },
};

const mesDetailTypes = {
  materials: 'material', boms: 'bom', plans: 'plan', orders: 'order', reports: 'report',
};

const validationError = (message) => new Error('[INVALID_INPUT] ' + message);

export function normalizeQuery(tool, arg, properties, required) {
  if (arg == null) arg = {};
  if (typeof arg !== 'object' || Array.isArray(arg)) throw validationError('请按工具定义传入参数。');
  const params = Object.create(null);
  for (const [inputName, value] of Object.entries(arg)) {
    const field = inputName === 'pageSize' ? 'page_size' : aliases[tool]?.[inputName] ?? inputName;
    if (!Object.hasOwn(properties, field)) {
      if (field === 'page_size' && tool.startsWith('manufacturing_') && Object.hasOwn(properties, 'page')) {
        if (value === 25) continue;
        throw validationError('制造业查询固定每页 25 条，只传 page 指定页码。');
      }
      throw validationError('工具不支持参数 ' + inputName + '。允许字段：' + (Object.keys(properties).join('、') || '无') + '。');
    }
    const normalized = tool === 'mes_inspect' && field === 'type' && typeof value === 'string' && Object.hasOwn(mesDetailTypes, value)
      ? mesDetailTypes[value] : value;
    if (Object.hasOwn(params, field) && params[field] !== normalized) {
      throw validationError('同一个参数不能赋予不同的值：' + field + '。');
    }
    params[field] = normalized;
  }
  for (const field of required) {
    if (!Object.hasOwn(params, field)) {
      const options = properties[field]?.enum;
      throw validationError('缺少 ' + field + '。' + (options ? '可选值：' + options.join('、') + '。' : '请使用上一步查询返回的记录。'));
    }
  }
  for (const [field, value] of Object.entries(params)) {
    const rule = properties[field];
    if (rule.enum && !rule.enum.includes(value)) throw validationError(field + ' 应为 ' + rule.enum.join('、') + '。');
    if (rule.type === 'integer' && (!Number.isInteger(value) || value < rule.minimum || value > rule.maximum)) {
      throw validationError(field + ' 应为 ' + rule.minimum + ' 至 ' + rule.maximum + ' 的整数。');
    }
    if (rule.type === 'object' && (!value || typeof value !== 'object' || Array.isArray(value))) {
      throw validationError(field + ' 应为对象。');
    }
    if (rule.type === 'boolean' && typeof value !== 'boolean') throw validationError(field + ' 应为 true 或 false。');
    if (rule.type === 'string' && (typeof value !== 'string' || value.length < rule.minLength || value.length > rule.maxLength)) {
      throw validationError(field + ' 的文字或长度不符合工具定义。');
    }
    if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
      throw validationError(field + ' 应使用前一步工具返回的记录 ID。');
    }
  }
  return params;
}

const safeMessages = {
  INVALID_INPUT: '查询参数不符合工具定义，请检查字段、类型和记录 ID。',
  FORBIDDEN: '当前企业岗位没有该查询权限，请核对所选企业及岗位。',
  NOT_FOUND: '在当前授权范围找不到该记录，请先重新搜索并使用返回的记录 ID。',
  CONFLICT: '业务数据已变化，请重新查询当前状态。',
  UNAVAILABLE: '知行方舟服务暂不可用，请稍后重试。',
};

export function queryFailure(result) {
  let parsed;
  const content = result?.content?.find?.(item => item.type === 'text')?.text;
  if (typeof content === 'string') {
    try { parsed = JSON.parse(content); } catch { /* Protocol may return plain text instead of an object. */ }
  }
  const code = result?.structuredContent?.code ?? parsed?.code;
  if (typeof code === 'string' && Object.hasOwn(safeMessages, code)) {
    return new Error('[' + code + '] ' + safeMessages[code]);
  }
  if (typeof content === 'string' && /input validation|invalid arguments|invalid parameters/i.test(content)) {
    return new Error('[INVALID_INPUT] ' + safeMessages.INVALID_INPUT);
  }
  if (typeof content === 'string' && /tool .*not found|unknown tool/i.test(content)) {
    return new Error('[FORBIDDEN] 此应用当前未开放所需工具。请检查企业应用是否已启用及岗位权限。');
  }
  return new Error('[QUERY_FAILED] 查询未能完成，请重试一次。若仍失败，请检查连接状态与服务。');
}

export function describeTools(result, allowed) {
  return result.tools
    .filter(item => allowed.has(item.name))
    .map(({ name, description, inputSchema, annotations }) => ({ name, description, inputSchema, readOnly: annotations?.readOnlyHint === true }));
}
