import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/auth-context';
import Header from '../../components/header';
import Footer from '../../components/footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");
  
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['/api/enrollments'],
  });
  
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages'],
  });

  const isLoading = enrollmentsLoading || messagesLoading;

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
        <title>لوحة التحكم | قاسيون إكسترا</title>
        <meta name="description" content="لوحة تحكم الطالب في منصة قاسيون إكسترا التعليمية" />
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
                  <CardDescription>طالب</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant={activeTab === "courses" ? "default" : "ghost"} 
                      className={activeTab === "courses" ? "bg-primary hover:bg-primary/90" : ""}
                      onClick={() => setActiveTab("courses")}
                    >
                      <i className="fas fa-book ml-2"></i>
                      الدورات المسجلة
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
                <CardHeader>
                  <CardTitle>
                    {activeTab === "courses" && "الدورات المسجلة"}
                    {activeTab === "messages" && "الرسائل"}
                    {activeTab === "profile" && "الملف الشخصي"}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === "courses" && "إدارة الدورات التي قمت بالتسجيل فيها"}
                    {activeTab === "messages" && "تواصل مع المدرسين وإدارة الرسائل"}
                    {activeTab === "profile" && "عرض وتعديل معلومات الملف الشخصي"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeTab === "courses" && (
                    <div>
                      {!enrollments || enrollments.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="text-5xl mb-4 text-gray-300"><i className="fas fa-book"></i></div>
                          <h3 className="text-xl font-bold mb-2">لم تسجل في أي دورة بعد</h3>
                          <p className="text-gray-600 mb-4">ابدأ رحلة التعلم من خلال التسجيل في دورة تناسب اهتماماتك</p>
                          <Button 
                            className="bg-primary hover:bg-accent text-white"
                            onClick={() => window.location.href = '/courses'}
                          >
                            استعراض الدورات
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {enrollments.map(enrollment => (
                            <div key={enrollment.id} className="border rounded-lg p-4 hover:shadow-md transition">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                <h3 className="font-bold text-lg mb-2 md:mb-0">{enrollment.courseTitle || `دورة #${enrollment.courseId}`}</h3>
                                <Button
                                  variant="outline" 
                                  className="text-primary border-primary"
                                  onClick={() => window.location.href = `/courses/${enrollment.courseId}`}
                                >
                                  الذهاب للدورة
                                </Button>
                              </div>
                              <div className="mb-3">
                                <p className="text-sm text-gray-500 mb-1">نسبة الإنجاز</p>
                                <Progress 
                                  value={enrollment.progress || 0} 
                                  className="h-2"
                                />
                                <div className="flex justify-between mt-1 text-xs text-gray-500">
                                  <span>0%</span>
                                  <span>{enrollment.progress || 0}%</span>
                                  <span>100%</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  تاريخ التسجيل: {new Date(enrollment.enrolledAt).toLocaleDateString('ar-SA')}
                                </span>
                                <span className={`text-sm ${enrollment.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} px-2 py-1 rounded`}>
                                  {enrollment.isCompleted ? 'مكتملة' : 'قيد التعلم'}
                                </span>
                              </div>
                            </div>
                          ))}
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
                          <p className="text-gray-600">ستظهر هنا الرسائل المتبادلة مع المدرسين</p>
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
      
      <Footer />
    </>
  );
};

export default StudentDashboard;
