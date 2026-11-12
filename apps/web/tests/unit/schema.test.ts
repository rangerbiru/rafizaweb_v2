import { describe, expect, it } from 'vitest';
import { faqNode, graph } from '../../src/lib/schema';

describe('JSON-LD', () => {
  it('graph memuat bisnis + website dan tidak memuat AggregateRating/Review', () => {
    const g = JSON.parse(graph('id', []));
    const types = g['@graph'].flatMap((n: { '@type': string | string[] }) => [n['@type']].flat());
    expect(types).toEqual(expect.arrayContaining(['Organization', 'ProfessionalService', 'WebSite']));
    expect(JSON.stringify(g)).not.toMatch(/AggregateRating|"Review"/);
  });
  it('FAQPage mengabaikan jawaban placeholder', () => {
    const n = faqNode([
      { question: 'A?', answer: 'Ya.' },
      { question: 'B?', answer: 'Setiap paket termasuk [JUMLAH REVISI] kali revisi.' },
    ]);
    expect((n as { mainEntity: unknown[] }).mainEntity).toHaveLength(1);
  });
});
