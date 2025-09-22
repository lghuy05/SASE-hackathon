// import { createClient } from '@/lib/supabase/client';


// export default async function Instruments() {
//   const supabase = createClient();

//   // 👇 tell Supabase that we expect an array of Instrument
//   const { data: instruments, error } = await supabase
//     .from("instruments")
//     .select();

//   if (error) {
//     console.error("Error fetching instruments:", error);
//     return <div>Error fetching instruments</div>;
//   }

//   return (
//     <div>
//       <pre>{JSON.stringify(instruments, null, 2)}</pre>
//     </div>
//   );
// }


'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

export default function Instruments() {
  const [instruments, setInstruments] = useState([]);
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  
  const supabase = createClient();

  // Fetch instruments
  const fetchInstruments = async () => {
    const { data, error } = await supabase
      .from("instruments")
      .select()
      .order('id', { ascending: false });

    if (error) {
      console.error("Error fetching instruments:", error);
      return;
    }

    setInstruments(data || []);
  };

  // Add new instrument
  const addInstrument = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setAdding(true);
    
    const { data, error } = await supabase
      .from("instruments")
      .insert([{ name: name.trim() }])
      .select();


    if (error) {
      console.error("Error adding instrument:", error);
    } else {
      setInstruments(prev => [data[0], ...prev]);
      setName('');
    }
    
    setAdding(false);
  };

  useEffect(() => {
    fetchInstruments();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Instruments</h1>
      
      {/* Add Instrument Form */}
      <form onSubmit={addInstrument} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter instrument name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={adding}
          />
          <button
            type="submit"
            disabled={adding || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      {/* Instruments List */}
      <div>
        {instruments.length === 0 ? (
          <p className="text-gray-500">No instruments yet. Add one above!</p>
        ) : (
          <ul className="space-y-2">
            {instruments.map((instrument) => (
              <li key={instrument.id} className="p-3 border border-gray-200 rounded">
                {instrument.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}