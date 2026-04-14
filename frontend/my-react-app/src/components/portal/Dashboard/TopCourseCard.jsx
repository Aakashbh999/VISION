import { BookOpen, Palette, Monitor } from "lucide-react";

const courses = [
  {
    name: "History of graphic design",
    price: "$120",
    sales: "256 Sale",
    icon: BookOpen,
    color: "bg-orange-100 text-orange-500",
  },
  {
    name: "Digital Painting",
    price: "$60",
    sales: "120 Sale",
    icon: Palette,
    color: "bg-blue-100 text-blue-500",
  },
  {
    name: "App Design Course",
    price: "$250",
    sales: "100 Sale",
    icon: Monitor,
    color: "bg-green-100 text-green-500",
  },
];

export default function TopCourseCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 h-full">
      <h3 className="text-base font-bold mb-4 text-gray-900 dark:text-white">
        Top Course
      </h3>
      <div className="space-y-4">
        {courses.map((course, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span
              className={`w-10 h-10 flex items-center justify-center rounded-xl ${course.color}`}
            >
              <course.icon className="w-5 h-5" />
            </span>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white">
                {course.name}
              </div>
              <div className="text-xs text-gray-400 dark:text-slate-400">
                {course.sales}
              </div>
            </div>
            <div className="font-bold text-green-500">{course.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
