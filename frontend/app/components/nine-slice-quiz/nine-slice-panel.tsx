import React from 'react';

export interface NineSlicePanelProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onHover?: () => void;
  selected?: boolean;
}

/**
 * Renders a 9-slice scaled panel with pixel-art styling using Tailwind
 */
export function NineSlicePanel({
  children,
  className = '',
  onClick,
  onHover,
  selected = false,
}: NineSlicePanelProps) {
  return (
    <div
      className={`relative w-full min-h-[60px] ${className}`}
      onClick={onClick}
      onMouseEnter={onHover}
      style={{
        imageRendering: 'pixelated',
      }}
    >
      <div className="grid grid-cols-[8px_1fr_8px] grid-rows-[8px_1fr_8px] w-full h-full min-h-[60px]">
        {/* Top-left corner */}
        <div
          className="w-2 h-2 rounded-tl-[5px]"
          style={{
            background: selected
              ? 'linear-gradient(135deg, #5a4f3b 0%, #5a4f3b 50%, #e4ab38 50%, #e4ab38 100%)'
              : 'linear-gradient(135deg, #3a2f1b 0%, #3a2f1b 50%, #e4ab38 50%, #e4ab38 100%)',
          }}
        />

        {/* Top edge */}
        <div
          style={{
            background: selected
              ? 'linear-gradient(to bottom, #5a4f3b 0%, #5a4f3b 40%, #e4ab38 40%, #e4ab38 60%, #5a4f3b 60%, #5a4f3b 100%)'
              : 'linear-gradient(to bottom, #3a2f1b 0%, #3a2f1b 40%, #e4ab38 40%, #e4ab38 60%, #3a2f1b 60%, #3a2f1b 100%)',
          }}
        />

        {/* Top-right corner */}
        <div
          className="w-2 h-2 rounded-tr-[5px]"
          style={{
            background: selected
              ? 'linear-gradient(225deg, #5a4f3b 0%, #5a4f3b 50%, #e4ab38 50%, #e4ab38 100%)'
              : 'linear-gradient(225deg, #3a2f1b 0%, #3a2f1b 50%, #e4ab38 50%, #e4ab38 100%)',
          }}
        />

        {/* Left edge */}
        <div
          style={{
            background: selected
              ? 'linear-gradient(to right, #5a4f3b 0%, #5a4f3b 40%, #e4ab38 40%, #e4ab38 60%, #5a4f3b 60%, #5a4f3b 100%)'
              : 'linear-gradient(to right, #3a2f1b 0%, #3a2f1b 40%, #e4ab38 40%, #e4ab38 60%, #3a2f1b 60%, #3a2f1b 100%)',
          }}
        />

        {/* Center content */}
        <div
          className={`flex items-center justify-center relative overflow-hidden ${
            selected ? 'bg-[#0f3560]' : 'bg-[#0b2e50]'
          }`}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: selected
                ? 'linear-gradient(45deg, transparent 0%, rgba(228, 171, 56, 0.15) 50%, transparent 100%)'
                : 'linear-gradient(45deg, transparent 0%, rgba(228, 171, 56, 0.1) 50%, transparent 100%)',
            }}
          />
          <div
            className={`relative z-10 text-[10px] leading-[1.4] text-center p-2 font-['Press_Start_2P',_monospace] ${
              selected ? 'text-[#fce9a5]' : 'text-[#fce9a5]'
            }`}
          >
            {children}
          </div>
        </div>

        {/* Right edge */}
        <div
          style={{
            background: selected
              ? 'linear-gradient(to right, #5a4f3b 0%, #5a4f3b 40%, #e4ab38 40%, #e4ab38 60%, #5a4f3b 60%, #5a4f3b 100%)'
              : 'linear-gradient(to right, #3a2f1b 0%, #3a2f1b 40%, #e4ab38 40%, #e4ab38 60%, #3a2f1b 60%, #3a2f1b 100%)',
          }}
        />

        {/* Bottom-left corner */}
        <div
          className="w-2 h-2 rounded-bl-[5px]"
          style={{
            background: selected
              ? 'linear-gradient(45deg, #5a4f3b 0%, #5a4f3b 50%, #e4ab38 50%, #e4ab38 100%)'
              : 'linear-gradient(45deg, #3a2f1b 0%, #3a2f1b 50%, #e4ab38 50%, #e4ab38 100%)',
          }}
        />

        {/* Bottom edge */}
        <div
          style={{
            background: selected
              ? 'linear-gradient(to bottom, #5a4f3b 0%, #5a4f3b 40%, #e4ab38 40%, #e4ab38 60%, #5a4f3b 60%, #5a4f3b 100%)'
              : 'linear-gradient(to bottom, #3a2f1b 0%, #3a2f1b 40%, #e4ab38 40%, #e4ab38 60%, #3a2f1b 60%, #3a2f1b 100%)',
          }}
        />

        {/* Bottom-right corner */}
        <div
          className="w-2 h-2 rounded-br-[5px]"
          style={{
            background: selected
              ? 'linear-gradient(315deg, #5a4f3b 0%, #5a4f3b 50%, #e4ab38 50%, #e4ab38 100%)'
              : 'linear-gradient(315deg, #3a2f1b 0%, #3a2f1b 50%, #e4ab38 50%, #e4ab38 100%)',
          }}
        />
      </div>
    </div>
  );
}
