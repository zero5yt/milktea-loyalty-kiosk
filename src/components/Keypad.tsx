import React from 'react';
import { Delete, X } from 'lucide-react';

interface KeypadProps {
  onPress: (val: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  disabledSubmit?: boolean;
}

export function Keypad({ onPress, onBackspace, onClear, onSubmit, submitLabel = 'Enter', disabledSubmit = false }: KeypadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto w-full">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => onPress(key)}
            className="h-20 bg-white border-2 border-[#E5E1DA] rounded-2xl text-2xl font-bold transition-colors active:scale-95 active:bg-[#F5F1EB]"
          >
            {key}
          </button>
        ))}
        
        <button
          onClick={onClear}
          className="h-20 bg-[#F16565]/10 border-2 border-[#F16565]/20 rounded-2xl text-lg font-bold text-[#F16565] transition-colors active:scale-95 active:bg-[#F16565]/20"
        >
          CLEAR
        </button>
        
        <button
          onClick={() => onPress('0')}
          className="h-20 bg-white border-2 border-[#E5E1DA] rounded-2xl text-2xl font-bold transition-colors active:scale-95 active:bg-[#F5F1EB]"
        >
          0
        </button>

        <button
          onClick={onBackspace}
          className="h-20 bg-[#4B3F35]/5 border-2 border-[#E5E1DA] rounded-2xl text-lg font-bold flex items-center justify-center text-[#4B3F35] transition-colors active:scale-95 active:bg-[#4B3F35]/10"
        >
          <Delete size={24} />
        </button>

        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={disabledSubmit}
            className="col-span-3 mt-4 h-20 bg-[#606C38] text-white rounded-2xl text-xl font-bold shadow-lg shadow-[#606C38]/20 hover:bg-[#4F592E] disabled:bg-[#A3B18A] disabled:cursor-not-allowed transition-colors active:scale-95"
          >
            {submitLabel.toUpperCase()}
          </button>
        )}
      </div>
  );
}
