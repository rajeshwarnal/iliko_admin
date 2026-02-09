import React from 'react';
import { HelpCircle, Plus } from 'lucide-react';

const AdminCMSHelp = () => {
  const faqs = [
    { q: 'How do I earn points?', a: 'Make purchases at participating merchants to earn points.' },
    { q: 'How do I redeem points?', a: 'Show your QR code to the merchant and choose to redeem points.' },
    { q: 'Do points expire?', a: 'Points expire after 12 months of inactivity.' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Help & Support</h1><p className="text-gray-600 mt-1">Manage FAQ and support content</p></div>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4"/>Add FAQ</button>
      </div>
      <div className="space-y-4">{faqs.map((faq, i) => (
        <div key={i} className="card"><h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary-600"/>{faq.q}</h3><p className="text-gray-600 ml-7">{faq.a}</p><div className="flex gap-2 mt-4"><button className="btn-secondary text-sm">Edit</button><button className="btn-secondary text-sm text-red-600">Delete</button></div></div>
      ))}</div>
    </div>
  );
};

export default AdminCMSHelp;
