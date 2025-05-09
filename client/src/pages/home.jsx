import { Helmet } from 'react-helmet';
import Header from '../components/header';
import Hero from '../components/hero';
import SearchBar from '../components/search-bar';
import Categories from '../components/categories';
import FeaturedCourses from '../components/courses';
import TeacherHighlights from '../components/teachers';
import Features from '../components/features';
import Testimonials from '../components/testimonials';
import CTA from '../components/cta';
import Footer from '../components/footer';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>قاسيون إكسترا - منصة تعليمية لربط الطلاب بالمدرسين</title>
        <meta 
          name="description" 
          content="قاسيون إكسترا - منصة تعليمية متكاملة لربط الطلاب بالمدرسين وتحقيق التميز الأكاديمي. انضم إلينا اليوم!"
        />
        <meta property="og:title" content="قاسيون إكسترا - منصة تعليمية" />
        <meta property="og:description" content="منصة تعليمية متكاملة لربط الطلاب بالمدرسين وتحقيق التميز الأكاديمي" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://qasyounextra.sy" />
      </Helmet>
      
      <Header />
      <Hero />
      <SearchBar />
      <Categories />
      <FeaturedCourses />
      <TeacherHighlights />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
};

export default Home;
