import { createClient } from '@supabase/supabase-js';

// 填你自己的 Supabase API key 和 project URL
const supabase = createClient(
  'https://xxsqyswxsyquvucqpkjl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4c3F5c3d4c3lxdXZ1Y3Fwa2psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzNzM4MCwiZXhwIjoyMDc1NjEzMzgwfQ.BdNAaZ7lnTUld_ugcNhDh28RH-c4wc0xF2zRKZxNyV0' // 用 service_role key 可直接批量寫入
);

async function fixAllSlugs() {
  // 一次批量抓所有 cards（如資料量大，可分批處理）
  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, url_slug');

  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  for (const card of cards) {
    const orig = card.url_slug;
    const decoded = decodeURIComponent(orig);

    // 如果 decode 完跟原本一樣就不做
    if (orig === decoded) continue;

    // 更新資料庫
    const { error: updateError } = await supabase
      .from('cards')
      .update({ url_slug: decoded })
      .eq('id', card.id);

    if (updateError) {
      console.error(`Card ${card.id} update failed:`, updateError);
    } else {
      console.log(`Card ${card.id}: ${orig} → ${decoded}`);
    }
  }
}

fixAllSlugs().then(() => {
  console.log('全部處理完畢！');
});
