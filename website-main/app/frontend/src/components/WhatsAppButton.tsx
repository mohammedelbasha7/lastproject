import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/972527035521"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute left-full mr-3 bg-white text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        דברו איתנו בוואטסאפ
      </span>
    </a>
  );
}