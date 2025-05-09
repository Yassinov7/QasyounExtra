import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/auth-context';
import { useLocation } from 'wouter';

const Hero = () => {
  const { user, showRegisterModal } = useAuth();
  const [, setLocation] = useLocation();

  const handleStartLearning = () => {
    if (user) {
      setLocation('/courses');
    } else {
      showRegisterModal('student');
    }
  };

  const handleBecomeTeacher = () => {
    if (user && user.role === 'teacher') {
      setLocation('/dashboard/teacher');
    } else if (user) {
      setLocation('/become-teacher');
    } else {
      showRegisterModal('teacher');
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative hero-gradient h-[500px] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800" 
            alt="خلفية تعليمية" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-xl text-white z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">تعلم بلا حدود مع قاسيون إكسترا</h1>
            <p className="text-xl mb-8">منصة تعليمية متكاملة لربط الطلاب بالمدرسين وتحقيق التميز الأكاديمي</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              <Button 
                className="px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-opacity-90 transition"
                onClick={handleStartLearning}
              >
                ابدأ التعلم الآن
              </Button>
              <Button 
                variant="outline" 
                className="px-6 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition"
                onClick={handleBecomeTeacher}
              >
                كن مدرساً معنا
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
