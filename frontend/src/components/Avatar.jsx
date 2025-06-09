import PropTypes from "prop-types";

const Avatar = ({ user, size = "md", className = "" }) => {
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-32 h-32 text-3xl",
  };

  const baseClasses =
    "rounded-full flex items-center justify-center bg-blue-100 text-blue-700 font-semibold";
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name || "User"}
        className={`${sizeClass} object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${baseClasses} ${sizeClass} ${className}`}>
      {getInitial(user?.name)}
    </div>
  );
};

Avatar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};

export default Avatar;
