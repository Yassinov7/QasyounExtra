const Features = () => {
  const features = [
    {
      icon: "fas fa-chalkboard-teacher",
      title: "نخبة من المدرسين",
      description: "مدرسون محترفون ذوو خبرة عالية في مجالاتهم، مع شهادات معتمدة وتقييمات متميزة من الطلاب",
      color: "primary"
    },
    {
      icon: "fas fa-laptop",
      title: "تعلم تفاعلي",
      description: "دورات تفاعلية مع إمكانية التواصل المباشر مع المدرسين ومشاركة الأسئلة وحل المشكلات",
      color: "secondary"
    },
    {
      icon: "fas fa-clock",
      title: "مرونة في التعلم",
      description: "تعلم في أي وقت ومن أي مكان، مع إمكانية الوصول إلى المحتوى التعليمي على مدار الساعة",
      color: "accent"
    },
    {
      icon: "fas fa-certificate",
      title: "شهادات معتمدة",
      description: "احصل على شهادات إتمام معتمدة بعد إكمال الدورات، يمكن إضافتها إلى سيرتك الذاتية",
      color: "primary"
    },
    {
      icon: "fas fa-comments",
      title: "دعم مستمر",
      description: "فريق دعم متاح لمساعدتك في أي استفسارات أو مشكلات تقنية تواجهك خلال رحلة التعلم",
      color: "secondary"
    },
    {
      icon: "fas fa-file-alt",
      title: "محتوى تعليمي شامل",
      description: "محتوى تعليمي متنوع يشمل فيديوهات وملفات PDF واختبارات تفاعلية ومشاريع عملية",
      color: "accent"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">لماذا تختار قاسيون إكسترا؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full bg-${feature.color}/10 flex items-center justify-center mb-4`}>
                <i className={`${feature.icon} text-${feature.color} text-3xl`}></i>
              </div>
              <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
