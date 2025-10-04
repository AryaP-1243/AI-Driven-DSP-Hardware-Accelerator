
import React, { useState } from 'react';

interface CustomCoefficientsPanelProps {
  onApply: (coefficients: number[]) => void;
}

const CustomCoefficientsPanel: React.FC<CustomCoefficientsPanelProps> = ({ onApply }) => {
  const [coeffs, setCoeffs] = useState('0.1, 0.2, 0.4, 0.2, 0.1');
  const [error, setError] = useState('');

  const handleApply = () => {
    setError('');
    const parsedCoeffs = coeffs
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '')
      .map(Number);

    if (parsedCoeffs.some(isNaN)) {
      setError('Invalid input. Please enter comma-separated numbers.');
      return;
    }
    
    if (parsedCoeffs.length === 0) {
      setError('Please enter at least one coefficient.');
      return;
    }

    onApply(parsedCoeffs);
  };

  return (
    <div className="bg-bg-panel p-6 rounded-lg shadow-xl border border-border-main flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-text-main">Custom Filter Coefficients</h3>
        <p className="text-sm text-text-secondary mb-4">
          Enter your own coefficients (comma-separated) to compare against the AI's results.
        </p>
        <textarea
          value={coeffs}
          onChange={(e) => setCoeffs(e.target.value)}
          className="w-full h-24 p-3 bg-bg-main border border-border-main rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-text-main resize-none font-mono"
          placeholder="e.g., 0.05, 0.1, 0.2, 0.1, 0.05"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
      <button
        onClick={handleApply}
        className="w-full mt-4 py-3 px-4 bg-secondary-accent hover:bg-secondary-accent-hover text-white font-bold rounded-lg shadow-md transition-all duration-200"
      >
        Apply Custom Filter
      </button>
    </div>
  );
};

export default CustomCoefficientsPanel;