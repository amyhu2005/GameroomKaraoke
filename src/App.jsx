import React from 'react';
import Tracker from './components/Tracker.jsx';
import './index.css';

function App() {
  const karaokeRooms = [
    { id: 'pearl', name: 'Pearl', status: 'open', remaining: 0 },
    { id: 'onyx', name: 'Onyx', status: 'open', remaining: 0 },
    { id: 'gold', name: 'Gold', status: 'open', remaining: 0 },
  ];

  const bowlingLanes = [
    { id: 'lane1', name: 'Lane 1', status: 'open', remaining: 0 },
    { id: 'lane2', name: 'Lane 2', status: 'open', remaining: 0 },
  ];

  return (
    <div className="app-main">
      <Tracker 
        title="Karaoke" 
        initialItems={karaokeRooms} 
        sessionDuration={1800} // 30 mins
      />
      
      <div className="section-divider"></div>

      <Tracker 
        title="Bowling" 
        initialItems={bowlingLanes} 
        sessionDuration={3600} // 1 hour
      />
    </div>
  );
}

export default App;
