-- 069: Seed product image URLs — Phase 2
-- Covers Royal Canin, Hill's, Orijen, supplements, and devices
-- Sources: Official manufacturer sites (royalcanin.com, hillspet.com, orijenpetfoods.com,
--   cosequin.com, vetriscience.com, proviable.com, accu-chek.com)
-- Products without confirmed URLs left as NULL; admin can set via Image URL input

-- ── Royal Canin (003 seed) ───────────────────────────────────
UPDATE feed_models SET image_url = 'https://p1.aprimocdn.net/marspetcare/df3203cc-552f-4cf0-83ef-b3e7010fe64d/df3203cc-552f-4cf0-83ef-b3e7010fe64d_DownloadAsJpg.jpg'
  WHERE id = 'f6f6a6ce8da79dd3be87b9a7b21f7fca' AND image_url IS NULL;
  -- Royal Canin Small Adult Dry 14lb

UPDATE feed_models SET image_url = 'https://p1.aprimocdn.net/marspetcare/2ac9bc44-82ec-4db1-babf-b249000707aa/2ac9bc44-82ec-4db1-babf-b249000707aa_DownloadAsJpg.jpg'
  WHERE id = 'bc7f9c875687e6d953b825046f7ab560' AND image_url IS NULL;
  -- Royal Canin Medium Adult Dry 30lb

UPDATE feed_models SET image_url = 'https://cdn.royalcanin-weshare-online.io/dj88vYcBRYZmsWpcS_hJ/v15/center-front-hero-image-2529-030111628084-cat-01-jpg'
  WHERE id = '117cc5cc22e7af6c3a712d0ed0dbfbe5' AND image_url IS NULL;
  -- Royal Canin Indoor Adult Cat Dry 15lb

UPDATE feed_models SET image_url = 'https://p1.aprimocdn.net/marspetcare/effaeb6a-937c-4f79-9327-b313016a889d/effaeb6a-937c-4f79-9327-b313016a889d_DownloadAsJpg.jpg'
  WHERE id = 'e86efef6887278040e9c5638c4770f57' AND image_url IS NULL;
  -- Royal Canin Large Adult Dry 40lb

UPDATE feed_models SET image_url = 'https://p1.aprimocdn.net/marspetcare/29b78731-e132-40c2-90a9-b1ef000edbdd/29b78731-e132-40c2-90a9-b1ef000edbdd_DownloadAsJpg.jpg'
  WHERE id = 'e51acd01341618f88ed8b88719e27cdf' AND image_url IS NULL;
  -- Royal Canin GI Low Fat Dry 17.6lb

-- ── Hill's Science Diet (003 seed) ───────────────────────────
UPDATE feed_models SET image_url = 'https://pxmshare.colgatepalmolive.com/PNG_500/8QGSStOoCB6RakdoYx2np.png'
  WHERE id = '129f361f2353fc4497213c84b823de63' AND image_url IS NULL;
  -- Hill's SD Adult Chicken & Barley Dry 45lb

UPDATE feed_models SET image_url = 'https://pxmshare.colgatepalmolive.com/PNG_500/Yuqtz42jJdEVL_xWjeRhP.png'
  WHERE id = 'c58723a3039ed0b2af4baaf1b52cf077' AND image_url IS NULL;
  -- Hill's SD Puppy Chicken & Brown Rice Dry 15.5lb

UPDATE feed_models SET image_url = 'https://pxmshare.colgatepalmolive.com/PNG_500/X6hnJNkXlKozcpey-P9Ac.png'
  WHERE id = '60ddcdb36f7b4d3fe27b35ddd4f7c772' AND image_url IS NULL;
  -- Hill's SD Adult Small Bites Chicken & Barley Dry 15lb

UPDATE feed_models SET image_url = 'https://pxmshare.colgatepalmolive.com/PNG_500/X6wA32drIZK34-IA_fMX4.png'
  WHERE id = '5c76dcd7b4cbb65e0ddf4aef667a2c9f' AND image_url IS NULL;
  -- Hill's SD Adult Light Small Bites Dry 15lb

UPDATE feed_models SET image_url = 'https://pxmshare.colgatepalmolive.com/PNG_500/Q-dXTWwXXr-zViGdkry3t.png'
  WHERE id = '8c22fce8c776e839a55c050c8cc5a057' AND image_url IS NULL;
  -- Hill's PD c/d Multicare Urinary + Metabolic Dry 24.5lb

-- ── Orijen (003 seed) ────────────────────────────────────────
UPDATE feed_models SET image_url = 'https://www.orijenpetfoods.com/dw/image/v2/BFDW_PRD/on/demandware.static/-/Sites-orijen-na-master-catalog/default/dw3a5e4059/ORI Dog Refresh 2023/Original-2023/Original Dog 31lb Front EN.png?sw=450'
  WHERE id = 'd0dc5d77cbe93deeb1baa571b9bc59e2' AND image_url IS NULL;
  -- Orijen Original Dry Dog 23.5lb

