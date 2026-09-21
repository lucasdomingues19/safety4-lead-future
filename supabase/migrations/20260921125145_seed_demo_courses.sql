-- Seed demo courses and content for LMS testing

-- Insert demo course
INSERT INTO courses (id, title, slug, description, instructor_id, status, created_at)
VALUES (
  'demo-001',
  'AI Fundamentals in EHS',
  'ai-fundamentals-ehs',
  'Master AI applications in workplace safety with this comprehensive 8+ hour course',
  'lucas-instructor',
  'published',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert modules
INSERT INTO modules (id, course_id, title, description, order_num, status, created_at)
VALUES 
  ('mod-001', 'demo-001', 'Module 1: AI Basics for EHS', 'Introduction to AI concepts and safety applications', 1, 'published', NOW()),
  ('mod-002', 'demo-001', 'Module 2: Machine Learning in Safety', 'Understanding ML and predictive analytics', 2, 'published', NOW()),
  ('mod-003', 'demo-001', 'Module 3: Practical AI Tools', 'Hands-on with AI safety platforms', 3, 'published', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert lessons
INSERT INTO lessons (id, module_id, title, description, content, order_num, status, created_at)
VALUES
  ('les-001', 'mod-001', 'What is Artificial Intelligence?', 'Core AI concepts explained', '<h1>AI Fundamentals</h1><p>Learn the basics of AI in safety...</p>', 1, 'published', NOW()),
  ('les-002', 'mod-001', 'AI in Risk Assessment', 'Using AI to identify hazards', '<h1>AI Risk Assessment</h1><p>Discover how AI helps identify risks...</p>', 2, 'published', NOW()),
  ('les-003', 'mod-002', 'Machine Learning Explained', 'How ML improves over time', '<h1>Machine Learning</h1><p>ML learns from data to improve predictions...</p>', 1, 'published', NOW()),
  ('les-004', 'mod-002', 'Predictive Analytics for Safety', 'Forecasting incidents with data', '<h1>Predictive Analytics</h1><p>Use data to predict and prevent incidents...</p>', 2, 'published', NOW()),
  ('les-005', 'mod-003', 'Safety 4.0 Tools Demo', 'Exploring modern EHS software', '<h1>Safety 4.0 Tools</h1><p>Tour of next-generation safety platforms...</p>', 1, 'published', NOW()),
  ('les-006', 'mod-003', 'Implementation Strategy', 'Planning your AI adoption', '<h1>Implementation</h1><p>Step-by-step guide to adopting AI safely...</p>', 2, 'published', NOW())
ON CONFLICT (id) DO NOTHING;
