/**
 * @jest-environment node
 */
import { metadataToTableData } from '@/lib/metadata/table';
import type { ExecutionMetadata } from '@/lib/types/chats';

function makeBaseMetadata(partial?: Partial<ExecutionMetadata>): ExecutionMetadata {
  return {
    original_query: 'q',
    final_query: 'q-final',
    execution_plan: {
      complexity: 'low',
      entities_referenced: {},
      data_sources_needed: [],
      reasoning: '',
      steps: [],
      parallel_steps: [],
    },
    selected_data_source: 'test',
    entity_validation: {
      valid: [],
      inferred: {},
    },
    generated_sql: 'SELECT 1',
    query_results: {
      success: true,
      limited_to: -1,
      truncated: false,
      columns: [],
      dataframe_records: [],
    },
    completed_steps: [],
    error: null,
    ...(partial as ExecutionMetadata),
  };
}

describe('metadataToTableData', () => {
  it('returns null when metadata is missing or has no rows', () => {
    expect(metadataToTableData(undefined)).toBeNull();
    expect(metadataToTableData(null)).toBeNull();

    const mdEmpty = makeBaseMetadata({
      query_results: {
        success: true,
        limited_to: -1,
        truncated: false,
        columns: ['a', 'b'],
        dataframe_records: [],
      },
    });
    expect(metadataToTableData(mdEmpty)).toBeNull();
  });

  it('builds headers from provided columns and maps known keys to display texts', () => {
    const md = makeBaseMetadata({
      query_results: {
        success: true,
        limited_to: -1,
        truncated: false,
        columns: ['nvpn', 'cm_site_name', 'qt_mp', 'component_lt', 'lead_time_days', 'date', 'unknown_key'],
        dataframe_records: [
          {
            nvpn: 'N1',
            cm_site_name: 'Site A',
            qt_mp: 'QT',
            component_lt: 'X',
            lead_time_days: 5,
            date: '2024-01-01',
            unknown_key: 'foo',
          },
        ],
      },
    });

    const table = metadataToTableData(md)!;
    expect(table.headers.map((h) => h.accessorKey)).toEqual([
      'nvpn',
      'cm_site_name',
      'qt_mp',
      'component_lt',
      'lead_time_days',
      'date',
      'unknown_key',
    ]);
    expect(table.headers.map((h) => h.text)).toEqual([
      'NVPN',
      'CM Site',
      'QT/MP',
      'Lead Time',
      'Lead Time (Days)',
      'Date',
      'unknown_key',
    ]);
  });

  it('stringifies row values and adds a stable rowKey with fallback', () => {
    const date = new Date('2024-01-02T03:04:05.000Z');
    const md = makeBaseMetadata({
      query_results: {
        success: true,
        limited_to: -1,
        truncated: false,
        columns: ['nvpn', 'cm_site_name', 'qt_mp', 'date', 'component_lt', 'num', 'flag', 'obj'],
        dataframe_records: [
          {
            nvpn: '123',
            cm_site_name: 'Site X',
            qt_mp: 'QT',
            date: '2024-01-02',
            component_lt: 'LT',
            num: 42,
            flag: true,
            obj: { a: 1 },
          },
          {
            // Missing key pieces to build rowKey -> should fallback to index
            foo: 'bar',
            when: date,
          } as unknown as Record<string, unknown>,
        ],
      },
    });

    const table = metadataToTableData(md)!;
    expect(table.rowIdentifier).toBe('rowKey');
    expect(table.filters).toEqual([]);

    // First row: ensure stringification and composite rowKey
    const r0 = table.rows[0] as Record<string, string>;
    expect(r0.num).toBe('42');
    expect(r0.flag).toBe('true');
    expect(r0.obj).toBe(JSON.stringify({ a: 1 }));
    expect(r0.rowKey).toBe('123|Site X|QT|2024-01-02|LT');

    // Second row: ensure Date stringification and fallback rowKey
    const r1 = table.rows[1] as Record<string, string>;
    expect(r1.when).toBe(date.toISOString());
    expect(r1.rowKey).toBe('row-1');
  });
});


