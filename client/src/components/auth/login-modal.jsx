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

const formSchema = z.object({
  email: z.string().email({ message: 'يرجى إدخال بريد إلكتروني صحيح' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل' }),
  rememberMe: z.boolean().optional(),
});

const LoginModal = ({ isOpen, onClose, onSuccess, onShowRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email: data.email,
        password: data.password,
      });
      
      const userData = await response.json();
      onSuccess(userData.user);
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: `مرحباً، ${userData.user.fullName}!`,
      });
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ في تسجيل الدخول',
        description: error.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك وإعادة المحاولة.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">تسجيل الدخول</DialogTitle>
          <DialogDescription>
            أدخل بيانات حسابك للوصول إلى منصة قاسيون إكسترا
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 space-x-reverse">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                      تذكرني
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Button 
                variant="link" 
                className="text-sm px-0 text-primary"
                type="button"
              >
                نسيت كلمة المرور؟
              </Button>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-white" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <i className="fas fa-spinner fa-spin ml-2"></i>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ليس لديك حساب؟{' '}
            <Button 
              variant="link" 
              className="px-0 text-primary"
              onClick={() => {
                onClose();
                onShowRegister();
              }}
            >
              إنشاء حساب
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
