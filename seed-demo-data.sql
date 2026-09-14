-- Insert demo courses
INSERT INTO courses (id, title, slug, description, cover_image_url, price, status) VALUES
  ('demo-course-1', 'Safety 4.0 Fundamentals', 'safety-4-0-fundamentals', 'Master the fundamentals of Safety 4.0 and digital transformation', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 99.00, 'published'),
  ('demo-course-2', 'AI for Safety Professionals', 'ai-for-safety', 'Learn how AI is transforming the EHS profession', 'https://images.unsplash.com/photo-1677442d019cecf8a0b84b5a52e6d5d8?w=800', 149.00, 'published')
ON CONFLICT DO NOTHING;

-- Insert demo modules for course 1
INSERT INTO modules (id, course_id, title, description, position, drip_days) VALUES
  ('demo-mod-1-1', 'demo-course-1', 'Introduction & Orientation', 'Course overview and learning objectives', 1, 0),
  ('demo-mod-1-2', 'demo-course-1', 'Safety 4.0 Basics', 'Understanding Safety 4.0 framework', 2, 0),
  ('demo-mod-1-3', 'demo-course-1', 'Digital Tools Overview', 'Key technologies for modern safety', 3, 3)
ON CONFLICT DO NOTHING;

-- Insert demo modules for course 2
INSERT INTO modules (id, course_id, title, description, position, drip_days) VALUES
  ('demo-mod-2-1', 'demo-course-2', 'AI Fundamentals', 'What is AI and how it works', 1, 0),
  ('demo-mod-2-2', 'demo-course-2', 'Machine Learning Basics', 'Understanding ML in safety context', 2, 0)
ON CONFLICT DO NOTHING;

-- Insert demo lessons for module 1-1
INSERT INTO lessons (id, module_id, title, description, video_url, content, position, duration_minutes) VALUES
  ('demo-les-1-1-1', 'demo-mod-1-1', 'Welcome to Safety 4.0', 'Introduction to the course and instructor', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '# Welcome\n\nThis course covers the fundamentals of Safety 4.0', 1, 5),
  ('demo-les-1-1-2', 'demo-mod-1-1', 'Course Overview', 'What you will learn in this course', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '# Course Overview\n\nWe will explore key concepts', 2, 8)
ON CONFLICT DO NOTHING;

-- Insert demo lessons for module 1-2
INSERT INTO lessons (id, module_id, title, description, video_url, content, position, duration_minutes) VALUES
  ('demo-les-1-2-1', 'demo-mod-1-2', 'What is Safety 4.0?', 'Definition and key principles', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '# Safety 4.0 Definition\n\nSafety 4.0 is...', 1, 12),
  ('demo-les-1-2-2', 'demo-mod-1-2', 'The Safety Triangle', 'People, Processes, Technology', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '# The Safety Triangle\n\nThree pillars...', 2, 10)
ON CONFLICT DO NOTHING;

-- Insert demo lessons for module 1-3
INSERT INTO lessons (id, module_id, title, description, video_url, content, position, duration_minutes) VALUES
  ('demo-les-1-3-1', 'demo-mod-1-3', 'IoT in Safety', 'Internet of Things applications', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '# IoT Solutions\n\nWearables and sensors...', 1, 15)
ON CONFLICT DO NOTHING;

-- Insert demo lessons for module 2-1
INSERT INTO lessons (id, module_id, title, description, video_url, content, position, duration_minutes) VALUES
  ('demo-les-2-1-1', 'demo-mod-2-1', 'AI Basics', 'What is Artificial Intelligence', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '# Introduction to AI\n\nAI is...', 1, 20)
ON CONFLICT DO NOTHING;

-- Insert demo lessons for module 2-2
INSERT INTO lessons (id, module_id, title, description, video_url, content, position, duration_minutes) VALUES
  ('demo-les-2-2-1', 'demo-mod-2-2', 'ML in Safety', 'Machine Learning applications for EHS', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '# Machine Learning\n\nPredictive safety models...', 1, 18)
ON CONFLICT DO NOTHING;
