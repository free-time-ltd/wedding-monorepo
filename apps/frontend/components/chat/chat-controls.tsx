import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Send } from "@repo/ui/icons";
import { ChangeEvent, forwardRef, KeyboardEvent, Ref, useState } from "react";

interface Props {
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
}

const ChatControls = forwardRef<HTMLInputElement, Props>(
  (
    { onChange, onSubmit, disabled }: Props,
    ref: Ref<HTMLInputElement> | undefined
  ) => {
    const [messageInput, setMessageInput] = useState("");
    const submitDisabled = messageInput.trim().length < 1;

    const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setMessageInput(e.target.value);
      onChange?.(e.target.value);
    };

    const handleSubmit = () => {
      if (submitDisabled) return;

      setMessageInput("");
      onSubmit?.(messageInput);
    };

    return (
      <div className="flex gap-2">
        <Input
          placeholder="Въведете вашето съобщение..."
          value={messageInput}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          autoComplete="off"
          autoCorrect="false"
          className="flex-1"
          disabled={disabled}
          ref={ref}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={disabled || submitDisabled}
            >
              <Send className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Изпрати съобщение</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }
);

ChatControls.displayName = "ChatControls";

export default ChatControls;
