
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-6">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-gray-500 mt-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
