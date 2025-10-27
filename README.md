# Resumind by nexaworks

An AI-powered resume builder and analyzer platform for job seekers and HR professionals.

## Features

- **AI Resume Analysis**: Get detailed feedback on your resume content and structure
- **Resume Builder**: Create professional resumes with customizable templates
- **ATS Optimization**: Ensure your resume passes through Applicant Tracking Systems
- **HR Dashboard**: Streamlined candidate evaluation and recruitment tools (max 10 resumes per analysis)
- **Free to Use**: Completely free AI-powered platform

## Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- Firebase account
- Google AI Studio account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pavanofficiall/ai-resume-analyzer.git
cd ai-resume-analyzer
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your actual values in `.env.local`:

   **Firebase Setup:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Go to Project Settings > General > Your apps
   - Copy the Firebase config values

   **Google AI Setup:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Copy the API key

   **Multiple API Keys (Recommended for HR Dashboard):**
   For optimal performance when analyzing large batches of resumes (50+ files), you can add multiple API keys to prevent rate limiting:

   ```bash
   # Primary API key
   NEXT_PUBLIC_GEMINI_API_KEY=your_primary_key_here

   # Additional API keys for load balancing (optional)
   NEXT_PUBLIC_GEMINI_API_KEY_2=your_second_key_here
   NEXT_PUBLIC_GEMINI_API_KEY_3=your_third_key_here
   # ... up to NEXT_PUBLIC_GEMINI_API_KEY_10
   ```

   **Benefits of Multiple API Keys:**
   - **Higher Throughput**: Distribute requests across multiple keys
   - **Rate Limit Protection**: Avoid hitting individual key limits
   - **Redundancy**: Automatic failover if one key fails
   - **Better Performance**: Process up to 10 resumes faster and more reliably

   **File Upload Limits:**
   - HR Dashboard supports maximum **10 resumes per analysis**
   - This ensures optimal performance and prevents system overload
   - For larger batches, process in multiple sessions

   **AI Model Selection:**
   The system uses **Gemini 2.5 Flash** for optimal balance of:
   - **Quality**: Better analysis accuracy than 2.0 models
   - **Speed**: 10 RPM with 250K TPM for efficient bulk processing
   - **Reliability**: Stable performance for large resume batches

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **AI**: Google Gemini AI
- **Authentication**: Firebase Auth

## Project Structure

```
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
├── lib/                 # Utility functions and configurations
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
