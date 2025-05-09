import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import Header from '../components/header';
import Footer from '../components/footer';
import { CourseCard } from '../components/courses';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses'],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  useEffect(() => {
    if (courses) {
      let filtered = [...courses];
      
      if (searchQuery) {
        filtered = filtered.filter(course => 
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (categoryFilter) {
        filtered = filtered.filter(course => course.categoryId.toString() === categoryFilter);
      }
      
      if (levelFilter) {
        filtered = filtered.filter(course => course.level === levelFilter);
      }
      
      setFilteredCourses(filtered);
    }
  }, [courses, searchQuery, categoryFilter, levelFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The filtering happens in the useEffect
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setLevelFilter('');
  };

  const isLoading = coursesLoading || categoriesLoading;

  return (
    <>
      <Helmet>
        <title>الدورات التعليمية | قاسيون إكسترا</title>
        <meta name="description" content="تصفح مجموعة واسعة من الدورات التعليمية المقدمة من نخبة من المدرسين المتميزين" />
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">الدورات التعليمية</h1>
          
          {/* Search and Filter */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-grow">
                  <Input
                    type="text"
                    placeholder="ابحث عن دورة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-accent text-white">
                  بحث
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">جميع التصنيفات</SelectItem>
                      {categories && categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">جميع المستويات</SelectItem>
                      <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                      <SelectItem value="متوسط">متوسط</SelectItem>
                      <SelectItem value="متقدم">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="md:w-auto w-full"
                >
                  مسح التصفية
                </Button>
              </div>
            </form>
          </div>
          
          {/* Courses Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredCourses && filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4"><i className="fas fa-search"></i></div>
              <h3 className="text-2xl font-bold mb-2">لم يتم العثور على دورات</h3>
              <p className="text-gray-600">جرب البحث بكلمات مختلفة أو تصفية أخرى</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Courses;
