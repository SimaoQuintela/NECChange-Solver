interface SVG {
  className?: string;
}

const UploadIconCSV = ({ className }: SVG) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <path d="M14 13v4H10v-4H7l5-5 5 5h-3zm-4 6v2H4a2 2 0 0 1-2-2v-6a2 2 0 1 2h1" />
    </svg>
  );
};

export default UploadIconCSV;
