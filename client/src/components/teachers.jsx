import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';

const TeacherCard = ({ teacher }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition text-center">
      <div className="relative">
        <img 
          src={teacher.profilePicture || "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
          alt={teacher.fullName} 
          className="w-full h-40 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-3 text-white">
          <div className="flex justify-between items-center">
            <span className="text-xs">
              {teacher.experience ? `خبرة ${teacher.experience}` : 'مدرس محترف'}
            </span>
            <div className="flex items-center">
              <i className="fas fa-star text-yellow-400 text-xs"></i>
              <span className="text-xs mr-1">{teacher.rating || '5.0'}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-xl mb-1">{teacher.fullName}</h3>
        <p className="text-gray-600 mb-3 text-sm">{teacher.title || 'مدرس'}</p>
        <p className="text-xs text-gray-500 mb-4">{teacher.bio || 'مدرس متخصص في منصة قاسيون إكسترا'}</p>
        <Link href={`/teachers/${teacher.id}`}>
          <Button variant="outline" className="w-full px-4 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition">
            عرض الملف الشخصي
          </Button>
        </Link>
      </div>
    </div>
  );
};

const TeacherHighlights = ({ limit = 4 }) => {
  const { data: teachers, isLoading, error } = useQuery({
    queryKey: ['/api/teachers'],
  });

  const featuredTeachers = teachers ? teachers.slice(0, limit) : [];

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">نخبة من المدرسين المتميزين</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(limit)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden text-center">
                <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
                <div className="p-5">
                  <div className="h-7 bg-gray-200 animate-pulse mb-1 mx-auto w-1/2"></div>
                  <div className="h-5 bg-gray-200 animate-pulse mb-3 mx-auto w-1/3"></div>
                  <div className="h-4 bg-gray-200 animate-pulse mb-4 mx-auto w-3/4"></div>
                  <div className="h-10 bg-gray-200 animate-pulse rounded-lg w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">نخبة من المدرسين المتميزين</h2>
          <p className="text-red-500 text-center">حدث خطأ أثناء تحميل المدرسين. يرجى المحاولة مرة أخرى لاحقًا.</p>
        </div>
      </section>
    );
  }

  if (featuredTeachers.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">نخبة من المدرسين المتميزين</h2>
          <p className="text-gray-500 text-center">لم يتم العثور على مدرسين. تحقق مرة أخرى لاحقًا!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">نخبة من المدرسين المتميزين</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTeachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeacherHighlights;
export { TeacherCard };
