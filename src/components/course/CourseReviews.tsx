import { TestimonialCard, type Testimonial } from "@/components/TestimonialCard";

export type Review = Testimonial;

export const CourseReviews = ({ reviews }: { reviews: Review[] }) => (
  <div className="grid md:grid-cols-2 gap-6">
    {reviews.map((r) => (
      <TestimonialCard key={r.name} t={r} />
    ))}
  </div>
);
