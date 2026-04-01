const stats = [
  { icon: 'ri-article-line', value: '12,400+', label: 'Bài viết', color: '#2563EB' },
  { icon: 'ri-user-line', value: '3.2 triệu', label: 'Độc giả', color: '#059669' },
  { icon: 'ri-quill-pen-line', value: '480+', label: 'Phóng viên', color: '#EA580C' },
  { icon: 'ri-global-line', value: '60+', label: 'Quốc gia', color: '#9333EA' },
];

export default function HomeStats() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(stat => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl mb-1" style={{ backgroundColor: stat.color + '20' }}>
                <i className={`${stat.icon} text-2xl`} style={{ color: stat.color }}></i>
              </div>
              <span className="text-white text-3xl font-black">{stat.value}</span>
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
