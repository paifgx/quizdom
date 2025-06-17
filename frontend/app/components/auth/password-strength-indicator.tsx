import { useFormValidation } from '../../hooks/useFormValidation';

export interface PasswordStrengthIndicatorProps {
  password: string;
}

/**
 * Visual password strength indicator with color-coded bars
 * Shows password strength assessment in real-time
 */
export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { getPasswordStrength } = useFormValidation();
  const { strength, score } = getPasswordStrength(password);
  
  if (!password) return null;

  const strengthColors = {
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500'
  } as const;

  const strengthLabels = {
    weak: 'Weak',
    fair: 'Fair', 
    good: 'Good',
    strong: 'Strong'
  } as const;

  return (
    <div className="mt-2 animate-fade-in">
      <div className="flex space-x-1" role="progressbar" aria-valuenow={score} aria-valuemax={3}>
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded ${
              index <= score ? strengthColors[strength] : 'bg-gray-200'
            } transition-colors duration-300`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-1" aria-live="polite">
        Password strength: {strengthLabels[strength]}
      </p>
    </div>
  );
} 