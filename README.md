### `@lee-donghyun/lingui/no-unlocalized-strings`

Disallow **raw strings** (`Literal` or `TemplateLiteral`) that are **not** wrapped by a Lingui helper (`t\`\``, `msg\`\``, or `<Trans>\`).
The rule targets React / TypeScript projects that use [LinguiJS](https://lingui.dev/) for i18n and encourages exhaustive localisation.

---

## Installation

```bash
pnpm add -D @lee-donghyun/eslint-plugin-lingui
```

---

## Configuration

### Flat-config (ESLint ≥ 8.21)

```js
// @ts-check

import { defineConfig } from "eslint-config-react-app-essentials";
import pluginLingui from "eslint-plugin-lingui";
import PluginLingui2 from "@lee-donghyun/eslint-plugin-lingui";

export default defineConfig({
  tsconfigRootDir: "./tsconfig.json",
  scope: ["src/**/*.{ts,tsx}"],
  extends: [
    pluginLingui.configs["flat/recommended"],
    PluginLingui2.configs.recommended,
    {
      rules: {
        "@lee-donghyun/lingui/no-unlocalized-strings": [
          "error",
          {
            ignoreAttributes: ["className", "src", "data-testid"],
            ignore: ["^[a-zA-Z0-9\\s\\p{P}\\p{S}]*$"],
          },
        ],
      },
    },
  ],
});
```

---

## Rule details

### Problems reported

| Message ID     | Trigger                                                                                                                                                                                                                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`      | • A string `Literal` (e.g. `"Hello"`)  **or**<br/>• a `TemplateLiteral` (e.g. `` `Hello ${name}` ``)<br/>that is **not**:<br/>   • wrapped by `t` or `msg` (tagged templates)<br/>   • placed in a `<Trans>` element<br/>   • marked `as const` (`"foo" as const`)<br/>   • matched by an _ignore_ option |
| `forJsxText`   | Raw `JSXText` between tags (e.g. `<p>Hello</p>`)                                                                                                                                                                                                                                                          |
| `forAttribute` | Raw string used directly as a JSX attribute value                                                                                                                                                                                                                                                         |

> The rule is **not autofixable** – localisation usually needs developer input.

---

### Correct examples

```tsx
import { t, msg } from "@lingui/macro";
import { Trans } from "@lingui/react";

<button aria-label={t`Close`}>
  <Trans>Close</Trans>
</button>;

const TITLE = t`Dashboard`; // tagged template
const error = msg`Error: ${statusCode}`; // tagged template

const HTTP_OK = "200" as const; // allowed (as const)
```

### Incorrect examples

```tsx
console.log("Untranslated log"); // Literal

<button aria-label="닫기">닫기</button>; // attribute + JSXText
<input placeholder={`Search ${name}`} />; // TemplateLiteral
```

---

## Options

| Option             | Type       | Default | Description                                                                                                                             |
| ------------------ | ---------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `ignoreAttributes` | `string[]` | `[]`    | **Regex** patterns (no flags). Attribute names matching _any_ pattern are skipped. Useful for `className`, `src`, testing IDs, etc.     |
| `ignore`           | `string[]` | `[]`    | **Regex** patterns (Unicode flag `u` is forced). If _all_ quasis of a template literal or a literal value match, the string is ignored. |

Example:

```jsonc
{
  "@lee-donghyun/lingui/no-unlocalized-strings": [
    "error",
    {
      "ignoreAttributes": ["^aria-", "data-testid$"],
      "ignore": ["^[0-9]+$", "^\\s*$"] // numbers or whitespace-only
    }
  ]
}
```
