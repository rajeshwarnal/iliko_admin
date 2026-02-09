
import React, { useState } from 'react';
import { Gift, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';

const AdminPromos = () => {
  const promos = [
    { id: 1, title: '10% Off Everything', merchant: 'The Coffee House', priority: 1, redemptions: 245, status: 'active', expiry: '2024-12-31' },
    { id: 2, title: 'Buy 2 Get 1 Free', merchant: 'Fashion Store', priority: 2, redemptions: 189, status: 'active', expiry: '2024-11-30' },
    { id: 3, title: 'Happy Hour 50% Off', merchant: 'Restaurant Plaza', priority: 3, redemptions: 134, status: 'active', expiry: '2024-12-15' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotional Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage and prioritize merchant promos</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Set Priority
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Promos', value: promos.length, icon: Gift, color: 'blue' },
          { label: 'Active', value: promos.filter(p => p.status === 'active').length, icon: TrendingUp, color: 'green' },
          { label: 'Total Redemptions', value: promos.reduce((sum, p) => sum + p.redemptions, 0), icon: Gift, color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Priority</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Promo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Merchant</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Redemptions</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Expiry</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {promos.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold">
                    {promo.priority}
                  </span>
                </td>
                <td className="py-4 px-4 font-medium">{promo.title}</td>
                <td className="py-4 px-4">{promo.merchant}</td>
                <td className="py-4 px-4">{promo.redemptions}</td>
                <td className="py-4 px-4">{promo.expiry}</td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromos;
