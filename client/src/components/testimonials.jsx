const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "أحمد محمود",
      role: "طالب ثانوية عامة",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48",
      rating: 5,
      text: "دورة الرياضيات المتقدمة ساعدتني كثيراً في فهم المفاهيم الصعبة. الأستاذة سارة لديها أسلوب رائع في الشرح والتبسيط. أنصح بشدة بهذه المنصة!"
    },
    {
      id: 2,
      name: "نور عبد الله",
      role: "طالبة جامعية",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48",
      rating: 4.5,
      text: "المنصة سهلة الاستخدام والمحتوى التعليمي ممتاز. استفدت كثيراً من دورة اللغة الإنجليزية، والتواصل المباشر مع الأستاذة ليلى كان مفيداً جداً."
    },
    {
      id: 3,
      name: "عمر سليمان",
      role: "طالب إعدادي",
      image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48",
      rating: 5,
      text: "أسلوب الشرح مميز والفيديوهات واضحة جداً. الاختبارات التفاعلية ساعدتني على قياس مستواي. شكراً لقاسيون إكسترا على هذه المنصة الرائعة!"
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`star-${i}`} className="fas fa-star text-yellow-400"></i>);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<i key="half-star" className="fas fa-star-half-alt text-yellow-400"></i>);
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-star-${i}`} className="far fa-star text-yellow-400"></i>);
    }

    return stars;
  };

  return (
    <section className="py-12 bg-primary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">ماذا يقول طلابنا</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full" 
                />
                <div className="mr-3">
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex mb-1">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              <p className="text-gray-700">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
