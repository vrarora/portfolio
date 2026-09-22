"use client";

import { ArrowUp, Stop } from "@phosphor-icons/react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { assistantCopy } from "@/content/assistant-faq";

type Props = {
  disabled?: boolean;
  disabledHint?: string;
  streaming?: boolean;
  onSend: (text: string) => void;
  onStop?: () => void;
};

export type ComposerHandle = { focus: () => void };

export const Composer = forwardRef<ComposerHandle, Props>(function Composer(
  { disabled, disabledHint, streaming, onSend, onStop },
  ref,
) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({ focus: () => textareaRef.current?.focus() }), []);

  const grow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const line = 20;
    el.style.height = `${Math.min(el.scrollHeight, line * 5 + 16)}px`;
  }, []);

  useEffect(grow, [value, grow]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="ask-composer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={textareaRef}
        className="ask-input"
        rows={1}
        maxLength={400}
        value={value}
        placeholder={disabled ? disabledHint ?? assistantCopy.placeholder : assistantCopy.placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-label="Your question"
      />
      {streaming && onStop ? (
        <button type="button" className="ask-send" onClick={onStop} aria-label="Stop">
          <Stop size={14} weight="fill" />
        </button>
      ) : (
        <button type="submit" className="ask-send" disabled={disabled || value.trim().length === 0} aria-label="Send">
          <ArrowUp size={14} weight="bold" />
        </button>
      )}
    </form>
  );
});
