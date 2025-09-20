"use client";

import { Card } from "@components/design-system/molecules/Card";
import { Button } from "@components/design-system/atoms/Button";
import { Text } from "@components/design-system/atoms/Text";

type Option = { id: string; text: string };

export default function QuestionCard({
  text = "",
  options = [],
  selected = null,
  correctOptionId = null,
  onSelect,
  disabled = false,
}: {
  text?: string;
  options?: Option[];
  selected?: string | null;
  correctOptionId?: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className="space-y-4">
      <Card>
        <Text>{text}</Text>
      </Card>

      <div className="space-y-3">
        {safeOptions.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = !!correctOptionId && correctOptionId === opt.id;
          const isWrongSel =
            !!selected && selected === opt.id && !!correctOptionId && correctOptionId !== opt.id;

          let variant: "soft" | "ghost" | "primary" | "danger" = "ghost";
          if (isCorrect) variant = "soft";
          else if (isWrongSel) variant = "danger";
          else if (isSelected) variant = "soft";

          return (
            <Button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              disabled={disabled}
              variant={variant}
              className="justify-start"
              block
            >
              {opt.text}
            </Button>
          );
        })}
      </div>
    </div>
  );
}