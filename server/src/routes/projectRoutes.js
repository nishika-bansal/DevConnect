import express from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  toggleSaveProject,
  updateProject
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { projectUpdateValidator, projectValidator } from '../validators/projectValidators.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getProjects).post(projectValidator, validateRequest, createProject);
router.route('/:id').get(getProject).patch(projectUpdateValidator, validateRequest, updateProject).delete(deleteProject);
router.post('/:id/save', toggleSaveProject);

export default router;
