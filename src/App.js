import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactConfetti from 'react-confetti';
import './App.css';

const FIBONACCI_SCORES = [1, 2, 3, 5, 8, 13];

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

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (newFeature.trim()) {
      // Show confetti immediately
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      const newFeatureObj = {
        id: Date.now().toString(),
        name: newFeature.trim(),
        position: 0,
        // Don't set an initial score, let assignFibonacciScores handle it
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
    if (items.length === 1) return [{ ...items[0], score: 13 }];

    // Sort items by position
    const sortedItems = [...items].sort((a, b) => a.position - b.position);

    // First item gets 13, last item gets 1, middle items get 2 if no score is set
    return sortedItems.map((item, index) => {
      if (index === 0) return { ...item, score: 13 };
      if (index === sortedItems.length - 1) return { ...item, score: 1 };
      return { ...item, score: item.score ?? 2 }; // Use nullish coalescing to set default to 2
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Only allow dragging within the same column
    if (source.droppableId !== destination.droppableId) {
      return;
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
    setRankings((prev) => {
      const newRankings = { ...prev };
      const column = [...newRankings[columnId]];
      const itemIndex = column.findIndex((item) => item.id === itemId);

      if (itemIndex !== -1) {
        column[itemIndex] = { ...column[itemIndex], score: newScore };
        newRankings[columnId] = column;
      }

      return newRankings;
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
  };

  const showFormulaModal = (feature) => {
    setSelectedFeature(feature);
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

  const renderRankingColumn = (title, droppableId) => {
    const items = assignFibonacciScores(rankings[droppableId]);
    return (
      <div className="ranking-column">
        <h3>{title}</h3>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="droppable-area"
            >
              {items.map((item, index) => (
                <Draggable
                  key={`${droppableId}-${item.id}`}
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
                        {index === 0 || index === items.length - 1 ? (
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
      {renderFormulaModal()}
    </div>
  );
}

export default App;
