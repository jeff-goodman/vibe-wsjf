# WSJF Calculator

A simple, interactive Weighted Shortest Job First (WSJF) calculator built with React. This tool helps teams prioritize work by calculating WSJF scores based on business value, time criticality, risk reduction, and job size.

## Features

- Drag and drop interface for ranking features
- Automatic Fibonacci scoring (1, 2, 3, 5, 8, 13)
- Real-time WSJF calculation
- Visual formula breakdown for each feature
- Fun confetti animation when adding new features

## Live Demo

Try it out at: [https://vibe-wsjf.vercel.app](https://vibe-wsjf.vercel.app)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/vibe-wsjf.git
   cd vibe-wsjf
   ```

2. Install dependencies:

   ```bash
   cd client
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The app will open in your browser at [http://localhost:3000](http://localhost:3000).

## How to Use

1. Enter a feature name and press Enter to add it
2. Drag features up and down in each column to rank them
3. Use the dropdown for middle items to select their score (2, 3, 5, or 8)
4. View the WSJF calculation table at the bottom
5. Click the calculator icon (🧮) to see the formula breakdown for any feature

## Deployment

This app is deployed on Vercel:

- Automatic deployments from the main branch
- HTTPS enabled
- Global CDN for fast loading

## Technologies Used

- React
- React Beautiful DnD for drag and drop
- React Confetti for animations
- Vercel for hosting

## License

This project is licensed under the MIT License.
