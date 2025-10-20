'use client';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function DateTimePicker(props: Props) {
  return <input type="datetime-local" className="input" {...props} />;
}
