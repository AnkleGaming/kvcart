import React, { useState, useEffect } from "react";
import { format, addDays, addMinutes, startOfDay } from "date-fns";
import { Calendar, Clock, ChevronRight, Sparkles } from "lucide-react";
import Colors from "../../core/constant";

const SlotCard = ({ onSelectSlot }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSlots = () => {
      const now = new Date();

      // Include today + next 2 days
      const dynamicDays = Array.from({ length: 3 }, (_, i) => {
        const date = addDays(now, i);
        return {
          label: format(date, "EEE"),
          date: format(date, "d"),
          month: format(date, "MMM"),
          fullDate: format(date, "yyyy-MM-dd"),
          iso: date.toISOString(),
          recommended: i === 0,
        };
      });

      // Time slots: next 6 available hours (9 AM – 9 PM)
      const slots = [];
      let base = new Date(now);
      base.setHours(base.getHours() + 1, 0, 0, 0);

      const startHour = 10;
      const endHour = 21;

      if (base.getHours() >= endHour) {
        base = addDays(startOfDay(base), 1);
        base.setHours(startHour, 0, 0, 0);
      } else if (base.getHours() < startHour) {
        base.setHours(startHour, 0, 0, 0);
      }

      while (slots.length < 6 && base.getHours() < endHour) {
        slots.push({
          time: format(base, "h:mm a"),
          fullTime: format(base, "HH:mm"),
          iso: base.toISOString(),
        });
        base = addMinutes(base, 60);
      }

      setDays(dynamicDays);
      setTimeSlots(slots);
      setSelectedDay(dynamicDays[0]);
      setSelectedTime(slots[0]);
      setLoading(false);
    };

    generateSlots();
  }, []);

  const handleProceed = () => {
    if (selectedDay && selectedTime) {
      onSelectSlot({
        day: selectedDay,
        time: selectedTime,
      });
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-xl max-w-md mx-auto h-[480px] flex flex-col animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-5"></div>
        <div className="space-y-4 flex-1 overflow-hidden">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-14 bg-gray-200 rounded-xl mt-5"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-2xl max-w-md mx-auto border border-gray-100
                 h-[520px] sm:h-[540px] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
          </div>
          <div>
            <h2
              className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo} bg-clip-text text-transparent`}
            >
              Schedule Service
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">Pick date & time</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-6">
        {/* Day Selection */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Select Date
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {days.map((day) => (
              <button
                key={day.fullDate}
                onClick={() => setSelectedDay(day)}
                className={`
                  group relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 
                  text-center focus:outline-none focus:ring-2 focus:ring-orange-400
                  ${
                    selectedDay?.fullDate === day.fullDate
                      ? "border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }
                `}
              >
                {day.recommended && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    Best
                  </div>
                )}
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase">
                  {day.month}
                </p>
                <p
                  className={`text-lg sm:text-2xl font-bold mt-0.5 ${
                    selectedDay?.fullDate === day.fullDate
                      ? "text-orange-600"
                      : "text-gray-900"
                  }`}
                >
                  {day.date}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-gray-600">
                  {day.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            Start Time
          </h4>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.fullTime}
                onClick={() => setSelectedTime(slot)}
                className={`
                  py-2.5 sm:py-3 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-orange-400
                  ${
                    selectedTime?.fullTime === slot.fullTime
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur">
        <button
          onClick={handleProceed}
          disabled={!selectedDay || !selectedTime}
          className={`
            w-full py-3.5 sm:py-4 rounded-xl font-bold text-white text-sm sm:text-base
            bg-gradient-to-r ${Colors.primaryFrom} ${Colors.primaryTo}
            hover:shadow-lg transform hover:scale-[1.02] active:scale-95
            transition-all duration-300 flex items-center justify-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            focus:outline-none focus:ring-4 focus:ring-orange-300
          `}
        >
          Confirm Slot
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default SlotCard;
