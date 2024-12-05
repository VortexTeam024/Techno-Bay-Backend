const cloudinary = require("cloudinary").v2;

//* Connect to Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


// Cloudinary Upload Image using stream for Buffer
const cloudinaryUploadImage = async (fileBuffer, fileName) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // Detect the type of file automatically
        public_id: fileName,
        eager: [
          {
            width: 800,
            height: 800,
            crop: "limit",
          },
        ],
      },
      (error, result) => {
        if (error) {
          console.log("Error uploading image to Cloudinary:", error);
          reject(new Error("Error uploading image to Cloudinary"));
        } else {
          resolve(result);
        }
      }
    );

    // Pipe the file buffer to the stream
    stream.end(fileBuffer);
  });

module.exports = {
  cloudinaryUploadImage,
};

