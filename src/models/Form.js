const mongoose = require("mongoose");

const sidebarSchema = new mongoose.Schema({
  image: { type: String },
  styles: {
    color: { type: String },
  },
});

const logoSchema = new mongoose.Schema({
  image: { type: String },
});

const pageSchema1 = new mongoose.Schema({
  heading: { type: String, required: true },
  sub: { type: String, required: true },
  topic1: { type: String, required: true },
  topic2: { type: String, required: true },
  topic3: { type: String, required: true },
  topic4: { type: String, required: true },
  buttonText1: { type: String, required: true },
  footer: { type: String, required: true },
  styles: {
    backgroundColor: { type: String, required: true },
    color: { type: String, required: true },
    fontFamily: { type: String, required: true },
  },
});

const pageSchema2 = new mongoose.Schema({
  heading: { type: String, required: true },
  sub: { type: String, required: true },
  topic1: { type: String, required: true },
  topic2: { type: String, required: true },
  topic3: { type: String, required: true },
  topic4: { type: String, required: true },
  buttonText1: { type: String, required: true },
  buttonText2: { type: String, required: true },
  styles: {
    backgroundColor: { type: String, required: true },
    color: { type: String, required: true },
    fontFamily: { type: String, required: true },
  },
});



const pageSchema3 = new mongoose.Schema({
  heading: { type: String, required: true },
  sub: { type: String, required: true },
  topic1: { type: String, required: true },
  topic2: { type: String, required: true },
  topic3: { type: String, required: true },
  topic4: { type: String, required: true },
  buttonText1: { type: String, required: true },
  buttonText2: { type: String, required: true },
  styles: {
    backgroundColor: { type: String, required: true },
    color: { type: String, required: true },
    fontFamily: { type: String, required: true },
  },
});

const formSchema = new mongoose.Schema({
  creatorId: {
    type: String,
    required: true,
  },
  ecosystemId: {
    type: String,
    required: true,
  },
  sidebar: sidebarSchema,
  logo: logoSchema,
  Page1: pageSchema1,
  Page2: pageSchema2,
  Page3: pageSchema3,
});

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
