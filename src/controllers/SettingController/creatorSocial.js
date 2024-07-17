const Creator = require("../../models/Creator");
const CreatorSocialProfile = require("../../models/CreatorSocialProfile");



const createCreatorSocialProfile = async (req, res) => {
    try {
        await CreatorSocialProfile.sync();
        const {
            userId,
            twitter,
            youtube,
            instagram,
            facebook,
            LinkedIn,
            ecosystemDomain
        } = req.body

        if (!(twitter || youtube || instagram || facebook || LinkedIn)) {
            return res.status(400).json({ message: "At least one social profile is required" });
        }

        //check if creator exist in the database.
        const creator = await Creator.findOne({
            where: {
                id: userId
            }
        })
        if (!creator) {
            return res.status(400).json({ message: `Creator not Found` });
        }

        //check if the creator has uploaded their social profile
        const creatorSocialProfile = await CreatorSocialProfile.findOne({
            where: {
                userId: userId
            }
        })
        if (creatorSocialProfile) {
            const updatedSocialProfile = await CreatorSocialProfile.update(
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
                        userId: userId
                    }
                }
            );
            return res.status(200).json({ message: "Social Updated Successfully", data: updatedSocialProfile })
        } else {
            const Social = await CreatorSocialProfile.create({
                userId,
                twitter,
                youtube,
                instagram,
                facebook,
                LinkedIn,
                ecosystemDomain
            });
            return res.status(201).json({ message: "Social created successfully", data: Social })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error', detail: error });
    }
};

const getCreatorSocialProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: `userId id is required` });
        };

        const creator = await CreatorSocialProfile.findOne({
            where: {
                userId: userId,
            },
        });
        if (creator) {
            return res.status(200).json({ creator })
        }
        else {
            return res.status(200).json({ message: "Social does not exist" })
        };
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: "Internal Server Error", detail: error });
    };
};

module.exports = { createCreatorSocialProfile, getCreatorSocialProfile }