import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import Header from '../components/header';
import Footer from '../components/footer';
import { CourseCard } from '../components/courses';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const TeacherProfile = () => {
  const [, params] = useRoute('/teachers/:id');
  const teacherId = parseInt(params.id);
  
  const { data: teacher, isLoading: teacherLoading } = useQuery({
    queryKey: [`/api/teachers/${teacherId}`],
  });
  
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: [`/api/teachers/${teacherId}/courses`],
    enabled: !!teacherId,
  });

  const isLoading = teacherLoading || coursesLoading;

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!teacher) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">المدرس غير موجود</h1>
            <p className="mb-6">عذراً، لم يتم العثور على المدرس المطلوب</p>
            <button 
              className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-md"
              onClick={() => window.history.back()}
            >
              العودة للخلف
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{teacher.fullName} | قاسيون إكسترا</title>
        <meta name="description" content={`تعرف على المدرس ${teacher.fullName} ودوراته التعليمية المميزة على منصة قاسيون إكسترا`} />
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        {/* Profile Header */}
        <div className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={teacher.profilePicture} />
                <AvatarFallback className="text-xl">{getInitials(teacher.fullName)}</AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-right">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{teacher.fullName}</h1>
                <p className="text-xl mb-4">مدرس</p>
                
                {teacher.experience && (
                  <div className="flex justify-center md:justify-start flex-wrap gap-4 mb-4">
                    <div className="bg-white/10 px-4 py-2 rounded-full">
                      <i className="fas fa-briefcase ml-2"></i>
                      <span>{teacher.experience}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center md:justify-start gap-6 text-lg">
                  <div>
                    <i className="fas fa-book ml-1"></i>
                    <span>{courses?.length || 0} دورة</span>
                  </div>
                  <div>
                    <i className="fas fa-user-graduate ml-1"></i>
                    <span>
                      {courses?.reduce((acc, course) => acc + (course.enrollmentsCount || 0), 0) || 0} طالب
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Teacher Content */}
        <div className="container mx-auto px-4 py-10">
          <Tabs defaultValue="about">
            <TabsList className="mb-8">
              <TabsTrigger value="about">نبذة عن المدرس</TabsTrigger>
              <TabsTrigger value="courses">الدورات التعليمية</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">نبذة تعريفية</h2>
                  <p className="text-gray-700 mb-6 text-lg">
                    {teacher.bio || 'لا توجد معلومات متاحة عن هذا المدرس.'}
                  </p>
                  
                  {teacher.experience && (
                    <>
                      <h2 className="text-2xl font-bold mb-4">الخبرة</h2>
                      <p className="text-gray-700 mb-6 text-lg">{teacher.experience}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="courses">
              {!courses || courses.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4"><i className="fas fa-book"></i></div>
                  <h3 className="text-2xl font-bold mb-2">لا توجد دورات حالياً</h3>
                  <p className="text-gray-600">لم يقم هذا المدرس بإضافة أي دورات بعد</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default TeacherProfile;
