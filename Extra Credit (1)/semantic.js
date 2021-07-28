const english = require("./english");

function tokenize(input) {
  return input
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=_`\"~()]/g, "")
    .split(" ");
}

function getNorms() {
  return english.norms;
}

function getConfig() {
  return english.config;
}

function normalize(from, to, score) {
  return 2 * ((score - from) / (to - from)) - 1;
}

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
const sum = (arr) => arr.reduce((p, c) => p + c, 0);

module.exports = function sentiment(sentence) {
  const config = getConfig();
  const negators = config.negators;
  const norms = getNorms();

  const tokens = tokenize(sentence);
  let score = [];
  let i = tokens.length;

  while ((i -= 1)) {
    const word = tokens[i];
    const norm = norms[word];
    if (typeof norm === "undefined") continue;
    let normScore = normalize(config.scale.from, config.scale.to, norm);

    if (i > 0) {
      const previousToken = tokens[i - 1];
      if (negators.indexOf(previousToken) > -1) {
        normScore = -normScore;
      }
    }
    score.push(normScore);
  }
  return sum(score);
};
