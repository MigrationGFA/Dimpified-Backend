const Creator = require("../../../models/Creator");
const bcrypt = require("bcryptjs");
const CreatorToken = require("../../../models/CreatorToken");
const Subscription = require("../../../models/Subscription");
const Ecosystem = require("../../../models/Ecosystem"); // Import your Ecosystem model
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/generateToken");

const creatorLogin = async (req, res) => {
  try {
    await CreatorToken.sync();
    const { email, password } = req.body;

    const details = ["password", "email"];
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const creator = await Creator.findOne({ where: { email: email } });
    if (!creator) {
      return res.status(401).json({ message: "Invalid email Credential" });
    }

    const isPasswordValid = await bcrypt.compare(password, creator.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password Credential" });
    }

    if (!creator.isVerified) {
      return res
        .status(401)
        .json({ msg: "Please check your email to verify your account" });
    }

    const creatorTokens = await CreatorToken.findOne({
      where: { userId: creator.id },
    });
    console.log("my old token", creatorTokens);
    const currentDate = new Date();
    const userAgent = req.headers["user-agent"];
    const hasInterests =
      creator.categoryInterest && creator.categoryInterest !== null
        ? "yes"
        : "no";

    let accessToken, refreshToken;

    if (creatorTokens) {
      const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const refreshTokenExpiration = new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ); // 14 days from now
      accessToken = generateAccessToken(creator.id, creator.role);
      refreshToken = generateRefreshToken(creator.id, creator.role);
      await creatorTokens.update({
        userAgent,
        accessToken,
        refreshToken,
        accessTokenExpiration,
        refreshTokenExpiration,
      });
    } else {
      accessToken = generateAccessToken(creator.id, creator.role);
      refreshToken = generateRefreshToken(creator.id, creator.role);
      const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const refreshTokenExpiration = new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ); // 14 days from now

      const myToken = await CreatorToken.create({
        accessToken,
        refreshToken,
        userId: creator.id,
        userAgent,
        accessTokenExpiration,
        refreshTokenExpiration,
        type: "Creator",
      });
      console.log("my token", myToken);
    }

    // Assuming setProfile is determined by certain fields being non-null
    let setProfile =
      creator.organizationName && creator.categoryInterest ? true : false;

    // Get Subscription Plan
    const getSubscription = await Subscription.findOne({
      where: {
        creatorId: creator.id,
      },
    });

    let plan;
    if (!getSubscription) {
      plan = "Lite";
    } else {
      plan = getSubscription.planType;
    }

    const creatorEcosystem = await Ecosystem.findOne({
      creatorId: creator.id,
    });
    creator.step = 4;

    let ecosystemDomain = null;
    if (creatorEcosystem) {
      ecosystemDomain = creatorEcosystem.ecosystemDomain;
      console.log(ecosystemDomain);
    }

    // Subset of Creator's data for response
    const creatorSubset = {
      CreatorId: creator.id,
      organizationName: creator.organizationName,
      email: creator.email,
      role: creator.role,
      image: creator.imageUrl,
      interest: hasInterests,
      profile: setProfile,
      plan: plan,
      ecosystemDomain: ecosystemDomain,
    };

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: creatorSubset,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = { creatorLogin };
