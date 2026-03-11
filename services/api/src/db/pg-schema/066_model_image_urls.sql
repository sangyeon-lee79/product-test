-- 066: Seed product image URLs for feed and supplement models
-- Sources: Official manufacturer sites, Shopify CDN, Salsify CDN, Taste of the Wild CDN
-- Products without confirmed URLs left as NULL; admin can set via Image URL input

-- ── Ziwi Peak ──────────────────────────────────────────────
UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0727/9850/3211/files/ZIWI-Peak-Originals-DogVenison454g-LeftAngle.png?v=1717482781'
  WHERE id = '9672e57c6f881678119fff4d3527b8bf'; -- Ziwi Peak Air-Dried Venison Dog

UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0727/9850/3211/files/ZIWI-Peak-Originals-DogBeef454g-LeftAngle.png?v=1717482781'
  WHERE id = '5b71b6f3b7d0919b8e6f9e60cf01e78b'; -- Ziwi Peak Air-Dried Beef Dog

UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0727/9850/3211/files/ZIWI-Peak-Originals-CatLamb400g-LeftAngle.png?v=1717482781'
  WHERE id = 'e748349522542456e93ff18d6288a334'; -- Ziwi Peak Air-Dried Lamb Cat

UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0727/9850/3211/files/ZIWI-Peak-Originals-DogMackerelLamb454g-LeftAngle.png?v=1717482781'
  WHERE id = 'b6b6c790635e5161294c648a777aeee6'; -- Ziwi Peak Air-Dried Mackerel & Lamb Dog

UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0727/9850/3211/files/ZIWI-Peak-Originals-DogVenisonCanned390g-Face.png?v=1717482781'
  WHERE id = '993e41c020bfd1a8c397da49b71275c3'; -- Ziwi Peak Canned Venison Dog

UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0727/9850/3211/files/ZIWI-Peak-Originals-CatBeefCanned185g-Face.png?v=1717482781'
  WHERE id = '8f142f025ee8d9b57bf647e3dd09cc5a'; -- Ziwi Peak Canned Beef Cat

-- ── Open Farm ──────────────────────────────────────────────
UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0016/2509/6305/products/PDPImages-DryDog-Main-2022-BEEF-FOP.png?v=1667853063'
  WHERE id = '0046e91d388d408bade4b3f4beeeae7c'; -- Open Farm Grass-Fed Beef Dry Dog

UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0016/2509/6305/products/PDPImages-DryDog-Main-2022-SALMON-FOP.png?v=1667853856'
  WHERE id = '48127bf9d2dec249afbd5f4bd8c7ce8c'; -- Open Farm Wild-Catch Salmon Dry Dog

UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0016/2509/6305/products/PDPImages-DryCat-Turkey-FOP.png?v=1678377748'
  WHERE id = '94169fbc2e383f20276187cdf7c1e1e5'; -- Open Farm Homestead Turkey & Chicken Dry Cat

UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0016/2509/6305/files/PDP-Images-RS-Main-2023-Beef-FOP.png?v=1697140850'
  WHERE id = '0ec264997135ba6d89157eec7e4a4828'; -- Open Farm Grass-Fed Beef Rustic Blend Wet Dog

UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0016/2509/6305/files/PDP-Images-RB-Main-2023-Chicken-FOP.png?v=1697140162'
  WHERE id = 'de2e838c42fe30971b87d14745c592f6'; -- Open Farm Harvest Chicken Rustic Stew Wet Cat

-- ── Taste of the Wild ──────────────────────────────────────
UPDATE feed_models SET image_url = 'https://www.tasteofthewildpetfood.com/wp-content/uploads/2024/10/high-prairie-dry-canine-recipe-011526.png'
  WHERE id = '6c804a7b2780448828aea10909347857'; -- High Prairie Bison & Venison Dry Dog

UPDATE feed_models SET image_url = 'https://www.tasteofthewildpetfood.com/wp-content/uploads/2025/01/pacific-stream-canine-dry-recipe-bag-front-061022.webp'
  WHERE id = '14a41da81206c9e83cf494ee6b02e6db'; -- Pacific Stream Smoked Salmon Dry Dog

UPDATE feed_models SET image_url = 'https://www.tasteofthewildpetfood.com/wp-content/uploads/2025/01/canyon-river-feline-dry-recipe-bag-front-061022.webp'
  WHERE id = 'e72d44d4c8a64994dfe2087c8e9981bf'; -- Canyon River Trout & Smoked Salmon Dry Cat

