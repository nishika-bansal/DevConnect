import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toPublicUser } from '../utils/normalize.js';

const uploadBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

const ensureCloudinary = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary credentials are not configured', 500);
  }
};

export const uploadProfileImage = asyncHandler(async (req, res) => {
  ensureCloudinary();

  if (!req.file) {
    throw new AppError('Please upload an image file', 400);
  }

  const result = await uploadBuffer(req.file.buffer, 'devconnect/profiles');

  req.user.avatar = {
    url: result.secure_url,
    publicId: result.public_id
  };
  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    image: req.user.avatar,
    user: toPublicUser(req.user)
  });
});

export const uploadProjectImage = asyncHandler(async (req, res) => {
  ensureCloudinary();

  if (!req.file) {
    throw new AppError('Please upload an image file', 400);
  }

  const result = await uploadBuffer(req.file.buffer, 'devconnect/projects');

  res.status(200).json({
    status: 'success',
    image: {
      url: result.secure_url,
      publicId: result.public_id
    }
  });
});
