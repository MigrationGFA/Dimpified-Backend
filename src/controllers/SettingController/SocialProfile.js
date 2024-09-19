const SocialProfile = require("../../models/SocialProfile");
const EcosystemUser = require("../../models/EcosystemUser");

const socialProfile = async (req, res) => {
  try {
    await SocialProfile.sync();

    const { userId, twitter, youtube, instagram, facebook, LinkedIn, ecosystemDomain } =
      req.body;

    if (!(twitter || youtube || instagram || facebook || LinkedIn, ecosystemDomain)) {
      return res
        .status(400)
        .json({ message: "Social Profile information not complete" });
    }

    const userExist = await EcosystemUser.findOne({
      where: {
        id: userId,
      },
    });

    if (!userExist) {
      return res.status(404).json({ message: `User does not exist` });
    }

    const userProfile = await SocialProfile.findOne({
      where: {
        userId: userId,
      },
    });

    if (userProfile) {
      const updatedSocialProfile = await SocialProfile.update(
        {
          twitter,
          youtube,
          instagram,
          facebook,
          LinkedIn,
          ecosystemDomain
        },
        {
          where: {
            userId: userId,
          },
        }
      );
      return res.status(200).json({
        message: "Social profile updated successfully",

      });
    } else {
      const newSocialProfile = await SocialProfile.create({
        userId,
        twitter,
        youtube,
        instagram,
        facebook,
        LinkedIn,
        ecosystemDomain
      });
      return res.status(201).json({
        message: "Social profile created successfully",
        data: newSocialProfile,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error });
  }
};

const getSocial = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: `user id is required` });
    }

    const user = await SocialProfile.findOne({
      where: {
        userId: userId,
      },
    });
    if (user) {
      return res.status(200).json({ user });
    } else {
      return res.status(200).json({ message: "Social does not exist" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error });
  }
};



module.exports = {
  socialProfile,
  getSocial,
};
