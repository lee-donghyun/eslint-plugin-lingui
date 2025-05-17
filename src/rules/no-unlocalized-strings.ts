import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => "https://" + name);

const visited = new WeakSet();

const ALLOWED_ATTRIBUTES = ["className", "src", "data-testid"];
const ALLOWED_REGEX = /^[a-zA-Z0-9\s\p{P}\p{S}]*$/u;

const getJSXAttribute = (node: TSESTree.Literal) => {
  let parent: TSESTree.Node = node.parent;
  while (parent.type != AST_NODE_TYPES.JSXAttribute) {
    parent = parent.parent!;
  }
  return parent;
};

export const noUnlocalizedString = createRule({
  name: "@lee-donghyun/no-unlocalized-strings",
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
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      "JSXAttribute Literal"(node: TSESTree.Literal) {
        const attribute = getJSXAttribute(node);
        if (ALLOWED_ATTRIBUTES.includes(attribute.name.name as string)) {
          visited.add(node);
        }
      },
      'JSXElement[openingElement.name.name="Trans"] JSXText'(
        node: TSESTree.JSXText
      ) {
        visited.add(node);
      },
      'TaggedTemplateExpression[tag.name.name="t"]  TemplateLiteral'(node) {
        visited.add(node);
      },

      "Literal:exit"(node) {
        if (visited.has(node)) {
          return;
        }
        if (node.parent.type === AST_NODE_TYPES.ImportDeclaration) {
          return;
        }
        if (typeof node.value != "string") {
          return;
        }
        if (ALLOWED_REGEX.test(node.value)) {
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
        if (visited.has(node)) {
          return;
        }
        if (node.value.trim() === "") {
          return;
        }
        if (ALLOWED_REGEX.test(node.value)) {
          return;
        }
        context.report({ messageId: "forJsxText", node });
      },
    };
  },
});
