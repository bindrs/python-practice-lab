# Python Visualizer

An interactive Python code visualizer with live execution paths, flowchart generation, memory variable boxes, active concept animation theater, trace tables, turtle graphics, and a step-by-step debugger.

## Deploying to Vercel

This project is fully configured and ready for 1-click deployment on [Vercel](https://vercel.com).

### Option 1: Deploy via Vercel Web Dashboard (Recommended)

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com/new).
3. Import your repository.
4. Vercel will automatically detect the settings from `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **Deploy**.

### Option 2: Deploy using Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Run deployment:
   ```bash
   vercel
   ```
3. Deploy to production:
   ```bash
   vercel --prod
   ```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
