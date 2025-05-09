import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/auth-context';
import { useLocation } from 'wouter';

const CTA = () => {
  const { user, showRegisterModal } = useAuth();
  const [, setLocation] = useLocation();

  const handleStudentSignup = () => {
    if (user) {
      setLocation('/courses');
    } else {
      showRegisterModal('student');
    }
  };

  const handleTeacherJoin = () => {
    if (user && user.role === 'teacher') {
      setLocation('/dashboard/teacher');
    } else if (user) {
      setLocation('/become-teacher');
    } else {
      showRegisterModal('teacher');
    }
  };

  return (
    <section className="py-16 cta-gradient">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">ابدأ رحلة التعلم الآن</h2>
        <p className="text-white text-xl mb-8 max-w-2xl mx-auto">انضم إلى آلاف الطلاب الذين يحققون التميز الأكاديمي مع قاسيون إكسترا</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition"
            onClick={handleStudentSignup}
          >
            إنشاء حساب طالب
          </Button>
          <Button 
            variant="outline" 
            className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition"
            onClick={handleTeacherJoin}
          >
            انضم كمدرس
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
