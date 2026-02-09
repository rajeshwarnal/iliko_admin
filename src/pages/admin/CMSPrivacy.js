import React, { useState } from 'react';
import { Shield, Save, Eye } from 'lucide-react';

const AdminCMSPrivacy = () => {
  const [content, setContent] = useState(`# Privacy Policy

## Information We Collect
We collect information you provide directly to us when you create an account, make a purchase, or participate in our loyalty program.

## How We Use Your Information
- To provide and maintain our services
- To process your transactions
- To send you promotional communications
- To improve our services

## Information Sharing
We do not sell your personal information. We may share your information with service providers who assist us.

## Data Security
We implement appropriate security measures to protect your personal information.

## Your Rights
You have the right to access, correct, or delete your personal information.

## Contact Us
For privacy concerns, contact us at privacy@loyaltysystem.com

Last updated: November 2024`);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Privacy Policy</h1><p className="text-gray-600 mt-1">Edit your privacy policy</p></div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2"><Eye className="w-4 h-4"/>Preview</button>
          <button className="btn-primary flex items-center gap-2"><Save className="w-4 h-4"/>Save Changes</button>
        </div>
      </div>
      <div className="card"><textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-field font-mono text-sm" rows={18} /></div>
    </div>
  );
};

export default AdminCMSPrivacy;
