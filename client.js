window.__ModuleLoader__.load({
  id: 'dsh-plugin-family-cards',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const FAMILY_LABELS = {"quota_meter": "quota meter", "pin_add": "pin add", "fact_search": "fact search", "fact_find": "fact find", "ledger_query": "ledger query", "cache_status": "cache status", "quota_check": "quota check", "session_search": "session search", "deep_scan": "deep scan", "eco_scan": "eco scan", "forge_write": "forge write"};

    function argsPreview(argsRaw) {
      if (typeof argsRaw !== 'string' || argsRaw.trim() === '') return null;
      try {
        const parsed = JSON.parse(argsRaw);
        return typeof parsed === 'object' && parsed !== null
          ? Object.entries(parsed).slice(0, 6).map(([k, v]) => k + ': ' + String(typeof v === 'string' ? v : JSON.stringify(v)).slice(0, 60)).join('  ·  ')
          : String(parsed).slice(0, 120);
      } catch {
        return argsRaw.slice(0, 120);
      }
    }

    function resultText(block) {
      const items = Array.isArray(block.content) ? block.content : [];
      return items.map((item) => (item && item.type === 'text' ? item.text : '')).join('\n').trim();
    }

    /** One generic card for a family tool call/result slice. */
    function FamilyCard(props) {
      const block = (props && props.block) || props || {};
      const settled = 'kind' in block;
      const argsRaw = (settled ? (block.call && block.call.argsRaw) : block.argsRaw) || '';
      const isError = block.isError === true;
      const state = settled ? (isError ? 'error' : 'ok') : 'running';
      const label = FAMILY_LABELS[block.call?.name || block.name] || block.call?.name || block.name || 'family tool';
      const text = settled ? resultText(block) : '';
      const border = state === 'error' ? 'var(--dsw-alias-color-border-critical, #b91c1c)'
        : state === 'running' ? 'var(--dsw-alias-color-border-info, #2563eb)'
        : 'var(--dsw-alias-color-border-default, #d4d4d8)';
      const children = [
        h('div', {
          key: 'title',
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
        }, [
          h('span', { key: 'l', style: { fontWeight: 600, fontSize: 'var(--dsw-alias-typography-body-fontSize, 13px)' } }, label),
          h('span', {
            key: 's',
            style: { fontSize: 11, opacity: 0.7, color: state === 'error' ? 'var(--dsw-alias-color-text-critical, #b91c1c)' : 'inherit' },
          }, state === 'running' ? '运行中…' : state === 'error' ? '出错' : '完成'),
        ]),
      ];
      const args = argsPreview(argsRaw);
      if (args) children.push(h('div', { key: 'args', style: { marginTop: 4, fontSize: 12, opacity: 0.75, wordBreak: 'break-all' } }, args));
      if (text) children.push(h('div', {
        key: 'body',
        style: { marginTop: 6, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 240, overflowY: 'auto' },
      }, text.slice(0, 4000)));
      return h('div', {
        style: {
          border: '1px solid ' + border,
          borderRadius: 8,
          padding: '8px 10px',
          margin: '4px 0',
          background: 'var(--dsw-alias-color-bg-secondary, transparent)',
          color: 'var(--dsw-alias-color-text-primary, inherit)',
        },
      }, children);
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        for (const toolName of Object.keys(FAMILY_LABELS)) {
          ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
            name: 'tool.call.toolview',
            key: toolName,
          }, FamilyCard));
        }
      },
    };
  },
});
