type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>;

export function TextField({ label, value, onChange, type = 'text', ...props }: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#43513d]">{label}</span>
      <input
        className="h-11 w-full rounded-md border border-[#d7ded0] bg-white px-3 text-[#171f18] shadow-sm transition placeholder:text-[#a0aa99] hover:border-[#c4cdbb] disabled:cursor-not-allowed disabled:bg-[#f4f6f0]"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  );
}
