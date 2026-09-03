-- Add support for rich proposal sections
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS proposal_type TEXT DEFAULT 'course' CHECK (proposal_type IN ('course', 'bespoke'));

-- sections structure: [{ id, title, type, content, order }, ...]
-- type can be 'text', 'table', 'list', 'roi_table', 'pricing_table'
-- content varies by type:
--   text: { body: string }
--   table: { headers: string[], rows: string[][] }
--   list: { items: string[] }
--   roi_table: { data with value calculations }
--   pricing_table: { tiers with volume discounts }

COMMENT ON COLUMN public.proposals.sections IS 'Rich content sections for bespoke proposals. Structure: [{id, title, type, content, order}, ...]';
COMMENT ON COLUMN public.proposals.proposal_type IS 'course (simple course-based) or bespoke (rich multi-section)';
