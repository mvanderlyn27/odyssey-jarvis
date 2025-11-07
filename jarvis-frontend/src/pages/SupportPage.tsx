import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitSupportRequest } from "@/features/support/hooks/useSubmitSupportRequest";
import { useSession } from "@/features/auth/hooks/useSession";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const faqs = [
  {
    question: "How do I connect my TikTok account?",
    answer:
      "You can connect your TikTok account from the 'Home' page by clicking the 'Link New TikTok Account' button.",
  },
  {
    question: "How do I create a new post?",
    answer: "You can create a new post by navigating to the 'Drafts' page and clicking the 'Create New Post' card.",
  },
  {
    question: "How do I schedule a post?",
    answer:
      "You can schedule a post from the 'Scheduler' page. Simply drag a draft post from the top list to a time slot in the calendar.",
  },
  {
    question: "How do I view my post's analytics?",
    answer: "You can view your post's analytics by navigating to the 'Post Overview' page and clicking on any post.",
  },
];

const SupportPage = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const clearForm = () => {
    setMessage("");
  };

  const { mutate: submitSupportRequest, isPending } = useSubmitSupportRequest({
    onSuccess: clearForm,
  });

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit a support request.");
      return;
    }
    submitSupportRequest({ name, email, message, user_id: user.id });
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Support</h1>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card id="faq-section">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