UPDATE feed_models SET image_url = 'https://www.tasteofthewildpetfood.com/wp-content/uploads/2025/01/sierra-mountain-canine-recipe-bag-front-030326.png'
  WHERE id = 'ccc361475ea6ebed7e6ce7858b77123e'; -- Sierra Mountain Lamb Dry Dog

UPDATE feed_models SET image_url = 'https://www.tasteofthewildpetfood.com/wp-content/uploads/2025/01/wetlands-dry-canine-recipe.webp'
  WHERE id = 'c3da05176ece3791c93eebbd238a5f33'; -- Wetlands Roasted Fowl Dry Dog

UPDATE feed_models SET image_url = 'https://www.tasteofthewildpetfood.com/wp-content/uploads/2025/01/taste-of-the-wild-high-prairie-canine-can-front-100920.webp'
  WHERE id = '5f1613fb343b8291f36528a4c074f57e'; -- High Prairie Can Dog

UPDATE feed_models SET image_url = 'https://www.tasteofthewildpetfood.com/wp-content/uploads/2025/01/pacific-stream-can-canine-formula.webp'
  WHERE id = '86e8ee0bc8548d37a19273b16d6c56ac'; -- Pacific Stream Can Dog

-- ── Wellness ───────────────────────────────────────────────
UPDATE feed_models SET image_url = 'https://images.salsify.com/image/upload/s--esA4k2FV--/w_500/uhrqyxhfotijusb6yyyk.jpg'
  WHERE id = '42fcf6f8dc310296aa9f394e73a28531'; -- Wellness CORE Original Turkey & Chicken Dry Dog

UPDATE feed_models SET image_url = 'https://images.salsify.com/image/upload/s--fkcqg-3z--/w_500/htuizijrbvbhpnqlbpgt.jpg'
  WHERE id = '4a95414c6e8e866b154ac4a8a8c5b6f6'; -- Wellness CORE Indoor Dry Cat

UPDATE feed_models SET image_url = 'https://images.salsify.com/image/upload/s--2vkyGUIU--/w_500/n5vklq5jqx73pqkkmsyl.jpg'
  WHERE id = 'e67508bf3e5d2ac0e1b1231a83c5af04'; -- Wellness CORE Small Breed Dry Dog

UPDATE feed_models SET image_url = 'https://images.salsify.com/image/upload/s--gzqf4Lwb--/w_500/rwzwfxfxuiciclunt7gd.png'
  WHERE id = 'f33c85ac3ae831b5574556766da338e5'; -- Wellness Complete Health Adult Chicken & Oatmeal Dry Dog

UPDATE feed_models SET image_url = 'https://images.salsify.com/image/upload/s--D1yEDxv2--/w_500/sqvf8p3bgxgyllf0djfg.jpg'
  WHERE id = '22165166695274ccb72396c3d5328ddf'; -- Wellness Complete Health Indoor Healthy Weight Dry Cat

UPDATE feed_models SET image_url = 'https://images.salsify.com/image/upload/s--2cBi5CC---/w_500/ubicpquzs15e8vikylpu.jpg'
  WHERE id = '46992bf015a7f5bbb06b0756879c2aa3'; -- Wellness Complete Health Small Breed Turkey & Oatmeal Dry Dog

UPDATE feed_models SET image_url = 'https://images.salsify.com/image/upload/s--_a1FpmOz--/w_500/brzchmvfkesytt9wfmzs.jpg'
  WHERE id = 'ff94ff550b82522411b477eea53745a0'; -- Wellness Simple Salmon & Potato Dry Dog

UPDATE feed_models SET image_url = 'https://images.salsify.com/image/upload/s--FtHGwUKN--/w_500/xxevlrbalsyxvvilgyhl.jpg'
  WHERE id = '57c54c08fdd95e8b74f6580b2ea2a637'; -- Wellness Simple Turkey & Potato Dry Dog

-- ── Supplements: Zesty Paws ────────────────────────────────
UPDATE feed_models SET image_url = 'https://cdn.shopify.com/s/files/1/0812/2615/files/API_3.0_SkinCoat_Chicken_90-250ct_1_Hero-900x900-c4cc11b.png?v=1757961713'
  WHERE id = 'cc09d0e1f2a3b4c5d6e7f8a9b0c1d2e3'; -- Zesty Paws Omega Bites Dog

-- NOTE: Remaining models (Purina, Farmina, Instinct, Stella & Chewy's, Cosequin, GlycoFlex,
-- FortiFlora, Proviable, Nordic Naturals, Vetri-Science, Welactin, Rx supplements, Open Farm FD Raw)
-- left as NULL. Admin can set image URLs via the Image URL input in the catalog management UI.
