# WSJF Calculator

A web application for calculating Weighted Shortest Job First (WSJF) prioritization for features and user stories. WSJF is a prioritization model used in Agile and SAFe methodologies that helps teams prioritize work based on the Cost of Delay and job size.

## Features

- Add multiple features with their respective parameters
- Calculate WSJF scores automatically
- View prioritized features in a clear table format
- Modern, responsive user interface
- Real-time calculations

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd wsjf-calculator
```

2. Install dependencies:

```bash
npm run install-all
```

## Running the Application

1. Start both the frontend and backend servers:

```bash
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

1. Add features by clicking the "Add Feature" button
2. For each feature, enter:
   - Feature name
   - Business Value (1-10)
   - Time Criticality (1-10)
   - Risk Reduction (1-10)
   - Job Size (1-10)
3. Click "Calculate WSJF" to see the prioritized list
4. Features are automatically sorted by their WSJF score

## WSJF Calculation

WSJF is calculated using the formula:

```
WSJF = (Business Value + Time Criticality + Risk Reduction) / Job Size
```

Where:

- Business Value: The value the feature brings to the business
- Time Criticality: How time-sensitive the feature is
- Risk Reduction: How much risk is reduced by implementing this feature
- Job Size: The relative size of the work (larger numbers = larger size)

## Technologies Used

- Frontend: React.js
- Backend: Node.js, Express
- Styling: CSS3
