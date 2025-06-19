export interface ValidatedInputProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

/**
 * Reusable input component with validation state and error display
 * Provides consistent styling and accessibility features
 */
export function ValidatedInput({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  className = '',
}: ValidatedInputProps) {
  const hasError = !!error;

  return (
    <div className="space-y-1">
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className={`relative block w-full px-4 py-3 border ${
          hasError
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-[#FCC822] focus:border-transparent'
        } placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:z-10 transition-all duration-300 ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-red-600 animate-fade-in"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
