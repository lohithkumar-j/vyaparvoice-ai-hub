VyaparAI: Voice-First Business Co-Pilot for Kirana Stores
Overview
VyaparAI is a cutting-edge AI-powered platform designed specifically for Indian kirana stores. It revolutionizes the way neighborhood shops manage inventory, customer credit (khata), billing, and marketing by leveraging voice commands, AI vision, and multi-language support, making digital transformation accessible, simple, and efficient.

Features
Voice-First Interface: Speak naturally in Hindi or English to manage inventory, customers, and sales.

Real-time Inventory Management: Automatic tracking and alerts for low stock.

Digital Khata: AI-powered customer credit ledger with smart reminders.

Receipt Scanning: Upload bills; AI extracts and organizes data.

AI-generated Marketing: Create promotional posters instantly using OpenAI’s DALL·E 3.

Multilingual Support: Designed for Indian languages with advanced Hindi NLP.

Offline Support: Works even with intermittent connectivity.

Secure Authentication: Email/password and Google OAuth sign-up & login.

Technology Stack
Frontend: React, TypeScript, Tailwind CSS, Framer Motion

Backend: Supabase (PostgreSQL, Realtime, Auth, Storage)

AI APIs: OpenAI Whisper (Voice), GPT-4 (Processing & Vision), Gemini(IMagery)

Hosting: Lovable.dev serverless platform

Getting Started
Prerequisites
Node.js (v16+)

Yarn or npm

Supabase account and project set up with API keys

OpenAI API key with access to GPT-4 and DALL·E 3

Installation
bash
git clone https://github.com/yourusername/vyaparai.git
cd vyaparai
yarn install
Configuration
Add your Supabase credentials in .env.local

Add your OpenAI API key in .env.local

Example .env.local:

text
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=your-openai-api-key
Running the App
bash
yarn dev
Open http://localhost:3000 in your browser to start.

Usage
Sign up or login using email or Google OAuth

Use voice commands in multiple languages to update and check inventory

Upload receipts to automatically track purchases

Manage customer credit and send reminders

Generate marketing posters via AI on the fly

Contributing
Contributions are welcome! Please open issues or pull requests for bug fixes, features, or documentation improvements.

License
This project is licensed under the MIT License.

For detailed documentation, feature description, and API integration info, refer to the /docs directory or the project wiki on GitHub.

VyaparAI: Empowering India's Kirana Stores with Voice and AI Technology.
