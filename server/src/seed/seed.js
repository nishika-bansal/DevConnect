import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Notification from '../models/Notification.js';
import Post from '../models/Post.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

dotenv.config();

const password = 'Password123!';

const users = [
  {
    name: 'Aarav Mehta',
    username: 'aaravcodes',
    email: 'aarav@devconnect.demo',
    password,
    headline: 'Full Stack Engineer at API Forge',
    bio: 'I build developer tools, resilient APIs, and practical React interfaces.',
    location: 'Bengaluru, India',
    skills: ['React', 'Node.js', 'System Design', 'MongoDB'],
    technologies: ['Express', 'Docker', 'Redis'],
    socials: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      portfolio: 'https://example.com'
    },
    avatar: {
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
    }
  },
  {
    name: 'Maya Thompson',
    username: 'mayathompson',
    email: 'maya@devconnect.demo',
    password,
    headline: 'Frontend Architect and accessibility advocate',
    bio: 'Design systems, performance budgets, and calm dashboards.',
    location: 'Austin, USA',
    skills: ['React', 'TypeScript', 'Accessibility', 'CSS'],
    technologies: ['Vite', 'Storybook', 'Playwright'],
    avatar: {
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'
    }
  },
  {
    name: 'Kenji Sato',
    username: 'kenjiships',
    email: 'kenji@devconnect.demo',
    password,
    headline: 'Backend developer focused on distributed systems',
    bio: 'I like clean boundaries, boring queues, and APIs that tell the truth.',
    location: 'Tokyo, Japan',
    skills: ['Node.js', 'Go', 'MongoDB', 'Microservices'],
    technologies: ['Kafka', 'PostgreSQL', 'Kubernetes'],
    avatar: {
      url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80'
    }
  },
  {
    name: 'Sofia Garcia',
    username: 'sofiabuilds',
    email: 'sofia@devconnect.demo',
    password,
    headline: 'Open-source maintainer and product engineer',
    bio: 'Shipping collaboration tools for remote engineering teams.',
    location: 'Madrid, Spain',
    skills: ['React', 'GraphQL', 'Product Engineering'],
    technologies: ['Apollo', 'MongoDB', 'Cloudinary'],
    avatar: {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
    }
  }
];

const postText = [
  {
    content: 'Shipped a paginated search endpoint today. The big win was keeping filter parsing separate from controller logic so it stayed readable.',
    tags: ['api', 'mongodb'],
    techStack: ['Express', 'MongoDB']
  },
  {
    content: 'Small UI polish that paid off: skeleton cards with stable dimensions. No jumping layout while the feed loads.',
    tags: ['frontend', 'ux'],
    techStack: ['React', 'CSS']
  },
  {
    content: 'For JWT auth, I still prefer short-lived access tokens plus httpOnly cookies when the deployment setup allows it.',
    tags: ['auth', 'security'],
    techStack: ['JWT', 'Node.js']
  },
  {
    content: 'Added Cloudinary image upload to project cards. The trick is keeping project creation independent from upload success.',
    tags: ['uploads', 'cloudinary'],
    techStack: ['Cloudinary', 'Multer']
  }
];

const projectData = [
  {
    title: 'API Forge',
    description: 'A REST API starter with auth, validation, rate limits, and production-ready error handling.',
    techStack: ['Node.js', 'Express', 'MongoDB'],
    githubUrl: 'https://github.com/example/api-forge',
    liveDemoUrl: 'https://example.com/api-forge',
    status: 'launched',
    featured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80' }]
  },
  {
    title: 'Review Radar',
    description: 'A dashboard for tracking pull request health, stale reviews, and team throughput.',
    techStack: ['React', 'Vite', 'Playwright'],
    githubUrl: 'https://github.com/example/review-radar',
    liveDemoUrl: 'https://example.com/review-radar',
    status: 'building',
    images: [{ url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80' }]
  },
  {
    title: 'Stack Notes',
    description: 'A searchable engineering notebook for decisions, snippets, and architecture notes.',
    techStack: ['React', 'MongoDB', 'Cloudinary'],
    githubUrl: 'https://github.com/example/stack-notes',
    liveDemoUrl: 'https://example.com/stack-notes',
    status: 'planning',
    images: [{ url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80' }]
  }
];

const seed = async () => {
  await connectDB();

  await Promise.all([
    Notification.deleteMany({}),
    Post.deleteMany({}),
    Project.deleteMany({}),
    User.deleteMany({})
  ]);

  const createdUsers = await User.create(users);
  const [aarav, maya, kenji, sofia] = createdUsers;

  aarav.following.addToSet(maya._id, kenji._id, sofia._id);
  maya.followers.addToSet(aarav._id);
  kenji.followers.addToSet(aarav._id);
  sofia.followers.addToSet(aarav._id);
  maya.following.addToSet(aarav._id, sofia._id);
  aarav.followers.addToSet(maya._id);
  sofia.followers.addToSet(maya._id);

  await Promise.all(createdUsers.map((user) => user.save({ validateBeforeSave: false })));

  const posts = await Post.create(
    postText.map((post, index) => ({
      ...post,
      author: createdUsers[index % createdUsers.length]._id,
      likes: createdUsers.filter((_, userIndex) => userIndex !== index % createdUsers.length).map((user) => user._id),
      comments: [
        {
          user: createdUsers[(index + 1) % createdUsers.length]._id,
          text: 'This is exactly the kind of implementation detail I like seeing.'
        }
      ]
    }))
  );

  const projects = await Project.create(
    projectData.map((project, index) => ({
      ...project,
      owner: createdUsers[index % createdUsers.length]._id,
      savedBy: createdUsers.filter((_, userIndex) => userIndex !== index % createdUsers.length).map((user) => user._id)
    }))
  );

  aarav.bookmarkedPosts.addToSet(posts[1]._id, posts[2]._id);
  aarav.savedProjects.addToSet(projects[1]._id, projects[2]._id);
  await aarav.save({ validateBeforeSave: false });

  await Notification.create([
    {
      recipient: aarav._id,
      sender: maya._id,
      type: 'follow',
      message: 'Maya Thompson started following you'
    },
    {
      recipient: aarav._id,
      sender: kenji._id,
      type: 'like',
      post: posts[0]._id,
      message: 'Kenji Sato liked your post'
    },
    {
      recipient: maya._id,
      sender: sofia._id,
      type: 'project-save',
      project: projects[1]._id,
      message: 'Sofia Garcia saved your project'
    }
  ]);

  console.log('Seed data created');
  console.log('Demo accounts:');
  createdUsers.forEach((user) => console.log(`${user.email} / ${password}`));
  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
