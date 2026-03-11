export const CyberButton = ({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }) => {
  const baseStyles = "px-8 py-4 font-syne font-bold uppercase tracking-wider transition-all duration-300 border-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cyber-cyan text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]",
    secondary: "bg-transparent border border-white/20 text-white hover:border-cyber-cyan hover:text-cyber-cyan",
    danger: "bg-cyber-red text-white hover:shadow-[0_0_20px_rgba(255,0,60,0.6)]"
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};