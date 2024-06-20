const Ecosystem = require("../../models/Ecosystem");
const generateSimilarDomainNames = require("../../utils/domainUtils");

const checkDomainAvailability = async (req, res) => {
  const { domainName } = req.body;

  if (!domainName) {
    return res.status(400).json({ message: "Domain name is required" });
  }

  try {
    const existingEcosystem = await Ecosystem.findOne({
      ecosystemDomain: domainName,
    });

    if (existingEcosystem) {
      const similarNames = generateSimilarDomainNames(domainName);
      const availableSuggestions = [];

      for (const name of similarNames) {
        const existingSuggestion = await Ecosystem.findOne({
          ecosystemDomain: name,
        });
        if (!existingSuggestion) {
          availableSuggestions.push(name);
        }

        if (availableSuggestions.length >= 3) {
          break;
        }
      }

      return res.status(200).json({
        message: "Domain name not available",
        suggestions: availableSuggestions,
      });
    } else {
      return res.status(200).json({
        message: "Domain name is available",
      });
    }
  } catch (error) {
    console.error("Error checking domain availability:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = checkDomainAvailability;
