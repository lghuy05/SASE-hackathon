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
      abc
    </div>
  );
}