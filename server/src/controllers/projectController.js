import Project from '../models/Project.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNotification } from '../utils/notifications.js';
import { normalizeList } from '../utils/normalize.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const projectPopulate = { path: 'owner', select: 'name username headline avatar skills technologies' };

const canManageProject = (project, user) => `${project.owner._id || project.owner}` === `${user._id}` || user.role === 'admin';

const projectFilter = (query) => {
  const filter = {};

  if (query.owner) {
    filter.owner = query.owner;
  }

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [
      { title: regex },
      { description: regex },
      { techStack: regex }
    ];
  }

  if (query.technology) {
    filter.techStack = { $regex: query.technology, $options: 'i' };
  }

  if (query.status) {
    filter.status = query.status;
  }

  return filter;
};

export const getProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = projectFilter(req.query);

  const [projects, total] = await Promise.all([
    Project.find(filter).populate(projectPopulate).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(limit),
    Project.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: projects.length,
    pagination: paginationMeta(page, limit, total),
    projects
  });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(projectPopulate);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  res.status(200).json({
    status: 'success',
    project
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    owner: req.user._id,
    title: req.body.title,
    description: req.body.description,
    techStack: normalizeList(req.body.techStack),
    githubUrl: req.body.githubUrl,
    liveDemoUrl: req.body.liveDemoUrl,
    images: req.body.images || [],
    featured: Boolean(req.body.featured),
    status: req.body.status || 'building'
  });

  const populated = await project.populate(projectPopulate);

  res.status(201).json({
    status: 'success',
    project: populated
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (!canManageProject(project, req.user)) {
    throw new AppError('You can only edit your own projects', 403);
  }

  project.title = req.body.title ?? project.title;
  project.description = req.body.description ?? project.description;
  project.techStack = req.body.techStack !== undefined ? normalizeList(req.body.techStack) : project.techStack;
  project.githubUrl = req.body.githubUrl ?? project.githubUrl;
  project.liveDemoUrl = req.body.liveDemoUrl ?? project.liveDemoUrl;
  project.images = req.body.images ?? project.images;
  project.featured = req.body.featured ?? project.featured;
  project.status = req.body.status ?? project.status;

  await project.save();
  const populated = await project.populate(projectPopulate);

  res.status(200).json({
    status: 'success',
    project: populated
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (!canManageProject(project, req.user)) {
    throw new AppError('You can only delete your own projects', 403);
  }

  await Project.deleteOne({ _id: project._id });
  await User.updateMany({}, { $pull: { savedProjects: project._id } });

  res.status(204).send();
});

export const toggleSaveProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const saved = req.user.savedProjects.some((id) => `${id}` === `${project._id}`);

  if (saved) {
    req.user.savedProjects.pull(project._id);
    project.savedBy.pull(req.user._id);
  } else {
    req.user.savedProjects.addToSet(project._id);
    project.savedBy.addToSet(req.user._id);
    await createNotification({
      recipient: project.owner,
      sender: req.user._id,
      type: 'project-save',
      message: `${req.user.name} saved your project`,
      project: project._id
    });
  }

  await Promise.all([
    req.user.save({ validateBeforeSave: false }),
    project.save({ validateBeforeSave: false })
  ]);

  res.status(200).json({
    status: 'success',
    saved: !saved,
    savesCount: project.savedBy.length
  });
});
