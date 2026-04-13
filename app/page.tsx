import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeHero from './HomeHero';
import HomeSituation from './HomeSituation';
import HomeGrid from './HomeGrid';
import HomeCategoriesSection from './HomeCategoriesSection';
import HomeBreaking from './HomeBreaking';
import { getStories } from '@/lib/api';

// Force dynamic rendering — backend is not available during Docker build
export const dynamic = 'force-dynamic';

export default async function Home() {
  const latestArticles = await getStories(5, undefined, "roundup");
  const breakingTitles = latestArticles.length > 0 
    ? latestArticles.map(a => `🔴 ${a.category.toUpperCase()}: ${a.title}`)
    : undefined;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HomeBreaking news={breakingTitles} />
      <main>
        <HomeHero />
        <HomeSituation />
        <HomeGrid />
        <HomeCategoriesSection />
      </main>
      <Footer />
    </div>
  );
}
