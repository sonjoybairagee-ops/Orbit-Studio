"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefundOrderModal, type RefundableOrder } from "./RefundOrderModal";

interface RefundButtonProps {
  order: RefundableOrder;
  label?: string;
  className?: string;
}

export function RefundButton({ order, label = "Refund", className }: RefundButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={
          className ||
          "rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-1 shadow-sm"
        }
        title={`Refund order #${order.id.slice(0, 8)}`}
      >
        <span>↩</span> {label}
      </button>

      <RefundOrderModal
        order={order}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
