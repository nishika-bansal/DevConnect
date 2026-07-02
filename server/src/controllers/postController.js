import Post from '../models/Post.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNotification } from '../utils/notifications.js';
import { normalizeList } from '../utils/normalize.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const postPopulate = [
  { path: 'author', select: 'name username headline avatar skills technologies followers following' },
  { path: 'comments.user', select: 'name username avatar headline' }
];

const canManagePost = (post, user) => `${post.author._id || post.author}` === `${user._id}` || user.role === 'admin';

const postFilter = (query, user) => {
  const filter = {
    $or: [
      { visibility: 'public' },
      { author: { $in: [...user.following, user._id] } }
    ]
  };

  if (query.author) {
    filter.author = query.author;
  }

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$and = [
      {
        $or: [
          { content: regex },
          { tags: regex },
          { techStack: regex }
        ]
      }
    ];
  }

  if (query.tag) {
    filter.tags = { $regex: query.tag, $options: 'i' };
  }

  if (query.technology) {
    filter.techStack = { $regex: query.technology, $options: 'i' };
  }

  return filter;
};

export const getFeed = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = postFilter(req.query, req.user);

  const [posts, total] = await Promise.all([
    Post.find(filter).populate(postPopulate).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    pagination: paginationMeta(page, limit, total),
    posts
  });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(postPopulate);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  res.status(200).json({
    status: 'success',
    post
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create({
    author: req.user._id,
    content: req.body.content,
    tags: normalizeList(req.body.tags).map((tag) => tag.toLowerCase()),
    techStack: normalizeList(req.body.techStack),
    images: req.body.images || [],
    visibility: req.body.visibility || 'public'
  });

  const populated = await post.populate(postPopulate);

  res.status(201).json({
    status: 'success',
    post: populated
  });
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (!canManagePost(post, req.user)) {
    throw new AppError('You can only edit your own posts', 403);
  }

  post.content = req.body.content ?? post.content;
  post.tags = req.body.tags !== undefined ? normalizeList(req.body.tags).map((tag) => tag.toLowerCase()) : post.tags;
  post.techStack = req.body.techStack !== undefined ? normalizeList(req.body.techStack) : post.techStack;
  post.visibility = req.body.visibility ?? post.visibility;
  post.images = req.body.images ?? post.images;

  await post.save();
  const populated = await post.populate(postPopulate);

  res.status(200).json({
    status: 'success',
    post: populated
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (!canManagePost(post, req.user)) {
    throw new AppError('You can only delete your own posts', 403);
  }

  await Post.deleteOne({ _id: post._id });
  await User.updateMany({}, { $pull: { bookmarkedPosts: post._id } });

  res.status(204).send();
});

export const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const liked = post.likes.some((id) => `${id}` === `${req.user._id}`);

  if (liked) {
    post.likes.pull(req.user._id);
  } else {
    post.likes.addToSet(req.user._id);
    await createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'like',
      message: `${req.user.name} liked your post`,
      post: post._id
    });
  }

  await post.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    liked: !liked,
    likesCount: post.likes.length
  });
});

export const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  post.comments.push({
    user: req.user._id,
    text: req.body.text
  });

  await createNotification({
    recipient: post.author,
    sender: req.user._id,
    type: 'comment',
    message: `${req.user.name} commented on your post`,
    post: post._id
  });

  await post.save();
  const populated = await post.populate(postPopulate);

  res.status(201).json({
    status: 'success',
    post: populated
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comment = post.comments.id(req.params.commentId);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  const allowed = `${comment.user}` === `${req.user._id}` || `${post.author}` === `${req.user._id}` || req.user.role === 'admin';

  if (!allowed) {
    throw new AppError('You cannot delete this comment', 403);
  }

  comment.deleteOne();
  await post.save({ validateBeforeSave: false });

  res.status(204).send();
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const bookmarked = req.user.bookmarkedPosts.some((id) => `${id}` === `${post._id}`);

  if (bookmarked) {
    req.user.bookmarkedPosts.pull(post._id);
  } else {
    req.user.bookmarkedPosts.addToSet(post._id);
    await createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'bookmark',
      message: `${req.user.name} bookmarked your post`,
      post: post._id
    });
  }

  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    bookmarked: !bookmarked,
    bookmarksCount: await User.countDocuments({ bookmarkedPosts: post._id })
  });
});
