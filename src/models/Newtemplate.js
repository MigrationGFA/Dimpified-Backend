const mongoose = require("mongoose");
const { Schema } = mongoose;

const TemplateSchema = new Schema({
  navbar: {
    logo: { type: String, required: true },
    links: [{ type: String, maxlength: 7 }], // Maximum of 7 links
    ctaButtons: [{ type: String, maxlength: 2 }], // Maximum of 2 CTA buttons
    styles: {
      backgroundColor: String,
      color: String,
      fontFamily: String,
    },
  },
  hero: {
    headings: [{ type: String, maxlength: 2 }], // Maximum of 2 <h> tags
    paragraphs: [{ type: String, maxlength: 4 }], // Maximum of 4 <p> tags
    spans: [{ type: String, maxlength: 2 }], // Maximum of 2 <span> tags
    backgroundImages: [{ type: String, maxlength: 3 }], // Maximum of 3 background images
    ctaButtons: [{ type: String, maxlength: 2 }], // Maximum of 2 CTA buttons
    styles: {
      color: String,
      fontFamily: String,
    },
  },
  about: {
    headings: [{ type: String, maxlength: 2 }], // Maximum of 2 <h> tags
    paragraphs: [{ type: String, maxlength: 2 }], // Maximum of 2 <p> tags
    ctaButtons: [{ type: String, maxlength: 2 }], // Maximum of 2 CTA buttons
    images: [{ type: String, maxlength: 5 }], // Maximum of 5 images
    styles: {
      backgroundColor: String,
      color: String,
      fontFamily: String,
    },
  },
  quickSummary: [
    {
      span: String,
      icon: String, // Might not be editable
      heading: String,
      paragraph: String,
    },
  ], // Maximum of 4 sub-sections
  products: {
    subheading: String,
    heading: String,
    ctaButtons: [{ type: String, maxlength: 2 }], // Maximum of 2 CTA buttons
    serviceCards: [
      {
        image: String,
        serviceName: String,
        description: [{ type: String, maxlength: 2 }], // Maximum of 2 <p> tags
        ctaButtons: [{ type: String, maxlength: 2 }], // Maximum of 2 CTA buttons
      },
    ], // Maximum of 12 service cards
  },
  pricing: [
    {
      image: String,
      heading: String,
      span: String,
      description: String,
      ctaButton: String, // Maximum of 1 CTA button
    },
  ], // Maximum of 6 pricing cards
  partners: [
    {
      image: String,
      heading: String,
      ctaButtons: [{ type: String, maxlength: 2 }], // Maximum of 2 CTA buttons
    },
  ], // Maximum of 8 brands
  events: {
    heading: String,
    sectionDescription: String,
    subSections: [
      {
        image: String,
        heading: String,
        description: String,
        ctaButton: String, // Maximum of 1 CTA button
      },
    ], // Maximum of 6 sub-sections
  },
  gallery: {
    heading: String,
    briefInfo: String,
    images: [
      {
        image: String,
        description: String, // Each image has 1 <p> tag also
      },
    ], // Up to 12 gallery images
  },
  largeCta: {
    backgroundImages: [{ type: String, maxlength: 2 }], // Maximum of 2 background images
    headings: [{ type: String, maxlength: 3 }], // Maximum of 3 <h> tags
    paragraphs: [{ type: String, maxlength: 2 }], // Maximum of 2 <p> tags
    ctaButtons: [{ type: String, maxlength: 2 }], // Maximum of 2 CTA buttons
  },
  team: [
    {
      image: String,
      name: String,
      role: String,
    },
  ], // Maximum of 6 team cards
  blog: {
    blogPosts: [
      {
        image: String,
        heading: String,
        overview: String,
        date: String, // <span> tag for date
        author: String, // <span> tag for author
        readMoreButton: String, // Optional CTA/link button
      },
    ], // Maximum of 4 blog posts
  },
  testimonials: {
    reviews: [
      {
        image: String, // Round thumbnail or star rating
        name: String,
        review: String,
      },
    ], // Maximum of 6 carousels
  },
  smallCta: {
    heading: String,
    paragraph: String,
    ctaButtons: [{ type: String, maxlength: 2 }], // Maximum of 2 CTA buttons
  },
  contact: {
    backgroundImages: [{ type: String, maxlength: 2 }], // Maximum of 2 background images
    headings: [{ type: String, maxlength: 6 }], // Maximum of 6 <h> tags
    paragraphs: [{ type: String, maxlength: 2 }], // Maximum of 2 <p> tags
    ctaButtons: [{ type: String, maxlength: 2 }], // Maximum of 2 CTA buttons
    socialImages: [{ type: String, maxlength: 4 }], // Maximum of 4 social images
    formEntries: [
      {
        label: String, // e.g., first name, email, phone
        placeholder: String, // Short description
        selectOptions: [{ type: String, maxlength: 12 }], // Maximum of 12 select options
      },
    ], // Up to 10 form entries
  },
  footer: {
    logo: String,
    backgroundImage: String, // Optional
    headings: [{ type: String, maxlength: 4 }], // Maximum of 4 <h> tags
    paragraphs: [{ type: String, maxlength: 8 }], // Maximum of 8 <p> tags
    links: [{ type: String, maxlength: 8 }], // Maximum of 8 links
    socialImages: [{ type: String, maxlength: 5 }], // Maximum of 5 social icons
    styles: {
      backgroundColor: String,
      color: String,
      fontFamily: String,
    },
  },
});

const GeneralTemplate = mongoose.model("GeneralTemplate", TemplateSchema);

module.exports = GeneralTemplate;
