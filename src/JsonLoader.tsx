import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define types for our data
interface Accessory {
  accessory_id: number;
  name: string;
}

interface Armor {
  armor_id: number;
  name: string;
}

interface Weapon {
  weapon_id: number;
  name: string;
}

interface Spell {
  spell_id: number;
  name: string;
}

interface Summon {
  summon_id: number;
  name: string;
}

interface Effect {
  Description: string;
  Main_Stat: string;
  Name: string;
  Stack_Duration: number;
  Stack_Intensity: number;
}

interface RawClass {
  archetype: string;
  class_id: number;
  combo: string;
  defense: string;
  finisher: string;
  key_effects: string;
  opener: string;
  passive: string;
  primary_stat: string;
  role: string;
  secondary_stat: string;
  subversion: string;
}

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

interface StatData {
  Benefit: string;
  Stat: string;
  Tier_0: number;
  Tier_1: number;
  Tier_2: number;
  Tier_3: number;
  Tier_4: number;
  Tier_5: number;
  Use: string;
}

interface GameData {
  accessories: Accessory[];
  armors: Armor[];
  weapons: Weapon[];
  spells: Spell[];
  summons: Summon[];
  effects: Effect[];
  classes: ParsedClass[];
  statData: StatData[];
  loading: boolean;
  error: string | null;
}

// Create context with default values
const GameDataContext = createContext<GameData>({
  accessories: [],
  armors: [],
  weapons: [],
  spells: [],
  summons: [],
  effects: [],
  classes: [],
  statData: [],
  loading: true,
  error: null
});

// Custom hook to use the game data
export const useGameData = () => useContext(GameDataContext);

interface GameDataProviderProps {
  children: ReactNode;
}

// Helper function to parse a class ability string
const parseClassAbility = (abilityString: string): ClassAbility => {
  const triggerPatterns = [
    "On Success",
    "On Fail",
    "On Crit Success",
    "On Critical Fail",
    "Gain or Apply"
  ];
  
  let trigger = "";
  for (const pattern of triggerPatterns) {
    if (abilityString.includes(pattern)) {
      trigger = pattern;
      break;
    }
  }
  
  // If no specific trigger was found, use the default
  if (!trigger) {
    trigger = "Gain or Apply";
  }
  
  // Extract the effect and value
  const effectWithValue = trigger === "Gain or Apply" 
    ? abilityString 
    : abilityString.replace(trigger, "").trim();
    
  const parts = effectWithValue.split(/\s+/);
  const value = parseInt(parts[parts.length - 1]) || 0;
  const effect = parts.slice(0, -1).join(" ").trim();
  
  return {
    trigger,
    effect,
    value
  };
};

// Process raw class data to parsed class data
const processClassData = (rawClass: RawClass): ParsedClass => {
  return {
    ...rawClass,
    key_effects: rawClass.key_effects.trim().split(/\s*\/\s*/),
    role: rawClass.role.trim().split(/\s*\/\s*/),
    combo: parseClassAbility(rawClass.combo),
    defense: parseClassAbility(rawClass.defense),
    finisher: parseClassAbility(rawClass.finisher),
    opener: parseClassAbility(rawClass.opener)
  };
};

export const GameDataProvider: React.FC<GameDataProviderProps> = ({ children }) => {
  const [data, setData] = useState<GameData>({
    accessories: [],
    armors: [],
    weapons: [],
    spells: [],
    summons: [],
    effects: [],
    classes: [],
    statData: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadGameData = async () => {
      try {
        // Load all JSON files using fetch
        const accessoriesData = await loadJsonData<Accessory[]>('Accessories.json');
        const armorsData = await loadJsonData<Armor[]>('Armor.json');
        const weaponsData = await loadJsonData<Weapon[]>('Weapons.json');
        const spellsData = await loadJsonData<Spell[]>('Spells.json');
        const summonsData = await loadJsonData<Summon[]>('Summons.json');
        const effectsData = await loadJsonData<Effect[]>('Effects.json');
        const classesRawData = await loadJsonData<RawClass[]>('Classes.json');
        const statData = await loadJsonData<StatData[]>('PlayerStats.json');
        
        // Process class data
        const processedClasses = classesRawData.map(processClassData);
        
        setData({
          accessories: accessoriesData,
          armors: armorsData,
          weapons: weaponsData,
          spells: spellsData,
          summons: summonsData,
          effects: effectsData,
          classes: processedClasses,
          statData: statData,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading game data:', error);
        setData(prevData => ({
          ...prevData,
          loading: false,
          error: 'Failed to load game data. Please try again.'
        }));
      }
    };

    loadGameData();
  }, []);

  // Function to load JSON data using fetch
  async function loadJsonData<T>(filename: string): Promise<T> {
    try {
      // For deployed apps, load from the public directory
      const response = await fetch(`${process.env.PUBLIC_URL}/data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }
      return await response.json() as T;
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      throw error;
    }
  }

  return (
    <GameDataContext.Provider value={data}>
      {children}
    </GameDataContext.Provider>
  );
};

// Loader component that shows while data is loading
export const GameDataLoader: React.FC<GameDataProviderProps> = ({ children }) => {
  const { loading, error } = useGameData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading game data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p>{error}</p>
          <button 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
