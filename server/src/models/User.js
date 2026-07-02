import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import validator from 'validator';

const experienceSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    current: { type: Boolean, default: false },
    description: String
  },
  { _id: true }
);

const educationSchema = new mongoose.Schema(
  {
    school: String,
    degree: String,
    fieldOfStudy: String,
    from: Date,
    to: Date,
    current: { type: Boolean, default: false },
    description: String
  },
  { _id: true }
);

const socialSchema = new mongoose.Schema(
  {
    github: String,
    linkedin: String,
    portfolio: String,
    twitter: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, dashes, and underscores']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    passwordChangedAt: {
      type: Date,
      select: false
    },
    role: {
      type: String,
      enum: ['developer', 'admin'],
      default: 'developer'
    },
    avatar: {
      url: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/v1690000000/devconnect/default-avatar.png'
      },
      publicId: String
    },
    headline: {
      type: String,
      default: 'Full Stack Developer',
      maxlength: [120, 'Headline cannot exceed 120 characters']
    },
    bio: {
      type: String,
      default: '',
      maxlength: [600, 'Bio cannot exceed 600 characters']
    },
    location: String,
    skills: [{ type: String, trim: true }],
    technologies: [{ type: String, trim: true }],
    experience: [experienceSchema],
    education: [educationSchema],
    socials: socialSchema,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarkedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.index({ name: 'text', username: 'text', headline: 'text', bio: 'text', skills: 'text', technologies: 'text' });
userSchema.index({ skills: 1 });
userSchema.index({ technologies: 1 });

userSchema.virtual('followersCount').get(function followersCount() {
  return this.followers?.length || 0;
});

userSchema.virtual('followingCount').get(function followingCount() {
  return this.following?.length || 0;
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
