type Props = {
  name: string;
  checked: boolean;
  label: string;
  maskedValue: string;
  onChange: () => void;
};

export default function RecoveryMethodOption({
  name,
  checked,
  label,
  maskedValue,
  onChange,
}: Props) {
  return (
    <label className="recover-admin__method">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
      <strong>{maskedValue}</strong>
    </label>
  );
}
