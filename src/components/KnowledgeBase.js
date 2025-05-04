import React, { useState, useEffect } from 'react';
import './KnowledgeBase.css';

const KnowledgeBase = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFile, setActiveFile] = useState('1.md');

  useEffect(() => {
    const loadContent = async () => {
      try {
        // This is a simple way to import content at runtime
        // For production, you might want to use a more sophisticated approach
        const fileNames = ['1.md', '2.md', 'p6.md', 'p12.md'];
        
        const contentPromises = fileNames.map(async fileName => {
          try {
            const response = await fetch(`/knowledgeBase/${fileName}`);
            if (!response.ok) throw new Error(`Failed to load ${fileName}`);
            const text = await response.text();
            return { id: fileName, content: text };
          } catch (error) {
            console.error(`Error loading ${fileName}:`, error);
            return { id: fileName, content: `Error loading content: ${error.message}` };
          }
        });

        const loadedContent = await Promise.all(contentPromises);
        setContent(loadedContent);
      } catch (error) {
        console.error('Error loading knowledge base:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  return (
    <div className="knowledge-base">
      <h2>Knowledge Base</h2>
      
      {loading ? (
        <p>Loading knowledge base content...</p>
      ) : (
        <div className="knowledge-content">
          <div className="file-menu">
            {content.map(file => (
              <button 
                key={file.id}
                className={activeFile === file.id ? 'active' : ''}
                onClick={() => setActiveFile(file.id)}
              >
                {file.id}
              </button>
            ))}
          </div>
          
          <div className="file-content">
            {content.find(file => file.id === activeFile)?.content ? (
              <div dangerouslySetInnerHTML={{ 
                __html: content.find(file => file.id === activeFile)?.content 
              }} />
            ) : (
              <p>Select a file to view its content</p>
            )}
          </div>

          <div className="kb-section">
            <h3>The Rambam's Multiple Galgalim Model</h3>
            <p>
              According to the Rambam in Hilchot Kiddush HaChodesh, the sun's motion is explained through a system of multiple galgalim (celestial spheres):
            </p>
            <ul>
              <li>
                <strong>Galgal Gadol (גלגל גדול)</strong>: The large circle or deferent. This is the main circle on which the sun appears to travel, but its center is not at Earth (it's eccentric).
              </li>
              <li>
                <strong>Galgal Katan (גלגל קטן)</strong>: The small circle or epicycle. The sun travels on this smaller circle, which itself travels on the deferent.
              </li>
              <li>
                <strong>Galgal Yotze (גלגל יוצא)</strong>: The eccentric circle. This represents the offset of the deferent's center from Earth.
              </li>
            </ul>
            <p>
              This complex system allows the Rambam to account for variations in the sun's apparent speed throughout the year, which is essential for accurate calendar calculations.
            </p>
            <p>
              The calculations involve determining the "maslul" (course) as the angle between the sun's mean position and its apogee, and then applying corrections based on tables of values.
            </p>
          </div>

          <div className="kb-section">
            <h3>The Moon's Four Galgalim System</h3>
            <p>
              The Rambam describes an even more complex system for the Moon, involving four different galgalim (celestial spheres):
            </p>
            <ul>
              <li>
                <strong>Galgal Gadol (גלגל גדול)</strong>: The large circle or main deferent. This is the primary orbital path of the Moon.
              </li>
              <li>
                <strong>Galgal Katan (גלגל קטן)</strong>: The first epicycle. The Moon moves on this smaller circle, which itself travels on the main deferent.
              </li>
              <li>
                <strong>Galgal Noteh (גלגל נוטה)</strong>: The inclined circle or second epicycle. This represents the Moon's deviation from the ecliptic (its north-south motion).
              </li>
              <li>
                <strong>Galgal Yotze Merkaz (גלגל יוצא מרכז)</strong>: The eccentric circle. This represents the offset of the main deferent's center from Earth.
              </li>
            </ul>
            <p>
              This complex system of nested circles explains the observed variations in the Moon's:
            </p>
            <ul>
              <li>Speed (the Moon appears to move faster at some points in its orbit)</li>
              <li>Distance from Earth (changing apparent size)</li>
              <li>Position above or below the ecliptic plane (latitude)</li>
              <li>Monthly cycle of phases</li>
            </ul>
            <p>
              The Rambam uses this model to make precise predictions about when the new moon will be visible, which is essential for determining the beginning of Hebrew months.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase; 