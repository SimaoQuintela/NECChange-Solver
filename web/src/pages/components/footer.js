function FooterComponent() {
  return (
    <footer className="absolute bottom-0 left-0 w-full h-20 flex justify-center items-center">
      <div className="text-sm">
        <p>
          © 2023 designed by{" "}
          <a href="https://necc.di.uminho.pt/" className="underline">
            NECC
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
export default FooterComponent;
