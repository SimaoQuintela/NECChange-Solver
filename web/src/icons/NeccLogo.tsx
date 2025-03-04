import Image from "next/image";

export const NeccLogo = () => {
  return (
    <Image
      src="/logos/necc-white.svg"
      className="h-8 ml-1"
      alt="Necc Logo"
      width={35}
      height={35}
    />
  );
};
