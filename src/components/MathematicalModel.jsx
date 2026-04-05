import React from 'react';
import './MathematicalModel.css';

const MathematicalModel = () => {
  return (
    <div className="mathematical-model">
      <h3>Mathematical Model</h3>
      <p>The Rambam's model uses multiple circles (galgalim) to explain celestial motion:</p>
      <ul>
        <li><strong>Sun Model:</strong> Uses an eccentric circle (Galgal Yotze) and an epicycle (Galgal Katan)</li>
        <li><strong>Moon Model:</strong> Uses four circles - eccentric (Galgal Yotze Merkaz), deferent (Galgal Gadol), and two epicycles (Galgal Katan and Galgal Noteh)</li>
      </ul>
      <p>The model calculates positions by determining the "maslul" (course) and applying corrections based on the elongation between celestial bodies.</p>
    </div>
  );
};

export default MathematicalModel; 