UPDATE feed_models SET image_url = 'https://www.orijenpetfoods.com/dw/image/v2/BFDW_PRD/on/demandware.static/-/Sites-orijen-na-master-catalog/default/dw60eb5cc8/ORI Dog Refresh 2023/Six-Fish-2023/ORIJEN Six Fish Recipe Dog 13lb Front USA.png?sw=450'
  WHERE id = 'f4bec9f6e33de4a551f93b9db924d33d' AND image_url IS NULL;
  -- Orijen Six Fish Dry Dog 23.5lb

UPDATE feed_models SET image_url = 'https://www.orijenpetfoods.com/dw/image/v2/BFDW_PRD/on/demandware.static/-/Sites-orijen-na-master-catalog/default/dw1e4c7ee6/ORI Dog Refresh 2023/Regional-Red-2023/ORI Dog Regional Red PDP-1.png?sw=450'
  WHERE id = '160fd0741ea2c793cc1cfac657d600a4' AND image_url IS NULL;
  -- Orijen Regional Red Dry Dog 23.5lb

UPDATE feed_models SET image_url = 'https://www.orijenpetfoods.com/dw/image/v2/BFDW_PRD/on/demandware.static/-/Sites-orijen-na-master-catalog/default/dw80435671/ORI Dog Refresh 2023/Puppy-2023/ORIJEN Puppy 13lb Front USA.png?sw=450'
  WHERE id = 'a3c33fa73c719ebb94ea2bc09174e8de' AND image_url IS NULL;
  -- Orijen Puppy Dry Dog 23.5lb

UPDATE feed_models SET image_url = 'https://www.orijenpetfoods.com/dw/image/v2/BFDW_PRD/on/demandware.static/-/Sites-orijen-na-master-catalog/default/dw63babdea/ORI Cat Refresh 2023/Original/ORI Original Cat PDP-1A.png?sw=450'
  WHERE id = '9d73e4a1da8fd6a6a3879e5493ec095e' AND image_url IS NULL;
  -- Orijen Cat & Kitten Dry Cat 12lb

-- ── Supplements ──────────────────────────────────────────────
UPDATE feed_models SET image_url = 'https://cdn.nutramax.com/cosequin.com/images/CHEWDS60-MSMOP-Front-r2_640.png'
  WHERE id = 'aa01b2c3d4e5f6a7b8c9d0e1f2a3b4c5' AND image_url IS NULL;
  -- Cosequin DS Plus MSM

UPDATE feed_models SET image_url = 'https://store.cosequin.com/cdn/shop/files/00.1172.14_9000445_Bottle_Front-125mm.jpg?v=1769023265'
  WHERE id = 'bb02c3d4e5f6a7b8c9d0e1f2a3b4c5d6' AND image_url IS NULL;
  -- Cosequin Maximum Strength

UPDATE feed_models SET image_url = 'https://www.vetriscience.com/media/catalog/product/cache/dec6facfdaedf056c84e7feb27cac38b/0/9/0900569.120_f_2.jpg'
  WHERE id = 'dd04e5f6a7b8c9d0e1f2a3b4c5d6e7f8' AND image_url IS NULL;
  -- GlycoFlex Stage 3

UPDATE feed_models SET image_url = 'https://d6ac4rx1taq9.cloudfront.net/img/proviable-dc-cat-dog-80.png'
  WHERE id = 'aa07b8c9d0e1f2a3b4c5d6e7f8a9b0c1' AND image_url IS NULL;
  -- Proviable-DC

UPDATE feed_models SET image_url = 'https://d6ac4rx1taq9.cloudfront.net/images/Proviable-Forte-45ct-Capsule-Carton.png'
  WHERE id = 'bb08c9d0e1f2a3b4c5d6e7f8a9b0c1d2' AND image_url IS NULL;
  -- Proviable Forte

-- ── Devices ──────────────────────────────────────────────────
UPDATE device_models SET image_url = 'https://www.accu-chek.com/sites/g/files/papvje226/files/2023-06/Accu-Chek-Guide-meter-front-500x500_0.png'
  WHERE id = 'mod-accuchek-guide' AND image_url IS NULL;
  -- Accu-Chek Guide

-- NOTE: Remaining models (Acana, Ray & Yvonne, Purina, Farmina, Instinct, Stella & Chewy's,
-- Open Farm FD Raw, FortiFlora, GlycoFlex Stage 1, Nordic Naturals, Welactin,
-- Canine Plus Senior, Rx supplements, FreeStyle Libre, Accu-Chek Active, OneTouch)
-- left as NULL. Admin can set image URLs via the catalog management UI.
