'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setLoading(true);
    setWidth(0);

    const t1 = setTimeout(() => setWidth(70), 50);
    const t2 = setTimeout(() => setWidth(90), 400);
    const t3 = setTimeout(() => {
      setWidth(100);
      const t4 = setTimeout(() => {
        setLoading(false);
        setWidth(0);
      }, 300);
      return () => clearTimeout(t4);
    }, 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!loading && width === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gray-900 transition-all ease-out"
        style={{
          width: `${width}%`,
          transitionDuration: width === 100 ? '200ms' : '600ms',
          opacity: width === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
