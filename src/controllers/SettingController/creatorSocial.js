const Creator = require("../../models/Creator");
const SocialProfile = require("../../models/SocialProfile");


const createSocialProfile = async (req, res) => {
    try {
        await SocialProfile.sync();
        const {
            creatorId,
            twitter,
            youtube,
            instagram,
            facebook,
            LinkedIn
        } = req.body

        if (!(twitter || youtube || instagram || facebook || LinkedIn)) {
            return res.status(400).json({ message: "At least one social profile is required" });
        }

        //check if creator exist in the database.
        const creator = await Creator.findOne({
            where: {
                id: creatorId
            }
        })
        if (!creator) {
            return res.status(400).json({ message: `Creator not Found` });
        }

        //check if the creator has uploaded their social profile
        const creatorSocialProfile = await SocialProfile.findOne({
            where: {
                creatorId: creatorId
            }
        })
        if (creatorSocialProfile) {
            const updatedSocialProfile = await SocialProfile.update(
                {
                    twitter,
                    youtube,
                    instagram,
                    facebook,
                    LinkedIn
                },
                {
                    where: {
                        creatorId: creatorId
                    }
                }
            );
            return res.status(200).json({ message: "Social Updated Successfully", data: updatedSocialProfile })
        } else {
            const Social = await SocialProfile.create({
                creatorId,
                twitter,
                youtube,
                instagram,
                facebook,
                LinkedIn
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
        const creatorId = req.params.creatorId;
        if (!creatorId) {
            return res.status(400).json({ message: `creatorId id is required` });
        };

        const creator = await SocialProfile.findOne({
            where: {
                creatorId: creatorId,
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

module.exports = { createSocialProfile, getCreatorSocialProfile }