interface Props {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

export const Loader = ({
  size = "md",
  color = "text-primary",
  className,
}: Props) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-transparent border-solid ${sizes[size]} border ${color}`}
      />
    </div>
  );
};
