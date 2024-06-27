const mongoose = require("mongoose");

const navbarItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  href: { type: String, required: true },
});

const navbarSchema = new mongoose.Schema({
  logo: { type: String, required: true },
  links: [navbarItemSchema],
  buttonText1: { type: String, required: true },
  buttonText2: { type: String, required: true },
  styles: {
    backgroundColor: { type: String, required: true },
    color: { type: String, required: true },
    fontFamily: { type: String, required: true },
  },
});

const heroSchema = new mongoose.Schema({
  title: { type: String },
  summary: { type: String },
  buttonText: { type: String },
  buttonColor: { type: String },
  backgroundImage: { type: String },
  styles: {
    color: { type: String },
    fontFamily: { type: String },
  },
});

const aboutUsSchema = new mongoose.Schema({
  title: { type: String },
  header: { type: String },
  text1: { type: String },
  text2: { type: String },
  styles: {
    backgroundColor: { type: String },
    color: { type: String },
    fontFamily: { type: String },
  },
});

const visionSchema = new mongoose.Schema({
  heading: { type: String },
  text1: { type: String },
  text2: { type: String },
  buttonText1: { type: String },
  image: { type: String },
  styles: {
    backgroundColor: { type: String },
    color: { type: String },
    fontFamily: { type: String },
  },
});

const audienceSchema = new mongoose.Schema({
  heading: { type: String },
  title1: { type: String },
  body1: { type: String },
  image1: { type: String },
  title2: { type: String },
  body2: { type: String },
  image2: { type: String },
  title3: { type: String },
  body3: { type: String },
  image3: { type: String },
  title4: { type: String },
  body4: { type: String },
  image4: { type: String },
  styles: {
    backgroundColor: { type: String },
    color: { type: String },
    fontFamily: { type: String },
  },
});

const ctaSchema = new mongoose.Schema({
  heading: { type: String },
  text1: { type: String },
  buttonText1: { type: String },
  image: { type: String },
  styles: {
    color: { type: String },
    fontFamily: { type: String },
  },
});

const whyUsSchema = new mongoose.Schema({
  topic: { type: String },
  header: { type: String },
  title1: { type: String },
  body1: { type: String },
  title2: { type: String },
  body2: { type: String },
  title3: { type: String },
  body3: { type: String },
  title4: { type: String },
  body4: { type: String },
  styles: {
    backgroundColor: { type: String },
    color: { type: String },
    fontFamily: { type: String },
  },
});

const contactUsSchema = new mongoose.Schema({
  heading: { type: String },
  name: { type: String },
  email: { type: String },
  message: { type: String },
  buttonText1: { type: String },
  styles: {
    backgroundColor: { type: String },
    color: { type: String },
    fontFamily: { type: String },
  },
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const footerSchema = new mongoose.Schema({
  logo: { type: String, required: true },
  header: { type: String, required: true },
  title1: { type: String, required: true },
  title2: { type: String, required: true },
  title3: { type: String, required: true },
  body1name1: { type: String, required: true },
  body1name2: { type: String, required: true },
  body1name3: { type: String, required: true },
  body2name1: { type: String, required: true },
  body2name2: { type: String, required: true },
  body3name1: { type: String, required: true },
  body3name2: { type: String, required: true },
  body3name3: { type: String, required: true },
  footerTags: { type: String, required: true },
  styles: {
    backgroundColor: { type: String, required: true },
    color: { type: String, required: true },
    fontFamily: { type: String, required: true },
  },
});

const templateSchema = new mongoose.Schema({
  creatorId: {
    type: String,
    required: true,
  },
  ecosystemId: {
    type: String,
    required: true,
  },
  templateNumber: {
    type: String,
  },
  navbar: navbarSchema,
  hero: heroSchema,
  aboutUs: aboutUsSchema,
  vision: visionSchema,
  audience: audienceSchema,
  cta: ctaSchema,
  whyUs: whyUsSchema,
  contactUs: contactUsSchema,
  faq: [faqSchema],
  faqStyles: {
    backgroundColor: { type: String },
    color: { type: String },
    fontFamily: { type: String },
  },
  footer: footerSchema,
});

const Template = mongoose.model("Template", templateSchema);

module.exports = Template;
