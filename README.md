# VOICE BOT 

> **How to Change Agent ID, Google Client ID, and Other Credentials**
>
> - **Google Client ID:**
>   - Go to `src/services/googleAuth.ts`.
>   - Find the `client_id` parameter in the `initialize` method or where Google Auth is configured.
>   - Replace the existing Client ID with your own from the [Google Cloud Console](https://console.cloud.google.com/).
>
> - **Agent ID and Other Credentials:**
>   - If your project uses an Agent ID or other API credentials, locate them in the configuration files or environment variables (commonly in `src/services/`, `.env`, or similar files).
>   - Update these values as needed for your deployment or environment.
>
> **Remember:** After changing credentials, restart your development server for changes to take effect.

---

A modern, responsive web application built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.  
This project features Google Authentication for secure sign-in.

---

## Repository

This project is hosted on GitHub:  
[https://github.com/Kabilan21052004/voice-bot](https://github.com/Kabilan21052004/voice-bot)

---

## Features

- ⚡ **Vite** for fast development and build
- ⚛️ **React** with **TypeScript** for robust UI
- 🎨 **Tailwind CSS** for utility-first styling
- 🔒 **Google Authentication** (OAuth2, People API)
- 🧩 Modular, reusable UI components

---

## Tool Integrations (for ElevenLabs)

This project is designed to work with the following webhook/client tools for user management and conversation tracking. These should be set up in your automation platform (such as ElevenLabs ):
NOTE : REPLACE THE WEBHOOK URL WITH YOUR WEBHOOK URL
### 1. `check_user`
- **Type:** Webhook (POST)
- **Endpoint:** `https://kabilan2004.app.n8n.cloud/webhook/check_user`
- **Purpose:** Check if a customer exists using their email address.
- **Request Body:**
  - `user_email` (string, required): The email ID of the user (retrieved via `get_user_email`).

### 2. `get_conversation_history`
- **Type:** Webhook (POST)
- **Endpoint:** `https://kabilan2004.app.n8n.cloud/webhook/get-conversations`
- **Purpose:** Retrieve the past conversation history for a user.
- **Request Body:**
  - `user_email` (string, required): The authenticated user's email address from Google OAuth.

### 3. `store_conversation`
- **Type:** Webhook (POST)
- **Endpoint:** `https://kabilan2004.app.n8n.cloud/webhook/store-conversation`
- **Purpose:** Store a conversation with user email for future reference and personalization.
- **Request Body:**
  - `conversation_id` (string, required): Unique session identifier for this conversation.
  - `user_email` (string, required): The authenticated user's email address from Google OAuth.
  - `phone_number` (string, required): The contact number of the user.
  - `conversation_content` (string, required): Complete conversation transcript including user messages and AI responses.
  - `timestamp` (string, required): ISO 8601 formatted timestamp of when conversation occurred.
  - `action` (string, required): Action to perform: 'store' or 'get'.

### 4. `get_user_email`
- **Type:** Client
- **Purpose:** Retrieves the email address and phone number of the authenticated user from Google Auth.
- **Parameters:** None (uses current Google Auth session).

**Note:**
- These tools are essential for user authentication, conversation storage, and retrieval in this project.
- Make sure to configure these endpoints and their schemas in your automation platform as described above.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Kabilan21052004/voice-bot.git
cd voice-bot
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
bun run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

---

## Google Authentication Setup

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Identity Services** and **People API**.
3. Set up OAuth 2.0 credentials and get your **Client ID**.
4. Update your app to use your Google Client ID (see `src/services/googleAuth.ts`).

---

## Project Structure

```
voice-bot/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── services/           # API and auth services
│   └── index.css           # Global styles
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build

---

## License

[MIT](LICENSE)  
© 2025 Your Name

---

## Acknowledgements

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Identity Services](https://developers.google.com/identity)

---
