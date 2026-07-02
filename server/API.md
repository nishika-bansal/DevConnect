# DevConnect API

Base URL:

```text
http://localhost:5000/api
```

Send protected requests with:

```text
Authorization: Bearer <token>
```

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/verify-email`

## Users

- `GET /users?search=&skill=&technology=&page=&limit=`
- `GET /users/suggestions`
- `GET /users/trending`
- `GET /users/:id`
- `PATCH /users/me`
- `POST /users/:id/follow`
- `GET /users/:id/followers`
- `GET /users/:id/following`

## Posts

- `GET /posts?search=&tag=&technology=&author=&page=&limit=`
- `POST /posts`
- `GET /posts/:id`
- `PATCH /posts/:id`
- `DELETE /posts/:id`
- `POST /posts/:id/like`
- `POST /posts/:id/bookmark`
- `POST /posts/:id/comments`
- `DELETE /posts/:id/comments/:commentId`

## Projects

- `GET /projects?search=&technology=&owner=&status=&page=&limit=`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
- `POST /projects/:id/save`

## Dashboard, Notifications, Uploads

- `GET /dashboard`
- `GET /notifications`
- `PATCH /notifications/read-all`
- `PATCH /notifications/:id/read`
- `DELETE /notifications`
- `POST /upload/profile`
- `POST /upload/project`
