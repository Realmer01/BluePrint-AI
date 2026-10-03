# BlueprintAI — AI-Powered Wireframe to Code Converter

## Overview
BlueprintAI is a full-stack AI app that turns wireframe images into **React + Tailwind CSS components**. Upload a wireframe, describe the page, pick an AI model, and the generated code streams into a live in-browser editor with an instant preview. It is built on **Next.js**, uses **OpenRouter.ai** for multi-model code generation, **Firebase Authentication** for Google sign-in, and **NeonDB (Postgres)** for users, credits and saved designs, including the compressed wireframe images. Every service runs on its free tier, and no credit card is needed.

---

## Features
- **Convert wireframes into React + Tailwind CSS components** from an image plus a short description
- **Multiple AI models** via OpenRouter: Google Gemma 4 and Alibaba Qwen 3.8 (free, vision-capable models)
- **Live code editor and preview** powered by Sandpack, with code streamed in as it is generated
- **Regenerate** a design at any time and the new code is saved automatically
- **Google sign-in** with Firebase Authentication
- **Credit-based usage**: every new user gets 3 credits and each conversion uses one
- **Design history**: every wireframe and its generated code is saved to your account

---

## Tech Stack
- **Framework:** Next.js 15 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **AI:** OpenRouter.ai (OpenAI-compatible API) with streaming responses
- **Auth:** Firebase Authentication (Google OAuth)
- **Database:** NeonDB (serverless Postgres) with Drizzle ORM. Wireframes are compressed in the browser and stored alongside each design.
- **Editor:** Sandpack (CodeSandbox) for live editing and preview

---

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)
- [License](#license)

---

## Setup Instructions
1. **Clone the repository**
   ```sh
   git clone https://github.com/Realmer01/BluePrint-AI
   cd BluePrint-AI
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Create your environment file**

   Copy `.env.example` to `.env.local` and fill in the values:
   ```sh
   cp .env.example .env.local
   ```

   | Variable | Where to get it |
   |---|---|
   | `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project settings → Your apps → Web app config |
   | `NEON_DB_CONNECTION_STRING` | Neon Console → your project → Connection string (server-only, never sent to the browser) |
   | `OPENROUTER_AI_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) |

   `OPENROUTER_AI_API_KEY` must be set for `npm run build` to succeed. The app uses OpenRouter's free (`:free`) models, so no credit is needed, but free models are limited to about 50 requests per day.

4. **Set up Firebase**
   - Create a Firebase project and register a **Web app**
   - **Authentication** → Sign-in method → enable **Google**
   - The free Spark plan is enough. Firebase Storage is not used, so no billing account is needed.
   - When deploying, add your domain under Authentication → Settings → **Authorized domains**

5. **Create the database tables**

   Pushes the Drizzle schema in `configs/schema.ts` to your Neon database:
   ```sh
   npx drizzle-kit push
   ```

6. **Run the development server**
   ```sh
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## Usage Guide
1. **Sign in** with Google from the home page.
2. **Upload a wireframe** image on the Workspace page.
3. **Pick an AI model** and **describe your page**.
4. Click **Convert to Code**. This uses one credit.
5. Watch the code **stream into the editor**, then edit it and see the **live preview** update.
6. Click **Regenerate Code** to get a new version from the same wireframe.
7. Find all your past wireframes and their code on the **Design** page, and your remaining balance on **Credits**.

---

## Contributing
Contributions are welcome! Feel free to fork the repo, create a feature branch, and submit a pull request.

---

## License
This project is licensed under the **MIT License** (see [LICENSE](LICENSE)). Feel free to use, modify, and distribute it.

---

###  What I have learned about:
✅ Convert wireframes into React + Tailwind CSS components effortlessly  
✅ Implement TypeScript for type safety and scalability   
✅ Use Firebase for authentication, and NeonDB with Drizzle ORM for data   
✅ Integrate OpenRouter.ai for multi-model AI code generation with streaming   
✅ Build a live in-browser code editor and preview with Sandpack   
✅ Optimize UI/UX with Tailwind CSS styling   

---
