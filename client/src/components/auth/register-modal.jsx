import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  fullName: z.string().min(3, { message: 'الاسم يجب أن يحتوي على 3 أحرف على الأقل' }),
  email: z.string().email({ message: 'يرجى إدخال بريد إلكتروني صحيح' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل' }),
  confirmPassword: z.string(),
  role: z.enum(['student', 'teacher']),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: 'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const RegisterModal = ({ isOpen, onClose, onSuccess, onShowLogin, initialRole = 'student' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: initialRole,
      agreeTerms: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const userData = {
        username: data.email.split('@')[0],
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
        profilePicture: '',
        bio: '',
        experience: '',
      };

      const response = await apiRequest('POST', '/api/auth/register', userData);
      
      const newUser = await response.json();
      
      // Automatically log in the user after registration
      const loginResponse = await apiRequest('POST', '/api/auth/login', {
        email: data.email,
        password: data.password,
      });
      
      const loginData = await loginResponse.json();
      
      onSuccess(loginData.user);
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: `مرحباً، ${newUser.fullName}!`,
      });
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ في إنشاء الحساب',
        description: error.message || 'فشل إنشاء الحساب. يرجى التحقق من بياناتك وإعادة المحاولة.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the role when tab changes
  const handleTabChange = (value) => {
    form.setValue('role', value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">إنشاء حساب</DialogTitle>
          <DialogDescription>
            سجل في منصة قاسيون إكسترا للوصول إلى محتوى تعليمي مميز
          </DialogDescription>
        </DialogHeader>
        
        <Tabs
          defaultValue={initialRole}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="student">طالب</TabsTrigger>
            <TabsTrigger value="teacher">مدرس</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسمك الكامل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل بريدك الإلكتروني" 
                          {...field} 
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="أدخل كلمة المرور" 
                          {...field} 
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="أكد كلمة المرور" 
                          {...field} 
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agreeTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0 space-x-reverse">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                          أوافق على{' '}
                          <a href="/terms" className="text-primary hover:text-accent">
                            شروط الاستخدام
                          </a>{' '}
                          و{' '}
                          <a href="/privacy" className="text-primary hover:text-accent">
                            سياسة الخصوصية
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <i className="fas fa-spinner fa-spin ml-2"></i>
                      جاري إنشاء الحساب...
                    </span>
                  ) : (
                    'إنشاء حساب'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="teacher">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسمك الكامل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل بريدك الإلكتروني" 
                          {...field} 
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="أدخل كلمة المرور" 
                          {...field} 
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="أكد كلمة المرور" 
                          {...field} 
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agreeTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0 space-x-reverse">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                          أوافق على{' '}
                          <a href="/terms" className="text-primary hover:text-accent">
                            شروط الاستخدام
                          </a>{' '}
                          و{' '}
                          <a href="/privacy" className="text-primary hover:text-accent">
                            سياسة الخصوصية
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <i className="fas fa-spinner fa-spin ml-2"></i>
                      جاري إنشاء الحساب...
                    </span>
                  ) : (
                    'إنشاء حساب'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Button 
              variant="link" 
              className="px-0 text-primary"
              onClick={() => {
                onClose();
                onShowLogin();
              }}
            >
              تسجيل الدخول
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
