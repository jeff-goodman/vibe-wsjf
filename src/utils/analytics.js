import ReactGA from 'react-ga4';

// Initialize GA4
export const initGA = (measurementId) => {
  ReactGA.initialize(measurementId);
};

// Track page views
export const trackPageView = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track custom events
export const trackEvent = (category, action, label) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  });
};

// Track feature interactions
export const trackFeatureInteraction = (action, featureName, details = {}) => {
  ReactGA.event({
    category: 'Feature',
    action: action,
    label: featureName,
    ...details,
  });
};
