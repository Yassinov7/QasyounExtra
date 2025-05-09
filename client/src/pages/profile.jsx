import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(3, {
    message: "الاسم الكامل يجب أن يكون 3 أحرف على الأقل",
  }),
  email: z.string().email({
    message: "البريد الإلكتروني غير صالح",
  }),
  bio: z.string().optional(),
  experience: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "كلمة المرور الحالية يجب أن تكون 6 أحرف على الأقل",
  }),
  newPassword: z.string().min(6, {
    message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل",
  }),
  confirmPassword: z.string().min(6, {
    message: "تأكيد كلمة المرور يجب أن تكون 6 أحرف على الأقل",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: userData?.fullName || '',
      email: userData?.email || '',
      bio: userData?.bio || '',
      experience: userData?.experience || '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => apiRequest('PATCH', `/api/users/${userData.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم تحديث بيانات الملف الشخصي بنجاح",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "خطأ!",
        description: error.message || "حدث خطأ أثناء تحديث الملف الشخصي",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', `/api/auth/change-password`, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "خطأ!",
        description: error.message || "حدث خطأ أثناء تغيير كلمة المرور",
      });
    },
  });

  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data) => {
    changePasswordMutation.mutate(data);
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const filePath = `profile-pictures/${userData.id}/${file.name}`;
      const fileUrl = await uploadFile('profiles', filePath, file);
      
      if (fileUrl) {
        await updateProfileMutation.mutateAsync({ profilePicture: fileUrl });
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

  // Update form values when userData changes
  React.useEffect(() => {
    if (userData) {
      profileForm.reset({
        fullName: userData.fullName || '',
        email: userData.email || '',
        bio: userData.bio || '',
        experience: userData.experience || '',
      });
    }
  }, [userData]);

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
        <title>الملف الشخصي | قاسيون إكسترا</title>
        <meta name="description" content="إدارة الملف الشخصي في منصة قاسيون إكسترا التعليمية" />
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Sidebar */}
            <div className="md:w-1/3 w-full">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={userData.profilePicture} />
                        <AvatarFallback className="text-xl">{getInitials(userData.fullName)}</AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor="profile-picture-upload" 
                        className="absolute bottom-0 left-0 bg-primary text-white rounded-full p-1 cursor-pointer hover:bg-accent transition"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <i className="fas fa-camera"></i>
                        )}
                      </label>
                      <input 
                        type="file" 
                        id="profile-picture-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                  
                  <CardTitle>{userData.fullName}</CardTitle>
                  <CardDescription>
                    {userData.role === 'student' ? 'طالب' : 
                     userData.role === 'teacher' ? 'مدرس' : 
                     userData.role === 'admin' ? 'مدير' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">البريد الإلكتروني</h3>
                      <p className="text-gray-600">{userData.email}</p>
                    </div>
                    
                    {userData.role === 'teacher' && userData.experience && (
                      <div>
                        <h3 className="font-semibold">الخبرة</h3>
                        <p className="text-gray-600">{userData.experience}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold">عضو منذ</h3>
                      <p className="text-gray-600">
                        {new Date(userData.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = `/dashboard/${userData.role}`}
                    >
                      انتقل إلى لوحة التحكم
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Profile Settings */}
            <div className="md:w-2/3 w-full">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الحساب</CardTitle>
                  <CardDescription>قم بتعديل معلومات حسابك الشخصي</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="profile">
                    <TabsList className="mb-4">
                      <TabsTrigger value="profile">المعلومات الشخصية</TabsTrigger>
                      <TabsTrigger value="password">تغيير كلمة المرور</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile">
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>الاسم الكامل</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>البريد الإلكتروني</FormLabel>
                                <FormControl>
                                  <Input {...field} readOnly />
                                </FormControl>
                                <FormDescription>
                                  لا يمكن تغيير البريد الإلكتروني
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>نبذة شخصية</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="اكتب نبذة مختصرة عن نفسك" 
                                    rows={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {userData.role === 'teacher' && (
                            <FormField
                              control={profileForm.control}
                              name="experience"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>الخبرة</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="مثال: 5 سنوات في تدريس الرياضيات" 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          
                          <Button 
                            type="submit" 
                            className="bg-primary hover:bg-accent"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? (
                              <span className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                جاري الحفظ...
                              </span>
                            ) : 'حفظ التغييرات'}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                    
                    <TabsContent value="password">
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>كلمة المرور الحالية</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>كلمة المرور الجديدة</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="bg-primary hover:bg-accent"
                            disabled={changePasswordMutation.isPending}
                          >
                            {changePasswordMutation.isPending ? (
                              <span className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                جاري التغيير...
                              </span>
                            ) : 'تغيير كلمة المرور'}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
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

export default Profile;
