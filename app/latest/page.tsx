import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LatestPage from './LatestPage';

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main><LatestPage /></main>
      <Footer />
    </div>
  );
}
