
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How do I track my progress?",
    answer: "Your progress is automatically tracked as you complete lectures and assignments. You can view your progress for each course from the dashboard or the course learning page."
  },
  {
    question: "How do I access course materials?",
    answer: "After enrolling in a course, all materials are immediately available. Navigate to the course learning page and you'll find all lectures, assignments, quizzes, and resources organized by sections."
  },
  {
    question: "How do I submit assignments?",
    answer: "Go to the assignment page from your course learning area, complete the required tasks, and click the 'Submit Assignment' button. You can also attach files if needed."
  },
  {
    question: "Can I download lecture videos?",
    answer: "Most lecture videos are available for streaming only. However, instructors may provide downloadable resources that you can access in the lecture resources section."
  },
  {
    question: "How do I contact my instructor?",
    answer: "You can communicate with instructors by leaving questions in the Q&A section of each lecture, or by sending direct feedback from the course page."
  }
];

export default function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqItems.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
