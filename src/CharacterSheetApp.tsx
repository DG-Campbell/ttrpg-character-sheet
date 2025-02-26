import React, { useState, useEffect } from 'react';
import { useGameData } from './JsonLoader';

interface CharacterStat {
  tier: number;
  level: number;
  equipment: string;
}

interface CharacterStats {
  str: CharacterStat;
  dex: CharacterStat;
  con: CharacterStat;
  com: CharacterStat;
  wis: CharacterStat;
  wil: CharacterStat;
  cha: CharacterStat;
  ins: CharacterStat;
}

interface ClassAbility {
  trigger: string;
  effect: string;
  value: number;
}

const CharacterSheetApp: React.FC = () => {
  // Get all data from the GameDataContext
  const { 
    accessories, 
    armors, 
    weapons, 
    spells, 
    summons, 
    effects, 
    classes, 
    statData,
    loading 
  } = useGameData();
  
  // State for character data
  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState('');
  const [archetypeLevel, setArchetypeLevel] = useState(1);
  const [subversion, setSubversion] = useState('');
  const [subversionLevel, setSubversionLevel] = useState(1);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  
  // Define the main stats with their initial tier and level values
  const [stats, setStats] = useState<CharacterStats>({
    str: { tier: 0, level: 0, equipment: '' },
    dex: { tier: 0, level: 0, equipment: '' },
    con: { tier: 0, level: 0, equipment: '' },
    com: { tier: 0, level: 0, equipment: '' },
    wis: { tier: 0, level: 0, equipment: '' },
    wil: { tier: 0, level: 0, equipment: '' },
    cha: { tier: 0, level: 0, equipment: '' },
    ins: { tier: 0, level: 0, equipment: '' }
  });
  
  // Get unique archetypes from classes
  const archetypes = [...new Set(classes.map(c => c.archetype))];
  
  // Get subversions for the selected archetype
  const subversions = archetype 
    ? classes
      .filter(c => c.archetype === archetype && c.subversion !== "None")
      .map(c => c.subversion)
    : [];
    
  // If data is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading character sheet data...</p>
        </div>
      </div>
    );
  }
  
  // Get selected class data
  useEffect(() => {
    if (archetype) {
      let targetClass;
      
      if (subversion) {
        // Look for the specific subversion
        targetClass = classes.find(c => 
          c.archetype === archetype && 
          c.subversion === subversion
        );
      }
      
      if (!targetClass) {
        // Look for the base archetype
        targetClass = classes.find(c => 
          c.archetype === archetype && 
          (c.subversion === "None" || c.subversion === "")
        );
      }
      
      setSelectedClass(targetClass || null);
    } else {
      setSelectedClass(null);
    }
  }, [archetype, subversion, classes]);
  
  // Reset subversion when archetype changes
  useEffect(() => {
    setSubversion('');
  }, [archetype]);
  
  // Group stat data by stat type
  const getStatBenefitsByType = (statType: string) => {
    return statData
      .filter(data => data.Stat === statType.toUpperCase())
      .map(data => ({
        category: data.Use,
        benefit: data.Benefit,
        tiers: [data.Tier_0, data.Tier_1, data.Tier_2, data.Tier_3, data.Tier_4, data.Tier_5]
      }));
  };
  
  // Create a processed version of all stat data
  const processedStatData: any = {
    str: {
      type: "Anima",
      benefits: getStatBenefitsByType('str')
    },
    con: {
      type: "Anima",
      benefits: getStatBenefitsByType('con')
    },
    dex: {
      type: "Energy",
      benefits: getStatBenefitsByType('dex')
    },
    com: {
      type: "Energy",
      benefits: getStatBenefitsByType('com')
    },
    wis: {
      type: "Aether",
      benefits: getStatBenefitsByType('wis')
    },
    wil: {
      type: "Aether",
      benefits: getStatBenefitsByType('wil')
    },
    cha: {
      type: "Social",
      benefits: getStatBenefitsByType('cha')
    },
    ins: {
      type: "Social",
      benefits: getStatBenefitsByType('ins')
    }
  };
  
  // Helper to get the current value for a benefit
  const getBenefitValue = (stat: string, benefitName: string) => {
    const benefits = processedStatData[stat]?.benefits;
    if (!benefits) return null;
    
    const benefit = benefits.find((b: any) => b.benefit === benefitName);
    if (!benefit) return null;
    
    return benefit.tiers[stats[stat as keyof CharacterStats].tier];
  };
  
  // Extract skills from stat data
  const getSkills = (stat: string) => {
    const benefits = processedStatData[stat]?.benefits;
    if (!benefits) return [];
    
    return benefits
      .filter((b: any) => b.category === "Social" && !b.benefit.includes("Weight"))
      .map((b: any) => ({ 
        name: b.benefit, 
        tier: stats[stat as keyof CharacterStats].tier 
      }));
  };
  
  // Handle stat tier changes
  const handleTierChange = (stat: keyof CharacterStats, tier: number) => {
    setStats(prevStats => ({
      ...prevStats,
      [stat]: {
        ...prevStats[stat],
        tier: tier
      }
    }));
  };
  
  // Handle stat level changes
  const handleLevelChange = (stat: keyof CharacterStats, level: number) => {
    setStats(prevStats => ({
      ...prevStats,
      [stat]: {
        ...prevStats[stat],
        level: level
      }
    }));
  };
  
  // Handle equipment text changes
  const handleEquipmentChange = (stat: keyof CharacterStats, text: string) => {
    setStats(prevStats => ({
      ...prevStats,
      [stat]: {
        ...prevStats[stat],
        equipment: text
      }
    }));
  };
  
  // Calculate total starting momentum
  const calculateTotalMomentum = () => {
    let total = 0;
    
    total += getBenefitValue('con', 'Starting Momentum') || 0;
    total += getBenefitValue('com', 'Starting Momentum') || 0;
    total += getBenefitValue('wil', 'Starting Momentum') || 0;
    
    return total;
  };
  
  // Render tier selection buttons (0-5)
  const renderTierButtons = (stat: keyof CharacterStats) => {
    return (
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4, 5].map(tier => (
          <button
            key={tier}
            onClick={() => handleTierChange(stat, tier)}
            className={`w-8 h-8 rounded ${
              stats[stat].tier === tier 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>
    );
  };
  
  // Render level selection buttons (0-5)
  const renderLevelButtons = (stat: keyof CharacterStats) => {
    return (
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4, 5].map(level => (
          <button
            key={level}
            onClick={() => handleLevelChange(stat, level)}
            className={`w-8 h-8 rounded ${
              stats[stat].level === level 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    );
  };
  
  // Get color for stat type
  const getStatTypeColor = (type: string) => {
    switch (type) {
      case "Anima": return "bg-red-700";
      case "Energy": return "bg-blue-700";
      case "Aether": return "bg-purple-700";
      case "Social": return "bg-yellow-700";
      default: return "bg-gray-700";
    }
  };
  
  // Render ability block
  const renderAbilityBlock = (
    label: string, 
    ability: ClassAbility | undefined, 
    level: number, 
    requiredLevel: number
  ) => {
    if (!ability) return null;
    
    return (
      <div className={`p-2 ${level >= requiredLevel ? "bg-white border rounded mb-2" : "opacity-50"}`}>
        <p className="font-bold">{label}: 
          <span className="font-normal"> {ability.trigger} {ability.effect} {ability.value}</span>
        </p>
      </div>
    );
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Character Sheet</h1>
      
      {/* Character Name and Class */}
      <div className="mb-4 flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Character Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter character name"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Archetype</label>
          <select
            value={archetype}
            onChange={(e) => setArchetype(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Archetype</option>
            {archetypes.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subversion</label>
          <select
            value={subversion}
            onChange={(e) => setSubversion(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={!archetype}
          >
            <option value="">Select Subversion</option>
            {subversions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Class Level Selection */}
      {archetype && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Archetype Level</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => setArchetypeLevel(level)}
                  className={`w-12 h-12 rounded-full ${
                    archetypeLevel === level 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Level 1: Passive | Level 2: +Defense | Level 3: +Opener | Level 4: +Combo | Level 5: +Finisher
            </p>
          </div>

          {subversion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subversion Level</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => setSubversionLevel(level)}
                    className={`w-12 h-12 rounded-full ${
                      subversionLevel === level 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Level 1: Passive | Level 2: +Defense | Level 3: +Opener | Level 4: +Combo | Level 5: +Finisher
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Class Details Box */}
      {selectedClass && (
        <div className="mb-6 border rounded p-4 bg-gray-50">
          <h2 className="text-xl font-bold mb-4 text-center">
            {selectedClass.archetype}{selectedClass.subversion !== "None" ? ` - ${selectedClass.subversion}` : ''}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span className="font-bold">Role:</span> {selectedClass.role.join('/')}</p>
              <p><span className="font-bold">Key Effects:</span> {selectedClass.key_effects.join('/')}</p>
              
              {/* Display abilities based on class level */}
              <div className={`p-2 ${(subversion ? subversionLevel : archetypeLevel) >= 1 ? "bg-white border rounded mb-2" : "opacity-50"}`}>
                <p className="font-bold">Passive: <span className="font-normal">{selectedClass.passive}</span></p>
              </div>
              
              {renderAbilityBlock(
                "Defense", 
                selectedClass.defense, 
                (subversion ? subversionLevel : archetypeLevel), 
                2
              )}
            </div>
            <div>
              {renderAbilityBlock(
                "Opener", 
                selectedClass.opener, 
                (subversion ? subversionLevel : archetypeLevel), 
                3
              )}
              
              {renderAbilityBlock(
                "Combo", 
                selectedClass.combo, 
                (subversion ? subversionLevel : archetypeLevel), 
                4
              )}
              
              {renderAbilityBlock(
                "Finisher", 
                selectedClass.finisher, 
                (subversion ? subversionLevel : archetypeLevel), 
                5
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Render stats sections */}
        {Object.entries(processedStatData).map(([statKey, statInfo]: [string, any]) => (
          <div key={statKey} className="border rounded p-4 bg-gray-50">
            <h2 className={`text-xl font-bold mb-2 text-white p-1 ${getStatTypeColor(statInfo.type)}`}>
              {statKey.toUpperCase()} ({statInfo.type || "Unknown"})
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tier</label>
                {renderTierButtons(statKey as keyof CharacterStats)}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                {renderLevelButtons(statKey as keyof CharacterStats)}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{statKey.toUpperCase()} Equipment</label>
              <textarea
                className="w-full p-2 border rounded h-20"
                placeholder={`${statKey.toUpperCase()} equipment...`}
                value={stats[statKey as keyof CharacterStats].equipment}
                onChange={(e) => handleEquipmentChange(statKey as keyof CharacterStats, e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Benefits:</p>
                <ul className="list-inside space-y-1">
                  {statInfo.benefits
                    .filter((b: any) => b.category === "Combat")
                    .map((benefit: any, index: number) => (
                      <li key={index}>
                        {benefit.benefit}: {benefit.tiers[stats[statKey as keyof CharacterStats].tier]}
                      </li>
                    ))
                  }
                </ul>
              </div>
              <div>
                <p className="font-medium">Skills:</p>
                <ul className="list-inside">
                  {getSkills(statKey).map((skill: any, index: number) => (
                    <li key={index}>{skill.name}: {skill.tier}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Calculated Total Stats */}
      <div className="border rounded p-4 bg-gray-50 mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Calculated Totals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold mb-2">Damage</h3>
            <ul className="list-inside space-y-1">
              <li>STR Damage: +{getBenefitValue('str', 'STR Damage Increase')}</li>
              <li>DEX Damage: +{getBenefitValue('dex', 'DEX Damage Increase')}</li>
              <li>WIS Damage: +{getBenefitValue('wis', 'WIS Damage Increase')}</li>
              <li>CON Damage Reduction: {getBenefitValue('con', 'CON Damage Reduction')}</li>
              <li>COM Damage Reduction: {getBenefitValue('com', 'COM Damage Reduction')}</li>
              <li>WIL Damage Reduction: {getBenefitValue('wil', 'WIL Damage Reduction')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Momentum</h3>
            <p>Starting Momentum: {calculateTotalMomentum()}</p>
            <p>Vicious Damage: {getBenefitValue('str', 'Base Vicious Damage')}</p>
            <p>Ignore HEAVY: {getBenefitValue('str', 'Ignore HEAVY') ? "Yes" : "No"}</p>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Combat</h3>
            <ul className="list-inside space-y-1">
              <li>Maneuvers: {getBenefitValue('dex', 'Initial Maneuvers')}</li>
              <li>Precision Rerolls: {getBenefitValue('dex', 'Precision Rerolls')}</li>
              <li>Bleed Reduction: {getBenefitValue('con', 'Bleed Reduction')}</li>
              <li>Poison Reduction: {getBenefitValue('com', 'Poison Reduction')}</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Magic and Special Abilities */}
      <div className="border rounded p-4 bg-gray-50 mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Magic & Special Abilities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-2">Magic</h3>
            <ul className="list-inside space-y-1">
              <li>Innate Prime: {getBenefitValue('wis', 'Innate Prime')}</li>
              <li>Prime Generation: {getBenefitValue('wis', 'Prime Generation')}</li>
              <li>Maximum Summons: {getBenefitValue('wil', 'Maximum Summons')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Social & Potions</h3>
            <ul className="list-inside space-y-1">
              <li>Monologue: {getBenefitValue('cha', 'Monologue')}</li>
              <li>Distract: {getBenefitValue('cha', 'Distract')}</li>
              <li>Mock: {getBenefitValue('cha', 'Mock')}</li>
              <li>Potion Potency: {getBenefitValue('ins', 'Potion Potency')}</li>
              <li>Healing Potency: {getBenefitValue('ins', 'Healing Potency')}</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Equipment Section */}
      <div className="border rounded p-4 bg-gray-50 mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Equipment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold mb-2">Weapons</h3>
            <select className="w-full p-2 border rounded mb-2">
              <option value="">Select Weapon</option>
              {weapons.map(weapon => (
                <option key={weapon.weapon_id} value={weapon.weapon_id}>{weapon.name}</option>
              ))}
            </select>
            <textarea 
              className="w-full p-2 border rounded h-24" 
              placeholder="Weapon notes..."
            ></textarea>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Armor</h3>
            <select className="w-full p-2 border rounded mb-2">
              <option value="">Select Armor</option>
              {armors.map(armor => (
                <option key={armor.armor_id} value={armor.armor_id}>{armor.name}</option>
              ))}
            </select>
            <textarea 
              className="w-full p-2 border rounded h-24" 
              placeholder="Armor notes..."
            ></textarea>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Accessories</h3>
            <select className="w-full p-2 border rounded mb-2">
              <option value="">Select Accessory</option>
              {accessories.map(accessory => (
                <option key={accessory.accessory_id} value={accessory.accessory_id}>{accessory.name}</option>
              ))}
            </select>
            <textarea 
              className="w-full p-2 border rounded h-24" 
              placeholder="Accessory notes..."
            ></textarea>
          </div>
        </div>
      </div>
      
      {/* Magic Items */}
      <div className="border rounded p-4 bg-gray-50 mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Magic</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-2">Spells</h3>
            <select className="w-full p-2 border rounded mb-2">
              <option value="">Select Spell</option>
              {spells.map(spell => (
                <option key={spell.spell_id} value={spell.spell_id}>{spell.name}</option>
              ))}
            </select>
            <textarea 
              className="w-full p-2 border rounded h-24" 
              placeholder="Spell notes..."
            ></textarea>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Summons</h3>
            <select className="w-full p-2 border rounded mb-2">
              <option value="">Select Summon</option>
              {summons.map(summon => (
                <option key={summon.summon_id} value={summon.summon_id}>{summon.name}</option>
              ))}
            </select>
            <textarea 
              className="w-full p-2 border rounded h-24" 
              placeholder="Summon notes..."
            ></textarea>
          </div>
        </div>
      </div>
      
      {/* Effects Reference */}
      <div className="border rounded p-4 bg-gray-50 mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Effects Reference</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Stat</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2 text-left">Intensity</th>
                <th className="px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {effects.map((effect, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2">{effect.Name}</td>
                  <td className="px-4 py-2">{effect.Main_Stat}</td>
                  <td className="px-4 py-2">{effect.Stack_Duration}</td>
                  <td className="px-4 py-2">{effect.Stack_Intensity}</td>
                  <td className="px-4 py-2">{effect.Description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Skills Summary */}
      <div className="border rounded p-4 bg-gray-50 mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Skills Summary</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(processedStatData).map(([statKey, statInfo]: [string, any]) => (
            <div key={statKey}>
              <h3 className="font-bold mb-2">{statKey.toUpperCase()} Skills</h3>
              <ul className="list-inside">
                {getSkills(statKey).map((skill: any, index: number) => (
                  <li key={index}>{skill.name}: {skill.tier}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      {/* Character Notes */}
      <div className="border rounded p-4 bg-gray-50 mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Character Notes</h2>
        <textarea 
          className="w-full p-2 border rounded h-32" 
          placeholder="Character backstory, notes, additional information..."
        ></textarea>
      </div>
      
      {/* Save/Print Button */}
      <div className="flex justify-center">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700">
          Save Character Sheet
        </button>
      </div>
    </div>
  );
};

export default CharacterSheetApp;
