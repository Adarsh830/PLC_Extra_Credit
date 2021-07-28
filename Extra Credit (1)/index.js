const Op = Symbol("op");
const Num = Symbol("num");
const sentiment = require("./semantic");

// Lex

const lexer = (str) =>
  str
    .split(" ")
    .map((s) => s.trim())
    .filter((s) => s.length);

// Transpiler

const transpiler = (ast) => {
  const opMap = { sum: "+", mul: "*", sub: "-", div: "/" };
  const transpileNode = (ast) =>
    ast.type === Num ? transpileNum(ast) : transpileOp(ast);
  const transpileNum = (ast) => ast.val;
  const transpileOp = (ast) =>
    `(${ast.expr.map(transpileNode).join(" " + opMap[ast.val] + " ")})`;
  return transpileNode(ast);
};

// Parser

// Grammer of our Parser (EBNF)
// digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
// num = digit+
// op = sum | sub | mul | div
// expr = num | op expr+

const parser = (tokens) => {
  let c = 0;
  const peek = () => tokens[c];
  const consume = () => tokens[c++];
  const parseNum = () => ({ val: parseInt(consume()), type: Num });
  const parseOp = () => {
    const node = { val: consume(), type: Op, expr: [] };
    while (peek()) node.expr.push(parseExpr());
    return node;
  };
  const parseExpr = () => (/\d/.test(peek()) ? parseNum() : parseOp());
  return parseExpr();
};

/*
  calculator

  Visit each node from the tree with pre-order traversal and either:

  Return the corresponding value, in case the node is of type number.
  Perform the corresponding arithmetic operation, in case of an operation node.
*/

const calculator = (ast) => {
  const opAcMap = {
    sum: (args) => args.reduce((a, b) => a + b, 0),
    sub: (args) => args.reduce((a, b) => a - b),
    div: (args) => args.reduce((a, b) => a / b),
    mul: (args) => args.reduce((a, b) => a * b, 1),
    eq: (args) => args.reduce((a, b) => a === b),
    ne: (args) => args.reduce((a, b) => a !== b),
    lt: (args) => args.reduce((a, b) => a < b),
    gt: (args) => args.reduce((a, b) => a > b),
    as: (args) => args.reduce((a, b) => (a = b)),
    md: (args) => args.reduce((a, b) => a % b),
  };
  if (ast.type === Num) return ast.val;
  return opAcMap[ast.val](ast.expr.map(calculator));
};

const handleEmoji = (val) => {
  let emoji;
  if (val > 1) {
    emoji = "😃";
  } else if (val > 0.5) {
    emoji = "😊";
  } else if (val < 0.5) {
    emoji = "😔";
  } else {
    emoji = "🤔";
  }
  return emoji;
};

// Test

const value = "mul 3 sub 2 sum 1 3 4";

const sentences = [
  "cats are stupid",
  "cats are amazing",
  "i am embarrassed",
  "i am the best most awesome person in the world",
  "i don't kill",
  "i am the best",
  "damn you bad",
];

console.log("Semantic Analyzer Logs : ", "\n");
for (let i = 0; i < sentences.length; i += 1) {
  const emoji = handleEmoji(sentiment(sentences[i]));
  console.log(sentences[i]);
  console.log(sentiment(sentences[i]));
  console.log(emoji, "\n");
  console.log("-----", "\n");
}

console.log("Lexer Log : ", "\n");
console.log(lexer(value), "\n");

console.log("Parser Log : ", "\n");
console.log(parser(lexer(value)), "\n");

console.log("Transpiler Log : ", "\n");
console.log(transpiler(parser(lexer(value))), "\n");

console.log("Calculator Log : ", "\n");
console.log(calculator(parser(lexer(value))), "\n");

console.log(lexer("if"));
