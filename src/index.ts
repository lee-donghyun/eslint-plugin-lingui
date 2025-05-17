import { ESLint, Linter } from "eslint";
import { noUnlocalizedString } from "src/rules/no-unlocalized-strings";
import { FlatConfig, RuleModule } from "@typescript-eslint/utils/ts-eslint";

const rules = {
  "no-unlocalized-strings": noUnlocalizedString,
};

type RuleKey = keyof typeof rules;

interface Plugin extends Omit<ESLint.Plugin, "rules"> {
  rules: Record<RuleKey, RuleModule<any, any, any>>;
  configs: {
    recommended: Linter.Config;
  };
}

const plugin = {
  meta: {
    name: "@lee-donghyun/eslint-plugin-lingui",
  },
  configs: {} as Plugin["configs"],
  rules,
} satisfies Plugin;

const recommendedRules: {
  [K in RuleKey as `@lee-donghyun/eslint-plugin-lingui/${K}`]?: FlatConfig.RuleLevel;
} = {
  "@lee-donghyun/eslint-plugin-lingui/no-unlocalized-strings": "error",
};

Object.assign(plugin.configs, {
  recommended: {
    plugins: { "@lee-donghyun/eslint-plugin-lingui": plugin },
    rules: recommendedRules,
  },
});

export default plugin;
