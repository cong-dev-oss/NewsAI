import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoriesPage from './CategoriesPage';

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main><CategoriesPage /></main>
      <Footer />
    </div>
  );
}
