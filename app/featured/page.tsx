import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturedPage from './FeaturedPage';

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main><FeaturedPage /></main>
      <Footer />
    </div>
  );
}
