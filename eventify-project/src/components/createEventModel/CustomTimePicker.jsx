import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import './CustomTimePicker.css';

export const timeToMinutes = (timeStr) => {
  if (!timeStr) return -1;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return -1;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const p = match[3] ? match[3].toUpperCase() : 'AM';
  if (p === 'PM' && h < 12) h += 12;
  if (p === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

export const addOneHour = (timeStr) => {
  if (!timeStr) return '10:00 AM';
  const mins = timeToMinutes(timeStr);
  if (mins === -1) return '10:00 AM';
  let nextMins = (mins + 60) % (24 * 60);
  let h = Math.floor(nextMins / 60);
  const m = nextMins % 60;
  const p = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${p}`;
};

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];

const CustomTimePicker = ({
  value = '',
  onChange,
  minTime = '',
  placeholder = 'Select Time',
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parsed = useMemo(() => {
    if (!value) {
      return { hour: '09', minute: '00', period: 'AM' };
    }
    const match = value.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) {
      return { hour: '09', minute: '00', period: 'AM' };
    }
    const h = String(parseInt(match[1], 10)).padStart(2, '0');
    let m = match[2].padStart(2, '0');
    if (!MINUTES.includes(m)) {
      const numM = parseInt(m, 10);
      if (numM < 8) m = '00';
      else if (numM < 23) m = '15';
      else if (numM < 38) m = '30';
      else m = '45';
    }
    const p = match[3] ? match[3].toUpperCase() : 'AM';
    return { hour: h, minute: m, period: p };
  }, [value]);

  const minMinutes = useMemo(() => {
    return minTime ? timeToMinutes(minTime) : -1;
  }, [minTime]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (newH, newM, newP) => {
    const formatted = `${newH}:${newM} ${newP}`;
    onChange(formatted);
  };

  const isSlotDisabled = (h, m, p) => {
    if (minMinutes === -1) return false;
    const slotMins = timeToMinutes(`${h}:${m} ${p}`);
    return slotMins <= minMinutes;
  };

  return (
    <div className={`custom-time-picker ${disabled ? 'disabled' : ''}`} ref={containerRef}>
      <button
        type="button"
        className={`time-picker-trigger ${isOpen ? 'active' : ''} ${!value ? 'placeholder' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="trigger-left">
          <Clock size={15} className="time-icon" />
          <span className="time-value-display">{value || placeholder}</span>
        </span>
        <ChevronDown size={14} className={`time-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="time-picker-popover">
          <div className="time-columns-header">
            <span>Hr</span>
            <span>Min</span>
            <span>Period</span>
          </div>
          <div className="time-columns-body">
            {/* Hour Column */}
            <div className="time-column">
              {HOURS.map((h) => {
                const isSelected = parsed.hour === h;
                const disabledHour = isSlotDisabled(h, parsed.minute, parsed.period);
                return (
                  <button
                    key={h}
                    type="button"
                    className={`time-cell ${isSelected ? 'selected' : ''} ${disabledHour ? 'cell-disabled' : ''}`}
                    onClick={() => handleSelect(h, parsed.minute, parsed.period)}
                    disabled={disabledHour}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Minute Column */}
            <div className="time-column">
              {MINUTES.map((m) => {
                const isSelected = parsed.minute === m;
                const disabledMinute = isSlotDisabled(parsed.hour, m, parsed.period);
                return (
                  <button
                    key={m}
                    type="button"
                    className={`time-cell ${isSelected ? 'selected' : ''} ${disabledMinute ? 'cell-disabled' : ''}`}
                    onClick={() => handleSelect(parsed.hour, m, parsed.period)}
                    disabled={disabledMinute}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            {/* Period Column */}
            <div className="time-column">
              {PERIODS.map((p) => {
                const isSelected = parsed.period === p;
                const disabledPeriod = isSlotDisabled(parsed.hour, parsed.minute, p);
                return (
                  <button
                    key={p}
                    type="button"
                    className={`time-cell ${isSelected ? 'selected' : ''} ${disabledPeriod ? 'cell-disabled' : ''}`}
                    onClick={() => handleSelect(parsed.hour, parsed.minute, p)}
                    disabled={disabledPeriod}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {required && (
        <input
          type="text"
          value={value}
          readOnly
          required
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          tabIndex={-1}
        />
      )}
    </div>
  );
};

export default CustomTimePicker;

