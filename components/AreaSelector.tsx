import React from "react";

type AreaSelectorProps = {
  cities: string[];
  selectedCity: string;
  setSelectedCity: (val: string) => void;
  areas: string[];
  selectedArea: string;
  setSelectedArea: (val: string) => void;
};

export default function AreaSelector({
  cities, selectedCity, setSelectedCity,
  areas, selectedArea, setSelectedArea
}: AreaSelectorProps) {
  return (
    <div className="flex gap-2">
      <select className="p-2 rounded border" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
        {cities.map(city => <option key={city}>{city}</option>)}
      </select>
      <select className="p-2 rounded border" value={selectedArea} onChange={e => setSelectedArea(e.target.value)}>
        {areas.map(area => <option key={area}>{area}</option>)}
      </select>
    </div>
  );
}
