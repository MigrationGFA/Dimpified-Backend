const Creator = require("../../../models/Creator");
const DigitalProduct = require("../../../models/DigitalProduct");
const Ecosystem = require("../../../models/Ecosystem");

const createDigitalProduct = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      productName,
      productType,
      description,
      creatorId,
      ecosystemDomain,
      currency,
      author,
      package,
    } = req.body;

    const details = [
      "category",
      "subCategory",
      "creatorId",
      "ecosystemDomain",
      "description",
      "productName",
      "productType",
      "currency",
      "author",
      "package",
    ];
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }

    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(400).json({ message: "Please onboard as a creator" });
    }

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(400).json({ message: "Invalid ecosystem Domain" });
    }

    let backgroundCover = [];
    // console.log("req.files:", req.files);

    if (req.files && req.files.length > 0) {
      backgroundCover = req.files.map((file) => {
        return `${process.env.IMAGE_URL}/${file.filename}`;
      });
    }

    const parsedPackages = JSON.parse(package);

    const digitalProduct = new DigitalProduct({
      category,
      subCategory,
      productName,
      productType,
      description,
      author,
      creatorId,
      ecosystemDomain,
      backgroundCover,
      currency,
      package: parsedPackages,
    });

    await digitalProduct.save();
    res
      .status(200)
      .json({ message: "Digital Product created succesfully", digitalProduct });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getADigitalProduct = async (req, res) => {
  try {
    const digitalProductId = req.params.digitalProductId;

    if (!digitalProductId) {
      return res.status(404).json({ message: "Product id is required" });
    }

    const digitalProduct = await DigitalProduct.findById(digitalProductId);
    if (!digitalProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ digitalProduct });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllDigitalProducts = async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    if (!creatorId) {
      return res.status(404).json({ message: "creatorId is required" });
    }

    const digitalProducts = await DigitalProduct.find({ creatorId }).sort({
      createdAt: -1,
    });
    if (digitalProducts.length == 0) {
      return res.status(404).json({ message: "You have no didgital products" });
    }

    res.status(200).json({ digitalProducts });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllEcosystemDigitalProducts = async (req, res) => {
  try {
    const ecosystemDomain = req.params.ecosystemDomain;

    if (!ecosystemDomain) {
      return res.status(404).json({ message: "ecosystemDomain is required" });
    }

    const ecosystemDigitalProducts = await DigitalProduct.find({
      ecosystemDomain,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json({ ecosystemDigitalProducts });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDigitalProduct,
  getADigitalProduct,
  getAllDigitalProducts,
  getAllEcosystemDigitalProducts,
};
