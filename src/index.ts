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
    name: "@lee-donghyun/lingui",
  },
  configs: {} as Plugin["configs"],
  rules,
} satisfies Plugin;

const recommendedRules: {
  [K in RuleKey as `@lee-donghyun/lingui/${K}`]?: FlatConfig.RuleLevel;
} = {
  "@lee-donghyun/lingui/no-unlocalized-strings": "error",
};

Object.assign(plugin.configs, {
  recommended: {
    plugins: { "@lee-donghyun/lingui": plugin },
    rules: recommendedRules,
  },
});

export default plugin;
