const generateSimilarDomainNames = (domainName) => {
  const similarNames = [];
  const domainParts = domainName.split(".");
  const namePart = domainParts[0];
  const tld = domainParts[1] || "";

  const numberVariations = [123, 456, 789, 101];
  const suffixVariations = ["online", "site", "web", "portal"];
  const prefixVariations = ["my", "the", "best"];

  const numberVariationsList = numberVariations.map(
    (num) => `${namePart}${num}.${tld}`
  );
  const suffixVariationsList = suffixVariations.map(
    (suffix) => `${namePart}${suffix}.${tld}`
  );
  const prefixVariationsList = prefixVariations.map(
    (prefix) => `${prefix}${namePart}.${tld}`
  );

  const similarNamesUnshuffled = [
    ...numberVariationsList,
    ...suffixVariationsList,
    ...prefixVariationsList,
  ];

  for (let i = similarNamesUnshuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [similarNamesUnshuffled[i], similarNamesUnshuffled[j]] = [
      similarNamesUnshuffled[j],
      similarNamesUnshuffled[i],
    ];
  }

  return similarNamesUnshuffled;
};

module.exports = generateSimilarDomainNames;
