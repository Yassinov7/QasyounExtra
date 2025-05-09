import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { uploadFile } from '@/lib/supabase';
import Header from '../../components/header';
import Footer from '../../components/footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { formatPrice, getInitials } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const courseSchema = z.object({
  title: z.string().min(3, { message: "عنوان الدورة يجب أن يكون 3 أحرف على الأقل" }),
  description: z.string().min(10, { message: "وصف الدورة يجب أن يكون 10 أحرف على الأقل" }),
  price: z.string().transform(val => parseInt(val)),
  categoryId: z.string().transform(val => parseInt(val)),
  level: z.string().min(1, { message: "يرجى اختيار مستوى الدورة" }),
});

const materialSchema = z.object({
  title: z.string().min(3, { message: "عنوان المادة يجب أن يكون 3 أحرف على الأقل" }),
  type: z.string().min(1, { message: "يرجى اختيار نوع المادة" }),
  courseId: z.number(),
  url: z.string().min(1, { message: "يرجى إدخال رابط المادة" }),
});

const TeacherDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("courses");
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: [`/api/teachers/${user?.id}/courses`],
    enabled: !!user?.id,
  });
  
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages'],
  });

  const courseForm = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      categoryId: '',
      level: '',
    },
  });

  const materialForm = useForm({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: '',
      type: '',
      courseId: 0,
      url: '',
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/courses', {
      ...data,
      teacherId: user.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teachers/${user.id}/courses`] });
      setIsAddingCourse(false);
      courseForm.reset();
      toast({
        title: "تم إنشاء الدورة",
        description: "تم إنشاء الدورة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "خطأ!",
        description: error.message || "حدث خطأ أثناء إنشاء الدورة",
      });
    },
  });

  const createMaterialMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', `/api/courses/${data.courseId}/materials`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedCourse.id}/materials`] });
      setIsAddingMaterial(false);
      materialForm.reset();
      toast({
        title: "تم إضافة المادة",
        description: "تم إضافة المادة التعليمية بنجاح",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "خطأ!",
        description: error.message || "حدث خطأ أثناء إضافة المادة التعليمية",
      });
    },
  });

  const handleCourseThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const filePath = `course-thumbnails/${user.id}/${file.name}`;
      const fileUrl = await uploadFile('courses', filePath, file);
      
      if (fileUrl) {
        toast({
          title: "تم رفع الصورة",
          description: "تم رفع صورة الدورة بنجاح",
        });
        // Store the URL to use when creating course
        courseForm.setValue('thumbnail', fileUrl);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ!",
        description: "فشل في رفع الصورة، حاول مرة أخرى",
      });
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmitCourse = (data) => {
    createCourseMutation.mutate(data);
  };

  const onSubmitMaterial = (data) => {
    createMaterialMutation.mutate({
      ...data,
      courseId: selectedCourse.id,
    });
  };

  const openAddMaterialDialog = (course) => {
    setSelectedCourse(course);
    materialForm.setValue('courseId', course.id);
    setIsAddingMaterial(true);
  };

  const isLoading = coursesLoading || categoriesLoading || messagesLoading;

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

  return (
    <>
      <Helmet>
        <title>لوحة تحكم المدرس | قاسيون إكسترا</title>
        <meta name="description" content="لوحة تحكم المدرس في منصة قاسيون إكسترا التعليمية" />
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-3">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="text-lg">{getInitials(user?.fullName || '')}</AvatarFallback>
                  </Avatar>
                  <CardTitle>{user?.fullName}</CardTitle>
                  <CardDescription>مدرس</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant={activeTab === "courses" ? "default" : "ghost"} 
                      className={activeTab === "courses" ? "bg-primary hover:bg-primary/90" : ""}
                      onClick={() => setActiveTab("courses")}
                    >
                      <i className="fas fa-book ml-2"></i>
                      الدورات التعليمية
                    </Button>
                    <Button 
                      variant={activeTab === "students" ? "default" : "ghost"}
                      className={activeTab === "students" ? "bg-primary hover:bg-primary/90" : ""}
                      onClick={() => setActiveTab("students")}
                    >
                      <i className="fas fa-user-graduate ml-2"></i>
                      الطلاب
                    </Button>
                    <Button 
                      variant={activeTab === "messages" ? "default" : "ghost"}
                      className={activeTab === "messages" ? "bg-primary hover:bg-primary/90" : ""}
                      onClick={() => setActiveTab("messages")}
                    >
                      <i className="fas fa-envelope ml-2"></i>
                      الرسائل
                      {messages && messages.filter(m => !m.isRead && m.receiverId === user?.id).length > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full mr-2">
                          {messages.filter(m => !m.isRead && m.receiverId === user?.id).length}
                        </span>
                      )}
                    </Button>
                    <Button 
                      variant={activeTab === "profile" ? "default" : "ghost"}
                      className={activeTab === "profile" ? "bg-primary hover:bg-primary/90" : ""}
                      onClick={() => setActiveTab("profile")}
                    >
                      <i className="fas fa-user ml-2"></i>
                      الملف الشخصي
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="md:w-3/4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {activeTab === "courses" && "الدورات التعليمية"}
                      {activeTab === "students" && "الطلاب المسجلين"}
                      {activeTab === "messages" && "الرسائل"}
                      {activeTab === "profile" && "الملف الشخصي"}
                    </CardTitle>
                    <CardDescription>
                      {activeTab === "courses" && "إدارة الدورات التعليمية الخاصة بك"}
                      {activeTab === "students" && "استعراض الطلاب المسجلين في دوراتك"}
                      {activeTab === "messages" && "تواصل مع الطلاب وإدارة الرسائل"}
                      {activeTab === "profile" && "عرض وتعديل معلومات الملف الشخصي"}
                    </CardDescription>
                  </div>
                  
                  {activeTab === "courses" && (
                    <Button
                      className="bg-primary hover:bg-accent text-white"
                      onClick={() => setIsAddingCourse(true)}
                    >
                      <i className="fas fa-plus ml-2"></i>
                      إضافة دورة جديدة
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {activeTab === "courses" && (
                    <div>
                      {!courses || courses.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="text-5xl mb-4 text-gray-300"><i className="fas fa-book"></i></div>
                          <h3 className="text-xl font-bold mb-2">لم تقم بإنشاء أي دورة بعد</h3>
                          <p className="text-gray-600 mb-4">ابدأ بإنشاء دورتك التعليمية الأولى</p>
                          <Button 
                            className="bg-primary hover:bg-accent text-white"
                            onClick={() => setIsAddingCourse(true)}
                          >
                            إضافة دورة جديدة
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {courses.map(course => (
                            <Card key={course.id} className="hover:shadow-md transition">
                              <div className="relative h-40 overflow-hidden rounded-t-lg">
                                <img 
                                  src={course.thumbnail || "https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"} 
                                  alt={course.title} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                                  <div className="p-4 w-full">
                                    <h3 className="text-white font-bold text-lg truncate">{course.title}</h3>
                                  </div>
                                </div>
                              </div>
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-500">
                                    {categories.find(c => c.id === course.categoryId)?.name || 'تصنيف غير محدد'}
                                  </span>
                                  <span className="text-sm font-medium text-gray-500">
                                    {course.level}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm h-12 overflow-hidden mb-2">{course.description}</p>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-secondary">{formatPrice(course.price)}</span>
                                  <span className="text-sm text-gray-500">
                                    {course.enrollmentsCount || 0} طالب مسجل
                                  </span>
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-between gap-2">
                                <Button 
                                  variant="outline"
                                  className="text-primary border-primary flex-1"
                                  onClick={() => window.location.href = `/courses/${course.id}`}
                                >
                                  عرض
                                </Button>
                                <Button 
                                  className="bg-primary hover:bg-accent text-white flex-1"
                                  onClick={() => openAddMaterialDialog(course)}
                                >
                                  إضافة مادة
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === "students" && (
                    <div>
                      {!courses || courses.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="text-5xl mb-4 text-gray-300"><i className="fas fa-user-graduate"></i></div>
                          <h3 className="text-xl font-bold mb-2">لا يوجد طلاب مسجلين</h3>
                          <p className="text-gray-600 mb-4">قم بإنشاء دورتك التعليمية أولاً لاستقبال الطلاب</p>
                          <Button 
                            className="bg-primary hover:bg-accent text-white"
                            onClick={() => setActiveTab("courses")}
                          >
                            إدارة الدورات
                          </Button>
                        </div>
                      ) : (
                        <div>
                          {courses.map(course => {
                            const enrollmentsCount = course.enrollmentsCount || 0;
                            return (
                              <div key={course.id} className="mb-6 border rounded-lg p-4">
                                <h3 className="font-bold mb-2">{course.title}</h3>
                                <div className="flex justify-between items-center mb-3">
                                  <span>{enrollmentsCount} طالب مسجل</span>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-primary border-primary"
                                    onClick={() => window.location.href = `/courses/${course.id}`}
                                  >
                                    تفاصيل الدورة
                                  </Button>
                                </div>
                                {enrollmentsCount === 0 ? (
                                  <p className="text-center text-gray-500 py-4">لا يوجد طلاب مسجلين في هذه الدورة</p>
                                ) : (
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">الطلاب المسجلين في هذه الدورة</p>
                                    {/* In a real app, you would fetch and display student details */}
                                    <div className="flex flex-wrap gap-2">
                                      {[...Array(enrollmentsCount)].map((_, i) => (
                                        <Avatar key={i} className="h-8 w-8">
                                          <AvatarFallback className="text-xs">طالب</AvatarFallback>
                                        </Avatar>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === "messages" && (
                    <div>
                      {!messages || messages.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="text-5xl mb-4 text-gray-300"><i className="fas fa-envelope"></i></div>
                          <h3 className="text-xl font-bold mb-2">لا توجد رسائل</h3>
                          <p className="text-gray-600">ستظهر هنا الرسائل المتبادلة مع الطلاب</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map(message => {
                            const isSender = message.senderId === user?.id;
                            return (
                              <div 
                                key={message.id} 
                                className={`p-4 rounded-lg ${
                                  isSender 
                                    ? 'bg-primary/10 mr-12' 
                                    : 'bg-gray-100 ml-12 ' + (!message.isRead ? 'border-r-4 border-primary' : '')
                                }`}
                              >
                                <div className="flex justify-between mb-2">
                                  <span className="font-semibold">
                                    {isSender ? 'أنت' : `مستخدم #${message.senderId}`}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(message.sentAt).toLocaleDateString('ar-SA')} {new Date(message.sentAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-gray-700">{message.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === "profile" && (
                    <div className="text-center py-4">
                      <p className="mb-4">يمكنك تعديل ملفك الشخصي من صفحة الملف الشخصي</p>
                      <Button 
                        className="bg-primary hover:bg-accent text-white"
                        onClick={() => window.location.href = '/profile'}
                      >
                        الذهاب للملف الشخصي
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Add Course Dialog */}
      <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة دورة جديدة</DialogTitle>
            <DialogDescription>قم بإدخال معلومات الدورة التعليمية الجديدة</DialogDescription>
          </DialogHeader>
          
          <Form {...courseForm}>
            <form onSubmit={courseForm.handleSubmit(onSubmitCourse)} className="space-y-4">
              <FormField
                control={courseForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الدورة</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل عنوان الدورة" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={courseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف الدورة</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="أدخل وصف الدورة" rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={courseForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>السعر (ل.س)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="أدخل سعر الدورة" min="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={courseForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>المستوى</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المستوى" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                          <SelectItem value="متوسط">متوسط</SelectItem>
                          <SelectItem value="متقدم">متقدم</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={courseForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التصنيف</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر تصنيف الدورة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories && categories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={courseForm.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>صورة الدورة</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="course-thumbnail" 
                          type="file" 
                          accept="image/*"
                          onChange={handleCourseThumbnailUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('course-thumbnail').click()}
                          disabled={isUploading}
                          className="w-full"
                        >
                          {isUploading ? (
                            <span className="flex items-center">
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              جاري الرفع...
                            </span>
                          ) : field.value ? (
                            <span className="flex items-center">
                              <i className="fas fa-check ml-2 text-green-500"></i>
                              تم رفع الصورة
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <i className="fas fa-upload ml-2"></i>
                              اختر صورة للدورة
                            </span>
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      اختر صورة جذابة للدورة، الحجم المثالي 800×450 بكسل
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingCourse(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-accent"
                  disabled={createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      جاري الإنشاء...
                    </span>
                  ) : 'إنشاء الدورة'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Material Dialog */}
      <Dialog open={isAddingMaterial} onOpenChange={setIsAddingMaterial}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة مادة تعليمية</DialogTitle>
            <DialogDescription>
              إضافة مادة تعليمية إلى دورة "{selectedCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <Form {...materialForm}>
            <form onSubmit={materialForm.handleSubmit(onSubmitMaterial)} className="space-y-4">
              <FormField
                control={materialForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان المادة</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل عنوان المادة التعليمية" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={materialForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع المادة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع المادة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="video">فيديو</SelectItem>
                        <SelectItem value="pdf">ملف PDF</SelectItem>
                        <SelectItem value="quiz">اختبار</SelectItem>
                        <SelectItem value="text">نص</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={materialForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط المادة</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل رابط المادة التعليمية" />
                    </FormControl>
                    <FormDescription>
                      يمكنك إدخال رابط فيديو يوتيوب أو رابط ملف PDF أو أي رابط آخر
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingMaterial(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-accent"
                  disabled={createMaterialMutation.isPending}
                >
                  {createMaterialMutation.isPending ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      جاري الإضافة...
                    </span>
                  ) : 'إضافة المادة'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
};

export default TeacherDashboard;
