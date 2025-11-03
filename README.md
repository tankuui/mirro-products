# Product Image Modifier

AI-powered tool for modifying product images by changing backgrounds while preserving product appearance.

## Features

- 🖼️ Extract product images from Ozon URLs
- 🎨 AI-powered background modification
- 🔄 Adjustable modification levels (10-100)
- 🏷️ Custom logo text overlay
- 📊 Image similarity comparison
- 💾 Store modification jobs in Supabase

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **UI**: React + Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter API (GPT-4o + Gemini 2.5 Flash)
- **Language**: TypeScript

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key
```

#### Get Supabase Credentials:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to Settings → API
4. Copy the Project URL and anon/public key

#### Get OpenRouter API Key:
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up/login
3. Go to Keys section
4. Create a new API key

### 4. Database Setup

The database migration is already created. Apply it using Supabase CLI or dashboard:

```bash
# If using Supabase CLI
supabase db push
```

Or manually run the SQL from `supabase/migrations/20251023085349_create_image_modification_jobs.sql` in your Supabase SQL editor.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
npm run build
npm run start
```

## How to Use

1. **Enter Ozon Product URL**: Paste an Ozon.ru product URL (e.g., `https://www.ozon.ru/product/...`)
2. **Adjust Modification Level**: Use slider (10-100) to control background changes
3. **Add Logo (Optional)**: Enter custom text to overlay on images
4. **Click "Извлечь и изменить изображения"**: Process starts
5. **View Results**: See original and modified images with similarity scores

## Project Structure

```
project/
├── app/
│   ├── page.tsx           # Main UI component
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/
│   ├── image-scraper.ts   # Ozon image extraction
│   ├── image-modifier.ts  # AI image modification
│   ├── similarity-detector.ts  # Image comparison
│   ├── openrouter-client.ts   # API client
│   └── demo-data.ts       # Demo images
├── components/ui/         # shadcn/ui components
├── supabase/
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge functions
└── .env.example          # Environment template
```

## Key Components

### Image Scraper (`lib/image-scraper.ts`)
- Extracts product images from Ozon URLs
- Handles pagination and multiple images
- Returns high-quality image URLs

### Image Modifier (`lib/image-modifier.ts`)
- Step 1: Analyzes product with GPT-4o
- Step 2: Converts image to base64 (bypasses CORS)
- Step 3: Generates modified image with Gemini 2.5 Flash
- Preserves product appearance, changes background

### Similarity Detector (`lib/similarity-detector.ts`)
- Compares original and modified images
- Returns similarity percentage (0-100)

## API Models Used

- **GPT-4o** (`openai/gpt-4o`): Product analysis and description
- **Gemini 2.5 Flash** (`google/gemini-2.5-flash-preview-image`): Image generation

## Troubleshooting

### "Failed to extract image(s)" Error
- Fixed by converting images to base64 before sending to API
- Handles CORS and authentication issues

### Images Not Loading
- Check if Ozon URLs are valid
- Verify OpenRouter API key is correct
- Check browser console for detailed errors

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check if migration has been applied
- Ensure RLS policies are enabled

## License

MIT

## Contributing

Your friend can:
1. Clone this repository
2. Create a new branch for features
3. Make changes and test
4. Submit pull requests

## Support

For issues or questions, check the browser console logs for detailed error messages.
