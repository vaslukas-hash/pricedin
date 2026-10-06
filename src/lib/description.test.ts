import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderDescription, safeJsonLd, escapeHtml } from './description'

// Only tags our own renderer produces may appear in the output.
const ALLOWED_TAG = /^<\/?(h2|h3|ul|li|strong|p)>$/
const tagsIn = (html: string) => html.match(/<[^>]*>/g) ?? []

const XSS_PAYLOADS = [
  '<img src=x onerror=alert(1)>',
  '<svg/onload=alert(1)>',
  '<a href="javascript:alert(1)">x</a>',
  '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  '</script><script>alert(1)</script>',
  '## Heading <script>alert(1)</script>\n- item <b onmouseover=x>\n**bold**',
]

test('renderDescription never emits tags it did not generate', () => {
  for (const payload of XSS_PAYLOADS) {
    const bad = tagsIn(renderDescription(payload)).filter(t => !ALLOWED_TAG.test(t))
    assert.deepEqual(bad, [], `payload leaked tags: ${payload}`)
  }
})

test('renderDescription keeps the supported markdown', () => {
  const html = renderDescription('## Role\n- one\n- two\n\nSome **bold** text & more')
  assert.match(html, /<h2>Role<\/h2>/)
  assert.match(html, /<li>one<\/li>/)
  assert.match(html, /<strong>bold<\/strong>/)
  assert.match(html, /&amp; more/)
})

test('escapeHtml escapes the five special characters', () => {
  assert.equal(escapeHtml(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;')
})

test('safeJsonLd cannot be broken out of with </script>', () => {
  const out = safeJsonLd({ description: 'x</script><script>alert(1)</script>' })
  assert.ok(!out.includes('<'), 'raw "<" must not appear')
  assert.equal(JSON.parse(out).description, 'x</script><script>alert(1)</script>')
})
