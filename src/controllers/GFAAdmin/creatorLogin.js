const { where } = require("sequelize");
const Creator = require("../../models/Creator");
const CreatorToken = require("../../models/CreatorToken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");
const  Subscription = require("../../models/Subscription")

const gfaLoginCreator = async (req, res) => {
    try {
        
        const email = req.params.email 
        if(!email){
            return res.status(400).json({message: "email is needed"})
        }
        const user = await Creator.findOne({
            where: {
                email: email
            }
        })
         if(!user){
            return res.status(400).json({message: "user does not exist"})
        }
        const creatorTokens = await CreatorToken.findOne({
      where: { userId: user.id },
    });

        let accessToken, refreshToken;
        const userAgent = req.headers["user-agent"];

         if (
      creatorTokens 
    ){
        const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const refreshTokenExpiration = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

       accessToken = generateAccessToken(user.id, user.role);
      refreshToken = generateRefreshToken(user.id, user.role);
      await creatorTokens.update({ userAgent, accessToken, refreshToken, accessTokenExpiration, refreshTokenExpiration });
    } else {
      accessToken = generateAccessToken(user.id, user.role);
      refreshToken = generateRefreshToken(user.id, user.role);
      const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const refreshTokenExpiration = new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ); 

      const myToken = await CreatorToken.create({
        accessToken,
        refreshToken,
        userId: user.id,
        userAgent,
        accessTokenExpiration,
        refreshTokenExpiration,
        type: "Creator"
      });
      console.log("my token", myToken)
    }
    const getSubscription = await Subscription.findOne({
      where: {
       creatorId: user.id
      }
    })

    let plan;
    if(!getSubscription){
      plan = "Lite"
    } else {
      plan = getSubscription.planType
    }

    const creatorSubset = {
      CreatorId: user.id,
      organizationName: user.organizationName,
      email: user.email,
      role: user.role,
      image: user.imageUrl,
      plan: plan
    };

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      data: creatorSubset,
    });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
}

module.exports = {
    gfaLoginCreator
}