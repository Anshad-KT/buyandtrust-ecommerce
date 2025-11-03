'use client';

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantityCounterProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function QuantityCounter({ quantity, onIncrement, onDecrement }: QuantityCounterProps) {
  return (
    <div className="w-full flex items-center justify-between border-2 border-black rounded-full px-1 py-1 mt-2 bg-black"
    style={{
      fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
      fontWeight: 500,
    }}>
      <Button
        // variant="outline"
        size="icon"
        className="text-white hover:bg-gray-50 hover:text-black rounded-full w-8 h-6 flex items-center justify-center text-sm font-normal"
        onClick={onDecrement}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="mx-4 text-white">{quantity}</span>
      <Button
        // variant="outline"
        size="icon"
        className="text-white hover:bg-gray-50 hover:text-black rounded-full w-8 h-6 flex items-center justify-center text-sm font-normal"
        onClick={onIncrement}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
