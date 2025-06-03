# 🎵 Music Streaming Backend

A backend service for a music streaming application, developed using TypeScript.

## 🚀 Features

- User authentication and authorization using JWT
- Music streaming capabilities
- Playlist and album creation and management
- Search functionality for tracks and artists
- Likes song and albums

## 🛠️ Languages and Tools

![Express](https://img.shields.io/badge/Express-000?logo=express&logoColor=fff&style=flat)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=flat)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?logo=nodedotjs&logoColor=fff&style=flat)
![ts-node](https://img.shields.io/badge/ts--node-3178C6?logo=tsnode&logoColor=fff&style=flat)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=fff&style=flat)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=fff&style=flat)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=fff&style=flat)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff&style=flat)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=000&style=flat)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=fff&style=flat)
![JSON Web Tokens](https://img.shields.io/badge/JSON%20Web%20Tokens-000?logo=jsonwebtokens&logoColor=fff&style=flat)
![Handlebars](https://img.shields.io/badge/Handlebars.js-f0772b?logo=handlebarsdotjs&logoColor=fff&style=flat)
![Zod](https://img.shields.io/badge/Zod-3E54A3?logo=zod&logoColor=fff&style=flat)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=000&style=flat)
![.ENV](https://img.shields.io/badge/.ENV-ECD53F?logo=dotenv&logoColor=000&style=flat)

## 📁 Project Structure

```
├── prisma/                 # Prisma schema and migrations
├── src/                    # Source code
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Express middlewares
│   ├── routers/            # API routes
│   ├── services/           # Business logic
│   ├── repository/         # Repositories for access database
│   └── utils/              $ Utility functions
├── .env.example            # Environment variable examples
├── package.json            # Project metadata and scripts
├── tsconfig.json           # TypeScript configuration
└── nodemon.json            # Nodemon configuration
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Supabase project
- Redis cloud database
### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hungngoiu/Music-streaming-backend.git
   cd Music-streaming-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and other necessary configurations.

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

## 📄 API Documentation

API documentation is available via Swagger at `http://localhost:3000/api-docs` once the server is running.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.