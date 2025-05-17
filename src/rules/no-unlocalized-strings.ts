import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => "https://" + name);

const skip = new WeakSet();

const getJSXAttribute = (node: TSESTree.Literal) => {
  let parent: TSESTree.Node = node.parent;
  while (parent.type != AST_NODE_TYPES.JSXAttribute) {
    parent = parent.parent!;
  }
  return parent;
};

export const noUnlocalizedString = createRule<
  [{ ignoreAttributes?: string[]; ignore?: string[] }],
  "default" | "forJsxText" | "forAttribute"
>({
  name: "@lee-donghyun/lingui/no-unlocalized-strings",
  meta: {
    docs: {
      description: "Disallow unlocalized strings",
    },
    type: "problem",
    messages: {
      default:
        "String not marked for translation. Wrap it with t``, <Trans>, or msg``.",
      forJsxText: "String not marked for translation. Wrap it with <Trans>.",
      forAttribute:
        "Attribute not marked for translation. \n Wrap it with t`` from useLingui() macro hook.",
    },
    schema: [
      {
        type: "object",
        properties: {
          ignoreAttributes: {
            type: "array",
            items: {
              type: "string",
            },
          },
          ignore: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ ignoreAttributes: [], ignore: [] }],
  create(context) {
    const { ignore = [], ignoreAttributes = [] } = context.options[0] ?? {};
    const isIgnoredAttribute = (attributeName: string) => {
      return ignoreAttributes.some((regex) =>
        new RegExp(regex).test(attributeName)
      );
    };
    const isIgnoredLiteral = (literal: string) => {
      return ignore.some((regex) => new RegExp(regex, "u").test(literal));
    };
    return {
      "JSXAttribute Literal"(node: TSESTree.Literal) {
        const attribute = getJSXAttribute(node);
        if (isIgnoredAttribute(attribute.name.name as string)) {
          skip.add(node);
        }
      },
      'JSXElement[openingElement.name.name="Trans"] JSXText'(
        node: TSESTree.JSXText
      ) {
        skip.add(node);
      },
      'TaggedTemplateExpression[tag.name.name="t"]  TemplateLiteral'(node) {
        skip.add(node);
      },

      "Literal:exit"(node) {
        if (skip.has(node)) {
          skip.delete(node);
          return;
        }
        if (node.parent.type === AST_NODE_TYPES.ImportDeclaration) {
          return;
        }
        if (typeof node.value != "string") {
          return;
        }
        if (isIgnoredLiteral(node.value)) {
          return;
        }
        if (
          node.parent.type === AST_NODE_TYPES.TSAsExpression &&
          node.parent.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
          node.parent.typeAnnotation.typeName.type ===
            AST_NODE_TYPES.Identifier &&
          node.parent.typeAnnotation.typeName.name === "const"
        ) {
          return;
        }
        context.report({ messageId: "default", node });
      },
      "JSXText:exit"(node) {
        if (skip.has(node)) {
          skip.delete(node);
          return;
        }
        if (node.value.trim() === "") {
          return;
        }
        if (isIgnoredLiteral(node.value)) {
          return;
        }
        context.report({ messageId: "forJsxText", node });
      },
    };
  },
});
