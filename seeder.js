/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const Product = require('./models/products.model');
const connectToDB = require('./config/connectDB');
const { cloudinaryUploadImage } = require('./utils/cloudinary');

// connect to DB
connectToDB();


// Read data
// const products = JSON.parse(fs.readFileSync('./utils/dummyData/tech_accessories.json'));

const insertData = async () => {
  try{
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, './utils/dummyData/tech_accessories.json'), 'utf-8'));
  
    for (let product of products) {
      const imageUrl = await cloudinaryUploadImage(product.images);
      if (imageUrl) {
        product.image = imageUrl;
        await Product.create(product);
      }
    }
    console.log('Data Inserted');
    process.exit();
  }catch (err) {
    console.log(err);
  }
};


// Insert data into DB
// const insertData = async () => {
//   try {
//     await Product.create(products);

//     console.log('Data Inserted');
//     process.exit();
//   } catch (error) {
//     console.log(error);
//   }
// };

// Delete data from DB
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// node seeder.js -d
if (process.argv[2] === '-i') {
  insertData();
} else if (process.argv[2] === '-d') {
  destroyData();
}