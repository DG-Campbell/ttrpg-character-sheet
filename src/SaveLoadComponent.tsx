import React, { useState, useEffect } from 'react';

interface CharacterStat {
  tier: number;
  level: number;
  equipment: string;
}

interface CharacterData {
  name: string;
  archetype: string;
  archetypeLevel: number;
  subversion: string;
  subversionLevel: number;
  stats: {
    str: CharacterStat;
    dex: CharacterStat;
    con: CharacterStat;
    com: CharacterStat;
    wis: CharacterStat;
    wil: CharacterStat;
    cha: CharacterStat;
    ins: CharacterStat;
  };
  equipment: {
    weapon: string;
    armor: string;
    accessory: string;
  };
  notes: string;
  spells: string[];
  summons: string[];
  savedAt: number; // timestamp
}

interface SaveLoadProps {
  currentCharacter: CharacterData;
  onLoadCharacter: (character: CharacterData) => void;
  onNewCharacter: () => void;
}

export const CharacterSaveLoad: React.FC<SaveLoadProps> = ({
  currentCharacter,
  onLoadCharacter,
  onNewCharacter
}) => {
  const [savedCharacters, setSavedCharacters] = useState<CharacterData[]>([]);
  const [showModal, setShowModal] = useState<'save' | 'load' | null>(null);
  const [saveName, setSaveName] = useState('');
  
  // Load saved characters from localStorage on mount
  useEffect(() => {
    const loadSavedCharacters = () => {
      try {
        const savedData = localStorage.getItem('ttrpgCharacters');
        if (savedData) {
          setSavedCharacters(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Error loading saved characters:', error);
        // If there's an error (e.g., corrupted data), reset saved characters
        setSavedCharacters([]);
      }
    };
    
    loadSavedCharacters();
  }, []);
  
  // Save the current character
  const saveCharacter = () => {
    if (!currentCharacter.name && !saveName) {
      alert('Please enter a name for your character.');
      return;
    }
    
    const charToSave: CharacterData = {
      ...currentCharacter,
      name: saveName || currentCharacter.name,
      savedAt: Date.now()
    };
    
    // Check if we're updating an existing character
    const existingIndex = savedCharacters.findIndex(
      char => char.name === charToSave.name
    );
    
    let newSavedCharacters;
    if (existingIndex >= 0) {
      // Update existing
      newSavedCharacters = [...savedCharacters];
      newSavedCharacters[existingIndex] = charToSave;
    } else {
      // Add new
      newSavedCharacters = [...savedCharacters, charToSave];
    }
    
    // Save to localStorage
    localStorage.setItem('ttrpgCharacters', JSON.stringify(newSavedCharacters));
    setSavedCharacters(newSavedCharacters);
    setSaveName('');
    setShowModal(null);
  };
  
  // Load a saved character
  const loadCharacter = (character: CharacterData) => {
    onLoadCharacter(character);
    setShowModal(null);
  };
  
  // Delete a character
  const deleteCharacter = (name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const newSavedCharacters = savedCharacters.filter(
        char => char.name !== name
      );
      localStorage.setItem('ttrpgCharacters', JSON.stringify(newSavedCharacters));
      setSavedCharacters(newSavedCharacters);
    }
  };
  
  // Export character to JSON file
  const exportCharacter = (character: CharacterData) => {
    const dataStr = JSON.stringify(character, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name.replace(/\s+/g, '_')}_character.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Import character from JSON file
  const importCharacter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedChar = JSON.parse(content) as CharacterData;
        // Validate the data has required fields
        if (!importedChar.name || !importedChar.stats) {
          throw new Error('Invalid character data');
        }
        loadCharacter(importedChar);
      } catch (error) {
        alert('Error importing character: Invalid or corrupted file');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };
  
  // Render the Save modal
  const renderSaveModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Save Character</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Character Name
          </label>
          <input
            type="text"
            value={saveName || currentCharacter.name}
            onChange={(e) => setSaveName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter character name"
          />
        </div>
        
        {savedCharacters.some(char => 
          char.name === (saveName || currentCharacter.name)) && (
          <div className="mb-4 text-yellow-600 bg-yellow-50 p-2 rounded">
            Warning: A character with this name already exists and will be overwritten.
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowModal(null)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={saveCharacter}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
  
  // Render the Load modal
  const renderLoadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Load Character</h2>
        
        {savedCharacters.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            <p>No saved characters found.</p>
            <p className="mt-2">Create a character and save it to see it here.</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Class</th>
                  <th className="p-2 text-left">Last Saved</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedCharacters
                  .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
                  .map((character, index) => (
                    <tr 
                      key={index} 
                      className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="p-2">{character.name}</td>
                      <td className="p-2">
                        {character.archetype}
                        {character.subversion && ` - ${character.subversion}`}
                      </td>
                      <td className="p-2">
                        {character.savedAt 
                          ? new Date(character.savedAt).toLocaleDateString() 
                          : 'Unknown'}
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => loadCharacter(character)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteCharacter(character.name)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => exportCharacter(character)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6 border-t pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div>
              <label className="inline-block px-4 py-2 bg-purple-600 text-white rounded cursor-pointer hover:bg-purple-700">
                Import Character
                <input
                  type="file"
                  accept=".json"
                  onChange={importCharacter}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <button
                onClick={onNewCharacter}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                New Character
              </button>
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div>
      <div className="flex space-x-2">
        <button
          onClick={() => setShowModal('save')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Character
        </button>
        <button
          onClick={() => setShowModal('load')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Load Character
        </button>
      </div>
      
      {showModal === 'save' && renderSaveModal()}
      {showModal === 'load' && renderLoadModal()}
    </div>
  );
};

export default CharacterSaveLoad;
