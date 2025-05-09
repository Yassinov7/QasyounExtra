import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import Header from '../components/header';
import Footer from '../components/footer';
import { TeacherCard } from '../components/teachers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Teachers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['/api/teachers'],
    onSuccess: (data) => {
      if (!isSearching) {
        setFilteredTeachers(data);
      }
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    if (teachers) {
      const filtered = teachers.filter(teacher => 
        teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher.bio && teacher.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTeachers(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    if (teachers) {
      setFilteredTeachers(teachers);
    }
  };

  return (
    <>
      <Helmet>
        <title>المدرسين | قاسيون إكسترا</title>
        <meta name="description" content="نخبة من المدرسين المتميزين في منصة قاسيون إكسترا التعليمية" />
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">المدرسين المتميزين</h1>
          
          {/* Search Form */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="ابحث عن مدرس..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-accent text-white flex-1">
                  بحث
                </Button>
                {isSearching && (
                  <Button type="button" variant="outline" onClick={handleClearSearch} className="flex-1">
                    مسح
                  </Button>
                )}
              </div>
            </form>
          </div>
          
          {/* Teachers Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredTeachers && filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTeachers.map(teacher => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4"><i className="fas fa-user-graduate"></i></div>
              <h3 className="text-2xl font-bold mb-2">لم يتم العثور على مدرسين</h3>
              <p className="text-gray-600">جرب البحث بكلمات مختلفة</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Teachers;
