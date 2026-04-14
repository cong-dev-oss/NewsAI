import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LatestPage from './LatestPage';

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Suspense fallback={<div className="py-20 text-center text-gray-400">Đang tải...</div>}>
          <LatestPage />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
