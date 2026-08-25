-- ============================================================
-- DEMO DATA — for testing the dashboard only
-- Run this ONLY in development/staging environments
-- ============================================================
-- To use: first create a demo admin user via Supabase Auth dashboard,
-- then update the user_id values below with real UUIDs.
-- Alternatively, use the Supabase service role to bypass RLS.
-- ============================================================

-- This script inserts demo feedback using the service role.
-- Replace the hospital UUIDs below by running:
--   SELECT id, name FROM hospitals WHERE name IN (...);

DO $$
DECLARE
  h_groote    UUID;
  h_khayelitsha UUID;
  h_tygerberg UUID;
  h_george    UUID;
  h_worcester UUID;
  -- Use a placeholder user_id for demo data (must exist in auth.users)
  demo_user   UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  SELECT id INTO h_groote FROM public.hospitals WHERE name = 'Groote Schuur Hospital' LIMIT 1;
  SELECT id INTO h_khayelitsha FROM public.hospitals WHERE name = 'Khayelitsha District Hospital' LIMIT 1;
  SELECT id INTO h_tygerberg FROM public.hospitals WHERE name = 'Tygerberg Hospital' LIMIT 1;
  SELECT id INTO h_george FROM public.hospitals WHERE name = 'George Hospital' LIMIT 1;
  SELECT id INTO h_worcester FROM public.hospitals WHERE name = 'Worcester Hospital' LIMIT 1;

  -- Only insert if hospitals exist
  IF h_khayelitsha IS NOT NULL THEN
    INSERT INTO public.feedback (user_id, hospital_id, category, comment, sentiment, issue, ai_summary, created_at) VALUES
      (demo_user, h_khayelitsha, 'Cleanliness', 'The waiting room toilets were not cleaned the entire time I was there. There was no toilet paper and the floors were very dirty. This is unacceptable in a healthcare setting.', 'Negative', 'Unclean bathrooms', 'Patient reported dirty toilets and no toilet paper in the waiting area.', NOW() - INTERVAL '5 days'),
      (demo_user, h_khayelitsha, 'Waiting Time', 'I waited more than 6 hours in casualty before being seen by a doctor. There were not enough staff on duty and patients were suffering while waiting.', 'Negative', 'Long waiting times', 'Patient waited over 6 hours in casualty due to insufficient staff.', NOW() - INTERVAL '8 days'),
      (demo_user, h_khayelitsha, 'Staff Behaviour', 'The nursing staff were very rude and dismissive. When I asked a question they told me to sit down and wait. I felt disrespected.', 'Negative', 'Rude nursing staff', 'Patient experienced dismissive and disrespectful treatment from nursing staff.', NOW() - INTERVAL '12 days'),
      (demo_user, h_khayelitsha, 'Service', 'The doctors were thorough and professional. They explained everything clearly and I felt well cared for.', 'Positive', 'Professional doctors', 'Patient praised the thoroughness and professionalism of the medical team.', NOW() - INTERVAL '15 days'),
      (demo_user, h_khayelitsha, 'Facilities', 'The hospital is very old and needs renovation. The equipment looks outdated and some wards do not have air conditioning.', 'Negative', 'Outdated facilities', 'Patient noted that the hospital building and equipment are in poor condition.', NOW() - INTERVAL '20 days')
    ON CONFLICT DO NOTHING;
  END IF;

  IF h_groote IS NOT NULL THEN
    INSERT INTO public.feedback (user_id, hospital_id, category, comment, sentiment, issue, ai_summary, created_at) VALUES
      (demo_user, h_groote, 'Service', 'Exceptional care from the entire team. The specialists were knowledgeable and I felt confident in my treatment plan.', 'Positive', 'Excellent specialist care', 'Patient reported exceptional care and knowledgeable specialists.', NOW() - INTERVAL '3 days'),
      (demo_user, h_groote, 'Waiting Time', 'The waiting time for outpatients is very long. I arrived at 7am and only saw the doctor at 2pm. This needs to be addressed.', 'Negative', 'Long outpatient waiting time', 'Patient waited 7 hours for an outpatient appointment.', NOW() - INTERVAL '7 days'),
      (demo_user, h_groote, 'Cleanliness', 'The hospital wards were clean and well maintained. The cleaning staff were always busy keeping things tidy.', 'Positive', 'Clean wards', 'Patient praised the cleanliness of the hospital wards.', NOW() - INTERVAL '10 days'),
      (demo_user, h_groote, 'Staff Behaviour', 'The nurses in ward C were compassionate and attentive. They checked on me regularly and always answered my questions.', 'Positive', 'Compassionate nursing care', 'Patient praised the attentive and compassionate nursing staff in ward C.', NOW() - INTERVAL '18 days')
    ON CONFLICT DO NOTHING;
  END IF;

  IF h_tygerberg IS NOT NULL THEN
    INSERT INTO public.feedback (user_id, hospital_id, category, comment, sentiment, issue, ai_summary, created_at) VALUES
      (demo_user, h_tygerberg, 'Facilities', 'The parking is terrible and there is never any space. This is a big problem for patients who cannot walk far.', 'Negative', 'Inadequate parking', 'Patient reported severe parking shortages affecting access to the hospital.', NOW() - INTERVAL '4 days'),
      (demo_user, h_tygerberg, 'Service', 'I had my operation done at Tygerberg and the surgical team was brilliant. I have no complaints about the medical care.', 'Positive', 'Excellent surgical care', 'Patient was highly satisfied with the surgical team and medical care received.', NOW() - INTERVAL '9 days'),
      (demo_user, h_tygerberg, 'Waiting Time', 'The waiting times in the emergency department are very long but I understand they are always very busy. The staff do their best.', 'Neutral', 'Emergency department delays', 'Patient experienced long emergency department waits but acknowledged staff were working hard.', NOW() - INTERVAL '14 days')
    ON CONFLICT DO NOTHING;
  END IF;

  IF h_george IS NOT NULL THEN
    INSERT INTO public.feedback (user_id, hospital_id, category, comment, sentiment, issue, ai_summary, created_at) VALUES
      (demo_user, h_george, 'Cleanliness', 'The hospital is clean and the staff seem to take pride in keeping it that way. Good experience overall.', 'Positive', 'Clean and well-maintained', 'Patient noted the hospital is clean and well-maintained by staff.', NOW() - INTERVAL '6 days'),
      (demo_user, h_george, 'Staff Behaviour', 'The receptionist was helpful and directed me correctly. Good first impression when I arrived.', 'Positive', 'Helpful reception staff', 'Patient praised the helpfulness and direction provided by reception staff.', NOW() - INTERVAL '11 days'),
      (demo_user, h_george, 'Other', 'The signage in the hospital is confusing. I got lost several times trying to find the right department. Better signage is needed.', 'Negative', 'Poor signage', 'Patient found the hospital signage confusing and was unable to navigate independently.', NOW() - INTERVAL '16 days')
    ON CONFLICT DO NOTHING;
  END IF;

  IF h_worcester IS NOT NULL THEN
    INSERT INTO public.feedback (user_id, hospital_id, category, comment, sentiment, issue, ai_summary, created_at) VALUES
      (demo_user, h_worcester, 'Waiting Time', 'I waited 4 hours to be seen. The hospital was full and the staff were stretched. I think more resources are needed here.', 'Neutral', 'Staff stretched thin', 'Patient waited 4 hours and noted staff appeared understaffed relative to patient load.', NOW() - INTERVAL '2 days'),
      (demo_user, h_worcester, 'Service', 'The dietitian was very helpful and gave me a proper diet plan. Excellent service from the nutrition department.', 'Positive', 'Excellent nutrition service', 'Patient received thorough dietitian consultation and personalised diet plan.', NOW() - INTERVAL '7 days')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
