-- ============================================================
-- Seed: Western Cape Public Hospitals
-- ============================================================

INSERT INTO public.hospitals (name, district) VALUES
  -- City of Cape Town Metro
  ('Groote Schuur Hospital', 'City of Cape Town Metro'),
  ('Tygerberg Hospital', 'City of Cape Town Metro'),
  ('Red Cross War Memorial Children''s Hospital', 'City of Cape Town Metro'),
  ('Mitchells Plain Hospital', 'City of Cape Town Metro'),
  ('Khayelitsha District Hospital', 'City of Cape Town Metro'),
  ('Victoria Hospital', 'City of Cape Town Metro'),
  ('GF Jooste Hospital', 'City of Cape Town Metro'),
  ('Karl Bremer Hospital', 'City of Cape Town Metro'),
  ('Eerste River Hospital', 'City of Cape Town Metro'),
  ('Heideveld Community Health Centre', 'City of Cape Town Metro'),
  ('Somerset Hospital', 'City of Cape Town Metro'),
  ('Wesfleur Hospital', 'City of Cape Town Metro'),
  ('Paarl Hospital', 'City of Cape Town Metro'),

  -- Cape Winelands District
  ('Stellenbosch Hospital', 'Cape Winelands District'),
  ('Worcester Hospital', 'Cape Winelands District'),
  ('Franschhoek Hospital', 'Cape Winelands District'),
  ('Robertson Hospital', 'Cape Winelands District'),
  ('Villiersdorp Hospital', 'Cape Winelands District'),
  ('Hermanus Hospital', 'Cape Winelands District'),

  -- Overberg District
  ('Swellendam Hospital', 'Overberg District'),
  ('Caledon Hospital', 'Overberg District'),
  ('Bredasdorp Hospital', 'Overberg District'),

  -- Garden Route District
  ('George Hospital', 'Garden Route District'),
  ('Knysna Hospital', 'Garden Route District'),
  ('Mossel Bay Hospital', 'Garden Route District'),
  ('Oudtshoorn Hospital', 'Garden Route District'),
  ('Riversdale Hospital', 'Garden Route District'),

  -- Central Karoo District
  ('Beaufort West Hospital', 'Central Karoo District'),
  ('Prince Albert Hospital', 'Central Karoo District'),

  -- West Coast District
  ('Paarl Hospital - West Coast', 'West Coast District'),
  ('Vredenburg Hospital', 'West Coast District'),
  ('Clanwilliam Hospital', 'West Coast District'),
  ('Citrusdal Hospital', 'West Coast District')

ON CONFLICT (name) DO NOTHING;
