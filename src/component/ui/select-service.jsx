import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import GetColortab from "../../backend/selectcolor/getcolortab";
import Colors from "../../core/constant";

const SelectColorCardItem = ({ color, label, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer flex flex-col items-center space-y-2 transition-all duration-300 hover:scale-105"
    >
      <Card
        className={`w-[60px] h-[60px] md:w-[70px] md:h-[70px] lg:w-[60px] lg:h-[60px] rounded-xl overflow-hidden border flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300
        ${
          isActive
            ? `${Colors.bgGray} border-[#FA7D09] ring-2 ring-[#E56A00]`
            : `bg-white ${Colors.borderGray} hover:border-[#FA7D09]`
        }`}
      >
        <CardContent className="p-0 flex items-center justify-center w-full h-full">
          <div
            className="w-full h-full rounded"
            style={{ backgroundColor: color }}
          ></div>
        </CardContent>
      </Card>
      <span
        className={`text-[10px] md:text-[11px] lg:text-[12px] font-medium text-center text-gray-800 leading-tight max-w-[80px] group-hover:${Colors.tableHeadText} transition-colors duration-300`}
      >
        {label}
      </span>
    </div>
  );
};

const SelectColorCardSection = ({
  subService,
  onChangeSubService,
  selectedSubService,
}) => {
  const [colorTabs, setColorTabs] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    const fetchColorTabs = async () => {
      try {
        const data = await GetColortab(subService?.id || 0);
        setColorTabs(data || []);

        if (data && data.length > 0 && !selectedSubService) {
          onChangeSubService(data[0]);
          setSelectedColor(data[0].Colors);
        }
      } catch (error) {
        console.log("Error fetching color tabs", error);
      }
    };
    fetchColorTabs();
  }, [subService, selectedSubService, onChangeSubService]);

  useEffect(() => {
    if (selectedSubService) {
      setSelectedColor(selectedSubService.Colors);
    }
  }, [selectedSubService]);

  return (
    <div className="w-full sm:w-[350px] md:w-[300px] lg:w-[280px] mx-auto sm:mx-0 bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h1
        className={`text-[22px] md:text-[26px] lg:text-[28px] font-bold mb-4 ${Colors.textGrayDark}`}
      >
        Choose a Color
      </h1>

      <div className="grid grid-cols-4 sm:grid-cols-3 gap-3">
        {colorTabs.map((item, index) => (
          <SelectColorCardItem
            key={index}
            color={item.Colors}
            label={item.label}
            isActive={selectedColor === item.Colors}
            onClick={() => {
              setSelectedColor(item.Colors);
              onChangeSubService(item);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SelectColorCardSection;
