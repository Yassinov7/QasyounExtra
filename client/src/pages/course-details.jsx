import { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '../contexts/auth-context';
import Header from '../components/header';
import Footer from '../components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { formatPrice, getInitials, getStarRating } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const CourseDetails = () => {
  const [, params] = useRoute('/courses/:id');
  const courseId = parseInt(params.id);
  const { user, showLoginModal } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
  });
  
  const { data: materials, isLoading: materialsLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}/materials`],
  });
  
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}/reviews`],
  });
  
  const { data: teacher, isLoading: teacherLoading } = useQuery({
    queryKey: [`/api/teachers/${course?.teacherId}`],
    enabled: !!course?.teacherId,
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}/enrollments`],
    enabled: !!user,
  });

  const isEnrolled = enrollments?.some(enrollment => 
    enrollment.studentId === user?.id && enrollment.courseId === courseId
  );

  const enrollMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/courses/${courseId}/enroll`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/enrollments`] });
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيلك في الدورة بنجاح!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "خطأ في التسجيل",
        description: error.message || "حدث خطأ أثناء محاولة التسجيل في الدورة",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (reviewData) => apiRequest('POST', `/api/courses/${courseId}/reviews`, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/reviews`] });
      setReviewText('');
      toast({
        title: "تم إضافة التقييم",
        description: "شكراً لإضافة تقييمك للدورة!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "خطأ في إضافة التقييم",
        description: error.message || "حدث خطأ أثناء محاولة إضافة التقييم",
      });
    },
  });

  const handleEnroll = () => {
    if (!user) {
      showLoginModal();
      return;
    }
    
    enrollMutation.mutate();
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!user) {
      showLoginModal();
      return;
    }
    
    if (!isEnrolled) {
      toast({
        variant: "destructive",
        title: "غير مسموح",
        description: "يجب أن تكون مسجلاً في الدورة لإضافة تقييم",
      });
      return;
    }
    
    if (reviewText.trim() === '') {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى كتابة تعليق للتقييم",
      });
      return;
    }
    
    reviewMutation.mutate({
      rating: reviewRating,
      comment: reviewText
    });
  };

  const isLoading = courseLoading || materialsLoading || reviewsLoading || teacherLoading || enrollmentsLoading;

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

  if (!course) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">الدورة غير موجودة</h1>
            <p className="mb-6">عذراً، لم يتم العثور على الدورة المطلوبة</p>
            <Button 
              className="bg-primary hover:bg-accent text-white"
              onClick={() => window.history.back()}
            >
              العودة للخلف
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  // Group materials by type
  const materialsByType = materials?.reduce((acc, material) => {
    if (!acc[material.type]) {
      acc[material.type] = [];
    }
    acc[material.type].push(material);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>{course.title} | قاسيون إكسترا</title>
        <meta name="description" content={course.description} />
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        {/* Course Hero */}
        <div className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center">
                <div className="flex mr-1">
                  {getStarRating(averageRating)}
                </div>
                <span className="ml-1">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-200 mr-1">({reviews?.length || 0} تقييم)</span>
              </div>
              <div className="font-medium">
                <span className="ml-2">{course.level}</span>
                <i className="fas fa-level-up-alt ml-1"></i>
              </div>
              <div className="font-medium">
                <span className="ml-2">{materials?.length || 0} درس</span>
                <i className="fas fa-book ml-1"></i>
              </div>
            </div>
            <p className="text-lg mb-6">{course.description}</p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-2">
                  <AvatarImage src={teacher?.profilePicture} />
                  <AvatarFallback>{getInitials(teacher?.fullName || '')}</AvatarFallback>
                </Avatar>
                <span>مدرس: {teacher?.fullName}</span>
              </div>
              <div className="font-bold text-2xl text-white py-2">
                {formatPrice(course.price)}
              </div>
              <Button 
                className={`px-6 py-3 ${isEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-secondary hover:bg-secondary/90'} text-white font-bold rounded-lg transition`}
                onClick={handleEnroll}
                disabled={isEnrolled || enrollMutation.isPending}
              >
                {enrollMutation.isPending ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري التسجيل...
                  </span>
                ) : isEnrolled ? (
                  'أنت مسجل بالفعل'
                ) : (
                  'الالتحاق بالدورة'
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <Tabs defaultValue="content">
                <TabsList className="mb-6">
                  <TabsTrigger value="content">محتوى الدورة</TabsTrigger>
                  <TabsTrigger value="reviews">التقييمات</TabsTrigger>
                  <TabsTrigger value="teacher">عن المدرس</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content">
                  <Card>
                    <CardHeader>
                      <CardTitle>محتوى الدورة</CardTitle>
                      <CardDescription>{materials?.length || 0} درس</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!materials || materials.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">لا يوجد محتوى للدورة حتى الآن</p>
                      ) : (
                        <Accordion type="single" collapsible className="w-full">
                          {materialsByType && Object.keys(materialsByType).map((type, index) => (
                            <AccordionItem key={index} value={`type-${index}`}>
                              <AccordionTrigger>
                                <div className="flex items-center">
                                  <i className={`mr-2 ${
                                    type === 'video' ? 'fas fa-video text-red-500' :
                                    type === 'pdf' ? 'fas fa-file-pdf text-red-600' :
                                    type === 'quiz' ? 'fas fa-question-circle text-blue-500' :
                                    'fas fa-file-alt text-gray-500'
                                  }`}></i>
                                  <span>
                                    {type === 'video' ? 'مقاطع فيديو' :
                                     type === 'pdf' ? 'ملفات PDF' :
                                     type === 'quiz' ? 'اختبارات' :
                                     type}
                                  </span>
                                  <span className="mr-2 text-sm text-gray-500">
                                    ({materialsByType[type].length})
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="space-y-2">
                                  {materialsByType[type].map((material, idx) => (
                                    <li 
                                      key={material.id} 
                                      className={`p-3 rounded-md ${isEnrolled ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-70'} flex justify-between items-center`}
                                    >
                                      <div className="flex items-center">
                                        <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full ml-3">
                                          {idx + 1}
                                        </span>
                                        <span>{material.title}</span>
                                      </div>
                                      {isEnrolled ? (
                                        <a 
                                          href={material.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary hover:text-accent"
                                        >
                                          <i className="fas fa-play-circle text-lg"></i>
                                        </a>
                                      ) : (
                                        <i className="fas fa-lock text-gray-400"></i>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <Card>
                    <CardHeader>
                      <CardTitle>تقييمات الطلاب</CardTitle>
                      <CardDescription>{reviews?.length || 0} تقييم</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Add Review Form */}
                      {user && isEnrolled && (
                        <div className="mb-8 p-4 border rounded-lg">
                          <h3 className="text-lg font-bold mb-4">أضف تقييمك</h3>
                          <form onSubmit={handleSubmitReview}>
                            <div className="mb-4">
                              <label className="block mb-2">التقييم</label>
                              <div className="flex gap-2 text-2xl">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewRating(star)}
                                    className="focus:outline-none"
                                  >
                                    <i className={`${star <= reviewRating ? 'fas' : 'far'} fa-star text-yellow-400`}></i>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block mb-2">التعليق</label>
                              <Textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="اكتب تعليقك هنا..."
                                rows={4}
                              />
                            </div>
                            <Button 
                              type="submit" 
                              className="bg-primary hover:bg-accent"
                              disabled={reviewMutation.isPending}
                            >
                              {reviewMutation.isPending ? (
                                <span className="flex items-center">
                                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                  جاري الإرسال...
                                </span>
                              ) : 'إرسال التقييم'}
                            </Button>
                          </form>
                        </div>
                      )}
                      
                      {/* Reviews List */}
                      {!reviews || reviews.length === 0 ? (
                        <p className="text-center text-gray-500 py-6">لا توجد تقييمات لهذه الدورة حتى الآن</p>
                      ) : (
                        <div className="space-y-6">
                          {reviews.map(review => (
                            <div key={review.id} className="border-b pb-6 last:border-b-0">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                  <Avatar className="h-10 w-10 mr-3">
                                    <AvatarFallback>
                                      {/* In a real app, fetch student data */}
                                      {review.studentId.toString().substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-bold">طالب #{review.studentId}</h4>
                                    <div className="flex text-yellow-400">
                                      {getStarRating(review.rating)}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                              <p className="text-gray-700 mt-2">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="teacher">
                  <Card>
                    <CardHeader>
                      <CardTitle>معلومات المدرس</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/4 text-center">
                          <Avatar className="h-24 w-24 mx-auto mb-3">
                            <AvatarImage src={teacher?.profilePicture} />
                            <AvatarFallback className="text-xl">{getInitials(teacher?.fullName || '')}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-bold text-xl mb-1">{teacher?.fullName}</h3>
                          <p className="text-gray-600 mb-3">مدرس</p>
                          <Button 
                            variant="outline" 
                            className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                            onClick={() => window.location.href = `/teachers/${teacher?.id}`}
                          >
                            عرض الملف الشخصي
                          </Button>
                        </div>
                        <div className="md:w-3/4">
                          <h3 className="font-bold text-lg mb-3">نبذة عن المدرس</h3>
                          <p className="text-gray-700 mb-4">
                            {teacher?.bio || 'لا توجد معلومات متاحة عن المدرس.'}
                          </p>
                          
                          {teacher?.experience && (
                            <div className="mb-4">
                              <h3 className="font-bold text-lg mb-2">الخبرة</h3>
                              <p className="text-gray-700">{teacher.experience}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>معلومات الدورة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="flex items-center">
                        <i className="fas fa-clock ml-2 text-primary"></i>
                        عدد الدروس
                      </span>
                      <span className="font-semibold">{materials?.length || 0} درس</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="flex items-center">
                        <i className="fas fa-signal ml-2 text-primary"></i>
                        المستوى
                      </span>
                      <span className="font-semibold">{course.level}</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="flex items-center">
                        <i className="fas fa-user-graduate ml-2 text-primary"></i>
                        عدد الطلاب
                      </span>
                      <span className="font-semibold">{enrollments?.length || 0} طالب</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="flex items-center">
                        <i className="fas fa-language ml-2 text-primary"></i>
                        لغة الدورة
                      </span>
                      <span className="font-semibold">العربية</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <i className="fas fa-calendar-alt ml-2 text-primary"></i>
                        تاريخ النشر
                      </span>
                      <span className="font-semibold">
                        {new Date(course.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </li>
                  </ul>
                  
                  <div className="mt-6">
                    <Button 
                      className={`w-full ${isEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-accent'} text-white`}
                      onClick={handleEnroll}
                      disabled={isEnrolled || enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? (
                        <span className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          جاري التسجيل...
                        </span>
                      ) : isEnrolled ? (
                        'أنت مسجل بالفعل'
                      ) : (
                        `الالتحاق بالدورة - ${formatPrice(course.price)}`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default CourseDetails;
