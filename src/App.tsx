import React from 'react';
import { GameDataProvider, GameDataLoader } from './JsonLoader';
import CharacterSheetApp from './CharacterSheetApp';

const App: React.FC = () => {
  return (
    <GameDataProvider>
      <GameDataLoader>
        <div className="min-h-screen bg-gray-100 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">TTRPG Character Sheet</h1>
              <div className="flex space-x-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  New Character
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded">
                  Load Character
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <CharacterSheetApp />
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">JSON Data Management</h2>
              <p className="mb-4">The app dynamically loads data from the following JSON files in the <code>/public/data</code> folder:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Accessories.json - Accessory items</li>
                <li>Armor.json - Armor items</li>
                <li>Weapons.json - Weapon items</li>
                <li>Classes.json - Class abilities and attributes</li>
                <li>Effects.json - Game effects and descriptions</li>
                <li>PlayerStats.json - Character stat benefits</li>
                <li>Spells.json - Magic spell definitions</li>
                <li>Summons.json - Summonable entities</li>
              </ul>
              <p>To update game data, simply edit the corresponding JSON files - the app will load the changes automatically on refresh.</p>
            </div>
            
            <div className="mt-8 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} TTRPG Game System
            </div>
          </div>
        </div>
      </GameDataLoader>
    </GameDataProvider>
  );
};

export default App;
