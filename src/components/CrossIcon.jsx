const CrossIcon = ({ color = "var(--cb-color-text-subdued)", size = "32" }) => {
  return (
    <svg
      style={{ fill: color, width: `${size}px`, height: `${size}px` }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      class="gnL9bC k8DSYQ"
      tabindex="0"
    >
      <path fill="none" d="M0 0h48v48H0z"></path>
      <path
        d="M38.707 37.293a1 1 0 11-1.414 1.414L24 25.414 10.707 38.707a.997.997 0 01-1.414 0 .999.999 0 010-1.414L22.586 24 9.293 10.707a1 1 0 111.414-1.414L24 22.586 37.293 9.293a1 1 0 111.414 1.414L25.414 24l13.293 13.293z"
        fill="currentColor"
      ></path>
    </svg>
  );
};

export default CrossIcon;
