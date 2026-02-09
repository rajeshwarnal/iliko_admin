import React, { useState } from 'react';
import { BookOpen, Save } from 'lucide-react';

const AdminCMSRules = () => {
  const [content, setContent] = useState(`# Loyalty Program Rules

## Earning Points
- Earn 1 point for every $1 spent
- Points are awarded immediately after purchase
- Bonus points may be offered during promotions

## Redeeming Points
- 100 points = $1 discount
- Minimum redemption: 500 points
- Points can be redeemed at any participating merchant

## Point Expiration
- Points expire after 12 months of account inactivity
- Expiration notifications sent 30 days in advance

## Tier Benefits
- Bronze: Standard earning rate
- Silver: 1.5x points + 5% discount
- Gold: 2x points + 10% discount
- Platinum: 3x points + 15% discount

## Program Changes
Management reserves the right to modify program rules with 30 days notice.`);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Program Rules</h1><p className="text-gray-600 mt-1">Define loyalty program rules</p></div>
        <button className="btn-primary flex items-center gap-2"><Save className="w-4 h-4"/>Save Changes</button>
      </div>
      <div className="card"><textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-field font-mono text-sm" rows={18} /></div>
    </div>
  );
};

export default AdminCMSRules;
