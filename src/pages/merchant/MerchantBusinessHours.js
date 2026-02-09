import React, { useState } from 'react';
import { Clock, Save, Copy, RotateCcw, AlertCircle } from 'lucide-react';

const MerchantBusinessHours = () => {
  const [hours, setHours] = useState([
    { day: 'Monday', open: '09:00', close: '22:00', closed: false },
    { day: 'Tuesday', open: '09:00', close: '22:00', closed: false },
    { day: 'Wednesday', open: '09:00', close: '22:00', closed: false },
    { day: 'Thursday', open: '09:00', close: '22:00', closed: false },
    { day: 'Friday', open: '09:00', close: '23:00', closed: false },
    { day: 'Saturday', open: '10:00', close: '23:00', closed: false },
    { day: 'Sunday', open: '10:00', close: '21:00', closed: false }
  ]);
  const [saving, setSaving] = useState(false);

  const handleTimeChange = (index, field, value) => {
    const newHours = [...hours];
    newHours[index][field] = value;
    setHours(newHours);
  };

  const toggleClosed = (index) => {
    const newHours = [...hours];
    newHours[index].closed = !newHours[index].closed;
    setHours(newHours);
  };

  const copyToAll = (index) => {
    const sourceDay = hours[index];
    const newHours = hours.map(h => ({
      ...h,
      open: sourceDay.open,
      close: sourceDay.close,
      closed: sourceDay.closed
    }));
    setHours(newHours);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Business hours updated successfully!');
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Hours</h1>
          <p className="text-gray-600 mt-1">Set your operating schedule</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Important:</p>
          <p>Your business hours will be displayed to customers. Make sure they're accurate to avoid confusion.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {hours.map((day, index) => (
            <div key={day.day} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
              <div className="w-32 flex-shrink-0">
                <label className="font-semibold text-gray-700">{day.day}</label>
              </div>
              
              {!day.closed ? (
                <div className="flex flex-wrap items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      value={day.open}
                      onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={() => copyToAll(index)}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    title="Copy to all days"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy to all</span>
                  </button>
                </div>
              ) : (
                <div className="flex-1">
                  <span className="text-red-600 font-semibold">Closed</span>
                </div>
              )}
              
              <button
                onClick={() => toggleClosed(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  day.closed 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {day.closed ? 'Set Open' : 'Set Closed'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                const newHours = hours.map(h => ({ ...h, open: '09:00', close: '17:00', closed: false }));
                setHours(newHours);
              }}
              className="w-full border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-lg text-left"
            >
              <div className="font-semibold">Set Standard Hours</div>
              <div className="text-sm text-gray-600">9:00 AM - 5:00 PM (All days)</div>
            </button>
            <button
              onClick={() => {
                const newHours = hours.map((h, i) => ({
                  ...h,
                  closed: i === 6
                }));
                setHours(newHours);
              }}
              className="w-full border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-lg text-left"
            >
              <div className="font-semibold">Weekdays Only</div>
              <div className="text-sm text-gray-600">Closed on Sundays</div>
            </button>
            <button
              onClick={() => {
                const newHours = hours.map(h => ({ ...h, open: '00:00', close: '23:59', closed: false }));
                setHours(newHours);
              }}
              className="w-full border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-lg text-left"
            >
              <div className="font-semibold">24/7 Operation</div>
              <div className="text-sm text-gray-600">Always open</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4">Weekly Summary</h3>
          <div className="space-y-2">
            {hours.map(day => (
              <div key={day.day} className="flex justify-between text-sm">
                <span className="font-medium">{day.day.substring(0, 3)}</span>
                <span className={day.closed ? 'text-red-600' : 'text-gray-600'}>
                  {day.closed ? 'Closed' : `${day.open} - ${day.close}`}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Total Hours/Week:</span>
              <span className="font-bold text-blue-600">
                {hours.reduce((total, day) => {
                  if (day.closed) return total;
                  const [oh, om] = day.open.split(':').map(Number);
                  const [ch, cm] = day.close.split(':').map(Number);
                  return total + ((ch * 60 + cm) - (oh * 60 + om)) / 60;
                }, 0).toFixed(1)} hrs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantBusinessHours;