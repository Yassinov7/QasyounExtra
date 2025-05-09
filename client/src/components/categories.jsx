import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { getCategoryIcon } from '@/lib/utils';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      href={`/categories/${category.id}`}
      className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-full bg-${category.color || 'primary'}/10 flex items-center justify-center mb-3`}>
        <i className={`${getCategoryIcon(category.icon)} text-${category.color || 'primary'} text-xl`}></i>
      </div>
      <h3 className="font-semibold text-lg text-gray-800">{category.name}</h3>
      <p className="text-gray-500 text-sm text-center mt-1">
        {category.courseCount || 0} دورة
      </p>
    </Link>
  );
};

const Categories = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">استكشف المواد الدراسية</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse mb-3"></div>
                <div className="h-5 w-20 bg-gray-200 animate-pulse mb-2"></div>
                <div className="h-4 w-16 bg-gray-200 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-center mb-8">استكشف المواد الدراسية</h2>
          <p className="text-red-500">حدث خطأ أثناء تحميل التصنيفات. يرجى المحاولة مرة أخرى لاحقًا.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">استكشف المواد الدراسية</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories && categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
