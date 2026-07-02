import mongoose from 'mongoose';
import validator from 'validator';

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Project title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [1200, 'Project description cannot exceed 1200 characters']
    },
    techStack: [{ type: String, trim: true }],
    githubUrl: {
      type: String,
      validate: {
        validator(value) {
          return !value || validator.isURL(value, { require_protocol: true });
        },
        message: 'GitHub URL must include http or https'
      }
    },
    liveDemoUrl: {
      type: String,
      validate: {
        validator(value) {
          return !value || validator.isURL(value, { require_protocol: true });
        },
        message: 'Live demo URL must include http or https'
      }
    },
    images: [
      {
        url: String,
        publicId: String
      }
    ],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    featured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['planning', 'building', 'launched'],
      default: 'building'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

projectSchema.index({ title: 'text', description: 'text', techStack: 'text' });
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ techStack: 1 });

projectSchema.virtual('savesCount').get(function savesCount() {
  return this.savedBy?.length || 0;
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
