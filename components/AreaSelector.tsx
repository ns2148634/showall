// /components/AreaSelector.tsx
import React from "react";
export default function AreaSelector({
  cities, selectedCity, setSelectedCity,
  areas, selectedArea, setSelectedArea
}) {
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
