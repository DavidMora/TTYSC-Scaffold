import type { ChatStreamChunk, ExecutionMetadata } from '@/lib/types/chats';

function nowIso(): string {
  try {
    return new Date().toISOString();
  } catch {
    return '';
  }
}

export function buildFinalChartMock(): ChatStreamChunk {
  const created = nowIso();
  const execution_metadata: ExecutionMetadata = {
    original_query:
      'Can you display the most recent lead time values by CM for NVPN 316-0899-000?',
    final_query:
      'Can you display the most recent lead time values by CM for NVPN 316-0899-000?',
    execution_plan: {
      complexity: 'moderate',
      entities_referenced: {
        'Contract Manufacturer Organization': {
          matched_text: 'CM',
          match_type: 'alias',
          field_name: 'organization',
        },
        'NVIDIA Part Number': {
          matched_text: 'NVPN 316-0899-000',
          match_type: 'format',
          field_name: 'nvpn',
        },
      },
      data_sources_needed: ['databricks_odp'],
      reasoning:
        "The query mentions 'CM' which is an alias for Contract Manufacturer Organization. 'NVPN 316-0899-000' matches the format of NVIDIA Part Number. The term 'lead time' is not explicitly listed as an entity but is inferred to be related to supply chain data available in the primary data source.",
      steps: [
        'entity_check',
        'data_source_selector',
        'query_refiner',
        'text2sql',
        'execute_db_query',
        'chartgen',
        'followup',
      ],
      parallel_steps: [],
    },
    selected_data_source: 'databricks_odp',
    entity_validation: {
      valid: ['Contract Manufacturer Organization', 'NVIDIA Part Number'],
      inferred: {},
    },
    generated_sql:
      "WITH OrderedData AS (SELECT *, RANK() OVER (PARTITION BY cm_site_name ORDER BY date DESC) AS rnk FROM (SELECT DISTINCT date, cm_site_name, nvpn, qt_mp, component_lt FROM hive_metastore.gold_global_supply.demandleadtime WHERE nvpn = '316-0899-000')) SELECT date, cm_site_name, nvpn, qt_mp, component_lt FROM OrderedData WHERE rnk = 1 ORDER BY date DESC",
    query_results: {
      dataframe_records: [
        { date: '2025-08-18', cm_site_name: 'FXG', nvpn: '316-0899-000', qt_mp: 'MP', component_lt: 154 },
        { date: '2025-08-18', cm_site_name: 'FXHC', nvpn: '316-0899-000', qt_mp: 'QT', component_lt: 140 },
        { date: '2025-08-18', cm_site_name: 'FXHC', nvpn: '316-0899-000', qt_mp: 'MP', component_lt: 140 },
        { date: '2025-08-18', cm_site_name: 'FXLH', nvpn: '316-0899-000', qt_mp: 'QT', component_lt: 140 },
        { date: '2025-08-18', cm_site_name: 'FXLH', nvpn: '316-0899-000', qt_mp: 'MP', component_lt: 140 },
        { date: '2025-08-18', cm_site_name: 'FXM_NBU', nvpn: '316-0899-000', qt_mp: 'MP', component_lt: 60 },
        { date: '2025-08-18', cm_site_name: 'FXM_NBU', nvpn: '316-0899-000', qt_mp: 'QT', component_lt: 60 },
        { date: '2025-08-18', cm_site_name: 'FXSJ', nvpn: '316-0899-000', qt_mp: 'QT', component_lt: 147 },
        { date: '2025-08-18', cm_site_name: 'WIN2', nvpn: '316-0899-000', qt_mp: 'MP', component_lt: 181 },
        { date: '2025-08-18', cm_site_name: 'WIN2', nvpn: '316-0899-000', qt_mp: 'QT', component_lt: 181 },
        { date: '2025-08-18', cm_site_name: 'WIST', nvpn: '316-0899-000', qt_mp: 'MP', component_lt: 181 },
        { date: '2025-08-18', cm_site_name: 'WIST', nvpn: '316-0899-000', qt_mp: 'QT', component_lt: 181 },
        { date: '2025-08-11', cm_site_name: 'FXVN_NBU', nvpn: '316-0899-000', qt_mp: 'MP', component_lt: 140 },
        { date: '2025-08-11', cm_site_name: 'FXVN_NBU', nvpn: '316-0899-000', qt_mp: 'QT', component_lt: 140 },
      ],
      success: true,
      limited_to: -1,
      truncated: false,
    },
    chart_type: 'BarChart',
    chart_label: 'Lead Time Analysis by CM',
    generated_chart: {
      Series: [
        {
          name: 'Lead Time',
          data: [
            { x: 'FXG', y: 154.0 },
            { x: 'FXHC', y: 140.0 },
            { x: 'FXLH', y: 140.0 },
            { x: 'FXM_NBU', y: 60.0 },
            { x: 'FXSJ', y: 147.0 },
            { x: 'FXVN_NBU', y: 140.0 },
            { x: 'WIN2', y: 181.0 },
            { x: 'WIST', y: 181.0 },
          ],
        },
      ],
      XAxisKey: 'cm_site_name',
      YAxisKey: 'component_lt',
    },
    chartgen_error: null,
    followup_questions: [
      'What is the latest material cost by CM for NVPN 316-0899-000?',
      'Show me the latest lead time by CM for NVPN 316-0899-000?',
      'Show items with lead time > 150?',
      'What are the top 10 items with longest lead time for NVPN 316-0899-000?',
    ],
    followup_metadata: {
      original_question:
        'Can you display the most recent lead time values by CM for NVPN 316-0899-000?',
      num_questions: 4,
    },
    followup_error: null,
    completed_steps: [
      'entity_check',
      'data_source_selector',
      'query_refiner',
      'text2sql',
      'execute_db_query',
      'chartgen',
      'followup',
    ],
    error: null,
  };

  const chunk: ChatStreamChunk = {
    id: 'mock-final-chart',
    object: 'chat.completion.chunk',
    model: 'supply_chain_workflow',
    created,
    choices: [
      {
        message: {
          content:
            'Can \ndisplay \nthe \nmost \nrecent \nlead \ntime \nvalues \nby CM for NVPN \n316-0899-000?',
          role: null,
        },
        finish_reason: 'stop',
        index: 0,
        workflow_status: 'completed',
        execution_metadata,
      },
    ],
  };

  return chunk;
}


