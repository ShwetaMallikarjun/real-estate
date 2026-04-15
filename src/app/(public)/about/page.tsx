import { Building2, Users, Target, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Tentang Kami</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Platform properti terpercaya yang menghubungkan pembeli, penyewa, dan agent properti profesional
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-blue-50 p-8 rounded-lg">
          <Target className="w-10 h-10 text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Misi Kami</h2>
          <p className="text-gray-700">
            Menyediakan platform properti yang transparan, mudah digunakan, dan terpercaya untuk membantu
            masyarakat Indonesia menemukan properti impian mereka dengan mudah dan aman.
          </p>
        </div>
        <div className="bg-green-50 p-8 rounded-lg">
          <Shield className="w-10 h-10 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold mb-3">Visi Kami</h2>
          <p className="text-gray-700">
            Menjadi platform properti nomor satu di Indonesia yang mengedepankan kepercayaan,
            inovasi teknologi, dan pelayanan terbaik bagi seluruh stakeholder.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Mengapa Memilih Kami?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Properti Terverifikasi</h3>
            <p className="text-gray-600">Semua properti telah diverifikasi oleh tim kami untuk memastikan keaslian dan kualitas informasi.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Agent Profesional</h3>
            <p className="text-gray-600">Agent kami berpengalaman dan siap membantu Anda menemukan properti yang sesuai kebutuhan.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Transaksi Aman</h3>
            <p className="text-gray-600">Proses transaksi yang transparan dan aman dengan pendampingan dari awal hingga akhir.</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Hubungi Kami</h2>
        <p className="text-gray-600 mb-4">Ada pertanyaan? Jangan ragu untuk menghubungi tim kami.</p>
        <div className="space-y-2 text-gray-700">
          <p>Email: info@realestate.com</p>
          <p>Telepon: (021) 1234-5678</p>
          <p>Alamat: Jakarta, Indonesia</p>
        </div>
      </div>
    </div>
  );
}
