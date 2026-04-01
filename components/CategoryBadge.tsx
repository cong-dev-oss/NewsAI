interface CategoryBadgeProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ name, color, size = 'sm' }: CategoryBadgeProps) {
  const padding = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-block font-semibold rounded-full whitespace-nowrap ${padding}`}
      style={{ backgroundColor: color + '18', color }}
    >
      {name}
    </span>
  );
}
