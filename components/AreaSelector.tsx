import React from "react";

type AreaSelectorProps = {
  cities: string[];
  selectedCity: string;
  setSelectedCity: (val: string) => void;
  areas: string[];
  selectedArea: string;
  setSelectedArea: (val: string) => void;
};

// 台灣北到南固定排序（可補全、調整地名）
const TAIWAN_CITY_ORDER = [
  "全部",
  "基隆市",
  "台北市",
  "新北市",
  "桃園市",
  "新竹市", "新竹縣",
  "苗栗縣",
  "台中市",
  "彰化縣", "南投縣",
  "雲林縣",
  "嘉義市", "嘉義縣",
  "台南市",
  "高雄市",
  "屏東縣",
  "台東縣", "花蓮縣",
  "宜蘭縣",
  "澎湖縣",
  "金門縣",
  "連江縣"
];

export default function AreaSelector({
  cities, selectedCity, setSelectedCity,
  areas, selectedArea, setSelectedArea
}: AreaSelectorProps) {
  // 自動排序，未在 TAIWAN_CITY_ORDER 的排在後面
  const orderedCities = [
    ...TAIWAN_CITY_ORDER.filter(c => cities.includes(c)),
    ...cities.filter(c => !TAIWAN_CITY_ORDER.includes(c))
  ];

  return (
    <div className="flex gap-2">
      <div>
        <label className="block text-xs text-gray-600 mb-1">城市</label>
        <select 
          className="p-2 rounded border" 
          value={selectedCity} 
          onChange={e => setSelectedCity(e.target.value)}
        >
          {orderedCities.map(city => <option key={city}>{city}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">行政區</label>
        <select 
          className="p-2 rounded border" 
          value={selectedArea} 
          onChange={e => setSelectedArea(e.target.value)}
        >
          {areas.map(area => <option key={area}>{area}</option>)}
        </select>
      </div>
    </div>
  );
}
