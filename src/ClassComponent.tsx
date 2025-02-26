import React, { useState, useEffect } from 'react';
import { useGameData } from './DataLoader';
import { AbilityDisplay } from './EffectsComponent';

interface ClassAbility {
  trigger: string;
  effect: string;
  value: number;
}

interface ParsedClass {
  archetype: string;
  class_id: number;
  combo: ClassAbility;
  defense: ClassAbility;
  finisher: ClassAbility;
  key_effects: string[];
  opener: ClassAbility;
  passive: string;
  primary_stat: string;
  role: string[];
  secondary_stat: string;
  subversion: string;
}

interface ClassSelectorProps {
  selectedArchetype: string;
  selectedSubversion: string;
  archetypeLevel: number;
  subversionLevel: number;
  onArchetypeChange: (archetype: string) => void;
  onSubversionChange: (subversion: string) => void;
  onArchetypeLevelChange: (level: number) => void;
  onSubversionLevelChange: (level: number) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  selectedArchetype,
  selectedSubversion,
  archetypeLevel,
  subversionLevel,
  onArchetypeChange,
  onSubversionChange,
  onArchetypeLevelChange,
  onSubversionLevelChange
}) => {
  const { classes, loading } = useGameData();
  const [filteredSubversions, setFilteredSubversions] = useState<string[]>([]);
  
  // Get unique archetypes
  const archetypes = [...new Set(classes.map(c => c.archetype))];
  
  // Update subversions when archetype changes
  useEffect(() => {
    if (selectedArchetype) {
      const subs = classes
        .filter(c => c.archetype === selectedArchetype && c.subversion !== "None")
        .map(c => c.subversion);
      setFilteredSubversions([...new Set(subs)]);
    } else {
      setFilteredSubversions([]);
    }
  }, [selectedArchetype, classes]);
  
  if (loading) {
    return <div className="p-4">Loading class data...</div>;
  }
  
  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Class Selection</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archetype
          </label>
          <select
            value={selectedArchetype}
            onChange={(e) => onArchetypeChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Archetype</option>
            {archetypes.map(archetype => (
              <option key={archetype} value={archetype}>
                {archetype}
              </option>
            ))}
          </select>
          
          {selectedArchetype && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Archetype Level
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => onArchetypeLevelChange(level)}
                    className={`w-10 h-10 rounded-full ${
                      archetypeLevel === level 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Level 1: Passive | Level 2: +Defense | Level 3: +Opener | Level 4: +Combo | Level 5: +Finisher
              </p>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subversion
          </label>
          <select
            value={selectedSubversion}
            onChange={(e) => onSubversionChange(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={!selectedArchetype}
          >
            <option value="">Select Subversion</option>
            {filteredSubversions.map(subversion => (
              <option key={subversion} value={subversion}>
                {subversion}
              </option>
            ))}
          </select>
          
          {selectedSubversion && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subversion Level
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => onSubversionLevelChange(level)}
                    className={`w-10 h-10 rounded-full ${
                      subversionLevel === level 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Level 1: Passive | Level 2: +Defense | Level 3: +Opener | Level 4: +Combo | Level 5: +Finisher
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ClassDetailsProps {
  selectedArchetype: string;
  selectedSubversion: string;
  archetypeLevel: number;
  subversionLevel: number;
}

export const ClassDetails: React.FC<ClassDetailsProps> = ({
  selectedArchetype,
  selectedSubversion,
  archetypeLevel,
  subversionLevel
}) => {
  const { classes, loading } = useGameData();
  const [selectedClass, setSelectedClass] = useState<ParsedClass | null>(null);
  
  // Update selected class when archetype or subversion changes
  useEffect(() => {
    if (selectedArchetype && classes.length > 0) {
      let targetClass;
      
      if (selectedSubversion) {
        // Look for the specific subversion
        targetClass = classes.find(c => 
          c.archetype === selectedArchetype && 
          c.subversion === selectedSubversion
        );
      }
      
      if (!targetClass) {
        // Look for the base archetype
        targetClass = classes.find(c => 
          c.archetype === selectedArchetype && 
          (c.subversion === "None" || c.subversion === "")
        );
      }
      
      setSelectedClass(targetClass || null);
    } else {
      setSelectedClass(null);
    }
  }, [selectedArchetype, selectedSubversion, classes]);
  
  if (loading) {
    return <div className="p-4">Loading class details...</div>;
  }
  
  if (!selectedClass) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Class Details</h2>
        <div className="text-center text-gray-500 p-4">
          Select an archetype to view class details
        </div>
      </div>
    );
  }
  
  // The effective level is the subversion level if there's a subversion selected,
  // otherwise it's the archetype level
  const effectiveLevel = selectedSubversion ? subversionLevel : archetypeLevel;
  
  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-bold mb-4 text-center">
        {selectedClass.archetype}
        {selectedClass.subversion !== "None" && ` - ${selectedClass.subversion}`}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <span className="font-semibold">Role:</span> {selectedClass.role.join('/')}
          </div>
          
          <div className="mb-4">
            <span className="font-semibold">Key Effects:</span> {selectedClass.key_effects.join('/')}
          </div>
          
          <div className="mb-4">
            <span className="font-semibold">Primary Stat:</span> {selectedClass.primary_stat}
            {selectedClass.secondary_stat && selectedClass.secondary_stat !== "NONE" && (
              <span>, <span className="font-semibold">Secondary:</span> {selectedClass.secondary_stat}</span>
            )}
          </div>
          
          <div className="p-3 border-l-4 border-purple-300 rounded mb-4 bg-white">
            <div className="font-bold">Passive:</div>
            <div className="mt-1">{selectedClass.passive}</div>
          </div>
          
          <AbilityDisplay
            abilityType="Defense"
            trigger={selectedClass.defense.trigger}
            effect={selectedClass.defense.effect}
            value={selectedClass.defense.value}
            active={effectiveLevel >= 2}
          />
        </div>
        
        <div>
          <AbilityDisplay
            abilityType="Opener"
            trigger={selectedClass.opener.trigger}
            effect={selectedClass.opener.effect}
            value={selectedClass.opener.value}
            active={effectiveLevel >= 3}
          />
          
          <AbilityDisplay
            abilityType="Combo"
            trigger={selectedClass.combo.trigger}
            effect={selectedClass.combo.effect}
            value={selectedClass.combo.value}
            active={effectiveLevel >= 4}
          />
          
          <AbilityDisplay
            abilityType="Finisher"
            trigger={selectedClass.finisher.trigger}
            effect={selectedClass.finisher.effect}
            value={selectedClass.finisher.value}
            active={effectiveLevel >= 5}
          />
        </div>
      </div>
    </div>
  );
};
