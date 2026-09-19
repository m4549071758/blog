'use client';

import { useEffect } from 'react';
import mermaid from 'mermaid';
import type { RefObject } from 'react';

type Props = {
  containerRef: RefObject<HTMLDivElement | null>;
  /** 本文HTML。変化したら再描画する(エディタプレビューはタイプごとに更新される) */
  content: string;
};
const KROKI_ENDPOINT = 'https://kroki.io/plantuml/svg/';

let initialized = false;

/**
 * ```mermaid / ```plantuml ブロックをクライアントサイドで描画する。
 * プレースホルダは <pre class="diagram mermaid|plantuml" data-diagram-source="...">。
 * 描画失敗時は元のソースをテキストとして残す。
 */
const DiagramRenderer = ({ containerRef, content }: Props) => {
  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({ startOnLoad: false, theme: 'dark' });
      initialized = true;
    }

    let cancelled = false;

    const renderMermaid = async (el: HTMLElement, source: string) => {
      const { svg } = await mermaid.render(
        `mermaid-diagram-${Math.random().toString(36).slice(2)}`,
        source,
      );
      if (!cancelled) {
        el.innerHTML = svg;
        el.removeAttribute('data-diagram-source');
      }
    };

    const renderPlantuml = async (el: HTMLElement, source: string) => {
      // PlantUMLテキストをdeflate + base64url (kroki仕様) へ
      const compressed = await compress(source);
      if (cancelled) return;
      const res = await fetch(KROKI_ENDPOINT + compressed);
      if (!res.ok) throw new Error(`kroki error: ${res.status}`);
      const svg = await res.text();
      if (!cancelled) {
        el.innerHTML = svg;
        el.removeAttribute('data-diagram-source');
      }
    };

    const container = containerRef.current;
    if (!container) return;

    const targets = Array.from(
      container.querySelectorAll<HTMLElement>(
        'pre.diagram[data-diagram-source]',
      ),
    );

    targets.forEach(async (el) => {
      const source = el.getAttribute('data-diagram-source') || '';
      const kind = el.classList.contains('mermaid') ? 'mermaid' : 'plantuml';
      try {
        if (kind === 'mermaid') {
          await renderMermaid(el, source);
        } else {
          await renderPlantuml(el, source);
        }
      } catch (err) {
        // 描画失敗時はソースをそのまま見せる
        el.textContent = source;
        el.setAttribute('data-diagram-error', String(err));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [containerRef, content]);

  return null;
};

export default DiagramRenderer;

async function compress(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const cs = new CompressionStream('deflate');
  const stream = new Blob([bytes]).stream().pipeThrough(cs);
  const buf = await new Response(stream).arrayBuffer();
  return base64Url(new Uint8Array(buf));
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
