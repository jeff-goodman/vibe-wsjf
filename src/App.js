import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactConfetti from 'react-confetti';
import {
  initGA,
  trackPageView,
  trackFeatureInteraction,
} from './utils/analytics';
import './App.css';

const FIBONACCI_SCORES = [1, 2, 3, 5, 8, 13];

// Initialize GA4 with your Measurement ID
const GA_MEASUREMENT_ID = 'G-E8KBGMD17K'; // Your actual Measurement ID

function App() {
  const [newFeature, setNewFeature] = useState('');
  const [rankings, setRankings] = useState({
    businessValue: [],
    timeCriticality: [],
    riskReduction: [],
    jobSize: [],
  });
  const [wsjfScores, setWsjfScores] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const inputRef = useRef(null);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverContent, setPopoverContent] = useState('');
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  const columnInfo = {
    businessValue:
      'Business Value represents the economic benefit of the feature. Higher values indicate features that deliver more value to the business.',
    timeCriticality:
      'Time Criticality measures how time-sensitive the feature is. Higher values indicate features that must be delivered soon to maintain value.',
    riskReduction:
      'Risk Reduction/Opportunity Enablement represents how much the feature reduces risk or enables future opportunities. Higher values indicate features that significantly reduce risk or enable important opportunities.',
    jobSize:
      'Job Size represents the relative effort required to implement the feature. Lower values indicate smaller, easier-to-implement features.',
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    calculateWSJF();
  }, [rankings]);

  useEffect(() => {
    // Initialize GA4
    initGA(GA_MEASUREMENT_ID);
    // Track initial page view
    trackPageView(window.location.pathname);
  }, []);

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (newFeature.trim()) {
      // Track feature creation
      trackFeatureInteraction('create', newFeature.trim());

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      const newFeatureObj = {
        id: Date.now().toString(),
        name: newFeature.trim(),
        position: 0,
      };

      setRankings((prev) => ({
        businessValue: [...prev.businessValue, { ...newFeatureObj }],
        timeCriticality: [...prev.timeCriticality, { ...newFeatureObj }],
        riskReduction: [...prev.riskReduction, { ...newFeatureObj }],
        jobSize: [...prev.jobSize, { ...newFeatureObj }],
      }));

      setNewFeature('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const assignFibonacciScores = (items) => {
    if (items.length === 0) return [];
    if (items.length === 1) return [{ ...items[0], score: 1 }];

    // Sort items by position
    const sortedItems = [...items].sort((a, b) => a.position - b.position);

    // Last item gets 1, other items keep their current score or default to 2
    return sortedItems.map((item, index) => {
      if (index === sortedItems.length - 1) return { ...item, score: 1 };
      return { ...item, score: item.score ?? 2 };
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Only allow dragging within the same column
    if (source.droppableId !== destination.droppableId) {
      return;
    }

    // Track feature movement
    const feature = rankings[source.droppableId][source.index];
    if (feature) {
      trackFeatureInteraction('move', feature.name, {
        column: source.droppableId,
        fromPosition: source.index,
        toPosition: destination.index,
      });
    }

    const items = [...rankings[source.droppableId]];
    const [removed] = items.splice(source.index, 1);
    items.splice(destination.index, 0, removed);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    setRankings((prev) => ({
      ...prev,
      [source.droppableId]: updatedItems,
    }));
  };

  const handleScoreChange = (columnId, itemId, newScore) => {
    // Track score change
    const feature = rankings[columnId].find((item) => item.id === itemId);
    if (feature) {
      trackFeatureInteraction('score_change', feature.name, {
        column: columnId,
        newScore: newScore,
      });
    }

    setRankings((prev) => {
      // Create a new rankings object
      const newRankings = { ...prev };

      // Get the current column and create a copy
      const currentColumn = [...newRankings[columnId]];

      // Find and update the item's score
      const itemIndex = currentColumn.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        currentColumn[itemIndex] = {
          ...currentColumn[itemIndex],
          score: newScore,
        };
      }

      // Separate the bottom item
      const bottomItem = currentColumn[currentColumn.length - 1];
      const itemsToSort = currentColumn.slice(0, -1);

      // Sort the items by score (descending)
      itemsToSort.sort((a, b) => b.score - a.score);

      // Combine sorted items with bottom item
      const sortedColumn = [...itemsToSort, bottomItem];

      // Update positions
      const finalColumn = sortedColumn.map((item, index) => ({
        ...item,
        position: index,
      }));

      // Update the rankings state
      newRankings[columnId] = finalColumn;

      // Force a re-render by creating a new object
      return { ...newRankings };
    });
  };

  const calculateWSJF = () => {
    const features = rankings.businessValue;
    const scores = features.map((feature) => {
      // Get the scores using assignFibonacciScores to ensure we have the correct values
      const businessValueItems = assignFibonacciScores(rankings.businessValue);
      const timeCriticalityItems = assignFibonacciScores(
        rankings.timeCriticality
      );
      const riskReductionItems = assignFibonacciScores(rankings.riskReduction);
      const jobSizeItems = assignFibonacciScores(rankings.jobSize);

      // Find the feature in each column's sorted items to get the correct score
      const businessValue = businessValueItems.find(
        (f) => f.id === feature.id
      )?.score;
      const timeCriticality = timeCriticalityItems.find(
        (f) => f.id === feature.id
      )?.score;
      const riskReduction = riskReductionItems.find(
        (f) => f.id === feature.id
      )?.score;
      const jobSize = jobSizeItems.find((f) => f.id === feature.id)?.score;

      // If any score is undefined, use the default values
      const finalBusinessValue = businessValue ?? 1;
      const finalTimeCriticality = timeCriticality ?? 1;
      const finalRiskReduction = riskReduction ?? 1;
      const finalJobSize = jobSize ?? 13;

      const wsjf =
        (finalBusinessValue + finalTimeCriticality + finalRiskReduction) /
        finalJobSize;

      return {
        featureId: feature.id,
        featureName: feature.name,
        businessValue: finalBusinessValue,
        timeCriticality: finalTimeCriticality,
        riskReduction: finalRiskReduction,
        jobSize: finalJobSize,
        wsjfScore: wsjf,
      };
    });

    // Sort by WSJF score (descending)
    scores.sort((a, b) => b.wsjfScore - a.wsjfScore);
    setWsjfScores(scores);

    // Track WSJF calculation
    trackFeatureInteraction('calculate_wsjf', 'all_features', {
      featureCount: scores.length,
      highestScore: scores[0]?.wsjfScore,
      lowestScore: scores[scores.length - 1]?.wsjfScore,
    });
  };

  const showFormulaModal = (feature) => {
    setSelectedFeature(feature);
    // Track formula modal view
    trackFeatureInteraction('view_formula', feature.featureName, {
      businessValue: feature.businessValue,
      timeCriticality: feature.timeCriticality,
      riskReduction: feature.riskReduction,
      jobSize: feature.jobSize,
      wsjfScore: feature.wsjfScore,
    });
  };

  const closeModal = () => {
    setSelectedFeature(null);
  };

  const renderFormulaModal = () => {
    if (!selectedFeature) return null;

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={closeModal}>
            ×
          </button>
          <h3>WSJF Formula for {selectedFeature.featureName}</h3>
          <div className="formula-display">
            <div className="formula-row">
              <span>Business Value</span>
              <span className="operator">+</span>
              <span>Time Criticality</span>
              <span className="operator">+</span>
              <span>Risk Reduction</span>
              <span className="operator">÷</span>
              <span>Job Size</span>
              <span className="operator">=</span>
              <span>WSJF Score</span>
            </div>
            <div className="formula-row values">
              <span>{selectedFeature.businessValue}</span>
              <span className="operator">+</span>
              <span>{selectedFeature.timeCriticality}</span>
              <span className="operator">+</span>
              <span>{selectedFeature.riskReduction}</span>
              <span className="operator">÷</span>
              <span>{selectedFeature.jobSize}</span>
              <span className="operator">=</span>
              <span>{selectedFeature.wsjfScore.toFixed(2)}</span>
            </div>
            <div className="formula-calculation">
              ({selectedFeature.businessValue} +{' '}
              {selectedFeature.timeCriticality} +{' '}
              {selectedFeature.riskReduction}) ÷ {selectedFeature.jobSize} ={' '}
              {selectedFeature.wsjfScore.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleInfoClick = (column, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      top: rect.bottom + 5,
      left: rect.left,
    });
    setPopoverContent(columnInfo[column]);
    setShowPopover(true);
  };

  const handleInfoMouseLeave = () => {
    setShowPopover(false);
  };

  const renderRankingColumn = (title, droppableId) => {
    const items = assignFibonacciScores(rankings[droppableId]);
    return (
      <div className="ranking-column">
        <div className="column-header">
          <h3>{title}</h3>
          <div
            className="info-icon-wrapper"
            onMouseEnter={(e) => handleInfoClick(droppableId, e)}
            onMouseLeave={handleInfoMouseLeave}
          >
            <span className="info-icon">ℹ️</span>
          </div>
        </div>
        {showPopover && (
          <div
            className="popover"
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
            }}
          >
            {popoverContent}
          </div>
        )}
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="droppable-area"
            >
              {items.map((item, index) => (
                <Draggable
                  key={`${droppableId}-${item.id}-${index}`}
                  draggableId={`${droppableId}-${item.id}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="draggable-item"
                    >
                      <div className="item-content">
                        <span className="feature-name">{item.name}</span>
                        {index === items.length - 1 ? (
                          <span className="score-badge">{item.score}</span>
                        ) : (
                          <div className="score-select-wrapper">
                            <select
                              value={item.score}
                              onChange={(e) =>
                                handleScoreChange(
                                  droppableId,
                                  item.id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="score-select"
                            >
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={5}>5</option>
                              <option value={8}>8</option>
                              <option value={13}>13</option>
                            </select>
                            <div className="select-arrow">▼</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  return (
    <div className="App">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <header className="App-header">
        <h1>WSJF Calculator</h1>
      </header>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="container">
          <div className="features-input">
            <form onSubmit={handleAddFeature}>
              <input
                ref={inputRef}
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Enter feature name and press Enter"
                required
                autoFocus
              />
            </form>
          </div>
          <div className="rankings">
            {Object.entries(rankings).map(([key, value]) =>
              renderRankingColumn(
                key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase()),
                key
              )
            )}
          </div>
          <div className="calculate-section">
            {wsjfScores.length > 0 && (
              <div className="results">
                <h3>WSJF Results</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Business Value</th>
                      <th>Time Criticality</th>
                      <th>Risk Reduction</th>
                      <th>Job Size</th>
                      <th>WSJF Score</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {wsjfScores.map((score) => (
                      <tr key={score.featureId}>
                        <td>{score.featureName}</td>
                        <td>{score.businessValue}</td>
                        <td>{score.timeCriticality}</td>
                        <td>{score.riskReduction}</td>
                        <td>{score.jobSize}</td>
                        <td>{score.wsjfScore.toFixed(2)}</td>
                        <td>
                          <button
                            className="calculator-button"
                            onClick={() => showFormulaModal(score)}
                            title="Show formula calculation"
                          >
                            🧮
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>
      <a
        href="https://github.com/jeff-goodman/vibe-wsjf"
        target="_blank"
        rel="noopener noreferrer"
        className="github-link"
        title="View on GitHub"
      >
        <svg
          className="github-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          height="24"
          width="24"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
      {renderFormulaModal()}
    </div>
  );
}

export default App;
