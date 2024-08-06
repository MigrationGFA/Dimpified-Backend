const mongoose = require("mongoose");

// Define Schema for Testimonials
const testimonialSchema = new mongoose.Schema({
  text: { type: String, required: true },
  client: { type: String, required: true },
});

// Define Schema for Team Members
const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  imageUrl: { type: String},
  socialLinks: {
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
  },
});

// Define Schema for Carousel Images
const carouselImageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  alt: { type: String, required: true },
});

// Define Schema for Navbar
const navbarSchema = new mongoose.Schema({
  background: { type: String },
  logo: { type: String },
  links: [
    {
      href: { type: String, required: true },
      text: { type: String, required: true },
    },
  ],
  button: {
    variant: { type: String },
  },
});

// Define Schema for Hero Section
const heroSectionSchema = new mongoose.Schema({
  backgroundImage: { type: String, required: true },
  backgroundSize: { type: String },
  height: { type: String, required: true },
  color: { type: String, required: true },
  textAlign: { type: String, required: true },
  headline: {
    text: { type: String, required: true },
  },
  subHeadline: {
    text: { type: String },
  },
  button: {
    text: { type: String },
  },
});

// Define Schema for About Section
const aboutSectionSchema = new mongoose.Schema({
  title: {
    text: { type: String },
  },
  images: [
    {
      src: { type: String, required: true },
      style: {
        backgroundImage: { type: String, required: true },
      },
    },
  ],
});

const footerSchema = new mongoose.Schema({
  logo: { type: String, required: true },
  sections: [
    {
      title: { type: String },
      items: [
        {
          title: { type: String },
          body: { type: String },
        },
      ],
    },
  ],
  styles: {
    backgroundColor: { type: String, required: true },
    color: { type: String, required: true },
    fontFamily: { type: String, required: true },
  },
});

// Define Combined Schema
const templateSchema = new mongoose.Schema({
  creatorId: {
    type: String,
    required: true,
  },
  ecosystemDomain: {
    type: String,
    required: true,
  },
  templateNumber: {
    type: String,
  },
  navbar: navbarSchema,
  heroSection: heroSectionSchema,
  aboutSection: aboutSectionSchema,
  carouselImages: [carouselImageSchema],
  testimonials: [testimonialSchema],
  team: [teamMemberSchema],
  contactInfo: {
    phone: { type: String },
    email: { type: String },
  },
  footer: footerSchema,
});

module.exports = mongoose.model("BarberTemplate", templateSchema);
