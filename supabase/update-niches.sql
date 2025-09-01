-- Clear existing niches and add the new ones
TRUNCATE TABLE niches CASCADE;

-- Insert new niches
INSERT INTO niches (name, parent_category, content_count, avg_performance) VALUES
('Fitness', 'Health', 1500, 8.5),
('Business/Finance', 'Professional', 2000, 12.3),
('Lifestyle', 'General', 3000, 15.7),
('Beauty/Skincare', 'Personal Care', 2500, 18.2),
('Food/Cooking', 'Food', 3500, 16.5),
('Fashion', 'Style', 2800, 14.2),
('Tech/Gaming', 'Technology', 4000, 22.1);