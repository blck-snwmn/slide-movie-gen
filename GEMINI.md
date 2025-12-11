# Project Context: Slide Movie Generator

## Overview
This project, `slide-movie-gen`, is an automated tool for generating slide presentation videos. It takes a Markdown file as input and produces an MP4 video file.

The core workflow involves:
1.  **Slide Generation:** Converting Markdown slides into images using **Marp**.
2.  **Voice Synthesis:** Extracting speech scripts from the Markdown (via HTML comments) and generating audio using **VOICEVOX**.
3.  **Video Composition:** Combining the slide images and generated audio into a cohesive video using **Remotion**.

## Architecture & Key Components

### 1. Asset Preparation (`scripts/build_assets.js`)
This Node.js script is responsible for pre-processing the input content.
*   **Input:** `manuscript/slides.md`
*   **Processing:**
    *   Uses `@marp-team/marp-cli` to convert slides into PNG images (`public/slides/`).
    *   Parses the Markdown using `markdown-it` to find `<!-- voice: ... -->` comments.
    *   Sends the extracted text to a local **VOICEVOX** instance (running in Docker) to generate `.wav` files (`public/voices/`).
    *   Calculates the duration of each audio clip.
*   **Output:** Generates `public/assets.json`, a metadata file linking each slide image to its corresponding audio file and duration.

### 2. Video Composition (`src/Composition.tsx`)
This is a **Remotion** component written in React.
*   **Logic:** It imports the generated `public/assets.json`.
*   **Rendering:** It uses `<Series>` to sequence the slides.
*   **Timing:** The duration of each slide is dynamically calculated based on the length of the generated audio plus a configurable buffer (padding).
*   **Visuals:** Displays the slide image using `<Img>`.
*   **Audio:** Plays the generated voice using `<Html5Audio>`.

### 3. Infrastructure
*   **VOICEVOX:** Runs as a Docker container (`docker-compose.yml`), providing an HTTP API for text-to-speech synthesis.

## Development Workflow

### Prerequisites
*   Node.js & pnpm
*   Docker (for VOICEVOX)

### Setup
1.  Install dependencies:
    ```bash
    pnpm install
    ```
2.  Start the VOICEVOX engine:
    ```bash
    docker-compose up -d
    ```

### Editing Content
*   Modify **`manuscript/slides.md`**.
*   **Slides:** Use standard Marp syntax (markdown with `---` separators).
*   **Voice:** Add a script for each slide using an HTML comment:
    ```markdown
    <!-- voice: This text will be spoken by the avatar. -->
    ```
    *Note: One voice comment per slide is expected.*

### Building & Running
*   **Preview Video:**
    ```bash
    pnpm start
    ```
    This opens the Remotion previewer. Note that you may need to run `pnpm build:assets` first if `assets.json` is missing or outdated.

*   **Generate Full Video:**
    ```bash
    pnpm build:movie
    ```
    This runs the asset build script and then renders the final MP4 to `out/video.mp4`.

*   **Regenerate Assets Only:**
    ```bash
    pnpm build:assets
    ```
    Useful if you only changed the text/slides and want to update the preview without rendering the full video.

## Project Structure
*   `manuscript/`: Contains the source Markdown file (`slides.md`).
*   `public/`: Generated assets (images, audio, JSON metadata). **Do not edit manually.**
*   `scripts/`: logic for asset generation.
*   `src/`: Remotion source code (video composition logic).
*   `out/`: Destination for the rendered video file.
