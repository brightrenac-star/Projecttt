import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, DollarSign, Edit, FileSearch, ChevronDown } from "lucide-react";

export default function HelpPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("Thank you for your message! We'll get back to you soon.");
  };

  const faqs = [
    {
      question: "How do I start earning as a creator?",
      answer: "To start earning, create your studio profile, publish engaging content, and build your supporter base. You can earn through tips, subscriptions, and exclusive content sales."
    },
    {
      question: "What payment methods are supported?",
      answer: "We support SUI blockchain payments for low fees and fast transactions. Traditional payment methods will be added in future updates."
    },
    {
      question: "How do I withdraw my earnings?",
      answer: "Navigate to your Studio Analytics page and click on 'Withdraw Earnings'. You'll need to connect your SUI wallet to complete the transaction."
    },
    {
      question: "Can I switch between Creator and Supporter roles?",
      answer: "Yes! You can change your role anytime in your profile settings. Note that switching to Creator will require setting up your studio profile."
    },
    {
      question: "What content guidelines should I follow?",
      answer: "All content should be original, respectful, and comply with our community guidelines. Adult content is allowed but must be clearly marked and age-restricted."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Help & Support</h1>
            <p className="text-xl text-muted-foreground">Find answers to common questions or get in touch</p>
          </div>

          {/* Search Help */}
          <Card className="glass mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search help articles..."
                  className="pl-12"
                  data-testid="input-search-help"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          {/* Popular Topics */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="glass hover-scale transition-smooth" data-testid="help-topic-account">
              <CardContent className="p-6">
                <div className="gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <User className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Account Management</h3>
                <p className="text-muted-foreground text-sm mb-4">Learn how to manage your profile, settings, and preferences.</p>
                <Button variant="link" className="text-primary hover:underline text-sm font-medium p-0" data-testid="link-account-articles">
                  View Articles →
                </Button>
              </CardContent>
            </Card>

            <Card className="glass hover-scale transition-smooth" data-testid="help-topic-payments">
              <CardContent className="p-6">
                <div className="bg-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Payments & Earnings</h3>
                <p className="text-muted-foreground text-sm mb-4">Understanding payments, withdrawals, and SUI blockchain integration.</p>
                <Button variant="link" className="text-primary hover:underline text-sm font-medium p-0" data-testid="link-payments-articles">
                  View Articles →
                </Button>
              </CardContent>
            </Card>

            <Card className="glass hover-scale transition-smooth" data-testid="help-topic-content">
              <CardContent className="p-6">
                <div className="bg-accent w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Edit className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Content Creation</h3>
                <p className="text-muted-foreground text-sm mb-4">Tips for creating engaging content and growing your audience.</p>
                <Button variant="link" className="text-primary hover:underline text-sm font-medium p-0" data-testid="link-content-articles">
                  View Articles →
                </Button>
              </CardContent>
            </Card>

            <Card className="glass hover-scale transition-smooth" data-testid="help-topic-discovery">
              <CardContent className="p-6">
                <div className="gradient-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <FileSearch className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Discovery & Support</h3>
                <p className="text-muted-foreground text-sm mb-4">How to find creators and support them effectively.</p>
                <Button variant="link" className="text-primary hover:underline text-sm font-medium p-0" data-testid="link-discovery-articles">
                  View Articles →
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="glass mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-0">
                  <button
                    className="flex justify-between items-center w-full text-left"
                    onClick={() => toggleFAQ(index)}
                    data-testid={`faq-question-${index}`}
                  >
                    <span className="font-medium text-foreground pr-4">{faq.question}</span>
                    <ChevronDown 
                      className={`text-muted-foreground transition-transform h-4 w-4 flex-shrink-0 ${
                        expandedFAQ === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFAQ === index && (
                    <div className="mt-3 text-muted-foreground text-sm" data-testid={`faq-answer-${index}`}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">Still Need Help?</CardTitle>
              <p className="text-muted-foreground">Can't find what you're looking for? Send us a message and we'll get back to you.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="help-name" className="block text-sm font-medium text-foreground mb-2">
                      Name
                    </Label>
                    <Input
                      type="text"
                      id="help-name"
                      placeholder="Your name"
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="help-email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </Label>
                    <Input
                      type="email"
                      id="help-email"
                      placeholder="your@email.com"
                      required
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="help-subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </Label>
                  <Select required>
                    <SelectTrigger data-testid="select-contact-subject">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="payment">Payment Problems</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="content">Content Guidelines</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="help-message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </Label>
                  <Textarea
                    id="help-message"
                    rows={4}
                    placeholder="Describe your issue or question..."
                    required
                    data-testid="textarea-contact-message"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="gradient-primary text-primary-foreground hover-scale transition-smooth"
                  data-testid="button-send-message"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
