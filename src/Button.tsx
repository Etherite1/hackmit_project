import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    height: number;
    width: number;
    text: string;
    background_color?: string;
  }
  
  export function Button({ height, width, text, background_color, ...props }: ButtonProps) {
    return (
      <button
        type="submit"
        style={{
          height: `${height}rem`,
          width: `${width}rem`,
          margin: "0 0.5rem", // Add some horizontal margin
          backgroundColor: background_color ?? "var(--primary)",
        }}
        {...props}
      >
        {text}
      </button>
    );
  }