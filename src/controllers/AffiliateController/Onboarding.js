const Creator = require("../../models/Creator")
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerificationEmailCreator = require("../../utils/sendVerificationCreator");
const Subscribers = require("../../models/Subscription")
const { Op } = require("sequelize");

const onboardUser = async (req, res) => {
   try {
    const { organizationName, email, password, role, affiliateId } = req.body;
    const details = ["organizationName", "email", "password", "role", "affiliateId"];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }

    const duplicateCreator = await Creator.findOne({
      where: {
        email: email,
      },
    });

    if (duplicateCreator) {
      // If the email is not verified, update the creator account
      if (!duplicateCreator.isVerified) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(40).toString("hex");

        // Update creator information using the instance method 'update'
        const updateCreator = await duplicateCreator.update({
          organizationName,
          password: hashedPassword,
          verificationToken,
          role
        });

        // Send verification email
        await sendVerificationEmailCreator({
          organizationName: organizationName,
          email: email,
          verificationToken: verificationToken,
          origin: process.env.ORIGIN,
        });

        return res
          .status(201)
          .json({ message: "Verification email resent successfully", updateCreator });
      } else {
        return res
          .status(409)
          .json({ message: "Email address is associated with an account" });
      }
    } else {
      // If the creator doesn't exist, create a new creator
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(40).toString("hex");

      const newCreator = await Creator.create({
        organizationName,
        email,
        password: hashedPassword,
        verificationToken,
        isVerified: false,
        role,
        affiliateId
      });

      await sendVerificationEmailCreator({
        organizationName: organizationName,
        email: email,
        verificationToken: verificationToken,
        origin: process.env.ORIGIN,
      });

      return res.status(201).json({ message: "Creator created successfully", newCreator });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
}

const allAffiliateOnboardUsers = async (req, res) => {
  try {
    const userId = req.params.userId
    if(!userId){
      return res.status(404).json({ message: "userId is required", });
    }

    const getAllCreator = await Creator.findAll({
      where: {
        affiliateId: userId
      },
      attributes: { 
        exclude: ['password', 'id', 'verificationToken', 'passwordToken', 'passwordTokenExpirationDate'] 
      }
    })
    if(!getAllCreator){
      return res.status(200).json({ message: "You have not onbaord any user", });
    }
    return res.status(200).json({ getAllCreator, });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
}


const affiliateUserBlocks = async (req, res) => {
  const affiliateId = req.params.affiliateId;

  try {
    const creators = await Creator.findAll({
      where: {
        affiliateId: affiliateId,
      },
    });

    const creatorIds = creators.map(creator => creator.id);

    const uniqueSubscribedUsersCount = await Subscribers.count({
      where: {
        creatorId: {
          [Op.in]: creatorIds,
        },
      },
      distinct: true, 
      col: 'creatorId',
    });


    const totalUsers = await Creator.count({
      where: {
        affiliateId: affiliateId,
      },
    });

    const verifiedUsers = await Creator.count({
      where: {
        affiliateId: affiliateId,
        isVerified: true,
      },
    });

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const usersThisMonth = await Creator.count({
      where: {
        affiliateId: affiliateId,
        createdAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    // 4. Return the results
    res.status(200).json({
      totalUsers,
      verifiedUsers,
      usersThisMonth,
      uniqueSubscribedUsersCount,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};


module.exports = {
    onboardUser,
    allAffiliateOnboardUsers,
    affiliateUserBlocks
}