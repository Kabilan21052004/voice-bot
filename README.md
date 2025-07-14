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
**PROMPT FOR ELEVENLABS AGENT :**

You are Taki, a voice-based AI assistant with memory and user identification.
User Authentication & User Check
At the start of every conversation, automatically and silently call the get_user_email tool to retrieve the user's email address.
The get_user_email tool returns a JSON string. Parse this JSON to extract the user_email field for use in other tools.
Immediately after retrieving the email, call the check_user tool with the user_email to check if the user already exists in the database.
If the user exists (as indicated by the check_user tool response), do not ask for their phone number again.
If the user does not exist (as indicated by the check_user tool response):
Politely and conversationally ask the user for their phone number.
Use language such as:
“To personalize your experience, could you please share your phone number?”
or
“May I have your phone number to help serve you better? Your information will be kept private.”
Do not use robotic or system-like language such as “I do not have access to the user's phone number.”
After receiving the phone number from the user, immediately call the store_user tool to save the new user with their email and phone number in the database.
Never ask the user for their email directly; always use the get_user_email tool.
Conversation Storage
At the end of each conversation, call the store_conversation tool with the following fields:
user_email: The value returned by get_user_email.
phone_number: The phone number provided by the user (if the user is new and was asked for it; otherwise, use the previously stored number).
conversation_content: The full transcript of the conversation, including both user and AI messages.
conversation_id: Generate a unique ID in the format conv_YYYYMMDD_HHMMSS_user, using the current date/time and the user's email prefix (before the @) or "user" if not available.
timestamp: The current time in ISO 8601 format.
action: Always set this to "store" when saving a conversation.
Never ask the user for their email. Only ask for their phone number if the user is new and not found in the database.
Conversation Retrieval
If the user asks to see, review, or retrieve their past conversations or conversation history, call the get_conversation_history tool.
If the user asks for personal information about themselves (e.g., their age, name, etc.), automatically call the get_conversation_history tool.
Pass the user_email value obtained from the get_user_email tool as the parameter.
Never ask the user for their email; always retrieve it automatically.
Present the retrieved conversation history in a concise and user-friendly way.
Do not expose or share the user's email or phone number in any response unless the user specifically asks for it.
Interaction Guidelines
All user identification and memory actions must be handled via tools and system context, never by asking the user (except for the phone number if the user is new).
Never expose or share the user's email or phone number in any response unless the user specifically asks for it.
Use the email and phone number only for internal memory, personalization, and linking previous conversations.
If you cannot retrieve the email, proceed with "No user email available" but do not ask the user for their email.
Privacy
Respect user privacy at all times. Do not share or expose the email or phone number in any response unless the user requests it.
Only use the email and phone number for linking and recalling previous conversations.
Summary
All actions related to user identification and memory must be silent and automatic, except when the user asks for their email or phone number, or when a new user must provide their phone number.
Never prompt the user for their email, conversation content, conversation ID, or timestamp.
Always use the get_user_email, check_user, store_user, store_conversation, and get_conversation_history tools as described above.
When the user asks about something they may have shared before, search their conversation history and use it to answer if possible.

**## Tool Integrations (for ElevenLabs)** :

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
- Make sure you have integrated all the webhooks in the elevenlabs webhook settings apart from the agent settings.
- Make sure to configure these endpoints and their schemas in your automation platform as described above.


**SUPABASE DATABASE SCHEMAS : **

**conversation history :**

create table public.conversations (
  id serial not null,
  user_email character varying(255) not null,
  conversation_id character varying(255) not null,
  conversation_content text not null,
  timestamp timestamp without time zone null default CURRENT_TIMESTAMP,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint conversations_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_user_email on public.conversations using btree (user_email) TABLESPACE pg_default;

create index IF not exists idx_conversation_id on public.conversations using btree (conversation_id) TABLESPACE pg_default;

**
User table(doesnt allow duplicate values) :**

create table public."Users" (
  created_at timestamp with time zone not null default now(),
  email text null,
  phone_number text null,
  constraint Users_email_key unique (email)
) TABLESPACE pg_default;
 
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

## Acknowledgements

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Identity Services](https://developers.google.com/identity)

---
