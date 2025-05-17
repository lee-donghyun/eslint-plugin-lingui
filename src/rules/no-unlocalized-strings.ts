import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  () =>
    `https://github.com/lee-donghyun/eslint-plugin-lingui/blob/main/README.md`
);

const skip = new WeakSet();

const getJSXAttribute = (node: TSESTree.Literal) => {
  let parent: TSESTree.Node = node.parent;
  while (parent.type != AST_NODE_TYPES.JSXAttribute) {
    parent = parent.parent!;
  }
  return parent;
};

const isAsConstExpression = (
  node: TSESTree.Literal | TSESTree.TemplateLiteral
) => {
  return (
    node.parent.type === AST_NODE_TYPES.TSAsExpression &&
    node.parent.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
    node.parent.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
    node.parent.typeAnnotation.typeName.name === "const"
  );
};

const isTemplateLiteralExpression = (
  node: TSESTree.TemplateLiteral,
  name: string
) => {
  return (
    node.parent.type === AST_NODE_TYPES.TaggedTemplateExpression &&
    node.parent.tag.type == AST_NODE_TYPES.Identifier &&
    node.parent.tag.name === name
  );
};

export const noUnlocalizedString = createRule<
  [{ ignoreAttributes?: string[]; ignore?: string[] }],
  "default" | "forJsxText" | "forAttribute"
>({
  name: "no-unlocalized-strings",
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
      "TemplateLiteral:exit"(node) {
        if (
          node.quasis.every((quasi) => isIgnoredLiteral(quasi.value.cooked))
        ) {
          return;
        }
        if (
          isTemplateLiteralExpression(node, "t") ||
          isTemplateLiteralExpression(node, "msg")
        ) {
          return;
        }
        if (isAsConstExpression(node)) {
          return;
        }
        context.report({ messageId: "default", node });
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
        if (isAsConstExpression(node)) {
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
