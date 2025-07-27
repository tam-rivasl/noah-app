const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

function timeToSec(t) {
  if (!t) return 0;
  const [m, s] = t.split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
}

async function cleanupGameScores() {
  const { data: allTypes, error } = await supabase.from('game_scores').select('game_type');
  if (error) throw error;
  const types = [...new Set((allTypes || []).map(t => t.game_type))];
  for (const type of types) {
    const { data: all } = await supabase
      .from('game_scores')
      .select('id,time')
      .eq('game_type', type);
    const sorted = (all || [])
      .sort((a, b) => timeToSec(b.time) - timeToSec(a.time))
      .slice(0, 10);
    const keepIds = sorted.map(r => r.id);
    const idsToDelete = (all || []).map(r => r.id).filter(id => !keepIds.includes(id));
    if (idsToDelete.length) {
      await supabase.from('game_scores').delete().in('id', idsToDelete);
    }
  }
}

async function cleanupNoaStats() {
  const { data: all } = await supabase
    .from('noa_stats')
    .select('id')
    .order('updated_at', { ascending: false });
  const keep = (all || []).slice(0, 10).map(r => r.id);
  const toDelete = (all || []).map(r => r.id).filter(id => !keep.includes(id));
  if (toDelete.length) {
    await supabase.from('noa_stats').delete().in('id', toDelete);
  }
}

(async () => {
  try {
    await cleanupGameScores();
    await cleanupNoaStats();
    console.log('Cleanup completed');
  } catch (e) {
    console.error('Cleanup error:', e);
    process.exit(1);
  }
})();
