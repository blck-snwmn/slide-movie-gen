# Slide Movie Gen

Automatically generate slide presentation videos from a Markdown file.

## Setup

1. Install dependencies
   ```bash
   pnpm install
   ```
2. Start VOICEVOX ENGINE
   ```bash
   docker-compose up -d
   ```

## Usage

1. Edit `manuscript/slides.md`.
   - Write slides using Marp syntax.
   - Write speech scripts using HTML comments `<!-- voice: ... -->`.

   **Example:**
   ```markdown
   ---
   marp: true
   ---
   
   # Title
   
   <!-- voice: Write the script you want Zundamon to speak here -->
   
   - Bullet point
   ```

2. Generate the video.
   ```bash
   pnpm build:movie
   ```

3. The video will be output to `out/video.mp4`.