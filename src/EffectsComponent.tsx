import React from 'react';
import { useGameData } from './JsonLoader';

interface AbilityDisplayProps {
  abilityType: string;
  trigger: string;
  effect: string;
  value: number;
  active: boolean;
}

export const AbilityDisplay: React.FC<AbilityDisplayProps> = ({
  abilityType,
  trigger,
  effect,
  value,
  active
}) => {
  // Get color for ability type
  const getAbilityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "opener": return "border-blue-300";
      case "combo": return "border-green-300";
      case "defense": return "border-yellow-300";
      case "finisher": return "border-red-300";
      case "passive": return "border-purple-300";
      default: return "border-gray-300";
    }
  };
  
  return (
    <div 
      className={`p-3 border-l-4 rounded mb-2 ${getAbilityTypeColor(abilityType)} ${
        active ? "bg-white" : "bg-gray-100 opacity-60"
      }`}
    >
      <div className="flex justify-between">
        <div className="font-bold">{abilityType}:</div>
        <div className="text-sm text-gray-500">
          {active ? "Active" : "Inactive"}
        </div>
      </div>
      <div className="mt-1">
        {trigger} <span className="font-medium">{effect}</span> {value > 0 && value}
      </div>
    </div>
  );
};

export default AbilityDisplay;
