import { Link } from 'wouter';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xl">Q</span>
              </div>
              <span className="text-xl font-bold mr-2">قاسيون إكسترا</span>
            </div>
            <p className="text-gray-400 mb-4">منصة تعليمية متكاملة تربط الطلاب بالمدرسين لتحقيق التميز الأكاديمي</p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="فيسبوك">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="تويتر">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="انستجرام">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition" aria-label="يوتيوب">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition">الرئيسية</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-white transition">الدورات</Link></li>
              <li><Link href="/teachers" className="text-gray-400 hover:text-white transition">المدرسين</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white transition">التصنيفات</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition">الأسئلة الشائعة</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">الدعم</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">تواصل معنا</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white transition">الدعم الفني</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition">شروط الاستخدام</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-white transition">طلب المساعدة</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 ml-2 text-gray-400"></i>
                <span className="text-gray-400">دمشق، سوريا</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 ml-2 text-gray-400"></i>
                <span className="text-gray-400">+963 11 123 4567</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 ml-2 text-gray-400"></i>
                <span className="text-gray-400">info@qasyounextra.sy</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} قاسيون إكسترا. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
