import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [2000, 'Post cannot exceed 2000 characters']
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    techStack: [{ type: String, trim: true }],
    images: [
      {
        url: String,
        publicId: String
      }
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    visibility: {
      type: String,
      enum: ['public', 'followers'],
      default: 'public'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

postSchema.index({ content: 'text', tags: 'text', techStack: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

postSchema.virtual('likesCount').get(function likesCount() {
  return this.likes?.length || 0;
});

postSchema.virtual('commentsCount').get(function commentsCount() {
  return this.comments?.length || 0;
});

const Post = mongoose.model('Post', postSchema);

export default Post;
