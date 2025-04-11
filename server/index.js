const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Calculate WSJF for a list of features
app.post('/api/calculate-wsjf', (req, res) => {
  try {
    const { features, rankings } = req.body;

    if (!features || !Array.isArray(features) || !rankings) {
      return res
        .status(400)
        .json({ error: 'Invalid input: features and rankings are required' });
    }

    const calculatedFeatures = features.map((feature) => {
      // Get the position (1-based index) of the feature in each ranking
      const businessValue =
        rankings.businessValue.findIndex((f) => f.id === feature.id) + 1;
      const timeCriticality =
        rankings.timeCriticality.findIndex((f) => f.id === feature.id) + 1;
      const riskReduction =
        rankings.riskReduction.findIndex((f) => f.id === feature.id) + 1;
      const jobSize =
        rankings.jobSize.findIndex((f) => f.id === feature.id) + 1;

      // Calculate Cost of Delay (CoD)
      const costOfDelay = businessValue + timeCriticality + riskReduction;

      // Calculate WSJF
      const wsjf = costOfDelay / jobSize;

      return {
        ...feature,
        businessValue,
        timeCriticality,
        riskReduction,
        jobSize,
        costOfDelay,
        wsjf,
      };
    });

    // Sort features by WSJF in descending order
    const sortedFeatures = calculatedFeatures.sort((a, b) => b.wsjf - a.wsjf);

    res.json(sortedFeatures);
  } catch (error) {
    console.error('Error calculating WSJF:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  })
  .on('error', (err) => {
    console.error('Server error:', err);
  });
