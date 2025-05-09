import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';
import { Loader2, MoreHorizontal } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(3, { message: "اسم التصنيف يجب أن يكون 3 أحرف على الأقل" }),
  description: z.string().optional(),
  icon: z.string().min(1, { message: "يرجى اختيار أيقونة للتصنيف" }),
  color: z.string().min(1, { message: "يرجى اختيار لون للتصنيف" }),
});

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isViewingUser, setIsViewingUser] = useState(false);
  
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses'],
  });

  const { data: selectedUser, isLoading: selectedUserLoading } = useQuery({
    queryKey: [`/api/users/${selectedUserId}`],
    enabled: !!selectedUserId && isViewingUser,
  });

  const categoryForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      color: '',
    },
  });
  
  const createCategoryMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsAddingCategory(false);
      categoryForm.reset();
      toast({
        title: "تم إنشاء التصنيف",
        description: "تم إنشاء التصنيف بنجاح",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "خطأ!",
        description: error.message || "حدث خطأ أثناء إنشاء التصنيف",
      });
    },
  });

  const onSubmitCategory = (data) => {
    createCategoryMutation.mutate(data);
  };

  const viewUserDetails = (userId) => {
    setSelectedUserId(userId);
    setIsViewingUser(true);
  };

  const isLoading = usersLoading || categoriesLoading || coursesLoading;

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
        <title>لوحة تحكم المدير | قاسيون إكسترا</title>
        <meta name="description" content="لوحة تحكم المدير في منصة قاسيون إكسترا التعليمية" />
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
                  <CardDescription>مدير النظام</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant={activeTab === "users" ? "default" : "ghost"} 
                      className={activeTab === "users" ? "bg-primary hover:bg-primary/90" : ""}
                      onClick={() => setActiveTab("users")}
                    >
                      <i className="fas fa-users ml-2"></i>
                      المستخدمين
                    </Button>
                    <Button 
                      variant={activeTab === "courses" ? "default" : "ghost"}
                      className={activeTab === "courses" ? "bg-primary hover:bg-primary/90" : ""}
                      onClick={() => setActiveTab("courses")}
                    >
                      <i className="fas fa-book ml-2"></i>
                      الدورات
                    </Button>
                    <Button 
                      variant={activeTab === "categories" ? "default" : "ghost"}
                      className={activeTab === "categories" ? "bg-primary hover:bg-primary/90" : ""}
                      onClick={() => setActiveTab("categories")}
                    >
                      <i className="fas fa-list ml-2"></i>
                      التصنيفات
                    </Button>
                    <Button 
                      variant={activeTab === "stats" ? "default" : "ghost"}
                      className={activeTab === "stats" ? "bg-primary hover:bg-primary/90" : ""}
                      onClick={() => setActiveTab("stats")}
                    >
                      <i className="fas fa-chart-bar ml-2"></i>
                      الإحصائيات
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
                      {activeTab === "users" && "إدارة المستخدمين"}
                      {activeTab === "courses" && "إدارة الدورات"}
                      {activeTab === "categories" && "إدارة التصنيفات"}
                      {activeTab === "stats" && "إحصائيات المنصة"}
                      {activeTab === "profile" && "الملف الشخصي"}
                    </CardTitle>
                    <CardDescription>
                      {activeTab === "users" && "عرض وإدارة حسابات المستخدمين في المنصة"}
                      {activeTab === "courses" && "عرض وإدارة الدورات التعليمية"}
                      {activeTab === "categories" && "إدارة تصنيفات الدورات التعليمية"}
                      {activeTab === "stats" && "عرض إحصائيات المنصة"}
                      {activeTab === "profile" && "عرض وتعديل معلومات الملف الشخصي"}
                    </CardDescription>
                  </div>
                  
                  {activeTab === "categories" && (
                    <Button
                      className="bg-primary hover:bg-accent text-white"
                      onClick={() => setIsAddingCategory(true)}
                    >
                      <i className="fas fa-plus ml-2"></i>
                      إضافة تصنيف جديد
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  {activeTab === "users" && (
                    <div className="overflow-x-auto">
                      {!users || users.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="text-5xl mb-4 text-gray-300"><i className="fas fa-users"></i></div>
                          <h3 className="text-xl font-bold mb-2">لا يوجد مستخدمين</h3>
                          <p className="text-gray-600">لم يتم العثور على مستخدمين في المنصة</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">الرقم</TableHead>
                              <TableHead>المستخدم</TableHead>
                              <TableHead>البريد الإلكتروني</TableHead>
                              <TableHead>الدور</TableHead>
                              <TableHead>تاريخ التسجيل</TableHead>
                              <TableHead className="text-left">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.id}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 ml-2">
                                      <AvatarImage src={user.profilePicture} alt={user.fullName} />
                                      <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                                    </Avatar>
                                    {user.fullName}
                                  </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                                    user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {user.role === 'admin' ? 'مدير' : 
                                     user.role === 'teacher' ? 'مدرس' : 
                                     'طالب'}
                                  </span>
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => viewUserDetails(user.id)}>
                                        عرض التفاصيل
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">
                                        حظر المستخدم
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                  
                  {activeTab === "courses" && (
                    <div className="overflow-x-auto">
                      {!courses || courses.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="text-5xl mb-4 text-gray-300"><i className="fas fa-book"></i></div>
                          <h3 className="text-xl font-bold mb-2">لا توجد دورات</h3>
                          <p className="text-gray-600">لم يتم العثور على دورات تعليمية في المنصة</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">الرقم</TableHead>
                              <TableHead>عنوان الدورة</TableHead>
                              <TableHead>التصنيف</TableHead>
                              <TableHead>المدرس</TableHead>
                              <TableHead>السعر</TableHead>
                              <TableHead>المستوى</TableHead>
                              <TableHead className="text-left">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {courses.map((course) => (
                              <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.id}</TableCell>
                                <TableCell>{course.title}</TableCell>
                                <TableCell>
                                  {categories.find(cat => cat.id === course.categoryId)?.name || 'غير مصنف'}
                                </TableCell>
                                <TableCell>معرف المدرس: {course.teacherId}</TableCell>
                                <TableCell>{course.price} ل.س</TableCell>
                                <TableCell>{course.level}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => window.location.href = `/courses/${course.id}`}>
                                        عرض الدورة
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">
                                        إيقاف الدورة
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                  
                  {activeTab === "categories" && (
                    <div className="px-6 py-4">
                      {!categories || categories.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="text-5xl mb-4 text-gray-300"><i className="fas fa-list"></i></div>
                          <h3 className="text-xl font-bold mb-2">لا توجد تصنيفات</h3>
                          <p className="text-gray-600 mb-4">لم يتم العثور على تصنيفات في المنصة</p>
                          <Button 
                            className="bg-primary hover:bg-accent text-white"
                            onClick={() => setIsAddingCategory(true)}
                          >
                            إضافة تصنيف جديد
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categories.map((category) => (
                            <Card key={category.id} className="hover:shadow-md transition">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full bg-${category.color || 'primary'}/10 flex items-center justify-center mr-3`}>
                                      <i className={`${category.icon} text-${category.color || 'primary'} text-xl`}></i>
                                    </div>
                                    <CardTitle className="text-lg">{category.name}</CardTitle>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        تعديل التصنيف
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">
                                        حذف التصنيف
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-gray-500">
                                  {category.description || 'لا يوجد وصف لهذا التصنيف'}
                                </p>
                                <div className="mt-2 flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    {courses?.filter(course => course.categoryId === category.id).length || 0} دورة
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === "stats" && (
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-primary/10">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">إجمالي المستخدمين</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center">
                              <i className="fas fa-users text-3xl text-primary ml-4"></i>
                              <div className="text-3xl font-bold">{users?.length || 0}</div>
                            </div>
                            <div className="text-sm mt-2">
                              <span className="text-primary font-semibold">
                                {users?.filter(u => u.role === 'student').length || 0} طالب
                              </span>
                              <span className="mx-2">|</span>
                              <span className="text-secondary font-semibold">
                                {users?.filter(u => u.role === 'teacher').length || 0} مدرس
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-secondary/10">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">إجمالي الدورات</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center">
                              <i className="fas fa-book text-3xl text-secondary ml-4"></i>
                              <div className="text-3xl font-bold">{courses?.length || 0}</div>
                            </div>
                            <div className="text-sm mt-2">
                              <span className="text-secondary font-semibold">
                                {categories?.length || 0} تصنيف
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-accent/10">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">إجمالي التسجيلات</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center">
                              <i className="fas fa-user-graduate text-3xl text-accent ml-4"></i>
                              <div className="text-3xl font-bold">
                                {/* In a real app, you'd sum up all enrollments */}
                                {courses?.reduce((acc, course) => acc + (course.enrollmentsCount || 0), 0) || 0}
                              </div>
                            </div>
                            <div className="text-sm mt-2">
                              <span className="text-accent font-semibold">
                                في جميع الدورات
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>أكثر الدورات تسجيلاً</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {courses && courses.length > 0 ? (
                              <div className="space-y-4">
                                {courses
                                  .sort((a, b) => (b.enrollmentsCount || 0) - (a.enrollmentsCount || 0))
                                  .slice(0, 5)
                                  .map((course) => (
                                    <div key={course.id} className="flex justify-between items-center">
                                      <div className="flex-1">
                                        <div className="font-medium">{course.title}</div>
                                        <div className="text-sm text-gray-500">
                                          {categories?.find(cat => cat.id === course.categoryId)?.name || 'غير مصنف'}
                                        </div>
                                      </div>
                                      <div className="text-lg font-bold">{course.enrollmentsCount || 0}</div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">لم يتم العثور على دورات</div>
                            )}
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>أكثر المدرسين نشاطاً</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {users && users.filter(u => u.role === 'teacher').length > 0 ? (
                              <div className="space-y-4">
                                {users
                                  .filter(u => u.role === 'teacher')
                                  .sort((a, b) => {
                                    const aCount = courses?.filter(c => c.teacherId === a.id).length || 0;
                                    const bCount = courses?.filter(c => c.teacherId === b.id).length || 0;
                                    return bCount - aCount;
                                  })
                                  .slice(0, 5)
                                  .map((teacher) => (
                                    <div key={teacher.id} className="flex justify-between items-center">
                                      <div className="flex items-center flex-1">
                                        <Avatar className="h-8 w-8 ml-3">
                                          <AvatarImage src={teacher.profilePicture} alt={teacher.fullName} />
                                          <AvatarFallback>{getInitials(teacher.fullName)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium">{teacher.fullName}</div>
                                          <div className="text-sm text-gray-500">{teacher.email}</div>
                                        </div>
                                      </div>
                                      <div className="text-lg font-bold">
                                        {courses?.filter(c => c.teacherId === teacher.id).length || 0} دورة
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">لم يتم العثور على مدرسين</div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "profile" && (
                    <div className="px-6 py-4 text-center">
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
      
      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
            <DialogDescription>قم بإدخال معلومات التصنيف الجديد</DialogDescription>
          </DialogHeader>
          
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم التصنيف</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل اسم التصنيف" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف التصنيف (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="أدخل وصف التصنيف" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={categoryForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>أيقونة التصنيف</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر أيقونة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fas fa-calculator">حاسبة</SelectItem>
                          <SelectItem value="fas fa-flask">علوم</SelectItem>
                          <SelectItem value="fas fa-language">لغة</SelectItem>
                          <SelectItem value="fas fa-globe">عالمي</SelectItem>
                          <SelectItem value="fas fa-landmark">تاريخ</SelectItem>
                          <SelectItem value="fas fa-atom">فيزياء</SelectItem>
                          <SelectItem value="fas fa-book">كتاب</SelectItem>
                          <SelectItem value="fas fa-paint-brush">فن</SelectItem>
                          <SelectItem value="fas fa-music">موسيقى</SelectItem>
                          <SelectItem value="fas fa-code">برمجة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={categoryForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>لون التصنيف</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر لون" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="primary">بنفسجي</SelectItem>
                          <SelectItem value="secondary">برتقالي</SelectItem>
                          <SelectItem value="accent">أرجواني</SelectItem>
                          <SelectItem value="green-500">أخضر</SelectItem>
                          <SelectItem value="red-500">أحمر</SelectItem>
                          <SelectItem value="blue-500">أزرق</SelectItem>
                          <SelectItem value="yellow-500">أصفر</SelectItem>
                          <SelectItem value="pink-500">وردي</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingCategory(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-accent"
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      جاري الإنشاء...
                    </span>
                  ) : 'إنشاء التصنيف'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View User Dialog */}
      <Dialog open={isViewingUser} onOpenChange={setIsViewingUser}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تفاصيل المستخدم</DialogTitle>
          </DialogHeader>
          
          {selectedUserLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-3">
                  <AvatarImage src={selectedUser.profilePicture} alt={selectedUser.fullName} />
                  <AvatarFallback className="text-xl">{getInitials(selectedUser.fullName)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{selectedUser.fullName}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' : 
                  selectedUser.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedUser.role === 'admin' ? 'مدير' : 
                   selectedUser.role === 'teacher' ? 'مدرس' : 
                   'طالب'}
                </span>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">البريد الإلكتروني:</span>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">اسم المستخدم:</span>
                  <span>{selectedUser.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">تاريخ التسجيل:</span>
                  <span>{new Date(selectedUser.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
                
                {selectedUser.bio && (
                  <div className="pt-2">
                    <span className="font-semibold block mb-1">نبذة:</span>
                    <p className="text-gray-700 text-sm">{selectedUser.bio}</p>
                  </div>
                )}
                
                {selectedUser.experience && (
                  <div className="pt-2">
                    <span className="font-semibold block mb-1">الخبرة:</span>
                    <p className="text-gray-700 text-sm">{selectedUser.experience}</p>
                  </div>
                )}
                
                {selectedUser.role === 'teacher' && (
                  <div className="pt-2">
                    <span className="font-semibold block mb-1">الدورات:</span>
                    <span className="text-primary font-medium">
                      {courses?.filter(c => c.teacherId === selectedUser.id).length || 0} دورة
                    </span>
                  </div>
                )}
                
                {selectedUser.role === 'student' && (
                  <div className="pt-2">
                    <span className="font-semibold block mb-1">التسجيلات:</span>
                    <span className="text-primary font-medium">
                      {/* In a real app, you'd get the student's enrollments count */}
                      {selectedUser.enrollmentsCount || 0} دورة
                    </span>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewingUser(false)}
                >
                  إغلاق
                </Button>
                {selectedUser.role !== 'admin' && (
                  <Button 
                    variant="destructive"
                  >
                    حظر المستخدم
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-500">لم يتم العثور على بيانات المستخدم</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
};

export default AdminDashboard;
