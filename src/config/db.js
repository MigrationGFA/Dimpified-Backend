// const mongoose = require("mongoose");

// const db = async () => {
//     try {
//         // const conn = await mongoose.connect('mongodb://localhost:27017/uploads')
//         const conn = await mongoose.connect('mongodb+srv://dorcasmakinde01:uH08gy4HwZpACXjC@wonderkid.ifaf8gw.mongodb.net/?retryWrites=true&w=majority')
//         console.log(`MongoDb Connected: ${conn.connection.host}`)
//     } catch (error) {
//         console.log(error)
//     }
// }

// module.exports = db

const mongoose = require("mongoose");

const db = async () => {
  try {
    // await mongoose.connect("mongodb://localhost:27017/remsana");
    await mongoose.connect(process.env.DATA_BASE_MONGODB);

    console.log("Mongodb database connected sucessfully");
  } catch (error) {
    console.log("error connecting to Mongodb server", error.message);
  }
};

module.exports = db;
