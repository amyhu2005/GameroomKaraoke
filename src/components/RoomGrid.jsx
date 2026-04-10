import React from 'react';

// Room data shape: { id: string, name: string, status: 'open'|'occupied'|'broken', remaining: number }

export default function RoomGrid({ rooms, onToggle, onToggleBroken }) {
  // Helper to format seconds as mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="room-grid container">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`card room ${room.status}`}
          onClick={() => onToggle(room.id)}
        >
          <h2>{room.name}</h2>
          <div className="room-status">
            {room.status === 'open'
              ? 'Open'
              : room.status === 'occupied'
              ? 'Occupied'
              : 'Broken'}
          </div>
          <div className="timer">
            {room.status === 'occupied' ? formatTime(room.remaining) : ''}
          </div>
          {/* Construction icon for broken toggle */}
          <button
            className="construction-icon"
            onClick={(e) => {
              e.stopPropagation(); // prevent room toggle
              onToggleBroken(room.id);
            }}
            title={room.status === 'broken' ? 'Mark as repaired' : 'Mark as broken'}
          >
            {room.status === 'broken' ? '🛠️' : '🚧'}
          </button>
        </div>
      ))}
    </div>
  );
}
