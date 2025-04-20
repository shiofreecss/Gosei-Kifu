import React, { useState, useEffect } from 'react';
import GoBoard from './GoBoard';
import { getHandicapPositions } from '../utils/goRules';

interface HandicapSelectorProps {
  size: number;
  handicap: number;
  onChange: (handicap: number) => void;
}

const HandicapSelector: React.FC<HandicapSelectorProps> = ({ 
  size = 19, 
  handicap = 0, 
  onChange 
}) => {
  const [selectedHandicap, setSelectedHandicap] = useState(handicap);
  const [handicapStones, setHandicapStones] = useState<Array<{x: number, y: number, color: 'black' | 'white'}>>([]);
  
  useEffect(() => {
    if (selectedHandicap >= 2 && selectedHandicap <= 9) {
      const positions = getHandicapPositions(size, selectedHandicap);
      setHandicapStones(positions.map(pos => ({
        ...pos,
        color: 'black' as const
      })));
    } else {
      setHandicapStones([]);
    }
  }, [selectedHandicap, size]);
  
  const handleHandicapChange = (newHandicap: number) => {
    if (newHandicap >= 0 && newHandicap <= 9) {
      setSelectedHandicap(newHandicap);
      onChange(newHandicap);
    }
  };
  
  return (
    <div className="handicap-selector" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      gap: '20px'
    }}>
      <div className="handicap-controls" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <label htmlFor="handicap-select" style={{ fontWeight: 'bold' }}>
          Handicap Stones:
        </label>
        <select 
          id="handicap-select"
          value={selectedHandicap}
          onChange={(e) => handleHandicapChange(parseInt(e.target.value, 10))}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="0">No Handicap</option>
          <option value="2">2 Stones</option>
          <option value="3">3 Stones</option>
          <option value="4">4 Stones</option>
          <option value="5">5 Stones</option>
          <option value="6">6 Stones</option>
          <option value="7">7 Stones</option>
          <option value="8">8 Stones</option>
          <option value="9">9 Stones</option>
        </select>
      </div>
      
      <div className="handicap-preview" style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: 'white'
      }}>
        <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Preview</h4>
        <GoBoard
          size={size}
          stones={handicapStones}
          currentMove={-1}
        />
      </div>
      
      <div className="handicap-description" style={{
        fontSize: '14px',
        color: '#666',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <p>
          Handicap stones are placed at the star points to balance games between players of different strengths.
          Black plays the handicap stones as their first move, and then White plays first.
        </p>
        {selectedHandicap > 0 && (
          <p>
            For {selectedHandicap} stone handicap, White plays first after Black places the handicap stones.
            Typical komi for handicap games is 0.5 points.
          </p>
        )}
      </div>
    </div>
  );
};

export default HandicapSelector; 