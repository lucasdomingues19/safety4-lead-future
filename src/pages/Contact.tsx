import AudienceNav from "@/components/AudienceNav";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/Footer";
import { trackPageView } from "@/utils/analytics";
import { setPageSEO } from "@/utils/seo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { countryCodes } from "@/data/countryCodes";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "+44",
    phone: "",
    role: "",
    inquiryType: "",
    message: "",
  });

  useEffect(() => {
    trackPageView(window.location.pathname);
    setPageSEO({
      title: "Contact SafetyTech Academy | Get in Touch for IOSH Training Enquiries",
      description: "Contact the SafetyTech Academy team for enrolment enquiries, corporate training, partnerships, or general questions about our IOSH-approved Safety 4.0 certification.",
      canonical: "https://safetytech.academy/contact",
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save lead via validated edge function
      const leadResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone ? `${formData.phoneCode} ${formData.phone}` : null,
            source: 'contact_form',
            message: formData.message,
            role: formData.role,
            inquiry_type: formData.inquiryType
          }),
        }
      );

      if (!leadResponse.ok) {
        const errorData = await leadResponse.json().catch(() => ({}));
        console.error('Error saving lead:', errorData);
        
        if (leadResponse.status === 429) {
          toast({
            title: "Too many submissions",
            description: "Please try again later.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Send email via edge function
      const emailResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json().catch(() => ({}));
        console.error('Error sending contact email:', errorData);
        throw new Error(errorData.error || 'Failed to send contact email');
      }

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneCode: "+44",
        phone: "",
        role: "",
        inquiryType: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly at hello@safetyacademy.tech",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-white">
      <AudienceNav />

      <div className="container mx-auto px-4 py-20">
        {/* Back Navigation */}
        <div className="mb-12">
          <Button variant="default" size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <a href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.05]">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Ready to transform your safety career? We're here to help you begin your Safety 4.0 journey
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Send us a Message</h2>
                <p className="text-slate-600 mb-8">
                  Have questions about our program? Need help choosing the right path for your career? 
                  Our team is ready to provide personalized guidance.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-first-name" className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <Input 
                      type="text" 
                      id="contact-first-name" name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-last-name" className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <Input 
                      type="text" 
                      id="contact-last-name" name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <Input 
                    type="email" 
                    id="contact-email" name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      id="contact-phone-code" name="phoneCode" aria-label="Country dialling code"
                      value={formData.phoneCode}
                      onChange={handleInputChange}
                      className="bg-white border border-slate-300 text-slate-900 rounded-md px-2 py-2 w-[110px] flex-shrink-0"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <Input 
                      type="tel" 
                      id="contact-phone" name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 flex-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-role" className="block text-sm font-medium text-slate-700 mb-2">Current Role</label>
                  <Input 
                    type="text" 
                    id="contact-role" name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g., Safety Manager, HSE Officer"
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact-inquiry-type" className="block text-sm font-medium text-slate-700 mb-2">Inquiry Type</label>
                  <select 
                    id="contact-inquiry-type" name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2"
                    required
                  >
                    <option value="" disabled>Select inquiry type</option>
                    <option value="general">General Inquiry</option>
                    <option value="discount">Request Individual Discount</option>
                    <option value="group">Group Training</option>
                    <option value="reimbursement">Reimbursement Help</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <Textarea 
                    id="contact-message" name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your safety career goals and how we can help..."
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 min-h-[120px]"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Contact Information</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Email</h3>
                    <p className="text-slate-600">hello@safetyacademy.tech</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Phone</h3>
                    <p className="text-slate-600">+44 (0) 2033552560</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Address</h3>
                    <p className="text-slate-600">20, Wenlock Rd, London, United Kingdom, N1 7GU</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Office Hours</h3>
                    <p className="text-slate-600">Monday - Friday: 9:00 AM - 5:00 PM GMT</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    
    </>
  );
};

export default Contact;
