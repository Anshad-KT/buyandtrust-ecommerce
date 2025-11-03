// src/app/_components/QuantityCounter.tsx
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
    <div className="flex items-center justify-center w-full">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onDecrement}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="mx-4">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onIncrement}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
