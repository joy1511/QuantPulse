import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email Us',
      value: 'support@quantpulse.in',
      description: 'We\'ll respond within 24 hours'
    },
    {
      icon: Phone,
      label: 'Call Us',
      value: '+91 80 1234 5678',
      description: 'Mon-Fri, 9:00 AM - 6:00 PM IST'
    },
    {
      icon: MapPin,
      label: 'Visit Us',
      value: 'Bangalore, Karnataka',
      description: 'India'
    }
  ];

  return (
    <div className="min-h-screen text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-zinc-100">Get in Touch</h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Have questions about QuantPulse India? We're here to help.
            Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <Card key={index} className="p-6 text-center">
                <div className="inline-flex p-3 rounded-lg bg-[rgba(58,111,248,0.1)] mb-4">
                  <Icon className="size-6 text-[#5B8DFF]" />
                </div>
                <h3 className="text-lg text-zinc-100 mb-2">{info.label}</h3>
                <p className="text-zinc-300 mb-1">{info.value}</p>
                <p className="text-sm text-zinc-500">{info.description}</p>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <Card className="lg:col-span-2 p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="size-6 text-[#5B8DFF]" />
              <h2 className="text-2xl text-zinc-100">Send Us a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-zinc-300">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-zinc-300">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 min-h-[150px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="size-4 mr-2" />
                Send Message
              </Button>
            </form>
          </Card>

          {/* Company Info Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg text-zinc-100 mb-4">About QuantPulse India</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                We're a team of data scientists, financial analysts, and engineers
                dedicated to democratizing AI-powered stock market analysis for Indian traders.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Our mission is to make sophisticated market intelligence accessible to everyone,
                helping traders make informed decisions with confidence.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="size-5 text-[#5B8DFF]" />
                <h3 className="text-lg text-zinc-100">Business Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Monday - Friday</span>
                  <span className="text-zinc-300">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Saturday</span>
                  <span className="text-zinc-300">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Sunday</span>
                  <span className="text-zinc-300">Closed</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-4">All times in IST (India Standard Time)</p>
            </Card>

            <Card className="p-6 bg-[rgba(30,58,138,0.35)] backdrop-blur-lg border border-[rgba(100,150,255,0.2)]">
              <h3 className="text-lg text-white mb-2">Need Immediate Help?</h3>
              <p className="text-sm text-zinc-300 mb-4">
                Check out our FAQ section or browse our knowledge base for quick answers.
              </p>
              <Button className="w-full">
                Visit Help Center
              </Button>
            </Card>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-[rgba(100,150,255,0.1)]">
          <p className="text-center text-sm text-zinc-500">
            We typically respond to inquiries within 24 business hours.
            For urgent matters, please call us directly.
          </p>
        </div>
      </div>
    </div>
  );
}
