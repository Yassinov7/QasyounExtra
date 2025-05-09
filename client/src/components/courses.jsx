import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, formatPrice } from '@/lib/utils';
import { useAuth } from '../contexts/auth-context';

const CourseCard = ({ course }) => {
  const { user, showLoginModal } = useAuth();

  const handleEnrollClick = (e) => {
    if (!user) {
      e.preventDefault();
      showLoginModal();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <Link href={`/courses/${course.id}`}>
        <img 
          src={course.thumbnail || "https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"} 
          alt={course.title} 
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {course.categoryName}
          </span>
          <div className="flex items-center">
            <i className="fas fa-star text-yellow-400"></i>
            <span className="text-sm text-gray-600 mr-1">
              {course.averageRating ? `${course.averageRating} (${course.reviewsCount})` : 'لا تقييمات'}
            </span>
          </div>
        </div>
        <Link href={`/courses/${course.id}`}>
          <h3 className="font-bold text-xl mb-2">{course.title}</h3>
        </Link>
        <p className="text-gray-600 mb-4 text-sm">{course.description}</p>
        <div className="flex items-center mb-4">
          <Link href={`/teachers/${course.teacherId}`}>
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={course.teacherImage} alt={course.teacherName} />
                <AvatarFallback>{getInitials(course.teacherName || '')}</AvatarFallback>
              </Avatar>
              <span className="text-gray-700 mr-2 text-sm">{course.teacherName}</span>
            </div>
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold text-secondary text-lg">{formatPrice(course.price)}</span>
          <Link 
            href={user ? `/courses/${course.id}/enroll` : '#'} 
            onClick={handleEnrollClick}
          >
            <Button className="px-3 py-1 bg-primary text-white font-semibold rounded-lg hover:bg-accent transition text-sm">
              الالتحاق بالدورة
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeaturedCourses = ({ limit = 3 }) => {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['/api/courses'],
  });

  const featuredCourses = courses ? courses.slice(0, limit) : [];

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">الدورات المميزة</h2>
            <Link href="/courses" className="text-primary font-semibold flex items-center hover:text-accent transition">
              <span>عرض الكل</span>
              <i className="fas fa-chevron-left mr-2"></i>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(limit)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="w-20 h-6 bg-gray-200 animate-pulse rounded-full"></div>
                    <div className="w-16 h-6 bg-gray-200 animate-pulse"></div>
                  </div>
                  <div className="h-7 bg-gray-200 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse mb-4"></div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="w-24 h-4 bg-gray-200 animate-pulse mr-2"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-16 h-6 bg-gray-200 animate-pulse"></div>
                    <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-lg"></div>
                  </div>
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">الدورات المميزة</h2>
            <Link href="/courses" className="text-primary font-semibold flex items-center hover:text-accent transition">
              <span>عرض الكل</span>
              <i className="fas fa-chevron-left mr-2"></i>
            </Link>
          </div>
          <p className="text-red-500 text-center">حدث خطأ أثناء تحميل الدورات. يرجى المحاولة مرة أخرى لاحقًا.</p>
        </div>
      </section>
    );
  }

  if (featuredCourses.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">الدورات المميزة</h2>
            <Link href="/courses" className="text-primary font-semibold flex items-center hover:text-accent transition">
              <span>عرض الكل</span>
              <i className="fas fa-chevron-left mr-2"></i>
            </Link>
          </div>
          <p className="text-gray-500 text-center">لم يتم العثور على دورات. تحقق مرة أخرى لاحقًا!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">الدورات المميزة</h2>
          <Link href="/courses" className="text-primary font-semibold flex items-center hover:text-accent transition">
            <span>عرض الكل</span>
            <i className="fas fa-chevron-left mr-2"></i>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
export { CourseCard };
