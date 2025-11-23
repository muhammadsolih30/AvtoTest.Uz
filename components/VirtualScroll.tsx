import React, { useState } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  height: number;
  rowHeight: number;
  renderRow: (item: T) => React.ReactNode;
  className?: string;
}

export function VirtualScroll<T extends { id: string }>({ items, height, rowHeight, renderRow, className }: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * rowHeight;
  
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(
    items.length - 1, 
    Math.floor((scrollTop + height) / rowHeight) + 3 // Buffer for smooth scrolling
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const item = items[i];
    visibleItems.push(
      <div
        key={item.id}
        style={{
          position: 'absolute',
          top: i * rowHeight,
          left: 0,
          right: 0,
          height: rowHeight,
        }}
      >
        {renderRow(item)}
      </div>
    );
  }

  return (
    <div
      style={{ height, overflowY: 'auto', position: 'relative', WebkitOverflowScrolling: 'touch' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      className={`custom-scrollbar ${className || ''}`}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}