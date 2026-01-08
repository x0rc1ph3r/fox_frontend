import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function FormInput({ label, className, ...props }: FormInputProps) {
  return (
    <div className="w-full flex flex-col justify-end">
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm mb-2.5 block text-gray-1200 font-medium font-inter"
        >
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full text-base font-medium text-black-1000 placeholder:text-gray-1200 outline outline-gray-1100 h-12 px-5 py-3 rounded-lg  ${className}`}
      />
    </div>
  );
}
